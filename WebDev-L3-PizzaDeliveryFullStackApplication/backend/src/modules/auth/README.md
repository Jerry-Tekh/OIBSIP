# Authentication module

This module owns authentication and authorization: routes, controllers, services,
request validation, user/session persistence, token utilities, and authentication
middleware. Cross-cutting HTTP validation/error handling, environment configuration,
logging, and email transport remain in shared infrastructure.

## Public API

Mounted by the application at `/api/auth`. Public registration always creates
customers. Administrator accounts are provisioned only through the trusted
`npm run admin:create` script.

## Security model

- Short-lived signed access tokens are returned to the client.
- Opaque refresh secrets are stored only as SHA-256 hashes in server-side sessions.
- Refresh tokens rotate on use; replay attempts invalidate the affected session.
- Refresh-cookie requests require the configured frontend Origin and
  `X-Refresh-Request: 1` header.
- Email verification and password reset tokens are hashed at rest and expire.
- Password changes revoke all existing sessions.
- Authorization reads the current persisted user role rather than trusting role claims.

## Boundaries

Do not add feature-specific authentication files to top-level controllers, routes,
services, validators, or models. Keep generic middleware and shared infrastructure
outside this module.
