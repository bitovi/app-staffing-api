import { FastifyReply, FastifyRequest } from 'fastify'

type RequestHandler = (request: FastifyRequest, response: FastifyReply) => Promise<void>

interface IRoute {
  method: string;
  url: string;
  schema?: any;
  handler: RequestHandler;
}

export interface IController {
  list?: IRoute;
  get?: IRoute;
  create?: IRoute;
  update?: IRoute;
  delete?: IRoute;
}

export interface KeyValuePairs {
  [key: string]: string;
}
