const { Model, ValidationError } = require('objection')
const Project = require('./project')
const { validateStartDate } = require('../utils/validation')

module.exports = class Assignment extends Model {
  static get tableName () {
    return 'assignment'
  }

  // check start date validation
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
    await super.$beforeInsert(queryContext)
    const trx = queryContext.transaction

    let data
    if (this.end_date) {
      data = await Assignment.query(trx)
        .where('employee_id', '=', this.employee_id)
        .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [this.start_date, this.end_date])
        .forUpdate()
    } else { // If end_date is entered is blank or null
      data = await Assignment.query(trx)
        .where('employee_id', '=', this.employee_id)
        // add infinity instead of interval INF
        .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', this.start_date)
        .forUpdate()
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

  async $beforeUpdate (op, queryContext) {
    await super.$beforeInsert(queryContext)
    validateStartDate(this)
    const trx = queryContext.transaction

    let data
    if (this.end_date) {
      data = await Assignment.query(trx)
        .where('employee_id', '=', this.employee_id)
        .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [this.start_date, this.end_date])
      // .forUpdate()
    } else { // If end_date is entered is blank or null
      data = await Assignment.query(trx)
        .where('employee_id', '=', this.employee_id)
        // add infinity instead of interval INF
        .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', this.start_date)
    }
    // if (this.employee) { console.log(this.employee) }
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
