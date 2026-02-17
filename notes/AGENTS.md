(The file `c:\Users\ymusa\Documents\Yazid\node-boiler-plate-origin\AGENTS.md`
exists, but is empty)

# Agents / Implementation Plan

This document contains a step-by-step plan to implement authentication (seed
admin, login, and optional admin-only register) for the backend. Follow each
step in order.

## Steps to implement Login

Below are the ordered steps to implement the Login (and related auth)
functionality.

1. Prep — confirm environment

- Ensure environment variables: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `SEED_ADMIN_PASSWORD`, optional `ADMIN_KEY`.
- Install required packages if missing: `bcrypt`, `jsonwebtoken` (or verify
  existing helpers).

2. Add npm helper scripts

- Add `npm run seed:users` to `package.json` to run the seed script.

3. Seed SUPER_ADMIN (bootstrap)

- Create `scripts/seed_users.ts`:
  - Connect to DB using existing `src/config/mongoose.ts` (or project DB
    helper).
  - Create user
    `{ email: admin@example.com, password: hashed(SEED_ADMIN_PASSWORD), roles: ['super_admin'], isActive: true }`
    if not exists.
- Run locally to create initial admin.

4. Create Mongoose User model

- Add `src/models/users.ts` with fields: `username?`, `email` (unique),
  `password` (hashed), `roles: string[]`, `isActive: boolean`,
  `lastLogin: Date`, timestamps.
- Export model and schema type.

5. Add TypeScript types

- Update `src/models/types.ts` with `UserSchemaType` and `UserDocument`
  interfaces.

6. Validation schemas

- Add Joi schemas in `src/utils/validate.ts`:
  - `loginInput`: `{ emailOrUsername, password }`
  - `registerInput`: `{ email, password, roles? }` (if implementing register)
- Map them in `src/utils/joiSchemasMap.ts` (e.g., `loginInputSchema`,
  `registerInputSchema`).

7. Implement user service

- Create `src/services/model/user.ts` with:
  - `createUser(payload)` — hash password with `bcrypt` and save.
  - `findByEmailOrUsername(identifier)` — lookup active user.
  - `verifyPassword(plain, hash)` — `bcrypt.compare`.
  - `setLastLogin(userId)` — update `lastLogin`.
  - `sanitize(user)` — return safe user object without password.

8. Token helper

- Locate `src/utils/generateAccessToken.ts` or create `src/utils/jwt.ts`:
  - `sign(payload)` using `JWT_SECRET`, include `userId` and `roles`.
  - `verify(token)` helper for middleware.

9. Implement auth controller

- Create `src/controllers/auth.ts` with:
  - `login` (RequestHandler): use validated input, `userService.find...`, if not
    found or inactive => 401, verify password, generate token,
    `userService.setLastLogin`, respond `{ token, user: sanitize(user) }`.
  - `register` (optional): validate, require admin permission or `ADMIN_KEY`,
    call `createUser`, respond created user (sanitized).

10. Add routers & register routes

- Create `src/routers/auth.ts`:
  - `POST /auth/login` — attach
    `createValidationMiddleware(loginInput, ['body'])` then
    `authController.login`.
  - `POST /auth/register` — attach `general` + `hasPermission(['super_admin'])`
    or middleware that checks `ADMIN_KEY`, plus validation, then controller.
- Register router in the router index or `app.ts`.

11. Middleware integration

- Ensure `general` (auth) middleware reads JWT and attaches `req.USER_ROLES` and
  `req.USER_ID`.
- Ensure `verifyMiddleware` is used for validation.
- For `login` route, it's public (no `general`); for `register`, protect as
  needed.

12. Seed run & manual testing

- Run `npm run seed:users`.
- Test `POST /api/auth/login` with seeded admin credentials (use Postman or
  curl).

13. Add logging & update lastLogin

- Confirm `setLastLogin` is called on successful login.

14. Tests

- Unit tests for `user` service: `createUser`, `verifyPassword`,
  `findByEmailOrUsername`.
- Controller/integration tests for `/auth/login` success/failure.
- Use existing test framework in repo or add `jest` if needed.

15. Swagger / docs

- Add route definitions for `login` and `register` in
  `src/temp/swagger-auto-routes.ts` or appropriate swagger generator mapping.
- Update `README.md` with env vars and `npm run seed:users` instructions.

16. Security hardening

- Add rate-limiting (express-rate-limit) on `POST /auth/login`.
- Add account lockout or exponential backoff after repeated failures.
- Use HTTPS in production and short-lived access tokens; consider refresh tokens
  and revocation if needed.

17. Protect admin registration flow

- If `register` exists, enforce one of:
  - `hasPermission(['super_admin'])` on route, or
  - require `ADMIN_KEY` header/env guard for creating users.
- Log admin creation events.

18. Optional: Refresh tokens & logout

- If needed, implement refresh token storage (DB or secure cookie),
  `POST /auth/refresh`, `POST /auth/logout` to revoke refresh tokens.

19. Code quality & linting

- Run existing lint/format scripts, add types, and keep controllers thin
  (validate → service → respond).

20. Deployment & environment

- Document required env vars: `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `SEED_ADMIN_PASSWORD`, `ADMIN_KEY` (optional).
- Add `seed:users` to deployment/CI instructions for first-time setup.

21. Follow-up improvements

- Add 2FA/email verification if needed.
- Add password reset flow (`/auth/forgot-password` + token).
- Add user profile update endpoints and admin role management.

---

# Request/Response Encryption & Decryption (Approach)

This section documents how to enable encrypted requests/responses in the
backend, and how it fits into the middleware flow.

1. Identify existing middleware

- `src/middlewares/decryptRequestMiddleware.ts` (incoming)
- `src/middlewares/encryptResponseMiddleware.ts` (outgoing)
- `src/middlewares/captureResponseMiddleware.ts` (capture response body before
  encryption)

2. Decide encryption toggle

- Use env flags such as `STAGING_encryptionEnabled` /
  `PRODUCTION_encryptionEnabled` or `SHOULD_ENCRYPT_RESPONSE`.

3. Define exempt routes

- Exclude `/health`, `/docs`, and any public routes from encryption if needed.

4. Standardize encrypted request format

- Client sends: `{ textData: "<encryptedPayload>" }`.
- Server decrypts and replaces `req.body` with the decrypted JSON.

5. Standardize encrypted response format

- Server wraps response as
  `{ encrypted: true, textData: "<encryptedPayload>" }`.

6. Ensure middleware order

- Incoming: `securityHeaders` → `requestHeaderInspection` →
  `decryptRequestMiddleware` → `validation` → `controller`.
- Outgoing: `captureResponseBody` → `encryptResponseMiddleware`.

7. Client contract

- Document encryption keys and algorithm used (AES keys from env), and how
  frontend encrypts/decrypts.

8. Logging and troubleshooting

- Log encryption/decryption failures without leaking secrets.

9. Swagger guidance for encrypted routes

- Swagger request bodies remain `{ textData: "<encryptedPayload>" }`.
- For encrypted endpoints, Swagger includes the plain (unencrypted) payload
  schema in the requestBody description so frontend teams can see what to
  encrypt before calling the endpoint.
