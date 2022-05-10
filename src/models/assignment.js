const { Model, ValidationError } = require('objection')
const Project = require('./project')
const { validateStartDate } = require('../utils/validation')
const Role = require('./role')

module.exports = class Assignment extends Model {
  static get tableName () {
    return 'assignment'
  }

  static get relationMappings () {
    const Role = require('./role')
    const Employee = require('./employee')

    return {
      role: {
        relation: Model.BelongsToOneRelation,
        modelClass: Role,
        join: {
          from: 'assignment.role_id',
          to: 'role.id'
        }
      },
      employee: {
        relation: Model.BelongsToOneRelation,
        modelClass: Employee,
        join: {
          from: 'assignment.employee_id',
          to: 'employee.id'
        }
      },
      projects: {
        relation: Model.ManyToManyRelation,
        modelClass: Project,
        join: {
          from: 'assignment.role_id',
          through: {
            from: 'role.id',
            to: 'role.project_id'
          },
          to: 'project.id'
        }
      }
    }
  }

  async $beforeInsert (queryContext) {
    validateStartDate(this)
    await this.validateRoleOverlap(this)
  }

  async $beforeUpdate (opt, queryContext) {
    validateStartDate(this)
    await this.validateRoleOverlap(this)
  }

  async validateRoleOverlap (body) {
    const role = await Role.query().findById(body.role_id).select('start_date', 'end_date')
    const assignmentStart = new Date(body.start_date)
    const assignmentEnd = new Date(body.end_date)
    /*
    This if statement checks for the following scenarios:
    1. If there is no end date in assignment and the assignment start date is outside of the role's start and end date
    2. If there is no end date in role and the assignment start or end date is before the role's start date
    3. If both the role and assignment end date are not null and assignment start is before role start or assignment end is after role end
     If any of these scenarios are true, throw a Validation Error
     */
    if (
      // 1
      (body.end_date === null && (assignmentStart < role.start_date || assignmentStart > role.end_date)) ||
      // 2
      (role.end_date === null && (assignmentStart < role.start_date || assignmentEnd < role.start_date)) ||
      // 3
      ((body.end_date !== null && role.end_date !== null) &&
        (assignmentStart < role.start_date || assignmentEnd > role.end_date))) {
      throw new ValidationError({
        message: 'Assignment not in date range of role',
        type: 'ModelValidation',
        statusCode: 409
      })
    }
  }
}
