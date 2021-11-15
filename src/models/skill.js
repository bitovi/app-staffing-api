const { Model } = require('objection')
const Role = require('./role')
const Employee = require('./employee')

module.exports = class Skill extends Model {
  static get tableName () {
    return 'skill'
  }

  static get relationMappings () {
    return {
      roles: {
        relation: Model.ManyToManyRelation,
        modelClass: Role,
        join: {
          from: 'skill.id',
          through: {
            from: 'role__skill.skill_id',
            to: 'role__skill.role_id'
          },
          to: 'role.id'
        }
      },
      employees: {
        relation: Model.ManyToManyRelation,
        modelClass: Employee,
        join: {
          from: 'skill.id',
          through: {
            from: 'employee__skill.skill_id',
            to: 'employee__skill.employee_id'
          },
          to: 'employee.id'
        }
      }
    }
  }
}
