const { statusCodes, codes } = require('./constants')

class Source {
  constructor (pointer, parameter) {
    this.pointer = pointer && ('/data/attributes/' + pointer)
    this.parameter = parameter
  }
}

class GeneralError extends Error {
  constructor ({ message, status, code, detail, pointer, parameter }) {
    super()
    this.status = status || statusCodes.INTERNAL_SERVER_ERROR
    this.code = code
    this.detail = detail
    this.source = new Source(pointer, parameter)
    super.message = message || 'Server Error ocurred'
  }
}

class ValidationError extends GeneralError {
  constructor ({ message, status, code, detail, pointer, parameter }) {
    super({ message, status, code, detail, pointer, parameter })
    this.status = status || statusCodes.BAD_REQUEST
  }
}

class NotFoundError extends GeneralError {
  constructor ({ message, detail, pointer, parameter }) {
    super({
      message: message || 'Not found',
      detail,
      pointer,
      parameter
    })
    this.code = codes.ERR_NOT_FOUND
    this.status = statusCodes.NOT_FOUND
  }
}

class UniqueConstraintError extends GeneralError {
  constructor ({ message, detail, pointer, parameter }) {
    super({
      message: message || 'Conflict',
      detail,
      pointer,
      parameter
    })
    this.code = codes.ERR_CONFLICT
    this.status = statusCodes.CONFLICT
  }
}

class ConflictError extends GeneralError {
  constructor ({ message, detail, pointer, parameter }) {
    super({ message, detail, pointer, parameter })
    this.message = message || 'Conflict'
    this.code = codes.ERR_CONFLICT
    this.status = statusCodes.CONFLICT
  }
}

module.exports = {
  GeneralError,
  ValidationError,
  NotFoundError,
  UniqueConstraintError,
  ConflictError
}
