import { Scaffold } from "bitscaffold";
import Koa from "koa";
import signale from "signale";
import KoaRouter from "@koa/router";
import dotenv from 'dotenv';

import { Assignment } from "./models/Assignment";
import { Employee } from "./models/Employee";
import { Project } from "./models/Project";
import { Role } from "./models/Role";
import { Skill } from "./models/Skill";

dotenv.config();

export function createStaffingAppInstance(): [Koa, Scaffold] {
  // Create a basic Koa application
  const app = new Koa();
  const router = new KoaRouter();

  // Create a Scaffold instance containing your Models
  const scaffold = new Scaffold([Assignment, Employee, Project, Role, Skill], {
    prefix: "/api",
    expose: true,
    database: {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) ?? 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      logging: false,
    }
  });

  // Set up your Koa app as normal, for example, a logging middleware
  app.use(async (ctx, next) => {
    signale.info("Incoming Request: ", ctx.method, ctx.path);
    await next();
  });

  // Hook up the router
  app.use(router.routes());
  app.use(router.allowedMethods());

  // Attach the Scaffold default middleware to your Koa application
  app.use(scaffold.middleware.allModels.all);

  // Set up any other Koa routes, middleware, etc, that you want.
  app.use(async (ctx) => {
    ctx.body = { response: "up" };
  });

  return [app, scaffold];
}
