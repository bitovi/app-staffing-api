const { Model } = require('objection')

class Role extends Model {
  static get tableName () {
    return 'role'
  }

  static get idColumn () {
    return 'id'
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
