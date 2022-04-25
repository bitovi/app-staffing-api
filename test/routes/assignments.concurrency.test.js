const faker = require('faker')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')

describe('POST /assignments', function () {
  let trx
  const knex = Model.knex()
  let project
  let role
  let employee
  beforeAll(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)

    project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })
    employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })
    role = await Role.query().insert({
      start_date: faker.date.past(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.future(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })
  })

  afterAll(async () => {
    await trx.rollback()
    Model.knex(knex)
  })
  test.concurrent.each(
    [
      ['0001-01-15 00:00:01.000 -0000', '0001-03-20 00:00:01.000 -0000', 201],
      ['0001-02-15 00:00:01.000 -0000', '0001-03-20 00:00:01.000 -0000', 409],
      ['0002-02-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 201],
      ['0002-02-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 409],
      ['0003-03-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 422]
    ]
  )('Test POST concurrency', async (start, end, expected) => {
    const newAssignment = {
      start_date: start,
      end_date: end,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const payload = serialize(newAssignment)
    const response = await post(payload)
    expect(response.statusCode).toEqual(expected)
  })

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/assignments',
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
})
describe('PATCH /assignments', function () {
  let trx
  const knex = Model.knex()
  let project
  let role
  let employee
  let assignment
  let newAssignment
  let newAssociatedEmployee
  beforeAll(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)

    project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences()
    })
    employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })
    role = await Role.query().insert({
      start_date: faker.date.past(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.future(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })
    newAssignment = {
      start_date: '2024-02-25 00:00:01.000 -0000',
      end_date: '2025-02-25 00:00:01.000 -0000',
      employee: { id: employee.id },
      role: { id: role.id }
    }
    assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )
    newAssociatedEmployee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })
  })

  afterAll(async () => {
    await trx.rollback()
    Model.knex(knex)
  })
  test.concurrent.each(
    [
      ['0001-01-15 00:00:01.000 -0000', '0001-03-20 00:00:01.000 -0000', 200],
      ['0001-02-15 00:00:01.000 -0000', '0001-03-20 00:00:01.000 -0000', 409],
      ['0002-02-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 200],
      ['0002-02-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 409],
      ['0003-03-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 422]
    ])('Test PATCH concurrency', async (start, end, expected) => {
    const payload = serialize({
      ...newAssignment,
      employee: { id: newAssociatedEmployee.id },
      start_date: start,
      end_date: end
    })
    const response = await patch(assignment.id, payload)
    expect(response.statusCode).toEqual(expected)
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
})
