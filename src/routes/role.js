const JSONAPISerializer = require('json-api-serializer')

const Serializer = new JSONAPISerializer()

const RolesModel = require('../models/role')

Serializer.register('role', {
  id: 'id',
  start_date: 'start_date',
  start_confidence: 'start_confidence',
  end_date: 'end_date',
  end_confidence: 'end_confidence',
  role_id: 'role_id'
})

const routes = {
  create: {
    method: 'POST',
    url: '/roles',
    schema: {
      body: RolesModel.getSchema
    },
    handler: async function (request, reply) {
      const { body, url } = request
      if (body.id) reply.send().status(403)
      const newRole = await RolesModel.query().insert(body)
      const data = Serializer.serialize('role', newRole)
      const location = `${url}/${newRole.id}`
      reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/roles',
    handler: async function (_, reply) {
      const roles = await RolesModel.query()
      const data = Serializer.serialize('role', roles.map(role => role.toJSON()))
      reply.send(data)
    }
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      try {
        const role = await RolesModel.query().findById(id)
        const data = Serializer.serialize('role', role.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(404).send()
      }
    }
  },
  update: {
    method: 'PATCH',
    url: '/roles/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      const { body } = request
      try {
        const role = await RolesModel.query().patchAndFetchById(id, body)
        const data = Serializer.serialize('role', role.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(404).send()
      }
    }
  },
  delete: {
    method: 'DELETE',
    url: '/roles/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      const numberDeleted = await RolesModel.query().deleteById(id)
      const status = numberDeleted > 0 ? 204 : 404
      reply.status(status).send()
    }
  }
}

module.exports = routes
