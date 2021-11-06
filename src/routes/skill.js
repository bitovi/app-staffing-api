const SkillModel = require('../models/skill')
const { Serializer } = require('../json-api-serializer')
const { getListHandler, getDeleteHandler } = require('../utils/jsonapi-objection-handler')

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
    handler: getListHandler(SkillModel)
  },
  delete: {
    method: 'DELETE',
    url: '/skills/:id',
    handler: getDeleteHandler(SkillModel)
  },
  update: {
    method: 'PATCH',
    url: '/skills/:id',
    handler: async (request, reply) => {
      const data = await SkillModel
        .query().upsertGraphAndFetch(request.body,
          {
            update: false,
            relate: true,
            unrelate: true
          })
      reply.code(data ? 204 : 404)
      reply.send()
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
