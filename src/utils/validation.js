const { ValidationError } = require('objection')

const validateStartDate = (body) => {
  if ((body.start_date && body.end_date) && body.start_date > body.end_date) {
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
