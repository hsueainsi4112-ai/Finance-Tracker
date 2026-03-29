// -------------------------------
// VERIFY USER LOGIN
// -------------------------------
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
    alert("Please log in first!");
    window.location.href = "login.html";
}

// Put user name
document.getElementById("userName").textContent = user.name;
document.getElementById("greetName").textContent = user.name;

// Month label
const _months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const _now = new Date();
const greetMonthEl = document.getElementById("greetMonth");
if (greetMonthEl) greetMonthEl.textContent = _months[_now.getMonth()] + " " + _now.getFullYear();


// -------------------------------
// LOAD REAL DASHBOARD SUMMARY
// -------------------------------
async function loadDashboard() {
    try {
        const response = await fetch(`http://127.0.0.1:5000/summary/${user.id}`);
        const data = await response.json();

        const income = Number(data.total_income || 0);
        const expense = Number(data.total_expense || 0);
        const balance = Number(data.balance || 0);
        const remaining = Number(data.budget_remaining || 0);
        const budgetPercent = Number(data.budget_used_percentage || 0);
        const budgetTotal = Number(data.budget_total || 0);

        document.getElementById("income-amount").textContent = income.toFixed(2);
        document.getElementById("expense-amount").textContent = expense.toFixed(2);
        document.getElementById("balance-amount").textContent = balance.toFixed(2);
        document.getElementById("budget-total").textContent = budgetTotal.toFixed(2);
        document.getElementById("budget-used").textContent =
            `${budgetPercent.toFixed(0)}%`;
        document.querySelector(".progress-fill").style.width =
            `${budgetPercent}%`;

        document.getElementById("budget-remaining").textContent =
            `£${remaining.toFixed(2)}`;

        // Recent transactions
        const list = document.getElementById("transaction-list");
        list.innerHTML = "";

        data.transactions.forEach(tx => {
            const li = document.createElement("li");
            li.className = "transaction-item";

            li.innerHTML = `
                <div class="tx-left">
                    <span class="tx-category">${catIcons[tx.category] || "💳"} ${tx.category}</span>
                    <span class="tx-date">${tx.date}</span>
                </div>
                <span class="tx-amount ${tx.amount < 0 ? "expense" : "income"}">
                    ${(tx.amount < 0 ? "-£" : "+£")}${Math.abs(tx.amount).toFixed(2)}
                </span>
            `;

            list.appendChild(li);
        });

    } catch (err) {
        console.error("Dashboard Load Error:", err);
        alert("Error loading dashboard data");
    }
}

loadDashboard();


// -------------------------------
// CATEGORY ICONS
// -------------------------------
const catIcons = {
    "Food": "🍔", "Transport": "🚌", "Shopping": "🛍️",
    "Entertainment": "🎬", "Rent": "🏠", "Bills": "💡",
    "Healthcare": "🏥", "Education": "📚", "Trip": "✈️",
    "Salary": "💰", "Part-time": "💼", "Freelance": "💻",
    "Scholarship": "🎓", "Family Support": "👨‍👩‍👧", "Gift": "🎁",
    "Other": "💳"
};


// -------------------------------
// DASHBOARD INSIGHTS (AI tip, savings, donut)
// -------------------------------
let categoryData = {};

async function loadInsights() {
    try {
        const res = await fetch(`http://127.0.0.1:5000/dashboard_insights/${user.id}`);
        const d = await res.json();

        // Savings rate
        const rate = d.savings_rate || 0;
        const rateEl = document.getElementById("savings-rate");
        const labelEl = document.getElementById("savings-label");
        rateEl.textContent = `${rate}%`;
        rateEl.style.color = rate >= 20 ? "#16a34a" : rate >= 10 ? "#d97706" : "#dc2626";
        if (labelEl) labelEl.textContent = rate >= 20 ? "Great saving rate! 🎉" : rate >= 0 ? "of income saved this month" : "Spending exceeds income ⚠️";

        // Top category
        if (d.top_category) {
            document.getElementById("top-cat-name").textContent =
                `${catIcons[d.top_category] || "💳"} ${d.top_category}`;
            document.getElementById("top-cat-amount").textContent = d.top_amount.toFixed(2);
            document.getElementById("top-spend-card").style.display = "block";
        }

        // AI tip
        if (d.ai_tip) {
            document.getElementById("ai-tip-text").textContent = d.ai_tip;
            document.getElementById("ai-tip-panel").style.display = "flex";
        }

        // Store for donut chart
        categoryData = d.category_breakdown || {};

    } catch (err) {
        console.error("Insights error:", err);
    }
}

loadInsights();


