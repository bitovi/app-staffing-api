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
  required: ['name'],
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
