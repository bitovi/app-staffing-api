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
  }
}

module.exports = {
  common
}
