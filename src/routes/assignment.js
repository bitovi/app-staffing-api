const Assignment = require('../models/assignment')
const schema = require('../schemas/assignment')
const queryStringSchema = require('../schemas/query-string')
const { Serializer } = require('../json-api-serializer')
const { getIncludeStr } = require('../utils')

module.exports = {
  list: {
    url: '/assignments',
    method: 'GET',
    async handler (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const data = await Assignment.query().withGraphFetched(includeStr)
      const result = Serializer.serialize('assignments', data, {
        count: data.length
      })
      reply.send(result)
    },
    schema: {
      description: 'retrieve a list of assignments',
      tags: ['assignment'],
      summary: 'In addition to the filters',
      querystring: {
        type: 'object',
        properties: {
          ...queryStringSchema.common
        }
      }
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
    },
    schema: {
      description: 'app-staffing-api is so kuhl',
      tags: ['assignment'],
      summary: 'qwerty',
      params: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'user id'
          }
        }
      },
      body: {
        type: 'object',
        properties: {
          hello: { type: 'string' },
          obj: {
            type: 'object',
            properties: {
              some: { type: 'string' }
            }
          }
        }
      }
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
