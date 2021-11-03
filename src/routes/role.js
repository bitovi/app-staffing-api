const RolesModel = require('../models/role')
const { Serializer } = require('../json-api-serializer')

function getincludeStr (q) {
  const inc = '[' + (q?.include || '') + ']'
  return inc
}

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
      const data = Serializer.serialize('role', newRole)
      const location = `${url}/${newRole.id}`
      reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/roles',
    handler: async function (request, reply) {
      const includeStr = getincludeStr(request.query)
      const roles = await RolesModel.query().withGraphFetched(includeStr)
      const data = Serializer.serialize('role', roles.map(role => role.toJSON()))
      reply.send(data)
    }
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      const includeStr = getincludeStr(request.query)

      try {
        const role = await RolesModel.query().findById(id).withGraphFetched(includeStr)
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
