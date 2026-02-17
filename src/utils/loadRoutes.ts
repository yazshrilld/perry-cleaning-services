import fs from "fs";
import path from "path";
import { Express, RequestHandler } from "express";
import { RouteHandler } from "../types";
import { logger } from "netwrap";

/**
 * Loads route files from a folder and applies them to the Express app with a specified prefix.
 * 
 * @param routeFolderName Path to the folder containing route files
 * @param app Express app instance
 * @param servicePrefix Optional route prefix (e.g. /api/v1)
 * @param NODE_BUILD_ENV Current build environment (e.g. development or production)
 * @param wildcardHandler Optional custom wildcard handler
 * @param hideLogs Optional flag to suppress logs (default: false)
 */
export default async function loadRoutes(
  routeFolderName: string,
  app: Express,
  servicePrefix = "",
  NODE_BUILD_ENV = "development",
  wildcardHandler?: RequestHandler,
  hideLogs = false
): Promise<void> {
  const startTime = Date.now();
  const isDevelopment = NODE_BUILD_ENV || "development";

  const registeredRoutes = new Set<string>(); // ✅ Track duplicates

  if (!hideLogs) {
    logger("Netwrap Log: Available Routes below");
    logger(`Netwrap Log: Current environment → ${isDevelopment}`);
  }

  try {
    const routeFiles = fs.readdirSync(routeFolderName);

    for (const file of routeFiles) {
      // Skip non-JS/TS files and index/typings
      if (
        (!file.endsWith(".js") && !file.endsWith(".ts")) ||
        file === "index.ts" ||
        file.endsWith(".d.ts")
      ) continue;

      const filePath = path.join(routeFolderName, file);
      const modulePrefix = path.basename(file, path.extname(file)); // e.g., "users"

      let routes: RouteHandler[] = [];
      try {
        const requirePath = isDevelopment ? filePath : filePath.replace(".ts", ".js");
        routes = require(requirePath).default;
      } catch (error) {
        if (!hideLogs) {
          logger(`⚠️ Failed to load route file ${file}: ${(error as Error).message}`);
        }
        continue;
      }

      if (!Array.isArray(routes)) {
        if (!hideLogs) {
          logger(`⚠️ Invalid route configuration in ${file}. Expected an array of routes.`);
        }
        continue;
      }

      routes.forEach((route) => {
        const { path: routePath, method, handlers } = route;
        const fullPath = `${servicePrefix}/${modulePrefix}${routePath}`;
        const routeKey = `${method.toUpperCase()} ${fullPath}`;

        // ✅ Check for duplicate route definitions
        if (registeredRoutes.has(routeKey)) {
          if (!hideLogs) {
            logger(`⚠️ Duplicate route detected: ${routeKey}. Skipping...`);
          }
          return;
        }

        // ✅ Register route
        app[method](fullPath, ...handlers);
        registeredRoutes.add(routeKey);

        if (!hideLogs) {
          logger(`${fullPath} - ${method.toUpperCase()}`);
        }
      });
    }

    // ✅ Wildcard or 404/405 handler
    if (wildcardHandler) {
      app.use(wildcardHandler);
    } else {
      const notFoundHandler: RequestHandler = (req, res) => {
        const requestedPath = req.path;
        const requestedMethod = req.method.toLowerCase();

        const availableRoutes =
          app._router?.stack
            ?.filter((layer: any) => layer.route)
            .map((layer: any) => ({
              path: layer.route.path,
              methods: Object.keys(layer.route.methods),
            })) || [];

        const matchingRoute = availableRoutes.find(
          (route: { path: string }) => route.path === requestedPath
        );

        if (matchingRoute) {
          res.status(405).json({
            message: `Method Not Allowed. Supported methods for ${requestedPath}: ${matchingRoute.methods
              .join(", ")
              .toUpperCase()}.`,
          });
          return;
        }

        // ✅ Handle root "/" route gracefully
        if (requestedPath === "/") {
          const baseUrl = `${req.protocol}://${req.get("host")}${servicePrefix}`;
          const swaggerUrl = `${baseUrl}/api-docs`;
          const appName = process.env.APP_NAME || servicePrefix || "Netwrap Service";
          const version = process.env.npm_package_version || "1.0.0";
          const env = process.env.NODE_ENV || "development";

          const html = `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>${appName} 🚀</title>
                <style>
                  body {
                    font-family: system-ui, sans-serif;
                    background: #f5f8fb;
                    color: #333;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .container {
                    background: #fff;
                    padding: 2rem 3rem;
                    border-radius: 14px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    text-align: center;
                    max-width: 480px;
                  }
                  h1 {
                    color: #0078d7;
                    margin-bottom: 0.4rem;
                  }
                  .meta {
                    color: #777;
                    font-size: 0.9rem;
                    margin-bottom: 1rem;
                  }
                  a {
                    display: inline-block;
                    background: #0078d7;
                    color: #fff;
                    padding: 10px 22px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background 0.25s;
                  }
                  a:hover { background: #005fa3; }
                </style>
              </head>
              <body>
                <div class="container">
                  <h1>${appName} API</h1>
                  <p class="meta">Version ${version} • Environment: ${env}</p>
                  <p>Server is running successfully 🚀</p>
                  <a href="${swaggerUrl}" target="_blank">View Swagger UI</a>
                </div>
              </body>
            </html>
          `;
          res.status(200).send(html);
          return;
        }

        // Default 404 handler
        res.status(404).json({
          message: `Route Not Found. No endpoint matches ${requestedMethod.toUpperCase()} ${requestedPath}.`,
        });
      };
      app.use(notFoundHandler);
    }

    const duration = (Date.now() - startTime).toFixed(3);
    if (!hideLogs) {
      logger(`✅ Loaded routes in ${duration}ms`);
    }
  } catch (error) {
    logger(`❌ Failed to load routes: ${(error as Error).message}`);
  }
}
