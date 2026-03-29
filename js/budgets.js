console.log("budgets.js loaded");

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Please log in first!");
    window.location.href = "login.html";
}

// put user name in sidebar
const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name;

// ------------------ MONTH NAVIGATION ------------------
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];

let currentMonth = new Date().getMonth() + 1;  // 1-12
let currentYear  = new Date().getFullYear();

function updateMonthLabel() {
    document.getElementById("month-label").textContent =
        `${MONTHS[currentMonth - 1]} ${currentYear}`;
    const heading = document.getElementById("table-heading");
    if (heading) heading.textContent =
        `Budget Overview — ${MONTHS[currentMonth - 1]} ${currentYear}`;
}

function changeMonth(delta) {
    currentMonth += delta;
    if (currentMonth > 12) { currentMonth = 1;  currentYear++; }
    if (currentMonth < 1)  { currentMonth = 12; currentYear--; }
    updateMonthLabel();
    loadBudgets();
}

updateMonthLabel();

// ------------------ LOAD BUDGETS ------------------
async function loadBudgets() {
    try {

        const resp = await fetch(`http://127.0.0.1:5000/budgets/${user.id}?month=${currentMonth}&year=${currentYear}`);
        const data = await resp.json();

        const tbody = document.getElementById("budget-table-body");
        tbody.innerHTML = "";

        data.forEach(b => {
            const tr = document.createElement("tr");

            const statusText  = getStatusText(b.spent, b.limit_amount);
            const statusClass = getStatusClass(b.spent, b.limit_amount);
            const pct         = b.limit_amount > 0 ? (b.spent / b.limit_amount) * 100 : 0;
            const barClass    = pct > 100 ? "danger" : pct >= 80 ? "warn" : "ok";
            const barWidth    = Math.min(pct, 100).toFixed(1);
            const remainClass = b.remaining < 0 ? "status-danger" : "";

            tr.innerHTML = `
                <td>${b.category}</td>
                <td>£${b.limit_amount.toFixed(2)}</td>
                <td>£${b.spent.toFixed(2)}</td>
                <td class="${remainClass}">£${b.remaining.toFixed(2)}</td>
                <td>
                    <div class="progress-wrap">
                        <div class="progress-track">
                            <div class="progress-fill ${barClass}" style="width:${barWidth}%"></div>
                        </div>
                        <span class="progress-pct ${barClass}">${pct.toFixed(0)}%</span>
                    </div>
                </td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="action-btn delete-btn" onclick="deleteBudget(${b.id})">
                        Delete
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        const totalBudget = data.reduce((sum, b) => sum + Number(b.limit_amount || 0), 0);
        const totalSpent = data.reduce((sum, b) => sum + Number(b.spent || 0), 0);
        const totalRemain = data.reduce((sum, b) => sum + Number(b.remaining || 0), 0);

        const totalBudgetEl = document.getElementById("total-budget");
        const totalSpentEl = document.getElementById("total-spent");
        const totalRemainEl = document.getElementById("total-remaining");

        if (totalBudgetEl) totalBudgetEl.textContent = totalBudget.toFixed(2);
        if (totalSpentEl) totalSpentEl.textContent = totalSpent.toFixed(2);
        if (totalRemainEl) totalRemainEl.textContent = totalRemain.toFixed(2);
        buildBudgetBar(data);

    } catch (err) {
        console.error("LOAD BUDGETS ERROR:", err);
    }
}

function getStatusText(spent, limit) {
    spent = Number(spent || 0);
    limit = Number(limit || 0);

    if (limit <= 0) return "No limit";

    const percent = (spent / limit) * 100;

    if (spent > limit) return `Overspent (${percent.toFixed(0)}%)`;
    if (spent === limit) return `OK (100%)`;
    if (percent >= 80) return `Near limit (${percent.toFixed(0)}%)`;
    return `OK (${percent.toFixed(0)}%)`;
}

function getStatusClass(spent, limit) {
    spent = Number(spent || 0);
    limit = Number(limit || 0);

    if (limit <= 0) return "status-ok";

    const percent = (spent / limit) * 100;

    if (spent > limit) return "status-danger"; // red
    if (percent >= 80) return "status-warn"; // orange
    return "status-ok"; // green
}


// ------------------ ADD BUDGET ------------------
async function addBudget(event) {
    event.preventDefault();

    const category = document.getElementById("budgetCategory").value;
    const amount = document.getElementById("budgetAmount").value;

    if (!category || !amount) {
        alert("Please choose category and amount");
        return;
    }

    const resp = await fetch("http://127.0.0.1:5000/add_budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.id,
            category: category,
            limit_amount: amount
        })
    });

    const result = await resp.json();
    if (result.message) {
        alert("Budget saved!");
        loadBudgets();
    } else {
        alert(result.error || "Error saving budget");
    }
}

// ------------------ DELETE BUDGET ------------------
async function deleteBudget(id) {
    if (!confirm("Delete this budget?")) return;

    await fetch(`http://127.0.0.1:5000/delete_budget/${id}`, {
        method: "DELETE"
    });

    loadBudgets();
}

// initial
loadBudgets();

function buildBudgetBar(budgets) {
    const ctx = document.getElementById("budgetPie");
    if (!ctx) return;

    if (window.budgetBarChart) window.budgetBarChart.destroy();

    const labels  = budgets.map(b => b.category);
    const limits  = budgets.map(b => Number(b.limit_amount || 0));
    const spent   = budgets.map(b => Number(b.spent || 0));

    window.budgetBarChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Budget Limit (£)",
                    data: limits,
                    backgroundColor: "rgba(123, 46, 255, 0.25)",
                    borderColor: "#7b2eff",
                    borderWidth: 2,
                    borderRadius: 6
                },
                {
                    label: "Spent (£)",
                    data: spent,
                    backgroundColor: spent.map((s, i) =>
                        s > limits[i] ? "rgba(220,38,38,0.7)" :
                        s / limits[i] >= 0.8 ? "rgba(217,119,6,0.7)" :
                        "rgba(22,163,74,0.7)"
                    ),
                    borderColor: spent.map((s, i) =>
                        s > limits[i] ? "#dc2626" :
                        s / limits[i] >= 0.8 ? "#d97706" :
                        "#16a34a"
                    ),
                    borderWidth: 2,
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                tooltip: {
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: £${Number(ctx.raw).toFixed(2)}`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: val => `£${val}`
                    }
                }
            }
        }
    });
}

function normalizeCat(cat) {
    return String(cat || "").trim().toLowerCase().replace(/\s+/g, " ");
}

// ================== AI BUDGET RECOMMENDATIONS ==================
let aiRecommendations = [];

async function getAIRecommendations() {
    const btn = document.querySelector(".ai-suggest-btn");
    btn.textContent = "⏳ Analysing your spending...";
    btn.disabled = true;

    try {
        const resp = await fetch(`http://127.0.0.1:5000/ai_budget_recommendations/${user.id}`);
        const data = await resp.json();

        if (data.error) {
            alert("Could not load recommendations. Make sure the server is running.");
            return;
        }

        if (!data.recommendations || data.recommendations.length === 0) {
            alert("Not enough spending history yet. Add some expenses first, then try again!");
            return;
        }

        renderAIPanel(data.recommendations);

    } catch (err) {
        console.error("AI Recommendations error:", err);
        alert("Could not connect to the server. Make sure it is running.");
    } finally {
        btn.textContent = "🤖 AI Suggest Budgets";
        btn.disabled = false;
    }
}

function renderAIPanel(recommendations) {
    const panel = document.getElementById("ai-panel");
    const cards = document.getElementById("ai-cards");

    cards.innerHTML = recommendations.map(r => `
        <div class="ai-card">
            <div class="ai-card-cat">${r.category}</div>
            <div class="ai-card-avg">Avg monthly spend: <b>£${r.avg_monthly.toFixed(2)}</b></div>
            <div class="ai-card-rec">Recommended limit: <span class="rec-amount">£${r.recommended.toFixed(2)}</span></div>
            <button class="ai-apply-one-btn" onclick="applyOneRecommendation('${r.category}', ${r.recommended})">
                Apply
            </button>
        </div>
    `).join("");

    aiRecommendations = recommendations;

    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function applyOneRecommendation(category, amount) {
    const resp = await fetch("http://127.0.0.1:5000/add_budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, category: category, limit_amount: amount })
    });
    const result = await resp.json();
    if (result.message) {
        showToast(`✅ ${category} budget set to £${amount.toFixed(2)}`);
        loadBudgets();
    }
}

async function applyAllRecommendations() {
    if (!aiRecommendations || aiRecommendations.length === 0) return;

    for (const r of aiRecommendations) {
        await fetch("http://127.0.0.1:5000/add_budget", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, category: r.category, limit_amount: r.recommended })
        });
    }

    showToast("✅ All AI budgets applied!");
    loadBudgets();
    closeAIPanel();
}

