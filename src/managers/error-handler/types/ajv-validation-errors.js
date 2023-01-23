const { codes, statusCodes } = require('../constants')
const { ValidationError } = require('../errors')

const ajvValidationErrorHandlers = (error) => {
    const errors = []

    error.validation.forEach(validationBody => {
        switch (validationBody.keyword) {
            case 'minimum':
            case 'maximum':
                errors.push(new ValidationError({
                    title: validationBody.message,
                    status: statusCodes.UNPROCESSABLE_ENTITY,
                    pointer: validationBody.dataPath.split('.')[1],
                    code: codes.ERR_RANGE,
                    detail: error.message
                }))

                break

            case 'required':
                errors.push(new ValidationError({
                    status: statusCodes.UNPROCESSABLE_ENTITY,
                    code: codes.ERR_PARAMETER_REQUIRED,
                    title: validationBody.message,
                    detail: error.message,
                    pointer: validationBody.params.missingProperty
                }))
                break

            case 'additionalProperties':
                errors.push(new ValidationError({
                    status: statusCodes.UNPROCESSABLE_ENTITY,
                    code: codes.ERR_INVALID_PARAMETER,
                    title: `${validationBody.params.additionalProperty} is an invalid parameter`,
                    detail: error.message,
                    pointer: validationBody.params.additionalProperty
                }))
                break

            default:
                errors.push(new ValidationError({
                    title: validationBody.message,
                    detail: error.message
                }))
                break
        }
    })

    // Determine status code

    return errors
}

module.exports = ajvValidationErrorHandlers
