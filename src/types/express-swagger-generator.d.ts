declare module "express-swagger-generator" {
  import { Express } from "express";

  type SwaggerDefinition = {
    info: {
      title: string;
      version: string;
      description: string;
    };
    host: string;
    basePath: string;
    schemes?: string[];
    consumes?: string[];
    produces?: string[];
    securityDefinitions?: {
      [key: string]: {
        type: string;
        name?: string;
        in?: string;
        description?: string;
      };
    };
  }

  export type SwaggerOptions = {
    swaggerDefinition: SwaggerDefinition;
    basedir: string;
    files: string[];
    route?: {
      url?: string;
      docs?: string;
    };
  }

  function expressSwagger(app: Express): (options: SwaggerOptions) => void;
  export = expressSwagger;
}
