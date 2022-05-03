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
      if (body.end_date) {
        data = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")',
            [body.start_date, body.end_date])
          .forUpdate()
      } else { // If end_date is entered is blank or null
        data = await Assignment.query(trx)
          .where('employee_id', '=', body.employee_id)
          .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
          .forUpdate()
      }
    } catch (e) {
      trx.rollback()
    }
    if (body.id) {
      data = data.filter(e => e.id !== body.id)
    }
    if (data.length > 0) {
      trx.rollback()
      throw new ValidationError({
        message: 'Employee already assigned',
        type: 'ModelValidation',
        statusCode: 409,
        data: ''
      })
    }
    // Check for DB lock
    // else {
    //   await Assignment.query(trx).where('employee_id', '=', body.employee_id)
    //     .timeout(999999999999999)
    // }
  }

  async validateRoleOverlap (body) {
    const role = await Role.query().findById(body.role_id).select('start_date', 'end_date')
    const assignmentStart = new Date(body.start_date)
    const assignmentEnd = new Date(body.end_date)
    if ((assignmentStart < role.start_date || assignmentEnd > role.end_date) ||
      (body.end_date === null && (assignmentStart < role.start_date || assignmentStart > role.end_date))) {
      throw new ValidationError({
        message: 'Assignment not in date range of role',
        type: 'ModelValidation',
        statusCode: 409,
        data: ''
      })
    }
  }
}
