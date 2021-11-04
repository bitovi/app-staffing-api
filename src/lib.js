// const KeyMap = {
//     'include': 'relatedQuery', // or joinRelated
//     'fields' : 'select',
//     'page'   : 'page',
//     'filter' : 'where',
//     'sort'   : 'sortBy'
// }

const { JsonApiQueryParser: parsequery } = require('./utils')

const customFunctionCache = new Map()

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

// helper function
function createAsync (funStr) {
  return new AsyncFunction('xModel', 'parsedWhere', 'parsedInclude', 'parsedOrderBy', 'parsedPage', funStr)
}

// helper function
function parseInclude (q) {
  if (!q?.include) return null
  return '[' + (q?.include?.join(',') || '') + ']'
}

// filter[name]=
// will generate custom function
// will treat filters for same column as OR and different column as AND?
// need to check the filter type is it a like for a %string% or an = eq?
// We should discuss the filtering scheme.

function parseWhere (q) {
  if (q?.filter) {
    const strparts = []
    let mainstr = ''

    for (const [key, value] of Object.entries(q.filter)) {
      let substr = ''

      // check if value is integer,
      // @TODO check if it's any other numeric or date type...

      if (parseInt(value) == value) {
        substr = `this.where('${key}','=',${parseInt(value[0])})`
      } else {
        substr = `this.where('${key}','like','%${value[0]}%')`
      }

      for (let i = 1; i < value.length; i++) {
        if (parseInt(value) == value) {
          substr += `.orWhere('${key}','=',${parseInt(value[i])})`
        } else {
          substr += `.orWhere('${key}','like','%${value[i]}%')`
        }
      }

      strparts.push(substr)
    }

    if (strparts.length == 1) {
      mainstr = strparts[0]
    } else {
      mainstr = `this.where(function(){${strparts[0]}})`
      for (let i = 1; i < strparts.length; i++) {
        mainstr += `.andWhere(function(){${strparts[i]}})`
      }
    }

    return new Function(mainstr)
  }
  return null
}

// ['email', { column: 'age', order: 'desc' }]
// TODO fix order by
function parseOrderBy (q) {
  if (!q?.sort) return null

  const orderBy = q?.sort?.map(str => {
    if (str[0] == '-') {
      return { column: str.slice(1), order: 'desc' }
    } else return str
  })

  return orderBy
}

// expects q to have property page of the form {number:1, size:10}
// &page[number]=3&page[size]=1
function parsePage (q) {
  if (!q?.page || !q?.page?.number) return null

  let pageNumber = parseInt(q.page.number, 10)
  if (isNaN(pageNumber)) return null

  pageNumber -= 1 // Objection page number starts at 0

  if (pageNumber < 0) pageNumber = 0

  let pageSize = parseInt(q.page?.size, 10) || 10 // set default to 10 items per page

  if (pageSize < 1) pageSize = 1

  return { pageNumber, pageSize }
}

// @TODO find a better way of creating the custom query
//
async function runQueryOn (xModel, rawquery) {
  const q = parsequery(rawquery)
  let key = 'a'
  let myFunc

  const [parsedInclude, parsedWhere, parsedOrderBy, parsedPage] = [parseInclude(q), parseWhere(q), parseOrderBy(q), parsePage(q)]
  let funStr = 'return await xModel.query()'

  if (parsedWhere) {
    funStr += '.where(parsedWhere)'
    key += 'b'
  }

  if (parsedInclude) {
    funStr += '.withGraphFetched(parsedInclude)'
    key += 'c'
  }

  if (parsedOrderBy) {
    funStr += '.orderBy(parsedOrderBy)'
    key += 'd'
  }

  if (parsedPage) {
    funStr += '.page(parsedPage.pageNumber, parsedPage.pageSize)'
    key += 'e'
  }
  // Caching so that JS engine would not need to parse a new function every time
  if (customFunctionCache.has(key)) {
    myFunc = customFunctionCache.get(key)
  } else {
    // could store in myFunc first to save another get call.
    customFunctionCache.set(key, createAsync(funStr))
    myFunc = customFunctionCache.get(key)
  }

  return myFunc(xModel, parsedWhere, parsedInclude, parsedOrderBy, parsedPage)
}

module.exports = runQueryOn
