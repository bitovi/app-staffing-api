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
  // /^filter\[(.*?)\]$/
  const filterRegEx = /^filter\[([a-zA-Z0-9\-\_.]*?)\](\[\$([lgetn]{2})\])?$/
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

module.exports = {
  getIncludeStr,
  createUUID,
  parseJsonApiParams
}
