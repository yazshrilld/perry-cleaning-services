// export const setupAutoSwagger = (app: Express) => {
//   logger("Setting up Swagger auto-generation...");
//   const generatedComments = generateSwaggerComments();
//   fs.writeFileSync(tempFile, generatedComments);
//   logger(`Swagger docs written to: ${tempFile}`);

//   const basePath = `/${getters.getAppSecrets().BASEPATH}`;
//   const swaggerRoute = `${basePath}/api-docs`;
//   const signatureHelperPath = `${basePath}/health/generate-signature`;

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

//   app.use(
//     swaggerRoute,
//     swaggerUi.serve,
//     swaggerUi.setup(swaggerSpec, {
//       swaggerOptions: {
//         requestInterceptor: async (req: any) => {
//           try {
//             const url = String(req?.url || "");

//             // Avoid signing swagger/docs/helper calls
//             if (
//               url.includes("/api-docs") ||
//               url.includes("/health/generate-signature")
//             ) {
//               return req;
//             }

//             req.headers = req.headers || {};

//             // If already manually set, keep it
//             if (req.headers.signature || req.headers.Signature) {
//               return req;
//             }

//             const sigRes = await fetch(signatureHelperPath, {
//               method: "POST",
//               credentials: "include",
//               headers: { "Content-Type": "application/json" },
//             });

//             if (!sigRes.ok) return req;

//             const sigJson = await sigRes.json();
//             const signature = sigJson?.payload?.signature;

//             if (signature) {
//               req.headers.signature = signature;
//             }
//           } catch (_e) {
//             // do not block swagger requests if signature helper fails
//           }

//           return req;
//         },
//       },
//     }),
//   );

//   app.get(`${swaggerRoute}.json`, (_req, res) => {
//     res.setHeader("Content-Type", "application/json");
//     res.send(swaggerSpec);
//   });

//   const baseUrl = `http://${getters.getAppUrls().apiDocsUrl}`.replace(/\/+$/, "");
//   logger(`Swagger UI -> ${baseUrl}${swaggerRoute}`);
//   logger(`Swagger JSON -> ${baseUrl}${swaggerRoute}.json`);
// };
