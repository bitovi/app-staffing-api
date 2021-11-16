const { makeQueryStringFilters } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: { type: 'string', format: 'uuid' },
  name: {
    type: 'string',
    description: 'The name of the employee'
  },
  start_date: {
    type: 'string',
    description: 'The date the employee started their employment'
  },
  end_date: {
    type: 'string',
    description: 'The date the employee will or did end their employment'
  }
}

const name = 'employee'
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
  description: `retrieve an ${name} by id`,
  tags,
  summary: '',
  params: makeIdParams(name)
}
const create = {
  description: `create an ${name}`,
  tags,
  type: 'object',
  required: ['name'],
  body: {
    type: 'object',
    required: ['name']
  },
  properties,
  additionalProperties: false
}
const patch = {
  description: `patch an ${name}`,
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
