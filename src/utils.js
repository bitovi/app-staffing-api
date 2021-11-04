const getIncludeStr = (q) => {
  return '[' + (q?.include || '') + ']'
}

const getPage = (query, config) => {
  const DEFAULT_PAGE_SIZE = 100
  const DEFAULT_PAGE_OFFSET = 0
  const limit = ~~(query?.limit || config?.limit || DEFAULT_PAGE_SIZE)
  const offset = ~~(query?.offset || config?.offset || DEFAULT_PAGE_OFFSET)
  return { limit, offset }
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
  getPage,
  createUUID
}
