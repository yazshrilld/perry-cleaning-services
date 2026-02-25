# Project Notes (Formatted)

This file is a Markdown copy of `NOTES.txt` formatted for readability. The
original `NOTES.txt` remains unchanged and editable.

---

# Flow for adding endpoints and database interaction

Now there is a flow for adding endpoints and talking to the database; this is
the flow I should follow.

## The session route and table

1. Ensure the session validation schema exists in `src/utils/validate.ts`
   (`sessionInputValidation`).
2. Ensure the session controller exists in `src/controllers/sessions.ts`.
3. Add the session schema mapping to `src/utils/joiSchemasMap.ts`
   (`sessionInputValidationSchema`).
4. Ensure the session routes are defined in `src/routers/sessions.ts`.
5. Export the session service from `src/services/model` (e.g., `index.ts`).
6. Create the Mongoose model and schema in `src/models/sessions.ts`.
7. Implement the session service functions in `src/services/model/session.ts`
   and export them for controllers to use.

### Files to note for Swagger generation

- `validate.ts`
- `setupAutoSwagger.ts`
- `joiToSwaggerHelper.ts`
- `joiSchemasMap.ts`
- `app.ts`
- `loadRoutes.ts`

### Known files for the session feature

- `src/utils/validate.ts`: `sessionInputValidation`
- `src/models/sessions.ts`: `sessionSchema`
- `src/controllers/sessions.ts`:
  `{ checkServiceHealth, addSession, fetchSessions }`
- `src/services/model/index.ts`: `sessionService` (export)
- `src/services/model/session.ts`: `createSession`
- `src/utils/joiSchemasMap.ts`: `addSessionInput`
- `src/routers/sessions.ts`: `serviceLoader`

---

# Study of Endpoint Creation

- `url.ts` acts as a route creator and connects with router files under
  `src/routers`.
- Each route typically has a Controller; Controllers are tightly connected to
  route definitions.

## Architecture note

Remember: this codebase uses a Services layer between Controllers and Models.
Models speak directly to the database; Services encapsulate business logic and
coordinate Models. Controllers call Services (not Models) so Controllers remain
focused on HTTP flow and response handling.

Practical implications:

- Each Model in `src/models` will typically have a corresponding Service in
  `src/services/model`.
- Models use Mongoose primitives (`Schema`, `model`, `Document`) and type
  definitions live in `src/models/types.ts`.
- Services implement business logic and expose functions that Controllers
  consume; this keeps Controllers thin and easier to test.

Rationale (why Services come before Controllers): Services centralize business
logic and database interactions so Controllers can remain simple HTTP adapters
(validate request, call service, format response). This separation improves
testability and reduces duplication.

Middleware files to note (file -> purpose -> typical mounting):

- `src/middlewares/general.ts` -> Authentication (verifies JWT, attaches
  `req.USER_ROLES`) -> usually mounted globally.
- `src/middlewares/hasPermission.ts` -> Authorization (role/permission checks)
  -> applied per-route where needed.
- `src/utils/validate.ts` -> Joi validation functions used by the validation
  middleware -> applied per-route via `verifyMiddleware` through
  `createValidationMiddleware`.
- `src/middlewares/encryptResponseMiddleware.ts` -> Outgoing response encryption
  -> often mounted globally or conditionally.
- `src/middlewares/captureResponseMiddleware.ts` -> Captures response body
  before encryption -> mounted globally before encryption.
- `src/middlewares/forbiddenPaths.ts` -> Blocks requests to sensitive paths ->
  mounted very early (global).

Example route demonstrating middleware order (auth -> authZ -> validation ->
controller):

Route: `POST /api/sessions`

Middlewares: `general` -> `hasPermission(['user'])` ->
`createValidationMiddleware(sessionInputValidation, ['body'])` ->
`controllers/sessions.addSession`

```ts
router.post(
  "/sessions",
  general,
  hasPermission(["user"], ["create:session"]),
  createValidationMiddleware(sessionInputValidation, ["body"]),
  sessionsController.addSession,
);
```

