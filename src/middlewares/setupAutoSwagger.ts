import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { urls } from "../constants/urls";
import { getters } from "../config";
import { getSwaggerSchemaFromJoi } from "../utils";
import { verifyMiddleware } from "../middlewares";
import { logger } from "netwrap";
import { multipartRoutes } from "../utils/validate";
import { joiSchemasMap } from "../utils/joiSchemasMap";

logger("[swagger-auto-routes] Module loaded.");
const basePath = `/${getters.getAppSecrets().BASEPATH}`;

const routersDir = path.resolve(__dirname, "../routers");
const allRouters: any[] = [];

logger(`Reading routers from: ${routersDir}`);

fs.readdirSync(routersDir).forEach((file) => {
  if (
    (file.endsWith(".ts") || file.endsWith(".js")) &&
    !file.endsWith(".d.ts")
  ) {
    const routeModule = require(path.join(routersDir, file));
    const routerExport =
      routeModule.default ||
      Object.values(routeModule).find((v) => Array.isArray(v));
    if (routerExport) {
      allRouters.push(routerExport);
      logger(`Loaded router: ${file}`);
    }
  }
});

const tempFile = path.resolve(__dirname, "../temp/swagger-auto-routes.ts");
fs.mkdirSync(path.dirname(tempFile), { recursive: true });

const normalizePath = (p: string) => p.replace(/^\/+/, "").replace(/\/+$/, "");

const isEncryptedRequestRoute = (swaggerPath: string) =>
  /\/auth\/login$|\/auth\/register$/.test(swaggerPath);

const isEncryptHelperRoute = (swaggerPath: string) =>
  /\/health\/encrypt$/.test(swaggerPath);
const isDecryptHelperRoute = (swaggerPath: string) =>
  /\/health\/decrypt$/.test(swaggerPath);

const encryptedRequestSchema = {
  type: "object",
  properties: {
    textData: {
      type: "string",
      description: "Encrypted payload as text",
    },
  },
  required: ["textData"],
  additionalProperties: false,
};

const encryptHelperSchema = {
  type: "object",
  description: "Plain JSON payload to encrypt (any object).",
  additionalProperties: true,
};

const decryptHelperSchema = {
  type: "object",
  properties: {
    textData: {
      type: "string",
      description: "Encrypted payload returned by /health/encrypt",
    },
  },
  required: ["textData"],
  additionalProperties: false,
};

const toSwaggerSchemaYaml = (schema: any) =>
  JSON.stringify(schema, null, 2)
    .split("\n")
    .map((line) => ` *             ${line}`)
    .join("\n");

const exampleValueForSchema = (schema: any): any => {
  if (!schema || typeof schema !== "object") return "string";
  if (schema.example !== undefined) return schema.example;
  switch (schema.type) {
    case "string":
      return "string";
    case "integer":
    case "number":
      return 0;
    case "boolean":
      return true;
    case "array":
      return [exampleValueForSchema(schema.items || { type: "string" })];
    case "object": {
      const obj: Record<string, any> = {};
      const props = schema.properties || {};
      for (const [key, propSchema] of Object.entries(props)) {
        obj[key] = exampleValueForSchema(propSchema);
      }
      return obj;
    }
    default:
      return "string";
  }
};

const buildExampleFromSwaggerSchema = (schema: any): string | null => {
  if (!schema || typeof schema !== "object") return null;
  if (schema.type !== "object" || !schema.properties) return null;
  const exampleObject: Record<string, any> = {};
  for (const [key, propSchema] of Object.entries(schema.properties)) {
    exampleObject[key] = exampleValueForSchema(propSchema);
  }
  return JSON.stringify(exampleObject, null, 2);
};

const findMatchingRoute = (pathValue: string, method: string) => {
  const normPath = normalizePath(pathValue);
  for (const router of allRouters) {
    const match = router.find(
      (r: any) =>
        normalizePath(r.path) === normPath &&
        r.method?.toLowerCase() === method.toLowerCase(),
    );
    if (match) return match;
  }
  return null;
};

