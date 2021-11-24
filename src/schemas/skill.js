const { makeQueryStringFilters } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: { type: 'string', format: 'uuid' },
  name: {
    type: 'string',
    description: 'The name of the skill'
  }
}

const name = 'skill'
const tags = [name]

const list = {
  description: `retrieve a list of ${name}s`,
  summary: `retrieve a list of ${name}s`,
  tags,
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
  summary: `retrieve a ${name} by id`,
  tags,
  params: makeIdParams(name)
}
const create = {
  description: `create a ${name}`,
  summary: `create a ${name}`,
  tags,
  body: {
    type: 'object',
    required: ['name']
  },
  properties,
  additionalProperties: false
}
const patch = {
  description: `patch a ${name}`,
  summary: `patch a ${name}`,
  tags,
  type: 'object',
  properties,
  additionalProperties: false
}
const remove = {
  description: `delete an ${name}`,
  summary: `delete an ${name}`,
  tags,
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {}
    }
  }
}

module.exports = {
  properties,
  list,
  get,
  create,
  patch,
  remove
}
