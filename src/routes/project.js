const ProjectModel = require('../models/project')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  create: {
    method: 'POST',
    url: '/projects',
    schema: {
      body: ProjectModel.getSchema
    },
    handler: getPostHandler(ProjectModel)
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
    handler: getUpdateHandler(ProjectModel)
  },

  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: getDeleteHandler(ProjectModel)
  }
}

module.exports = routes
