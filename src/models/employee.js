const { Model } = require('objection')

module.exports = class Employee extends Model {
  static get tableName () {
    return 'employee'
  }

  static get jsonSchema () {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' }
      }
    }
  }

  static get relationMappings () {
    const Assignment = require('./assignment')
    const Role = require('./role')
    const Skill = require('./skill')

    return {
      skills: {
        relation: Model.ManyToManyRelation,
        modelClass: Skill,
        join: {
          from: 'employee.id',
          through: {
            from: 'employee__skill.employee_id',
            to: 'employee__skill.skill_id'
          },
          to: 'skill.id'
        }
      },
      assignments: {
        relation: Model.HasManyRelation,
        modelClass: Assignment,
        join: {
          from: 'employee.id',
          to: 'assignment.employee_id'
        }
      },
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'employee.id',
          through: {
            from: 'assignment.employee_id',
            to: 'assignment.role_id'
          },
          to: 'role.id'
        }
      }
    }
  }
}
