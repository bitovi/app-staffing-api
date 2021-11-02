const Employee = require('../models/employee')
const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

Serializer.register('employee', {
  id: 'id'
})

module.exports = {
  list: {
    url: 'employees',
    method: 'get',
    async handler (request, reply) {
      const data = await Employee.query()
      const result = Serializer.serialize('employee', data, { count: data.length })
      reply.send(result)
    }
  },
  get: {
    url: 'employees/:id',
    method: 'get',
    async handler (request, reply) {
      const data = await Employee.query().where('id', '=', request.params.id)
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  post: {
    url: 'employees/:id',
    method: 'post',
    async handler (request, reply) {
      if (request.body.data.type !== 'employee') return reply.code(400).send('data.type is required')

      const data = await Employee.query().insertAndFetch(request.body.data.attributes)
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  patch: {
    url: 'employees/:id',
    method: 'patch',
    async handler (request, reply) {
      if (request.body.data.type !== 'employee') return reply.code(400).send('data.type is required')

      const data = await Employee.query().patchAndFetchById(request.params.id, request.body.data.attributes))
      const result = Serializer.serialize('employee', data)
      reply.send(result)
    }
  },
  delete: {
    url: 'employees/:id',
    method: 'delete',
    async handler (request, reply) {
      await Employee.query().deleteById(request.params.id)
      const result = Serializer.serialize('employee', {})
      reply.code(204)
      reply.send(result)
    }
  }
}