---

# Backend Development Workflow

The backend development workflow describes how we approach each feature for our
backend application — each endpoint the frontend developer will need. This
process is scalable and repeatable.

FLOW

Top-Level flow:

Requirements - Models/Types - Services - Controllers - Routes/URLs -
Middleware - Testing - Documentation

Inner-Level flow (runtime with middleware):

Client request -> Incoming middleware (security headers, method filters, request
header inspection) -> Authentication middleware (verifies token and attaches
`req.USER_ROLES`) -> Authorization middleware (`hasPermission`) -> Decryption
middleware (if request is encrypted) -> Validation middleware (checks
body/query/params) -> Controller -> Service -> Model (database)

Note: some repo file listings place Services before Controllers for clarity and
separation of concerns; runtime call order is Controller -> Service -> Model.

Response: Controller prepares data -> Outgoing middleware captures response ->
Encryption middleware (if enabled) -> Security headers applied -> Response sent
back to client.

## Requirements & Data Modeling

- Clarify what data the feature needs (e.g., profile fields: name, bio, avatar).
- Define the database schema and model first, since logic and endpoints depend
  on the stored data shape.

## Models & Type Definitions

- Create or update Mongoose models in `src/models` and define TypeScript types
  in `src/models/types.ts`.
- Types provide a clear contract for the data layer and improve
  editor/autocomplete support.

## Services Layer

- Implement service functions in `src/services/model/*` (e.g.,
  `profileService.ts`).
- Services encapsulate business logic and interact with Models; they make logic
  reusable and easier to test.

## Controllers Layer

- Implement controller functions in `src/controllers/*` (e.g., `profile.ts`).
- Controllers handle HTTP concerns: parse/validate requests, call Services, and
  format responses.

## Route Definitions

- Define routes in `src/routers/*` (e.g., `src/routers/profile.ts`) mapping HTTP
  methods and paths to controller functions.
- Register routers in the application's router aggregation (router index or
  `app.ts`).

## URL / Route Constants

- Keep route paths in `src/constants/urls.ts` (or `urls.ts`) for consistency and
  easy refactoring.

## Middleware (practical notes)

- Validation: schemas live in `src/utils/validate.ts`, applied with
  `createValidationMiddleware` (`src/middlewares/verifyMiddleware.ts`).
- Authentication: `src/middlewares/general.ts` (verifies tokens, attaches
  `req.USER_ROLES`) — usually global.
- Authorization: `src/middlewares/hasPermission.ts` — applied per-route for
  protected endpoints.
- Response handling: `src/middlewares/captureResponseMiddleware.ts` and
  `src/middlewares/encryptResponseMiddleware.ts` (global or conditional).

## Testing

- Add unit tests for Services and Controllers and integration tests for routes
  (folder and framework depend on your setup).

## Documentation

- Update API docs (Swagger, README) and ensure `src/temp/swagger-auto-routes.ts`
  is kept in sync for auto-generation.

## Reasoning

- Start with the data model to ensure you know what data you're working with.
- Services depend on Models, Controllers depend on Services, and Routes depend
  on Controllers.
- This top-down flow (data → logic → interface) keeps responsibilities clear and
  code maintainable.
- Each step is testable in isolation, and changes in one layer have minimal
  impact on others.

---

# Example — Using session architecture as an example

- Requirements: `src/temp/swagger-auto-routes.ts`
- Models/Types:
  1. `src/models/sessions.ts`: `SessionsModel`
  2. `src/models/types.ts`: `sessionSchemaType`

---

# Learning about Deep Backend

1. What is `RequestHandler` from Express?

`RequestHandler` is a TypeScript type provided by Express that describes a route
handler: `(req, res, next) => void | Promise<void)`. Using `RequestHandler`
gives you correct argument types (request, response, next) and better editor
autocomplete.

2. What is `getI18ns`, and why is it used?

