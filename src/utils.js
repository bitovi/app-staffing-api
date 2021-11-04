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

const getSortOrder = (orderBy) => {
  let sortOrder = "asc"
  let sortField = orderBy
  if( orderBy && orderBy[0] === "-" ) {
    sortField = orderBy.substring(1);
    sortOrder = "desc"
  }
  return { sortField, sortOrder };
}

module.exports = {
  getIncludeStr,
  getSortOrder,
  createUUID
}
