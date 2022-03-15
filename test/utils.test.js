
const { parseJsonApiParams, getRelationExpression } = require('../src/utils')
jest.useFakeTimers()

describe('parseJsonApiParams', () => {
  const defaultExpected = {
    filter: [],
    page: {},
    sort: [],
    include: [],
    fields: {}
  }

  const testCases = [
    {
      title: 'parse empty query',
      requestQuery: {}, // empty query string
      expected: defaultExpected
    },
    {
      title: 'parse query multiple `filter` params',
      requestQuery: {
        'filter[name]': ['Jo', 'kev']
      },
      expected: {
        ...defaultExpected,
        filter: [
          { key: 'name', value: 'Jo', type: 'lk' },
          { key: 'name', value: 'kev', type: 'lk' }
        ]
      }
    },
    {
      title: 'parse query with multiple `fields` params, each with their own values',
      requestQuery: {
        'fields[assignments]': 'start_date,end_date',
        'fields[skills]': 'name'
      },
      expected: {
        ...defaultExpected,
        fields: {
          assignments: ['start_date', 'end_date'],
          skills: ['name']
        }
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
        'filter[start_date][$gt]': '2020-01-01',
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
          { key: 'name', value: 'Carl', type: 'lk' },
          { key: 'start_date', value: '2020-01-01', type: 'gt' }
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

describe('getRelationExpression', function () {
  test('should return "[]" if there is no request parameter for "include"', function () {
    expect(getRelationExpression()).toEqual('[]')
    expect(getRelationExpression({})).toEqual('[]')
    expect(getRelationExpression({ include: null })).toEqual('[]')
    expect(getRelationExpression({ include: undefined })).toEqual('[]')
    expect(getRelationExpression({ include: '' })).toEqual('[]')
  })

  describe('should transform the jsonapi request parameter into an Objection.js RelationExpression', function () {
    const testCases = [
      {
        include: 'roles.skills,roles.assignments',
        expected: 'roles.[skills,assignments]'
      },
      {
        include: 'children.movies.actors.children,children.movies.actors.pets,children.pets,pets',
        expected: '[children.[movies.actors.[children,pets],pets],pets]'
      }
    ]

    test.concurrent.each(testCases)('should transform "$include" into "$expected"', ({ include, expected }) => {
      expect(getRelationExpression({ include })).toEqual(expected)
    })
  })
})
