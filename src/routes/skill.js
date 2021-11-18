const SkillModel = require('../models/skill')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')
const schema = require('../schemas/skill')

const routes = {
  list: {
    method: 'GET',
    url: '/skills',
    handler: getListHandler(SkillModel),
    schema: schema.list
  },
  get: {
    method: 'GET',
    url: '/skills/:id',
    handler: getListHandler(SkillModel),
    schema: schema.get
  },
  delete: {
    method: 'DELETE',
    url: '/skills/:id',
    handler: getDeleteHandler(SkillModel),
    schema: schema.remove
  },
  patch: {
    method: 'PATCH',
    url: '/skills/:id',
    handler: getUpdateHandler(SkillModel),
    schema: schema.patch
  },
  create: {
    method: 'POST',
    url: '/skills',
    handler: getPostHandler(SkillModel),
    schema: schema.create
  }

}

module.exports = routes
