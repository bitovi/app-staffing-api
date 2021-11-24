const { makeQueryStringFilters } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: 'the id of the assignment'
  },
  employee_id: {
    type: 'string',
    format: 'uuid',
    description: 'the id of the assigned employee'
  },
  role_id: {
    type: 'string',
    format: 'uuid',
    description: 'the id of the associated role'
  },
  start_date: {
    type: 'string',
    // format: 'date-time',
    description: 'the date-time the employee will begin this assignment'
  },
  end_date: {
    type: 'string',
    // format: 'date-time',
    description: 'the expected date-time the employee will end this assignment'
  }
}
const propertiesWithId = {
  id: { type: 'string', format: 'uuid' }
}

const name = 'assignment'
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
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {}
    }
  }
}
const get = {
  description: `retrieve an ${name} by id`,
  summary: `retrieve an ${name} by id`,
  tags,
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {}
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: {}
    }
  }
}
const create = {
  description: `create an ${name}`,
  summary: `create an ${name}`,
  tags,
  body: {
    properties,
    type: 'object',
    required: ['employee_id', 'role_id', 'start_date']
  },
  additionalProperties: false,
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {}
    }
  }
}
const patch = {
  description: `patch an ${name}`,
  summary: `patch an ${name}`,
  tags,
  type: 'object',
  body: { properties },
  additionalProperties: false,
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {}
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: {}
    }
  }
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
  propertiesWithId,
  list,
  get,
  create,
  patch,
  remove
}
