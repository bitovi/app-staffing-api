const faker = require('faker')
const map = require('lodash/map')
const range = require('lodash/range')
const cloneDeep = require('lodash/cloneDeep')
const { transaction, Model } = require('objection')

const Skill = require('../../src/models/skill')
const Employee = require('../../src/models/employee')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/date-utils')

describe('PATCH /employees/:id', function () {
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

  test('should return 404 if employee id does not exist', async function () {
    const dates = dateGenerator()
    const notFoundId = faker.datatype.uuid()
    const payload = serialize({
      id: notFoundId,
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })
    const response = await patch(notFoundId, payload)
    expect(response.statusCode).toBe(404)
  })

  test('should return 409 if employee skill does not exist', async function () {
    const dates = dateGenerator()

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const employeeSkills = await employee.$relatedQuery('skills')
    expect(employeeSkills).toHaveLength(0)

    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.skills = [
      faker.datatype.uuid(),
      faker.datatype.uuid(),
      faker.datatype.uuid()
    ]

    const payload = serialize(updatedEmployee)
    const response = await patch(employee.id, payload)
    expect(response.statusCode).toBe(409)
  })

  test('should add skills to employee record without previous relations', async function () {
    const dates = dateGenerator()

    // create an employee record with no skills
    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const employeeSkills = await employee.$relatedQuery('skills')
    expect(employeeSkills).toHaveLength(0)

    // create some skills records
    const howManySkills = 3
    const skills = await Skill.query()
      .insert(
        range(howManySkills).map(() => ({
          name: faker.lorem.word()
        }))
      )
      .returning('*')

    // Update the employee to have the skills we just created
    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.skills = map(skills, 'id')

    const payload = serialize(updatedEmployee)
    const response = await patch(employee.id, payload)

    // must return 200 and include updated employee in the body
    expect(response.statusCode).toBe(200)
    const responseBody = deserialize(JSON.parse(response.body)
    )
    expect(responseBody.skills).toHaveLength(updatedEmployee.skills.length)

    // make sure the employee associated skills are updated correctly
    const updatedEmployeeSkills = await employee.$relatedQuery('skills')
    expect(updatedEmployeeSkills).toHaveLength(howManySkills)
    expect(map(updatedEmployeeSkills, 'id')).toEqual(
      expect.arrayContaining(map(skills, 'id'))
    )
  })

  test('should return 200 when updating employee with existing skills', async function () {
    const dates = dateGenerator()

    // first create an employee with associated skills in the DB
    const howManySkills = 3
    const skills = await Skill.query()
      .insert(
        range(howManySkills).map((num) => ({
          name: faker.lorem.word() + num
        }))
      )
      .returning('*')

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })
    await employee.$relatedQuery('skills').relate(map(skills, 'id'))

    // make sure the skills are related to the employee
    const employeeSkills = await employee.$relatedQuery('skills')
    expect(skills).toEqual(expect.arrayContaining(employeeSkills))

    // Update the employee so it only has 1 skill
    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.skills = [employeeSkills[0].id]

    const payload = serialize(updatedEmployee)
    const response = await patch(employee.id, payload)
    expect(response.statusCode).toBe(200)

    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.skills).toHaveLength(1)

    // make sure the employee associated skills are updated correctly
    const updatedEmployeeSkills = await employee.$relatedQuery('skills')
    expect(updatedEmployeeSkills).toHaveLength(1)
    expect(updatedEmployeeSkills[0].id).toEqual(employeeSkills[0].id)
  })

  test('should update date fields to null', async function () {
    const dates = dateGenerator()

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.start_date = null
    updatedEmployee.end_date = null

    const payload = serialize(updatedEmployee)
    const response = await patch(employee.id, payload)

    expect(response.statusCode).toBe(200)
    const responseBody = deserialize(JSON.parse(response.body))
    expect(responseBody.start_date).toBeNull()
    expect(responseBody.end_date).toBeNull()
    console.log(responseBody)
    const dbEmployee = await Employee.query().findById(employee.id)
    console.log(dbEmployee)
    expect(dbEmployee.start_date).toBeNull()
    expect(dbEmployee.end_date).toBeNull()
  })
  test('should return 422 for payload with startDate after endDate', async function () {
    const dates = dateGenerator()

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.start_date = dates.afterEndDate
    updatedEmployee.end_date = dates.beforeStartDate

    const payload = serialize(updatedEmployee)
    const response = await patch(employee.id, payload)

    expect(response.statusCode).toBe(422)
  })

  test('should return 422 when updates\'s payload has a startDate that is after endDate', async function () {
    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: faker.date.past(),
      end_date: faker.date.future()
    })

    const updatedEmployee = cloneDeep(employee)
    updatedEmployee.start_date = faker.date.future()
    updatedEmployee.end_date = faker.date.past()

    const payload = Serializer.serialize('employees', updatedEmployee)
    const response = await patch(employee.id, payload)

    expect(response.statusCode).toBe(422)
  })

  function patch (id, payload) {
    return global.app.inject({
      method: 'PATCH',
      url: `/employees/${id}`,
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }
  function serialize (obj) {
    return Serializer.serialize('employees', obj)
  }
  function deserialize (obj) {
    return Serializer.deserialize('employees', obj)
  }
})
