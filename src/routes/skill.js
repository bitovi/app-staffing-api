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

function routes (fastify) {
  // GET
  fastify.get('/skills', async (request, reply) => {
    const skills = await SkillModel
      .query()

    const serialized = Serializer.serialize('skills', skills)
    reply.send(serialized)
  })

  fastify.get('/skills/:id', async (request, reply) => {
    const skill = await SkillModel
      .query().findById(request.params.id)

    const serialized = Serializer.serialize('skills', skill)
    reply.send(serialized)
  })

  // DELETE
  fastify.delete('/skills/:id', async (request, reply) => {
    await SkillModel.query().deleteById(request.params.id)
    reply.code(204).send()
  })

  // POST
  fastify.post('/skills', {
    handler: async (request, reply) => {
      const skill = await SkillModel
        .query().insert(request.body)

      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema:
          SkillModel.jsonSchema
  })

  // PATCH
  fastify.patch('/skills/:id', {
    handler: async (request, reply) => {
      const skill = await SkillModel
        .query().patchAndFetchById(request.params.id, request.body)

      const serialized = Serializer.serialize('skills', skill)
      reply.send(serialized)
    },
    schema:
        SkillModel.jsonSchemaPatch
  })
}

module.exports = routes
