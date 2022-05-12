const {
  ValidationError,
  NotFoundError,
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError
} = require('objection')
const { statusCodes } = require('./constants')
const ajvValidationErrorHandlers = require('./types/ajv-validation-errors')
const databaseErrorHandlers = require('./types/database-errors')
const generalErrorHandlers = require('./types/general-errors')

const errorHandler = (error, request, reply) => {
  let errors = []
  let status = statusCodes.INTERNAL_SERVER_ERROR

  if (error.validation && error.validationContext) {
    errors = ajvValidationErrorHandlers(error)

    status = errors.length > 1 ? statusCodes.BAD_REQUEST : errors[0].status
  } else if (
    [
      ValidationError,
      NotFoundError,
      DBError,
      ConstraintViolationError,
      UniqueViolationError,
      NotNullViolationError,
      ForeignKeyViolationError,
      CheckViolationError,
      DataError
    ].includes(error.constructor)
  ) {
    errors.push(databaseErrorHandlers(error))

    status = errors[0].status
  } else {
    errors.push(generalErrorHandlers(error))

    status = errors[0].status
  }

  reply.status(status).send({
    errors
  })
}

module.exports = errorHandler
