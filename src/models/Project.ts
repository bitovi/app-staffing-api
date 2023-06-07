import { DataTypes } from "@hatchifyjs/koa"
import type { HatchifyModel } from "@hatchifyjs/koa"

/**
 * 
 export const User = {
  name: "User",
  attributes: {
    name: "STRING",
  },
  hasMany: [{ target: "Todo", options: { as: "todos" } }], // 👀
};

 */
export const Project: HatchifyModel = {
  name: "Project",
  attributes: {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  hasMany: [{ target: "Role", options: { as: "roles" } }],
  belongsToMany: [
    {
      target: "Assignment",
      options: { as: "assignments", through: { model: "Role" } },
    },
  ],
}

/*
-- public.project definition

-- Drop table

-- DROP TABLE project;

CREATE TABLE project (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    "name" varchar(255) NOT NULL,
    description text NULL,
    CONSTRAINT project_pkey PRIMARY KEY (id)
);
*/
