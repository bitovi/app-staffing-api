const { ValidationError } = require('objection')

const validateStartDate = (body) => {
  const startDate = new Date(body.start_date)
  const endDate = new Date(body.end_date)

  if ((body.start_date !== null && body.end_date !== null) && startDate > endDate) {
    throw new ValidationError({
      message: 'startDate is after endDate',
      type: 'ModelValidation',
      statusCode: 422,
      data: ''
    })
  }
}
// checks to see that both start_date and end_date, if not null, do not include time by checking the length of the input string
const validateDateFormat = (body) => {
  if ((body.start_date != null && body.start_date.length > 10) || (body.end_date != null && body.end_date.length > 10)) {
    throw new ValidationError({
      message: 'date format includes time',
      type: 'ModelValidation',
      statusCode: 422,
      data: ''
    })
  }
}

module.exports = {
  validateStartDate,
  validateDateFormat
}
