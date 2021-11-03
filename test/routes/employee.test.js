const Employee = require('../../src/models/employee')
const BASE_URL = '/employees'

let employeeIdsToCleanup = []

afterAll(async () => {
  await Employee.query().whereIn('id', employeeIdsToCleanup).delete()
  employeeIdsToCleanup = []
})

test('should be able to insert employees', async () => {
  // create employees
  const payload = {
    data: {
      type: 'employee',
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
        type: 'employee',
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
