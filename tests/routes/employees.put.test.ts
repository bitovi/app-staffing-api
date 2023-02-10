import request from 'supertest'
import Chance from 'chance'
import { dateGenerator } from '../../src/utils/date'
import Serializer from '../../src/utils/json-api-serializer'
import map from 'lodash/map'
import range from 'lodash/range'
import cloneDeep from 'lodash/cloneDeep'

const chance = new Chance()

describe('PUT /api/Employee/:id', () => {
  const put = async (id, payload) => {
    const response = await request(global.app.callback())
      .put(`/api/Employee/${id}`)
      .set('Accept', 'application/vnd.api+json')
      .set('Content-Type', 'application/vnd.api+json')
      .send(serialize(payload))

    return response
  }

  const serialize = (body) => {
    return Serializer.serialize('employees', body)
  }

  test('should update date fields to null', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const response = await put(employee.id, {
      start_date: null,
      end_date: null
    })

    expect(response.statusCode).toBe(200)

    const {
      dataValues: { start_date, end_date }
    } = await Employee.findByPk(employee.id)

    expect(start_date).toBeNull()
    expect(end_date).toBeNull()
  })

  test('should return 422 for payload with startDate after endDate', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate
    })

    const response = await put(employee.id, {
      start_date: dates.afterEndDate,
      end_date: dates.beforeStartDate
    })

    expect(response.statusCode).toBe(422)
  })

  test("should return 422 when updates's payload has a startDate that is after endDate", async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const dates = dateGenerator()

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.past,
      end_date: dates.future
    })

    const response = await put(employee.id, {
      start_date: dates.future,
      end_date: dates.past
    })

    expect(response.statusCode).toBe(422)
  })
})
