module.exports = {
  makeIdParams (name) {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: `the ${name}'s unique identifier`,
          example: 'df72f187-70f4-4f3d-a59d-b049353ecafa'
        }
      }
    }
  }
}
