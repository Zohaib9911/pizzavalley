export interface Variant {
  label: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  urduName?: string;
  description?: string;
  categorySlug: string;
  variants?: Variant[];
  price?: number;
  badge?: string;       // "Deal 01", "Friends Deal" etc.
  dealItems?: string[]; // items included in a deal
}

export const products: Product[] = [
  // ── REGULAR PIZZA ──────────────────────────────────────────────
  { id: "rp-1",  name: "Nawabi Pizza",          urduName: "نوابی پیزا",           categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1500 }] },
  { id: "rp-2",  name: "Bonfire Pizza",          urduName: "بون فائیر پیزا",       categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1450 }] },
  { id: "rp-3",  name: "Malai Pizza",            urduName: "ملائی پیزا",            categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1450 }] },
  { id: "rp-4",  name: "Muglai Pizza",           urduName: "مغلانی پیزا",           categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1430 }] },
  { id: "rp-5",  name: "Chicken Fajita Pizza",   urduName: "چکن فجیتہ پیزا",        categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1430 }] },
  { id: "rp-6",  name: "Chicken Tikka Pizza",    urduName: "چکن تکہ پیزا",          categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1430 }] },
  { id: "rp-7",  name: "Pepperoni Pizza",         urduName: "پیپرونی پیزا",          categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1430 }] },
  { id: "rp-8",  name: "Chicken Supreme Pizza",  urduName: "چکن سپریم پیزا",        categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1020 }, { label: "Large", price: 1450 }] },
  { id: "rp-9",  name: "Chapli Pizza",           urduName: "چپلی پیزا",             categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1020 }, { label: "Large", price: 1450 }] },
  { id: "rp-10", name: "Cheese Pizza",           urduName: "چیز پیزا",              categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1000 }, { label: "Large", price: 1400 }] },
  { id: "rp-11", name: "Tandori Pizza",          urduName: "تندوری پیزا",           categorySlug: "regular-pizza", variants: [{ label: "Small", price: 550 }, { label: "Medium", price: 1050 }, { label: "Large", price: 1450 }] },

  // ── SPECIAL PIZZA ──────────────────────────────────────────────
  { id: "sp-1",  name: "Pizza Valley Special",        urduName: "پیزا ویلی اسپیشل",        categorySlug: "special-pizza", variants: [{ label: "Small", price: 600 }, { label: "Medium", price: 1150 }, { label: "Large", price: 1570 }] },
  { id: "sp-2",  name: "Bihari Pizza",                urduName: "بہاری پیزا",               categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1170 }, { label: "Large", price: 1570 }] },
  { id: "sp-3",  name: "Donner Pizza",                urduName: "ڈونر پیزا",                categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1150 }, { label: "Large", price: 1570 }] },
  { id: "sp-4",  name: "Kabab Pizza",                 urduName: "کباب پیزا",                categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1150 }, { label: "Large", price: 1750 }] },
  { id: "sp-5",  name: "Peri Peri Pizza",             urduName: "پیری پیری پیزا",           categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1150 }, { label: "Large", price: 1570 }] },
  { id: "sp-6",  name: "Chicken Stuff Crust Pizza",   urduName: "چکن سٹف کرسٹ پیزا",       categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1170 }, { label: "Large", price: 1570 }] },
  { id: "sp-7",  name: "Cheese Stuff Pizza",          urduName: "چیز سٹف پیزا",            categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1170 }, { label: "Large", price: 1750 }] },
  { id: "sp-8",  name: "Kabab Stuff Pizza",           urduName: "کباب سٹف پیزا",           categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1170 }, { label: "Large", price: 1570 }] },
  { id: "sp-9",  name: "Nawabi Crust Pizza",          urduName: "نوابی کرسٹ پیزا",         categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1150 }, { label: "Large", price: 1570 }] },
  { id: "sp-10", name: "Crown Crust Pizza",           urduName: "کراؤن کرسٹ پیزا",         categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1150 }, { label: "Large", price: 1570 }] },
  { id: "sp-11", name: "Deepdish Pizza",              urduName: "ڈیپ ڈش پیزا",             categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1600 }, { label: "Large", price: 2300 }] },
  { id: "sp-12", name: "Afghani Tikka Pizza",         urduName: "افغانی تکہ پیزا",          categorySlug: "special-pizza", variants: [{ label: "Medium", price: 1500 }, { label: "Large", price: 1570 }] },

  // ── SANDWICH ───────────────────────────────────────────────────
  { id: "sw-1", name: "Pizza Valley Special Sandwich", description: "Our signature sandwich loaded with fresh ingredients.", categorySlug: "sandwich", price: 450 },
  { id: "sw-2", name: "Max Chicken Sandwich",           description: "Crispy chicken fillet with fresh veggies and mayo.",  categorySlug: "sandwich", price: 600 },

  // ── WINGS ──────────────────────────────────────────────────────
  { id: "wg-1", name: "Hot Wings 5 Pcs.",         description: "Crispy wings tossed in our signature hot sauce.",       categorySlug: "wings", price: 300 },
  { id: "wg-2", name: "Hot Wings 10 Pcs.",        description: "Double the wings, double the flavour.",                 categorySlug: "wings", price: 580 },
  { id: "wg-3", name: "Oven Baked Wings 5 Pcs.",  description: "Tender oven-baked wings for a lighter crunch.",        categorySlug: "wings", price: 300 },
  { id: "wg-4", name: "Oven Baked Wings 10 Pcs.", description: "Perfect for sharing — light and juicy.",               categorySlug: "wings", price: 520 },
  { id: "wg-5", name: "Nuggets 5 Pcs.",           description: "Golden-fried chicken nuggets, crispy on the outside.", categorySlug: "wings", price: 250 },
  { id: "wg-6", name: "Nuggets 10 Pcs.",          description: "Share a bigger portion of our golden nuggets.",        categorySlug: "wings", price: 450 },
  { id: "wg-7", name: "Pop Shot 16 Pcs.",         description: "Bite-sized crispy popshots, great for snacking.",      categorySlug: "wings", price: 370 },
  { id: "wg-8", name: "Buffalo Wings 5 Pcs.",     description: "Classic buffalo-style wings with tangy sauce.",        categorySlug: "wings", price: 400 },

  // ── FRIES ──────────────────────────────────────────────────────
  { id: "fr-1", name: "Regular Fries",               description: "Classic golden crispy fries.",                          categorySlug: "fries", price: 200 },
  { id: "fr-2", name: "Large Fries",                 description: "A bigger portion of our golden fries.",                 categorySlug: "fries", price: 300 },
  { id: "fr-3", name: "Loaded Cheese Fries",         description: "Crispy fries smothered in rich melted cheese.",         categorySlug: "fries", price: 450 },
  { id: "fr-4", name: "Loaded Chicken Cheese Fries", description: "Fries topped with tender chicken strips and cheese.",   categorySlug: "fries", price: 500 },
  { id: "fr-5", name: "Pizza Fries",                 description: "Fries loaded with pizza toppings and mozzarella.",      categorySlug: "fries", price: 650 },

  // ── BURGER ─────────────────────────────────────────────────────
  { id: "bg-1", name: "Pizza Valley Special Burger", description: "Our signature burger — the ultimate flavour experience.", categorySlug: "burger", price: 499 },
  { id: "bg-2", name: "Zinger Burger",               description: "Crispy spiced chicken fillet with fresh toppings.",      categorySlug: "burger", price: 350 },
  { id: "bg-3", name: "Chicken Burger",              description: "Classic chicken burger with house sauce.",               categorySlug: "burger", price: 270 },
  { id: "bg-4", name: "Chappli Burger",              description: "Flavourful chapli-style patty in a fresh bun.",          categorySlug: "burger", price: 270 },
  { id: "bg-5", name: "Tower Burger",               description: "A towering stack of flavours in every bite.",            categorySlug: "burger", price: 470 },
  { id: "bg-6", name: "Heavy Zinger Burger",        description: "Double the crunch, double the satisfaction.",            categorySlug: "burger", price: 520 },
  { id: "bg-7", name: "Royal Treat Burger",         description: "A premium burger with all the trimmings.",               categorySlug: "burger", price: 400 },
  { id: "bg-8", name: "Pizza Burger",              description: "A burger with pizza-inspired toppings.",                 categorySlug: "burger", price: 370 },
  { id: "bg-9", name: "Pizza Zinger Burger",        description: "Zinger meets pizza in one epic burger.",                categorySlug: "burger", price: 420 },

  // ── ROLL ───────────────────────────────────────────────────────
  { id: "rl-1", name: "Behari Roll 4 Pce",    description: "Tender behari-spiced meat wrapped in soft roti.",      categorySlug: "roll", price: 570 },
  { id: "rl-2", name: "B.B.Q Roll 4 Pce",     description: "BBQ-marinated filling in a fresh paratha roll.",       categorySlug: "roll", price: 570 },
  { id: "rl-3", name: "Malai Roll 4 Pce",     description: "Creamy malai chicken wrapped in soft bread.",          categorySlug: "roll", price: 570 },
  { id: "rl-4", name: "Nawabi Roll",          description: "A royal roll with rich, aromatic spiced filling.",     categorySlug: "roll", price: 260 },
  { id: "rl-5", name: "Paratha Roll",         description: "Flaky paratha with your choice of filling.",           categorySlug: "roll", price: 300 },
  { id: "rl-6", name: "Zinger Paratha Roll",  description: "Crispy zinger chicken wrapped in flaky paratha.",     categorySlug: "roll", price: 350 },
  { id: "rl-7", name: "Chapli Kabab Roll",    description: "Classic chapli kabab in a soft fresh roll.",           categorySlug: "roll", price: 299 },

  // ── WRAPS ──────────────────────────────────────────────────────
  { id: "wp-1", name: "Tortilla Wrap",             description: "Fresh filling in a light tortilla wrap.",               categorySlug: "wraps", price: 370 },
  { id: "wp-2", name: "Tandori Garlic Mayo Wrap",  description: "Tandoori spiced filling with garlic mayo.",            categorySlug: "wraps", price: 370 },
  { id: "wp-3", name: "Bar B.Q Wrap",              description: "BBQ marinated filling wrapped in soft tortilla.",       categorySlug: "wraps", price: 370 },
  { id: "wp-4", name: "Crunchi Wrap",              description: "Extra crunch in every bite of this loaded wrap.",      categorySlug: "wraps", price: 420 },
  { id: "wp-5", name: "Peri Peri Wrap",            description: "Bold peri peri spiced chicken in a fresh wrap.",       categorySlug: "wraps", price: 370 },

  // ── PASTA ──────────────────────────────────────────────────────
  { id: "pa-1", name: "Special Pasta",  description: "Our chef's special pasta with a rich, creamy sauce.", categorySlug: "pasta", variants: [{ label: "Small", price: 350 }, { label: "Large", price: 600 }] },
  { id: "pa-2", name: "Macroni Pasta", description: "Classic macaroni in a flavourful sauce.",              categorySlug: "pasta", variants: [{ label: "Small", price: 350 }, { label: "Large", price: 600 }] },
  { id: "pa-3", name: "Crunchi Pasta", description: "Pasta with a satisfying crunch and bold flavours.",   categorySlug: "pasta", variants: [{ label: "Small", price: 400 }, { label: "Large", price: 700 }] },

  // ── SHAWARMA ───────────────────────────────────────────────────
  { id: "sh-1", name: "Chicken Shawarma",      description: "Classic shawarma with juicy chicken and fresh veggies.", categorySlug: "sharwarma", price: 200 },
  { id: "sh-2", name: "Zinger Shawarma",       description: "Crispy zinger chicken wrapped shawarma style.",          categorySlug: "sharwarma", price: 280 },
  { id: "sh-3", name: "Arabian Chic. Gyoura",  description: "Arabian-style shawarma with special sauces.",            categorySlug: "sharwarma", price: 260 },

  // ── FAST FOOD DEALS ────────────────────────────────────────────
  { id: "ffd-01", name: "Deal 01", badge: "Deal 01", price: 639,  categorySlug: "fast-food-deals", dealItems: ["1 Zinger Burger", "1 Reg. Fries", "1 x 500ml Drink"] },
  { id: "ffd-02", name: "Deal 02", badge: "Deal 02", price: 689,  categorySlug: "fast-food-deals", dealItems: ["1 Zinger Burger", "1 Arabian Chic. Gyoura", "1 x 500ml Drink"] },
  { id: "ffd-03", name: "Deal 03", badge: "Deal 03", price: 739,  categorySlug: "fast-food-deals", dealItems: ["1 Zinger Burger", "5 Hot Wings", "1 x 500ml Soft Drink"] },
  { id: "ffd-04", name: "Deal 04", badge: "Deal 04", price: 889,  categorySlug: "fast-food-deals", dealItems: ["2 Zinger Burger", "2 Wings", "1 x 500ml Drink"] },
  { id: "ffd-05", name: "Deal 05", badge: "Deal 05", price: 2199, categorySlug: "fast-food-deals", dealItems: ["5 Zinger Burger", "5 Wings", "1 x 1.5ltr Drink"] },
  { id: "ffd-06", name: "Deal 06", badge: "Deal 06", price: 689,  categorySlug: "fast-food-deals", dealItems: ["1 Heavy Zinger", "1 x 500ml Drink"] },
  { id: "ffd-07", name: "Deal 07", badge: "Deal 07", price: 629,  categorySlug: "fast-food-deals", dealItems: ["1 Zinger Burger", "5 Nuggets", "1 x 500ml Drink"] },
  { id: "ffd-08", name: "Deal 08", badge: "Deal 08", price: 1829, categorySlug: "fast-food-deals", dealItems: ["4 Zinger Burger", "5 Hot Wings", "1 x 1 Ltr. Drink"] },
  { id: "ffd-09", name: "Deal 09", badge: "Deal 09", price: 879,  categorySlug: "fast-food-deals", dealItems: ["1 Behari Roll 4 Pcs", "1 Macroni Pasta Small", "1 x 500ml Drink"] },
  { id: "ffd-10", name: "Deal 10", badge: "Deal 10", price: 949,  categorySlug: "fast-food-deals", dealItems: ["1 Zinger Burger", "1 Tower Burger", "1 x 500ml Drink"] },
  { id: "ffd-11", name: "Deal 11", badge: "Deal 11", price: 1469, categorySlug: "fast-food-deals", dealItems: ["3 Zinger Burger", "5 Hot Wings", "1 x 1 Ltr. Drink"] },
  { id: "ffd-12", name: "Deal 12", badge: "Deal 12", price: 999,  categorySlug: "fast-food-deals", dealItems: ["2 Grill Burger", "5 Oven Baked Wings", "1 x 500ml Drink"] },

  // ── PIZZA DEALS ────────────────────────────────────────────────
  { id: "pd-01", name: "Deal 01",       badge: "Deal 01",       price: 1230, categorySlug: "pizza-deals", dealItems: ["2 Small Pizza", "1 x 1 Ltr. Drink"] },
  { id: "pd-02", name: "Deal 02",       badge: "Deal 02",       price: 1420, categorySlug: "pizza-deals", dealItems: ["1 Medium Pizza", "5 Hot Wings", "1 x 1 Ltr. Drink"] },
  { id: "pd-03", name: "Deal 03",       badge: "Deal 03",       price: 910,  categorySlug: "pizza-deals", dealItems: ["1 Small Pizza", "5 Hot Wings", "1 x 500ml Drink"] },
  { id: "pd-04", name: "Deal 04",       badge: "Deal 04",       price: 1520, categorySlug: "pizza-deals", dealItems: ["1 Medium Pizza", "1 Zinger Burger", "1 x 1 Ltr. Drink"] },
  { id: "pd-05", name: "Deal 05",       badge: "Deal 05",       price: 2130, categorySlug: "pizza-deals", dealItems: ["1 Large Pizza", "5 Hot Wings", "5 Nuggets", "1 x 1.5 Ltr. Drink"] },
  { id: "pd-06", name: "Deal 06",       badge: "Deal 06",       price: 1720, categorySlug: "pizza-deals", dealItems: ["1 Medium Pizza", "1 Small Pizza", "1 x 1.5ltr Drink"] },
  { id: "pd-07", name: "Deal 07",       badge: "Deal 07",       price: 2210, categorySlug: "pizza-deals", dealItems: ["2 Medium Pizza", "1 x 1.5ltr Drink"] },
  { id: "pd-08", name: "Deal 08",       badge: "Deal 08",       price: 3070, categorySlug: "pizza-deals", dealItems: ["2 Large Pizza", "1 x 1.5ltr Drink"] },
  { id: "pd-09", name: "Deal 09",       badge: "Deal 09",       price: 2619, categorySlug: "pizza-deals", dealItems: ["1 Large Pizza", "1 Medium Pizza", "1 x 1.5ltr Drink"] },
  { id: "pd-10", name: "Deal 10",       badge: "Deal 10",       price: 1899, categorySlug: "pizza-deals", dealItems: ["1 Large Pizza", "5 Hot Wings", "1 x 1.5ltr Drink"] },
  { id: "pd-fd", name: "Friends Deal",  badge: "Friends Deal",  price: 2869, categorySlug: "pizza-deals", dealItems: ["2 Medium Pizza", "2 Zinger Burger", "1 x 1.5ltr Drink"] },
  { id: "pd-fm", name: "Family Deal",   badge: "Family Deal",   price: 3719, categorySlug: "pizza-deals", dealItems: ["2 Large Pizza", "2 Zinger Burger", "1 x 1.5ltr Drink"] },

  // ── CAKES (placeholder) ────────────────────────────────────────
  { id: "ck-1", name: "Chocolate Fudge Cake",  description: "Rich dark chocolate layers with velvety fudge frosting.", categorySlug: "cakes", price: 1800 },
  { id: "ck-2", name: "Red Velvet Cake",       description: "Classic red velvet with cream cheese frosting.",          categorySlug: "cakes", price: 1600 },
  { id: "ck-3", name: "Black Forest Cake",     description: "Light sponge, cherries and whipped cream layers.",        categorySlug: "cakes", price: 1700 },
  { id: "ck-4", name: "Lotus Biscoff Cake",    description: "Our signature lotus cream cake — a fan favourite.",       categorySlug: "cakes", price: 2000 },

  // ── CUSTOMIZED CAKES (placeholder) ────────────────────────────
  { id: "cc-1", name: "Birthday Cake",       description: "Personalised design for your special day.", categorySlug: "customized-cakes", price: 2500 },
  { id: "cc-2", name: "Wedding Cake",        description: "Elegant multi-tier cake for your big day.", categorySlug: "customized-cakes", price: 5000 },
  { id: "cc-3", name: "Anniversary Cake",    description: "A beautiful custom cake to celebrate love.", categorySlug: "customized-cakes", price: 2200 },

  // ── PASTRIES (placeholder) ─────────────────────────────────────
  { id: "pt-1", name: "Croissant",       description: "Buttery, flaky pastry baked fresh daily.",         categorySlug: "pastries", price: 180 },
  { id: "pt-2", name: "Danish Pastry",  description: "Sweet layered pastry with fruit or cream filling.", categorySlug: "pastries", price: 220 },
  { id: "pt-3", name: "Puff Pastry",    description: "Light, airy puff pastry in various flavours.",      categorySlug: "pastries", price: 150 },
  { id: "pt-4", name: "Cheese Danish",  description: "Flaky pastry filled with smooth cream cheese.",     categorySlug: "pastries", price: 250 },

  // ── SPECIAL BISCUITS (placeholder) ────────────────────────────
  { id: "sb-1", name: "Royal Biscuit",       description: "Premium biscuits with a buttery, crumbly texture.", categorySlug: "special-biscuits", price: 350 },
  { id: "sb-2", name: "Chocolate Chip",      description: "Classic chocolate chip biscuits — always a hit.",   categorySlug: "special-biscuits", price: 300 },
  { id: "sb-3", name: "Almond Crunch",       description: "Crunchy biscuits packed with premium almonds.",     categorySlug: "special-biscuits", price: 400 },
  { id: "sb-4", name: "Coconut Delight",     description: "Soft biscuits with a hint of toasted coconut.",     categorySlug: "special-biscuits", price: 320 },
];

