const { ValidationError } = require('objection')
const { statusCodes } = require('../managers/error-handler/constants')

const validateStartDate = (body) => {
  if (
    body.start_date !== null &&
    body.end_date !== null &&
    body.start_date > body.end_date
  ) {
    throw new ValidationError({
      message: 'startDate is after endDate',
      type: 'ModelValidation',
      statusCode: statusCodes.UNPROCESSABLE_ENTITY
    })
  }
}

module.exports = {
  validateStartDate
}
