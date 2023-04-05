import request from 'supertest'
import Chance from 'chance'
import Serializer from '../../src/utils/json-api-serializer'

const chance = new Chance()

describe('PUT /api/skills/:id', () => {
  const put = async (id, payload) => {
    const response = await request(global.app.callback())
      .put(`/api/skills/${id}`)
      .set('Accept', 'application/vnd.api+json')
      .set('Content-Type', 'application/vnd.api+json')
      .send(serialize(payload))

    return response
  }

  const serialize = (body) => {
    return Serializer.serialize('skills', body)
  }

  test('should return 200 if update is successful', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const oldSkill = await Skill.create({ name: chance.word() })

    const payload = serialize({
      name: chance.word()
    })
    const response = await put(oldSkill.id, payload)
    expect(response.statusCode).toBe(200)
  })

  test('should return 409 if payload has non-unique name', async () => {
    const { Assignment, Employee, Project, Role, Skill } = global.model

    const oldSkill = await Skill.create({ name: chance.word() })

    const skill = await Skill.create({ name: chance.word() })

    const response = await put(oldSkill.id, {
      name: skill.name
    })

    expect(response.statusCode).toBe(409)
  })
})
