const Assignment = require('../models/assignment')
const { Serializer } = require('../json-api-serializer')
const { getListHandler } = require('../utils/jsonapi-objection-handler')

module.exports = {
  list: {
    url: '/assignments',
    method: 'GET',
    handler: getListHandler(Assignment)
  },
  get: {
    url: '/assignments/:id',
    method: 'GET',
    handler: getListHandler(Assignment)
  },
  post: {
    url: '/assignments',
    method: 'POST',
    async handler (request, reply) {
      const data = await Assignment.query().insertAndFetch(request.body)
      const result = Serializer.serialize('assignments', data)
      reply.code(201).send(result)
    }
  },
  patch: {
    url: '/assignments/:id',
    method: 'PATCH',
    async handler (request, reply) {
      const data = await Assignment.query().upsertGraphAndFetch(request.body,
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
    url: '/assignments/:id',
    method: 'DELETE',
    async handler (request, reply) {
      const wasRecordRemoved = await Assignment.query().deleteById(request.params.id)
      const result = Serializer.serialize('assignments', {})
      reply.code(wasRecordRemoved ? 204 : 404)
      reply.send(result)
    }
  }
}
