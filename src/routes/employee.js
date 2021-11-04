const Employee = require('../models/employee')
const { Serializer } = require('../json-api-serializer')
const { getIncludeStr } = require('../utils')

module.exports = {
  list: {
    url: '/employees',
    method: 'GET',
    async handler (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const data = await Employee.query().withGraphFetched(includeStr)
      const result = Serializer.serialize('employees', data, {
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
