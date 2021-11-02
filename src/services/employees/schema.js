exports.query = {
  $id: 'employees',
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  title: 'Employee',
  type: 'object',
  required: ['name'],
  additionalProperties: false,
  properties: {
    name: {
      type: 'string',
      description: "The person's first name."
    },
    start_date: {
      description: 'Age in years which must be equal to or greater than zero.',
      type: 'date'
    },
    end_date: {
      description: '',
      type: 'date'
    }
  }
}
