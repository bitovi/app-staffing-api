const Assignment = require('../models/assignment')
const { Serializer } = require('../json-api-serializer')
const { getIncludeStr } = require('../utils')

module.exports = {
  list: {
    url: '/assignments',
    method: 'GET',
    async handler (request, reply) {
      const data = await Assignment.query()
      const result = Serializer.serialize('assignments', data, {
        count: data.length
      })
      reply.send(result)
    }
  },
  get: {
    url: '/assignments/:id',
    method: 'GET',
    async handler (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const data = await Assignment.query().findById(request.params.id).withGraphFetched(includeStr)
      if (!data) {
        return reply.code(404).send()
      }

      const result = Serializer.serialize('assignments', data)
      reply.send(result)
    }
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
      // if (request.body.data.type !== 'assignments') return reply.code(400).send('data.type is required')

      const data = await Assignment.query().patchAndFetchById(
        request.params.id,
        request.body
      )
      const result = Serializer.serialize('assignments', data)
      reply.send(result)
    }
  },
  delete: {
    url: '/assignments/:id',
    method: 'DELETE',
    async handler (request, reply) {
      await Assignment.query().deleteById(request.params.id)
      const result = Serializer.serialize('assignments', {})
      reply.code(204)
      reply.send(result)
    }
  }
}
