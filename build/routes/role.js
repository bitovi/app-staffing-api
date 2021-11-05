"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_1 = __importDefault(require("../models/role"));
const json_api_serializer_1 = require("../json-api-serializer");
const utils_1 = require("../utils");
const controller = {
    create: {
        method: 'POST',
        url: '/roles',
        async handler(request, reply) {
            const { body, url } = request;
            const newRole = await role_1.default.query().insert(body);
            const data = json_api_serializer_1.Serializer.serialize('roles', newRole);
            const location = `${url}/${newRole.id}`;
            return reply.status(201).header('Location', location).send(data);
        }
    },
    list: {
        method: 'GET',
        url: '/roles',
        async handler(request, reply) {
            const includeStr = (0, utils_1.getIncludeStr)(request.query);
            const roles = await role_1.default.query().withGraphFetched(includeStr);
            const data = json_api_serializer_1.Serializer.serialize('roles', roles.map((role) => role.toJSON()));
            reply.send(data);
        }
    },
    get: {
        method: 'GET',
        url: '/roles/:id',
        async handler(request, reply) {
            const id = request.params.id;
            const includeStr = (0, utils_1.getIncludeStr)(request.query);
            try {
                const role = await role_1.default.query().findById(id).withGraphFetched(includeStr);
                const data = json_api_serializer_1.Serializer.serialize('roles', role.toJSON());
                reply.send(data);
            }
            catch (e) {
                reply.status(404).send();
            }
        }
    },
    update: {
        method: 'PATCH',
        url: '/roles/:id',
        async handler(request, reply) {
            try {
                const data = await role_1.default.query().upsertGraphAndFetch(request.body, {
                    update: false,
                    relate: true,
                    unrelate: true
                });
                reply.code(data ? 204 : 404);
                reply.send();
            }
            catch (e) {
                reply.status(404).send();
            }
        }
    },
    delete: {
        method: 'DELETE',
        url: '/roles/:id',
        async handler(request, reply) {
            const id = request.params.id;
            const numberDeleted = await role_1.default.query().deleteById(id);
            const status = numberDeleted > 0 ? 204 : 404;
            reply.status(status).send();
        }
    }
};
exports.default = controller;
//# sourceMappingURL=role.js.map