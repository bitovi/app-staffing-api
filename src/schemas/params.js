module.exports = {
  makeIdParams (name) {
    return {
      type: 'object',
      properties: {
        id: {
          type: 'string',
          format: 'uuid',
          description: `the ${name}'s unique identifier`
        }
      }
    }
  }
}
