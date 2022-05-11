const {
  GeneralError,
  NotFoundError,
  UniqueConstraintError,
  ValidationError
} = require('../errors')
const objectionErrors = require('objection')
const { statusCodes } = require('../constants')
const {
  DBError,
  ConstraintViolationError,
  UniqueViolationError,
  NotNullViolationError,
  ForeignKeyViolationError,
  CheckViolationError,
  DataError
} = objectionErrors
const ObjectionNotFoundError = objectionErrors.NotFoundError
const ObjectionValidationError = objectionErrors.ValidationError

const databaseErrorHandlers = (error) => {
  const { message, status, statusCode } = error

  if (error instanceof ObjectionValidationError) {
    switch (error.type) {
      case 'ModelValidation':
      case 'RelationExpression':
      case 'UnallowedRelation':
      case 'InvalidGraph':
      default:
        error = new ValidationError({ message, status: statusCode || status })

        break
    }
  } else if (error.constructor !== ValidationError) {
    switch (error.constructor) {
      case ObjectionNotFoundError:
        error = new NotFoundError({ message })

        break

      case UniqueViolationError:
        error = new UniqueConstraintError({
          message: `Record with ${error.columns[0]} already exists`,
          pointer: error.columns[0]
        })

        break

      case NotNullViolationError:
      case CheckViolationError:
      case ConstraintViolationError:
      case DataError:
        error = new GeneralError({
          message,
          pointer: error.column,
          status: statusCodes.BAD_REQUEST
        })

        break

      case ForeignKeyViolationError:
        error = new GeneralError({
          message: 'Foreign key constraint violation',
          status: statusCodes.CONFLICT
        })

        break

      case DBError:
      default:
        error = new GeneralError({
          message,
          status: statusCodes.INTERNAL_SERVER_ERROR
        })

        break
    }
  }

  return error
}

module.exports = databaseErrorHandlers
