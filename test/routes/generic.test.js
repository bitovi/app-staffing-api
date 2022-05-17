const faker = require('faker')
const omitBy = require('lodash/omitBy')
const isUndefined = require('lodash/isUndefined')
const schema = require('./schema')
const { dateGenerator } = require('../../src/utils/date-utils')

const routesWithIndividualTests = new Map([
  ['assignments', true],
  ['roles', true]
])

const routesSchemas = schema.routes.map((route) =>
  Object.assign(route, {
    // Use the route name when generating test titles with %s
    toString () {
      return this.routeName
    }
  })
)
const schemasForGenericTests = routesSchemas.filter(
  r => !routesWithIndividualTests.has(r.routeName)
)

describe.each(schemasForGenericTests)('POST /%s', (myroute) => {
  const createdIDs = {}

  afterAll(async () => {
    await deleteCreatedIDs(createdIDs)
  })

  it('should insert row and return the new record id', async () => {
    const obj = {}
    const required = myroute.required
    const foreignKeys = myroute?.foreignKeys || {}
    const primaryKeys = myroute?.primaryKeys || ['id']
    const pkey = primaryKeys[0]
    const routeName = myroute.routeName
    const dates = dateGenerator()

    if (myroute?.foreignKeys) {
      for (const [key, value] of Object.entries(foreignKeys)) {
        const createdObj = await createDbObject(key, createdIDs, dates)
        // console.log('POST createdObj', createdObj)
        const keyFrom = createdObj[value.from]
        obj[value.into] = keyFrom
      }
    }
    for (const [key, value] of Object.entries(myroute.properties)) {
      if (required.includes(key) && !obj[key] && key !== pkey) {
        obj[key] = createFakeData(key, value, dates)
      }
    }
    const testBody = {
      data: {
        type: routeName,
        attributes: { ...obj }
      }
    }

    const response = await global.app.inject({
      url: `${routeName}`,
      body: JSON.stringify(testBody),
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      }
    })

    expect(response.statusCode).toEqual(201)

    const result = JSON.parse(response.body)
    // use console.log to get sample request and response
    // console.log('testBody', testBody)
    // console.log('result', result)
    expect(result?.data).toHaveProperty(pkey)
    expect(result?.links?.self).toBe(`/${routeName}/${result.data[pkey]}`)

    // add to list to be deleted with afterAll
    createdIDs[routeName] = createdIDs[routeName] || []
    const idObj = {}
    idObj[pkey] = result.data[pkey]
    createdIDs[routeName].push(idObj)
  })

  it('should fail with 422 if payload is missing required field', async () => {
    const obj = {}
    const required = myroute.required
    const foreignKeys = myroute?.foreignKeys || {}
    const primaryKeys = myroute?.primaryKeys || ['id']
    const pkey = primaryKeys[0]
    const routeName = myroute.routeName
    const dates = dateGenerator()

    if (myroute?.foreignKeys) {
      for (const [key, value] of Object.entries(foreignKeys)) {
        const createdObj = await createDbObject(key, createdIDs, dates)
        // console.log('POST createdObj', createdObj)
        const keyFrom = createdObj[value.from]
        obj[value.into] = keyFrom
      }
    }
    for (const [key, value] of Object.entries(myroute.properties)) {
      if (required.includes(key) && !obj[key] && key !== pkey) {
        obj[key] = createFakeData(key, value, dates)
      }
    }
    const testBody = {
      data: {
        type: routeName,
        attributes: { ...obj }
      }
    }
    // Remove one required column at a time and test
    for (let i = 0; i < required.length; i++) {
      const missingTestBody = { ...testBody }

      delete missingTestBody.data.attributes[required[i]]

      const response = await global.app.inject({
        url: `${routeName}`,
        body: JSON.stringify(missingTestBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.statusCode).toEqual(422)
      if (response.statusCode === 201) {
        const result = JSON.parse(response.body)

        // add to list to be deleted with afterAll
        createdIDs[routeName] = createdIDs[routeName] || []
        const idObj = {}
        idObj[pkey] = result.data[pkey]
        createdIDs[routeName].push(idObj)
      }
    }
  })

  it('should fail with 422 if payload has unknown fields', async () => {
    const { routeName, required, properties, primaryKeys } = myroute
    const primaryKey = primaryKeys[0]
    const dates = dateGenerator()

    const attrs = {
      aPropertyMissingFromTheSchema: 'foo bar baz'
    }

    // make sure the payload includes required properties
    for (const [key, value] of Object.entries(properties)) {
      if (required.includes(key) && !(key in attrs) && key !== primaryKey) {
        attrs[key] = createFakeData(key, value, dates)
      }
    }

    const response = await global.app.inject({
      url: `${routeName}`,
      body: JSON.stringify({
        data: {
          type: routeName,
          attributes: attrs
        }
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      }
    })

    expect(response.statusCode).toEqual(422)
    const { title } = JSON.parse(response.body)
    expect(title).toBe('body should NOT have additional properties')
  })
})

describe.each(schemasForGenericTests)('PATCH /%s', (myroute) => {
  const createdIDs = {}
  const required = myroute.required
  const foreignKeys = myroute.foreignKeys || {}
  const primaryKeys = myroute.primaryKeys || ['id']
  const pkey = primaryKeys[0]
  const routeName = myroute.routeName
  const dates = dateGenerator()

  afterAll(async () => {
    await deleteCreatedIDs(createdIDs)
  })

  it('should update record', async () => {
    const createdObj = await createDbObject(routeName, createdIDs, dates)

    const obj = {}
    let sampleProperty
    if (myroute?.foreignKeys) {
      for (const [key, value] of Object.entries(foreignKeys)) {
        const createdObj = await createDbObject(key, createdIDs, dates)
        // console.log('POST createdObj', createdObj)
        const keyFrom = createdObj[value.from]
        obj[value.into] = keyFrom
      }
    }
    for (const [key, value] of Object.entries(myroute.properties)) {
      if (required.includes(key) && !obj[key] && key !== pkey) {
        obj[key] = createFakeData(key, value, dates)
        if (!sampleProperty) {
          sampleProperty = key
        }
      }
    }

    const testBody = {
      data: {
        type: routeName,
        attributes: { ...obj }
      }
    }
    testBody.data[pkey] = createdObj[pkey]

    const response = await global.app.inject({
      url: `${routeName}/${createdObj[pkey]}`,
      body: JSON.stringify(testBody),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      }
    })
    expect(response.statusCode).toEqual(200)
    const result = await myroute.model.query().findById(createdObj[pkey])
    expect(result[sampleProperty]).toEqual(obj[sampleProperty])
  })

  it('should fail with 422 if payload has unknown fields', async () => {
    const dates = dateGenerator()

    const dbRecord = await createDbObject(routeName, createdIDs, dates)

    // json:api payload attributes
    const attrs = {
      aPropertyMissingFromTheSchema: 'foo bar baz'
    }

    // create the database records for the resource relationships
    for (const [key, value] of Object.entries(foreignKeys)) {
      const createdObj = await createDbObject(key, createdIDs, dates)
      const keyFrom = createdObj[value.from]
      attrs[value.into] = keyFrom
    }

    // make sure the payload includes required attributes
    for (const [key, value] of Object.entries(myroute.properties)) {
      if (required.includes(key) && !(key in attrs) && key !== pkey) {
        attrs[key] = createFakeData(key, value, dates)
      }
    }

    const pkeyValue = dbRecord[pkey]
    const payload = {
      data: {
        type: routeName,
        [pkey]: pkeyValue,
        attributes: { ...attrs }
      }
    }

    const response = await global.app.inject({
      url: `${routeName}/${pkeyValue}`,
      body: JSON.stringify(payload),
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/vnd.api+json',
        Accept: 'application/vnd.api+json'
      }
    })
    expect(response.statusCode).toEqual(422)
    const { title } = JSON.parse(response.body)
    expect(title).toBe('body should NOT have additional properties')
  })
})

