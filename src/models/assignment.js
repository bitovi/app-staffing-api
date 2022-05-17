const { Model } = require('objection')
const Project = require('./project')
const { validateStartDate } = require('../utils/validation')
const Role = require('./role')
const { statusCodes } = require('../managers/error-handler/constants')
const { ConflictError, ValidationError } = require('../managers/error-handler/errors')

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
    queryContext._resoloveTransaction = trx
  }

  async $afterInsert (queryContext) {
    await super.$afterInsert(queryContext)
    await queryContext._resoloveTransaction.commit()
  }

  async $beforeUpdate (opt, queryContext) {
    await super.$beforeUpdate(opt, queryContext)
    validateStartDate(this)
    await this.validateRoleOverlap(this)
    const trx = await Assignment.startTransaction()
    await this.validateAssignmentOverlap(this, trx)
    queryContext._resoloveTransaction = trx
  }

  async $afterUpdate (opt, queryContext) {
    await super.$afterUpdate(opt, queryContext)
    await queryContext._resoloveTransaction.commit()
  }

  async validateAssignmentOverlap (body, trx) {
    let data
    try {
      Assignment.query(trx)
        .where('employee_id', '=', body.employee_id)
        .forUpdate()
      if (body.end_date) {
        data = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")',
            [body.start_date, body.end_date])
      } else { // If end_date is entered is blank or null
        data = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
          .forUpdate()
      }
    } catch (e) {
      await trx.rollback()
    }
    if (body.id) {
      data = data.filter(e => e.id !== body.id)
    }
    if (data.length > 0) {
      await trx.rollback()
      throw new ValidationError({
        title: 'Employee already assigned',
        status: 409,
        pointer: 'employee/id'
      })
    }
    // Check for DB deadlock
    // else {
    //   await Assignment.query(trx).where('employee_id', '=', body.employee_id)
    //     .timeout(999999999999999)
    // }
  }

  async validateRoleOverlap (body) {
    const role = await Role.query()
      .findById(body.role_id)
      .select('start_date', 'end_date')
    const assignmentStart = new Date(body.start_date)
    const assignmentEnd = new Date(body.end_date)

    if (!role) {
      throw new ConflictError({
        pointer: 'role/id'
      })
    }

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
        title: 'Assignment not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: 'start_date'
      })
    }
  }
}
