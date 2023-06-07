import { statusCodes } from "../constants"
import { GeneralError, UniqueConstraintError, ValidationError } from "../errors"

const databaseErrorHandlers = (error) => {
  const { name, message } = error

  if (name === "SequelizeValidationError") {
    const pointer = error.errors[0].path

    if (error.errors[0].type === "notNull Violation") {
      error = new ValidationError({
        title: `${error.errors[0].path} is required.`,
        status: statusCodes.UNPROCESSABLE_ENTITY,
        pointer,
      })
    }
  } else {
    const pointer = error.errors[0].path

    switch (name) {
      case "SequelizeUniqueConstraintError":
        error = new UniqueConstraintError({
          title: `Record with ${pointer} already exists`,
          pointer,
        })

        break

      case "SequelizeForeignKeyConstraintError":
        error = new GeneralError({
          title: "Foreign key constraint violation",
          status: statusCodes.CONFLICT,
          pointer: error.parent.constraint.split("_")[1],
        })
        break

      case "SequelizeDatabaseError":
      default:
        error = new GeneralError({
          title: message,
          status: statusCodes.INTERNAL_SERVER_ERROR,
        })
        break
    }
  }

  return error
}

export default databaseErrorHandlers
