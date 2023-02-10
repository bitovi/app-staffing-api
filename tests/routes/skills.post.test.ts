import Chance from 'chance'
import request from 'supertest'
import Serializer from '../../src/utils/json-api-serializer'

const chance = new Chance()

const serialize = (body) => {
  return Serializer.serialize('skills', body)
}

const post = async (payload) => {
  const response = await request(global.app.callback())
    .post('/api/Skill')
    .set('Accept', 'application/vnd.api+json')
    .set('Content-Type', 'application/vnd.api+json')
    .send(serialize(payload))

  return response
}

describe('POST /Skill', function () {
  test('should return 200 for valid payload', async function () {
    const payload = serialize({
      name: chance.word()
    })

    const response = await post(payload)

    expect(response.statusCode).toBe(200)
  })

  test('should return 422 for empty payload', async function () {
    const payload = serialize({})
    const response = await post(payload)
    expect(response.statusCode).toBe(422)
  })

  test('should return 409 for non-unique name', async function () {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const name = chance.word()

    await Skill.create({
      name: name
    })

    const response = await post({
      name
    })

    expect(response.statusCode).toBe(409)
  })
})
