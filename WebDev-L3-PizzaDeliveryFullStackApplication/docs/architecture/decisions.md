## Initial architectural decisions

- Modular monolith rather than premature microservices.
- Backend authoritative for price, recipe, inventory, payment and order transitions.
- Inventory reservation and stock changes designed around atomic operations and MongoDB transactions.
- Payment provider calls remain outside DB transactions; verification, webhook deduplication and reconciliation are planned.
- Separate payment, order fulfilment and inventory reservation lifecycles.
- Socket.IO informs clients; APIs remain source of truth.
- Use idempotency and transactional outbox for durable workflows.

## Authentication module boundary

- Authentication and authorization are a feature module under `backend/src/modules/auth`.
- The module owns its routes, controllers, services, validation schemas, user/session models, token helpers, email workflows, and authentication/authorization middleware.
- The application composition root mounts the module router at `/api/auth`; it does not import an auth-specific top-level router.
- Shared HTTP validation/error middleware, environment configuration, logging, and SMTP transport remain in shared infrastructure.
- Administrator provisioning imports the User model from the auth module and remains a trusted operational script.
- Do not add auth-specific controllers, routes, services, validators, or persistence models to top-level shared folders.
