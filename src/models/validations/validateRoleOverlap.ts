import { statusCodes } from '../../managers/error-handler/constants'
import {
  ConflictError,
  ValidationError
} from '../../managers/error-handler/errors'
import { compareDates } from '../../utils/date'

const validateRoleOverlap = async ({ body, Role, transaction }) => {
  if (body.role_id) {
    const role = await Role.findOne({
      where: { id: body.role_id },
      attributes: [
        'start_date',
        'end_date',
        'start_confidence',
        'end_confidence'
      ],
      transaction
    })

    if (!role) {
      throw new ConflictError({
        pointer: 'role/id'
      })
    }

    const assignmentStart = body.start_date
    const assignmentEnd = body.end_date
    const roleStart = role.start_date
    const roleEnd = role.end_date
    const startConfidence = role.start_confidence
    const endConfidence = role.end_confidence

    console.log('okay e reach')

    const isFullyConfident = (confidence) => confidence === 1

    const assignmentStartBeforeRoleStart =
      compareDates(assignmentStart, roleStart) &&
      isFullyConfident(startConfidence)

    if (!assignmentEnd && !roleEnd && assignmentStartBeforeRoleStart) {
      throw new ValidationError({
        title: 'Assignment start date not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: 'start_date'
      })
    } else if (
      assignmentEnd &&
      (assignmentStartBeforeRoleStart ||
        (roleEnd &&
          compareDates(roleEnd, assignmentStart) &&
          isFullyConfident(endConfidence)))
    ) {
      throw new ValidationError({
        title: 'Assignment start date not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: 'start_date'
      })
    } else if (
      !roleEnd &&
      (assignmentStartBeforeRoleStart ||
        (compareDates(assignmentEnd, roleStart) &&
          isFullyConfident(startConfidence)))
    ) {
      throw new ValidationError({
        title: 'Assignment dates are before role start date',
        status: statusCodes.CONFLICT,
        pointer: assignmentStartBeforeRoleStart ? 'start_date' : 'end_date'
      })
    } else if (
      assignmentEnd &&
      roleEnd &&
      (assignmentStartBeforeRoleStart ||
        (compareDates(roleEnd, assignmentEnd) &&
          isFullyConfident(endConfidence)))
    ) {
      throw new ValidationError({
        title: 'Assignment not in date range of role',
        status: statusCodes.CONFLICT,
        pointer: assignmentStartBeforeRoleStart ? 'start_date' : 'end_date'
      })
    }
  }
}

export default validateRoleOverlap
