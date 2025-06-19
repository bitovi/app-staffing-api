const faker = require('faker')
const range = require('lodash/range')
const { transaction, Model } = require('objection')

const Skill = require('../../src/models/skill')
const Employee = require('../../src/models/employee')
const { Serializer } = require('../../src/json-api-serializer')
const { dateGenerator } = require('../../src/utils/date-utils')

describe('GET /employees (filtered) TODO make better name', function () {
  let trx
  const knex = Model.knex()
  let skills = []
  let employees = []

  beforeEach(async () => {
    trx = await transaction.start(knex)
    Model.knex(trx)
    await makeData()
  })

  afterEach(async () => {
    await trx.rollback()
    Model.knex(knex)
    skills = []
    employees = []
  })

  test('should return single employee that matches filter', async function () {
    const response = await get(`/employees?filter[name][$eq]=${employees[0].name}`)
    const json = JSON.parse(response.body)
    const results = json.data
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)

    // console.log(JSON.stringify(json, null, 2))
  })

  // the "name" column exists on both the skills and employees tables, filtering logic needs to be explicit
  test('should not throw column reference "name" is ambiguous error because of filter', async function () {
    const response = await get(`/employees?filter[name][$eq]=${employees[0].name}&include=skills`)
    const json = JSON.parse(response.body)
    const results = json.data
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)
  })

  test('should filter on related fields', async function () {
    const response = await get(`/employees?filter[skills.name][$eq]=${skills[0].name}&include=skills`)
    const json = JSON.parse(response.body)
    const results = json.data
    expect(Array.isArray(results)).toBe(true)
    expect(results.length).toBe(1)

    console.log(JSON.stringify(json, null, 2))
  })

  async function makeData () {
    const dates = dateGenerator()

    // create some skills records
    const howManySkills = 3
    skills = skills.concat(await Skill.query()
      .insert(
        range(howManySkills).map((num) => ({
          name: faker.lorem.word() + num
        }))
      )
      .returning('*')
    )

    // create some employees records
    // employee 1
    let employee = {
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: [skills[0].id, skills[1].id]
    }
    let payload = serialize(employee)
    let response = await post(payload)
    expect(response.statusCode).toBe(201)

    let body = JSON.parse(response.body)
    employees.push(await Employee.query().findById(body.data.id))

    // employee 2
    employee = {
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      skills: [skills[1].id, skills[2].id]
    }
    payload = serialize(employee)
    response = await post(payload)
    expect(response.statusCode).toBe(201)

    body = JSON.parse(response.body)
    employees.push(await Employee.query().findById(body.data.id))
  }

  function post (payload) {
    return global.app.inject({
      method: 'POST',
      url: '/employees',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      },
      payload: JSON.stringify(payload)
    })
  }

  function get (url) {
    return global.app.inject({
      url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
  }

  function serialize (obj) {
    return Serializer.serialize('employees', obj)
  }
})
