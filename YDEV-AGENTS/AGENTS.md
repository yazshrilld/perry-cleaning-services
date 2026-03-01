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

  # Steps to Implement Customers

This document contains a step-by-step plan to implement Customers endpoints in
the backend, following the same structure used for Login.

## Scope and Endpoints

Implement these endpoints:

1. `GET /customers` (admin/super_admin)
2. `GET /customers/:id` (admin/super_admin or owner)
3. `PATCH /customers/:id` (owner, admin, super_admin)
4. `DELETE /customers/:id` (admin/super_admin, soft-delete)

## Decisions Confirmed

1. Customer is a user with role data:

- `role: "customer"` and/or `roles: ["customer"]`
- No separate customer collection for now.

2. Auth middleware:

- `general.ts` already injects `USER_ROLES` (and should also expose `USER_ID`
  for ownership checks).

3. Soft-delete fields:

- Not present yet; this plan adds them to user model.

## Ordered Implementation Steps

1. Prep and model alignment

- Confirm `general.ts` provides both `req.USER_ROLES` and `req.USER_ID`.
- Keep customer scope as role-filtered users collection.

2. Update User model for soft delete

- Update `src/models/users.ts` with:
- `isActive: boolean` (default `true`)
- `deletedAt?: Date | null`
- `deletedBy?: ObjectId | null`
- Keep backward compatibility for existing users (default active).

3. Add/confirm TypeScript types

- Update `src/models/types.ts` with:
- `CustomerSafeResponse`
- `GetCustomersQuery`
- `UpdateCustomerInput`
- `CustomerParams` (`id`)
- Include strong typing for `isActive`, `deletedAt`, `deletedBy`.

4. Validation schemas

- Add in `src/utils/validate.ts`:
- `getCustomersQueryInput` (`page`, `limit`, `search`)
- `customerIdParamInput` (`id`)
- `updateCustomerInput` (allowed editable fields only: e.g. `firstName`,
  `lastName`, `phone`, `username`)
- Register in `src/utils/joiSchemasMap.ts`.

5. Create customer service

- Create `src/services/model/customer.ts` with:
- `listCustomers(query)` (admin/super_admin list only customer-role users,
  exclude soft-deleted by default)
- `getCustomerById(id)` (must be customer-role user)
- `updateCustomer(id, payload, actorId?)`
- `softDeleteCustomer(id, actorId)` (`isActive=false`, set `deletedAt`,
  `deletedBy`)
- `sanitizeCustomer(user)` (never return password)

6. Ownership and permission helpers

- Reuse `hasPermission(['admin', 'super_admin'])` where available.
- Add owner/admin helper for `:id` endpoints:
- allow if `req.USER_ID === req.params.id` OR role includes `admin/super_admin`.

7. Implement customers controller

- Create `src/controllers/customers.ts`:
- `getCustomers`
- `getCustomerById`
- `patchCustomer`
- `deleteCustomer`
- Enforce endpoint-level authorization and return sanitized payloads.

8. Add customers router

- Create `src/routers/customers.ts`:
- `GET /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `DELETE /customers/:id`
- Middleware order:
- `general` auth
- validation middleware
- permission/ownership guard
- controller

9. Register router

- Mount customers router in router index or `app.ts` under API prefix.

10. Prevent unsafe updates

- Block updates to sensitive fields:
- `password`, `roles`, `role`, `email` (if policy says immutable), `lastLogin`,
  delete flags.
- Enforce allowlist updates only.

11. Response format consistency

- List: `{ message, data, pagination }`
- Single: `{ message, data }`
- Update/Delete: `{ message, data }`
- Keep same success/error style as auth module.

12. Logging and audit trail

- Log admin/super_admin updates and deletes with actor and target IDs.
- Include reason metadata later if needed.

13. Tests

- Service tests:
- list filters customer users
- get-by-id returns only customer users
- update respects allowlist
- soft-delete marks inactive
- Controller/integration tests:
- admin/super_admin can list
- customer cannot list
- owner can get/patch self
- non-owner customer cannot get/patch others
- admin/super_admin can soft-delete
- deleted customer handling behavior is consistent

14. Swagger/docs

- Add customers endpoints to swagger route config.
- Document role rules and soft-delete behavior.
- Include sample request/response for each endpoint.

15. Manual QA checklist

- Admin login: list/get/update/delete customer works.
- Customer login: can get/update own profile only.
- Customer login: cannot list all customers.
- Deleted customer no longer appears in default list.

16. Security hardening follow-up

- Add pagination caps (`limit` max).
- Add request rate-limit on update/delete endpoints if needed.
- Optionally add `updatedBy` for full audit lineage.
