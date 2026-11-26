# Inventory and Recipes — Phase 5 foundation

## Scope
This milestone adds admin-managed ingredient stock, an auditable stock movement ledger, recipe definitions and protected admin pages. It is a modular-monolith implementation under `backend/src/modules`.

## Data model

### InventoryItem
- `name`, `normalizedName` (unique), optional unique `sku`, `category`
- `unit`: g, kg, ml, l, piece, bunch, pack or portion
- `physicalStock`, `reservedStock`, `lowStockThreshold`
- `isActive`, `notes`, `createdBy`, `updatedBy`, timestamps
- Derived available stock = physical stock − reserved stock. It is never stored as a second mutable balance.

### InventoryMovement
Append-only audit row: inventory item, movement type, direction, quantity, unit, physical stock before/after, reason, reference type/id, actor and timestamp. Types: initial_stock, restock, waste, correction, reservation, consumption, release.

### InventoryReservation
Order reference, ingredient allocations, status (active, committed, released, expired), expiry and terminal timestamps. The schema is present; checkout reservation/commit/release orchestration is deliberately not enabled until the order/payment state machines are implemented together.

### Recipe
One current recipe per product ID; ingredient references, required quantity and unit, product-name snapshot, version, active flag, notes and actor audit fields. Updating a recipe increments its version. Historical orders must snapshot recipe consumption so later recipe edits do not alter past orders.

### PizzaOption (catalog)
Customer-selectable base/sauce/cheese/vegetable option, contribution price in integer minor units, currency, image URL, availability and publication flags. This is separate from ingredient stock: a mozzarella inventory item is not itself a customer-facing pizza.

## Admin API
All endpoints require a valid bearer access token and `role=admin`.

- `GET /api/v1/admin/inventory?page=1&limit=20&search=&category=&status=`
- `POST /api/v1/admin/inventory` — name, sku?, category, unit, initialStock, lowStockThreshold, notes?
- `PATCH /api/v1/admin/inventory/:id` — metadata only; no direct stock writes
- `POST /api/v1/admin/inventory/:id/adjustments` — adjustmentType (restock/waste/correction), quantity, reason
- `GET /api/v1/admin/inventory/:id/movements?page=1&limit=20`
- `GET /api/v1/admin/inventory/movements?page=1&limit=20`
- `GET /api/v1/admin/recipes`
- `GET /api/v1/admin/recipes/:productId`
- `PUT /api/v1/admin/recipes/:productId` — productNameSnapshot, ingredient allocations, notes?, isActive?
- `GET /api/v1/pizza-options?category=base|sauce|cheese|vegetable` — published and available options only
- `GET /api/v1/pizza-options/admin`, `POST /api/v1/pizza-options`, `PATCH /api/v1/pizza-options/:id` — admin catalog-option management

## Stock invariants and transaction requirements
- Physical and reserved stock cannot be negative; available stock cannot be negative.
- Admin metadata PATCH cannot change stock balances.
- Every non-zero initial balance and every adjustment writes a movement in the same MongoDB transaction as the balance change.
- A stock adjustment cannot reduce physical stock below currently reserved stock.
- Recipe ingredients must exist, be active and use the inventory item's canonical unit.
- Recipe ingredient IDs cannot be duplicated; combine quantities instead.
- Stock movements are audit records, not editable inventory balances.

The stock-creation and adjustment flows use MongoDB transactions. The configured MongoDB deployment must support transactions (MongoDB Atlas replica-set/sharded deployment). A standalone MongoDB server is insufficient.

## PizzaProduct catalog and publishing workflow

The named pizzas shown as storefront product cards are represented by a dedicated `PizzaProduct` collection. This is separate from `InventoryItem`, `Recipe` and `PizzaOption`:

- `PizzaProduct` is the sellable menu item: name, unique slug, descriptions, category, HTTPS image URL, base price in integer minor units, currency, publication state, availability and display order.
- `Recipe` defines which inventory ingredients and quantities are consumed to make that product. It remains operational data and is not returned by public catalog endpoints.
- `PizzaOption` remains the customer's configurable builder choices (base, sauce, cheese, vegetable) and their price contributions.
- `InventoryItem` remains the physical ingredient stock record.

### Publication rules

Products are created as drafts. An administrator can edit draft details, including the price and image URL. Publishing is rejected unless an active recipe exists, the recipe has at least one ingredient, all referenced inventory items are active, and recipe units still match each inventory item's canonical unit. Publishing does not reserve stock or promise live availability; order preview and checkout must later perform authoritative stock checks and reservations.

Publication state and sellability are separate: a published product can be temporarily marked unavailable without deleting it. Unpublishing returns it to draft so it can be edited. Archiving is a terminal catalog state for this workflow.

### Product APIs

Admin endpoints require authentication and `role=admin`:

- `GET /api/v1/products/admin` — list products with optional status/search and pagination
- `POST /api/v1/products/admin` — create a draft
- `GET /api/v1/products/admin/:id` — product details plus its recipe for admin use
- `PATCH /api/v1/products/admin/:id` — update a draft
- `POST /api/v1/products/admin/:id/publish` — validate recipe/inventory dependencies and publish
- `POST /api/v1/products/admin/:id/unpublish` — return a published product to draft
- `PATCH /api/v1/products/admin/:id/availability` — change `isAvailable` on a published product without unpublishing it
- `POST /api/v1/products/admin/:id/archive` — archive and make unavailable

Public storefront endpoints expose only published and available products, with a field allowlist that excludes recipe, inventory and audit details:

- `GET /api/v1/products?category=&search=&page=1&limit=12`
- `GET /api/v1/products/:slug`

The product base price is stored as integer minor units in NGN. Builder option contributions remain separately priced; checkout must calculate the final amount on the server and must avoid double-counting a product's base price.

Product images currently use validated HTTPS URLs. A managed upload provider is intentionally not assumed; provider-backed upload and image lifecycle can be added separately.

## Customer visibility clarification
Inventory ingredients and recipes are operational data and must not be exposed as a customer menu. The documented `GET /api/v1/pizza-options` contract exposes published ingredient choices for the pizza builder. The PizzaProduct schema and admin publishing/public listing APIs are now implemented on this branch. The storefront's existing product cards are not yet connected to these endpoints; that frontend integration and the checkout/recipe snapshot work remain separate follow-up tasks. Recipe administration selects an existing PizzaProduct and the API verifies the referenced product; recipes cannot be attached to arbitrary IDs or PizzaOption records.

## Frontend routes
- `/admin/products` — create/edit draft PizzaProducts, publish/unpublish/archive them, and toggle published-product storefront availability.
- `/admin/inventory` — list/search/filter ingredients, create an ingredient and record restock/waste/correction.
- `/admin/recipes` — create/update product recipes from active inventory items.
- `/admin/stock-movements` — paginated movement ledger.
- `/admin/low-stock` — live low-stock view derived from available stock and threshold.

All routes remain inside the existing protected admin dashboard shell.

## Not yet production-complete
Persistent alert lifecycle/notifications, reservation allocation and release orchestration, recipe snapshotting at checkout, provider/catalog image uploads, storefront product-card integration, automated tests and frontend/API integration tests remain follow-up work. The admin overview now reads live inventory and product data; order/revenue reporting is deliberately shown as unavailable until the order lifecycle and reporting APIs exist. Inventory, low-stock and movement pages expose server-backed pagination. No checkout or payment behavior is changed by this milestone.
