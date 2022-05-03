const faker = require('faker')

const Role = require('../../src/models/role')
const Project = require('../../src/models/project')
const Employee = require('../../src/models/employee')
const Assignment = require('../../src/models/assignment')
const { Serializer } = require('../../src/json-api-serializer')

describe('Overlapping assignments are prevented while multiple records are inserted at the same time', function () {
  const idList = []
  let project
  let role
  let employee
  beforeAll(async () => {
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
      start_date: faker.date.recent(),
      start_confidence: faker.datatype.number(10),
      end_date: faker.date.future(),
      end_confidence: faker.datatype.number(10),
      project_id: project.id
    })
  })

  afterAll(async () => {
    await Project.query().findById(project.id).delete()
    await Employee.query().findById(employee.id).delete()
    await Role.query().findById(role.id).delete()
    await deleteIds(idList)
  })

  test.concurrent.each(
    [
      ['insert is successful, should return 201', '0001-01-15 00:00:01.000 -0000', '0001-03-20 00:00:01.000 -0000', 201],
      ['overlap detected, should return 409', '0001-02-15 00:00:01.000 -0000', '0001-03-22 00:00:01.000 -0000', 409],
      ['overlap detected, should return 409', '0001-01-01 00:00:01.000 -0000', '0002-03-01 00:00:01.000 -0000', 409],
      ['insert is successful, should return 201', '0002-02-15 00:00:01.000 -0000', '0002-03-20 00:00:01.000 -0000', 201],
      ['overlap detected, should return 409', '0002-02-15 00:00:01.000 -0000', '0002-03-27 00:00:01.000 -0000', 409]
    ])('%s', async (title, start, end, expected) => {
    const newAssignment = {
      start_date: start,
      end_date: end,
      employee: { id: employee.id },
      role: { id: role.id }
    }
    const payload = serialize(newAssignment)
    const response = await post(payload)
    // if (expected === 201) Assignment.query().timeout(99990000000000000000)
    if (response.statusCode === 201) idList.push(response.headers.location.split('/')[2])
    expect(response.statusCode).toEqual(expected)
  }, 0)

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
describe('Overlapping assignments are prevented while multiple records are updated concurrently', function () {
  const idList = []
  let project
  let role
  let employee
  let assignment
  let newAssignment
  beforeAll(async () => {
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
      start_date: faker.date.recent(),
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
  })
  afterAll(async () => {
    await deleteIds(idList)
    await Project.query().findById(project.id).delete()
    await await Employee.query().findById(employee.id).delete()
    await Role.query().findById(role.id).delete()
    await Assignment.query().findById(assignment.id).delete()
  })

  test.concurrent.each(
    [
      ['patch is successful, should return 200', '0008-01-15 00:00:01.000 -0000', '0008-03-20 00:00:01.000 -0000', 200],
      ['overlap detected, should return 409', '0008-02-15 00:00:01.000 -0000', '0008-03-20 00:00:01.000 -0000', 409],
      ['overlap detected, should return 409', '0008-01-01 00:00:01.000 -0000', '0008-02-20 00:00:01.000 -0000', 409],
      ['overlap detected, should return 409', '0008-02-15 00:00:01.000 -0000', null, 409],
      ['patch is successful, should return 200', '0005-02-15 00:00:01.000 -0000', '0005-03-20 00:00:01.000 -0000', 200],
      ['overlap detected, should return 409', '0005-02-17 00:00:01.000 -0000', '0005-03-20 00:00:01.000 -0000', 409]

    ])('%s', async (title, start, end, expected) => {
    const payload = serialize({
      ...newAssignment,
      start_date: start,
      end_date: end
    })
    const response = await patch(assignment.id, payload)
    if (response.statusCode === 200) idList.push(response.payload.split(',')[3].split('"')[3])
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

async function deleteIds (idList) {
  for (const id of idList) {
    await Assignment.query().delete().where({ id: id })
  }
}
