const Employee = require('../models/employee')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  list: {
    url: '/employees',
    method: 'GET',
    handler: getListHandler(Employee)
  },

  get: {
    url: '/employees/:id',
    method: 'GET',
    handler: getListHandler(Employee)
  },

  post: {
    url: '/employees',
    method: 'POST',
    handler: getPostHandler(Employee),
    schema: {
      body: Employee.getSchema
    }
  },

  patch: {
    url: '/employees/:id',
    method: 'PATCH',
    handler: getUpdateHandler(Employee)
  },

  delete: {
    url: '/employees/:id',
    method: 'DELETE',
    handler: getDeleteHandler(Employee)
  }
}

module.exports = routes
