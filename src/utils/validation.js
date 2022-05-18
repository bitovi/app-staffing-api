const { statusCodes } = require('../managers/error-handler/constants')
const { ValidationError } = require('../managers/error-handler/errors')

const validateStartDate = (body) => {
  if ((body.start_date && body.end_date) && body.start_date > body.end_date) {
    throw new ValidationError({
      title: 'startDate is after endDate',
      status: statusCodes.UNPROCESSABLE_ENTITY,
      pointer: 'start_date'
    })
  }
}

module.exports = {
  validateStartDate
}
