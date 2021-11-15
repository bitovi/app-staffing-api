const RolesModel = require('../models/role')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  create: {
    method: 'POST',
    url: '/roles',
    schema: {
      body: RolesModel.getSchema
    },
    handler: getPostHandler(RolesModel)
  },
  list: {
    method: 'GET',
    url: '/roles',
    handler: getListHandler(RolesModel)
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    handler: getListHandler(RolesModel)
  },
  update: {
    method: 'PATCH',
    url: '/roles/:id',
    handler: getUpdateHandler(RolesModel)
  },
  delete: {
    method: 'DELETE',
    url: '/roles/:id',
    handler: getDeleteHandler(RolesModel)
  }
}

module.exports = routes
