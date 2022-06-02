const ProjectModel = require('../models/project')
const { getListHandler, getDeleteHandler, getUpdateOneHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
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
    handler: getUpdateOneHandler(ProjectModel),
    schema: schema.patch
  },

  delete: {
    method: 'DELETE',
    url: '/projects/:id',
    handler: getDeleteHandler(ProjectModel),
    schema: schema.remove
  }
}

module.exports = routes
