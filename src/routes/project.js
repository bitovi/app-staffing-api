const { Serializer } = require('../json-api-serializer')
const ProjectModel = require('../models/project')
const { getIncludeStr } = require('../utils')

const routes = {
  create: {
    method: 'POST',
    url: '/projects',
    schema: {
      body: ProjectModel.getSchema
    },
    handler: async function (request, reply) {
      const { body, url } = request
      if (body.id) reply.send().status(403)

      const newProject = await ProjectModel.query().insert(body)
      const data = Serializer.serialize('projects', newProject)
      const location = `${url}/${newProject.id}`
      reply.status(201).header('Location', location).send(data)
    }
  },
  list: {
    method: 'GET',
    url: '/projects',
    handler: async function (request, reply) {
      const includeStr = getIncludeStr(request.query)
      const projects = await ProjectModel.query().withGraphFetched(includeStr)
      const data = Serializer.serialize('projects', projects.map(project => project.toJSON()))
      reply.send(data)
    }
  },
  get: {
    method: 'GET',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      try {
        const includeStr = getIncludeStr(request.query)
        const project = await ProjectModel.query().findById(id).withGraphFetched(includeStr)
        const data = Serializer.serialize('projects', project.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(500).send()
      }
    }
  },
  update: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: async function (request, reply) {
      try {
        await ProjectModel.query().upsertGraph(request.body, { insertMissing: true, update: false })
        reply.send()
      } catch (e) {
        console.log(e)
        reply.status(500).send()
      }
    }
  },
  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const id = request.params.id

      const numberDeleted = await ProjectModel.query().deleteById(id)
      const status = numberDeleted > 0 ? 204 : 404
      reply.status(status).send()
    }
  }
}

module.exports = routes
