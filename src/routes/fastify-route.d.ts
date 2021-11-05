type RequestHandler = (request: any, response: any) => void

export default interface FastifyRoute {
  list?: {
    method: 'GET',
    url: string,
    handler: RequestHandler
  },
  get?: {
    method: 'GET',
    url: string,
    handler: RequestHandler
  },
  create?: {
    method: 'POST',
    url: string,
    handler: RequestHandler
  },
  update?: {
    method: 'PATCH',
    url: string,
    handler: RequestHandler
  },
  delete?: {
    method: 'DELETE',
    url: string,
    handler: RequestHandler
  }
}