// -------------------------------
// SPENDING FLOW CHART
// -------------------------------
let chart;
let donutChart;
let activeChartView = "flow";
const ctx = document.getElementById("spendingChart").getContext("2d");

async function loadChart() {
    const period = document.getElementById("flowRangeSelect").value;

    const response = await fetch(
        `http://127.0.0.1:5000/spending_flow/${user.id}?range=${period}`
    );
    const data = await response.json();

    // Destroy old chart
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: period === "yearly" ? "bar" : "line",
        data: {
            labels: data.labels,
            datasets: [{
                    label: "Income (£)",
                    data: data.income,
                    borderColor: "#3BB143",
                    backgroundColor: "rgba(59,177,67,0.3)",
                    borderWidth: 3,
                    tension: 0.4,
                    spanGaps: true
                },
                {
                    label: "Expenses (£)",
                    data: data.expense,
                    borderColor: "#D0312D",
                    backgroundColor: "rgba(208,49,45,0.3)",
                    borderWidth: 3,
                    tension: 0.4,
                    spanGaps: true
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: document.documentElement.dataset.theme === "dark" ? "#94a3b8" : "#6b7280" },
                    grid:  { color: document.documentElement.dataset.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }
                },
                x: {
                    ticks: { color: document.documentElement.dataset.theme === "dark" ? "#94a3b8" : "#6b7280" },
                    grid:  { color: document.documentElement.dataset.theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    labels: { color: document.documentElement.dataset.theme === "dark" ? "#f1f5f9" : "#111827" }
                }
            }
        }
    });
}
document.getElementById("txFilter").addEventListener("change", async function() {

    const filter = this.value; // this_month or last_month
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1–12
    const currentYear = now.getFullYear();

    let monthToFetch = currentMonth;
    let yearToFetch = currentYear;

    if (filter === "last_month") {
        monthToFetch -= 1;
        if (monthToFetch === 0) {
            monthToFetch = 12;
            yearToFetch -= 1;
        }
    }

    const response = await fetch(
        `http://127.0.0.1:5000/transactions/${user.id}?month=${monthToFetch}&year=${yearToFetch}`
    );
    const result = await response.json();

    const list = document.getElementById("transaction-list");
    list.innerHTML = "";

    result.forEach(tx => {
        const li = document.createElement("li");
        li.className = "transaction-item";

        li.innerHTML = `
            <div class="tx-left">
                <span class="tx-category">${catIcons[tx.category] || "💳"} ${tx.category}</span>
                <span class="tx-date">${tx.date}</span>
            </div>
            <span class="tx-amount ${tx.amount < 0 ? 'expense' : 'income'}">
                ${(tx.amount < 0 ? "-£" : "+£")}${Math.abs(tx.amount).toFixed(2)}
            </span>
        `;

        list.appendChild(li);
    });
});

loadChart();

// Reload chart on dropdown change
document.getElementById("flowRangeSelect").addEventListener("change", loadChart);


// -------------------------------
// CHART TOGGLE
// -------------------------------
function switchChart(view) {
    activeChartView = view;
    const flowCanvas  = document.getElementById("spendingChart");
    const donutCanvas = document.getElementById("categoryChart");
    const rangeSelect = document.getElementById("flowRangeSelect");
    const title       = document.getElementById("chartTitle");

    document.getElementById("btnFlow").classList.toggle("active",  view === "flow");
    document.getElementById("btnDonut").classList.toggle("active", view === "donut");

    if (view === "flow") {
        flowCanvas.style.display  = "block";
        donutCanvas.style.display = "none";
        rangeSelect.style.display = "block";
        title.textContent = "Spending Flow";
    } else {
        flowCanvas.style.display  = "none";
        donutCanvas.style.display = "block";
        rangeSelect.style.display = "none";
        title.textContent = "Spending by Category";
        buildDonut();
    }
}

function buildDonut() {
    if (donutChart) donutChart.destroy();
    const labels = Object.keys(categoryData);
    const values = Object.values(categoryData);
    if (!labels.length) return;

    const colors = [
        "#7b2eff","#3b82f6","#10b981","#f59e0b","#ef4444",
        "#8b5cf6","#06b6d4","#f97316","#84cc16","#ec4899"
    ];

    const ctx2 = document.getElementById("categoryChart").getContext("2d");
    donutChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: labels.map(l => `${catIcons[l] || "💳"} ${l}`),
            datasets: [{
                data: values,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: "bottom", labels: { font: { size: 12 }, padding: 14 } },
                tooltip: {
                    callbacks: {
                        label: c => ` £${Number(c.raw).toFixed(2)} (${(c.raw / values.reduce((a,b)=>a+b,0)*100).toFixed(1)}%)`
                    }
                }
            }
        }
    });
}