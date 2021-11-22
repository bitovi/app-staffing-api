const schema = require('./setup-generic')
const faker = require('faker')
schema.routes = schema.routes.map(route => Object.assign(route, { toString: function () { return this.routeName } }))

/*
// Generate subsets from array
*/
const getAllSubsets = theArray => theArray.reduce(
  (subsets, value) => subsets.concat(
    subsets.map(set => [...set, value])
  ),
  [[]]
)

// jest.useFakeTimers()

// -----------Start-here-----------------
// #1
testGets(schema.routes)

// #2
testPostCreates(schema.routes)

// ----------End-Here------------------

//
function testPostCreates (mylist) {
  describe('POST, PATCH, DELETE Component Tests', () => {
    const createdIDs = {}

    afterAll(async () => {
      await deleteCreatedIDs(createdIDs)
    })
    test.concurrent.each(mylist)('%s: POST should insert and return an id', async (myroute) => {
      const obj = {}
      const required = myroute.required
      const foreignKeys = myroute?.foreignKeys || {}
      const primaryKeys = myroute?.primaryKeys || ['id']
      const pkey = primaryKeys[0]
      const routeName = myroute.routeName

      if (myroute?.foreignKeys) {
        for (const [key, value] of Object.entries(foreignKeys)) {
          const createdObj = await createDbObject(key, createdIDs)
          // console.log('POST createdObj', createdObj)
          const keyFrom = createdObj[value.from]
          obj[value.into] = keyFrom
        }
      }
      for (const [key, value] of Object.entries(myroute.properties)) {
        if (required.includes(key) && !obj[key] && key !== pkey) {
          obj[key] = createFakeData(key, value)
        }
      }
      const testBody = {
        data: {
          type: routeName,
          attributes: { ...obj }
        }
      }

      const response = await global.app.inject({
        url: `${myroute}`,
        body: JSON.stringify(testBody),
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.api+json',
          Accept: 'application/vnd.api+json'
        }
      })

      expect(response.statusCode).toEqual(201)

      const result = JSON.parse(response.body)

      expect(result?.data).toHaveProperty(pkey)
    })

    // PATCH update
    test.concurrent.each(mylist)('%s: PATCH should update record', async (myroute) => {
      const required = myroute.required
      const foreignKeys = myroute?.foreignKeys || {}
      const primaryKeys = myroute?.primaryKeys || ['id']
      const pkey = primaryKeys[0]
      const routeName = myroute.routeName

      const createdObj = await createDbObject(routeName, createdIDs)

      const obj = {}
      let sampleProperty
      if (myroute?.foreignKeys) {
        for (const [key, value] of Object.entries(foreignKeys)) {
          const createdObj = await createDbObject(key, createdIDs)
          // console.log('POST createdObj', createdObj)
          const keyFrom = createdObj[value.from]
          obj[value.into] = keyFrom
        }
      }
      for (const [key, value] of Object.entries(myroute.properties)) {
        if (required.includes(key) && !obj[key] && key !== pkey) {
          obj[key] = createFakeData(key, value)
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
      expect(response.statusCode).toEqual(204)
      const result = await myroute.model.query().findById(createdObj[pkey])
      expect(result[sampleProperty]).toEqual(obj[sampleProperty])
    })

    // DELETE
    test.concurrent.each(mylist)('%s: DELETE record', async (myroute) => {
      const primaryKeys = myroute?.primaryKeys || ['id']
      const pkey = primaryKeys[0]
      const routeName = myroute.routeName

      const createdObj = await createDbObject(routeName, createdIDs)

      const response = await global.app.inject({
        url: `${routeName}/${createdObj[pkey]}`,
        method: 'DELETE'
      })
      expect(response.statusCode).toEqual(204)

      const deletedObj = await myroute.model.query().findById(createdObj[pkey])

      expect(deletedObj).toBeUndefined()
    })

    // DELETE non existing record
    test.concurrent.each(mylist)('%s: DELETE non-existing record', async (myroute) => {
      const routeName = myroute.routeName

      const response = await global.app.inject({
        url: `${routeName}/7761b531-50b7-457e-803e-dd8897f86dd2`,
        method: 'DELETE'
      })
      expect(response.statusCode).toEqual(404)
    })
  })
}

// to be moved to seperate file
function testGets (mylist) {
  describe('All GET tests', () => {
    const createdIDs = {}

    afterAll(async () => {
      await deleteCreatedIDs(createdIDs)
    })

    describe.each(mylist)('%s: GET Listing Component Tests', (myroute) => {
      const primaryKeys = myroute?.primaryKeys || ['id']
      const pkey = primaryKeys[0]
      const properties = myroute.properties
      const createdObjects = []
      const objname = myroute.routeName

      beforeAll(async () => {
        // create 4 of objname, why not a loop you might ask.
        createdObjects[0] = await createDbObject(objname, createdIDs)
        createdObjects[1] = await createDbObject(objname, createdIDs)
        createdObjects[2] = await createDbObject(objname, createdIDs)
        createdObjects[3] = await createDbObject(objname, createdIDs)
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
      test(`GET /${objname} paginated`, async () => {
        const response = await global.app.inject({
          url: `${objname}`,
          method: 'GET',
          query: {
            'page[number]': '0',
            'page[size]': '2'
          }
        })
        const results = JSON.parse(response.body)
        expect(results.data.attributes.results.length).toBe(2)
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
      const props = Object.keys(properties).filter(el => el)
      test.each(props)(`OrderBy ${objname}?sort=%s`, async (prop) => {
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
        // console.log(prop, 'index1', index1, 'index2', index2)
        // console.log(prop, 'createdObject1[prop]', createdObject1[prop], 'createdObjects[1][prop]', createdObjects[1][prop])
        if (createdObjects[1][prop] !== createdObjects[0][prop]) {
          expect(index2 > index1).toBe(createdObjects[1][prop] > createdObjects[0][prop])
        }
      })
      // Testing SORT DESC
      test.each(props)(`OrderBy DESC ${objname}?sort=-%s`, async (prop) => {
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
        // console.log(prop, 'index1', index1, 'index2', index2)
        // console.log(prop, 'createdObject1[prop]', createdObject1[prop], 'createdObjects[1][prop]', createdObjects[1][prop])
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
      // test.each(props)(`FILTER ${objname}?filter[%s]=`, async (prop) => {
      //   // expect.assertions(2)
      //   // console.log(objname, relation)
      //   const filterby = 'a'
      //   const resp = await global.app.inject({
      //     url: `${objname}?filter[${prop}=${filterby}`,
      //     method: 'GET',
      //     headers: { 'Content-Type': 'application/vnd.api+json' }
      //   })
      //   const json = JSON.parse(resp.body)

      //   const results = json.data
      //   expect(resp.statusCode).toBe(200)
      //   // console.log('results', results)
      //   expect(results.length).toBeGreaterThan(0)
      //   const index1 = results.findIndex(el => el[pkey] === createdObject1[pkey])
      //   const index2 = results.findIndex(el => el[pkey] === createdObjects[1][pkey])
      //   console.log(prop, 'index1', index1, 'index2', index2)
      //   console.log(prop, 'createdObject1[prop]', createdObject1[prop], 'createdObjects[1][prop]', createdObjects[1][prop])
      //   if (createdObjects[1][prop] !== createdObject1[prop]) {
      //     expect(index2 > index1).toBe(createdObjects[1][prop] < createdObject1[prop])
      //   }
      // })
    })

    describe.each(mylist)('%s: Testing include relations requests', (myroute) => {
      const primaryKeys = myroute?.primaryKeys || ['id']
      const pkey = primaryKeys[0]
      const createdObjects = []
      const objname = myroute.routeName
      const relations = myroute.relations

      beforeAll(async () => {
        // create 2 of objname
        createdObjects[0] = await createDbObject(objname, createdIDs)
        createdObjects[1] = await createDbObject(objname, createdIDs)
      })

      test.each(relations)(`get included relation of GET ${objname}?include=%s`, async (relation) => {
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

      test.each(multiIncludes)(`get included relations of GET ${objname}?include=%s`, async (relation) => {
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
  })
}

// Recursivey create object and its required connected objects
async function createDbObject (objname, createdIDs, useExisting = false) {
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
        relatedCreatedObject = await createDbObject(key, createdIDs)
      }
      objectToBeCreated[value.into] = relatedCreatedObject[value.from]
    }
  }

  // fill properties
  for (const [key, value] of Object.entries(properties)) {
    if (primaryKeys.includes(key)) continue
    objectToBeCreated[key] = objectToBeCreated[key] || createFakeData(key, value)
  }

  const createdObject = await Model.query().insert(objectToBeCreated)

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

// Delete createdIDs
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
function createFakeData (key, value) {
  if (value.type === 'string') {
    if (value?.format === 'datetime' || key.indexOf('date') > -1) {
      return faker.date.past()
    } else {
      return faker.name.findName()
    }
  } else if (value.type === 'integer') {
    return randomIntFromInterval(value?.minimum, value?.maximum)
  }
}

// generates random integer between 2 numbers including them
function randomIntFromInterval (min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}
