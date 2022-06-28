/**
 * NOTE: This implementation is likely temporary - to be replaced by a later
 * version of @bitovi/querystring-parser once it supports objection directly.
 */

/**
 * Applies filters to the queryBuilder recursively.
 * @param {*} filter the filter output from the querystring-parser
 * @param {*} queryBuilder the knex query builder to apply where clauses to
 * @param {*} validatorFn a validation function to check column names against the model
 * @returns nothing - the queryBuilder is mutated as a side effect
 */
function applyFilters (filter, queryBuilder, validatorFn) {
  if (!queryBuilder.hasWheres()) {
    queryBuilder.where(function () {
      applyFilterRec(filter, this, validatorFn)
    })
  } else {
    queryBuilder.andWhere(function () {
      applyFilterRec(filter, this, validatorFn)
    })
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

  // apply filters to queryBuilder
  OperatorHandlers[operator](filter, queryBuilder, validatorFn)
}

/** A enumeration of SQL operators. */
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
  const knex = queryBuilder.knex()
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  queryBuilder.where(unescape(column), '=', value)
}

function notEqualsHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  queryBuilder.where(unescape(column), '<>', value)
}

function isNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  queryBuilder.whereNull(unescape(column))
}

function isNotNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  queryBuilder.whereNotNull(unescape(column))
}

function greaterThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  const knex = queryBuilder.knex()
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  queryBuilder.where(unescape(column), '>', value)
}

function greaterOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  const knex = queryBuilder.knex()
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  queryBuilder.where(unescape(column), '>=', value)
}

function lessThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  const knex = queryBuilder.knex()
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  queryBuilder.where(unescape(column), '<', value)
}

function lessOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  const knex = queryBuilder.knex()
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  queryBuilder.where(unescape(column), '<=', value)
}

function likeHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  queryBuilder.where(unescape(column), 'ilike', value)
}

function inHandler (filter, queryBuilder, validationFn) {
  let [column, ...values] = Object.values(filter)[0]
  if (values.length) {
    column = unescape(column)
    queryBuilder.where(function () {
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
    inHandler(filter, this, validationFn)
  })
}

function notHandler (filter, queryBuilder, validationFn) {
  const subFilter = Object.values(filter)[0]
  queryBuilder.whereNot(function () {
    applyFilterRec(subFilter, this, validationFn)
  })
}

function andHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  queryBuilder.where(function () {
    applyFilterRec(subFilterA, this, validationFn)
    applyFilterRec(subFilterB, this, validationFn)
  })
}

function orHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  queryBuilder.where(function () {
    applyFilterRec(subFilterA, this, validationFn)
  }).orWhere(function () {
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

module.exports = applyFilters
