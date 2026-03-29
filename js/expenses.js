console.log("expenses.js loaded");

const user = JSON.parse(localStorage.getItem("user"));

const userNameEl = document.getElementById("userName");
if (userNameEl && user) userNameEl.textContent = user.name || "User";

async function loadExpenses() {
    try {
        const response = await fetch(`http://127.0.0.1:5000/expenses/${user.id}`);
        const data = await response.json();

        const tableBody = document.getElementById("expense-table-body");
        tableBody.innerHTML = "";

        let categoryTotals = {};

        // ---- FIXED: Loop through data.expenses ---- //
        data.expenses.forEach(exp => {
            const amount = Number(exp.amount); // FIXED: convert to number

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${exp.date}</td>
                <td>${exp.category}</td>
                <td>£${amount.toFixed(2)}</td>
                <td>${exp.note || "-"}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editExpense(${exp.id})">Edit</button>
                    <button class="action-btn delete-btn" onclick="deleteExpense(${exp.id})">Delete</button>
                </td>
            `;
            tableBody.appendChild(tr);

            // ---- FIXED: Accumulate category totals ---- //
            if (!categoryTotals[exp.category]) categoryTotals[exp.category] = 0;
            categoryTotals[exp.category] += amount;
        });

        loadPieChart(categoryTotals);

    } catch (err) {
        console.error("LOAD EXPENSE ERROR:", err);
    }
}


// ---------------------------------------------------
// PIE CHART
// ---------------------------------------------------
function loadPieChart(categories) {
    const pieColors = {
        "Food": "#34c759",
        "Transport": "#0a84ff",
        "Accommodation": "#ff9f0a",
        "Tuition Fee": "#af52de",
        "Shopping": "#ff375f",
        "Trip": "#5e5ce6",
        "Other": "#8e8e93"
    };

    let labels = Object.keys(categories);
    let values = Object.values(categories);
    let colors = labels.map(cat => pieColors[cat] || "#aaa");

    if (window.expensePieChart) window.expensePieChart.destroy();

    const ctx = document.getElementById("expensePie");

    window.expensePieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels,
            datasets: [{
                data: values,
                backgroundColor: colors
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}


// ---------------------------------------------------
// DELETE EXPENSE
// ---------------------------------------------------
async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;

    await fetch(`http://127.0.0.1:5000/delete_expense/${id}`, {
        method: "DELETE"
    });

    loadExpenses();
}


// ---------------------------------------------------
// EDIT EXPENSE
// ---------------------------------------------------
async function editExpense(id) {

    // Get expense from backend
    const response = await fetch(`http://127.0.0.1:5000/expense/${id}`);
    const expense = await response.json();

    if (!response.ok) {
        alert(expense.error || "Cannot load expense");
        return;
    }

    // Ask user new values
    const newCategory = prompt("Edit category:", expense.category);
    if (!newCategory) return;

    const newAmount = prompt("Edit amount:", expense.amount);
    if (!newAmount) return;

    const currentDate = (expense.date || "").toString().slice(0, 10); // works for "YYYY-MM-DD" and "YYYY-MM-DDTHH..."
    const newDate = prompt("Edit date (YYYY-MM-DD):", currentDate);
    if (!newDate) return;

    const newNote = prompt("Edit note:", expense.note || "");

    // Send update to backend
    const updateResponse = await fetch(
        `http://127.0.0.1:5000/update_expense/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                category: newCategory,
                amount: newAmount,
                date: newDate,
                note: newNote
            })
        }
    );

    const result = await updateResponse.json();

    if (!updateResponse.ok) {
        alert(result.error || "Update failed");
        return;
    }

    alert("Expense updated!");

    // Reload everything
    loadExpenses();
}



// ---------------------------------------------------
// INITIAL LOAD
// ---------------------------------------------------
loadExpenses();