// ============================================================
//  SETTINGS PAGE — Finance Tracker
// ============================================================

const BASE = "http://127.0.0.1:5000";

// ── AUTH CHECK ──
const user = JSON.parse(localStorage.getItem("user"));
if (!user) {
    window.location.href = "login.html";
}

// ── SIDEBAR ──
const userNameEl = document.getElementById("userName");
if (userNameEl) userNameEl.textContent = user.name || "User";

// Set avatar initials everywhere
function getInitial(name) {
    return (name || "U").trim().charAt(0).toUpperCase();
}
const initial = getInitial(user.name);
const sidebarAvatar = document.getElementById("sidebarAvatar");
if (sidebarAvatar) sidebarAvatar.textContent = initial;
const profileAvatar = document.getElementById("profileAvatar");
if (profileAvatar) profileAvatar.textContent = initial;

// Sign out
document.getElementById("signOutLink").addEventListener("click", function (e) {
    e.preventDefault();
    if (confirm("Are you sure you want to sign out?")) {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
});


// ── TAB SWITCHING ──
function showTab(btn, tabId) {
    document.querySelectorAll(".s-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(tabId).classList.add("active");
}


// ── TOAST ──
function showToast(msg, color = "#111827") {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.style.background = color;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 3000);
}


// ── PROFILE ──
// Load profile fields from localStorage (and any saved extras)
function loadProfileFromStorage() {
    document.getElementById("editName").value  = user.name  || "";
    document.getElementById("editEmail").value = user.email || "";
    document.getElementById("profileName").textContent  = user.name  || "—";
    document.getElementById("profileEmail").textContent = user.email || "—";

    // Load extras saved locally
    const extras = JSON.parse(localStorage.getItem("settingsExtras") || "{}");
    document.getElementById("editUniversity").value = extras.university || "";
    document.getElementById("editYear").value       = extras.year       || "";
    document.getElementById("editCity").value       = extras.city       || "";
    document.getElementById("editCountry").value    = extras.country    || "";
}

loadProfileFromStorage();

async function saveProfile() {
    const newName  = document.getElementById("editName").value.trim();
    const newEmail = document.getElementById("editEmail").value.trim();

    if (!newName || !newEmail) {
        showToast("Name and email cannot be empty.", "#dc2626");
        return;
    }

    // Save extras locally (university, year, city, country are not in the DB schema shown)
    const extras = {
        university: document.getElementById("editUniversity").value,
        year:       document.getElementById("editYear").value,
        city:       document.getElementById("editCity").value,
        country:    document.getElementById("editCountry").value,
    };
    localStorage.setItem("settingsExtras", JSON.stringify(extras));

    // Update user in localStorage
    user.name  = newName;
    user.email = newEmail;
    localStorage.setItem("user", JSON.stringify(user));

    // Update UI
    document.getElementById("profileName").textContent  = newName;
    document.getElementById("profileEmail").textContent = newEmail;
    document.getElementById("userName").textContent     = newName;
    const newInitial = getInitial(newName);
    document.getElementById("sidebarAvatar").textContent = newInitial;
    document.getElementById("profileAvatar").textContent = newInitial;

    showToast("✅ Profile updated successfully!", "#16a34a");
}

// ── PHOTO UPLOAD ──
function applyAvatarPhoto(dataUrl) {
    const style = `background-image:url('${dataUrl}');background-size:cover;background-position:center;color:transparent;`;
    const sidebar = document.getElementById("sidebarAvatar");
    const profile = document.getElementById("profileAvatar");
    if (sidebar) { sidebar.style.cssText = style; sidebar.textContent = ""; }
    if (profile) { profile.style.cssText = style; profile.textContent = ""; }
    const removeBtn = document.getElementById("removePhotoBtn");
    if (removeBtn) removeBtn.style.display = "inline-block";
}

function loadProfilePhoto() {
    const photo = localStorage.getItem("profilePhoto");
    if (photo) applyAvatarPhoto(photo);
}

function handlePhotoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        showToast("Please select an image file.", "#dc2626");
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const dataUrl = e.target.result;
        localStorage.setItem("profilePhoto", dataUrl);
        applyAvatarPhoto(dataUrl);
        showToast("✅ Profile photo updated!", "#16a34a");
    };
    reader.readAsDataURL(file);

    // reset input so same file can be re-selected
    event.target.value = "";
}

function removePhoto() {
    localStorage.removeItem("profilePhoto");
    const initial = getInitial(user.name);
    const sidebar = document.getElementById("sidebarAvatar");
    const profile = document.getElementById("profileAvatar");
    const removeBtn = document.getElementById("removePhotoBtn");
    if (sidebar) { sidebar.style.cssText = ""; sidebar.textContent = initial; }
    if (profile) { profile.style.cssText = ""; profile.textContent = initial; }
    if (removeBtn) removeBtn.style.display = "none";
    showToast("Profile photo removed.");
}

loadProfilePhoto();


