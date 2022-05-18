const { statusCodes, codes } = require('../managers/error-handler/constants')

const errorSchema = {
  status: {
    type: 'string',
    description: 'error status code',
    enum: Object.values(statusCodes),
    example: statusCodes.BAD_REQUEST
  },
  code: {
    type: 'string',
    description: 'error key',
    enum: Object.values(codes),
    example: 'invalid-parameter'
  },
  title: {
    type: 'string',
    description: 'error title',
    example: 'Invalid parameter'
  },
  detail: {
    type: 'string',
    description: 'error detail',
    example: 'Invalid parameter type'
  },
  source: {
    type: 'object',
    description: 'error source',
    properties: {
      pointer: {
        type: 'string',
        description: 'error path',
        example: '/data/skills/id'
      },
      parameter: {
        type: 'string',
        description: 'error parameter',
        example: 'start_date'
      }
    }
  }
}

module.exports = errorSchema
