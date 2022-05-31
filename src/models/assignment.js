const { Model } = require('objection')
const Project = require('./project')
const { validateStartDate } = require('../utils/validation')
const Role = require('./role')
const { statusCodes } = require('../managers/error-handler/constants')
const { ConflictError, ValidationError } = require('../managers/error-handler/errors')
const { compareDates } = require('../utils/date-utils')

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
    await super.$beforeInsert(queryContext)
    validateStartDate(this)
    await this.validateRoleOverlap(this)
    const trx = await Assignment.startTransaction()
    await this.validateAssignmentOverlap(this, trx)
    queryContext._resolveTransaction = trx
  }

  async $afterInsert (queryContext) {
    await super.$afterInsert(queryContext)
    await queryContext._resolveTransaction.commit()
  }

  async $beforeUpdate (opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    validateStartDate(this)
    await this.validateRoleOverlap(this)
    const trx = await Assignment.startTransaction()
    await this.validateAssignmentOverlap(this, trx)
    await trx.commit()
  }

  async validateAssignmentOverlap (body, trx) {
    let assignmentList
    try {
      await Assignment.query(trx)
        .where('employee_id', '=', body.employee_id)
        .forUpdate()
      if (body.end_date) {
        assignmentList = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")',
            [body.start_date, body.end_date])
      } else { // If end_date is entered is blank or null
        assignmentList = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
      }
      if (body.id) {
        assignmentList = assignmentList.filter(e => e.id !== body.id)
      }
      if (assignmentList.length > 0) {
        throw new Error('Overlap')
      }
    } catch (e) {
      await trx.rollback()
      throw new ValidationError({
        title: 'Employee already assigned',
        status: 409,
        pointer: 'employee/id'
      })
    }
  }

  async validateRoleOverlap (body) {
    const role = await Role.query()
      .findById(body.role_id)
      .select('start_date', 'end_date')
    if (!role) {
      throw new ConflictError({
        pointer: 'role/id'
      })
    }
    const assignmentStart = body.start_date
    const assignmentEnd = body.end_date
    const roleStart = role.start_date
    const roleEnd = role.end_date

    const assignmentStartBeforeRoleStart = compareDates(assignmentStart, roleStart)

    if (!assignmentEnd && !roleEnd && assignmentStartBeforeRoleStart) {
      throw new ValidationError({
        title: 'Assignment start date not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: 'start_date'
      })
    } else if (
      (assignmentEnd && (assignmentStartBeforeRoleStart || (roleEnd && compareDates(roleEnd, assignmentStart))))) {
      throw new ValidationError({
        title: 'Assignment start date not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: 'start_date'
      })
    } else if (!roleEnd && (assignmentStartBeforeRoleStart || compareDates(assignmentEnd, roleStart))) {
      throw new ValidationError({
        title: 'Assignment dates are before role start date',
        status: statusCodes.CONFLICT,
        pointer: assignmentStartBeforeRoleStart ? 'start_date' : 'end_date'
      })
    } else if ((assignmentEnd && roleEnd) &&
      (assignmentStartBeforeRoleStart || compareDates(roleEnd, assignmentEnd))) {
      throw new ValidationError({
        title: 'Assignment not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: assignmentStartBeforeRoleStart ? 'start_date' : 'end_date'
      })
    }
  }
}
