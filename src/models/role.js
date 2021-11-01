const { Model } = require('objection')
const Skill = require('./skill')

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
      required: ['project_id'],
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
      },
      skills: {
        relation: Model.ManyToManyRelation,
        modelClass: Skill,
        join: {
          from: 'skill.id',
          through: {
            from: 'role__skill.role_id',
            to: 'role__skill.skill_id'
          },
          to: 'role.id'
        }
      }
    }
  }
}

module.exports = Role
