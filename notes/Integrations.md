# Frontend Integration Handoff

This document explains how to integrate the frontend with the backend when
request and response encryption is enabled.

## 1) Base URLs

- Backend base URL (local): http://localhost:8057
- API base path: /api/perrycleans
- Example full base: http://localhost:8057/api/perrycleans

## 2) Auth Endpoints

- POST /auth/login
- POST /auth/register (requires super_admin)

## 3) Request Encryption Contract

All encrypted requests must be sent as:

{ "textData": "<encryptedPayload>" }

Where:

- encryptedPayload is a string in the format: "ciphertext;base64IV"
- The plaintext is the JSON string of the normal request body.

Algorithm:

- AES-256-CBC with PKCS7 padding
- Key: base64 string from env
- IV: base64 string

## 4) Response Encryption Contract

If encryption is enabled, responses look like:

{ "encrypted": true, "textData": "<encryptedPayload>", "timestamp": "..." }

The frontend must decrypt textData and then parse JSON to read payload fields.

If encryption is disabled or excluded, responses look like:

{ "encrypted": false, "code": 200, "message": "...", "payload": { ... } }

## 5) Staging Keys

Provide these values to the frontend (do not hardcode them in code):

- STAGING_APP_AES_IN_SEC
- STAGING_APP_AES_IN_V

Note: The backend includes the IV in the encryptedPayload itself as
"ciphertext;base64IV". The frontend can split on ";" to get the IV.

## 6) Login Flow

Plain login payload (before encryption):

{ "emailOrUsername": "admin@example.com", "password": "<password>" }

After encrypting and sending, decrypt the response. The token is located at:

payload.token

## 7) Auth Header for Protected Routes

Use:

Authorization: Bearer <token>

The token is the decrypted value from payload.token.

## 8) Role Requirement

- /auth/register requires role super_admin.
- If the token does not include role: ["super_admin"], the request is rejected.

## 9) CORS

If the frontend is served from a new origin (host/port), add it to the backend
allowlist in src/app.ts.

## 10) Quick Testing Checklist

- Confirm encryption is enabled on backend (SHOULD_ENCRYPT_RESPONSE=true).
- Encrypt request body into textData before calling /auth/login.
- Decrypt response textData and extract payload.token.
- Use Bearer token for /auth/register.

## 11) Notes for Implementation

- Encryption is required on /auth/login and /auth/register requests.
- Responses are encrypted for all routes except the excluded ones
  (health/docs/etc.).
- Swagger UI will show encrypted responses; decrypt textData to view payload.
