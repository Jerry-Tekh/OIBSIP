export const menuItems = [
  { slug: "margherita", name: "The Margherita", detail: "San Marzano tomato · fior di latte · basil", tag: "THE CLASSIC", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=1100&q=88", description: "A timeless combination of tomato, mozzarella and fresh basil." },
  { slug: "smoky-pepperoni", name: "Smoky Pepperoni", detail: "Spiced pepperoni · mozzarella · house tomato", tag: "A CROWD FAVOURITE", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=1100&q=88", description: "Rich tomato, mozzarella and a generous finish of pepperoni." },
  { slug: "garden-afterglow", name: "Garden Afterglow", detail: "Roasted peppers · olives · mushrooms · herbs", tag: "MEAT-FREE", image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=1100&q=88", description: "A bright, savoury mix of garden vegetables and herbs." }
];

export function findMenuItem(slug) {
  return menuItems.find((item) => item.slug === slug) ?? null;
}
