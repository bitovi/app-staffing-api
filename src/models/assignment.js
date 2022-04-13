const { Model, ValidationError } = require('objection')
const Project = require('./project')
const { validateStartDate } = require('../utils/validation')

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
    await Assignment.transaction(async trx => {
      await this.validateAssignmentOverlap(this, trx)
    })
  }

  async $beforeUpdate (op, queryContext) {
    await super.$beforeUpdate(op, queryContext)
    validateStartDate(this)
    await Assignment.transaction(async trx => {
      await this.validateAssignment(this, trx)
    })
  }

  async validateAssignmentOverlap (body, trx) {
    const Assignment = require('../models/assignment')
    let data
    if (body.end_date) {
      data = await Assignment.query(trx)
        .where('employee_id', '=', body.employee_id)
        .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [body.start_date, body.end_date])
        .forUpdate()
    } else { // If end_date is entered is blank or null
      data = await Assignment.query(trx)
        .where('employee_id', '=', body.employee_id)
        .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
        .forUpdate()
    }
    if (body.id) {
      data = data.filter(e => e.id !== body.id)
    }
    if (data.length > 0) {
      throw new ValidationError({
        message: 'Employee already assigned',
        type: 'ModelValidation',
        statusCode: 409,
        data: ''
      })
    }
  }
}
