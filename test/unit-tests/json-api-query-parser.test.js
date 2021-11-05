
const { JsonApiQueryParser } = require('../../src/utils')

describe('json api query parser', () => {
  // TODO: implement fields parsing (url query param)
  const testcases = [
    {
      title: 'parse query case: empty ',
      querystring: '',
      expected: '{}'
    },
    {
      title: 'parse query case: include multiple ',
      querystring: 'include=roles,roles.skill,roles.assignments',
      expected: '{"include":["roles","roles.skill","roles.assignments"]}'
    },
    {
      title: 'parse query',
      querystring: 'include=employee_skill&page[number]=3&page[size]=1&filter[name]=Carl&sort=name,-title',
      expected: JSON.stringify({
        include: ['employee_skill'],
        page: {
          number: '3',
          size: '1'
        },
        filter: {
          name: ['Carl']
        },
        sort: ['name', '-title']
      })
    }
  ]

  test.concurrent.each(testcases)('.parsequery($title)', ({ querystring, expected }) => {
    expect(JsonApiQueryParser(querystring)).toMatchObject(JSON.parse(expected))
  })
})