const generateSwaggerComments = (): string => {
  logger("Starting Swagger comment generation...");
  const comments: string[] = [];

  const processObject = (obj: any, parentTag?: string) => {
    logger(`Processing object for tag: ${parentTag || "root"}`);
    if (!obj) {
      console.warn("Skipping invalid object in setupAutoSwagger:", obj);
      return;
    }

    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "function") {
        const routeDef = value();
        const fullPath = `${basePath}/${parentTag}/${routeDef.path}`;
        const swaggerPath = fullPath.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
        const method = (routeDef.method || "get").toLowerCase();

        logger(`Processing route: [${method.toUpperCase()}] ${swaggerPath}`);
        const matchedRoute = findMatchingRoute(routeDef.path, method);

        if (!matchedRoute) {
          console.warn(`No matching route found for ${swaggerPath}`);
          return;
        }

        const handlers = matchedRoute.handlers || [];
        const validHandlers = handlers.filter(
          (h: any) => typeof h === "function",
        );

        const pathParams = Array.from(
          fullPath.matchAll(/:([a-zA-Z0-9_]+)/g),
        ).map((m) => m[1]);

        let parametersSection = "";
        if (pathParams.length > 0) {
          parametersSection = `parameters:${pathParams
            .map(
              (p) => `
 *       - in: path
 *         name: ${p}
 *         required: true
 *         schema:
 *           type: string
 *         description: ${p}`,
            )
            .join("")}`;
        }

        const headerMiddlewares = {
          clientAuthentication: ["client-id"],
          tokenAuthentication: ["authorization"],
          signatureProtected: ["signature"],
          apiKeyAuthentication: ["x-api-key"],
        };

        const getHandlerName = (handler: any) =>
          handler.name ||
          Object.keys(verifyMiddleware || {}).find(
            (k) =>
              verifyMiddleware[k as keyof typeof verifyMiddleware] === handler,
          ) ||
          "";

        const requiredHeaders = new Set<string>();
        let requiresSignature = false;
        let requiresBearer = false;

        for (const handler of validHandlers) {
          const name = getHandlerName(handler);
          const lower = name.toLowerCase();

          if (lower.includes("signatureprotected")) requiresSignature = true;
          if (
            lower.includes("general") ||
            lower.includes("haspermission") ||
            lower.includes("tokenauthentication")
          ) {
            requiresBearer = true;
          }

          Object.entries(headerMiddlewares).forEach(
            ([middlewareName, headers]) => {
              if (lower.includes(middlewareName.toLowerCase())) {
                headers.forEach((h) => requiredHeaders.add(h));
              }
            },
          );
        }

        if (requiresSignature) requiredHeaders.add("signature");
        if (requiresBearer) requiredHeaders.add("authorization");

        let headerParams = "";
        requiredHeaders.forEach((headerName) => {
          const description =
            headerName === "signature"
              ? "Format: <sha512_hex>;<tags>. UTC minute-window signature with replay protection."
              : headerName
                  .replace(/-/g, " ")
                  .replace(/^./, (c) => c.toUpperCase());

          const yamlSafeDescription = JSON.stringify(description);

          headerParams += `
 *       - in: header
 *         name: ${headerName}
 *         required: true
 *         schema:
 *           type: string
 *         description: ${yamlSafeDescription}`;
        });

        if (headerParams) {
          if (parametersSection) {
            parametersSection += headerParams;
          } else {
            parametersSection = `parameters:${headerParams}`;
          }
        }

        let requestBodySection = "";
        let foundSchema = false;
        let joiSwaggerSchema: any | null = null;

        if (validHandlers.length === 0) {
          console.warn(`No valid handlers found for ${matchedRoute.path}`);
        } else {
          for (const handler of validHandlers) {
            const name = getHandlerName(handler);
            if (!name) continue;

            const hasSchema = !!joiSchemasMap[name];
            if (!hasSchema) continue;

            const schemaFn = joiSchemasMap[name];
            try {
              const swaggerSchema = getSwaggerSchemaFromJoi(schemaFn);
              if (!swaggerSchema) continue;

              foundSchema = true;
              joiSwaggerSchema = swaggerSchema;

              if (method === "get") {
                const queryParams = Object.entries(
                  swaggerSchema.properties || {},
                )
                  .map(([fieldKey, prop]: any) => {
                    const required = swaggerSchema.required?.includes(fieldKey)
                      ? "true"
                      : "false";
                    const escapedPattern = prop.pattern
                      ? prop.pattern.replace(/\\/g, "\\\\")
                      : null;
                    return `
 *       - in: query
 *         name: ${fieldKey}
 *         required: ${required}
 *         schema:
 *           type: ${prop.type}${prop.format ? `\n *           format: ${prop.format}` : ""}${prop.minimum !== undefined ? `\n *           minimum: ${prop.minimum}` : ""}${prop.maximum !== undefined ? `\n *           maximum: ${prop.maximum}` : ""}${prop.minLength !== undefined ? `\n *           minLength: ${prop.minLength}` : ""}${prop.maxLength !== undefined ? `\n *           maxLength: ${prop.maxLength}` : ""}${escapedPattern ? `\n *           pattern: "${escapedPattern}"` : ""}`;
                  })
                  .join("");

                if (queryParams) {
                  if (parametersSection) {
                    parametersSection += queryParams;
                  } else {
                    parametersSection = `parameters:${queryParams}`;
                  }
                }
              } else {
                const schemaYaml = toSwaggerSchemaYaml(swaggerSchema);
                const isMultipart = multipartRoutes[name] === true;
                const contentType = isMultipart
                  ? "multipart/form-data"
                  : "application/json";

                requestBodySection = `
 *     requestBody:
 *       required: true
 *       content:
 *         ${contentType}:
 *           schema:
${schemaYaml}`;
              }

              break;
            } catch (err) {
              console.error(`Error generating schema for ${name}:`, err);
            }
          }
        }

        if (!foundSchema) {
          logger(`No Joi schema detected for ${fullPath}`);
        }

        if (isEncryptHelperRoute(swaggerPath)) {
          const schemaYaml = toSwaggerSchemaYaml(encryptHelperSchema);
          requestBodySection = `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
${schemaYaml}`;
        }

        if (isDecryptHelperRoute(swaggerPath)) {
          const schemaYaml = toSwaggerSchemaYaml(decryptHelperSchema);
          requestBodySection = `
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
${schemaYaml}`;
        }

        if (isEncryptedRequestRoute(swaggerPath)) {
          const schemaYaml = toSwaggerSchemaYaml(encryptedRequestSchema);
          const exampleJson = joiSwaggerSchema
            ? buildExampleFromSwaggerSchema(joiSwaggerSchema)
            : null;
          const plainSchemaDescription = joiSwaggerSchema
            ? `\n *       description: |\n *         Plain (unencrypted) payload schema:\n${JSON.stringify(
                joiSwaggerSchema,
                null,
                2,
              )
                .split("\n")
                .map((line) => ` *         ${line}`)
                .join("\n")}`
            : "";
          const exampleDescription = exampleJson
            ? `\n *         \n *         Copy-ready example (encrypt this object):\n${exampleJson
                .split("\n")
                .map((line) => ` *         ${line}`)
                .join("\n")}`
            : "";

          requestBodySection = `
 *     requestBody:
 *       required: true${plainSchemaDescription}${exampleDescription}
 *       content:
 *         application/json:
 *           schema:
${schemaYaml}`;
        }

        const finalParametersSection = parametersSection
          ? `${parametersSection}`
          : "";
        const finalRequestBodySection = requestBodySection
          ? `${requestBodySection}`
          : "";

        let securitySection = "";
        const securityLines: string[] = [];
        if (requiresBearer) securityLines.push(" *       - bearerAuth: []");
        if (requiresSignature)
          securityLines.push(" *       - signatureAuth: []");
        if (securityLines.length > 0) {
          securitySection = `
 *     security:
${securityLines.join("\n")}`;
        }

        comments.push(`
/**
 * @swagger
 * ${swaggerPath}:
 *   ${method}:
 *     summary: ${key}
 *     tags: [${parentTag || key}]${finalParametersSection ? `\n *     ${finalParametersSection}` : ""}${finalRequestBodySection ? `\n *     ${finalRequestBodySection}` : ""}${securitySection}
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        `);
      } else if (typeof value === "object") {
        processObject(value, key);
      }
    });
  };

  processObject(urls);
  logger(`Generated Swagger comments for ${comments.length} route(s)`);
  return comments.join("\n");
};