function closeAIPanel() {
    document.getElementById("ai-panel").style.display = "none";
}

// ================== AI TRIP PLANNER ==================
let lastTripTotal = 0;

function openTripPlanner() {
    const panel = document.getElementById("trip-panel");
    panel.style.display = "block";
    panel.scrollIntoView({ behavior: "smooth", block: "start" });

    // Auto-fill "From" with user's city from localStorage
    const fromInput = document.getElementById("tripFromCity");
    if (fromInput && !fromInput.value) {
        const u = JSON.parse(localStorage.getItem("user") || "null");
        const city = (u && u.city) ? u.city : "Bristol, UK";
        fromInput.value = city;
    }
}

function closeTripPlanner() {
    document.getElementById("trip-panel").style.display = "none";
    document.getElementById("trip-results").style.display = "none";
}

async function generateTripPlan() {
    const destination = document.getElementById("tripDestination").value.trim();
    const from_city   = document.getElementById("tripFromCity").value.trim() || "Bristol, UK";
    const days        = parseInt(document.getElementById("tripDays").value)       || 3;
    const travellers  = parseInt(document.getElementById("tripTravellers").value) || 1;
    const style       = parseInt(document.getElementById("tripStyle").value);

    if (!destination) {
        alert("Please enter a destination.");
        return;
    }

    const btn = document.getElementById("tripGenBtn");
    btn.textContent = "⏳ Planning...";
    btn.disabled = true;

    try {
        const resp = await fetch("http://127.0.0.1:5000/ai_trip_plan", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ destination, from_city, days, travellers, style })
        });
        const data = await resp.json();

        if (data.error) {
            alert("Could not generate plan. Make sure the server is running.");
            return;
        }

        renderTripResults(data);
    } catch (err) {
        console.error("Trip plan error:", err);
        alert("Could not connect to the server.");
    } finally {
        btn.textContent = "🤖 Generate Plan";
        btn.disabled = false;
    }
}

