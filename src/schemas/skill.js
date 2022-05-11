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
      example: skill.response.get[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found', example: skill.response.get[404] })
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
      example: skill.response.create[201]
    },
    409: parseErrorExamples({ description: 'Error: Conflict', example: skill.response.create[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: skill.response.create[422] })
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
    409: parseErrorExamples({ description: 'Error: Conflict', example: skill.response.patch[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: skill.response.patch[422] })
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
    404: parseErrorExamples({ description: 'Error: Not Found', example: skill.response.remove[404] })
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