`getI18ns` (from the config) returns i18n strings—predefined messages for
different languages. Controllers use it to avoid hardcoded messages (for
example, the health-check success message), making localization easier and
messages consistent.

3. Why is `sessionId` used on lines 32–33?

`sessionId` is a unique identifier for a session. In the example it is generated
as `sess_${Date.now()}`. It lets you reference, fetch, or update a specific
session later — similar to a unique key or ID in frontend state.

4. How does `req.params` get populated?

`req.params` contains route parameters parsed from the URL. For example, with
route `/api/widget/sessions/:conversationId`, calling `/api/widget/sessions/123`
sets `req.params.conversationId === '123'`.

5. What does `const res = rest[1];` mean? What is `rest`?

In `RequestHandler = (...rest) => { ... }`, `...rest` is the rest parameter
syntax. Express calls handlers with `(req, res, next)`, so `rest[0]` is `req`,
`rest[1]` is `res`, and `rest[2]` is `next`. This is a less common but valid
style; the explicit `(req, res, next)` form is usually clearer.

6. Why use `(...rest)` vs `(req, res)`?

Both receive the same arguments. `(req, res)` is explicit and preferred for
readability. `(...rest)` is more generic and rarely necessary for typical
controllers.

7. What should always exist inside the `try` block in controller endpoints?

The `try` block should contain the main request handling steps:

- Validate input
- Call Service functions (business logic)
- Prepare the response payload

Using a consistent response shape (e.g., `statusCode`, `message`, `payload`)
makes error handling predictable and clients easier to support.

8. Why does `fetchSessions` return an array while `addSession` returns a single
   object?

`fetchSessions` returns a list of resources (array). `addSession` creates and
returns a single resource (object or its ID). The response shape follows the
endpoint's purpose.

9. Why this pattern? Required vs optional decisions.

Sending a response is required (e.g., `res.send`, `res.json`). The exact
response envelope is a team choice. Consistency helps both frontend and backend.

Summary mental model

Controllers are the traffic cops: they receive requests, validate/process them,
call Services, and send responses. They rely on types and common patterns to
stay predictable and maintainable.

Middleware quick reference (useful files)

- `src/middlewares/general.ts` — Authentication (verify JWT, attach
  `req.USER_ROLES`) — typically global.
- `src/middlewares/hasPermission.ts` — Authorization (role/permission checks) —
  apply per-route.
- `src/utils/validate.ts` and `src/middlewares/verifyMiddleware.ts` — Validation
  schemas and middleware — apply per-route.
- `src/middlewares/captureResponseMiddleware.ts` and
  `src/middlewares/encryptResponseMiddleware.ts` — Response capture and optional
  encryption — global or conditional.

---

# Understanding Middlewares

I'll help you understand your middleware architecture. Let me first examine the
middleware files to give you an accurate explanation.

Now I have a good understanding of your middleware architecture. Let me provide
you with a comprehensive explanation.

## Your Middleware Architecture Explained

Your Node.js/Express application uses a layered security and data transformation
pipeline. Think of middleware as gatekeepers and processors that inspect,
transform, or protect every request and response. Here's how your system works:

### 🔒 The Security & Encryption Pipeline

Your application implements end-to-end encryption between the client and server.
Here's the flow:

#### 1. `decryptRequestMiddleware` — Incoming Request Decryption

**What it does:** Decrypts encrypted request data from clients before it reaches
your Controllers.

**When it runs:** Early in the request pipeline, after the request arrives but
before your business logic processes it.

**Problem it solves:**

- Protects sensitive data (passwords, payment info, personal data) from being
  intercepted during transit
- Even if someone captures the network traffic, they only see encrypted
  gibberish
- Ensures only your server can read the request data

**How it works:**

- Checks if the request contains `textData` (the encrypted payload)
- Uses AES encryption with your secret keys to decrypt it
- Replaces `req.body` with the decrypted data
- Excludes certain routes like `/health`, `/docs` that don't need encryption
- Logs the operation for security auditing