export function getProductsByCategory(slug: string): Product[] {
  return products.filter((p) => p.categorySlug === slug);
}

export const categoryImages: Record<string, string> = {
  "regular-pizza":    "/images/pizzaa-grey-512x512_1_.png",
  "special-pizza":    "/images/pizzaa-grey-512x512_1_.png",
  "sandwich":         "/images/Sandwich-grey-512x512.png",
  "wings":            "/images/Nimko-grey-512x512.png",
  "fries":            "/images/puff-grey-512x512.png",
  "burger":           "/images/Jalapeno-Burger-grey-512x512.png",
  "roll":             "/images/Roll-2-grey-512x512.png",
  "wraps":            "/images/Roll-2-grey-512x512.png",
  "pasta":            "/images/salad-grey-512x512.png",
  "sharwarma":        "/images/Sandwich-grey-512x512.png",
  "fast-food-deals":  "/images/Gifrbasket-grey-512x512_1_.png",
  "pizza-deals":      "/images/pizzaa-grey-512x512_1_.png",
  "cakes":            "/images/Cake-grey-512x512.png",
  "customized-cakes": "/images/Cake-grey-512x512.png",
  "pastries":         "/images/Pastry-grey-512x512.png",
  "special-biscuits": "/images/Royal-biscuit-grey-512x512.png",
};

export const categoryNotes: Record<string, string> = {
  "regular-pizza": "Extra Topping Charges: Small Rs.90 · Medium Rs.150 · Large Rs.190",
  "special-pizza": "Note: Special & Stuff Pizza are not available in Deals",
  "pizza-deals":   "Note: Special & Stuff Pizza are not available in Deals",
};
