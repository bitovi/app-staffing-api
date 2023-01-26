import { statusCodes } from './constants'
import databaseErrorHandlers from './types/database-errors'
import generalErrorHandler from './types/general-errors'

const errorHandler = (error, ctx) => {
  let errors: any[] = []
  let status = statusCodes.INTERNAL_SERVER_ERROR

  if (
    [
      'SequelizeDatabaseError',
      'SequelizeUniqueConstraintError',
      'SequelizeValidationError',
      'SequelizeForeignKeyConstraintError',
    ].includes(error.name)
  ) {
    errors.push(databaseErrorHandlers(error))
  } else {
    errors.push(generalErrorHandler(error))
  }

  status = errors[0].status || status

  ctx.body = errors
}

export default errorHandler
