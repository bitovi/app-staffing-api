class ValidateError extends Error {
  constructor (message, code) {
    super(message)
    this.statusCode = code
  }
}
// Throws 403 if start_date is after end_date
const checkStartDate = async (request, reply, done) => {
  if (request.body.end_date !== null && request.body.start_date > request.body.end_date) {
    return reply.status(403).send('Start date is after end date')
  }
}
const validateDateOverlap = async (request, trx) => {
  const Assignment = require('../models/assignment')
  const body = request.body
  let data
  let model
  let matchingCriteria
  let bodyMatchingCriteria

  if (request.url.includes('/assignments')) {
    model = Assignment
    matchingCriteria = 'employee_id'
    bodyMatchingCriteria = body.employee.id
  } else {
    // return empty object to continue method function in handler
    return Object
  }
  if (body.end_date) {
    data = await model.query(trx)
      .where(matchingCriteria, '=', bodyMatchingCriteria)
      .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [body.start_date, body.end_date])
      .forUpdate()
  } else { // If end_date is entered is blank or null
    data = await model.query(trx)
      .where(matchingCriteria, '=', bodyMatchingCriteria)
      .andWhereRaw('(?, INTERVAL \'10 hour\') OVERLAPS ("start_date", "end_date")', body.start_date)
      .forUpdate()
  }
  // Remove current record from 'data'
  if (request.method === 'PATCH') {
    data = data.filter(e => e.id !== request.params.id)
  }
  // If data is not empty throw 403 ValidateError
  if (data.length > 0) {
    throw new ValidateError('Employee already assigned', 403)
  }
}
module.exports = {
  validateDateOverlap,
  checkStartDate,
  ValidateError
}
