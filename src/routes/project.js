const { Serializer } = require('../json-api-serializer')
const ProjectModel = require('../models/project')
const { getIncludeStr, runQueryOn } = require('../utils')

const routes = {
  create: {
    method: 'POST',
    url: '/projects',
    schema: {
      body: ProjectModel.getSchema
    },
    handler: async function (request, reply) {
      const { body, url } = request
      if (body.id) {
        return reply.send().status(403)
      }

      const newProject = await ProjectModel.query().insert(body)
      const data = Serializer.serialize('projects', newProject)
      const location = `${url}/${newProject.id}`
      return reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/projects',
    handler: async function (request, reply) {
      const projects = await runQueryOn(ProjectModel, request.query);
      const data = Serializer.serialize('projects', projects.map(project => project.toJSON()))
      return reply.send(data)
    }
  },
  get: {
    method: 'GET',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const project = await ProjectModel.query().findById(request.params.id).withGraphFetched(includeStr)

      if (!project) {
        return reply.status(404).send()
      }

      const data = Serializer.serialize('projects', project.toJSON())
      return reply.send(data)
    }
  },
  update: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: async function (request, reply) {
      await ProjectModel.query().upsertGraph(request.body, { insertMissing: true, update: false })
      return reply.send()
    }
  },
  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const numberDeleted = await ProjectModel.query().deleteById(request.params.id)
      const status = numberDeleted > 0 ? 204 : 404
      return reply.status(status).send()
    }
  }
}

module.exports = routes