// export const setupAutoSwagger = (app: Express) => {
//   logger("Setting up Swagger auto-generation...");
//   const generatedComments = generateSwaggerComments();
//   fs.writeFileSync(tempFile, generatedComments);
//   logger(`Swagger docs written to: ${tempFile}`);

//   const swaggerRoute = `/${getters.getAppSecrets().BASEPATH}/api-docs`;

//   const options = {
//     definition: {
//       openapi: "3.0.0",
//       info: {
//         title: `${getters.getAppSecrets().APP_DESCRIPTION} API Documentation`,
//         version: "1.0.0",
//         description:
//           "Auto-generated API documentation (routes from constants/urls.ts + Joi schema from routers)",
//       },
//       components: {
//         securitySchemes: {
//           bearerAuth: {
//             type: "http",
//             scheme: "bearer",
//             bearerFormat: "JWT",
//           },
//           signatureAuth: {
//             type: "apiKey",
//             in: "header",
//             name: "signature",
//             description:
//               "Format: <sha512_hex>;<tags>. Hash is SHA512(institutionCode + yyMMddHHmm + secret) using UTC time.",
//           },
//         },
//       },
//       security: [{ bearerAuth: [] }],
//     },
//     apis: [tempFile],
//   };

//   const swaggerSpec = swaggerJSDoc(options);
//   app.use(swaggerRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//   app.get(`${swaggerRoute}.json`, (_req, res) => {
//     res.setHeader("Content-Type", "application/json");
//     res.send(swaggerSpec);
//   });

