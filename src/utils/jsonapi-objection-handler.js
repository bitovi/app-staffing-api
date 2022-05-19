const pluralize = require('pluralize')
const querystringParser = require('@bitovi/querystring-parser')
const { Serializer } = require('../json-api-serializer')
const { getRelationExpression } = require('../utils')
const modelHasColumn = require('../schemas/all-properties')
const {
  ValidationError,
  NotFoundError
} = require('../managers/error-handler/errors')
const { codes, statusCodes } = require('../managers/error-handler/constants')
const normalizeColumn = (tableName, column) =>
  column.includes('.') ? column : `${tableName}.${column}`

let databaseName

const asyncHandler = (fn) => (request, reply, done) =>
  Promise.resolve(fn(request, reply)).catch(done)

const getListHandler = (Model) => {
  return asyncHandler(async (request, reply) => {
    const relationExpression = getRelationExpression(request.query)
    const queryParameters = request.url.split('?')[1]
    const parsedParams = querystringParser.parse(queryParameters)
    const tableName = Model.tableName

    const modelRelations = Object.keys(Model.getRelations())
    databaseName =
      databaseName || Model.knex().client.config.connection.database

    // Check if there is any include that is not in Model relations, return 404
    // Checking first level only for now
    if (
      parsedParams?.include &&
      parsedParams.include.filter(
        (el) => !modelRelations.includes(el.split('.')[0])
      ).length > 0
    ) {
      throw new ValidationError({
        status: statusCodes.UNPROCESSABLE_ENTITY,
        title: 'Cannot include non-existing relation',
        detail: 'The include parameter must be a relation of the model',
        parameter: '/include',
        code: codes.ERR_INVALID_PARAMETER
      })
    }

    // chain
    const queryBuilder = Model.query()
    if (request.params.id) {
      queryBuilder.findById(request.params.id)
    }

    queryBuilder.withGraphJoined(relationExpression)
    queryBuilder.skipUndefined()

    // @TODO verify column names
    if (Object.keys(parsedParams.fields).length) {
      for (const [key, val] of Object.entries(parsedParams.fields)) {
        const items = val.map((el) => normalizeColumn(key.slice(0, -1), el))
        if (!modelHasColumn(items)) {
          throw new ValidationError({
            status: statusCodes.UNPROCESSABLE_ENTITY,
            title: 'Cannot select non-existing fields',
            detail: 'The fields parameter must be a column of the model',
            parameter: '/fields',
            code: codes.ERR_INVALID_PARAMETER
          })
        }
        if (key.slice(0, -1) === tableName) {
          queryBuilder.columns(...items)
        } else {
          queryBuilder.modifyGraph(key, (builder) => builder.columns(...items))
        }
      }
    }

    if (parsedParams.filter.length) {
      // check for duplicate filter keys, return 500
      const filterKeys = parsedParams.filter.map(
        ({ field, comparator }) => field + '_-_' + comparator
      )

      if (filterKeys.length > new Set(filterKeys).size) {
        throw new ValidationError({
          status: statusCodes.UNPROCESSABLE_ENTITY,
          title: 'Cannot have duplicate filter keys',
          detail: 'The filter parameter must not have duplicate keys',
          parameter: '/filter',
          code: codes.ERR_DUPLICATE_PARAMETER
        })
      }

      parsedParams.filter.forEach((filter) => {
        const { field: key, comparator, value: sqlValue } = filter
        const normalizedName = normalizeColumn(tableName, key)

        if (!modelHasColumn(normalizedName)) {
          throw new ValidationError({
            status: statusCodes.UNPROCESSABLE_ENTITY,
            title: `Cannot filter on non existing column name: ${key}`,
            detail: 'The filter parameter must be a column of the model',
            parameter: `filter/${key}`,
            code: codes.ERR_INVALID_PARAMETER
          })
        }
        // @TODO: compare datetime based on date only accepting YYYY-MM-DD?
        if (!queryBuilder.hasWheres()) {
          queryBuilder.where(normalizedName, comparator, sqlValue)
        } else {
          queryBuilder.andWhere(normalizedName, comparator, sqlValue)
        }
      })
    }

    let { size = 100, number = 0 } = parsedParams?.page || {}

    if (parsedParams?.errors.page.length) {
      size = request.query['page[size]']
      number = request.query['page[number]']
    }

    if (size < 1 || number < 0) {
      throw new ValidationError({
        status: statusCodes.UNPROCESSABLE_ENTITY,
        title: 'Cannot have negative page size or negative page number',
        detail: 'The page parameter must have a positive size and number',
        parameter: (size < 1 && '/page/size') || (number < 0 && '/page/number'),
        code: codes.ERR_INVALID_PARAMETER
      })
    }
    // @TODO return error for pad page values

    if (parsedParams.page?.number > -1) {
      queryBuilder.page(number, size)
    }

    if (parsedParams.sort.length) {
      parsedParams.sort.forEach((fieldDirection) => {
        const { field: name, direction } = fieldDirection

        const normalizedName = normalizeColumn(tableName, name)

        if (modelHasColumn(normalizedName)) {
          queryBuilder.orderBy(normalizedName, direction)
        } else {
          throw new ValidationError({
            status: statusCodes.UNPROCESSABLE_ENTITY,
            title: `Cannot sort on non existing column name: ${name}`,
            detail: 'The sort parameter must be a column of the model',
            parameter: `/sort/${name}`,
            code: codes.ERR_INVALID_PARAMETER
          })
        }
      })
    }
    // execute the builder after finish chaining
    // queryBuilder.debug()
    const data = await queryBuilder.execute()

    if (!data) {
      throw new NotFoundError({
        parameter: 'id'
      })
    }

    const result = Serializer.serialize(pluralize(tableName), data, {
      count: data?.total || 0,
      pageSize: size,
      page: number,
      url: request.url
    })
    reply.send(result)
  })
}

const getDeleteHandler = (Model) => {
  return asyncHandler(async (request, reply) => {
    const id = request.params.id
    const numberDeleted = await Model.query().deleteById(id)

    if (numberDeleted > 0) {
      reply.status(204).send()
    } else {
      throw new NotFoundError({
        parameter: 'id'
      })
    }
  })
}

const getUpdateHandler = (Model) => {
  return asyncHandler(async (request, reply) => {
    const updatedGraph = await Model.query().upsertGraphAndFetch(request.body, {
      update: false,
      relate: true,
      unrelate: true
    })

    const serialized = Serializer.serialize(
      pluralize(Model.name.toLowerCase()),
      updatedGraph
    )

    reply.code(200).send(serialized)
  })
}
const getPostHandler = (Model) => {
  return asyncHandler(async (request, reply) => {
    const { body, url } = request
    if (body.id) {
      throw new ValidationError({
        status: statusCodes.UNPROCESSABLE_ENTITY,
        title: 'Cannot post with an id',
        detail: 'The id parameter cannot be set on POST requests',
        parameter: '/id',
        code: codes.ERR_INVALID_PARAMETER
      })
    }

    const newModel = await Model.query().insertGraph(body, { relate: true })
    const modelName = pluralize(Model.name.toLowerCase())
    const data = Serializer.serialize(modelName, newModel, {
      url: `/${modelName}/${newModel.id}`
    })
    const location = `${url}/${newModel.id}`
    return reply.status(201).header('Location', location).send(data)
  })
}

module.exports = {
  getListHandler,
  getDeleteHandler,
  getUpdateHandler,
  getPostHandler
}
