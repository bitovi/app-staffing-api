import request from 'supertest'
import Chance from 'chance'
import Serializer from '../../src/utils/json-api-serializer'
import { dateGenerator } from '../../src/utils/date'

const chance = new Chance()

describe('PUT /api/assignments/:id', () => {
  const put = async (id, payload) => {
    const response = await request(global.app.callback())
      .put(`/api/assignments/${id}`)
      .set('Accept', 'application/vnd.api+json')
      .set('Content-Type', 'application/vnd.api+json')
      .send(serialize(payload))

    return response
  }

  const serialize = (body) => {
    return Serializer.serialize('assignments', body)
  }

  test('should return 422 for payload with startDate after endDate', async () => {
    const dates = dateGenerator()

    const { Assignment, Employee, Project, Role, Skill } = global.model

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence()
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 1 }),
      project_id: project.id
    })

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }

    const assignment = await Assignment.create(newAssignment)

    const response = await put(assignment.dataValues.id, {
      ...newAssignment,
      start_date: dates.endAssignmentDate,
      end_date: dates.startAssignmentDate
    })

    expect(response.statusCode).toBe(422)
  })

  test('should update optional end_date to null', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()
    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence()
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 1 }),
      project_id: project.id
    })

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.create(newAssignment)

    const { statusCode, body } = await put(assignment.dataValues.id, {
      ...newAssignment,
      end_date: null
    })

    expect(statusCode).toBe(200)

    const { end_date } = await Assignment.findByPk(assignment.dataValues.id)

    expect(end_date).toBeNull()
  })

  test('should return 200 when update is successful', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence()
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate
    })

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 1 }),
      project_id: project.id
    })

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,

      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.create(newAssignment)

    const newAssociatedEmployee = await Employee.create({
      name: chance.name(),
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate
    })

    const response = await put(assignment.id, {
      ...newAssignment,
      employee: { id: newAssociatedEmployee.id },
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate
    })

    expect(response.statusCode).toBe(200)
  })

  test('should return 200 for payload dates out of range of role, assignment dates before roles and start date is not confident', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence()
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.afterEndDate
    })

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 0.9 }),
      project_id: project.id
    })

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.create(newAssignment)

    const response = await put(assignment.id, {
      ...newAssignment,
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate
    })

    expect(response.statusCode).toBe(200)
  })

  test('should return 200 for payload dates out of range of role, assignment dates after roles and end date is not confident', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence()
    })

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.startDate,
      start_confidence: chance.floating({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 0.9 }),
      project_id: project.id
    })

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.create(newAssignment)

    const payload = serialize({
      ...newAssignment,
      start_date: dates.startAssignmentDate,
      end_date: dates.afterEndDate
    })
    const response = await put(assignment.id, payload)

    expect(response.statusCode).toBe(200)
  })
})
