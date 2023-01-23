const { statusCodes, codes } = require('./constants')

class Source {
    constructor(pointer, parameter) {
        this.pointer = pointer && ('/data/attributes/' + pointer)
        this.parameter = parameter
    }
}

class GeneralError extends Error {
    constructor({ title, status, code, detail, pointer, parameter }) {
        super()
        this.status = status || statusCodes.INTERNAL_SERVER_ERROR
        this.code = code
        this.detail = detail
        this.source = new Source(pointer, parameter)
        this.title = title || 'Server Error ocurred'
    }
}

class ValidationError extends GeneralError {
    constructor({ title, status, code, detail, pointer, parameter }) {
        super({ title, status, code, detail, pointer, parameter })
        this.status = status || statusCodes.BAD_REQUEST
    }
}

class NotFoundError extends GeneralError {
    constructor({ title, detail, pointer, parameter }) {
        super({
            title: title || 'Not found',
            detail,
            pointer,
            parameter
        })
        this.code = codes.ERR_NOT_FOUND
        this.status = statusCodes.NOT_FOUND
    }
}

class UniqueConstraintError extends GeneralError {
    constructor({ title, detail, pointer, parameter }) {
        super({
            title: title || 'Conflict',
            detail,
            pointer,
            parameter
        })
        this.code = codes.ERR_CONFLICT
        this.status = statusCodes.CONFLICT
    }
}

class ConflictError extends GeneralError {
    constructor({ title, detail, pointer, parameter }) {
        super({ title, detail, pointer, parameter })
        this.title = title || 'Conflict'
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
