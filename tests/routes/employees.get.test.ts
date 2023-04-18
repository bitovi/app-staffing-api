import Chance from "chance";
import request from "supertest";
import { dateGenerator } from "../../src/utils/date";
import Serializer from "../../src/utils/json-api-serializer";
import { isString } from "../../src/utils/validation";

const chance = new Chance();

const serialize = (model, body) => {
  return Serializer.serialize(model, body);
};

 

const get = async (route) => {
  const response = await request(global.app.callback())
    .get(`/api/${route}`)
    .set("Accept", "application/vnd.api+json")
    .set("Content-Type", "application/vnd.api+json");

  return response;
};

describe("GET /api/employees", () => {
  test("should HMMMM", async function () {
    const { Employee, Project, Role } = global.model;

    const dates = dateGenerator();

    const project: any = await Project.create({
      name: chance.word(),
    });

    const role = await Role.create({
      name: chance.word(),
      start_date: dates.past,
      start_confidence: chance.floating({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: chance.floating({ min: 0, max: 0.9 }),
      project_id: project.id,
    });

    const employee = await Employee.create({
      name: chance.name(),
      start_date: dates.startDate,
      end_date: dates.endDate,
      project_id: project.id,
    });

    await project.addRole(role);
    await employee.addRole(role);

    const { body, statusCode } = await get(`employees/${employee.id}`);

    const rolesTest: any = await Role.findByPk(role.id, { include: "project" });

    expect(statusCode).toEqual(200);
    expect(body.data.type).toEqual("Employee");
    expect(body.data.attributes.currentProject).toEqual("hm");
  });
});
