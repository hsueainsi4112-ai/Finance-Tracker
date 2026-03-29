console.log("income.js loaded");

const _incomeUser = JSON.parse(localStorage.getItem("user"));
const _incomeUserNameEl = document.getElementById("userName");
if (_incomeUserNameEl && _incomeUser) _incomeUserNameEl.textContent = _incomeUser.name || "User";

async function addIncome(event) {
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

    if (!category) {
        alert("Please select a category!");
        return;
    }

    const response = await fetch("http://127.0.0.1:5000/add_income", {
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
        alert("Income added successfully!");
        window.location.href = "dashboard.html";
    } else {
        alert(result.error);
    }
}
