const Employee = require('../../src/models/employee')
const Skills = require('../../src/models/skill')
const BASE_URL = '/employees'

let employeeIdsToCleanup = []
let skillsIdsToCleanup = []

afterAll(async () => {
  // needed promise all to prevent the app from hanging 🙃
  await Promise.all([
    Employee.query().whereIn('id', employeeIdsToCleanup).delete(),
    Skills.query().whereIn('id', skillsIdsToCleanup).delete()
  ])

  employeeIdsToCleanup = []
  skillsIdsToCleanup = []
})

test('should be able to insert employees', async () => {
  // create employees
  const payload = {
    data: {
      type: 'employees',
      attributes: {
        name: 'random' + Math.random()
      }
    }
  }

  const response = await global.app.inject({
    url: BASE_URL,
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const body = JSON.parse(response.body)
  const id = body?.data?.id
  employeeIdsToCleanup.push(id)

  // Check response status is not errorsome
  expect(body.title).toBeUndefined()
  expect(response.statusCode).toBe(201)

  // Check insert worked
  expect(body.data.attributes.name).toBe(payload.data.attributes.name)
  expect(id).toBeTruthy()
})

test('should be able to get employees', async () => {
  const employee1 = await Employee.query().insertAndFetch({
    name: 'random' + Math.random()
  })
  employeeIdsToCleanup.push(employee1.id)

  const employee2 = await Employee.query().insertAndFetch({
    name: 'random' + Math.random()
  })
  employeeIdsToCleanup.push(employee2.id)

  const targetEmployeeIds = [employee1.id, employee2.id]

  const resp = await global.app.inject({
    url: BASE_URL,
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const json = JSON.parse(resp.body)

  const employees = json.data
  expect(resp.statusCode).toBe(200)

  const ourEmployees = employees.filter(employee => targetEmployeeIds.includes(employee.id))
  expect(ourEmployees.length).toBe(2)
})

test('should be able to get employees with relationships', async () => {
  const react = {
    id: createUUID(),
    name: 'react'
  }
  const node = {
    id: createUUID(),
    name: 'node'
  }
  const michealScott = {
    id: createUUID(),
    name: 'Micheal Scott',
    skills: [react]
  }
  const dwightSchrute = {
    id: createUUID(),
    name: 'Dwight Schrute',
    skills: [node]
  }
  const records = [
    michealScott,
    dwightSchrute
  ]

  await Employee.query().upsertGraph(records, { insertMissing: true })

  employeeIdsToCleanup.push(michealScott.id, dwightSchrute.id)
  skillsIdsToCleanup.push(react.id, node.id)

  const resp = await global.app.inject({
    url: BASE_URL,
    query: {
      include: 'skills'
    },
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const json = JSON.parse(resp.body)

  const michealResult = json.data.find(({ id }) => michealScott.id === id)

  expect(michealResult.attributes).toEqual(expect.objectContaining({ name: michealScott.name }))
  expect(michealResult.relationships.skills.data).toEqual([expect.objectContaining({ id: react.id })])

  const dwightResult = json.data.find(({ id }) => dwightSchrute.id === id)

  expect(dwightResult.attributes).toEqual(expect.objectContaining({ name: dwightSchrute.name }))
  expect(dwightResult.relationships.skills.data).toEqual([expect.objectContaining({ id: node.id })])
})

test('should be able to get one employee with relationships', async () => {
  const react = {
    id: createUUID(),
    name: 'react'
  }
  const michealScott = {
    id: createUUID(),
    name: 'Micheal Scott',
    skills: [react]
  }
  await Employee.query().upsertGraph(michealScott, { insertMissing: true })

  employeeIdsToCleanup.push(michealScott.id)
  skillsIdsToCleanup.push(react.id)

  const resp = await global.app.inject({
    url: `${BASE_URL}/${michealScott.id}`,
    query: {
      include: 'skills'
    },
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const json = JSON.parse(resp.body)

  console.log(JSON.stringify(json, null, 2))

  expect(json.data.id).toBe(michealScott.id)
  expect(json.data.attributes).toEqual(expect.objectContaining({
    name: michealScott.name
  }))
  expect(json.data.relationships.skills.data).toEqual([expect.objectContaining({ id: react.id })])
})

test('should be able to get one employee', async () => {
  const employee1 = await Employee.query().insertAndFetch({
    name: 'random' + Math.random()
  })
  employeeIdsToCleanup.push(employee1.id)

  const resp = await global.app.inject({
    url: `${BASE_URL}/${employee1.id}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  const json = JSON.parse(resp.body)

  const employee = json.data
  expect(resp.statusCode).toBe(200)

  expect(employee.id).toBe(employee1.id)
})

test('should be able to update an employee', async () => {
  const employee1 = await Employee.query().insertAndFetch({
    name: 'random' + Math.random()
  })
  employeeIdsToCleanup.push(employee1.id)

  const newName = 'name'

  const resp = await global.app.inject({
    url: `${BASE_URL}/${employee1.id}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/vnd.api+json' },
    body: JSON.stringify({
      data: {
        type: 'employees',
        id: employee1.id,
        attributes: {
          name: newName
        }
      }
    })
  })
  const json = JSON.parse(resp.body)

  const employee = json.data
  expect(json.title).toBeUndefined()
  expect(resp.statusCode).toBe(200)

  expect(employee.id).toBe(employee1.id)
  expect(employee.attributes.name).toBe(newName)
})

test('should be able to delete an employee', async () => {
  const employee1 = await Employee.query().insertAndFetch({
    name: 'random' + Math.random()
  })

  const resp = await global.app.inject({
    url: `${BASE_URL}/${employee1.id}`,
    method: 'DELETE'
  })

  expect(resp.statusCode).toBe(204)

  const deletedEmployee = await Employee.query().findById(employee1.id)
  expect(deletedEmployee).toBeUndefined()
})

test('should return 404 for getting non existing employees', async () => {
  const randomid = createUUID()
  const resp = await global.app.inject({
    url: `${BASE_URL}/${randomid}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/vnd.api+json' }
  })
  expect(resp.statusCode).toBe(404)
})

// TODO: delete non-existant entity should throw a 404 not found

function createUUID () {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}
