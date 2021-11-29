const common = {
  include: {
    type: 'string',
    description: 'include comma "," separated relations'
  },
  'page[number]': {
    type: 'string',
    description: 'page number. First page starts at 0'
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
