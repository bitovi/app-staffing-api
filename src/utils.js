const _set = require('lodash/set')
const getIncludeStr = (q) => {
  return '[' + (q?.include || '') + ']'
}

const getPageParams = (query) => {
  const output = {}
  for (const param in query) {
    _set(output, param, query[param])
  }
  return output
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

module.exports = {
  getIncludeStr,
  createUUID,
  getPageParams
}
