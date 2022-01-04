const { makeQueryStringFilters, makeQueryStringFields } = require('../utils')
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
  end_date: {
    type: 'string',
    description: 'The date the project ends'
  }
}

const exampleGetResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '/projects/0b3aabce-b783-4169-bdeb-b342fc4fc70a'
  },
  data: {
    type: 'projects',
    id: '0b3aabce-b783-4169-bdeb-b342fc4fc70a',
    attributes: {
      name: 'Yum Project X',
      end_date: '2021-11-24T18:29:51.833Z'
    }
  }
}
const exampleCreateResponse = {
  jsonapi: { version: '1.0' },
  links: { self: '/projects/1ff5d9a0-b814-4790-b3ee-43aaf2d753f3' },
  data: {
    type: 'projects',
    id: '1ff5d9a0-b814-4790-b3ee-43aaf2d753f3',
    attributes: { name: 'Yum Project X' }
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
    required: ['name'],
    properties,
    additionalProperties: false,
    example: {
      data: {
        type: 'projects',
        attributes: { name: 'Kathleen Lehner' }
      }
    }
  },
  errorMessage: {
    required: {
      name: 'name is required'
    }
  },
  response: {
    default: {
      description: 'Success: Object created and returned',
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