describe.each(routesSchemas)('DELETE /%s', (myroute) => {
  const createdIDs = {}

  afterAll(async () => {
    await deleteCreatedIDs(createdIDs)
  })

  it('should delete record and return 204', async () => {
    const dates = dateGenerator()

    const primaryKeys = myroute?.primaryKeys || ['id']
    const pkey = primaryKeys[0]
    const routeName = myroute.routeName

    const createdObj = await createDbObject(routeName, createdIDs, dates)

    const response = await global.app.inject({
      url: `${routeName}/${createdObj[pkey]}`,
      method: 'DELETE'
    })
    expect(response.statusCode).toEqual(204)

    const deletedObj = await myroute.model.query().findById(createdObj[pkey])

    expect(deletedObj).toBeUndefined()
  })

  it('should return 404 if record does not exist', async () => {
    const routeName = myroute.routeName

    const response = await global.app.inject({
      url: `${routeName}/7761b531-50b7-457e-803e-dd8897f86dd2`,
      method: 'DELETE'
    })
    expect(response.statusCode).toEqual(404)
  })
})

describe.each(routesSchemas)('%s: GET Listing Component Tests', (myroute) => {
  const primaryKeys = myroute?.primaryKeys || ['id']
  const pkey = primaryKeys[0]
  const properties = myroute.properties
  const createdObjects = []
  const objname = myroute.routeName
  const createdIDs = {}
  const dates = dateGenerator()

  beforeAll(async () => {
    // create 4 of objname, why not a loop you might ask.
    for (let i = 0; i < 8; i++) {
      createdObjects[i] = await createDbObject(objname, createdIDs, dates)
    }
  })

  afterAll(async () => {
    await deleteCreatedIDs(createdIDs)
  })

  test(`GET: should get listing for GET /${objname}`, async () => {
    expect.assertions(4)
    const resp = await global.app.inject({
      url: objname,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data
    expect(resp.statusCode).toBe(200)
    expect(results.length).toBeGreaterThan(1)
    expect(results.findIndex(el => el[pkey] === createdObjects[0][pkey])).toBeGreaterThan(-1)
    expect(results.findIndex(el => el[pkey] === createdObjects[1][pkey])).toBeGreaterThan(-1)
  })

  test(`GET by ID: should get 1 row for GET /${objname}/id`, async () => {
    const id = createdObjects[0][pkey]
    const url = `${objname}/${id}`

    expect.assertions(2)

    const resp = await global.app.inject({
      url: url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data

    expect(resp.statusCode).toBe(200)
    expect(results[pkey]).toBe(id)
  })

  test(`GET by NONE-EXISTING-ID: should return 404. GET /${objname}/nonexisting`, async () => {
    const url = `${objname}/f3eae4c7-1234-409f-9a84-8d66df519876`

    const resp = await global.app.inject({
      url: url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    expect(resp.statusCode).toBe(404)
  })

  // test Pagination
  test(`GET /${objname} paginated with links`, async () => {
    const response = await global.app.inject({
      url: `${objname}`,
      method: 'GET',
      query: {
        'page[number]': '1',
        'page[size]': '2'
      }
    })
    const results = JSON.parse(response.body)
    expect(results.data.attributes.results.length).toBe(2)
    const selfLinkParams = (new URL('http://localhost:3000/' + results?.links?.self)).searchParams

    expect(selfLinkParams.get('page[number]')).toBe('1')
    expect(selfLinkParams.get('page[size]')).toBe('2')

    const nextLinkParams = (new URL('http://localhost:3000/' + results?.links?.next)).searchParams
    expect(nextLinkParams.get('page[number]')).toBe('2')
    expect(selfLinkParams.get('page[size]')).toBe('2')

    const prevLinkParams = (new URL('http://localhost:3000/' + results?.links?.prev)).searchParams
    expect(prevLinkParams.get('page[number]')).toBe('0')
    expect(prevLinkParams.get('page[size]')).toBe('2')
  })

  // test Invalid Pagination
  test(`GET /${objname} with invalid page[number]`, async () => {
    const response = await global.app.inject({
      url: `${objname}`,
      method: 'GET',
      query: {
        'page[number]': '-1',
        'page[size]': '2'
      }
    })
    expect(response.statusCode).toBe(400)
  })

  // test Invalid Page size
  test(`GET /${objname} with invalid page[size]`, async () => {
    const response = await global.app.inject({
      url: `${objname}`,
      method: 'GET',
      query: {
        'page[number]': '1',
        'page[size]': '0'
      }
    })
    expect(response.statusCode).toBe(400)
  })

  // testing SORT
  const props = Object.keys(properties).filter(prop => !myroute.relations.includes(prop))
  test.each(props)(`SORT ${objname}?sort=%s`, async (prop) => {
    // expect.assertions(2)
    // console.log(objname, relation)
    const resp = await global.app.inject({
      url: `${objname}`,
      query: { sort: `${prop}` },
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data
    expect(resp.statusCode).toBe(200)
    // console.log('results', results)
    expect(results.length).toBeGreaterThan(0)
    const index1 = results.findIndex(el => el[pkey] === createdObjects[0][pkey])
    const index2 = results.findIndex(el => el[pkey] === createdObjects[1][pkey])
    if (createdObjects[1][prop] !== createdObjects[0][prop]) {
      expect(index2 > index1).toBe(createdObjects[1][prop] > createdObjects[0][prop])
    }
  })
  // Testing SORT DESC
  test.each(props)(`SORT DESC ${objname}?sort=-%s`, async (prop) => {
    // expect.assertions(2)
    // console.log(objname, relation)
    const resp = await global.app.inject({
      url: `${objname}`,
      query: { sort: `-${prop}` },
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data
    expect(resp.statusCode).toBe(200)
    // console.log('results', results)
    expect(results.length).toBeGreaterThan(0)
    const index1 = results.findIndex(el => el[pkey] === createdObjects[0][pkey])
    const index2 = results.findIndex(el => el[pkey] === createdObjects[1][pkey])
    if (createdObjects[1][prop] !== createdObjects[0][prop]) {
      expect(index2 > index1).toBe(createdObjects[1][prop] < createdObjects[0][prop])
    }
  })

  // testing SORT on invalid key
  test(`SORT on non-existing: ${objname}?sort=foobooNo`, async () => {
    const routeName = myroute.routeName
    const result = await global.app.inject({
      url: `${routeName}`,
      method: 'GET',
      query: {
        sort: 'foobooNo'
      }
    })
    expect(result.statusCode).toBe(400)
  })

  // Testing FILTER
  // @TODO: fix after fixing swagger schema
  test.each(props.filter(el => properties[el]?.format !== 'uuid'))(`FILTER ${objname}?filter[%s]=`, async (prop) => {
    const isString = properties[prop].type === 'string'
    const unixTime = Date.parse(createdObjects[0][prop]) || new Date()
    const filterby = (isString && unixTime) ? (new Date(unixTime)).toISOString().slice(0, 10) || createdObjects[0][prop] : createdObjects[0][prop]
    const url = `${objname}?filter[${prop}]=${filterby}`
    const response = await global.app.inject({
      url: url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(response.body)
    const results = json.data
    expect(response.statusCode).toBe(200)
    expect(Array.isArray(results)).toBe(true)
  })
})

describe.each(routesSchemas)('%s: GET include relations', (myroute) => {
  const primaryKeys = myroute?.primaryKeys || ['id']
  const pkey = primaryKeys[0]
  const createdObjects = []
  const objname = myroute.routeName
  const relations = myroute.relations
  const createdIDs = {}

  beforeAll(async () => {
    // create 2 of objname
    createdObjects[0] = await createDbObject(objname, createdIDs, dateGenerator())
    createdObjects[1] = await createDbObject(objname, createdIDs, dateGenerator())
  })

  afterAll(async () => {
    await deleteCreatedIDs(createdIDs)
  })

  // test non-existing include
  test(`get non-existing include GET ${objname}?include=nonexisting`, async () => {
    const url = `${objname}?include=nonexisting`
    const resp = await global.app.inject({
      url: url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    expect(resp.statusCode).toBe(400)
    const json = JSON.parse(resp.body)
    expect(json.title).toBe('Cannot include non-existing relation')
  })

  test.each(relations)(`get ONE included relation of GET ${objname}?include=%s`, async (relation) => {
    // expect.assertions(2)
    // console.log(objname, relation)
    const url = `${objname}?include=${relation}`
    const resp = await global.app.inject({
      url: url,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data
    expect(resp.statusCode).toBe(200)
    // console.log(url, results[0].relationships)
    expect(results.length).toBeGreaterThan(0)
    expect(results.filter(el => el[pkey] === createdObjects[0][pkey])[0]).toHaveProperty(`relationships.${relation}`)
  })

  const multiIncludes = getAllSubsets(relations).filter(el => el.length > 1).map(el => el.join(','))

  test.each(multiIncludes)(`get MULTIPLE included relations of GET ${objname}?include=%s`, async (relation) => {
    // expect.assertions(2)
    // console.log(objname, relation)
    const resp = await global.app.inject({
      url: `${objname}?include=${relation}`,
      method: 'GET',
      headers: { 'Content-Type': 'application/vnd.api+json' }
    })
    const json = JSON.parse(resp.body)

    const results = json.data
    expect(resp.statusCode).toBe(200)
    // console.log('results', results)
    expect(results.length).toBeGreaterThan(0)
    const relationParts = relation.split(',')
    for (let i = 0; i < relationParts.length; i++) {
      // console.log('relations[i]', relationParts[i])
      expect(results[0]).toHaveProperty(`relationships.${relationParts[i]}`)
      // console.log('results', results.filter(el => el[pkey] === createdObject1[pkey])[0])
    }
  })
})

// Recursivey create object and its required connected objects
async function createDbObject (objname, createdIDs, dates, useExisting = false) {
  const route = schema.routes.filter(el => el.routeName === objname)[0]
  const Model = route.model
  const foreignKeys = route?.foreignKeys
  const properties = route.properties
  const primaryKeys = route?.primaryKeys || ['id']

  const objectToBeCreated = {}
  // Check if there are foreign requirements, then recursively create them
  if (foreignKeys) {
    for (const [key, value] of Object.entries(foreignKeys)) {
      let relatedCreatedObject
      if (useExisting && createdIDs[key] && createdIDs[key].length) {
        relatedCreatedObject = await getCreatedObjectbyID(key, createdIDs)
      } else {
        relatedCreatedObject = await createDbObject(key, createdIDs, dates)
      }
      objectToBeCreated[value.into] = relatedCreatedObject[value.from]
    }
  }

  // fill properties
  for (const [key, value] of Object.entries(properties)) {
    if (primaryKeys.includes(key)) continue
    objectToBeCreated[key] = objectToBeCreated[key] || createFakeData(key, value, dates)
  }

  const createdObject = await Model.query().insert(
    omitBy(objectToBeCreated, isUndefined)
  )

  if (createdObject) {
    createdIDs[objname] = createdIDs[objname] || []
    const idObj = {}
    primaryKeys.forEach(el => { idObj[el] = createdObject[el] })
    createdIDs[objname].push(idObj)
  }

  return createdObject
}

async function getCreatedObjectbyID (objname, createdIDs) {
  const route = schema.routes.filter(el => el.routeName === objname)[0]
  const Model = route.model
  const primaryKeys = route?.primaryKeys || ['id']
  const id = createdIDs[objname][0][primaryKeys[0]]

  return await Model.query().findById(id)
}

async function deleteCreatedIDs (createdIDs) {
  for (const [key, value] of Object.entries(createdIDs)) {
    // console.log('Inside deleteCreatedIDS', key)
    const route = schema.routes.filter(el => el.routeName === key)[0]
    const primaryKeys = route?.primaryKeys || ['id']

    for (let i = 0; i < value.length; i++) {
      const queryBuilder = route.model.query().delete()
      const pkey = primaryKeys[0]
      const pkeyValue = value[i][pkey]
      queryBuilder.where(pkey, pkeyValue)
      for (let k = 1; k < primaryKeys.length; k++) {
        queryBuilder.andWhere(primaryKeys[k], value[i][primaryKeys[k]])
      }
      await queryBuilder.execute()
    }
  }
}

// helper functions, move to utils
// @TODO: add strings based on format, add fakerFormat key to schema properties
function createFakeData (key, value, dates = {}) {
  if (value.type === 'string') {
    // if (typeof value.faker === 'function') return (value.faker)
    if (value.faker) {
      if (value.faker === 'date.past') return dates.startDate
      if (value.faker === 'date.future') return dates.endDate
      if (value.faker === 'date.assignment.start') return dates.startAssignmentDate
      if (value.faker === 'date.assignment.end') return dates.endAssignmentDate
    // if (value?.format === 'datetime' || key.indexOf('date') > -1) {
    //   return faker.date.past()
    } else {
      return faker.name.findName()
    }
  } else if (value.type === 'integer') {
    return randomIntFromInterval(value?.minimum, value?.maximum)
  } else if (value.type === 'number') {
    return faker.datatype.float({
      min: value.minimum,
      max: value.maximum,
      precision: 0.1
    })
  }
}

// generates random integer between 2 numbers including them
function randomIntFromInterval (min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Generate subsets from array
 * @param {any[]} theArray
 * @returns {any[]}
 */
function getAllSubsets (theArray) {
  return theArray.reduce(
    (subsets, value) => subsets.concat(
      subsets.map(set => [...set, value])
    ),
    [[]]
  )
}
