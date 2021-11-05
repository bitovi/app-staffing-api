const getIncludeStr = (q) => {
  return '[' + (q?.include || '') + ']'
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

/**
 * Create queryString filters for validating and documenting the model entities
 * @param {*} properties
 * @returns JSON Schema Object
 */
function makeQueryStringFilters (properties) {
  const filters = Object.entries(properties).reduce((filters, [key, def]) => {
    if (key === 'id') return filters

    const name = `filter[${key}]`
    filters[name] = def

    return filters
  }, {})
  return filters
}

module.exports = {
  getIncludeStr,
  createUUID,
  makeQueryStringFilters
}
