const Assignment = require('../models/assignment')
const { getListHandler, getDeleteHandler, getUpdateOneHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
const schema = require('../schemas/assignment')

const routes = {
  list: {
    url: '/assignments',
    method: 'GET',
    handler: getListHandler(Assignment),
    schema: schema.list
  },

  get: {
    url: '/assignments/:id',
    method: 'GET',
    handler: getListHandler(Assignment),
    schema: schema.get
  },

  post: {
    url: '/assignments',
    method: 'POST',
    handler: getPostHandler(Assignment),
    schema: schema.create
  },

  patch: {
    url: '/assignments/:id',
    method: 'PATCH',
    handler: getUpdateOneHandler(Assignment),
    schema: schema.patch
  },
  delete: {
    url: '/assignments/:id',
    method: 'DELETE',
    handler: getDeleteHandler(Assignment),
    schema: schema.remove
  }
}

module.exports = routes
