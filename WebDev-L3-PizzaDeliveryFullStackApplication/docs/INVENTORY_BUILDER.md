# Product-specific, inventory-backed pizza builder

## Source of truth

- `InventoryItem` is the source of ingredient identity, builder category, active state and stock availability.
- `PizzaProduct` is the sellable menu item and owns its own `builderOptions` configuration.
- Each product option references an `InventoryItem` ObjectId and stores that product's price contribution, optional customer description and display order.
- Ingredient prices are not stored globally on inventory. The same ingredient can have a different price in different pizza products.
- A pizza product has no independent base price. Its price is the sum of the selected option contributions.

New inventory ingredients are created in grams (`g`). Existing non-gram inventory records are preserved as legacy stock records and cannot be enabled for the pizza builder until separately converted. The inventory category remains required for stock grouping and reporting; `builderCategory` is the separate customer-facing option group.

## Customer selection rules

- Exactly one base.
- Exactly one sauce.
- Exactly one cheese.
- Zero or more vegetables.
- Each product can configure at most five base choices and five sauce choices.
- Cheese choices are single-select for customers; the number of configured cheese choices is not capped here.
- Customer selections reference InventoryItem ObjectIds. API responses expose these as string `id` values.

## Admin configuration

1. Create or edit an ingredient in Inventory.
2. Enable it for the pizza builder and assign its builder category, customer description and optional image.
3. In each Pizza Product, select the eligible inventory ingredients that belong to that product.
4. Set the individual price contribution for each selected option on that product.
5. Publish the product only after its required base, sauce and cheese options are configured.

## Public API

- `GET /api/v1/catalog/builder-options/:slug`

The endpoint returns only the configured options for the requested published, available product. It resolves ingredient names and images from inventory, applies current inventory eligibility and stock status, and returns the product-specific price contributions. Internal stock balances, movements, reservations and audit fields are not exposed.

## Price preview

`POST /api/v1/checkout/preview` accepts `productSlug`, quantity and ingredient IDs for each line. The server reloads the published product and inventory records, validates that the selected IDs belong to that product and to the required categories, verifies active/eligible gram-based inventory, and calculates the price from the selected product-specific option contributions.

The current availability check treats an ingredient as available when its unreserved stock is greater than zero. It does not yet know how many grams each pizza consumes, so this is not a sufficient-stock guarantee.

## Remaining order lifecycle work

Order creation, per-pizza ingredient consumption quantities, transactional stock reservation/consumption, payment initialization and payment verification are not implemented in this milestone. The preview does not reserve stock. Do not enable live checkout or accept payments until those services, quantity rules and concurrency tests are completed.
