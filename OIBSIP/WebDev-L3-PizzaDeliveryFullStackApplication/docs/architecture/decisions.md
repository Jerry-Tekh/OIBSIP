## Initial architectural decisions

- Modular monolith rather than premature microservices.
- Backend authoritative for price, recipe, inventory, payment and order transitions.
- Inventory reservation and stock changes designed around atomic operations and MongoDB transactions.
- Payment provider calls remain outside DB transactions; verification, webhook deduplication and reconciliation are planned.
- Separate payment, order fulfilment and inventory reservation lifecycles.
- Socket.IO informs clients; APIs remain source of truth.
- Use idempotency and transactional outbox for durable workflows.
