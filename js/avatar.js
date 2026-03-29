// Loads profile photo + correct name initial into sidebar avatar on every page
(function () {
    const el = document.getElementById("sidebarAvatar") || document.querySelector(".sidebar .avatar");
    if (!el) return;

    // Set the correct first-name initial from localStorage
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user && user.name) {
        const initial = user.name.trim().charAt(0).toUpperCase();
        el.textContent = initial;

        // Also update the sidebar name text
        const nameEl = document.getElementById("userName");
        if (nameEl && nameEl.textContent === "User") {
            nameEl.textContent = user.name;
        }
    }

    // If a profile photo is saved, show it instead of the initial
    const photo = localStorage.getItem("profilePhoto");
    if (photo) {
        el.style.backgroundImage = "url('" + photo + "')";
        el.style.backgroundSize = "cover";
        el.style.backgroundPosition = "center";
        el.style.color = "transparent";
        el.textContent = "";
    }
})();
