const faker = require('faker')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')

describe('PATCH /assignments/:id', function () {
  let trx
  const knex = Model.knex()

  beforeEach(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)
  })

  afterEach(async () => {
    await trx.rollback()
    Model.knex(knex)
  })

  test('should return 404 if assignment id does not exist', async function () {
    const notFoundId = faker.datatype.uuid()
    const payload = serialize({
      id: notFoundId,
      start_date: faker.date.future(),
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() }
    })
    const response = await patch(notFoundId, payload)
    expect(response.statusCode).toBe(404)
  })

  test('should return 404 if associated employee does not exist', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: faker.date.recent(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.future(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const assignment = await Assignment.query().insertGraph(
      {
        start_date: faker.date.future(),
        employee: { id: employee.id },
        role: { id: role.id }
      },
      { relate: true }
    )

    const payload = serialize({
      employee: { id: faker.datatype.uuid() }
    })
    const response = await patch(assignment.id, payload)
    expect(response.statusCode).toBe(404)
  })

  test('should return 422 if payload has unknown fields', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: faker.date.recent(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.future(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const assignment = await Assignment.query().insertGraph(
      {
        start_date: faker.date.future(),
        employee: { id: employee.id },
        role: { id: role.id }
      },
      { relate: true }
    )

    const payload = serialize({ anUnknownProperty: 'foo bar baz' })
    const response = await patch(assignment.id, payload)
    expect(response.statusCode).toBe(422)

    const { title } = JSON.parse(response.body)
    expect(title).toBe('body should NOT have additional properties')
  })
  test('should return 422 for payload with startDate after endDate', async function () {
    const startDate = faker.date.past()
    const endDate = faker.date.future()

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: startDate,
      start_confidence: faker.datatype.number(10),
      end_date: endDate,
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: startDate,
      end_date: endDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const payload = serialize({
      ...newAssignment,
      start_date: faker.date.future(),
      end_date: faker.date.past()
    })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(422)
  })
  test('should update optional end_date to null', async function () {
    const startDate = faker.date.past()
    const endDate = faker.date.future()

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: startDate,
      start_confidence: faker.datatype.number(10),
      end_date: endDate,
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: startDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const payload = serialize({ ...newAssignment, end_date: null })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(200)
    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.end_date).toBeNull()
  })

  test('should return 200 when update is successful', async function () {
    const startDate = faker.date.past()
    const endDate = faker.date.future()

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: startDate,
      start_confidence: faker.datatype.number(10),
      end_date: endDate,
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: startDate,
      end_date: endDate,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const newAssociatedEmployee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const payload = serialize({
      ...newAssignment,
      employee: { id: newAssociatedEmployee.id }
    })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(200)
    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.employee.id).toEqual(newAssociatedEmployee.id)
  })
  // These following tests will be moved to dedicated validation test page in assignment overlap validation branch
  test('should return 409 for payload dates out of range of role, assignment dates before roles', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: '2022-04-27 06:16:32.657 -0400',
      start_confidence: faker.datatype.number(10),
      end_date: '2022-04-29 06:16:32.657 -0400',
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: '2022-04-27 06:16:32.657 -0400',
      end_date: '2022-04-28 06:16:32.657 -0400',
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const payload = serialize({
      ...newAssignment,
      start_date: '2022-02-27 06:16:32.657 -0400',
      end_date: '2022-02-28 06:16:32.657 -0400'
    })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(409)
  })
  test('should return 409 for payload dates out of range of role, assignment dates after roles', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: '2022-04-27 06:16:32.657 -0400',
      start_confidence: faker.datatype.number(10),
      end_date: '2022-04-29 06:16:32.657 -0400',
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: '2022-04-27 06:16:32.657 -0400',
      end_date: '2022-04-28 06:16:32.657 -0400',
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const payload = serialize({
      ...newAssignment,
      start_date: '2023-02-27 06:16:32.657 -0400',
      end_date: '2023-02-28 06:16:32.657 -0400'
    })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(409)
  })
  test('should return 409 for payload dates out of range of role, assignment start during role-ends after role', async function () {
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const role = await Role.query().insert({
      start_date: '2022-04-27 06:16:32.657 -0400',
      start_confidence: faker.datatype.number(10),
      end_date: '2022-04-29 06:16:32.657 -0400',
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: '2022-04-27 06:16:32.657 -0400',
      end_date: '2022-04-28 06:16:32.657 -0400',
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )

    const payload = serialize({
      ...newAssignment,
      start_date: '2022-04-28 06:16:32.657 -0400',
      end_date: '2024-02-28 06:16:32.657 -0400'
    })
    const response = await patch(assignment.id, payload)

    expect(response.statusCode).toBe(409)
  })
  function patch (id, payload) {
    return global.app.inject({
      method: 'PATCH',
      url: `/assignments/${id}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function serialize (obj) {
    return Serializer.serialize('assignments', obj)
  }

  function deserialize (obj) {
    return Serializer.deserialize('assignments', obj)
  }
})
