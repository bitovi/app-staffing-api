const { makeQueryStringFilters, makeQueryStringFields } = require('../utils')
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
const exampleGetResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '/assignments/3c8d4eef-3725-491e-b4ae-f70ea338892c'
  },
  data: {
    type: 'assignments',
    id: '3c8d4eef-3725-491e-b4ae-f70ea338892c',
    attributes: {
      employee_id: '03598cfb-6857-4c3e-99ec-9ee8f9e129d1',
      role_id: 'c0d1f6ad-1c39-4ebd-bdb8-38723886def2',
      start_date: '2021-11-23T23:09:35.922Z',
      end_date: '2022-05-20T22:14:07.069Z'
    }
  }
}
const exampleCreateResponse = {
  jsonapi: { version: '1.0' },
  links: { self: '/assignments/5a421587-f7ee-49dd-9a8d-255c3a3f63b3' },
  data: {
    type: 'assignments',
    id: '5a421587-f7ee-49dd-9a8d-255c3a3f63b3',
    attributes: {
      employee_id: '685eeb8d-74b2-4be9-8a62-984374367763',
      role_id: 'e2ac77b7-2186-410e-9013-20b6778bc0b6',
      start_date: '2021-07-23T14:36:23.589Z'
    }
  }
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
  description: `create an ${name}`,
  summary: `create an ${name}`,
  tags,
  body: {
    properties,
    type: 'object',
    required: ['employee_id', 'role_id', 'start_date'],
    example: {
      data: {
        type: 'assignments',
        attributes: {
          employee_id: '6bae7e59-7317-4b37-b615-77db7d971f1f',
          role_id: '2855162e-aa10-4c96-bc4b-49d001a82116',
          start_date: '2021-03-14T06:46:54.745Z'
        }
      }
    }
  },
  additionalProperties: false,
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
