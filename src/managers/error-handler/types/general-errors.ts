import { GeneralError } from "../errors"

const generalErrorHandler = (error) => {
  if (error instanceof GeneralError) {
    return error
  }

  error = new GeneralError(error)

  return error
}

export default generalErrorHandler
