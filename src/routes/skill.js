const Skill = require('../models/skill')
const schema = require('../schemas/skill')
const { Serializer } = require('../json-api-serializer')

const routes = {
  list: {
    method: 'GET',
    url: '/skills',
    handler: async (request, reply) => {
      const skills = await Skill.query()
      const serialized = Serializer.serialize('skills', skills)
      reply.send(serialized)
    },
    schema: schema.list
  },
  get: {
    method: 'GET',
    url: '/skills/:id',
    handler: async (request, reply) => {
      const skill = await Skill
        .query().findById(request.params.id)
      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema: schema.get
  },
  delete: {
    method: 'DELETE',
    url: '/skills/:id',
    handler: async (request, reply) => {
      await Skill.query().deleteById(request.params.id)
      reply.code(204).send()
    }
  },
  patch: {
    method: 'PATCH',
    url: '/skills/:id',
    handler: async (request, reply) => {
      const data = await Skill
        .query().upsertGraphAndFetch(request.body,
          {
            update: false,
            relate: true,
            unrelate: true
          })
      reply.code(data ? 204 : 404)
      reply.send()
    },
    schema: schema.patch
  },
  create: {
    method: 'POST',
    url: '/skills',
    handler: async (request, reply) => {
      const skill = await Skill
        .query().insert(request.body)

      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema: schema.create
  }

}

module.exports = routes
