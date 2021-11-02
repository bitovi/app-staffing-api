const Employee = require('../../models/employee')
const JSONAPISerializer = require('json-api-serializer')
const Serializer = new JSONAPISerializer()

Serializer.register('employee', {
  id: 'id'
})

module.exports = function employees (fastify) {
  // find
  fastify.get('/employees', {}, async (request, reply) => {
    const data = await Employee.query()
    const result = Serializer.serialize('employee', data, { count: data.length })
    reply.send(result)
  })
  // get
  fastify.get('/employees/:id', {}, async (request, reply) => {
    const data = await Employee.query().where('id', '=', request.params.id)
    const result = Serializer.serialize('employee', data)
    reply.send(result)
  })
  // create
  fastify.post('/employees', {}, async (request, reply) => {
    const data = await Employee.query().insertAndFetch(request.body)
    const result = Serializer.serialize('employee', data)
    reply.send(result)
  })
  // update
  fastify.put('/employees/:id', {}, async (request, reply) => {
    const data = await Employee.query().updateAndFetchById(request.params.id, request.body)
    const result = Serializer.serialize('employee', data)
    reply.send(result)
  })
  // patch
  fastify.patch('/employees/:id', {}, async (request, reply) => {
    const data = await Employee.query().patchAndFetchById(request.params.id, request.body)
    const result = Serializer.serialize('employee', data)
    reply.send(result)
  })
  // remove
  fastify.delete('/employees/:id', {}, async (request, reply) => {
    const data = await Employee.query().deleteById(request.params.id)
    const result = Serializer.serialize('employee', {})
    reply.send(result)
  })
}
