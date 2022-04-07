const { ValidationError } = require('objection')

const validateStartDate = (body) => {
  if (body.end_date !== null && body.start_date > body.end_date) {
    throw new ValidationError({
      message: 'startDate is after endDate',
      type: 'ModelValidation',
      statusCode: 409,
      data: ''
    })
  }
}

const validateAssignmentOverlap = async (body, trx) => {
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

module.exports = {
  validateStartDate,
  validateAssignmentOverlap
}
