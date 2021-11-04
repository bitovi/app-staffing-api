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

const parseJsonApiParams = (query) => {
  const filterRegEx = /^filter\[(.*?)\]$/
  const pageRegEx = /^page\[(.*?)\]$/
  const sortRegEx = /^sort$/

  const params = Object.keys(query)

  const queryDatabase = {
    filter: [],
    page: {},
    sort: []
  }
  params.forEach((param) => {
    const filterMatch = filterRegEx.exec(param)
    if (filterMatch) {
      let workingValue = query[param]
      if (filterMatch.length === 2) {
        if (!Array.isArray(workingValue)) {
          workingValue = [workingValue]
        }

        workingValue.forEach((entry) => {
          queryDatabase.filter.push({
            key: filterMatch[1],
            value: entry
          })
        })
        return
      }
    }

    const pageMatch = pageRegEx.exec(param)
    if (pageMatch) {
      if (pageMatch.length === 2) {
        queryDatabase.page[pageMatch[1]] = query[param]
        return
      }
    }

    const sortMatch = sortRegEx.exec(param)
    if (sortMatch) {
      const values = query[param]
      values.forEach((value) => {
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
  })

  return queryDatabase
}

module.exports = {
  getIncludeStr,
  createUUID,
  parseJsonApiParams
}
