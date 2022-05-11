const omit = require('lodash/omit')
const { makeQueryStringFilters, makeQueryStringFields, parseErrorExamples } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')
const role = require('./examples/role')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: "The role's unique identifier",
    example: '5d8e8a7e-e8e3-4d8e-b3d7-8e4b50e36b1c'
  },
  start_date: {
    type: 'string',
    description: 'The date the role starts',
    example: '2022-01-01T05:00:00.000Z'
  },
  start_confidence: {
    type: 'number',
    description:
      'A floating point number representing percentage likelihood of the start date',
    minimum: 0,
    maximum: 1,
    example: 0.5
  },
  end_date: {
    type: ['string', 'null'],
    description: 'The date the role ends',
    example: '2022-04-01T05:00:00.000Z'
  },
  end_confidence: {
    type: ['number', 'null'],
    description:
      'A floating point number representing percentage likelihood of the end date',
    minimum: 0,
    maximum: 1,
    example: 0.5
  },
  project_id: {
    type: 'string',
    format: 'uuid',
    example: '5d8e8a7e-e8e3-4d8e-b3d7-8e4b50e36b1c'
  },
  project: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '5d8e8a7e-e8e3-4d8e-b3d7-8e4b50e36b1c'
      }
    },
    description: 'the assigned project'
  },
  skills: {
    type: 'array',
    items: {
      type: 'object',
      required: ['id'],
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          example: '5d8e8a7e-e8e3-4d8e-b3d7-8e4b50e36b1c'
        },
        name: {
          type: 'string',
          example: 'JavaScript'
        }
      },
      additionalProperties: false
    },
    uniqueItems: true
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
      ...makeQueryStringFilters(omit(properties, ['project', 'skills'])),
      ...makeQueryStringFields(name)
    }
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: role.response.list[200]
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
      example: role.response.get[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found', example: role.response.get[404] })
  }
}
const create = {
  description: `create a ${name}`,
  summary: `create a ${name}`,
  tags,
  body: {
    type: 'object',
    required: ['start_date', 'start_confidence', 'project'],
    properties: omit(properties, ['project_id']),
    additionalProperties: false,
    example: role.request.create
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: role.response.create[201]
    },
    409: parseErrorExamples({ description: 'Error: Conflict', example: role.response.create[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: role.response.create[422] })
  }
}
const patch = {
  description: `patch a ${name}`,
  summary: `patch a ${name}`,
  tags,
  body: {
    type: 'object',
    properties: omit(properties, ['project_id']),
    additionalProperties: false,
    example: role.request.patch
  },
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: role.response.patch[200]
    },
    409: parseErrorExamples({ description: 'Error: Conflict', example: role.response.patch[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: role.response.patch[422] })
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
    404: parseErrorExamples({ description: 'Error: Not Found', example: role.response.remove[404] })
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