//   const baseUrl = `http://${getters.getAppUrls().apiDocsUrl}`.replace(
//     /\/+$/,
//     "",
//   );
//   logger(`Swagger UI -> ${baseUrl}${swaggerRoute}`);
//   logger(`Swagger JSON -> ${baseUrl}${swaggerRoute}.json`);
// };



export const setupAutoSwagger = (app: Express) => {
  logger("Setting up Swagger auto-generation...");
  const generatedComments = generateSwaggerComments();
  fs.writeFileSync(tempFile, generatedComments);
  logger(`Swagger docs written to: ${tempFile}`);

  const basePath = `/${getters.getAppSecrets().BASEPATH}`;
  const swaggerRoute = `${basePath}/api-docs`;
  const signatureHelperPath = `${basePath}/health/generate-signature`;

  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: `${getters.getAppSecrets().APP_NAME} API Documentation`,
        version: "1.0.0",
        description: `${getters.getAppSecrets().APP_DESCRIPTION}`,
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          signatureAuth: {
            type: "apiKey",
            in: "header",
            name: "signature",
            description:
              "Format: <sha512_hex>;<tags>. Hash is SHA512(institutionCode + yyMMddHHmm + secret) using UTC time.",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [tempFile],
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use(
    swaggerRoute,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      swaggerOptions: {
        requestInterceptor: async (req: any) => {
          try {
            const url = String(req?.url || "");

            // Avoid signing swagger/docs/helper calls
            if (
              url.includes("/api-docs") ||
              url.includes("/health/generate-signature")
            ) {
              return req;
            }

            req.headers = req.headers || {};

            // If already manually set, keep it
            if (req.headers.signature || req.headers.Signature) {
              return req;
            }

            const sigRes = await fetch(signatureHelperPath, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            });

            if (!sigRes.ok) return req;

            const sigJson = await sigRes.json();
            const signature = sigJson?.payload?.signature;

            if (signature) {
              req.headers.signature = signature;
            }
          } catch (_e) {
            // do not block swagger requests if signature helper fails
          }

          return req;
        },
      },
    }),
  );

  app.get(`${swaggerRoute}.json`, (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  const baseUrl = `http://${getters.getAppUrls().apiDocsUrl}`.replace(/\/+$/, "");
  logger(`Swagger UI -> ${baseUrl}${swaggerRoute}`);
  logger(`Swagger JSON -> ${baseUrl}${swaggerRoute}.json`);
};
