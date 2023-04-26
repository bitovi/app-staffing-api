import { Scaffold } from 'bitscaffold'
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

const validateAssignmentOverlap = async ({ body, Assignment }) => {
  if (body.employee_id) {
    try {
      const assignments = await Assignment.findAll({
        where: {
<<<<<<< HEAD
          id: body.employee_id
        }
      })
      console.log("emp", body.employee_id)
      console.log("emp", employee)

      if (employee) {
        // ensure the employee
        const employeeEndDate = employee.end_date ?? Infinity
        console.log('bod',body)
        console.log('employ',employee.start_date)
        console.log('employ',employeeEndDate);
=======
          employee_id: body.employee_id,
        },
      });

      assignments.forEach(assignment => {
        const employeeEndDate = assignment.end_date ?? Infinity
>>>>>>> feat/currentProjectVirtual
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
<<<<<<< HEAD
        return;
      } else {
        throw Scaffold.createError({
          title: 'Employee not found',
          code: codes.ERR_NOT_FOUND,
          status: statusCodes.NOT_FOUND,
          pointer: 'employee/id'
        })
      }
    } catch (e) {
      console.error(e)
=======
      });
    } catch (e) {
      console.error("error", e);
>>>>>>> feat/currentProjectVirtual
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