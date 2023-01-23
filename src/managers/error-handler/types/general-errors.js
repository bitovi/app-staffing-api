const { GeneralError } = require('../errors')

const generalErrorHandlers = (error) => {
    if (error instanceof GeneralError) {
        return error
    }

    error = new GeneralError(error)

    return error
}

module.exports = generalErrorHandlers