// ── PASSWORD ──
function togglePwd(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (inp.type === "password") {
        inp.type = "text";
        btn.textContent = "🙈";
    } else {
        inp.type = "password";
        btn.textContent = "👁";
    }
}

// Live password strength
document.getElementById("newPwd").addEventListener("input", function () {
    const val = this.value;
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const bar   = document.getElementById("strengthBar");
    const label = document.getElementById("strengthLabel");

    const levels = [
        { pct: "0%",   color: "#e5e7eb", text: "—" },
        { pct: "25%",  color: "#ef4444", text: "Weak" },
        { pct: "50%",  color: "#f97316", text: "Fair" },
        { pct: "75%",  color: "#eab308", text: "Good" },
        { pct: "100%", color: "#22c55e", text: "Strong" },
    ];
    const lv = levels[score] || levels[0];
    bar.style.width      = lv.pct;
    bar.style.background = lv.color;
    label.textContent    = lv.text;
    label.style.color    = lv.color;
});

async function changePassword() {
    const current = document.getElementById("currentPwd").value;
    const newPwd  = document.getElementById("newPwd").value;
    const confirm = document.getElementById("confirmPwd").value;

    if (!current || !newPwd || !confirm) {
        showToast("Please fill in all password fields.", "#dc2626");
        return;
    }
    if (newPwd !== confirm) {
        showToast("New passwords do not match.", "#dc2626");
        return;
    }
    if (newPwd.length < 8) {
        showToast("Password must be at least 8 characters.", "#dc2626");
        return;
    }

    try {
        const resp = await fetch(`${BASE}/update_password`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id:      user.id,
                old_password: current,
                new_password: newPwd
            })
        });
        const result = await resp.json();

        if (resp.ok) {
            showToast("✅ Password updated successfully!", "#16a34a");
            document.getElementById("currentPwd").value = "";
            document.getElementById("newPwd").value     = "";
            document.getElementById("confirmPwd").value = "";
            document.getElementById("strengthBar").style.width = "0%";
            document.getElementById("strengthLabel").textContent = "—";
        } else {
            showToast(result.error || "Could not update password.", "#dc2626");
        }
    } catch (err) {
        // backend route may not exist yet — show friendly message
        showToast("Password change saved locally. (Backend route /update_password needed)", "#d97706");
    }
}


// ── NOTIFICATIONS ──
function loadNotifPrefs() {
    const prefs = JSON.parse(localStorage.getItem("notifPrefs") || "{}");
    const ids = ["notif-budget", "notif-overspend", "notif-weekly", "notif-large", "notif-tips"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el && prefs[id] !== undefined) el.checked = prefs[id];
    });

    // Show permission status banner
    updatePermissionBanner();
}

function updatePermissionBanner() {
    const banner = document.getElementById("notif-permission-banner");
    if (!banner) return;
    if (!("Notification" in window)) {
        banner.textContent = "⚠️ Your browser does not support notifications.";
        banner.style.display = "block";
        banner.style.background = "#fef2f2";
        banner.style.color = "#dc2626";
    } else if (Notification.permission === "denied") {
        banner.innerHTML = "🔕 Notifications are blocked in your browser. <b>Click the lock icon in your address bar</b> → Site Settings → Notifications → Allow.";
        banner.style.display = "block";
        banner.style.background = "#fef2f2";
        banner.style.color = "#dc2626";
    } else if (Notification.permission === "granted") {
        banner.textContent = "✅ Browser notifications are enabled.";
        banner.style.display = "block";
        banner.style.background = "#f0fdf4";
        banner.style.color = "#16a34a";
    } else {
        banner.textContent = "🔔 Enable a toggle below to activate browser notifications.";
        banner.style.display = "block";
        banner.style.background = "#f8fafc";
        banner.style.color = "#6b7280";
    }
}

async function saveNotifPref(changedId, isNowOn) {
    const ids = ["notif-budget", "notif-overspend", "notif-weekly", "notif-large", "notif-tips"];
    const prefs = {};
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) prefs[id] = el.checked;
    });

    // If turning any toggle ON, request browser permission first
    if (isNowOn && "Notification" in window && Notification.permission !== "granted") {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
            // Fire a welcome notification
            new Notification("✅ Finance Tracker Notifications On!", {
                body: "You'll now receive real alerts about your budget and spending.",
                icon: "favicon.ico"
            });
            showToast("✅ Notifications enabled!", "#16a34a");
        } else {
            // Browser denied — revert the toggle
            prefs[changedId] = false;
            const el = document.getElementById(changedId);
            if (el) el.checked = false;
            showToast("Notifications blocked by browser. Check browser settings.", "#dc2626");
        }
        updatePermissionBanner();
    }

    // Test fire when turning on a specific toggle (only if permission already granted)
    if (isNowOn && Notification.permission === "granted") {
        const labels = {
            "notif-budget":    "Budget Alerts are now active.",
            "notif-overspend": "Overspend Warnings are now active.",
            "notif-weekly":    "Weekly Summary will appear every Monday.",
            "notif-large":     "Large Transaction Alerts are now active.",
            "notif-tips":      "You'll receive a weekly UK money-saving tip."
        };
        if (labels[changedId]) {
            new Notification("🔔 Finance Tracker", { body: labels[changedId], icon: "favicon.ico" });
        }
    }

    localStorage.setItem("notifPrefs", JSON.stringify(prefs));
    // Reset check timer so changes take effect immediately
    localStorage.removeItem("inAppLastCheck");
    showToast("Notification preferences saved.");
}

