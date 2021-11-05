
const { parseJsonApiParams } = require('../src/utils')

// TODO integrate into other tests
describe('utils', () => {
  it('should validate url params for filters', async () => {
    const params = {
      'filter[name]': ['Jo', 'kev'],
      'filter[other]': ['new'],
      'page[number]': 1,
      'page[size]': 5,
      sort: 'start_date,-name'
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

describe('parseJsonApiParams', () => {
  // TODO: implement `fields` parsing
  // TODO: implement `include` parsing

  const defaultExpected = {
    filter: [],
    page: {},
    sort: [],
    include: [],
    fields: []
  }

  const testCases = [
    {
      title: 'parse empty query',
      requestQuery: {}, // empty query string
      expected: defaultExpected
    },
    {
      title: 'parse query with multiple `fields` params, each with their own values',
      requestQuery: {
        'fields[assignments]': 'start_date,end_date',
        'fields[skills]': 'name'
      },
      expected: {
        ...defaultExpected,
        fields: [
          { type: 'assignments', fields: ['start_date', 'end_date'] },
          { type: 'skills', fields: ['name'] }
        ]
      }
    },
    {
      title: 'parse query with multiple `include` values',
      // requestQuery: 'include=roles,roles.skill,roles.assignments',
      requestQuery: {
        include: 'roles,roles.skill,roles.assignments'
      },
      expected: {
        ...defaultExpected,
        include: ['roles', 'roles.skill', 'roles.assignments']
      }
    },
    {
      title: 'parse complicated query',
      requestQuery: {
        include: 'employee_skill',
        'page[number]': '3',
        'page[size]': '1',
        'filter[name]': 'Carl',
        sort: 'name,-title'
      },
      expected: {
        ...defaultExpected,
        include: ['employee_skill'],
        page: {
          number: 3,
          size: 1
        },
        filter: [
          { key: 'name', value: 'Carl' }
        ],
        sort: [
          { direction: 'ASC', name: 'name' },
          { direction: 'DESC', name: 'title' }
        ]
      }
    }
  ]

  test.concurrent.each(testCases)('.parsequery($title)', ({ requestQuery, expected }) => {
    expect(parseJsonApiParams(requestQuery)).toEqual(expected)
  })
})