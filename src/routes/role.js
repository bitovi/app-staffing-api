const RolesModel = require('../models/role')
const { Serializer } = require('../json-api-serializer')
const { getListHandler, getDeleteHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  create: {
    method: 'POST',
    url: '/roles',
    schema: {
      body: RolesModel.getSchema
    },
    handler: async function (request, reply) {
      const { body, url } = request
      const newRole = await RolesModel.query().insert(body)
      const data = Serializer.serialize('roles', newRole)
      const location = `${url}/${newRole.id}`
      reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/roles',
    handler: getListHandler(RolesModel)
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    handler: getListHandler(RolesModel)
  },
  update: {
    method: 'PATCH',
    url: '/roles/:id',
    handler: async function (request, reply) {
      try {
        const data = await RolesModel.query().upsertGraphAndFetch(request.body,
          {
            update: false,
            relate: true,
            unrelate: true
          })
        reply.code(data ? 204 : 404)
        reply.send()
      } catch (e) {
        reply.status(404).send()
      }
    }
  },
  delete: {
    method: 'DELETE',
    url: '/roles/:id',
    handler: getDeleteHandler(RolesModel)
  }
}

module.exports = routes
