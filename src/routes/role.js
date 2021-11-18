const RolesModel = require('../models/role')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
const schema = require('../schemas/role')

const routes = {
  create: {
    method: 'POST',
    url: '/roles',
    schema: schema.create,
    handler: getPostHandler(RolesModel)
  },
  list: {
    method: 'GET',
    url: '/roles',
    handler: getListHandler(RolesModel),
    schema: schema.list
  },
  get: {
    method: 'GET',
    url: '/roles/:id',
    handler: getListHandler(RolesModel),
    schema: schema.get
  },
  patch: {
    method: 'PATCH',
    url: '/roles/:id',
    handler: getUpdateHandler(RolesModel),
    schema: schema.patch
  },
  delete: {
    method: 'DELETE',
    url: '/roles/:id',
    handler: getDeleteHandler(RolesModel),
    schema: schema.remove
  }
}

module.exports = routes
