const knex = require('../models/skill').knex() // any model, doesn't matter

// TODO: add note about how this implementation is temporary until the lib does it for us

/**
 * TODO: document
 */
function applyFilter (filter, queryBuilder, validatorFn) {
  if (!queryBuilder.hasWheres()) {
    return queryBuilder.where(function () {
      applyFilterRec(filter, this, validatorFn)
    })
  } else {
    return queryBuilder.andWhere(function () {
      applyFilterRec(filter, this, validatorFn)
    })
  }
}

/**
 * TODO: document
 */
function applyFilterRec (filter, queryBuilder, validatorFn) {
  let [operator, operands] = Object.entries(filter)[0] // should only have one entry

  // run validation
  operands = Array.isArray(operands) ? operands : [operands]
  const attributeRefs = operands.filter(isAttributeRef) // columns
  attributeRefs.forEach(ref => {
    validatorFn(unescape(ref))
  })

  // update queryBuilder
  return OperatorHandler[operator](filter, queryBuilder, validatorFn)
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
const OperatorHandler = {
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

/** Un-escapes an attribute reference (column) by removing the prepended '#' */
function unescape (attributeRef) {
  return attributeRef.slice(1)
}

/** Checks if operand is an attribute reference (ex: "#name") */
function isAttributeRef (operand) {
  return (typeof operand === 'string' || operand instanceof String) && operand[0] === '#'
}

/************************************************************************
 * Operator Handlers
 ************************************************************************/

function equalsHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  return queryBuilder.where(unescape(column), '=', value)
}

function notEqualsHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  return queryBuilder.where(unescape(column), '<>', value)
}

function isNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  return queryBuilder.whereNull(unescape(column))
}

function isNotNullHandler (filter, queryBuilder, validationFn) {
  const column = Object.values(filter)[0]
  return queryBuilder.whereNotNull(unescape(column))
}

function greaterThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  return queryBuilder.where(unescape(column), '>', value)
}

function greaterOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  return queryBuilder.where(unescape(column), '>=', value)
}

function lessThanHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  return queryBuilder.where(unescape(column), '<', value)
}

function lessOrEqualHandler (filter, queryBuilder, validationFn) {
  let [column, value] = Object.values(filter)[0]
  value = isAttributeRef(value) ? knex.ref(unescape(value)) : value
  return queryBuilder.where(unescape(column), '<=', value)
}

function likeHandler (filter, queryBuilder, validationFn) {
  const [column, value] = Object.values(filter)[0]
  return queryBuilder.where(unescape(column), 'ilike', value)
}

function inHandler (filter, queryBuilder, validationFn) {
  let [column, ...values] = Object.values(filter)[0]
  if (values.length) {
    column = unescape(column)
    return queryBuilder.where(function () {
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
  return queryBuilder.whereNot(function () {
    inHandler(filter, this, validationFn)
  })
}

function notHandler (filter, queryBuilder, validationFn) {
  const subFilter = Object.values(filter)[0]
  return queryBuilder.whereNot(function () {
    applyFilterRec(subFilter, this, validationFn)
  })
}

function andHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  return queryBuilder.where(function () {
    applyFilterRec(subFilterA, this, validationFn)
    applyFilterRec(subFilterB, this, validationFn)
  })
}

function orHandler (filter, queryBuilder, validationFn) {
  const [subFilterA, subFilterB] = Object.values(filter)[0]
  return queryBuilder.where(function () {
    applyFilterRec(subFilterA, this, validationFn)
  }).orWhere(function () {
    applyFilterRec(subFilterB, this, validationFn)
  })
}

module.exports = applyFilter
