const common = {
  include: {
    type: 'string',
    description: 'include comma "," separated relations',
    example: 'project,skills'
  },
  'page[number]': {
    type: 'string',
    description: 'page number. First page starts at 0',
    example: '1'
  },
  'page[size]': {
    type: 'string',
    description: 'records per page',
    example: '5'
  },
  sort: {
    type: 'string',
    description:
      'comma-separated property names by which to order the results. Prepend a "-" to the property name to sort descending.',
    example: '-start_date,end_date'
  }
}

module.exports = {
  common
}
