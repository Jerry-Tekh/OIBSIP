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

## Customer visibility clarification
Inventory ingredients and recipes are operational data and must not be exposed as a customer menu. The documented `GET /api/v1/pizza-options` contract exposes published ingredient choices for the pizza builder. The engineering guide does not define a separate pizza-product listing/management contract for the storefront's named pizza cards. The current storefront product cards therefore remain explicitly labelled frontend demo fixtures; a dedicated PizzaProduct schema and admin product-publishing API should be designed as a separate catalog decision before claiming admin-uploaded product cards are live.

## Frontend routes
- `/admin/inventory` — list/search/filter ingredients, create an ingredient and record restock/waste/correction.
- `/admin/recipes` — create/update product recipes from active inventory items.
- `/admin/stock-movements` — paginated movement ledger.
- `/admin/low-stock` — live low-stock view derived from available stock and threshold.

All routes remain inside the existing protected admin dashboard shell.

## Not yet production-complete
Persistent alert lifecycle/notifications, reservation allocation and release orchestration, recipe snapshotting at checkout, provider/catalog image uploads, product catalog publishing, automated tests and frontend/API integration tests remain follow-up work. No checkout or payment behavior is changed by this milestone.
