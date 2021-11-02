const JSONAPISerializer = require('json-api-serializer')

const Serializer = new JSONAPISerializer({
  convertCase: 'kebab-case'
})

const ProjectModel = require('../models/project')

Serializer.register('projects', {
  id: 'id',
  name: 'name',
  start_date: 'start_date',
  end_date: 'end_date'
})

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
    handler: async function (_, reply) {
      const projects = await ProjectModel.query()
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
        const project = await ProjectModel.query().findById(id)
        const data = Serializer.serialize('projects', project.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(404).send()
      }
    }
  },
  update: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: async function (request, reply) {
      const id = request.params.id
      const { body } = request
      try {
        const project = await ProjectModel.query().patchAndFetchById(id, body)
        const data = Serializer.serialize('projects', project.toJSON())
        reply.send(data)
      } catch (e) {
        reply.status(404).send()
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
