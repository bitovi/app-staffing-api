const Assignment = require('../models/assignment')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  list: {
    url: '/assignments',
    method: 'GET',
    handler: getListHandler(Assignment)
  },

  get: {
    url: '/assignments/:id',
    method: 'GET',
    handler: getListHandler(Assignment)
  },

  post: {
    url: '/assignments',
    method: 'POST',
    handler: getPostHandler(Assignment)
  },

  patch: {
    url: '/assignments/:id',
    method: 'PATCH',
    handler: getUpdateHandler(Assignment)
  },
  delete: {
    url: '/assignments/:id',
    method: 'DELETE',
    handler: getDeleteHandler(Assignment)
  }
}

module.exports = routes
