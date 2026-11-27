# Inventory-backed pizza builder

## Source of truth

InventoryItem is the sole source of ingredient records and stock balances. A record can optionally be enabled for the customer pizza builder with a builder category, customer-facing description/image, display order, and price contribution in NGN minor units.

PizzaProduct remains the sellable menu item. Publishing a product does not require a recipe.

## Customer selection rules

- Exactly one base.
- Exactly one sauce.
- Exactly one cheese.
- Zero or more vegetables.
- Base and sauce builder categories are limited to five active eligible choices each.
- Customer selections reference InventoryItem ObjectIds; API responses expose those IDs as id.

## Public API

- GET /api/v1/catalog/builder-options
- GET /api/v1/catalog/builder-options?category=base

Only active, builder-eligible ingredients with available stock are returned. Internal stock, movement and audit fields are not exposed.

## Price preview

POST /api/v1/checkout/preview accepts productSlug, quantity and ingredient IDs for each line. The server reloads the published product and inventory records, validates category membership and availability, then calculates product base price plus selected ingredient contributions. The preview does not reserve stock.

## Important boundary

Order creation, transactional stock reservation, payment initialization and payment verification must be implemented before enabling live checkout. The price preview is not an order and must not be treated as a stock reservation.
