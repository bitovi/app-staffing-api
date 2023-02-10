import request from 'supertest'
import Serializer from '../../src/utils/json-api-serializer'
import { dateGenerator } from '../../src/utils/date'
import Chance from 'chance'
import { isString } from '../../src/utils/validation'

const chance = new Chance()

const serialize = (body) => {
  return Serializer.serialize('assignments', body)
}

const post = async (payload) => {
  const response = await request(global.app.callback())
    .post('/api/Assignment')
    .set('Accept', 'application/vnd.api+json')
    .set('Content-Type', 'application/vnd.api+json')
    .send(serialize(payload))

  return response
}

describe('POST /api/Assignment', () => {
  test('should return 422 for payload with startDate after endDate', async () => {
    const dates = dateGenerator()

    const payload = serialize({
      start_date: dates.afterEndDate,
      employee: { id: chance.guid() },
      role: { id: chance.guid() },
      end_date: dates.startDate
    })

    const response = await post(payload)

    expect(response.statusCode).toBe(422)
  })

  test('should return 200 for payload dates out of range of role, assignment date before roles and start date is not confident', async () => {
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
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }

    const payload = serialize(newAssignment)

    const response = await post(payload)

    expect(response.statusCode).toEqual(200)
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
      end_date: dates.afterEndDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }

    const payload = serialize(newAssignment)

    const response = await post(payload)

    expect(response.statusCode).toEqual(200)
  })

  test('should return 200 for valid payload with end_date', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence({ words: 2 })
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

    const { body, statusCode } = await post(newAssignment)
    expect(statusCode).toEqual(200)

    expect(isString(body.data.id)).toEqual(true)

    const savedAssignment = (await Assignment.findByPk(body.data.id)).dataValues

    expect(isString(savedAssignment.id)).toEqual(true)
    // expect(savedAssignment.employee_id).toEqual(employee.id)
    // expect(savedAssignment.role_id).toEqual(role.id)
  })

  test('should return 200 for valid payload without end_date', async () => {
    // TODO: move destructuring to the top

    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const project = await Project.create({
      name: chance.company(),
      description: chance.sentence({ words: 2 })
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

    const { body, statusCode } = await post(newAssignment)
    expect(statusCode).toEqual(200)

    expect(isString(body.data.id)).toEqual(true)

    const savedAssignment = (await Assignment.findByPk(body.data.id)).dataValues
    expect(isString(savedAssignment.id)).toEqual(true)
    // expect(savedAssignment.employee_id).toEqual(employee.id)
    // expect(savedAssignment.role_id).toEqual(role.id)
  })
})
