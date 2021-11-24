const { makeQueryStringFilters } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: {
    type: 'string',
    format: 'uuid'
  },
  name: {
    type: 'string',
    description: 'The name of the project'
  },
  start_date: {
    type: 'string',
    description: 'The date the project begins'
  },
  end_date: {
    type: 'string',
    description: 'The date the project ends'
  }
}

const name = 'project'
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
    required: ['name', 'start_date']
  },
  errorMessage: {
    required: {
      name: 'name is required',
      age: 'start_date is required'
    }
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
  description: `delete a ${name}`,
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
