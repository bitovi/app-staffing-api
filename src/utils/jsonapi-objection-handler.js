const { Serializer } = require('../json-api-serializer')
// const { query } = require('../models/project')
const { getIncludeStr, parseJsonApiParams } = require('../utils')

const normalizeColumn = (tableName, column) => column.includes('.') ? column : `${tableName}.${column}`

const getListHandler = (Model) => {
  return async (request, reply) => {
    debugger
    const includeStr = getIncludeStr(request.query)
    const parsedParams = parseJsonApiParams(request.query)

    const modelRelations = Object.keys(Model.relationMappings)

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

    // if (Object.keys(parsedParams.fields).length) {
    //   for (const [key, val] of Object.entries(parsedParams.fields)) {
    //     const items = val.map(el => normalizeColumn(key.slice(0, -1), el))
    //     queryBuilder.select(...items)
    //   }
    // }

    queryBuilder.withGraphJoined(includeStr)
    queryBuilder.skipUndefined()

    if (parsedParams.filter.length) {
      parsedParams.filter.forEach((filter) => {
        const isInt = !isNaN(parseInt(filter.value))
        const isDate = !isNaN(Date.parse(filter.value))
        const isEqual = isInt || isDate
        queryBuilder.where(normalizeColumn(Model.tableName, filter.key), isEqual ? '=' : 'ilike', `%${filter.value}%`)
      })
    }
    let { size = 100, number = 0 } = parsedParams?.page || {}
    if (size < 1) {
      size = 1
    }
    if (number < 0) {
      number = 0
    }

    if (parsedParams.page?.number > -1) {
      queryBuilder.page(number, size)
    }

    if (parsedParams.sort.length) {
      parsedParams.sort.forEach((fieldDirection) => {
        const { name, direction } = fieldDirection
        queryBuilder.orderBy(name, direction)
      })
    }
    // execute the builder after finish chaining
    // queryBuilder.debug()
    const data = await queryBuilder.execute()

    if (!data) {
      return reply.code(404).send()
    }

    const result = Serializer.serialize(`${Model.tableName}s`, data, {
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

module.exports = { getListHandler, getDeleteHandler }
