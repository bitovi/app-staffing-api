const { makeQueryStringFilters } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: { type: 'string', format: 'uuid' },
  start_date: {
    type: 'string',
    description: 'The date the role starts'
  },
  start_confidence: {
    type: 'integer',
    description: 'A number representing percentage likelihood of the start date',
    minimum: 0,
    maximum: 10
  },
  end_date: {
    type: 'string',
    description: 'The date the role ends'
  },
  end_confidence: {
    type: 'integer',
    description: 'A number representing percentage likelihood of the end date',
    minimum: 0,
    maximum: 10
  },
  project_id: {
    type: 'string',
    format: 'uuid',
    description: 'The id of the project record'
  }
}

const name = 'role'
const tags = [name]

const list = {
  description: `retrieve a list of ${name}s`,
  tags,
  summary: '',
  querystring: {
    type: 'object',
    properties: {
      ...queryStringSchema.common,
      ...makeQueryStringFilters(properties)
    }
  }
}
const get = {
  description: `retrieve a ${name} by id`,
  tags,
  summary: '',
  params: makeIdParams(name)
}
const create = {
  description: `create a ${name}`,
  tags,
  type: 'object',
  required: ['project_id'],
  properties,
  additionalProperties: false
}
const patch = {
  description: `patch a ${name}`,
  tags,
  type: 'object',
  properties,
  additionalProperties: false
}

module.exports = {
  properties,
  list,
  get,
  create,
  patch
}
