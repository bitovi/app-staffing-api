import { ValidationError } from '../../managers/error-handler/errors'
import { Op, Sequelize } from 'sequelize'

function dateRangeOverlaps(a_start, a_end, b_start, b_end) {
  if (a_start < b_start && b_start < a_end) return true; // b starts in a
  if (a_start < b_end   && b_end   < a_end) return true; // b ends in a
  if (b_start <  a_start && a_end   <  b_end) return true; // a in b
  return false;
}


const validateAssignmentOverlap = async ({ body, Assignment, Employee }) => {
  if (body.employee_id) {

    try {
      const employee = await Employee.findOne({
        where: {
          id: body.employee_id,
        }
      });

      if (employee) {
        // ensure the employee
        const employeeEndDate = employee.end_date ?? Infinity
        if (dateRangeOverlaps(body.start_date, body.end_date, employee.start_date, employeeEndDate)){
          throw new Error('Employee already assigned');
        }
      } else {
        throw new Error('Employee is Invalid')
      }
    } catch (e) {
      throw new ValidationError({
        title: e.message,
        status: 409,
        pointer: 'employee/id',
      })
    }
  }
}

export default validateAssignmentOverlap
