const { Model } = require('objection')

module.exports = class Skill extends Model {
  static get tableName () {
    return 'skill'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name'],

      properties: {
        id: {
          type: 'string'
        },
        name: {
          type: 'string'
        }
      },
      additionalProperties: false
    }
  }
}
