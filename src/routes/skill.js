const SkillModel = require('../models/skill')
const { getListHandler, getDeleteHandler, getUpdateHandler, getPostHandler } = require('../utils/jsonapi-objection-handler')

const routes = {
  list: {
    method: 'GET',
    url: '/skills',
    handler: getListHandler(SkillModel)
  },
  get: {
    method: 'GET',
    url: '/skills/:id',
    handler: getListHandler(SkillModel)
  },
  delete: {
    method: 'DELETE',
    url: '/skills/:id',
    handler: getDeleteHandler(SkillModel)
  },
  update: {
    method: 'PATCH',
    url: '/skills/:id',
    handler: getUpdateHandler(SkillModel)
    // schema: SkillModel.jsonSchemaPatch
  },
  create: {
    method: 'POST',
    url: '/skills',
    handler: getPostHandler(SkillModel),
    schema: SkillModel.jsonSchema
  }

}

module.exports = routes
