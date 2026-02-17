import { RequestHandler } from "express";

export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type RouteHandler = {
  path: string;
  method: HttpMethod;
  handlers: RequestHandler[];
  swagger?: any; // Swagger metadata reference
};
