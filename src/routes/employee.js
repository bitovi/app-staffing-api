const Employee = require('../models/employee')
const { Serializer } = require('../json-api-serializer')
const createError = require('http-errors')
const { getIncludeStr } = require('../utils')

const tableName = 'employee'
const normalizeColumn = column => column.includes('.') ? column : `${tableName}.${column}`

module.exports = {
  list: {
    url: '/employees',
    method: 'GET',
    async handler (request, reply) {
      // Sort
      const orderBy = request.query.sort?.split(',').map(column =>
        column.startsWith('-')
          ? { column: normalizeColumn(column.substr(1)), order: 'DESC' }
          : { column: normalizeColumn(column) })

      // Paginate
      const page = request.query['page[number]'] || 0
      const pageSize = request.query['page[size]'] || 20

      const includeStr = getIncludeStr(request.query)
      const dbQuery = Employee.query()
        .orderBy(orderBy || [])
        .page(page, pageSize)
        .withGraphJoined(includeStr)

      // Return error if trying to filter a value with an array
      const filteredByArray = Object.entries(request.query.filter || {}).find(([key, value]) => Array.isArray(value))
      if (filteredByArray) return reply.send(createError(400, `cannot have multiple values for filter property '${filteredByArray[0]}'`))

      // Clean Up Filters
      const filterBy = Object.entries(request.query)
        .filter(([key]) => key.startsWith('filter'))
        .map(([key, value]) => {
          const plainKey = key.substr(7).split(']')[0]
          return { key: plainKey.includes('.') ? plainKey : `employee.${plainKey}`, value }
        })

      // Filter
      filterBy.forEach(({ key, value }) => {
        const safeValue = value.toLowerCase().split('%').join('\\%')
        dbQuery.where(key, 'ilike', `%${safeValue}%`)
      })

      const data = await dbQuery.debug()
      const result = Serializer.serialize('employees', data.results, {
        count: data.length
      })
      reply.send(result)
    }
  },
  get: {
    url: '/employees/:id',
    method: 'GET',
    async handler (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const data = await Employee.query()
        .findById(request.params.id)
        .withGraphFetched(includeStr)
      if (!data) {
        return reply.code(404).send()
      }
      const result = Serializer.serialize('employees', data)
      reply.send(result)
    }
  },
  post: {
    url: '/employees',
    method: 'POST',
    async handler (request, reply) {
      const data = await Employee.query().upsertGraphAndFetch(request.body, { relate: true })
      const result = Serializer.serialize('employees', data)
      reply.code(201).send(result)
    }
  },
  patch: {
    url: '/employees/:id',
    method: 'PATCH',
    async handler (request, reply) {
      const data = await Employee.query().upsertGraphAndFetch(
        request.body,
        {
          update: false,
          relate: true,
          unrelate: true
        })

      reply.code(data ? 204 : 404)
      reply.send()
    }
  },
  delete: {
    url: '/employees/:id',
    method: 'DELETE',
    async handler (request, reply) {
      await Employee.query().deleteById(request.params.id)
      const result = Serializer.serialize('employees', {})
      reply.code(204)
      reply.send(result)
    }
  }
}
