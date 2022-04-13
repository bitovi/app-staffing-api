const { ValidationError } = require('objection')

const validateStartDate = (body) => {
  if (body.end_date !== null && body.start_date > body.end_date) {
    throw new ValidationError({
      message: 'startDate is after endDate',
      type: 'ModelValidation',
      statusCode: 422,
      data: ''
    })
  }
}

module.exports = {
  validateStartDate
}
