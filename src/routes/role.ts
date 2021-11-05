import RolesModel from '../models/role'
import { Serializer } from '../json-api-serializer'
import { getIncludeStr } from '../utils'
import FastifyRoute from './fastify-route'

export class RoleRoutes implements FastifyRoute {
  create: {
    method: 'POST',
    url: '/roles',
    schema: {
      body: RolesModel.getSchema
    },
    handler: (request: any, reply: any) => {
      const { body, url } = request
      const newRole = await RolesModel.query().insert(body)
      const data = Serializer.serialize('roles', newRole)
      const location = `${url}/${newRole.id}`
      reply.status(201).header('Location', location).send(data)
    }
    // handler(request: any, reply: any): void {
      // const { body, url } = request
      // const newRole = await RolesModel.query().insert(body)
      // const data = Serializer.serialize('roles', newRole)
      // const location = `${url}/${newRole.id}`
      // reply.status(201).header('Location', location).send(data)
    // }
  }
  // list: {
  //   method: 'GET',
  //   url: '/roles',
  //   handler: async function (request: any, reply: any) {
  //     const includeStr = getIncludeStr(request.query)
  //     const roles = await RolesModel.query().withGraphFetched(includeStr)
  //     const data = Serializer.serialize('roles', roles.map((role: any) => role.toJSON()))
  //     reply.send(data)
  //   }
  // },
  // get: {
  //   method: 'GET',
  //   url: '/roles/:id',
  //   handler: async function (request: any, reply: any) {
  //     const id = request.params.id
  //     const includeStr = getIncludeStr(request.query)

  //     try {
  //       const role = await RolesModel.query().findById(id).withGraphFetched(includeStr)
  //       const data = Serializer.serialize('roles', role.toJSON())
  //       reply.send(data)
  //     } catch (e) {
  //       reply.status(404).send()
  //     }
  //   }
  // },
  // update: {
  //   method: 'PATCH',
  //   url: '/roles/:id',
  //   handler: async function (request: any, reply: any) {
  //     try {
  //       const data = await RolesModel.query().upsertGraphAndFetch(request.body,
  //         {
  //           update: false,
  //           relate: true,
  //           unrelate: true
  //         })
  //       reply.code(data ? 204 : 404)
  //       reply.send()
  //     } catch (e) {
  //       reply.status(404).send()
  //     }
  //   }
  // },
  // delete: {
  //   method: 'DELETE',
  //   url: '/roles/:id',
  //   handler: async function (request: any, reply: any) {
  //     const id = request.params.id
  //     const numberDeleted = await RolesModel.query().deleteById(id)
  //     const status = numberDeleted > 0 ? 204 : 404
  //     reply.status(status).send()
  //   }
  // }
}
