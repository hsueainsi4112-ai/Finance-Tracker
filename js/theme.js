// ── Apply theme immediately to prevent flash ──
(function () {
    const t = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", t);
})();

// ── Inject toggle button into sidebar when DOM ready ──
document.addEventListener("DOMContentLoaded", function () {
    const sideMenu = document.querySelector(".side-menu");
    if (!sideMenu) return;

    const btn = document.createElement("button");
    btn.className = "theme-toggle-btn";
    btn.id = "themeToggle";
    btn.addEventListener("click", toggleTheme);
    updateToggleBtn(btn);
    sideMenu.appendChild(btn);
});

function updateToggleBtn(btn) {
    btn = btn || document.getElementById("themeToggle");
    if (!btn) return;
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.textContent = isDark ? "☀️  Light Mode" : "🌙  Dark Mode";
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    updateToggleBtn();
}
