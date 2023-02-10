import { Scaffold } from 'bitscaffold'
import Koa, { Context } from 'koa'
import signale from 'signale'
import KoaRouter from '@koa/router'
import { Assignment } from './models/Assignment'
import { Employee } from './models/Employee'
import { Project } from './models/Project'
import { Role } from './models/Role'
import { Skill } from './models/Skill'
import modelBehaviours from './models/ModelBehaviours'
import errorHandler from './managers/error-handler'

// REACT,

export function createStaffingAppInstance(): [Koa, Scaffold] {
  // Create a basic Koa application
  const app = new Koa()
  const router = new KoaRouter()

  app.use(errorHandler)

  // Create a Scaffold instance containing your Models
  const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
    prefix: '/api',
    expose: true,
    database: {
      dialect: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'test',
      logging: false
    }
  })

  modelBehaviours(scaffold.model)

  // Set up your Koa app as normal, for example, a logging middleware
  app.use(async (ctx, next) => {
    signale.info('Incoming Request: ', ctx.method, ctx.path)
    await next()
  })

  // Hook up the router
  app.use(router.routes())
  app.use(router.allowedMethods())

  // Attach the Scaffold default middleware to your Koa application
  app.use(scaffold.middleware.allModels.all)

  // Set up any other Koa routes, middleware, etc, that you want.
  app.use(async (ctx) => {
    ctx.body = { response: 'Default Router Hit, HEALTH CHECK!!' }
  })

  return [app, scaffold]
}
