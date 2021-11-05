const { Serializer } = require('../json-api-serializer')
const { query } = require('../models/project')
const { getIncludeStr, parseJsonApiParams } = require('../utils')

const normalizeColumn = (tableName, column) => column.includes('.') ? column : `${tableName}.${column}`

const getListHandler = (Model) => {
  return async (request, reply) => {
    const includeStr = getIncludeStr(request.query)
    const parsedParams = parseJsonApiParams(request.query)

    // chain
    const queryBuilder = Model.query()
    if (request.params.id) {
      queryBuilder.findById(request.params.id)
    }
    debugger
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
    const { size = 100, number = 0 } = parsedParams?.page || {}

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
    queryBuilder.debug()
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

module.exports = { getListHandler }
