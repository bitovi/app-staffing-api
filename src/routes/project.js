const Project = require('../models/project')
const schema = require('../schemas/project')
const { Serializer } = require('../json-api-serializer')
const { getIncludeStr } = require('../utils')

const routes = {
  create: {
    method: 'POST',
    url: '/projects',
    handler: async function (request, reply) {
      const { body, url } = request

      if (body.id) {
        return reply.send().status(403)
      }

      const newProject = await Project.query().insert(body)
      const data = Serializer.serialize('projects', newProject)
      const location = `${url}/${newProject.id}`
      return reply.status(201).header('Location', location).send(data)
    },
    schema: schema.create
  },
  list: {
    method: 'GET',
    url: '/projects',
    handler: async function (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const projects = await Project.query().withGraphFetched(includeStr)
      const data = Serializer.serialize('projects', projects.map(project => project.toJSON()))
      return reply.send(data)
    },
    schema: schema.list
  },
  get: {
    method: 'GET',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const project = await Project.query().findById(request.params.id).withGraphFetched(includeStr)

      if (!project) {
        return reply.status(404).send()
      }

      const data = Serializer.serialize('projects', project.toJSON())
      return reply.send(data)
    },
    schema: schema.get
  },
  patch: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const data = await Project.query().upsertGraphAndFetch(request.body,
        {
          update: false,
          relate: true,
          unrelate: true
        })
      reply.code(data ? 204 : 404)
      reply.send()
    },
    schema: schema.create
  },
  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const numberDeleted = await Project.query().deleteById(request.params.id)
      const status = numberDeleted > 0 ? 204 : 404
      return reply.status(status).send()
    }
  }
}

module.exports = routes
