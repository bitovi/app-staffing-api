const Employee = require('../models/employee')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
const schema = require('../schemas/employee')

const routes = {
  list: {
    url: '/employees',
    method: 'GET',
    handler: getListHandler(Employee),
    schema: schema.list
  },

  get: {
    url: '/employees/:id',
    method: 'GET',
    handler: getListHandler(Employee),
    schema: schema.get
  },

  post: {
    url: '/employees',
    method: 'POST',
    handler: getPostHandler(Employee),
    schema: schema.create
  },

  patch: {
    url: '/employees/:id',
    method: 'PATCH',
    handler: getUpdateHandler(Employee),
    schema: schema.patch
  },

  delete: {
    url: '/employees/:id',
    method: 'DELETE',
    handler: getDeleteHandler(Employee)
  }
}

module.exports = routes
