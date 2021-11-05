const { Serializer } = require('../json-api-serializer')
const { getIncludeStr, parseJsonApiParams } = require('../utils')

const getListHandler = (Model) => {
  return async (request, reply) => {
    const includeStr = getIncludeStr(request.query)
    const parsedParams = parseJsonApiParams(request.query)

    // chain
    const queryBuilder = Model.query()
    if (request.params.id) {
      queryBuilder.findById(request.params.id)
    }

    queryBuilder.withGraphFetched(includeStr)
    queryBuilder.skipUndefined()
    if (parsedParams.filter) {
      // if (includeStr.length) {
      //   parsedParams.filter.forEach((filter) => {
      //     queryBuilder.andWhere(filter.key, 'like', `%${filter.value}%`)
      //   })
      // }
      parsedParams.filter.forEach((filter) => {
        queryBuilder.andWhere(filter.key, 'iLike', `%${filter.value}%`)
      })
    }

    if (parsedParams.page) {
      const { size, number } = parsedParams.page
      const offset = (size * number) - size
      queryBuilder.offset(offset)
      queryBuilder.limit(parsedParams.page.size)
    }

    if (parsedParams.sort) {
      parsedParams.sort.forEach((fieldDirection) => {
        const { name, direction } = fieldDirection
        queryBuilder.orderBy(name, direction)
      })
    }
    // execute the builder after finish chaining
    const data = await queryBuilder.execute()
    const result = Serializer.serialize(`${Model.tableName}s`, data, {
      count: data.length
    })
    reply.send(result)
  }
}
module.exports = { getListHandler }
