const schema = require('./setup-generic')
const faker = require('faker')

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

const myRoutes = schema.routes.map(r => { return [r.routeName, r.relations] })
testGets(myRoutes)

schema.routes = schema.routes.map(route => Object.assign(route, { toString: function () { return this.routeName } }))
testPostCreates(schema.routes)
//
function testPostCreates (mylist) {
  describe('POST Create Component Tests', () => {
    test.concurrent.each(mylist)('%s: POST should insert and return an id, dependencies are already created', async (myroute) => {
      // console.log('myroute.routeName', myroute.routeName)
      // const postBody = createPostBody(myroute.routeName)
      expect(myroute).toHaveProperty('properties')
    })
  })
}

// to be moved to seperate file
function testGets (mylist) {
  describe.each(mylist)('%s: GET Listing Component Tests', (objname, relations) => {
    const route = schema.routes.filter(el => el.routeName === objname)[0]
    const primaryKeys = route?.primarykeys || ['id']
    const pkey = primaryKeys[0]

    test(`GET: should get listing for GET /${objname}`, async () => {
      const createdIDs = {}
      // create 2 of objname and check for their existance in results
      const createdObject1 = await createDbObject(objname, createdIDs)
      // const createdObject2 = await createDbObject(objname, createdIDs)

      expect.assertions(3)
      const resp = await global.app.inject({
        url: objname,
        method: 'GET',
        headers: { 'Content-Type': 'application/vnd.api+json' }
      })
      const json = JSON.parse(resp.body)

      const results = json.data
      expect(resp.statusCode).toBe(200)

      // if (objname === 'assignments') {
      //   console.log('results', results)
      //   console.log('createdObject1', createdObject1)
      // }

      // @TODO check foreign key in properties of object for comparing
      expect(results.length).toBeGreaterThan(0)
      expect(results.findIndex(el => el[pkey] === createdObject1[pkey])).toBeGreaterThan(-1)
      await deleteCreatedIDs(createdIDs)
    })

    test(`GET by ID: should get 1 row for GET /${objname}/id`, async () => {
      expect.assertions(2)
      const resp = await global.app.inject({
        url: objname,
        method: 'GET',
        headers: { 'Content-Type': 'application/vnd.api+json' }
      })
      const json = JSON.parse(resp.body)

      const results = json.data
      expect(resp.statusCode).toBe(200)
      // console.log('results', results)
      expect(results.length).toBeGreaterThan(0)
    })
  })

  describe.each(mylist)('%s: Testing include relations requests', (objname, relations) => {
    test.each(relations)(`get included relation of GET ${objname}?include=%s`, async (relation) => {
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
      expect(results[0]).toHaveProperty(`relationships.${relation}`)
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
      }
    })
  })
}

// Recursivey create object and it's required connected objects
async function createDbObject (objname, createdIDs) {
  const route = schema.routes.filter(el => el.routeName === objname)[0]
  const Model = route.model
  const foreignKeys = route?.foreignKeys
  const properties = route.properties
  const primaryKeys = route?.primarykeys || ['id']

  const objectToBeCreated = {}
  // Check if there are foreign requirements, then recursively create them
  if (foreignKeys) {
    for (const [key, value] of Object.entries(foreignKeys)) {
      const relatedCreatedObject = await createDbObject(key, createdIDs)
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

// Delete createdIDs
async function deleteCreatedIDs (createdIDs) {
  for (const [key, value] of Object.entries(createdIDs)) {
    // console.log('Inside deleteCreatedIDS', key)
    const route = schema.routes.filter(el => el.routeName === key)[0]
    const primaryKeys = route?.primarykeys || ['id']

    for (let i = 0; i < value.length; i++) {
      const queryBuilder = route.model.query()
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
