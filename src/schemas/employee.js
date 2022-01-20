const { makeQueryStringFilters, makeQueryStringFields } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: "The employee's unique identifier"
  },
  name: {
    type: 'string',
    description: 'The name of the employee'
  },
  start_date: {
    type: ['string', 'null'],
    description: 'The date the employee started their employment'
  },
  end_date: {
    type: ['string', 'null'],
    description: 'The date the employee will or did end their employment'
  },
  skills: {
    type: 'array',
    items: {
      type: 'object',
      required: [
        'id'
      ],
      properties: {
        id: {
          type: 'string',
          format: 'uuid'
        },
        name: {
          type: 'string'
        }
      },
      additionalProperties: false
    },
    uniqueItems: true
  }
}
const exampleGetResponse = {
  jsonapi: {
    version: '1.0'
  },
  links: {
    self: '/employees/03598cfb-6857-4c3e-99ec-9ee8f9e129d1'
  },
  data: {
    type: 'employees',
    id: '03598cfb-6857-4c3e-99ec-9ee8f9e129d1',
    attributes: {
      name: 'Carlee Luettgen',
      start_date: '2020-12-11T00:35:41.276Z',
      end_date: null
    }
  }
}
const exampleCreateResponse = {
  jsonapi: { version: '1.0' },
  links: { self: '/employees/6c0d8a4c-e8e2-4ce9-96b2-04a81a91c1cd' },
  data: {
    type: 'employees',
    id: '6c0d8a4c-e8e2-4ce9-96b2-04a81a91c1cd',
    attributes: { name: 'Donnie Larson' }
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
    type: 'object',
    required: ['name'],
    properties,
    additionalProperties: false,
    example: { data: { type: 'employees', attributes: { name: 'Donnie Larson' } } }
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
  description: `patch an ${name}`,
  summary: `patch an ${name}`,
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
