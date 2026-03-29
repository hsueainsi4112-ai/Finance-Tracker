// Price Comparison Page

const user = JSON.parse(localStorage.getItem("user"));
if (!user) { window.location.href = "login.html"; }

const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name || "User";

const STORE_BRAND = {
    "Lidl":        { border: "#ffd100", bg: "#fffbea", emoji: "🟡" },
    "Aldi":        { border: "#e32c1e", bg: "#fff5f5", emoji: "🔴" },
    "Asda":        { border: "#78be20", bg: "#f4fbea", emoji: "🟢" },
    "Tesco":       { border: "#005EB8", bg: "#eef4fc", emoji: "🔵" },
    "Co-op":       { border: "#00B1A9", bg: "#eafafa", emoji: "🩵" },
    "Sainsbury's": { border: "#FF8200", bg: "#fff5eb", emoji: "🟠" },
    "M&S":         { border: "#006732", bg: "#eef8f1", emoji: "🟤" },
    "Waitrose":    { border: "#007F4E", bg: "#eef8f4", emoji: "🪴" },
};

// Read item from URL
const params   = new URLSearchParams(window.location.search);
const itemName = decodeURIComponent(params.get("item") || "");
const data     = PRICE_DATA[itemName];

const root = document.getElementById("pc-root");

if (!data) {
    // Not found
    root.innerHTML = `
        <div class="pc-not-found">
            <span class="nf-icon">🔍</span>
            <h2>Item not found</h2>
            <p>We don't have price data for "<b>${itemName}</b>"</p>
            <a href="costguide.html" class="back-btn" style="margin-top:16px;">← Go back</a>
        </div>`;
} else {
    // Set page header
    document.title = itemName + " — Price Comparison";
    document.getElementById("pc-item-name").textContent = itemName;
    document.getElementById("pc-item-unit").textContent = data.unit;
    document.getElementById("logExpBtn").onclick = function () {
        const clean = itemName.replace(/[^\w\s£&\-'.()]/g, "").trim();
        window.location.href = "expense.html?category=Food&note=" + encodeURIComponent(clean);
    };

    // Compute values
    const entries  = Object.entries(data.prices);         // [[shop, price], ...]
    const prices   = entries.map(function (e) { return e[1]; });
    const minPrice = Math.min.apply(null, prices);
    const maxPrice = Math.max.apply(null, prices);
    const saving   = (maxPrice - minPrice).toFixed(2);
    const cheapest = entries.filter(function (e) { return e[1] === minPrice; }).map(function (e) { return e[0]; });
    const priciest = entries.filter(function (e) { return e[1] === maxPrice; }).map(function (e) { return e[0]; });

    // Sort by price asc
    const sorted = entries.slice().sort(function (a, b) { return a[1] - b[1]; });

    // ── 1. BEST BUY BANNER ──
    var bestBuyHTML = '<div class="pc-best-buy">' +
        '<span class="best-buy-icon">🏆</span>' +
        '<div><strong>Best buy: ' + cheapest.join(" &amp; ") + '</strong> at <strong>£' + minPrice.toFixed(2) + '</strong>' +
        ' — saves you <strong>£' + saving + '</strong> vs the most expensive option</div>' +
        '</div>';

    // ── 2. STORE CARDS ──
    var cardsHTML = '<div class="store-cards">';
    for (var i = 0; i < sorted.length; i++) {
        var shop  = sorted[i][0];
        var price = sorted[i][1];
        var diff  = price - minPrice;
        var brand = STORE_BRAND[shop] || { border: "#7b2eff", bg: "#faf5ff", emoji: "🏪" };
        var isBest  = diff === 0;
        var isWorst = price === maxPrice;
        var badgeText = isBest ? "✅ Best Price" : "+" + diff.toFixed(2) + " more";
        var badgeCls  = isBest ? "card-badge-best" : isWorst ? "card-badge-worst" : "card-badge-mid";
        var cardCls   = isBest ? "store-card store-card-best" : "store-card";
        cardsHTML +=
            '<div class="' + cardCls + '" style="border-color:' + brand.border + '; background:' + brand.bg + ';">' +
            '<div class="store-card-emoji">' + brand.emoji + '</div>' +
            '<div class="store-card-name">' + shop + '</div>' +
            '<div class="store-card-price">£' + price.toFixed(2) + '</div>' +
            '<div class="store-card-badge ' + badgeCls + '">' + badgeText + '</div>' +
            '</div>';
    }
    cardsHTML += '</div>';

    // ── 3. CHART PLACEHOLDER ──
    var chartHTML = '<div class="pc-card pc-chart-full">' +
        '<h3>Price by Supermarket</h3>' +
        '<div class="pc-chart-wrap"><canvas id="pcChart"></canvas></div>' +
        '</div>';

    // ── 4. AI TIP ──
    var perWeek = (parseFloat(saving) * 2).toFixed(2);
    var perYear = (parseFloat(saving) * 104).toFixed(2);
    var tipHTML = '<div class="pc-ai-tip">' +
        '<div class="pc-ai-tip-icon">🤖</div>' +
        '<div><strong>AI Savings Insight</strong><br>' +
        'Shopping at <strong>' + cheapest[0] + '</strong> instead of <strong>' + priciest[0] + '</strong> ' +
        'saves <strong>£' + saving + '</strong> per purchase. Buy it twice a week and that\'s ' +
        '<strong>£' + perWeek + '/week</strong> and <strong>£' + perYear + '/year</strong> saved — just by switching supermarket! 💡' +
        '</div></div>';

    // ── 5. BROWSE CHIPS ──
    var chips = Object.keys(PRICE_DATA).filter(function (k) { return k !== itemName; }).map(function (k) {
        return '<a href="pricecompare.html?item=' + encodeURIComponent(k) + '" class="browse-chip">' + k + '</a>';
    }).join("");
    var browseHTML = '<div class="pc-browse"><h3>Compare other items</h3><div class="pc-browse-chips">' + chips + '</div></div>';

    // ── INJECT ALL AT ONCE ──
    root.innerHTML = bestBuyHTML + cardsHTML + chartHTML + tipHTML + browseHTML;

    // ── BUILD CHART (after DOM is in place) ──
    var shops2  = sorted.map(function (e) { return e[0]; });
    var prices2 = sorted.map(function (e) { return e[1]; });
    var colors  = prices2.map(function (p) {
        return p === minPrice ? "rgba(22,163,74,0.85)" : p === maxPrice ? "rgba(220,38,38,0.80)" : "rgba(123,46,255,0.55)";
    });
    var borders = prices2.map(function (p) {
        return p === minPrice ? "#16a34a" : p === maxPrice ? "#dc2626" : "#7b2eff";
    });

    var ctx = document.getElementById("pcChart");
    if (ctx && typeof Chart !== "undefined") {
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: shops2,
                datasets: [{ label: "Price (£)", data: prices2, backgroundColor: colors, borderColor: borders, borderWidth: 2, borderRadius: 8 }]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { callbacks: { label: function (c) { return " £" + Number(c.raw).toFixed(2); } } }
                },
                scales: {
                    x: { beginAtZero: true, ticks: { callback: function (v) { return "£" + v; } }, grid: { color: "rgba(0,0,0,0.04)" } },
                    y: { grid: { display: false } }
                }
            }
        });
    }
}
