const { makeQueryStringFilters, makeQueryStringFields, parseErrorExamples } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')
const project = require('./examples/project')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    example: '5d8e8a7e-e8e3-4d8e-b3d7-8e4b50e36b1c'
  },
  name: {
    type: 'string',
    description: 'The name of the project',
    example: 'Staffing App'
  },
  description: {
    type: 'string',
    description: 'The project description',
    example: 'A project to manage the staffing of a company'
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
  },
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: project.response.list[200]
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
      example: project.response.get[200]
    },
    404: parseErrorExamples({ description: 'Error: Not Found', example: project.response.get[404] })
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
    example: project.request.create
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
      example: project.response.create[201]
    },
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: project.response.create[422] })
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
    example: project.request.patch
  },
  params: makeIdParams(name),
  response: {
    default: {
      description: 'Default response',
      type: 'object',
      example: project.response.patch[200]
    },
    422: parseErrorExamples({ description: 'Error: Unprocessable Entity', example: project.response.patch[422] })
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
      type: 'object'
    },
    404: parseErrorExamples({ description: 'Error: Not Found', example: project.response.remove[404] })
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
