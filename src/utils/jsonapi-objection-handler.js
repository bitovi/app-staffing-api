const { Serializer } = require('../json-api-serializer')
// const { query } = require('../models/project')
const { getIncludeStr, parseJsonApiParams } = require('../utils')

const normalizeColumn = (tableName, column) => column.includes('.') ? column : `${tableName}.${column}`

let databaseName

const getListHandler = (Model) => {
  return async (request, reply) => {
    const includeStr = getIncludeStr(request.query)
    const parsedParams = parseJsonApiParams(request.query)
    const tableName = Model.tableName

    const modelRelations = Object.keys(Model.getRelations())
    databaseName = databaseName || Model.knex().client.config.connection.database
    const columnNames = Object.keys(Model.jsonSchema.properties)
    // DEBUG columnInfo

    // const knex = Model.knex()
    // const allnames = await knex.raw(`SELECT * from information_schema.columns where table_catalog = '${databaseName}'`)

    // Check if there is any include that is not in Model relations, return 404
    // Checking first level only for now
    if (parsedParams?.include && parsedParams.include.filter(el => !modelRelations.includes(el.split('.')[0])).length > 0) {
      return reply.code(404).send()
    }

    // chain
    const queryBuilder = Model.query()
    if (request.params.id) {
      queryBuilder.findById(request.params.id)
    }
    // @TODO verify column names
    if (Object.keys(parsedParams.fields).length) {
      for (const [key, val] of Object.entries(parsedParams.fields)) {
        const items = val.map(el => normalizeColumn(key.slice(0, -1), el))
        queryBuilder.column(...items)
      }
    }

    queryBuilder.withGraphJoined(includeStr)
    queryBuilder.skipUndefined()

    if (parsedParams.filter.length) {
      // check for duplicate filter keys, return 500
      const filterkeys = parsedParams.filter.map(el => el.key)

      if (filterkeys.length > (new Set(filterkeys)).size) {
        return reply.status(400)
          .send({
            status: 400,
            title: 'Cannot have the same filter more than once.'
          })
      }

      parsedParams.filter.forEach((filter) => {
        if (!columnNames.includes(filter.key)) {
          return reply.status(400)
            .send({
              status: 400,
              title: `Cannot filter on non existing column name: ${filter.key}`
            })
        }

        const isInt = Number.isInteger(Number(filter.value))
        const isDate = !isNaN(Date.parse(filter.value))
        const isEqual = isInt || isDate
        let comparator = 'ilike'
        let sqlValue = `%${filter.value}%`

        if (isEqual) {
          comparator = '='
          sqlValue = filter.value
        }
        queryBuilder.where(normalizeColumn(tableName, filter.key), comparator, sqlValue)
      })
    }
    const { size = 100, number = 0 } = parsedParams?.page || {}
    if ((size < 1) || (number < 0)) {
      return reply.status(400)
        .send({
          status: 400,
          title: 'Invalid page[size] or page[number]'
        })
    }
    // @TODO return error for pad page values

    if (parsedParams.page?.number > -1) {
      queryBuilder.page(number, size)
    }

    if (parsedParams.sort.length) {
      parsedParams.sort.forEach((fieldDirection) => {
        const { name, direction } = fieldDirection
        if (columnNames.includes(name)) {
          queryBuilder.orderBy(normalizeColumn(tableName, name), direction)
        } else {
          reply.status(400)
            .send({
              status: 400,
              title: `Cannot sort by invalid column name: ${name}`
            })
        }
      })
    }
    // execute the builder after finish chaining
    queryBuilder.debug()
    const data = await queryBuilder.execute()

    if (!data) {
      return reply.code(404).send()
    }

    const result = Serializer.serialize(`${tableName}s`, data, {
      count: data?.total || 0,
      pageSize: size,
      page: number
    })
    reply.send(result)
  }
}

const getDeleteHandler = (Model) => {
  return async (request, reply) => {
    const id = request.params.id
    const numberDeleted = await Model.query().deleteById(id)
    const status = numberDeleted > 0 ? 204 : 404
    reply.status(status).send()
  }
}

const getUpdateHandler = (Model) => {
  return async (request, reply) => {
    try {
      const data = await Model.query().upsertGraphAndFetch(request.body,
        {
          update: false,
          relate: true,
          unrelate: true
        })
      reply.code(data ? 204 : 404)
      reply.send()
    } catch (e) {
      reply.status(404).send()
    }
  }
}

const getPostHandler = (Model) => {
  return async (request, reply) => {
    const { body, url } = request

    if (body.id) {
      return reply.send().status(403)
    }

    const newModel = await Model.query().insertGraph(body, { relate: true })
    const data = Serializer.serialize(Model.name.toLowerCase() + 's', newModel)
    const location = `${url}/${newModel.id}`
    return reply.status(201).header('Location', location).send(data)
  }
}

module.exports = { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler }
