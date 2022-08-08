const faker = require("faker");
const isString = require("lodash/isString");
const { transaction, Model } = require("objection");

const Role = require("../../src/models/role");
const Project = require("../../src/models/project");
const Employee = require("../../src/models/employee");
const Assignment = require("../../src/models/assignment");
const { Serializer } = require("../../src/json-api-serializer");
const { dateGenerator } = require("../../src/utils/date-utils");

describe("POST /assignments", function () {
  let trx;
  const knex = Model.knex();

  beforeEach(async () => {
    trx = await transaction.start(knex);
    Model.knex(trx);
  });

  afterEach(async () => {
    await trx.rollback();
    Model.knex(knex);
  });

  test("should return 422 if payload body includes id", async function () {
    const dates = dateGenerator();

    const payload = serialize({
      id: faker.datatype.uuid(),
      start_date: dates.startDate,
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
    });
    const response = await post(payload);
    expect(response.statusCode).toBe(422);
  });

  test("should return 422 if payload is missing required field", async function () {
    // start_date is required
    const payload = serialize({
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
    });
    const response = await post(payload);
    expect(response.statusCode).toBe(422);
  });

  test("should return 422 if payload has unknown fields", async function () {
    const dates = dateGenerator();
    const payload = serialize({
      start_date: dates.startDate,
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
      anUnknownField: "foo bar baz",
    });
    const response = await post(payload);
    expect(response.statusCode).toBe(422);
  });
  test("should return 422 for payload with startDate after endDate", async function () {
    const dates = dateGenerator();
    const payload = serialize({
      start_date: dates.afterRoleEndDate,
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
      end_date: dates.startDate,
    });
    const response = await post(payload);
    expect(response.statusCode).toBe(422);
  });
  test("should fail if associated employee id does not exist", async function () {
    const dates = dateGenerator();
    const payload = serialize({
      start_date: dates.startDate,
      employee: { id: faker.datatype.uuid() },
      role: { id: faker.datatype.uuid() },
    });
    const response = await post(payload);
    expect(response.statusCode).toBe(409);
  });
  test("should return 201 for valid payload with end_date", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(201);

    const body = JSON.parse(response.body);
    expect(isString(body.data.id)).toEqual(true);

    const savedAssignment = await Assignment.query().findById(body.data.id);
    expect(isString(savedAssignment.id)).toEqual(true);
    expect(savedAssignment.employee_id).toEqual(employee.id);
    expect(savedAssignment.role_id).toEqual(role.id);
  });
  test("should return 201 for valid payload without end_date", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(201);

    const body = JSON.parse(response.body);
    expect(isString(body.data.id)).toEqual(true);

    const savedAssignment = await Assignment.query().findById(body.data.id);
    expect(isString(savedAssignment.id)).toEqual(true);
    expect(savedAssignment.employee_id).toEqual(employee.id);
    expect(savedAssignment.role_id).toEqual(role.id);
  });
  test("should return 201 for payload dates out of range of role, assignment date before roles and start date is not confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(201);
  });
  test("should return 201 for payload dates out of range of role, assignment dates after roles and end date is not confident", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.afterEndDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(201);
  });

  test("should return 409 for payload dates out of range of role, assignment date before roles and start date is fully confident", async function () {
    const dates = dateGenerator();
    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: 1,
      end_date: dates.endDate,
      end_confidence: faker.datatype.float({ min: 0, max: 1 }),
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.beforeStartDate,
      end_date: dates.endAssignmentDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(409);
  });
  test("should return 409 for payload dates out of range of role, assignment dates after roles and end date is fully confident", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 1 }),
      end_date: dates.endDate,
      end_confidence: 1,
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startAssignmentDate,
      end_date: dates.afterEndDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(409);
  });
  test("should return 409 for payload dates out of range of role, assignment start during role-ends after role", async function () {
    const dates = dateGenerator();

    const project = await Project.query().insert({
      name: faker.company.companyName(),
      description: faker.lorem.sentences(),
    });

    const employee = await Employee.query().insert({
      name: faker.name.findName(),
      start_date: dates.startDate,
      end_date: dates.endDate,
    });

    const role = await Role.query().insert({
      start_date: dates.startDate,
      start_confidence: faker.datatype.float({ min: 0, max: 0.9 }),
      end_date: dates.endDate,
      end_confidence: 1,
      project_id: project.id,
    });

    const newAssignment = {
      start_date: dates.startBeforeAssignmentDate,
      end_date: dates.afterEndDate,
      employee: { id: employee.id },
      role: { id: role.id },
    };
    const payload = serialize(newAssignment);
    const response = await post(payload);
    expect(response.statusCode).toEqual(409);
  });

  function post(payload) {
    return global.app.inject({
      method: "POST",
      url: "/assignments",
      headers: {
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      payload: JSON.stringify(payload),
    });
  }

  function serialize(obj) {
    return Serializer.serialize("assignments", obj);
  }
});
