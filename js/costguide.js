console.log("costguide.js loaded");

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Please log in first!");
    window.location.href = "login.html";
}

const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name || "User";

let searchQuery = "";

// ── GROCERIES ──
const groceries = [
    { name: "Lidl", priceLevel: 1, tag: "Low", note: "Budget supermarket · best for fruit & veg" },
    { name: "Aldi", priceLevel: 1, tag: "Low", note: "Budget supermarket · great value" },
    { name: "Asda", priceLevel: 2, tag: "Low–Mid", note: "Good value range · rollback deals" },
    { name: "Tesco", priceLevel: 3, tag: "Mid", note: "Standard UK option · Clubcard savings" },
    { name: "Co-op", priceLevel: 3, tag: "Mid", note: "Convenience (small stores)" },
    { name: "Sainsbury's", priceLevel: 4, tag: "Mid–High", note: "Often pricier than Tesco · Nectar card" },
    { name: "M&S Food", priceLevel: 5, tag: "High", note: "Premium groceries" },
    { name: "Waitrose", priceLevel: 5, tag: "High", note: "Premium groceries" },
];

// ── RESTAURANTS ──
const restaurants = [
    { name: "Greggs", priceLevel: 1, tag: "~£1–£4", note: "Bakery / quick bites" },
    { name: "McDonald's", priceLevel: 1, tag: "~£5–£8", note: "Fast food" },
    { name: "KFC", priceLevel: 1, tag: "~£5–£9", note: "Fast food" },
    { name: "Subway", priceLevel: 1, tag: "~£5–£8", note: "Fast food" },
    { name: "Five Guys", priceLevel: 3, tag: "~£12–£18", note: "Burgers (often pricier)" },
    { name: "Nando's", priceLevel: 3, tag: "~£12–£18", note: "Casual dining" },
    { name: "Wagamama", priceLevel: 3, tag: "~£13–£18", note: "Casual dining" },
    { name: "PizzaExpress", priceLevel: 3, tag: "~£13–£20", note: "Casual dining" },
    { name: "Turtle Bay", priceLevel: 3, tag: "~£13–£18", note: "Caribbean (often deals)" },
    { name: "Pho", priceLevel: 4, tag: "~£14–£20", note: "Vietnamese chain" },
    { name: "Giggling Squid", priceLevel: 4, tag: "~£15–£22", note: "Thai chain" },
    { name: "The Ivy", priceLevel: 5, tag: "~£30–£60", note: "Premium dining" },
    { name: "Steak / Fine Dining", priceLevel: 5, tag: "~£35–£70", note: "Premium dining" },
];

// ── SHOPPING ──
const shopping = [
    { name: "Primark", priceLevel: 1, tag: "Low", note: "Budget fashion" },
    { name: "Sports Direct", priceLevel: 1, tag: "Low", note: "Budget sportswear deals" },
    { name: "H&M", priceLevel: 2, tag: "Low–Mid", note: "Affordable fashion" },
    { name: "New Look", priceLevel: 2, tag: "Low–Mid", note: "Affordable fashion" },
    { name: "TK Maxx", priceLevel: 2, tag: "Low–Mid", note: "Discount branded items" },
    { name: "Uniqlo", priceLevel: 3, tag: "Mid", note: "Good basics (value)" },
    { name: "River Island", priceLevel: 3, tag: "Mid", note: "High-street" },
    { name: "JD Sports", priceLevel: 3, tag: "Mid", note: "Sportswear" },
    { name: "Zara", priceLevel: 4, tag: "Mid–High", note: "Higher than H&M" },
    { name: "COS", priceLevel: 4, tag: "Mid–High", note: "Minimal / premium feel" },
    { name: "Nike Store", priceLevel: 4, tag: "Mid–High", note: "Brand pricing" },
    { name: "Adidas Store", priceLevel: 4, tag: "Mid–High", note: "Brand pricing" },
    { name: "Selfridges", priceLevel: 5, tag: "High", note: "Premium department store" },
    { name: "Luxury Designer Stores", priceLevel: 5, tag: "High", note: "Premium brands" },
];

// ── TRANSPORT ──
const transport = [
    { name: "🚌 City Bus (single)", priceLevel: 1, tag: "~£2.00", note: "First Bus Bristol · tap-in or app" },
    { name: "🚌 Monthly Bus Pass", priceLevel: 2, tag: "~£55/month", note: "Best value for daily travel · First Bus" },
    { name: "🚲 Cycling / Walking", priceLevel: 1, tag: "Free", note: "Best for short distances · no cost" },
    { name: "🚆 Train Bristol–Bath", priceLevel: 3, tag: "~£6–£10", note: "GWR · cheaper off-peak" },
    { name: "🚌 National Express Coach", priceLevel: 2, tag: "~£5–£15", note: "Cheapest for long distance trips" },
    { name: "🚕 Uber (short trip)", priceLevel: 3, tag: "~£6–£12", note: "Convenient but adds up quickly" },
    { name: "🚕 Uber (long trip)", priceLevel: 4, tag: "~£15–£30", note: "Avoid for regular use" },
    { name: "🚆 Train Bristol–London", priceLevel: 5, tag: "~£30–£80", note: "GWR · book in advance for discounts" },
];

