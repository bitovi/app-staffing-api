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
        project_id: { type: 'string' }
      }
    }
  }

  static get relationMappings () {
    const Assignment = require('./assignment')
    const Employee = require('./employee')

    return {
      assignments: {
        relation: Model.HasManyRelation,
        modelClass: Assignment,
        join: {
          from: 'role.id',
          to: 'assignment.role_id'
        }
      },
      employees: {
        relation: Model.ManyToManyRelation,
        modelClass: Employee,
        join: {
          from: 'role.id',
          through: {
            from: 'assignment.role_id',
            to: 'assignment.employee_id'
          },
          to: 'employee.id'
        }
      }
    }
  }
}

module.exports = Role
