import { Scaffold } from 'bitscaffold'
import { codes, statusCodes } from '../../managers/error-handler/constants'

<<<<<<< HEAD
function dateRangeOverlaps(
  firstStartDate,
  firstEndDate,
  secondStartDate,
  secondEndDate
) {
  if (firstStartDate < secondStartDate && secondStartDate < firstEndDate)
    return true // second starts in first
  if (firstStartDate < secondEndDate && secondEndDate < firstEndDate)
    return true // second ends in first
  if (secondStartDate < firstStartDate && firstEndDate < secondEndDate)
    return true // first in second
  return false
}

=======
>>>>>>> bd0844f (added assignment overlap)
const validateAssignmentOverlap = async ({ body, Assignment }) => {
  if (body.employee_id) {
    try {
      const assignments = await Assignment.findAll({
        where: {
          employee_id: body.employee_id,
        },
<<<<<<< HEAD
      });
=======
      })
>>>>>>> bd0844f (added assignment overlap)

      assignments.forEach(assignment => {
        const employeeEndDate = assignment.end_date ?? Infinity
        if (
          dateRangeOverlaps(
            body.start_date,
            body.end_date,
            assignment.start_date,
            employeeEndDate
          )
        ) {
          throw Scaffold.createError({
            title: 'Employee already assigned',
            code: codes.ERR_CONFLICT,
            status: statusCodes.CONFLICT,
            pointer: 'employee/id'
          })
        }
      });
    } catch (e) {
<<<<<<< HEAD
      console.error("error", e);
      throw Scaffold.createError({
        title: e.message,
        code: codes.ERR_CONFLICT,
        status: statusCodes.CONFLICT,
        pointer: 'employee/id'
=======
      throw new ValidationError({
        title: 'Employee already assigned',
        status: 409,
        pointer: 'employee/id',
>>>>>>> bd0844f (added assignment overlap)
      })
    }
  }
}

export default validateAssignmentOverlap
