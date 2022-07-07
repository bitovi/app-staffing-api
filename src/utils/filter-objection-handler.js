/**
 * NOTE: This implementation is likely temporary - to be replaced by a later
 * version of @bitovi/querystring-parser once it supports objection directly.
 */

const { ref } = require('objection')

/**
 * Applies filters to the queryBuilder recursively.
 * @param {*} filter the filter output from the querystring-parser
 * @param {*} queryBuilder the knex query builder to apply where clauses to
 * @param {*} validatorFn a validation function to check column names against the model
 * @returns nothing - the queryBuilder is mutated as a side effect
 */
function applyFilter (filter, queryBuilder, validatorFn) {
  const { defaultTable } = queryBuilder.context()
  const whereFunc = function () {
    this.context({ defaultTable })
    applyFilterRec(filter, this, validatorFn)
  }
  if (!queryBuilder.hasWheres()) {
    queryBuilder.where(whereFunc)
  } else {
    queryBuilder.andWhere(whereFunc)
  }
}

/** Recursively validate and apply filters to queryBuilder via operator handlers */
function applyFilterRec (filter, queryBuilder, validatorFn) {
  let [operator, operands] = Object.entries(filter)[0] // should only have one entry

  // run validation
  operands = Array.isArray(operands) ? operands : [operands]
  const attributeRefs = operands.filter(isAttributeRef) // columns
  attributeRefs.forEach(ref => {
    validatorFn(unescape(ref))
  })

  // check for nested filters (1 level deep)
  if (isAttributeRef(operands[0]) && operands[0].includes('.')) {
    const attributeRef = unescape(operands[0])
    const [relation, relField] = attributeRef.split('.')

    const nestedQb = queryBuilder.modelClass().relatedQuery(relation)
    nestedQb.context({ defaultTable: relation })
    filter[Object.keys(filter)[0]][0] = '#' + relField
    OperatorHandlers[operator](filter, nestedQb, validatorFn)
    queryBuilder.whereExists(
      nestedQb
    )
  } else {
    // apply filters to querybuilder
    OperatorHandlers[operator](filter, queryBuilder, validatorFn)
  }
}

/** An enumeration of SQL operators. */
const Operator = Object.freeze({
  EQUALS: '=',
  NOT_EQUALS: '<>',
  GREATER_THAN: '>',
  GREATER_OR_EQUAL: '>=',
  LESS_THAN: '<',
  LESS_OR_EQUAL: '<=',
  LIKE: 'LIKE',
  IN: 'IN',
  NOT_IN: 'NOT IN',
  NOT: 'NOT',
  AND: 'AND',
  OR: 'OR',
  IS_NULL: 'IS NULL',
  IS_NOT_NULL: 'IS NOT NULL'
})

/* TODO: document */
const OperatorHandlers = {
  [Operator.EQUALS]: equalsHandler,
  [Operator.NOT_EQUALS]: notEqualsHandler,
  [Operator.GREATER_THAN]: greaterThanHandler,
  [Operator.GREATER_OR_EQUAL]: greaterOrEqualHandler,
  [Operator.LESS_THAN]: lessThanHandler,
  [Operator.LESS_OR_EQUAL]: lessOrEqualHandler,
  [Operator.LIKE]: likeHandler,
  [Operator.IN]: inHandler,
  [Operator.NOT_IN]: notInHandler,
  [Operator.NOT]: notHandler,
  [Operator.AND]: andHandler,
  [Operator.OR]: orHandler,
  [Operator.IS_NULL]: isNullHandler,
  [Operator.IS_NOT_NULL]: isNotNullHandler
}

/************************************************************************
 * Operator Handlers
 ************************************************************************/

function equalsHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? ref(columnName(value, queryBuilder)) : value
  queryBuilder.where(columnName(column, queryBuilder), '=', value)
}

function notEqualsHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  queryBuilder.where(columnName(column, queryBuilder), '<>', value)
}

function isNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  queryBuilder.whereNull(columnName(column, queryBuilder))
}

function isNotNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  queryBuilder.whereNotNull(columnName(column, queryBuilder))
}

function greaterThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? ref(columnName(value, queryBuilder)) : value
  queryBuilder.where(columnName(column, queryBuilder), '>', value)
}

function greaterOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? ref(columnName(value, queryBuilder)) : value
  queryBuilder.where(columnName(column, queryBuilder), '>=', value)
}

function lessThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? ref(columnName(value, queryBuilder)) : value
  queryBuilder.where(columnName(column, queryBuilder), '<', value)
}

function lessOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? ref(columnName(value, queryBuilder)) : value
  queryBuilder.where(columnName(column, queryBuilder), '<=', value)
}

function likeHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  queryBuilder.where(columnName(column, queryBuilder), 'ilike', value)
}

function inHandler (filter, queryBuilder, validationFn) {
  let [column, ...values] = Object.values(filter)[0]
  if (values.length) {
    column = columnName(column, queryBuilder)
    queryBuilder.where(function () {
      this.context({ defaultTable: queryBuilder.context().defaultTable })
      for (const value of values) {
        if (value === null) {
          this.orWhereNull(column)
        }
        this.orWhere(column, '=', value)
      }
    })
  }
}

function notInHandler (filter, queryBuilder, validationFn) {
  queryBuilder.whereNot(function () {
    this.context({ defaultTable: queryBuilder.context().defaultTable })
    inHandler(filter, this, validationFn)
  })
}

function notHandler (filter, queryBuilder, validationFn) {
  const subFilter = Object.values(filter)[0]
  queryBuilder.whereNot(function () {
    this.context({ defaultTable: queryBuilder.context().defaultTable })
    applyFilterRec(subFilter, this, validationFn)
  })
}

function andHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  queryBuilder.where(function () {
    this.context({ defaultTable: queryBuilder.context().defaultTable })
    applyFilterRec(subFilterA, this, validationFn)
    applyFilterRec(subFilterB, this, validationFn)
  })
}

function orHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  queryBuilder.where(function () {
    this.context({ defaultTable: queryBuilder.context().defaultTable })
    applyFilterRec(subFilterA, this, validationFn)
  }).orWhere(function () {
    this.context({ defaultTable: queryBuilder.context().defaultTable })
    applyFilterRec(subFilterB, this, validationFn)
  })
}

/************************************************************************
 * Helpers
 ************************************************************************/

/** Un-escapes an attribute reference ("column name") by removing the prepended '#'. */
function unescape (attributeRef) {
  return attributeRef.slice(1)
}

/** Checks if operand is an attribute reference ("column name"). Ex: "#name" */
function isAttributeRef (operand) {
  return (typeof operand === 'string' || operand instanceof String) && operand[0] === '#'
}

/**  Un-escapes an attribute reference and prepends the default table name. */
function columnName (attributeRef, queryBuilder) {
  return `${queryBuilder.context().defaultTable}.${unescape(attributeRef)}`
}

module.exports = applyFilter
