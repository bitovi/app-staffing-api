const { Model } = require('objection')

class Role extends Model {
  static get tableName () {
    return 'role'
  }

  static get idColumn () {
    return 'id'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['id', 'project_id'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        start_date: { type: 'date' },
        start_confidence: { type: 'integer' },
        end_date: { type: 'date' },
        end_confidence: { type: 'integer' },
        product_id: { type: 'integer' }
      }
    }
  }
}

module.exports = Role
