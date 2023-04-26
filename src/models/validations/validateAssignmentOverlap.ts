import { Scaffold } from 'bitscaffold'
<<<<<<< HEAD
=======
import { ValidationError } from '../../managers/error-handler/errors'
import { Op, Sequelize } from 'sequelize'
>>>>>>> 0c994d5 (Clean up)
import { codes, statusCodes } from '../../managers/error-handler/constants'

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

<<<<<<< HEAD
const validateAssignmentOverlap = async ({ body, Assignment }) => {
=======
const validateAssignmentOverlap = async ({ body, Employee }) => {
>>>>>>> 0c994d5 (Clean up)
  if (body.employee_id) {
    try {
      const assignments = await Assignment.findAll({
        where: {
<<<<<<< HEAD
          employee_id: body.employee_id,
        },
      });

      assignments.forEach(assignment => {
        const employeeEndDate = assignment.end_date ?? Infinity
=======
          id: body.employee_id
        }
      })

      if (employee) {
        // ensure the employee
        const employeeEndDate = employee.end_date ?? Infinity
>>>>>>> 0c994d5 (Clean up)
        if (
          dateRangeOverlaps(
            body.start_date,
            body.end_date,
<<<<<<< HEAD
            assignment.start_date,
=======
            employee.start_date,
>>>>>>> 0c994d5 (Clean up)
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
<<<<<<< HEAD
      });
    } catch (e) {
      console.error("error", e);
=======
      } else {
        throw Scaffold.createError({
          title: 'Employee not found',
          code: codes.ERR_NOT_FOUND,
          status: statusCodes.NOT_FOUND,
          pointer: 'employee/id'
        })
      }
    } catch (e) {
>>>>>>> 0c994d5 (Clean up)
      throw Scaffold.createError({
        title: e.message,
        code: codes.ERR_CONFLICT,
        status: statusCodes.CONFLICT,
        pointer: 'employee/id'
      })
    }
  }
}

export default validateAssignmentOverlap