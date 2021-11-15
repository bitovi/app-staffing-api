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
    const Project = require('./project')
    const Employee = require('./employee')
    const Skill = require('./skill')

    return {
      assignments: {
        relation: Model.HasManyRelation,
        modelClass: Assignment,
        join: {
          from: 'role.id',
          to: 'assignment.role_id'
        }
      },
      projects: {
        relation: Model.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'role.project_id',
          to: 'project.id'
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
          from: 'role.id',
          through: {
            from: 'role__skill.role_id',
            to: 'role__skill.skill_id'
          },
          to: 'skill.id'
        }
      }
    }
  }
}

module.exports = Role