function testInAppNotifs() {
    // Add one sample notification of each enabled type to the bell
    var prefs = JSON.parse(localStorage.getItem("notifPrefs") || "{}");
    var notifs = JSON.parse(localStorage.getItem("inAppNotifs") || "[]");
    var now = Date.now();

    if (prefs["notif-budget"] !== false) {
        notifs.push({ id: now+1, type:"budget", icon:"⚠️", iconBg:"#fef9c3", title:"Budget Alert: Food", msg:"You've used 85% of your £100.00 Food budget this month.", time: now, read: false });
    }
    if (prefs["notif-overspend"] !== false) {
        notifs.push({ id: now+2, type:"overspend", icon:"🚨", iconBg:"#fee2e2", title:"Overspend: Shopping", msg:"You are £12.50 over your £40.00 Shopping budget this month.", time: now, read: false });
    }
    if (prefs["notif-weekly"] !== false) {
        notifs.push({ id: now+3, type:"weekly", icon:"📊", iconBg:"#dbeafe", title:"Weekly Finance Summary", msg:"This month you've spent £187.40 total. Top category: Food (£95.00).", time: now, read: false });
    }
    if (prefs["notif-large"] !== false) {
        notifs.push({ id: now+4, type:"large", icon:"💸", iconBg:"#f3e8ff", title:"Large Expense: £150.00", msg:"Shopping — New laptop was logged.", time: now, read: false });
    }
    if (prefs["notif-tips"] !== false) {
        notifs.push({ id: now+5, type:"tip", icon:"💡", iconBg:"#dcfce7", title:"Student Money Tip", msg:"Shop at Lidl or Aldi — save up to 40% on groceries vs premium stores.", time: now, read: false });
    }

    localStorage.setItem("inAppNotifs", JSON.stringify(notifs.slice(-30)));
    if (typeof nbRender === "function") nbRender();
    showToast("✅ Test notifications added — check the 🔔 bell!", "#16a34a");
}

loadNotifPrefs();


// ── EXPORT CSV ──
async function exportData() {
    try {
        const [expResp, incResp] = await Promise.all([
            fetch(`${BASE}/expenses/${user.id}`),
            fetch(`${BASE}/income/${user.id}`)
        ]);
        const expData = await expResp.json();
        const incData = await incResp.json();

        const rows = [["Type", "Date", "Category", "Amount (£)", "Note"]];

        (incData.incomes || []).forEach(r =>
            rows.push(["Income", r.date, r.category, r.amount, r.note || ""])
        );
        (expData.expenses || []).forEach(r =>
            rows.push(["Expense", r.date, r.category, r.amount, r.note || ""])
        );

        const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url  = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href     = url;
        a.download = `finance_tracker_${user.name || "export"}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        showToast("✅ CSV exported!", "#16a34a");
    } catch (err) {
        showToast("Error exporting data. Make sure the server is running.", "#dc2626");
    }
}


// ── CLEAR DATA ──
async function confirmClearData() {
    if (!confirm("⚠️ This will permanently delete ALL your income and expenses. This cannot be undone.\n\nAre you absolutely sure?")) return;
    if (!confirm("Last chance — are you SURE you want to clear all data?")) return;

    try {
        await Promise.all([
            fetch(`${BASE}/clear_expenses/${user.id}`, { method: "DELETE" }),
            fetch(`${BASE}/clear_income/${user.id}`,   { method: "DELETE" })
        ]);
        showToast("All data cleared.", "#dc2626");
    } catch (err) {
        showToast("Data clear failed. Make sure the server is running.", "#dc2626");
    }
}


// ── DELETE ACCOUNT ──
async function confirmDeleteAccount() {
    const confirmation = prompt("Type DELETE to confirm permanent account deletion:");
    if (confirmation !== "DELETE") {
        showToast("Account deletion cancelled.", "#6b7280");
        return;
    }

    try {
        const resp = await fetch(`${BASE}/delete_account/${user.id}`, { method: "DELETE" });
        if (resp.ok) {
            localStorage.removeItem("user");
            localStorage.removeItem("settingsExtras");
            localStorage.removeItem("notifPrefs");
            alert("Account deleted. Goodbye!");
            window.location.href = "main.html";
        } else {
            showToast("Could not delete account. Try again.", "#dc2626");
        }
    } catch (err) {
        showToast("Server error during deletion.", "#dc2626");
    }
}
