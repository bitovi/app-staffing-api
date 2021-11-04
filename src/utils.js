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

function JsonApiQueryParser (rawQuery) {
  const params = new URLSearchParams(rawQuery)
  const result = {}

  for (const [key, value] of params) {
    const segments = key.split('[')
    if (segments.length === 1) {
      let splitValue = value
      if (key !== 'page') {
        splitValue = value.split(',')
      }
      result[segments[0]] = splitValue
    } else {
      const subKey = segments[0]
      result[subKey] = result[subKey] || {}

      let splitValue = value
      if (subKey !== 'page') {
        splitValue = value.split(',')
      }

      result[subKey][segments[1].slice(0, -1)] = splitValue
    }

    // check for coma delimited values (but nor for page because it should be 1 number)
    // if (key)
  }

  return result
}

module.exports = {
  getIncludeStr,
  createUUID,
  JsonApiQueryParser
}
