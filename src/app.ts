import express, { Request, Response } from "express";
import fileUpload from "express-fileupload";
import bodyParser from "body-parser";
import cors from "cors";
import {
  captureResponseBody,
  decryptRequestMiddleware,
  encryptResponseMiddleware,
  forbiddenPaths,
  requestHeaderInspection,
  securityHeadersMiddleware,
} from "./middlewares";
import { logger } from "netwrap";
import morgan from "morgan";
import { getters, mongooseLoader } from "./config";
import loadRoutes from "./utils/loadRoutes";
import path from "path";
import compression from "compression";
import { customMorganLogger } from "./utils";
import { setupAssociations } from "./models/associations";
import { setupAutoSwagger } from "./middlewares/setupAutoSwagger";
// import { debugSecurityOutput } from "./utils/generateSecret";
// import { cronJobService } from "./services/crons";
// import { initAllSockets } from "./services/socket";

// import { fetchAndStoreFeeds } from "./crons/seeder";

const app = express();
const allowedOrigins = [
  "http://192.168.0.104:8006",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4002",
  "http://localhost:8056",
  "http://localhost:8057",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow cookies, authorization headers, etc.
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "signature", "x-api-key"],
  }),
);

setupAutoSwagger(app);

// Apply security headers middleware
securityHeadersMiddleware(app);
// debugSecurityOutput();

app.use(compression());
app.use(express.json({ limit: "1gb" })); // 1GB limit
app.use(express.urlencoded({ limit: "1gb", extended: true })); // 1GB limit for URL-encoded data

// Parse text/plain requests
app.use(bodyParser.text());

//app.use(helmet());

app.use((req, res, next) => forbiddenPaths(req, res, next));

app.use(requestHeaderInspection);
// const routeDirectory = path.resolve("src/routers");
const routeFolder = path.resolve(__dirname, "./routers");
const port = getters.getAppPort();

// Use custom middleware to capture response body
app.use(captureResponseBody);

// Set up Morgan to use the custom Winston stream
app.use(morgan(customMorganLogger));

// Load routes with a service prefix
const customWildcardHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Custom Not Found" });
};

// Apply decryption middleware FIRST
app.use(decryptRequestMiddleware());

// Apply encryption middleware SECOND (it will handle responses)
app.use(encryptResponseMiddleware()); // Add this line

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  }),
);

const assetUrl = `/${getters.getAppSecrets().ASSETSBASEPATH}/`;
app.use(assetUrl, express.static(path.join(__dirname, "..", "fileResources")));

let environ = process.env.NODE_BUILD_ENV || "production";
const basePath = `/${getters.getAppSecrets().BASEPATH}`;

loadRoutes(routeFolder, app, basePath, environ, undefined, false)
  .then(async () => {
    // Place wildcard route after all other routes
    app.use(customWildcardHandler);
    await setupAssociations();
    await mongooseLoader();

    // Handle CORS errors
    app.use((err: any, req: Request, res: Response, next: Function) => {
      if (err?.message === "Not allowed by CORS") {
        return res.status(403).json({
          status: false,
          message: "CORS Error: Origin not allowed.",
          payload: null,
        });
      }
      next(err);
    });

    // Optional global fallback
    app.use((err: any, req: Request, res: Response) => {
      console.error("Unhandled error:", err);
      res.status(500).json({ message: "Internal Server Error" });
    });
    // console.log(app._router.stack.map((layer: { route: { path: any; }; }) => layer.route?.path));
    app.listen(port, () => {
      logger(`${getters.geti18ns().LOGS.RUNNING_APP} ${port}`);
      logger(`Running on - ${getters.getNodeEnv()}`);
    });
  })
  .catch((err) => console.error("Error loading routes:", err));