const TRIP_ICONS = {
    "Flights":          "✈️",
    "Accommodation":    "🏨",
    "Food & Drinks":    "🍽️",
    "Activities":       "🎡",
    "Local Transport":  "🚌",
    "Misc / Emergency": "💼",
};

function renderTripResults(data) {
    const fromLabel = data.from_city ? data.from_city + " → " : "";
    document.getElementById("trip-title").textContent  = `${fromLabel}${data.destination}`;
    document.getElementById("trip-meta").textContent   =
        `${data.days} day${data.days > 1 ? "s" : ""} · ${data.travellers} traveller${data.travellers > 1 ? "s" : ""} · ${data.style}`;
    document.getElementById("trip-total").textContent  = `£${data.total.toFixed(2)}`;
    lastTripTotal = data.total;

    // Breakdown rows
    const entries = Object.entries(data.breakdown);
    const maxVal  = Math.max(...entries.map(([, v]) => v));
    document.getElementById("trip-breakdown").innerHTML = entries.map(([label, amount]) => {
        const pct  = maxVal > 0 ? (amount / maxVal * 100).toFixed(1) : 0;
        const icon = TRIP_ICONS[label] || "💰";
        return `
            <div class="trip-breakdown-item">
                <span class="trip-cat-label">${icon} ${label}</span>
                <div class="trip-bar-wrap">
                    <div class="trip-bar-fill" style="width:${pct}%"></div>
                </div>
                <span class="trip-amount">£${amount.toFixed(2)}</span>
            </div>`;
    }).join("");

    buildTripChart(data.breakdown);

    // Tips
    document.getElementById("trip-tips").innerHTML = data.tips.map(t =>
        `<div class="trip-tip-item">💡 ${t}</div>`
    ).join("");

    const results = document.getElementById("trip-results");
    results.style.display = "block";
    results.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

let tripChartInst = null;
function buildTripChart(breakdown) {
    const ctx = document.getElementById("tripChart");
    if (!ctx) return;
    if (tripChartInst) tripChartInst.destroy();

    const labels = Object.keys(breakdown);
    const values = Object.values(breakdown);
    const colors = ["#7b2eff","#a855f7","#16a34a","#2563eb","#d97706","#64748b"];

    tripChartInst = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "rgba(255,255,255,0.15)"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "right", labels: { font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: c => `${c.label}: £${Number(c.raw).toFixed(2)}`
                    }
                }
            }
        }
    });
}

async function saveTripBudget() {
    if (!lastTripTotal) return;
    const resp = await fetch("http://127.0.0.1:5000/add_budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, category: "Trip", limit_amount: lastTripTotal })
    });
    const result = await resp.json();
    if (result.message) {
        showToast(`✅ Trip budget set to £${lastTripTotal.toFixed(2)}`);
        loadBudgets();
        closeTripPlanner();
    }
}

function showToast(msg) {
    let toast = document.getElementById("ai-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "ai-toast";
        toast.className = "ai-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}