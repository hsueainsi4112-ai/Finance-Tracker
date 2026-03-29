console.log("income_page.js loaded");

const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    alert("Please log in first!");
    window.location.href = "login.html";
}

const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name;

async function loadIncome() {
    try {
        const resp = await fetch(`http://127.0.0.1:5000/income/${user.id}`);
        if (!resp.ok) { console.error("Income load error:", resp.status); return; }

        const data = await resp.json();
        const incomes = data.incomes || [];
        const tableBody = document.getElementById("income-table-body");
        tableBody.innerHTML = "";

        let categoryTotals = {};

        incomes.forEach(inc => {
            const amount = Number(inc.amount);
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${inc.date}</td>
                <td>${inc.category}</td>
                <td>£${amount.toFixed(2)}</td>
                <td>${inc.note || "-"}</td>
                <td>
                    <button class="action-btn edit-btn"   onclick="editIncome(${inc.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteIncome(${inc.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);

            if (!categoryTotals[inc.category]) categoryTotals[inc.category] = 0;
            categoryTotals[inc.category] += amount;
        });

        loadIncomePie(categoryTotals);

    } catch (err) {
        console.error("LOAD INCOME ERROR:", err);
    }
}

let incomePieChart;

function loadIncomePie(categories) {
    const pieColors = {
        "Salary": "#7b2eff",
        "Tuition Fee": "#af52de",
        "Family": "#22c55e",
        "Scholarship": "#0a84ff",
        "Part-time Job": "#ff9f0a",
        "Shopping": "#ff375f",
        "Other": "#8e8e93"
    };

    const labels = Object.keys(categories);
    const values = Object.values(categories);
    const colors = labels.map(cat => pieColors[cat] || "#aaa");

    if (incomePieChart) incomePieChart.destroy();

    const ctx = document.getElementById("incomePie");
    incomePieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{ data: values, backgroundColor: colors, borderWidth: 2 }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: "bottom" } }
        }
    });
}

async function deleteIncome(id) {
    if (!confirm("Delete this income record?")) return;
    await fetch(`http://127.0.0.1:5000/delete_income/${id}`, { method: "DELETE" });
    loadIncome();
}

async function editIncome(id) {
    const response = await fetch(`http://127.0.0.1:5000/income_item/${id}`);
    const income = await response.json();

    if (!response.ok) { alert(income.error || "Cannot load income"); return; }

    const newCategory = prompt("Edit category:", income.category);
    if (!newCategory) return;

    const newAmount = prompt("Edit amount:", income.amount);
    if (!newAmount) return;

    const currentDate = (income.date || "").toString().slice(0, 10);
    const newDate = prompt("Edit date (YYYY-MM-DD):", currentDate);
    if (!newDate) return;

    const newNote = prompt("Edit note:", income.note || "");

    const updateResp = await fetch(`http://127.0.0.1:5000/update_income/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory, amount: newAmount, date: newDate, note: newNote })
    });

    const result = await updateResp.json();
    if (updateResp.ok) {
        alert("Income updated!");
        loadIncome();
    } else {
        alert(result.error || "Update failed");
    }
}

loadIncome();
