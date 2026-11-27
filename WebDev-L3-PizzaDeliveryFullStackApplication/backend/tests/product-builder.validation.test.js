import { describe, expect, it } from "vitest";
import { createProductSchema } from "../src/modules/products/product.validation.js";
import { createInventorySchema, updateInventorySchema } from "../src/modules/inventory/inventory.validation.js";

const ids = {
  base1: "64b000000000000000000001",
  base2: "64b000000000000000000002",
  base3: "64b000000000000000000003",
  base4: "64b000000000000000000004",
  base5: "64b000000000000000000005",
  base6: "64b000000000000000000006",
  sauce: "64b000000000000000000007",
  cheese: "64b000000000000000000008",
  vegetable: "64b000000000000000000009"
};

function option(inventoryItemId, category) {
  return { inventoryItemId, category, priceContributionMinor: 25000 };
}

function validProduct(builderOptions) {
  return {
    body: {
      name: "Chicken Supreme",
      slug: "chicken-supreme",
      description: "A generous pizza topped with chicken and fresh ingredients.",
      shortDescription: "Chicken, cheese and fresh toppings.",
      category: "signature",
      imageUrl: "https://images.example.com/chicken-supreme.jpg",
      builderOptions
    }
  };
}

describe("Product-specific pizza builder validation", () => {
  it("accepts required base, sauce and cheese choices with optional vegetables", () => {
    const result = createProductSchema.safeParse(validProduct([
      option(ids.base1, "base"),
      option(ids.sauce, "sauce"),
      option(ids.cheese, "cheese"),
      option(ids.vegetable, "vegetable")
    ]));
    expect(result.success).toBe(true);
    expect(result.data.body).not.toHaveProperty("basePriceMinor");
  });

  it("rejects a product without a required cheese choice", () => {
    const result = createProductSchema.safeParse(validProduct([
      option(ids.base1, "base"), option(ids.sauce, "sauce")
    ]));
    expect(result.success).toBe(false);
  });

  it("limits base choices to five per product", () => {
    const result = createProductSchema.safeParse(validProduct([
      ...[ids.base1, ids.base2, ids.base3, ids.base4, ids.base5, ids.base6].map(id => option(id, "base")),
      option(ids.sauce, "sauce"), option(ids.cheese, "cheese")
    ]));
    expect(result.success).toBe(false);
  });

  it("rejects duplicate inventory references within one product", () => {
    const result = createProductSchema.safeParse(validProduct([
      option(ids.base1, "base"), option(ids.base1, "base"),
      option(ids.sauce, "sauce"), option(ids.cheese, "cheese")
    ]));
    expect(result.success).toBe(false);
  });

  it("rejects malformed inventory identifiers", () => {
    const result = createProductSchema.safeParse(validProduct([
      option("not-an-object-id", "base"), option(ids.sauce, "sauce"), option(ids.cheese, "cheese")
    ]));
    expect(result.success).toBe(false);
  });
});

describe("Inventory ingredient unit validation", () => {
  const common = {
    name: "Mozzarella cheese",
    category: "Dairy",
    lowStockThreshold: 500,
    initialStock: 5000
  };

  it("defaults newly created inventory to grams", () => {
    const result = createInventorySchema.safeParse({ body: common });
    expect(result.success).toBe(true);
    expect(result.data.body.unit).toBe("g");
  });

  it("rejects non-gram inventory units", () => {
    const result = createInventorySchema.safeParse({ body: { ...common, unit: "kg" } });
    expect(result.success).toBe(false);
  });

  it("requires a builder category for builder-eligible inventory", () => {
    const result = createInventorySchema.safeParse({ body: { ...common, isBuilderEligible: true } });
    expect(result.success).toBe(false);
  });

  it("rejects non-gram unit updates", () => {
    const result = updateInventorySchema.safeParse({
      params: { id: ids.base1 },
      body: { unit: "kg" }
    });
    expect(result.success).toBe(false);
  });
});