#### 2. `encryptResponseMiddleware` — Outgoing Response Encryption

**What it does:** Encrypts your API responses before sending them back to
clients.

**When it runs:** At the end of the request pipeline, right before data leaves
your server.

**Problem it solves:**

- Prevents sensitive response data from being read if intercepted
- Matches the security level of your encrypted requests
- Creates a secure "tunnel" for data exchange

**How it works:**

- Intercepts the `res.json()` method (overrides Express's default)
- Takes your response data and encrypts it using AES
- Wraps it in a structure: `{ encrypted: true, textData: "..." }`
- Sets headers `X-Content-Encrypted: true` so clients know it's encrypted
- Excludes health checks and error responses (>= 400 status codes)

**Key insight:** Your client must have the matching decryption keys to read
these responses.

#### 3. `captureResponseBody` — Response Capture

**What it does:** Stores a copy of the response body in `res.locals.body` before
it's sent.

**When it runs:** Before the response is sent, but doesn't modify the response.

**Problem it solves:**

- Allows other middleware or logging systems to access the response data
- Useful for audit trails, logging, or analytics
- Once a response is sent, you normally can't access it—this preserves it

**How it works:**

- Intercepts `res.send()` method
- Stores the body in `res.locals` (a temporary storage location)
- Continues with the normal response flow

### 🛡️ Authentication & Authorization

#### 4. `verifyMiddleware` — Input Validation

**What it does:** Validates incoming request data against predefined schemas
(using Joi validation).

**When it runs:** After decryption, before your Controllers process the data.

**Problem it solves:**

- Prevents malformed, missing, or invalid data from reaching your business logic
- Protects against injection attacks and bad data
- Provides clear error messages for invalid requests

**How it works:**

- Takes a validation function (Joi schema) and validation targets (body, query,
  params)
- Validates the data
- Returns `400 Bad Request` if validation fails
- Calls `next()` if everything is valid

#### 5. `hasPermission` — Role-Based Access Control (RBAC)

**What it does:** Checks if the authenticated user has the required roles and
permissions for an endpoint.

**When it runs:** After authentication, before your Controller executes.

**Problem it solves:**

- Prevents unauthorized users from accessing restricted resources
- Implements fine-grained access control (not just "logged in" vs "not logged
  in")

**How it works:**

- Extracts user roles from the request (`req.USER_ROLES`)
- Checks if the user's role is in the `allowedRoles` list
- Maps roles to permissions using `RolePermissionsMap`
- Verifies the user has at least one required permission
- Blocks access (`403`) if checks fail

#### 6. `signatureProtected` — Request Signature Verification

**What it does:** Verifies that requests come from authorized clients using
cryptographic signatures.

**When it runs:** Very early in the pipeline, often before authentication.

**Problem it solves:**

- Prevents replay attacks (someone re-sending captured requests)
- Ensures requests come from legitimate clients (not bots or attackers)
- Time-based signatures that expire (valid for ±1 minute)

**How it works:**

- Extracts the signature from request headers
- Generates expected signature using app code, secret, and timestamp
- Compares the provided signature with the expected one
- Checks if the signature was already used (prevents replay)
- Caches used signatures to block reuse

### 🔐 Security Headers

#### 7. `securityHeadersMiddleware` — HTTP Security Headers

**What it does:** Sets security-related HTTP headers to protect against common
web vulnerabilities.

**When it runs:** At the very beginning of the request pipeline.

**Problem it solves:**

- XSS (Cross-Site Scripting): Content-Security-Policy restricts what scripts can
  run
- Clickjacking: X-Frame-Options prevents your site from being embedded in
  iframes
- MIME Sniffing: X-Content-Type-Options prevents browsers from guessing content
  types
- Data leakage: Referrer-Policy controls what information is sent to other sites

**How it works:**

- Uses Helmet (a security middleware package) plus custom configurations to set:

- Content Security Policy (CSP) - controls allowed content sources
- Permissions Policy - restricts browser features like geolocation, camera
- CORS policies - controls cross-origin resource sharing
- Frame guards, no-sniff, referrer policies

#### 8. `requestHeaderInspection` — Bot Detection

**What it does:** Blocks suspicious requests based on User-Agent headers.

**When it runs:** Early in the pipeline.

**Problem it solves:**

- Blocks known malicious bots
- Requires a valid User-Agent header
- Simple first line of defense against automated attacks

## 📊 Request Pipeline Flow

Here's the typical journey of a request through your application.

### 💡 Why This Architecture Exists

Your application handles sensitive financial or personal data (based on the
payment/trading domain references in your CSP). This architecture provides:

- Defense in depth: Multiple security layers
- Confidentiality: Encryption protects data in transit
- Integrity: Signatures prevent tampering
- Access control: Role-based permissions
- Compliance: Audit trails and security headers meet regulatory requirements
- Attack resistance: Protects against XSS, CSRF, replay attacks, injection, etc.

### 🎯 Key Takeaways

- Encryption middleware (decrypt/encrypt) creates a secure data tunnel
- Security headers protect against browser-based attacks
- Signature verification ensures request authenticity
- Validation middleware prevents bad data from entering your system
- Permission middleware implements fine-grained access control

These work together in a specific order to create defense in depth.

This is a production-grade security architecture suitable for applications
handling sensitive data. Each middleware has a focused purpose and they
complement each other to create a robust security posture.

- `verifyMiddleware` — Validates incoming request data after decryption and
  before it reaches Controllers. Prevents malformed or unsafe data from entering
  business logic.

- `hasPermission` — Enforces authorization (RBAC) on endpoints. Ensures only
  users with the required roles/permissions can access protected routes.

- `signatureProtected` — Prevents replay attacks by verifying request
  signatures, validating timestamps, and caching used signatures to block reuse.

- `securityHeadersMiddleware` — Sets HTTP security headers (via Helmet + custom
  settings) to mitigate XSS, clickjacking, MIME sniffing, and related browser
  risks.

- `requestHeaderInspection` — Blocks suspicious requests based on headers (e.g.,
  invalid or known-bad User-Agent strings) as a simple bot/misuse filter.

- `forbiddenPaths` — Blocks requests targeting sensitive paths (e.g., .env,
  .git) to prevent accidental or malicious access to internal files.

## Next steps / quick checklist

- Run a full spell/grammar pass across `NOTES.txt` (clean remaining typos and
  standardize capitalization of Models/Services/Controllers/Routes).
- Generate a small reference list of routes that use `hasPermission` (search for
  usages in `src/routers` and `src/controllers`).
- Optionally add a small script to list protected routes (suggested path:
  `scripts/list-protected-routes.js`) — I can create this if you want.

If you'd like, I can now run the full spell/grammar pass (apply changes across
the rest of `NOTES.txt`) or create the searchable checklist/script. Which do you
want next?

# Notes (Markdown)

This file mirrors tasks for improving `NOTES.txt` and tracking work in small,
reviewable steps.

Source: `NOTES.txt` (project root)

## Tasks

- [ ] 1 — Backup `NOTES.txt` to `NOTES.txt.bak` (safe copy)
- [ ] 2 — Spell/grammar pass (prepare patch, do not apply without review)
- [ ] 3 — Add example route snippet showing middleware order (insert into
      `NOTES.txt`)
- [ ] 4 — Annotate middleware entries with file paths in `NOTES.txt`
- [ ] 5 — Find & list all routes using `hasPermission`
- [ ] 6 — Create `scripts/list_protected_routes.ts` helper (optional)
- [ ] 7 — Make `forbiddenPaths` / `disableHttpMethods` configurable (optional)

---

How we will work:

- We will perform tasks one at a time, in the order above, and update this file
  with progress.
- For any change to `NOTES.txt`, I will prepare a patch and show it to you
  before applying.

Please tell me which task and (optionally) which `NOTES.txt` line range you want
me to start with.
