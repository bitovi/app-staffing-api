const faker = require('faker')
const { transaction, Model } = require('objection')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')

const testCases = [
  [
    'should return 409 if payload\'s startDate is after endDate',
    '2022-01-16 00:00:01.000 -0400',
    '2022-01-15 00:00:01.000 -0400'
  ],
  [
    'should return 409 if payload\'s date range starts before and ends after another assignment belonging to associated employee',
    '2022-01-10 00:00:01.000 -0400',
    '2022-01-25 00:00:01.000 -0400'
  ], [
    'should return 409 if payload\'s date range starts after and ends before another assignment belonging to associated employee',
    '2022-01-16 00:00:01.000 -0400',
    '2022-01-19 00:00:01.000 -0400'
  ],
  [
    'should return 409 if payload\'s dates range starts before and ends inside an assignment belonging to associated employee',
    '2022-01-10 00:00:01.000 -0400',
    '2022-01-17 00:00:01.000 -0400'
  ],
  [
    'should return 409 if payload\'s dates range ends after and starts after an assignment belonging to associated employee',
    '2022-01-17 00:00:01.000 -0400',
    '2022-01-30 00:00:01.000 -0400'
  ],
  [
    'should return 409 if payload\'s startDate starts inside an assignment belonging to associated employee',
    '2022-01-17 00:00:01.000 -0400',
    null
  ]

]
describe.each(testCases)('POST validate overlap /assignments', (title, start, end) => {
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

  test(`${title}`, async () => {
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
      start_date: '2022-01-15 00:00:01.000 -0400',
      end_date: '2022-01-20 00:00:01.000 -0400'
    })
    const payload = serialize({
      start_date: start,
      end_date: end,
      employee: { id: assignment.employee_id },
      role: { id: assignment.role_id }
    })
    const response = await post(payload)
    expect(response.statusCode).toBe(409)
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
describe.each(testCases)('PATCH validate overlap /assignments', (title, start, end) => {
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

  test(`${title}`, async () => {
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
      start_date: faker.date.past(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.recent(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })

    const newAssignment = {
      start_date: faker.date.future(),
      end_date: faker.date.future(10, this.start_date),
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const oldAssignment = {
      start_date: '2022-01-15 00:00:01.000 -0400',
      end_date: '2022-01-20 00:00:01.000 -0400',
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const assignment = await Assignment.query().insertGraph(
      newAssignment,
      { relate: true }
    )
    // eslint-disable-next-line no-unused-vars
    const assignment2 = await Assignment.query().insertGraph(
      oldAssignment,
      { relate: true }
    )
    const payload = serialize({
      ...newAssignment,
      start_date: start,
      end_date: end
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
})
