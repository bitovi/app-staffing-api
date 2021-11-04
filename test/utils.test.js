
const { parseJsonApiParams } = require('../src/utils')

describe('utils', () => {
  it('should validate url params for filters', async () => {
    const params = {
      'filter[name]': ['Jo', 'kev'],
      'filter[other]': ['new'],
      'page[number]': 1,
      'page[size]': 5,
      sort: ['start_date', '-name']
    }

    const result = parseJsonApiParams(params)
    expect(result).toEqual({
      filter: [{
        key: 'name',
        value: 'Jo'
      },
      {
        key: 'name',
        value: 'kev'
      },
      {
        key: 'other',
        value: 'new'
      }],
      page: {
        number: 1,
        size: 5
      },
      sort: [{
        direction: 'ASC',
        name: 'start_date'
      },
      {
        direction: 'DESC',
        name: 'name'
      }]
    })
  })
})
