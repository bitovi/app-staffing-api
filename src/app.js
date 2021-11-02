'use strict'

const { Model } = require('objection')
const Knex = require('knex')
const knexfile = require('./knexfile')
const { start } = require('./server')

const knex = Knex(knexfile)

Model.knex(knex)

start()
