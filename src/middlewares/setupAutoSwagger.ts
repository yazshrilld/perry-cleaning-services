// src/swagger/swagger-auto-routes.ts
import { Express } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";
import { urls } from "../constants/urls";
import { getters } from "../config";
import { getSwaggerSchemaFromJoi } from "../utils";
import { verifyMiddleware } from "../middlewares"; // ✅ fix import path
import { logger } from "netwrap";
import { multipartRoutes } from "../utils/validate";
import { joiSchemasMap } from "../utils/joiSchemasMap";

logger("🧠 [swagger-auto-routes] Module loaded.");
const basePath = `/${getters.getAppSecrets().BASEPATH}`;
/**
 * Dynamically import all route modules from routers directory
 */
const routersDir = path.resolve(__dirname, "../routers");
const allRouters: any[] = [];

logger(`📂 Reading routers from: ${routersDir}`);

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
      logger(`✅ Loaded router: ${file}`);
    }
  }
});

const tempFile = path.resolve(__dirname, "../temp/swagger-auto-routes.ts");
fs.mkdirSync(path.dirname(tempFile), { recursive: true });

const normalizePath = (p: string) => p.replace(/^\/+/, "").replace(/\/+$/, "");

const findMatchingRoute = (path: string, method: string) => {
  const normPath = normalizePath(path);
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
  logger("\n🟢 Starting Swagger comment generation...\n");
  const comments: string[] = [];

  const processObject = (obj: any, parentTag?: string) => {
    logger(`🔸 Processing object for tag: ${parentTag || "root"}`);
    if (!obj) {
      console.warn("⚠️ Skipping invalid object in setupAutoSwagger:", obj);
      return;
    }
    Object.entries(obj).forEach(([key, value]) => {
      if (typeof value === "function") {
        const routeDef = value();
        const fullPath = `${basePath}/${parentTag}/${routeDef.path}`;
        const swaggerPath = fullPath.replace(/:([a-zA-Z0-9_]+)/g, "{$1}");
        const method = (routeDef.method || "get").toLowerCase();

        logger(
          `\n🔹 Processing route: [${method.toUpperCase()}] ${swaggerPath}`,
        );
        const matchedRoute = findMatchingRoute(routeDef.path, method);

        if (!matchedRoute) {
          console.warn(`⚠️ No matching route found for ${swaggerPath}`);
          return;
        }

        logger(`✅ Matched route path: ${matchedRoute.path}`);
        const handlers = matchedRoute.handlers || [];
        logger(`🔹 Handlers count: ${handlers.length}`);

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

        // Filter out only valid function handlers
        const validHandlers = handlers.filter(
          (h: any) => typeof h === "function",
        );

        // Check for header-based middlewares
        const headerMiddlewares = {
          clientAuthentication: ["client-id"],
          tokenAuthentication: ["authorization"],
          apiKeyAuthentication: ["x-api-key"],
        };

        // Detect header parameters from middleware names
        let headerParams = "";
        for (const handler of validHandlers) {
          const name =
            handler.name ||
            Object.keys(verifyMiddleware || {}).find(
              (k) =>
                verifyMiddleware[k as keyof typeof verifyMiddleware] ===
                handler,
            ) ||
            "";

          // Check if this middleware requires headers
          Object.entries(headerMiddlewares).forEach(
            ([middlewareName, headers]) => {
              if (name.toLowerCase().includes(middlewareName.toLowerCase())) {
                headers.forEach((headerName) => {
                  headerParams += `
 *       - in: header
 *         name: ${headerName}
 *         required: true
 *         schema:
 *           type: string
 *         description: ${headerName.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase())}`;
                });
              }
            },
          );
        }

        // Add header parameters to existing parameters section
        if (headerParams) {
          if (parametersSection) {
            parametersSection += headerParams;
          } else {
            parametersSection = `parameters:${headerParams}`;
          }
        }

        // 🔍 Detect Joi middleware by name
        let requestBodySection = "";
        let foundSchema = false;
        console.log(handlers, "handlers");

        console.log(validHandlers, "validHandlers");
        if (validHandlers.length === 0) {
          console.warn(`⚠️ No valid handlers found for ${matchedRoute.path}`);
        } else {
          for (const handler of validHandlers) {
            //  if (typeof handler !== "function") {
            //    console.warn(
            //      `⚠️ Invalid handler in ${matchedRoute.path}: ${String(handler)}`,
            //    );
            //    continue;
            //  }

            console.log(handler);
            const name =
              handler.name ||
              Object.keys(verifyMiddleware || {}).find(
                (k) =>
                  verifyMiddleware[k as keyof typeof verifyMiddleware] ===
                  handler,
              ) ||
              "";

            logger(`   🧩 Checking handler: "${name}"`);

            if (!name) {
              logger(
                "   ⚠️ Handler is anonymous (arrow fn or inline). Skipping.",
              );
              continue;
            }

            const hasSchema = !!joiSchemasMap[name];
            logger(
              `🔎 joiSchemasMap has schema for "${name}"? ${hasSchema ? "✅ YES" : "❌ NO"}`,
              {
                isError: !hasSchema,
              },
            );

            if (hasSchema) {
              logger(`   ✅ Found Joi schema for middleware: ${name}`);
              const schemaFn = joiSchemasMap[name];
              try {
                const swaggerSchema = getSwaggerSchemaFromJoi(schemaFn);
                if (swaggerSchema) {
                  logger(`   🧾 Successfully converted Joi schema for ${name}`);
                  foundSchema = true;

                  if (method === "get") {
                    // For GET requests, convert schema properties to query parameters
                    const queryParams = Object.entries(
                      swaggerSchema.properties || {},
                    )
                      .map(([key, prop]: any) => {
                        const required = swaggerSchema.required?.includes(key)
                          ? "true"
                          : "false";
                        const escapedPattern = prop.pattern
                          ? prop.pattern.replace(/\\/g, "\\\\")
                          : null;
                        return `
 *       - in: query
 *         name: ${key}
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
                    // For POST/PUT/DELETE requests, generate requestBody
                    const schemaYaml = JSON.stringify(swaggerSchema, null, 2)
                      .split("\n")
                      .map((line) => ` *             ${line}`)
                      .join("\n");

                    const isMultipart = multipartRoutes[name] === true;
                    const contentType = isMultipart
                      ? "multipart/form-data"
                      : "application/json";

                    const textPlainSection = isMultipart
                      ? ""
                      : `
 *         text/plain:
 *           schema:
 *             type: string`;

                    requestBodySection = `
 *     requestBody:
 *       required: true
 *       content:
 *         ${contentType}:
 *           schema:
${schemaYaml}${textPlainSection}`;
                  }
                  break;
                } else {
                  logger(
                    `   ⚠️ getSwaggerSchemaFromJoi returned empty for ${name}`,
                  );
                }
              } catch (err) {
                console.error(
                  `   ❌ Error generating schema for ${name}:`,
                  err,
                );
              }
            }
          }

          if (!foundSchema) {
            logger(`   ⚠️ No Joi schema detected for ${fullPath}`);
          }

          const finalParametersSection = parametersSection
            ? `${parametersSection}`
            : "";
          const finalRequestBodySection = requestBodySection
            ? `${requestBodySection}`
            : "";

          comments.push(`
/**
 * @swagger
 * ${swaggerPath}:
 *   ${method}:
 *     summary: ${key}
 *     tags: [${parentTag || key}]${finalParametersSection ? `\n *     ${finalParametersSection}` : ""}${finalRequestBodySection ? `\n *     ${finalRequestBodySection}` : ""}
 *     responses:
 *       200:
 *         description: Success
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
        `);
        }
      } else if (typeof value === "object") {
        logger(`🔹 Traversing into: ${key}`);
        processObject(value, key);
      }
    });
  };

  processObject(urls);
  logger(`\n✅ Generated Swagger comments for ${comments.length} route(s)`);
  return comments.join("\n");
};

/**
 * ✅ Run generation at runtime (not import time)
 */
export const setupAutoSwagger = (app: Express) => {
  logger("\n🚀 Setting up Swagger auto-generation...");
  const generatedComments = generateSwaggerComments();
  fs.writeFileSync(tempFile, generatedComments);
  logger(`🟢 Swagger docs written to: ${tempFile}`);

  // const swaggerRoute = "/sdk/aop/api/v1/api-docs";
  const swaggerRoute = `/${getters.getAppSecrets().BASEPATH}/api-docs`;

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
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: [tempFile],
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use(swaggerRoute, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get(`${swaggerRoute}.json`, (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  const baseUrl = `http://${getters.getAppUrls().apiDocsUrl}`.replace(
    /\/+$/,
    "",
  );
  logger(`✅ Swagger UI  → ${baseUrl}${swaggerRoute}`);
  logger(`✅ Swagger JSON → ${baseUrl}${swaggerRoute}.json`);
};
