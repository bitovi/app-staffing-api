const { makeQueryStringFilters, makeQueryStringFields } = require('../utils')
const queryStringSchema = require('./query-string')
const { makeIdParams } = require('./params')

const properties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: 'the id of the assignment'
  },
  start_date: {
    type: 'string',
    description: 'the date-time the employee will begin this assignment'
  },
  end_date: {
    type: ['string', 'null'],
    description: 'the expected date-time the employee will end this assignment'
  },
  employee: {
    type: 'object',
    required: ['id'],
    properties: {
      id: {
        type: 'string',
        format: 'uuid'
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
        format: 'uuid'
      }
    },
    description: 'the associated role'
  }
}
const propertiesWithId = {
  id: { type: 'string', format: 'uuid' }
}
const exampleResponse = {
  jsonapi: { version: '1.0' },
  links: { self: '/assignments/df72f187-70f4-4f3d-a59d-b049353ecafa' },
  data: {
    type: 'assignments',
    id: 'df72f187-70f4-4f3d-a59d-b049353ecafa',
    attributes: {
      start_date: '2022-03-13T20:06:42.426Z',
      employee: {
        id: '12bd4444-1d14-46eb-b94e-2b024b4922f7',
        name: 'Dalton Powlowski',
        start_date: '2022-01-09T18:36:26.197Z',
        end_date: null
      },
      role: {
        id: '77328e0e-5d71-4b3e-924b-2b1f7915309d',
        start_date: '2022-02-09T03:35:53.557Z',
        start_confidence: 10,
        end_date: '2022-04-27T11:14:53.704Z',
        end_confidence: 4,
        project_id: 'df1a26bb-7154-4f3d-a838-b6dd3e196d90'
      },
      role_id: '77328e0e-5d71-4b3e-924b-2b1f7915309d',
      employee_id: '12bd4444-1d14-46eb-b94e-2b024b4922f7'
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
      example: exampleResponse
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
    required: ['employee', 'role', 'start_date'],
    properties,
    additionalProperties: false
  },
  response: {
    default: {
      description: 'Success: Object created and returned',
      type: 'object',
      properties: {},
      example: exampleResponse
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
  },
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
