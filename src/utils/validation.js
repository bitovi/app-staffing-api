const { statusCodes } = require('../managers/error-handler/constants')
const { ValidationError } = require('../managers/error-handler/errors')

const validateStartDate = (body) => {
  const startDate = new Date(body.start_date)
  const endDate = new Date(body.end_date)

  if (body.start_date && body.end_date && startDate > endDate) {
    throw new ValidationError({
      title: 'startDate is after endDate',
      status: statusCodes.UNPROCESSABLE_ENTITY,
      pointer: 'start_date'
    })
  }
}
// checks to see that both start_date and end_date, if not null, do not include time by checking the length of the input string
const validateDateFormat = (body) => {
  if ((body.start_date != null && body.start_date.length > 10) || (body.end_date != null && body.end_date.length > 10)) {
    throw new ValidationError({
      message: 'incorrect date format',
      type: 'ModelValidation',
      statusCode: 422,
      pointer: 'start_date'
    })
  }
}

module.exports = {
  validateStartDate,
  validateDateFormat
}
