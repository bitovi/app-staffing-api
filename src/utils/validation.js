const { ValidationError } = require('objection')

// Throws 403 if start_date is after end_date
const validateStartDate = async (request, reply, done) => {
  if (request.body.end_date !== null && request.body.start_date > request.body.end_date) {
    return reply.status(403).send('Start date is after end date')
  }
}

const validateAssignmentPost = async (body, trx) => {
  const Assignment = require('../models/assignment')
  let data
  if (body.end_date) {
    data = await Assignment.query(trx)
      .where('employee_id', '=', body.employee.id)
      .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [body.start_date, body.end_date])
      .forUpdate()
  } else { // If end_date is entered is blank or null
    data = await Assignment.query(trx)
      .where('employee_id', '=', body.employee.id)
      // add infinity instead of interval INF
      .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
      .forUpdate()
  }
  // If returned data is not empty throw 403
  if (data.length > 0) {
    throw new ValidationError({
      message: 'Employee already assigned',
      type: 'ModelValidation',
      statusCode: 403,
      data: ''
    })
  }
}

const validateAssignmentPatch = async (body, trx) => {
  const Assignment = require('../models/assignment')
  let data
  if (body.end_date) {
    data = await Assignment.query(trx)
      .where('employee_id', '=', body.employee.id)
      .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [body.start_date, body.end_date])
      .forUpdate()
    console.log(data)
  } else { // If end_date is entered is blank or null
    data = await Assignment.query(trx)
      .where('employee_id', '=', body.employee.id)
      .andWhereRaw('(?, \'infinity\') OVERLAPS ("start_date", "end_date")', body.start_date)
      .forUpdate()
  }
  data = data.filter(e => e.id !== body.id)
  // If data is not empty throw 403 ValidateError
  if (data.length > 0) {
    throw new ValidationError({
      message: 'Employee already assigned',
      type: 'ModelValidation',
      statusCode: 403,
      data: ''
    })
  }
}

module.exports = {
  validateStartDate,
  validateAssignmentPost,
  validateAssignmentPatch
}
