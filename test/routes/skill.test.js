const fetch = require('node-fetch')
const config = require('../../src/config')

const { start, stop } = require('../../src/server')
const URL = `http://localhost:${config.get('APP_PORT')}/skills`
const SkillModel = require('../../src/models/skill')

describe('skills', () => {
  const skillsToCleanup = []

  beforeAll(async () => {
    await start()
  })

  afterAll(async () => {
    await stop()
  })

  afterEach(async() => {
    await SkillModel.query().whereIn('id', skillsToCleanup).delete()
  })

  test('GET /skills', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await fetch(URL)
    const json = await resp.json()
    const instance = json.data.find(s => s.id === skill.id)

    expect(instance).toBeTruthy()
    expect(instance.id).toEqual(skill.id)
    expect(instance.attributes.name).toEqual(skill.name)

  })

  test('GET /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await fetch(`${URL}/${skill.id}`)
    const json = await resp.json()

    expect(json.data).toBeTruthy()
    expect(json.data.id).toEqual(skill.id)
    expect(json.data.attributes.name).toEqual(skill.name)
  })

  test('POST /skills', async () => {
    const resp = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'skills',
          attributes: {
            name: 'Node'
          }
        }
      })
    })
    const json = await resp.json()
    expect(json.data).toBeTruthy()
    expect(json.data.attributes.name).toEqual('Node')

    skillsToCleanup.push(json.data.id)
  })

  test('PATCH /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await fetch(`${URL}/${skill.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      },
      body: JSON.stringify({
        data: {
          type: 'skills',
          attributes: {
            name: 'React'
          }
        }
      })
    })
    const json = await resp.json()
    expect(json.data).toBeTruthy()
    expect(json.data.id).toEqual(skill.id)
    expect(json.data.attributes.name).toEqual('React')
  })

  test('DELETE /skills/:id', async () => {
    const skill = await SkillModel.query().insert({ name: 'Node' })

    skillsToCleanup.push(skill.id)

    const resp = await fetch(`${URL}/${skill.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/vnd.api+json'
      }
    })
    expect(resp.status).toBe(204)
  })
})

