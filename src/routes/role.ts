import { FastifyReply, FastifyRequest } from 'fastify'
import Role from '../models/role'
import { Serializer } from '../json-api-serializer'
import { getIncludeStr } from '../utils'
import { IController, KeyValuePairs } from '../types/IController'

const controller: IController = {
  create: {
    method: 'POST',
    url: '/roles',
    async handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const { body, url } = request
      const newRole = await Role.query().insert(<Role>body)
      const data = Serializer.serialize('roles', newRole)

      const location = `${url}/${newRole.id}`
      return reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/roles',
    async handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const includeStr = getIncludeStr(request.query)
      const roles = await Role.query().withGraphFetched(includeStr)
      const data = Serializer.serialize('roles', roles.map((role: any) => role.toJSON()))
      reply.send(data)
    }
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    async handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const id = (request.params as KeyValuePairs).id
      const includeStr = getIncludeStr(request.query)

      try {
        const role = await Role.query().findById(id).withGraphFetched(includeStr)
        const data = Serializer.serialize('roles', role.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(404).send()
      }
    }
  },
  update: {
    method: 'PATCH',
    url: '/roles/:id',
    async handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      try {
        const data = await Role.query().upsertGraphAndFetch(<Role>request.body,
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
    async handler(request: FastifyRequest, reply: FastifyReply): Promise<void> {
      const id = (request.params as KeyValuePairs).id
      const numberDeleted = await Role.query().deleteById(id)
      const status = numberDeleted > 0 ? 204 : 404
      reply.status(status).send()
    }
  }
}

export default controller
