async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (result.message) {
        // Save user ID for dashboard
        localStorage.setItem("user", JSON.stringify(result.user));

        alert("Login successful!");
        window.location.href = "dashboard.html";   // go to dashboard
    } else {
        alert(result.error);
    }
}
