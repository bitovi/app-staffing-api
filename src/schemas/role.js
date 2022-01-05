const { makeQueryStringFilters, makeQueryStringFields } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: "The role's unique identifier"
  },
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
const exampleGetResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '/roles/c0d1f6ad-1c39-4ebd-bdb8-38723886def2'
  },
  data: {
    type: 'roles',
    id: 'c0d1f6ad-1c39-4ebd-bdb8-38723886def2',
    attributes: {
      start_date: '2021-11-24T04:22:04.193Z',
      start_confidence: 1,
      end_date: '2022-05-31T20:56:23.731Z',
      end_confidence: 9,
      project_id: '0b3aabce-b783-4169-bdeb-b342fc4fc70a'
    }
  }
}
const exampleCreateResponse = {
  jsonapi: { version: '1.0' },
  links: { self: '/roles/1b083dce-51e4-4d3b-9412-f113a259bf50' },
  data: {
    type: 'roles',
    id: '1b083dce-51e4-4d3b-9412-f113a259bf50',
    attributes: { project_id: '62171769-871a-403c-b5c8-a47b93e5999a' }
  }
}
const name = 'role'
const tags = [name]

const list = {
  description: `retrieve a list of ${name}s`,
  summary: `retrieve a list of ${name}s`,
  tags,
  querystring: {
    type: 'object',
    properties: {
      ...queryStringSchema.common,
      ...makeQueryStringFilters(properties),
      ...makeQueryStringFields(name)
    }
  }
}
const get = {
  description: `retrieve a ${name} by id`,
  summary: `retrieve a ${name} by id`,
  tags,
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {},
      example: exampleGetResponse
    },
    404: {
      description: 'Not Found',
      type: 'object',
      properties: {}
    }
  }
}
const create = {
  description: `create a ${name}`,
  summary: `create a ${name}`,
  tags,
  body: {
    type: 'object',
    required: ['project_id'],
    properties,
    additionalProperties: false,
    example: {
      data: {
        type: 'roles',
        attributes: { project_id: '62171769-871a-403c-b5c8-a47b93e5999a' }
      }
    }
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {},
      example: exampleCreateResponse
    }
  }
}
const patch = {
  description: `patch a ${name}`,
  summary: `patch a ${name}`,
  tags,
  body: {
    type: 'object',
    properties,
    additionalProperties: false
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
  list,
  get,
  create,
  patch,
  remove
}