// ── BILLS & ESSENTIALS ──
const bills = [
    { name: "📱 Student SIM (giffgaff/Smarty)", priceLevel: 1, tag: "~£6–£10/month", note: "Best value SIM-only deals for students" },
    { name: "🏛️ Council Tax", priceLevel: 1, tag: "FREE", note: "Full-time students are exempt · get a certificate from uni" },
    { name: "🌐 Broadband (split)", priceLevel: 2, tag: "~£8–£15/month", note: "Split between housemates in student houses" },
    { name: "🏋️ Gym (PureGym/Uni gym)", priceLevel: 2, tag: "~£10–£20/month", note: "PureGym or university gym · often student discount" },
    { name: "📺 TV Licence", priceLevel: 2, tag: "~£13.25/month", note: "Required if you watch live TV · not Netflix/streaming" },
    { name: "⚡ Electric/Gas (split)", priceLevel: 3, tag: "~£30–£50/month", note: "Per person · varies by season & insulation" },
    { name: "🎓 NUS/Totum Student Card", priceLevel: 1, tag: "~£14.99/year", note: "Unlocks discounts at hundreds of UK retailers" },
];

// Price comparison data is loaded from js/pricedata.js (PRICE_DATA)

// ── OPEN PRICE COMPARISON PAGE ──
function showPriceComparison(itemName) {
    window.location.href = "pricecompare.html?item=" + encodeURIComponent(itemName);
}

// ── SORT ──
function sortList(items, mode) {
    return [...items].sort((a, b) =>
        mode === "low_high" ? a.priceLevel - b.priceLevel : b.priceLevel - a.priceLevel
    );
}

// ── FILTER BY SEARCH ──
function filterItems(items) {
    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(x =>
        x.name.toLowerCase().includes(q) ||
        (x.note || "").toLowerCase().includes(q) ||
        (x.tag || "").toLowerCase().includes(q)
    );
}

