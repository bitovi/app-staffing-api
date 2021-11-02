const Employee = require('../models/employee')
const { Serializer } = require('../json-api-serializer')

module.exports = {
  list: {
    url: '/employees',
    method: 'GET',
    async handler (request, reply) {
      const data = await Employee.query()
      const result = Serializer.serialize('employee', data, {
        count: data.length
      })
      reply.send(result)
    }
  },
  get: {
    url: '/employees/:id',
    method: 'GET',
    async handler (request, reply) {
      const data = await Employee.query().findById(request.params.id)
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  post: {
    url: '/employees',
    method: 'POST',
    async handler (request, reply) {
      const data = await Employee.query().insertAndFetch(request.body)
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  patch: {
    url: '/employees/:id',
    method: 'PATCH',
    async handler (request, reply) {
      // if (request.body.data.type !== 'employee') return reply.code(400).send('data.type is required')

      const data = await Employee.query().patchAndFetchById(
        request.params.id,
        request.body
      )
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  delete: {
    url: '/employees/:id',
    method: 'DELETE',
    async handler (request, reply) {
      await Employee.query().deleteById(request.params.id)
      const result = Serializer.serialize('employee', {})
      reply.code(204)
      reply.send(result)
    }
  }
}
