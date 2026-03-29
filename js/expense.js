// Pre-fill form from URL params (e.g. when coming from Cost Guide)
window.addEventListener("DOMContentLoaded", () => {
    const params   = new URLSearchParams(window.location.search);
    const category = params.get("category");
    const note     = params.get("note");

    if (category) {
        const sel = document.getElementById("category");
        if (sel) {
            for (const opt of sel.options) {
                if (opt.value === category) { opt.selected = true; break; }
            }
        }
    }
    if (note) {
        const noteEl = document.getElementById("note");
        if (noteEl) noteEl.value = note;
    }

    // Set today's date as default
    const dateEl = document.getElementById("date");
    if (dateEl && !dateEl.value) {
        dateEl.value = new Date().toISOString().split("T")[0];
    }
});

async function addExpense(event) {
    event.preventDefault();

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("Please log in first!");
        window.location.href = "login.html";
        return;
    }

    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const note = document.getElementById("note").value;

    const response = await fetch("http://127.0.0.1:5000/add_expense", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user_id: user.id,
            amount,
            category,
            date,
            note
        })
    });

    const result = await response.json();

    if (result.message) {
        alert("Expense added successfully!");
        window.location.href = "dashboard.html";
    } else {
        alert(result.error);
    }
}
