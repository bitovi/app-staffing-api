const { Serializer } = require('../json-api-serializer')
const ProjectModel = require('../models/project')
const { getListHandler } = require('../utils/jsonapi-objection-handler')

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
    handler: getListHandler(ProjectModel)
  },
  get: {
    method: 'GET',
    url: '/projects/:id',
    handler: getListHandler(ProjectModel)
  },
  update: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const data = await ProjectModel.query().upsertGraphAndFetch(request.body,
        {
          update: false,
          relate: true,
          unrelate: true
        })
      reply.code(data ? 204 : 404)
      reply.send()
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
