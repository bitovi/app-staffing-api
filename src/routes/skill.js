const SkillModel = require('../models/skill')
const JSONAPISerializer = require('json-api-serializer')

// JSONAPISerializer Setup
const Serializer = new JSONAPISerializer({
  convertCase: 'kebab-case'
})
Serializer.register('skills', {
  id: 'id',
  name: 'name'
})

const routes = {
  list: {
    method: 'GET',
    url: '/skills',
    handler: async (request, reply) => {
      const skills = await SkillModel.query()
      const serialized = Serializer.serialize('skills', skills)
      reply.send(serialized)
    }
  },
  get: {
    method: 'GET',
    url: '/skills/:id',
    handler: async (request, reply) => {
      const skill = await SkillModel
        .query().findById(request.params.id)
      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    }
  },
  delete: {
    method: 'DELETE',
    url: '/skills/:id',
    handler: async (request, reply) => {
      await SkillModel.query().deleteById(request.params.id)
      reply.code(204).send()
    }
  },
  update: {
    method: 'PATCH',
    url: '/skills/:id',
    handler: async (request, reply) => {
      const skill = await SkillModel
        .query().patchAndFetchById(request.params.id, request.body)
      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema: SkillModel.jsonSchemaPatch
  },
  create: {
    method: 'POST',
    url: '/skills',
    handler: async (request, reply) => {
      const skill = await SkillModel
        .query().insert(request.body)

      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema: SkillModel.jsonSchema
  }

}

module.exports = routes
