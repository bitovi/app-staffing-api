import { ValidationError } from '../../managers/error-handler/errors'
import { Op, Sequelize } from 'sequelize'

const validateAssignmentOverlap = async ({ body, Assignment }) => {
  if (body.employee_id) {
    let assignmentList

    try {
      await Assignment.findOne({
        where: {
          employee_id: body.employee_id,
        },
      })

      if (body.end_date) {
        assignmentList = await Assignment.findOne({
          where: {
            [Op.and]: [
              { employee_id: body.employee_id },
              Sequelize.literal(
                `(${body.start_date}, ${body.end_date}) OVERLAPS ("start_date", "end_date")`
              ),
            ],
          },
        })
      } else {
        // If end_date is entered is blank or null

        assignmentList = await Assignment.findOne({
          where: {
            [Op.and]: [
              { employee_id: body.employee_id },
              Sequelize.literal(
                `(${body.start_date}, \'infinity\') OVERLAPS ("start_date", "end_date")`
              ),
            ],
          },
        })
      }

      if (body.id) {
        assignmentList = assignmentList.filter((e) => e.id !== body.id)
      }

      if (assignmentList.length > 0) {
        throw new Error('Overlap')
      }
    } catch (e) {
      throw new ValidationError({
        title: 'Employee already assigned',
        status: 409,
        pointer: 'employee/id',
      })
    }
  }
}

export default validateAssignmentOverlap
