import { hatchifyKoa } from "@hatchifyjs/koa"
import type { Hatchify } from "@hatchifyjs/koa"
import cors from "@koa/cors"
import KoaRouter from "@koa/router"
import dotenv from "dotenv"
import Koa from "koa"

import errorHandler from "./managers/error-handler"
import { Assignment } from "./models/Assignment"
import { Employee } from "./models/Employee"
import modelBehaviours from "./models/ModelBehaviours"
import { Project } from "./models/Project"
import { Role } from "./models/Role"
import { Skill } from "./models/Skill"

dotenv.config()

export function createStaffingAppInstance(useMemory = false): [Koa, Hatchify] {
  // Create a basic Koa application
  const app = new Koa()
  const router = new KoaRouter()

  app.use(errorHandler)

  app.use(cors())

  // Create a Hatchify instance containing your Models
  const hatchedKoa = hatchifyKoa([Assignment, Employee, Project, Role, Skill], {
    prefix: "/api",
    ...(useMemory
      ? {
          database: {
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
          },
        }
      : {
          expose: true,
          database: {
            dialect: "postgres",
            host: process.env.DB_HOST ?? "localhost",
            port: Number(process.env.DB_PORT) ?? 5432,
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            logging: false,
          },
        }),
  })

  modelBehaviours(hatchedKoa.model)

  // Set up your Koa app as normal, for example, a logging middleware
  app.use(async (ctx, next) => {
    console.info("Incoming Request: ", ctx.method, ctx.path)
    await next()
  })

  // Hook up the router
  app.use(router.routes())
  app.use(router.allowedMethods())

  // Attach the Hatchify default middleware to your Koa application
  app.use(hatchedKoa.middleware.allModels.all)

  // Set up any other Koa routes, middleware, etc, that you want.
  app.use(async (ctx) => {
    ctx.body = { response: "Default Router Hit, HEALTH CHECK!!" }
  })

  return [app, hatchedKoa]
}
