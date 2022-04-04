/**
 * Transforms the jsonapi request parameter ("include") into an Objection.js RelationExpression
 * @see https://jsonapi.org/format/#fetching-includes
 * @see https://vincit.github.io/objection.js/api/types/#type-relationexpression
 *
 * @param {*} q the request query object
 * @returns {string}
 */
const getRelationExpression = (q) => {
  if (!q || !q.include) {
    return '[]'
  }
  const { include } = q

  // Consolidate sibling relations together into a single tree representation
  const relationshipPaths = include.split(',')
  const consolidatedPathsTree = relationshipPaths.reduce((prev, curr) => {
    let cursor = prev
    const pathSegments = curr.split('.')
    for (const pathSegment of pathSegments) {
      if (pathSegment in cursor) {
        cursor = cursor[pathSegment]
      } else {
        cursor[pathSegment] = {}
        cursor = cursor[pathSegment]
      }
    }
    return prev
  }, {})

  // Recursively transform tree into a string representation (an Objection.js RelationExpression)
  function recStringifyPathsTree (paths) {
    const result = Object.entries(paths).map(([key, value]) => {
      if (Object.keys(value).length > 0) {
        return `${key}.${recStringifyPathsTree(value)}` // recursive case
      } else {
        return key // base case
      }
    }).join(',')

    return Object.keys(paths).length > 1 ? `[${result}]` : result
  }

  return recStringifyPathsTree(consolidatedPathsTree)
}

function createUUID () {
  let dt = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (dt + Math.random() * 16) % 16 | 0
    dt = Math.floor(dt / 16)
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
  return uuid
}

const parseJsonApiParams = (query) => {
  // /^filter\[(.*?)\]$/
  const filterRegEx = /^filter\[([a-zA-Z0-9\-_.]*?)\](\[\$([lgeqtn]{2})\])?$/
  const pageRegEx = /^page\[(.*?)\]$/
  const sortRegEx = /^sort$/
  const includeRegEx = /^include$/
  const fieldsRegEx = /^fields\[(.*?)\]$/

  const params = Object.keys(query)

  const queryDatabase = {
    filter: [],
    page: {},
    sort: [],
    include: [],
    fields: {}
  }
  params.forEach((param) => {
    const filterMatch = filterRegEx.exec(param)
    if (filterMatch) {
      let workingValue = query[param]
      if (filterMatch.length === 4) {
        if (!Array.isArray(workingValue)) {
          workingValue = [workingValue]
        }

        workingValue.forEach((entry) => {
          queryDatabase.filter.push({
            key: filterMatch[1],
            type: filterMatch[3] || 'lk',
            value: entry
          })
        })
        return
      }
    }

    const fieldsMatch = fieldsRegEx.exec(param)
    if (fieldsMatch) {
      const type = fieldsMatch[1]
      const values = query[param]
      queryDatabase.fields[type] = [...values.split(',')]
    }

    const pageMatch = pageRegEx.exec(param)
    if (pageMatch) {
      if (pageMatch.length === 2) {
        queryDatabase.page[pageMatch[1]] = parseInt(query[param], 10)
        return
      }
    }

    const sortMatch = sortRegEx.exec(param)
    if (sortMatch) {
      const values = query[param]
      values.split(',').forEach((value) => {
        if (value.startsWith('-')) {
          queryDatabase.sort.push({
            name: value.substring(1),
            direction: 'DESC'
          })
        } else {
          queryDatabase.sort.push({
            name: value,
            direction: 'ASC'
          })
        }
      })
    }

    const includeMatch = includeRegEx.exec(param)
    if (includeMatch) {
      const values = query[param]
      queryDatabase.include.push(...values.split(','))
    }
  })

  return queryDatabase
}
/**
 * Create queryString filters for validating and documenting the model entities
 * @param {*} properties
 * @returns JSON Schema Object
 */
function makeQueryStringFilters (properties) {
  const filters = Object.entries(properties).reduce((filters, [key, def]) => {
    if (def?.format === 'uuid') return filters

    const name = `filter[${key}]`
    filters[name] = def

    return filters
  }, {})
  return filters
}
/**
 * Create queryString SELECT fields for validating and documenting the model entities
 * @param {*} properties
 * @returns JSON Schema Object
 */
function makeQueryStringFields (name) {
  const keyName = `fields[${name}s]`
  const fields = {}
  fields[keyName] = {
    type: 'string',
    description: `comma-separated list of column names to return instead of returning all. Instead of ${name}, a relation name could be used`
  }

  return fields
}
// Throws 403 if start_date is after end_date in Assignment POST and PATCH
const checkStartDate = async (request, reply, done) => {
  if (request.body.end_date !== null && request.body.start_date > request.body.end_date) {
    return reply.status(403).send('Start date is after end date')
  }
}

class ValidateError extends Error {
  constructor (message, code) {
    super(message)
    this.statusCode = code
  }
}

const validateDateOverlap = async (request, trx) => {
  const Assignment = require('./models/assignment')
  const body = request.body
  let data
  let model
  let matchingCriteria
  let bodyMatchingCriteria

  if (request.url.includes('/assignments')) {
    model = Assignment
    matchingCriteria = 'employee_id'
    bodyMatchingCriteria = body.employee.id
  } else {
    // return empty object to continue method function in handler
    return Object
  }
  if (body.end_date) {
    data = await model.query(trx)
      .where(matchingCriteria, '=', bodyMatchingCriteria)
      .whereRaw('(?, ?) OVERLAPS ("start_date", "end_date")', [body.start_date, body.end_date])
      .forUpdate()
  } else { // If end_date is entered is blank or null
    data = await model.query(trx)
      .where(matchingCriteria, '=', bodyMatchingCriteria)
      .andWhereRaw('(?, INTERVAL \'10 hour\') OVERLAPS ("start_date", "end_date")', body.start_date)
      .forUpdate()
  }
  // Remove current record from 'data'
  if (request.method === 'PATCH') {
    data = data.filter(e => e.id !== request.params.id)
  }
  // If data is not empty throw 403 ValidateError
  if (data.length > 0) {
    throw new ValidateError('Employee already assigned', 403)
  }
}
module.exports = {
  getRelationExpression,
  createUUID,
  parseJsonApiParams,
  makeQueryStringFilters,
  makeQueryStringFields,
  checkStartDate,
  test,
  validateDateOverlap,
  ValidateError
}
