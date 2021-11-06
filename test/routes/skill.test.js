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

  test('GET /skills sorted asc', async () => {
    const [react, node, angular] = await SkillModel.query().insert([
      {
        name: 'React'
      },
      {
        name: 'Node'
      },
      {
        name: 'Angular'
      }
    ])

    skillsToCleanup.push(react.id, node.id, angular.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        sort: 'name'
      }
    })
    const json = JSON.parse(resp.body)

    const angularIndex = json.data.findIndex(({ id }) => id === angular.id)
    const nodeIndex = json.data.findIndex(({ id }) => id === node.id)
    const reactIndex = json.data.findIndex(({ id }) => id === react.id)

    expect(reactIndex).toBeGreaterThan(nodeIndex)
    expect(nodeIndex).toBeGreaterThan(angularIndex)
  })

  test('GET /skills sorted desc', async () => {
    const [react, node, angular] = await SkillModel.query().insert([
      {
        name: 'React'
      },
      {
        name: 'Node'
      },
      {
        name: 'Angular'
      }
    ])

    skillsToCleanup.push(react.id, node.id, angular.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        sort: '-name'
      }
    })
    const json = JSON.parse(resp.body)

    const angularIndex = json.data.findIndex(({ id }) => id === angular.id)
    const nodeIndex = json.data.findIndex(({ id }) => id === node.id)
    const reactIndex = json.data.findIndex(({ id }) => id === react.id)

    expect(reactIndex).toBeLessThan(nodeIndex)
    expect(nodeIndex).toBeLessThan(angularIndex)
  })

  test('GET /skills sorted on invalid key', async () => {
    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        sort: 'fooBar'
      }
    })

    expect(resp.statusCode).toBe(400)
  })

  test('GET /skills paginated', async () => {
    const [react, node, angular] = await SkillModel.query().insert([
      {
        name: 'React'
      },
      {
        name: 'Node'
      },
      {
        name: 'Angular'
      }
    ])

    skillsToCleanup.push(react.id, node.id, angular.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'page[number]': '0',
        'page[size]': '2'
      }
    })
    const json = JSON.parse(resp.body)

    expect(json.data.length).toBe(2)
  })
  // not needed, paging is cleaned? is that ok?
  test.skip('GET /skills paginated invalid page key', async () => {
    const [react, node, angular] = await SkillModel.query().insert([
      {
        name: 'React'
      },
      {
        name: 'Node'
      },
      {
        name: 'Angular'
      }
    ])

    skillsToCleanup.push(react.id, node.id, angular.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'page[fooBar]': '0'
      }
    })

    expect(resp.statusCode).toBe(400)
  })

  test('GET /skills filter', async () => {
    const react = await SkillModel.query().insert({
      name: '' + Math.random()
    })

    skillsToCleanup.push(react.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'filter[name]': react.name
      }
    })

    const json = JSON.parse(resp.body)

    expect(resp.statusCode).toBe(200)
    expect(json.data[0].attributes.name).toBe(react.name)
  })

  test('GET /skills filter invalid field', async () => {
    const react = await SkillModel.query().insert({
      name: '' + Math.random()
    })

    skillsToCleanup.push(react.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'filter[foobar]': react.name
      }
    })

    expect(resp.statusCode).toBe(400)
  })

  test('GET /skills filter like', async () => {
    const react = await SkillModel.query().insert({
      name: '' + Math.random()
    })

    skillsToCleanup.push(react.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'filter[name]': react.name.slice(0, -2)
      }
    })

    const json = JSON.parse(resp.body)

    expect(resp.statusCode).toBe(200)
    expect(json.data[0].attributes.name).toBe(react.name)
  })

  test('GET /skills filter and sort', async () => {
    const [react, reactNative] = await SkillModel.query().insert([
      {
        name: 'React'
      },
      {
        name: 'React Native'
      }
    ])

    skillsToCleanup.push(react.id, reactNative.id)

    const resp = await global.app.inject({
      url: URL,
      method: 'GET',
      query: {
        'filter[name]': 'React',
        sort: 'name'
      }
    })

    const json = JSON.parse(resp.body)

    const reactIndex = json.data.findIndex(({ id }) => id === react.id)
    const reactNativeIndex = json.data.findIndex(({ id }) => id === reactNative.id)

    expect(resp.statusCode).toBe(200)
    expect(reactIndex).toBeLessThan(reactNativeIndex)
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
