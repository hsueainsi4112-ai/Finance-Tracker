// Shared price comparison data — used by costguide.js and pricecompare.js
const PRICE_DATA = {
    // ── EVERYDAY STAPLES ──
    "🥛 Milk (4 pint)": {
        unit: "per 4-pint bottle",
        prices: { "Lidl": 1.09, "Aldi": 1.09, "Asda": 1.19, "Tesco": 1.25, "Co-op": 1.40, "Sainsbury's": 1.30, "M&S": 1.55, "Waitrose": 1.55 }
    },
    "🍞 Bread (800g)": {
        unit: "per 800g loaf",
        prices: { "Lidl": 0.55, "Aldi": 0.55, "Asda": 0.65, "Tesco": 0.75, "Co-op": 0.90, "Sainsbury's": 0.85, "M&S": 1.20, "Waitrose": 1.25 }
    },
    "🥚 Eggs (12 medium)": {
        unit: "per box of 12 medium eggs",
        prices: { "Lidl": 1.89, "Aldi": 1.89, "Asda": 2.10, "Tesco": 2.25, "Co-op": 2.60, "Sainsbury's": 2.50, "M&S": 3.00, "Waitrose": 3.10 }
    },
    "🍚 Rice (1kg)": {
        unit: "per 1kg bag (long grain)",
        prices: { "Lidl": 0.75, "Aldi": 0.75, "Asda": 0.85, "Tesco": 0.95, "Co-op": 1.15, "Sainsbury's": 1.05, "M&S": 1.40, "Waitrose": 1.45 }
    },
    "🍝 Pasta (500g)": {
        unit: "per 500g bag",
        prices: { "Lidl": 0.55, "Aldi": 0.55, "Asda": 0.65, "Tesco": 0.70, "Co-op": 0.89, "Sainsbury's": 0.80, "M&S": 1.10, "Waitrose": 1.15 }
    },
    "🧀 Cheddar Cheese (400g)": {
        unit: "per 400g block",
        prices: { "Lidl": 2.29, "Aldi": 2.29, "Asda": 2.50, "Tesco": 2.75, "Co-op": 3.20, "Sainsbury's": 3.00, "M&S": 3.65, "Waitrose": 3.75 }
    },
    "🧈 Butter (250g)": {
        unit: "per 250g block",
        prices: { "Lidl": 1.49, "Aldi": 1.49, "Asda": 1.65, "Tesco": 1.80, "Co-op": 2.10, "Sainsbury's": 1.95, "M&S": 2.35, "Waitrose": 2.40 }
    },
    "🍗 Chicken Breast (pack)": {
        unit: "per pack (~450g, 2 fillets)",
        prices: { "Lidl": 2.99, "Aldi": 2.99, "Asda": 3.25, "Tesco": 3.50, "Co-op": 4.20, "Sainsbury's": 3.90, "M&S": 4.75, "Waitrose": 5.00 }
    },
    "☕ Instant Coffee (100g)": {
        unit: "per 100g jar (own brand)",
        prices: { "Lidl": 0.99, "Aldi": 0.99, "Asda": 1.15, "Tesco": 1.35, "Co-op": 1.60, "Sainsbury's": 1.50, "M&S": 1.85, "Waitrose": 1.90 }
    },
    "🥫 Baked Beans (tin)": {
        unit: "per 400g tin",
        prices: { "Lidl": 0.29, "Aldi": 0.29, "Asda": 0.32, "Tesco": 0.38, "Co-op": 0.49, "Sainsbury's": 0.45, "M&S": 0.59, "Waitrose": 0.65 }
    },
    "🌾 Porridge Oats (1kg)": {
        unit: "per 1kg bag",
        prices: { "Lidl": 0.55, "Aldi": 0.55, "Asda": 0.65, "Tesco": 0.75, "Co-op": 0.95, "Sainsbury's": 0.85, "M&S": 1.20, "Waitrose": 1.25 }
    },
    "🧻 Toilet Roll (9 pack)": {
        unit: "per 9-roll pack",
        prices: { "Lidl": 1.99, "Aldi": 1.99, "Asda": 2.25, "Tesco": 2.50, "Co-op": 3.00, "Sainsbury's": 2.80, "M&S": 3.50, "Waitrose": 3.60 }
    },
    // ── FRUIT & VEG ──
    "🍌 Bananas": {
        unit: "per loose bunch (~5 bananas)",
        prices: { "Lidl": 0.55, "Aldi": 0.55, "Asda": 0.68, "Tesco": 0.68, "Co-op": 0.80, "Sainsbury's": 0.79, "M&S": 0.95, "Waitrose": 0.99 }
    },
    "🥕 Carrots (1kg)": {
        unit: "per 1kg bag",
        prices: { "Lidl": 0.45, "Aldi": 0.45, "Asda": 0.55, "Tesco": 0.59, "Co-op": 0.69, "Sainsbury's": 0.65, "M&S": 0.89, "Waitrose": 0.89 }
    },
    "🧅 Onions (1kg)": {
        unit: "per 1kg bag",
        prices: { "Lidl": 0.49, "Aldi": 0.49, "Asda": 0.55, "Tesco": 0.59, "Co-op": 0.75, "Sainsbury's": 0.69, "M&S": 0.99, "Waitrose": 0.99 }
    },
    "🥔 Potatoes (2kg)": {
        unit: "per 2kg bag",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.99, "Tesco": 1.10, "Co-op": 1.30, "Sainsbury's": 1.25, "M&S": 1.75, "Waitrose": 1.80 }
    },
    "🫛 Frozen Peas (1kg)": {
        unit: "per 1kg bag (frozen)",
        prices: { "Lidl": 0.75, "Aldi": 0.79, "Asda": 0.85, "Tesco": 0.95, "Co-op": 1.10, "Sainsbury's": 0.99, "M&S": 1.25, "Waitrose": 1.30 }
    },
    "🍎 Apples (pack 6)": {
        unit: "per pack of 6",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.99, "Tesco": 1.00, "Co-op": 1.25, "Sainsbury's": 1.10, "M&S": 1.50, "Waitrose": 1.49 }
    },
    "🍊 Oranges (pack 4)": {
        unit: "per pack of 4",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.95, "Tesco": 1.00, "Co-op": 1.20, "Sainsbury's": 1.10, "M&S": 1.45, "Waitrose": 1.50 }
    },
    "🥦 Broccoli (head)": {
        unit: "per head",
        prices: { "Lidl": 0.49, "Aldi": 0.49, "Asda": 0.55, "Tesco": 0.60, "Co-op": 0.75, "Sainsbury's": 0.70, "M&S": 0.89, "Waitrose": 0.90 }
    },
    "🍅 Tinned Tomatoes": {
        unit: "per 400g tin",
        prices: { "Lidl": 0.35, "Aldi": 0.35, "Asda": 0.39, "Tesco": 0.45, "Co-op": 0.55, "Sainsbury's": 0.50, "M&S": 0.65, "Waitrose": 0.70 }
    },
    "🧄 Garlic (bulb)": {
        unit: "per bulb",
        prices: { "Lidl": 0.30, "Aldi": 0.30, "Asda": 0.39, "Tesco": 0.40, "Co-op": 0.55, "Sainsbury's": 0.50, "M&S": 0.65, "Waitrose": 0.69 }
    },
    "🥬 Cabbage": {
        unit: "per head",
        prices: { "Lidl": 0.49, "Aldi": 0.49, "Asda": 0.55, "Tesco": 0.59, "Co-op": 0.75, "Sainsbury's": 0.70, "M&S": 0.89, "Waitrose": 0.95 }
    },
    "🌽 Sweetcorn (tin)": {
        unit: "per 325g tin",
        prices: { "Lidl": 0.30, "Aldi": 0.30, "Asda": 0.35, "Tesco": 0.40, "Co-op": 0.55, "Sainsbury's": 0.45, "M&S": 0.60, "Waitrose": 0.65 }
    },
    "🍇 Grapes (500g)": {
        unit: "per 500g bag",
        prices: { "Lidl": 1.25, "Aldi": 1.29, "Asda": 1.45, "Tesco": 1.50, "Co-op": 1.85, "Sainsbury's": 1.75, "M&S": 2.00, "Waitrose": 2.10 }
    },
    "🥑 Avocado (each)": {
        unit: "per avocado",
        prices: { "Lidl": 0.65, "Aldi": 0.65, "Asda": 0.79, "Tesco": 0.85, "Co-op": 0.99, "Sainsbury's": 0.90, "M&S": 1.10, "Waitrose": 1.15 }
    },
    "🫑 Peppers (3 pack)": {
        unit: "per pack of 3 mixed peppers",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.99, "Tesco": 1.10, "Co-op": 1.35, "Sainsbury's": 1.25, "M&S": 1.60, "Waitrose": 1.65 }
    },
    "🍓 Strawberries (400g)": {
        unit: "per 400g punnet",
        prices: { "Lidl": 1.50, "Aldi": 1.50, "Asda": 1.75, "Tesco": 1.85, "Co-op": 2.20, "Sainsbury's": 2.00, "M&S": 2.50, "Waitrose": 2.50 }
    },
    "🥝 Kiwi (pack 4)": {
        unit: "per pack of 4",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.99, "Tesco": 1.05, "Co-op": 1.25, "Sainsbury's": 1.20, "M&S": 1.45, "Waitrose": 1.50 }
    },
    "🌿 Fresh Spinach (200g)": {
        unit: "per 200g bag",
        prices: { "Lidl": 0.79, "Aldi": 0.79, "Asda": 0.89, "Tesco": 0.99, "Co-op": 1.20, "Sainsbury's": 1.10, "M&S": 1.35, "Waitrose": 1.40 }
    },
    "🫐 Blueberries (150g)": {
        unit: "per 150g punnet",
        prices: { "Lidl": 1.49, "Aldi": 1.49, "Asda": 1.65, "Tesco": 1.75, "Co-op": 2.00, "Sainsbury's": 1.90, "M&S": 2.25, "Waitrose": 2.30 }
    },
    "🍍 Pineapple (whole)": {
        unit: "per whole pineapple",
        prices: { "Lidl": 1.49, "Aldi": 1.49, "Asda": 1.75, "Tesco": 1.80, "Co-op": 2.10, "Sainsbury's": 2.00, "M&S": 2.50, "Waitrose": 2.60 }
    },
    // ── MEAT & FISH ──
    "🥩 Beef Mince (500g)": {
        unit: "per 500g pack (5% fat)",
        prices: { "Lidl": 2.49, "Aldi": 2.49, "Asda": 2.75, "Tesco": 3.00, "Co-op": 3.50, "Sainsbury's": 3.25, "M&S": 4.00, "Waitrose": 4.25 }
    },
    "🥓 Bacon Rashers (pack)": {
        unit: "per 200g pack (smoked back)",
        prices: { "Lidl": 1.35, "Aldi": 1.35, "Asda": 1.55, "Tesco": 1.75, "Co-op": 2.10, "Sainsbury's": 1.95, "M&S": 2.50, "Waitrose": 2.60 }
    },
    "🍖 Sausages (pack 6)": {
        unit: "per pack of 6 pork sausages",
        prices: { "Lidl": 1.29, "Aldi": 1.29, "Asda": 1.50, "Tesco": 1.69, "Co-op": 2.00, "Sainsbury's": 1.85, "M&S": 2.40, "Waitrose": 2.50 }
    },
    "🐟 Fish Fingers (pack 10)": {
        unit: "per pack of 10",
        prices: { "Lidl": 1.29, "Aldi": 1.29, "Asda": 1.49, "Tesco": 1.65, "Co-op": 1.95, "Sainsbury's": 1.80, "M&S": 2.20, "Waitrose": 2.30 }
    },
    "🥚 Tuna Tin (145g)": {
        unit: "per 145g tin (in brine)",
        prices: { "Lidl": 0.65, "Aldi": 0.65, "Asda": 0.75, "Tesco": 0.85, "Co-op": 1.00, "Sainsbury's": 0.95, "M&S": 1.20, "Waitrose": 1.25 }
    },
    // ── DRINKS ──
    "🧃 Orange Juice (1L)": {
        unit: "per 1 litre carton",
        prices: { "Lidl": 0.89, "Aldi": 0.89, "Asda": 0.99, "Tesco": 1.10, "Co-op": 1.30, "Sainsbury's": 1.20, "M&S": 1.55, "Waitrose": 1.60 }
    },
    "🥤 Coca-Cola (2L)": {
        unit: "per 2 litre bottle",
        prices: { "Lidl": 1.35, "Aldi": 1.35, "Asda": 1.49, "Tesco": 1.65, "Co-op": 1.99, "Sainsbury's": 1.85, "M&S": 2.20, "Waitrose": 2.25 }
    },
    "🫖 Tea Bags (80 pack)": {
        unit: "per box of 80 tea bags",
        prices: { "Lidl": 0.99, "Aldi": 0.99, "Asda": 1.15, "Tesco": 1.35, "Co-op": 1.60, "Sainsbury's": 1.50, "M&S": 1.85, "Waitrose": 1.90 }
    },
    // ── SNACKS & TREATS ──
    "🍪 Digestive Biscuits (400g)": {
        unit: "per 400g pack",
        prices: { "Lidl": 0.55, "Aldi": 0.55, "Asda": 0.65, "Tesco": 0.75, "Co-op": 0.89, "Sainsbury's": 0.85, "M&S": 1.10, "Waitrose": 1.15 }
    },
    "🍕 Frozen Pizza": {
        unit: "per pizza (stonebaked / thin crust)",
        prices: { "Lidl": 1.49, "Aldi": 1.49, "Asda": 1.75, "Tesco": 1.99, "Co-op": 2.50, "Sainsbury's": 2.25, "M&S": 3.00, "Waitrose": 3.25 }
    },
    "🍫 Chocolate Bar (100g)": {
        unit: "per 100g bar (milk chocolate)",
        prices: { "Lidl": 0.39, "Aldi": 0.39, "Asda": 0.49, "Tesco": 0.55, "Co-op": 0.69, "Sainsbury's": 0.65, "M&S": 0.85, "Waitrose": 0.90 }
    },
    "🥜 Peanut Butter (340g)": {
        unit: "per 340g jar (smooth)",
        prices: { "Lidl": 1.09, "Aldi": 1.09, "Asda": 1.25, "Tesco": 1.45, "Co-op": 1.75, "Sainsbury's": 1.60, "M&S": 2.00, "Waitrose": 2.10 }
    },
    "🫙 Pasta Sauce (jar)": {
        unit: "per 350–500g jar (tomato & basil)",
        prices: { "Lidl": 0.59, "Aldi": 0.59, "Asda": 0.69, "Tesco": 0.80, "Co-op": 0.99, "Sainsbury's": 0.90, "M&S": 1.20, "Waitrose": 1.25 }
    },
    "🍦 Ice Cream (500ml)": {
        unit: "per 500ml tub (vanilla)",
        prices: { "Lidl": 1.09, "Aldi": 1.09, "Asda": 1.29, "Tesco": 1.50, "Co-op": 1.85, "Sainsbury's": 1.70, "M&S": 2.10, "Waitrose": 2.25 }
    },
    // ── HOUSEHOLD ──
    "🧴 Washing Up Liquid (500ml)": {
        unit: "per 500ml bottle",
        prices: { "Lidl": 0.35, "Aldi": 0.35, "Asda": 0.45, "Tesco": 0.55, "Co-op": 0.70, "Sainsbury's": 0.65, "M&S": 0.85, "Waitrose": 0.90 }
    },
    "🧼 Shower Gel (250ml)": {
        unit: "per 250ml bottle",
        prices: { "Lidl": 0.65, "Aldi": 0.65, "Asda": 0.79, "Tesco": 0.89, "Co-op": 1.10, "Sainsbury's": 1.00, "M&S": 1.35, "Waitrose": 1.40 }
    },
    "🪥 Toothpaste (75ml)": {
        unit: "per 75ml tube",
        prices: { "Lidl": 0.49, "Aldi": 0.49, "Asda": 0.59, "Tesco": 0.69, "Co-op": 0.85, "Sainsbury's": 0.79, "M&S": 1.00, "Waitrose": 1.05 }
    },
    "🫧 Laundry Liquid (1L)": {
        unit: "per 1 litre bottle (~16 washes)",
        prices: { "Lidl": 1.49, "Aldi": 1.49, "Asda": 1.75, "Tesco": 2.00, "Co-op": 2.50, "Sainsbury's": 2.25, "M&S": 2.80, "Waitrose": 3.00 }
    },
};
