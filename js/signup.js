async function registerUser(event) {
    event.preventDefault();  // stop page reload

    const name = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const confirm = document.getElementById("confirm").value;

    // Password match check
    if (password !== confirm) {
        alert("Passwords do not match!");
        return;
    }

    // Send data to Flask backend
    const response = await fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    });

    const result = await response.json();

    if (result.message) {
        alert("Account created successfully!");
        window.location.href = "login.html"; // redirect to login
    } else {
        alert(result.error);
    }
}
