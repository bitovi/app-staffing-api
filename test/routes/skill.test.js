const SkillModel = require('../../src/models/skill')

const URL = '/skills'

describe('skills', () => {
  const skillsToCleanup = []

  afterEach(async () => {
    await SkillModel.query().whereIn('id', skillsToCleanup).delete()
  })

  test('GET /skills', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET'
    })
    const json = JSON.parse(resp.body)
    const instance = json.data.find(s => s.id === skill.id)

    expect(instance).toBeTruthy()
    expect(instance.id).toEqual(skill.id)
    expect(instance.attributes.name).toEqual(skill.name)
  })

  test('GET /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await global.app.inject({
      url: `${URL}/${skill.id}`,
      method: 'GET'
    })
    const json = JSON.parse(resp.body)

    expect(json.data).toBeTruthy()
    expect(json.data.id).toEqual(skill.id)
    expect(json.data.attributes.name).toEqual(skill.name)
  })

  test('POST /skills', async () => {
    const resp = await global.app.inject({
      url: URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      payload: JSON.stringify({
        data: {
          type: 'skills',
          attributes: {
            name: 'Node'
          }
        }
      })
    })
    const json = JSON.parse(resp.body)
    expect(json.data).toBeTruthy()
    expect(json.data.attributes.name).toEqual('Node')

    skillsToCleanup.push(json.data.id)
  })

  test('PATCH /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await global.app.inject({
      url: `${URL}/${skill.id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      payload: JSON.stringify({
        data: {
          type: 'skills',
          id: skill.id,
          attributes: {
            name: 'React'
          }
        }
      })
    })
    expect(resp.statusCode).toEqual(204)
    const json = await SkillModel.query().findById(skill.id)
    expect(json.id).toEqual(skill.id)
    expect(json.name).toEqual('React')
  })

  test('DELETE /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await global.app.inject({
      url: `${URL}/${skill.id}`,
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })
    expect(resp.statusCode).toBe(204)
  })
})
