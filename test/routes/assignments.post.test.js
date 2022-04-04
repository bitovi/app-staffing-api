const faker = require('faker')
const isString = require('lodash/isString')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')

describe('POST /assignments', function () {
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

  test('should return 403 if payload body includes id', async function () {
    const payload = serialize({
      id: faker.datatype.uuid(),
      start_date: faker.date.future(),
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
  })

  test('should return 422 if payload is missing required field', async function () {
    // start_date is required
    const payload = serialize({
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  test('should return 422 if payload has unknown fields', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
      anUnknownField: 'foo bar baz'
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  test('should fail if associated employee id does not exist', async function () {
    const payload = serialize({
      start_date: faker.date.future(),
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(500)
  })
  test('should return 201 for valid payload with end_date', async function () {
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

    const newAssignment = {
      start_date: faker.date.past(),
      end_date: faker.date.future(10),
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const payload = serialize(newAssignment)
    const response = await post(payload)
    expect(response.statusCode).toEqual(201)

    const body = JSON.parse(response.body)
    expect(isString(body.data.id)).toEqual(true)

    const savedAssignment = await Assignment.query().findById(body.data.id)
    expect(isString(savedAssignment.id)).toEqual(true)
    expect(savedAssignment.employee_id).toEqual(employee.id)
    expect(savedAssignment.role_id).toEqual(role.id)
  })
  test('should return 201 for valid payload without end_date', async function () {
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

    const newAssignment = {
      start_date: faker.date.future(),
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const payload = serialize(newAssignment)
    const response = await post(payload)
    expect(response.statusCode).toEqual(201)

    const body = JSON.parse(response.body)
    expect(isString(body.data.id)).toEqual(true)

    const savedAssignment = await Assignment.query().findById(body.data.id)
    expect(isString(savedAssignment.id)).toEqual(true)
    expect(savedAssignment.employee_id).toEqual(employee.id)
    expect(savedAssignment.role_id).toEqual(role.id)
  })
  test('should return 403 if payload\'s start_date is after end_date', async function () {
    const payload = serialize({
      start_date: faker.date.future(10),
      end_date: faker.date.soon(),
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Start date is after end date')
  })
  test('should return 403 if payload does not have end_date and start_date falls in between another assignment belonging to associated employee', async function () {
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
    const assignment = await Assignment.query().insert({
      employee_id: employee.id,
      role_id: role.id,
      start_date: '2027-02-15 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400'
    })
    const payload = serialize({
      start_date: '2027-02-18 03:44:48.640 -0400',
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Employee already assigned')
  })
  test('should return 403 if payload\'s start_date falls in between another assignment belonging to associated employee', async function () {
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
    const assignment = await Assignment.query().insert({
      employee_id: employee.id,
      role_id: role.id,
      start_date: '2027-02-15 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400'
    })
    const payload = serialize({
      start_date: '2027-02-18 03:44:48.640 -0400',
      end_date: '2027-03-15 03:44:48.640 -0400',
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Employee already assigned')
  })
  test('should return 403 if payload\'s end_date falls in between another assignment belonging to associated employee', async function () {
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
    const assignment = await Assignment.query().insert({
      employee_id: employee.id,
      role_id: role.id,
      start_date: '2027-02-15 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400'
    })
    const payload = serialize({
      start_date: '2027-02-02 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400',
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Employee already assigned')
  })
  test('should return 403 if payload\'s dates occur inside other assignments belonging to associated employee', async function () {
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
    const assignment = await Assignment.query().insert({
      employee_id: employee.id,
      role_id: role.id,
      start_date: '2027-02-15 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400'
    })
    const payload = serialize({
      start_date: '2027-02-16 03:44:48.640 -0400',
      end_date: '2027-02-18 03:44:48.640 -0400',
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Employee already assigned')
  })
  test('should return 403 if payload\'s dates start before and end after other assignments belonging to associated employee', async function () {
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
    const assignment = await Assignment.query().insert({
      employee_id: employee.id,
      role_id: role.id,
      start_date: '2027-02-15 03:44:48.640 -0400',
      end_date: '2027-02-20 03:44:48.640 -0400'
    })
    const payload = serialize({
      start_date: '2027-02-02 03:44:48.640 -0400',
      end_date: '2027-02-21 03:44:48.640 -0400',
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(403)
    expect(response.body).toBe('Employee already assigned')
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
