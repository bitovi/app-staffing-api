const { Model } = require('objection')
const { validateStartDate } = require('../utils/validation')

module.exports = class Employee extends Model {
  static get tableName () {
    return 'employee'
  }

  static get idColumn () {
    return 'id'
  }

  static get relationMappings () {
    const Assignment = require('./assignment')
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
      }
    }
  }

  async $beforeInsert (queryContext) {
    validateStartDate(this)
  }

  async $beforeUpdate (opt, queryContext) {
    validateStartDate(this)
  }
}
