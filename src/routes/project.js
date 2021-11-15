const ProjectModel = require('../models/project')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
const schema = require('../schemas/project')

const routes = {
  create: {
    method: 'POST',
    url: '/projects',
    handler: getPostHandler(ProjectModel),
    schema: schema.create
  },

  list: {
    method: 'GET',
    url: '/projects',
    handler: getListHandler(ProjectModel),
    schema: schema.list
  },

  get: {
    method: 'GET',
    url: '/projects/:id',
    handler: getListHandler(ProjectModel),
    schema: schema.get
  },

  update: {
    method: 'PATCH',
    url: '/projects/:id',
    handler: getUpdateHandler(ProjectModel),
    schema: schema.patch
  },

  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: getDeleteHandler(ProjectModel)
  }
}

module.exports = routes
