const { makeQueryStringFilters, makeQueryStringFields, parseErrorExamples } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')
const skill = require('./examples/skill')

const properties = {
  id: { type: 'string', format: 'uuid' },
  name: {
    type: 'string',
    description: 'The name of the skill'
  }
}
const exampleGetResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '/skills/20b853c7-2747-4c2d-8659-fa0777ab4d64'
  },
  data: {
    type: 'skills',
    id: '20b853c7-2747-4c2d-8659-fa0777ab4d64',
    attributes: {
      name: 'mobile.js'
    }
  }
}
const exampleCreateResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '',
    first: '?',
    prev: '?'
  },
  data: {
    type: 'skills',
    id: 'b691fad7-27ba-4d40-9545-cecca582b9a8',
    attributes: {
      name: 'example skill'
    }
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
      ...makeQueryStringFilters(properties),
      ...makeQueryStringFields(name)
    }
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: skill.response.list[200]
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
      example: exampleGetResponse
    },
    404: parseErrorExamples({ description: 'Error: Not Found' })
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
    example: skill.request.create
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      properties: {},
      example: exampleCreateResponse
    },
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity' })
  }
}
const patch = {
  description: `patch a ${name}`,
  summary: `patch a ${name}`,
  tags,
  body: {
    type: 'object',
    properties,
    additionalProperties: false,
    example: skill.request.patch
  },
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: skill.response.patch[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found' }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity' })
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
      type: 'object'
    },
    404: parseErrorExamples({ description: 'Error: Not Found' })
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
