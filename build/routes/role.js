"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_1 = require("../models/role");
const json_api_serializer_1 = require("../json-api-serializer");
const utils_1 = require("../utils");
const routes = {
    create: {
        method: 'POST',
        url: '/roles',
        schema: {
            body: role_1.default.getSchema
        },
        handler: function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                const { body, url } = request;
                const newRole = yield role_1.default.query().insert(body);
                const data = json_api_serializer_1.Serializer.serialize('roles', newRole);
                const location = `${url}/${newRole.id}`;
                reply.status(201).header('Location', location).send(data);
            });
        }
    },
    list: {
        method: 'GET',
        url: '/roles',
        handler: function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                const includeStr = (0, utils_1.getIncludeStr)(request.query);
                const roles = yield role_1.default.query().withGraphFetched(includeStr);
                const data = json_api_serializer_1.Serializer.serialize('roles', roles.map((role) => role.toJSON()));
                reply.send(data);
            });
        }
    },
    get: {
        method: 'GET',
        url: '/roles/:id',
        handler: function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = request.params.id;
                const includeStr = (0, utils_1.getIncludeStr)(request.query);
                try {
                    const role = yield role_1.default.query().findById(id).withGraphFetched(includeStr);
                    const data = json_api_serializer_1.Serializer.serialize('roles', role.toJSON());
                    reply.send(data);
                }
                catch (e) {
                    reply.status(404).send();
                }
            });
        }
    },
    update: {
        method: 'PATCH',
        url: '/roles/:id',
        handler: function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const data = yield role_1.default.query().upsertGraphAndFetch(request.body, {
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
            });
        }
    },
    delete: {
        method: 'DELETE',
        url: '/roles/:id',
        handler: function (request, reply) {
            return __awaiter(this, void 0, void 0, function* () {
                const id = request.params.id;
                const numberDeleted = yield role_1.default.query().deleteById(id);
                const status = numberDeleted > 0 ? 204 : 404;
                reply.status(status).send();
            });
        }
    }
};
module.exports = routes;
//# sourceMappingURL=role.js.map