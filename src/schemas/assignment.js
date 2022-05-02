const { makeQueryStringFilters, makeQueryStringFields, parseErrorExamples } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')
const assignment = require('./examples/assignment')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: 'the id of the assignment',
    example: 'e7c6d8f0-c8e0-4b3b-b8b1-f8b9b8f8d8b9'
  },
  start_date: {
    type: 'string',
    description: 'the date-time the employee will begin this assignment',
    example: '2020-01-01T00:00:00.000Z'
  },
  end_date: {
    type: ['string', 'null'],
    description: 'the expected date-time the employee will end this assignment',
    example: '2020-03-01T00:00:00.000Z'
  },
  employee: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: '1a23c10a-6df4-4f69-9518-e1e124e7fe1d'
      }
    },
    description: 'the assigned employee'
  },
  role: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid',
        example: 'eebe4834-9a2c-429a-83ee-a86e8ee3077d'
      }
    },
    description: 'the associated role'
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
      ...makeQueryStringFilters(properties),
      ...makeQueryStringFields(name)
    }
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: assignment.response.list[200]
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
      example: assignment.response.get[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found' })
  }
}
const create = {
  description: `create an ${name}`,
  summary: `create an ${name}`,
  tags,
  body: {
    type: 'object',
    required: ['employee', 'role', 'start_date'],
    properties,
    additionalProperties: false,
    example: assignment.request.create
  },
  response: {
    default: {
      description: 'Success: Object created and returned',
      type: 'object',
      example: assignment.response.create[201]
    },
    403: parseErrorExamples({ description: 'Error: Forbidden' }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity' }),
    500: parseErrorExamples({ description: 'Error: Internal Server Error' })
  }
}
const patch = {
  description: `patch an ${name}`,
  summary: `patch an ${name}`,
  tags,
  body: {
    type: 'object',
    properties,
    additionalProperties: false,
    example: assignment.request.patch
  },
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: assignment.response.patch[200]
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
  propertiesWithId,
  list,
  get,
  create,
  patch,
  remove
}
