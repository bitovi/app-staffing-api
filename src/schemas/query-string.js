const common = {
  'page[number]': {
    type: 'string',
    description: 'page number'
  },
  'page[size]': {
    type: 'string',
    description: 'records per page'
  },
  sort: {
    type: 'string',
    description: 'comma-separated property names by which to order the results. Prepend a "-" to the property name to sort descending.'
  },
  'filter[]': {
    description: 'filter results based on a parameter name inside the square braces: filter[name]=Steve. (Won\'t work on this page.)'
  }
}

module.exports = {
  common
}