// ── LOG EXPENSE (redirect to expense form pre-filled) ──
function logExpense(category, itemName) {
    const cleanName = itemName.replace(/[^\w\s£&–'.()]/g, "").trim();
    const url = `expense.html?category=${encodeURIComponent(category)}&note=${encodeURIComponent(cleanName)}`;
    window.location.href = url;
}

// ── RENDER ──
function renderList(containerId, items, expenseCategory) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const filtered = filterItems(items);
    el.innerHTML = "";

    if (filtered.length === 0) {
        el.innerHTML = `<div class="no-results">No results for "<b>${searchQuery}</b>"</div>`;
        return;
    }

    const tagColors = {
        1: { bg: "#dcfce7", color: "#15803d" },
        2: { bg: "#d1fae5", color: "#065f46" },
        3: { bg: "#fef9c3", color: "#854d0e" },
        4: { bg: "#ffedd5", color: "#9a3412" },
        5: { bg: "#fee2e2", color: "#991b1b" },
    };

    filtered.forEach(x => {
        const row = document.createElement("div");
        row.className = "report-item";
        const tc = tagColors[x.priceLevel] || { bg: "#f3f4f6", color: "#374151" };
        const cat = expenseCategory || "Other";
        const safeName = x.name.replace(/'/g, "\\'");
        const hasCompare = PRICE_DATA[x.name] !== undefined;

        if (hasCompare) {
            row.classList.add("has-compare");
            row.title = "Click to compare prices across supermarkets";
            row.onclick = () => showPriceComparison(x.name);
        }

        row.innerHTML = `
            <div class="item-left">
                <div class="item-name">
                    ${x.name}
                    ${hasCompare ? '<span class="compare-hint">Compare prices →</span>' : ""}
                </div>
                <div class="item-note">${x.note || ""}</div>
            </div>
            <div class="item-right">
                <div class="item-tag" style="background:${tc.bg};color:${tc.color}">${x.tag}</div>
                <button class="log-btn" onclick="event.stopPropagation(); logExpense('${cat}', '${safeName}')">+ Log</button>
            </div>
        `;
        el.appendChild(row);
    });
}

// ── AI SAVINGS INSIGHT ──
async function loadAIInsight() {
    try {
        const resp = await fetch(`http://127.0.0.1:5000/current_month_spending/${user.id}`);
        const spending = await resp.json();

        // Reference benchmarks: budget-level monthly spend per category
        const benchmarks = {
            "Food":      { budget: 100, tip: "Switching to Lidl/Aldi and cooking at home more" },
            "Transport": { budget: 55,  tip: "Using a monthly bus pass instead of single tickets or Uber" },
            "Shopping":  { budget: 40,  tip: "Choosing Primark or H&M over mid-high street brands" },
            "Trip":      { budget: 30,  tip: "Taking National Express coaches instead of trains" },
        };

        const insights = [];
        for (const [cat, total] of Object.entries(spending)) {
            if (!benchmarks[cat]) continue;
            const saving = Math.round(total - benchmarks[cat].budget);
            if (saving > 5) {
                insights.push(
                    `<b>${cat}:</b> You spent <b>£${total.toFixed(0)}</b> this month. ` +
                    `${benchmarks[cat].tip} could save you approximately <b>£${saving}</b>.`
                );
            } else if (total > 0) {
                insights.push(`<b>${cat}:</b> You spent <b>£${total.toFixed(0)}</b> this month — great, you're spending efficiently! ✅`);
            }
        }

        const panel = document.getElementById("ai-insight-panel");
        const list  = document.getElementById("ai-insight-list");

        if (insights.length > 0) {
            list.innerHTML = insights.map(i => `<li>${i}</li>`).join("");
            panel.style.display = "block";
        }
    } catch (err) {
        console.error("AI insight error:", err);
    }
}

// ── RENDER PRICE COMPARISON ITEMS ──
function renderCompareItems() {
    const el = document.getElementById("compareItemsList");
    if (!el) return;

    const q = searchQuery.toLowerCase();
    const items = Object.keys(PRICE_DATA).filter(name =>
        !q || name.toLowerCase().includes(q)
    );

    if (items.length === 0) {
        el.innerHTML = `<div class="no-results">No results for "<b>${searchQuery}</b>"</div>`;
        return;
    }

    el.innerHTML = items.map(name => {
        const data     = PRICE_DATA[name];
        const prices   = Object.values(data.prices);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const cheapest = Object.keys(data.prices).find(s => data.prices[s] === minPrice);
        const saving   = (maxPrice - minPrice).toFixed(2);

        return `
            <div class="report-item has-compare" onclick="showPriceComparison('${name.replace(/'/g, "\\'")}')">
                <div class="item-left">
                    <div class="item-name">
                        ${name}
                        <span class="compare-hint">Compare prices →</span>
                    </div>
                    <div class="item-note">Lidl · Aldi · Asda · Tesco · Co-op · Sainsbury's · M&S · Waitrose &nbsp;|&nbsp; Best: <b>${cheapest} £${minPrice.toFixed(2)}</b> · Save up to <b>£${saving}</b></div>
                </div>
                <div class="item-right">
                    <div class="item-tag" style="background:#dcfce7;color:#15803d">from £${minPrice.toFixed(2)}</div>
                    <button class="log-btn" onclick="event.stopPropagation(); logExpense('Food', '${name.replace(/'/g, "\\'")}')">+ Log</button>
                </div>
            </div>`;
    }).join("");
}

// ── AI GROCERY PLANNER ──

// Priority score: lower = more essential (AI picks highest priority first when budget is tight)
var GP_PRIORITY = {
    "🥛 Milk (4 pint)":            1,
    "🍞 Bread (800g)":             1,
    "🥚 Eggs (12 medium)":         1,
    "🍝 Pasta (500g)":             1,
    "🍚 Rice (1kg)":               1,
    "🥫 Baked Beans (tin)":        1,
    "🌾 Porridge Oats (1kg)":      2,
    "🍅 Tinned Tomatoes":          2,
    "🥕 Carrots (1kg)":            2,
    "🥔 Potatoes (2kg)":           2,
    "🧅 Onions (1kg)":             2,
    "🍌 Bananas":                  2,
    "🥦 Broccoli (head)":          2,
    "🥚 Tuna Tin (145g)":          2,
    "🍗 Chicken Breast (pack)":    3,
    "🧈 Butter (250g)":            3,
    "🫙 Pasta Sauce (jar)":        3,
    "🍎 Apples (pack 6)":          3,
    "🧄 Garlic (bulb)":            3,
    "🌽 Sweetcorn (tin)":          3,
    "🫛 Frozen Peas (1kg)":        3,
    "🧴 Washing Up Liquid (500ml)":3,
    "🥩 Beef Mince (500g)":        4,
    "🍖 Sausages (pack 6)":        4,
    "🐟 Fish Fingers (pack 10)":   4,
    "🧀 Cheddar Cheese (400g)":    4,
    "🫖 Tea Bags (80 pack)":       4,
    "🍊 Oranges (pack 4)":         4,
    "🫑 Peppers (3 pack)":         4,
    "🌿 Fresh Spinach (200g)":     4,
    "🥓 Bacon Rashers (pack)":     4,
    "🪥 Toothpaste (75ml)":        4,
    "🧻 Toilet Roll (9 pack)":     4,
    "🧃 Orange Juice (1L)":        5,
    "🍇 Grapes (500g)":            5,
    "🍓 Strawberries (400g)":      5,
    "☕ Instant Coffee (100g)":    5,
    "🥜 Peanut Butter (340g)":     5,
    "🍕 Frozen Pizza":             5,
    "🍪 Digestive Biscuits (400g)":5,
    "🍫 Chocolate Bar (100g)":     5,
    "🥤 Coca-Cola (2L)":           5,
    "🍦 Ice Cream (500ml)":        6,
    "🥑 Avocado (each)":           6,
    "🫐 Blueberries (150g)":       6,
    "🍍 Pineapple (whole)":        6,
    "🥝 Kiwi (pack 4)":            6,
    "🧼 Shower Gel (250ml)":       6,
    "🫧 Laundry Liquid (1L)":      6,
};

var GP_TIERS = {
    budget: [
        { key: "🥛 Milk (4 pint)",             cat: "🥛 Staples",      qty: 1, shared: false },
        { key: "🍞 Bread (800g)",               cat: "🥛 Staples",      qty: 1, shared: false },
        { key: "🥚 Eggs (12 medium)",           cat: "🥛 Staples",      qty: 1, shared: false },
        { key: "🍚 Rice (1kg)",                 cat: "🥛 Staples",      qty: 1, shared: true  },
        { key: "🍝 Pasta (500g)",               cat: "🥛 Staples",      qty: 1, shared: false },
        { key: "🥫 Baked Beans (tin)",          cat: "🥛 Staples",      qty: 2, shared: false },
        { key: "🌾 Porridge Oats (1kg)",        cat: "🥛 Staples",      qty: 1, shared: true  },
        { key: "🍅 Tinned Tomatoes",            cat: "🥦 Fruit & Veg",  qty: 2, shared: false },
        { key: "🥕 Carrots (1kg)",              cat: "🥦 Fruit & Veg",  qty: 1, shared: true  },
        { key: "🥔 Potatoes (2kg)",             cat: "🥦 Fruit & Veg",  qty: 1, shared: true  },
        { key: "🧅 Onions (1kg)",               cat: "🥦 Fruit & Veg",  qty: 1, shared: true  },
        { key: "🍌 Bananas",                    cat: "🥦 Fruit & Veg",  qty: 1, shared: false },
        { key: "🥦 Broccoli (head)",            cat: "🥦 Fruit & Veg",  qty: 1, shared: false },
        { key: "🍗 Chicken Breast (pack)",      cat: "🍗 Protein",      qty: 1, shared: false },
        { key: "🥚 Tuna Tin (145g)",            cat: "🍗 Protein",      qty: 2, shared: false },
        { key: "🧴 Washing Up Liquid (500ml)",  cat: "🏠 Household",    qty: 1, shared: true  },
    ],
    balanced: [
        { key: "🥛 Milk (4 pint)",             cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🍞 Bread (800g)",               cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🥚 Eggs (12 medium)",           cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🍚 Rice (1kg)",                 cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "🍝 Pasta (500g)",               cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🧈 Butter (250g)",              cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "🥫 Baked Beans (tin)",          cat: "🥛 Staples",        qty: 2, shared: false },
        { key: "🌾 Porridge Oats (1kg)",        cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "🍅 Tinned Tomatoes",            cat: "🥦 Fruit & Veg",    qty: 2, shared: false },
        { key: "🥕 Carrots (1kg)",              cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🥔 Potatoes (2kg)",             cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🧅 Onions (1kg)",               cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🍌 Bananas",                    cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍎 Apples (pack 6)",            cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🥦 Broccoli (head)",            cat: "🥦 Fruit & Veg",    qty: 2, shared: false },
        { key: "🫛 Frozen Peas (1kg)",          cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🧄 Garlic (bulb)",              cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🌽 Sweetcorn (tin)",            cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍗 Chicken Breast (pack)",      cat: "🍗 Protein",        qty: 1, shared: false },
        { key: "🍖 Sausages (pack 6)",          cat: "🍗 Protein",        qty: 1, shared: false },
        { key: "🥚 Tuna Tin (145g)",            cat: "🍗 Protein",        qty: 2, shared: false },
        { key: "🫙 Pasta Sauce (jar)",          cat: "🍪 Snacks",         qty: 1, shared: false },
        { key: "🫖 Tea Bags (80 pack)",         cat: "🥤 Drinks",         qty: 1, shared: true  },
        { key: "🧴 Washing Up Liquid (500ml)",  cat: "🏠 Household",      qty: 1, shared: true  },
        { key: "🪥 Toothpaste (75ml)",          cat: "🏠 Household",      qty: 1, shared: false },
        { key: "🧻 Toilet Roll (9 pack)",       cat: "🏠 Household",      qty: 1, shared: true  },
    ],
    variety: [
        { key: "🥛 Milk (4 pint)",             cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🍞 Bread (800g)",               cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🥚 Eggs (12 medium)",           cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🍚 Rice (1kg)",                 cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "🍝 Pasta (500g)",               cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🧈 Butter (250g)",              cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "🧀 Cheddar Cheese (400g)",      cat: "🥛 Staples",        qty: 1, shared: false },
        { key: "🥫 Baked Beans (tin)",          cat: "🥛 Staples",        qty: 2, shared: false },
        { key: "🌾 Porridge Oats (1kg)",        cat: "🥛 Staples",        qty: 1, shared: true  },
        { key: "☕ Instant Coffee (100g)",      cat: "🥤 Drinks",         qty: 1, shared: true  },
        { key: "🧻 Toilet Roll (9 pack)",       cat: "🏠 Household",      qty: 1, shared: true  },
        { key: "🍅 Tinned Tomatoes",            cat: "🥦 Fruit & Veg",    qty: 2, shared: false },
        { key: "🥕 Carrots (1kg)",              cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🥔 Potatoes (2kg)",             cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🧅 Onions (1kg)",               cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🍌 Bananas",                    cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍎 Apples (pack 6)",            cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍊 Oranges (pack 4)",           cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🥦 Broccoli (head)",            cat: "🥦 Fruit & Veg",    qty: 2, shared: false },
        { key: "🫛 Frozen Peas (1kg)",          cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🧄 Garlic (bulb)",              cat: "🥦 Fruit & Veg",    qty: 1, shared: true  },
        { key: "🌽 Sweetcorn (tin)",            cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🫑 Peppers (3 pack)",           cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🌿 Fresh Spinach (200g)",       cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍇 Grapes (500g)",              cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍓 Strawberries (400g)",        cat: "🥦 Fruit & Veg",    qty: 1, shared: false },
        { key: "🍗 Chicken Breast (pack)",      cat: "🍗 Protein",        qty: 2, shared: false },
        { key: "🥩 Beef Mince (500g)",          cat: "🍗 Protein",        qty: 1, shared: false },
        { key: "🥓 Bacon Rashers (pack)",       cat: "🍗 Protein",        qty: 1, shared: false },
        { key: "🐟 Fish Fingers (pack 10)",     cat: "🍗 Protein",        qty: 1, shared: false },
        { key: "🥚 Tuna Tin (145g)",            cat: "🍗 Protein",        qty: 2, shared: false },
        { key: "🫙 Pasta Sauce (jar)",          cat: "🍪 Snacks",         qty: 1, shared: false },
        { key: "🍪 Digestive Biscuits (400g)",  cat: "🍪 Snacks",         qty: 1, shared: false },
        { key: "🍫 Chocolate Bar (100g)",       cat: "🍪 Snacks",         qty: 2, shared: false },
        { key: "🥜 Peanut Butter (340g)",       cat: "🍪 Snacks",         qty: 1, shared: true  },
        { key: "🍕 Frozen Pizza",               cat: "🍪 Snacks",         qty: 1, shared: false },
        { key: "🫖 Tea Bags (80 pack)",         cat: "🥤 Drinks",         qty: 1, shared: true  },
        { key: "🧃 Orange Juice (1L)",          cat: "🥤 Drinks",         qty: 1, shared: false },
        { key: "🥤 Coca-Cola (2L)",             cat: "🥤 Drinks",         qty: 1, shared: false },
        { key: "🧴 Washing Up Liquid (500ml)",  cat: "🏠 Household",      qty: 1, shared: true  },
        { key: "🧼 Shower Gel (250ml)",         cat: "🏠 Household",      qty: 1, shared: false },
        { key: "🪥 Toothpaste (75ml)",          cat: "🏠 Household",      qty: 1, shared: false },
        { key: "🫧 Laundry Liquid (1L)",        cat: "🏠 Household",      qty: 1, shared: true  },
    ]
};

var gpLastTotal = 0;
var gpLastItems = [];

function toggleGroceryPlanner() {
    var panel = document.getElementById("grocery-planner-panel");
    var isOpen = panel.style.display !== "none";
    panel.style.display = isOpen ? "none" : "block";
    if (!isOpen) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

function getCheapestStore(prices) {
    var best = null, bestPrice = Infinity;
    Object.keys(prices).forEach(function(store) {
        if (prices[store] < bestPrice) {
            bestPrice = prices[store];
            best = store;
        }
    });
    return { store: best, price: bestPrice };
}

function getStorePrice(pd, preferredStore) {
    if (preferredStore === "cheapest") return getCheapestStore(pd.prices);
    var price = pd.prices[preferredStore];
    if (price === undefined) return getCheapestStore(pd.prices);
    return { store: preferredStore, price: price };
}

function generateGroceryList() {
    var budget         = parseFloat(document.getElementById("gpBudget").value) || 40;
    var people         = Math.max(1, parseInt(document.getElementById("gpPeople").value) || 1);
    var preferredStore = document.getElementById("gpStore").value;
    var btn            = document.getElementById("gpGenBtn");
    btn.textContent = "⏳ Building...";
    btn.disabled = true;

    setTimeout(function() {
        // Build a flat candidate list from all items in PRICE_DATA
        // Each item gets a priority score — lower = more essential
        var candidates = [];
        var seen = {};
        // Use GP_TIERS to get category tags, deduplicated
        ["budget", "balanced", "variety"].forEach(function(tier) {
            GP_TIERS[tier].forEach(function(item) {
                if (!seen[item.key] && PRICE_DATA[item.key]) {
                    seen[item.key] = true;
                    candidates.push({
                        key:    item.key,
                        cat:    item.cat,
                        qty:    item.qty,
                        shared: item.shared,
                        priority: GP_PRIORITY[item.key] || 5
                    });
                }
            });
        });

        // Sort by priority (most essential first), then by cheapest price (best value)
        candidates.sort(function(a, b) {
            if (a.priority !== b.priority) return a.priority - b.priority;
            var aPrice = getStorePrice(PRICE_DATA[a.key], preferredStore).price;
            var bPrice = getStorePrice(PRICE_DATA[b.key], preferredStore).price;
            return aPrice - bPrice;
        });

        // Greedily fill budget: keep adding items until budget is used up
        var items      = [];
        var running    = 0;
        var tescoCost  = 0;

        candidates.forEach(function(item) {
            var pd        = PRICE_DATA[item.key];
            var best      = getStorePrice(pd, preferredStore);
            var scaledQty = item.shared ? Math.max(1, Math.ceil(people / 2)) : item.qty * people;
            var lineTotal = parseFloat((best.price * scaledQty).toFixed(2));

            if (running + lineTotal <= budget) {
                items.push({
                    key:   item.key,
                    cat:   item.cat,
                    store: best.store,
                    price: best.price,
                    qty:   scaledQty,
                    total: lineTotal
                });
                running = parseFloat((running + lineTotal).toFixed(2));
                var tescoPrice = pd.prices["Tesco"] || best.price;
                tescoCost = parseFloat((tescoCost + tescoPrice * scaledQty).toFixed(2));
            }
        });

        var grandTotal = parseFloat(items.reduce(function(s, i) { return s + i.total; }, 0).toFixed(2));
        var savings    = parseFloat((tescoCost - grandTotal).toFixed(2));
        gpLastTotal    = grandTotal;
        gpLastItems    = items;

        renderGroceryList(items, grandTotal, budget, people, preferredStore, savings);
        btn.textContent = "🤖 Generate List";
        btn.disabled = false;
    }, 300);
}

function renderGroceryList(items, total, budget, people, preferredStore, savings) {
    document.getElementById("gpTotal").textContent = "£" + total.toFixed(2);
    gpLastTotal = total;

    // Budget status
    var statusEl = document.getElementById("gpBudgetStatus");
    if (total <= budget) {
        var leftover = (budget - total).toFixed(2);
        statusEl.innerHTML = "<span class='gp-status-ok'>✅ Within budget — £" + leftover + " to spare</span>";
    } else {
        var over = (total - budget).toFixed(2);
        statusEl.innerHTML = "<span class='gp-status-over'>⚠️ £" + over + " over budget</span>";
    }

    // Savings badge vs Tesco
    var savingsEl = document.getElementById("gpSavingsBadge");
    if (savings > 0 && preferredStore !== "Tesco") {
        savingsEl.style.display = "inline-flex";
        savingsEl.innerHTML = "🏷️ You save <b>&nbsp;£" + savings.toFixed(2) + "&nbsp;</b> vs Tesco";
    } else {
        savingsEl.style.display = "none";
    }

    // AI tip — budget-aware + store-aware
    var budgetTips = {
        tight:   "On a tight budget? Oats, rice, pasta, tinned veg and eggs give the most meals per pound.",
        low:     "Cooking from scratch with basics like pasta, rice and tinned tomatoes costs under £1 per meal.",
        mid:     "Buy fruit & veg loose where possible — it's cheaper than pre-packed.",
        good:    "Check the yellow-sticker reduced section near closing time for extra savings."
    };
    var storeTips = {
        Lidl:          "Lidl restocks fresh fruit & veg on Tuesday and Friday mornings.",
        Aldi:          "Aldi's Specialbuys aisle changes weekly — check it for seasonal deals.",
        Asda:          "Asda Rollback deals rotate — check the app before you shop.",
        Tesco:         "Activate your Clubcard Prices in the app before going — saves significantly.",
        "Co-op":       "Co-op members earn 2p per £1 spent back as rewards.",
        "Sainsbury's": "Activate Nectar Prices in the Sainsbury's app before you shop.",
        cheapest:      "Shopping across stores? Do Lidl or Aldi first, then top up at Asda for branded items."
    };
    var budgetLevel = budget <= 15 ? "tight" : budget <= 25 ? "low" : budget <= 40 ? "mid" : "good";
    var chosenTip   = storeTips[preferredStore] || budgetTips[budgetLevel];
    document.getElementById("gpAITip").innerHTML = "💡 <b>AI Tip:</b> " + chosenTip;

    // Group items by category
    var cats = {};
    items.forEach(function(item) {
        if (!cats[item.cat]) cats[item.cat] = [];
        cats[item.cat].push(item);
    });

    var checklistHTML = "";
    var catOrder = ["🥛 Staples", "🥦 Fruit & Veg", "🍗 Protein", "🍪 Snacks", "🥤 Drinks", "🏠 Household"];
    catOrder.forEach(function(cat) {
        if (!cats[cat]) return;
        checklistHTML += "<div class='gp-category'>";
        checklistHTML += "<h4 class='gp-cat-title'>" + cat + "</h4>";
        cats[cat].forEach(function(item) {
            var qtyLabel = item.qty > 1 ? " &times;" + item.qty : "";
            checklistHTML += "<div class='gp-check-row'>" +
                "<span class='gp-item-name'>" + item.key + qtyLabel + "</span>" +
                "<span class='gp-store-badge'>" + item.store + "</span>" +
                "<span class='gp-item-price'>£" + item.total.toFixed(2) + "</span>" +
                "</div>";
        });
        checklistHTML += "</div>";
    });
    document.getElementById("gpChecklist").innerHTML = checklistHTML;

    // Store summary — how much to spend at each store
    var storeTotals = {};
    items.forEach(function(item) {
        storeTotals[item.store] = parseFloat(((storeTotals[item.store] || 0) + item.total).toFixed(2));
    });
    var storeEntries = Object.keys(storeTotals).sort(function(a, b) { return storeTotals[b] - storeTotals[a]; });
    var storeHTML = "<h4 class='gp-store-title'>🏪 Store Breakdown</h4><div class='gp-store-pills'>";
    storeEntries.forEach(function(store) {
        storeHTML += "<div class='gp-store-pill'><b>" + store + "</b><span>£" + storeTotals[store].toFixed(2) + "</span></div>";
    });
    storeHTML += "</div>";
    document.getElementById("gpStoreSummary").innerHTML = storeHTML;

    document.getElementById("grocery-list-results").style.display = "block";
    document.getElementById("grocery-list-results").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function saveGroceryList() {
    if (typeof window.jspdf === "undefined") {
        alert("PDF library not loaded yet — please wait a moment and try again.");
        return;
    }
    if (!gpLastItems || gpLastItems.length === 0) {
        alert("Please generate a list first.");
        return;
    }

    var jsPDF  = window.jspdf.jsPDF;
    var doc    = new jsPDF({ unit: "mm", format: "a4" });

    var budget  = parseFloat(document.getElementById("gpBudget").value) || 40;
    var people  = parseInt(document.getElementById("gpPeople").value) || 1;
    var storeEl = document.getElementById("gpStore");
    var store   = storeEl.options[storeEl.selectedIndex].text.replace(/[^\x00-\x7F]/g, "").trim();
    var total   = gpLastTotal.toFixed(2);
    var today   = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    var pageW   = doc.internal.pageSize.getWidth();
    var margin  = 14;
    var colW    = pageW - margin * 2;
    var y       = margin;

    // ── Header ──
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(margin, y, colW, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(15);
    doc.setFont("helvetica", "bold");
    doc.text("AI Weekly Grocery List", margin + 5, y + 9);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(today, margin + 5, y + 16);
    y += 27;

    // ── Summary strip ──
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, y, colW, 11, 2, 2, "F");
    doc.setTextColor(21, 128, 61);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.text(
        "Store: " + store + "   |   People: " + people +
        "   |   Budget: GBP " + budget.toFixed(2) +
        "   |   Total: GBP " + total,
        margin + 4, y + 7
    );
    y += 16;

    // ── Group items by category ──
    var catOrder = ["🥛 Staples", "🥦 Fruit & Veg", "🍗 Protein", "🍪 Snacks", "🥤 Drinks", "🏠 Household"];
    var cats = {};
    gpLastItems.forEach(function(item) {
        if (!cats[item.cat]) cats[item.cat] = [];
        cats[item.cat].push(item);
    });

    var catPalette = {
        "Staples":   [219, 234, 254],
        "Fruit":     [220, 252, 231],
        "Protein":   [254, 226, 226],
        "Snacks":    [254, 243, 199],
        "Drinks":    [237, 233, 254],
        "Household": [241, 245, 249]
    };
    function pickColor(cat) {
        var keys = Object.keys(catPalette);
        for (var i = 0; i < keys.length; i++) {
            if (cat.toLowerCase().indexOf(keys[i].toLowerCase()) !== -1) return catPalette[keys[i]];
        }
        return [243, 244, 246];
    }

    catOrder.forEach(function(cat) {
        if (!cats[cat] || cats[cat].length === 0) return;
        var rowH = 7;
        if (y + 8 + cats[cat].length * rowH > 275) { doc.addPage(); y = margin; }

        // Category header
        var rgb = pickColor(cat);
        doc.setFillColor(rgb[0], rgb[1], rgb[2]);
        doc.roundedRect(margin, y, colW, 7, 1, 1, "F");
        doc.setTextColor(55, 65, 81);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(cat.replace(/[^\x00-\x7F]/g, "").trim(), margin + 3, y + 5);
        y += 9;

        cats[cat].forEach(function(item, idx) {
            if (y > 275) { doc.addPage(); y = margin; }
            if (idx % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(margin, y, colW, rowH, "F");
            }
            // Item name (strip emoji for PDF font compatibility)
            var name = item.key.replace(/[^\x00-\x7F]/g, "").trim();
            var qty  = item.qty > 1 ? " x" + item.qty : "";
            doc.setTextColor(30, 30, 30);
            doc.setFontSize(8.5);
            doc.setFont("helvetica", "normal");
            doc.text(name + qty, margin + 3, y + 5);
            // Store
            doc.setTextColor(29, 78, 216);
            doc.setFontSize(7.5);
            doc.text(item.store, margin + colW * 0.65, y + 5);
            // Price
            doc.setTextColor(30, 30, 30);
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8.5);
            doc.text("GBP " + item.total.toFixed(2), margin + colW - 1, y + 5, { align: "right" });
            y += rowH;
        });
        y += 4;
    });

    // ── Total footer ──
    if (y > 265) { doc.addPage(); y = margin; }
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(margin, y, colW, 10, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Estimated Total: GBP " + total, margin + 4, y + 7);
    y += 15;

    doc.setTextColor(160, 160, 160);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text("Generated by AI Grocery Planner - Finance Tracker", margin, y);

    doc.save("grocery-list-" + new Date().toISOString().slice(0, 10) + ".pdf");
}

function logGroceryExpense() {
    var url = "expense.html?category=Food&note=" + encodeURIComponent("Weekly Groceries") + "&amount=" + gpLastTotal.toFixed(2);
    window.location.href = url;
}

// ── INIT ──
function init() {
    const sortGroceries   = document.getElementById("sortGroceries");
    const sortRestaurants = document.getElementById("sortRestaurants");
    const sortShopping    = document.getElementById("sortShopping");
    const sortTransport   = document.getElementById("sortTransport");
    const sortBills       = document.getElementById("sortBills");
    const searchBar       = document.getElementById("costSearch");

    const renderAll = () => {
        renderList("groceriesList",   sortList(groceries,    sortGroceries.value),   "Food");
        renderCompareItems();
        renderList("restaurantsList", sortList(restaurants,  sortRestaurants.value), "Food");
        renderList("shoppingList",    sortList(shopping,     sortShopping.value),    "Shopping");
        renderList("transportList",   sortList(transport,    sortTransport.value),   "Transport");
        renderList("billsList",       sortList(bills,        sortBills.value),       "Other");
    };

    sortGroceries.addEventListener("change", renderAll);
    sortRestaurants.addEventListener("change", renderAll);
    sortShopping.addEventListener("change", renderAll);
    sortTransport.addEventListener("change", renderAll);
    sortBills.addEventListener("change", renderAll);

    searchBar.addEventListener("input", e => {
        searchQuery = e.target.value.trim();
        renderAll();
    });

    renderAll();
    loadAIInsight();
}

init();
