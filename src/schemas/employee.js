const { makeQueryStringFilters, makeQueryStringFields, parseErrorExamples } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')
const employee = require('./examples/employee')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: "The employee's unique identifier",
    example: 'eebe4834-9a2c-429a-83ee-a86e8ee3077d'
  },
  name: {
    type: 'string',
    description: 'The name of the employee',
    example: 'John Doe'
  },
  start_date: {
    type: ['string', 'null'],
    description: 'The date the employee started their employment',
    example: '2022-01-01T05:00:00.000Z'
  },
  end_date: {
    type: ['string', 'null'],
    description: 'The date the employee will or did end their employment',
    example: '2022-03-01T05:00:00.000Z'
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
          example: 'febe4834-9a2c-429a-83ee-a86e8ee3077e'
        },
        name: {
          type: 'string',
          description: 'name of the skill',
          example: 'JavaScript'
        }
      },
      additionalProperties: false
    },
    uniqueItems: true
  }
}

const name = 'employee'
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
      example: employee.response.list[200]
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
      example: employee.response.get[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found', example: employee.response.get[404] })
  }
}
const create = {
  description: `create an ${name}`,
  summary: `create an ${name}`,
  tags,
  body: {
    type: 'object',
    required: ['name'],
    properties,
    additionalProperties: false,
    example: employee.request.create
  },
  response: {
    default: {
      description: 'Success: Object created and returned',
      type: 'object',
      example: employee.response.create[201]
    },
    409: parseErrorExamples({ description: 'Error: Conflict', example: employee.response.create[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: employee.response.create[422] })
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
    example: employee.request.patch
  },
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: employee.response.patch[200]
    },
    409: parseErrorExamples({ description: 'Error: Conflict', example: employee.response.patch[409] }),
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: employee.response.patch[422] })
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
    404: parseErrorExamples({ description: 'Error: Not Found', example: employee.response.remove[404] })
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
