// ── IN-APP NOTIFICATION BELL — Finance Tracker ──
// Self-contained: injects bell + dropdown into every page header.

(function () {
    var BASE = "http://127.0.0.1:5000";
    var user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.id) return;

    // ── CSS ──
    var style = document.createElement("style");
    style.textContent = `
    .nb-bell-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
    }
    .nb-bell-btn {
        background: none;
        border: 1.5px solid #e5e7eb;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        font-size: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s;
        position: relative;
        background: #fff;
    }
    .nb-bell-btn:hover { background: #f3f4f6; border-color: #d1d5db; }
    .nb-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        min-width: 18px;
        height: 18px;
        border-radius: 999px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border: 2px solid #fff;
        line-height: 1;
    }
    .nb-dropdown {
        position: absolute;
        top: 48px;
        right: 0;
        width: 340px;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        border: 1px solid #e5e7eb;
        z-index: 9999;
        overflow: hidden;
        display: none;
    }
    .nb-dropdown.open { display: block; }
    .nb-drop-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 16px 10px;
        border-bottom: 1px solid #f3f4f6;
    }
    .nb-drop-title {
        font-size: 14px;
        font-weight: 700;
        color: #111827;
    }
    .nb-clear-btn {
        font-size: 12px;
        color: #7b2eff;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 6px;
    }
    .nb-clear-btn:hover { background: #f5f3ff; }
    .nb-list { max-height: 380px; overflow-y: auto; }
    .nb-empty {
        padding: 32px 16px;
        text-align: center;
        color: #9ca3af;
        font-size: 13px;
    }
    .nb-item {
        display: flex;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid #f9fafb;
        align-items: flex-start;
        transition: background 0.12s;
    }
    .nb-item:last-child { border-bottom: none; }
    .nb-item.unread { background: #fafaff; }
    .nb-item:hover { background: #f5f3ff; }
    .nb-icon {
        font-size: 20px;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
    }
    .nb-item-body { flex: 1; min-width: 0; }
    .nb-item-title {
        font-size: 13px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 2px;
    }
    .nb-item-msg {
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
    }
    .nb-item-time {
        font-size: 11px;
        color: #9ca3af;
        margin-top: 4px;
    }
    .nb-dismiss {
        background: none;
        border: none;
        color: #d1d5db;
        cursor: pointer;
        font-size: 16px;
        padding: 2px 4px;
        border-radius: 4px;
        line-height: 1;
        flex-shrink: 0;
    }
    .nb-dismiss:hover { color: #6b7280; background: #f3f4f6; }
    .nb-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #7b2eff;
        flex-shrink: 0;
        margin-top: 6px;
    }

    /* Dark mode */
    [data-theme="dark"] .nb-bell-btn { background: #1e293b; border-color: #334155; }
    [data-theme="dark"] .nb-bell-btn:hover { background: #0f172a; }
    [data-theme="dark"] .nb-dropdown { background: #1e293b; border-color: #334155; box-shadow: 0 8px 32px rgba(0,0,0,0.4); }
    [data-theme="dark"] .nb-drop-header { border-color: #334155; }
    [data-theme="dark"] .nb-drop-title { color: #f1f5f9; }
    [data-theme="dark"] .nb-item { border-color: #0f172a; }
    [data-theme="dark"] .nb-item.unread { background: #162032; }
    [data-theme="dark"] .nb-item:hover { background: #1a1040; }
    [data-theme="dark"] .nb-item-title { color: #f1f5f9; }
    [data-theme="dark"] .nb-item-msg { color: #94a3b8; }
    [data-theme="dark"] .nb-item-time { color: #64748b; }
    [data-theme="dark"] .nb-badge { border-color: #1e293b; }
    [data-theme="dark"] .nb-dismiss:hover { background: #334155; color: #e2e8f0; }
    [data-theme="dark"] .nb-empty { color: #64748b; }
    `;
    document.head.appendChild(style);

    // ── INJECT BELL INTO HEADER ──
    function injectBell() {
        var header = document.querySelector(".main-header");
        if (!header || document.getElementById("nb-bell-wrap")) return;

        var wrap = document.createElement("div");
        wrap.id = "nb-bell-wrap";
        wrap.className = "nb-bell-wrap";
        wrap.innerHTML =
            '<button class="nb-bell-btn" id="nb-bell-btn" title="Notifications">🔔' +
                '<span class="nb-badge" id="nb-badge" style="display:none">0</span>' +
            '</button>' +
            '<div class="nb-dropdown" id="nb-dropdown">' +
                '<div class="nb-drop-header">' +
                    '<span class="nb-drop-title">🔔 Notifications</span>' +
                    '<button class="nb-clear-btn" onclick="nbClearAll()">Clear all</button>' +
                '</div>' +
                '<div class="nb-list" id="nb-list"><div class="nb-empty">No notifications yet.</div></div>' +
            '</div>';

        // Add to end of header
        header.style.position = "relative";
        header.appendChild(wrap);

        document.getElementById("nb-bell-btn").addEventListener("click", function (e) {
            e.stopPropagation();
            var dd = document.getElementById("nb-dropdown");
            dd.classList.toggle("open");
            if (dd.classList.contains("open")) nbMarkAllRead();
        });

        document.addEventListener("click", function () {
            var dd = document.getElementById("nb-dropdown");
            if (dd) dd.classList.remove("open");
        });

        document.getElementById("nb-dropdown").addEventListener("click", function (e) {
            e.stopPropagation();
        });
    }

    // ── STORAGE ──
    function getNotifs() {
        return JSON.parse(localStorage.getItem("inAppNotifs") || "[]");
    }
    function saveNotifs(arr) {
        // Keep max 30 notifications
        localStorage.setItem("inAppNotifs", JSON.stringify(arr.slice(-30)));
    }
    function addNotif(type, icon, iconBg, title, msg) {
        var notifs = getNotifs();
        // Avoid duplicate for the same title on the same calendar day
        var todayStr = new Date().toDateString();
        var dup = notifs.some(function (n) {
            return n.title === title && new Date(n.time).toDateString() === todayStr;
        });
        if (dup) return;
        notifs.push({
            id:     Date.now() + Math.random(),
            type:   type,
            icon:   icon,
            iconBg: iconBg,
            title:  title,
            msg:    msg,
            time:   Date.now(),
            read:   false
        });
        saveNotifs(notifs);
    }

    // ── RENDER ──
    window.nbRender = function () {
        var list   = document.getElementById("nb-list");
        var badge  = document.getElementById("nb-badge");
        if (!list || !badge) return;

        var notifs  = getNotifs().slice().reverse(); // newest first
        var unread  = notifs.filter(function (n) { return !n.read; }).length;

        badge.textContent = unread > 9 ? "9+" : String(unread);
        badge.style.display = unread > 0 ? "flex" : "none";

        if (notifs.length === 0) {
            list.innerHTML = '<div class="nb-empty">✅ You\'re all caught up!</div>';
            return;
        }

        list.innerHTML = notifs.map(function (n) {
            var timeAgo = nbTimeAgo(n.time);
            return '<div class="nb-item ' + (n.read ? "" : "unread") + '" id="nb-' + n.id + '">' +
                '<div class="nb-icon" style="background:' + n.iconBg + '">' + n.icon + '</div>' +
                '<div class="nb-item-body">' +
                    '<div class="nb-item-title">' + n.title + '</div>' +
                    '<div class="nb-item-msg">' + n.msg + '</div>' +
                    '<div class="nb-item-time">' + timeAgo + '</div>' +
                '</div>' +
                (!n.read ? '<div class="nb-dot"></div>' : '') +
                '<button class="nb-dismiss" onclick="nbDismiss(' + n.id + ')" title="Dismiss">×</button>' +
            '</div>';
        }).join("");
    };

    window.nbDismiss = function (id) {
        var notifs = getNotifs().filter(function (n) { return n.id !== id; });
        saveNotifs(notifs);
        nbRender();
    };

    window.nbClearAll = function () {
        saveNotifs([]);
        nbRender();
    };

    function nbMarkAllRead() {
        var notifs = getNotifs().map(function (n) {
            return Object.assign({}, n, { read: true });
        });
        saveNotifs(notifs);
        nbRender();
    }

    function nbTimeAgo(ts) {
        var diff = Date.now() - ts;
        var m = Math.floor(diff / 60000);
        if (m < 1)  return "Just now";
        if (m < 60) return m + "m ago";
        var h = Math.floor(m / 60);
        if (h < 24) return h + "h ago";
        var d = Math.floor(h / 24);
        return d === 1 ? "Yesterday" : d + " days ago";
    }

    // ── CHECK REAL DATA & GENERATE NOTIFICATIONS ──
    var prefs = JSON.parse(localStorage.getItem("notifPrefs") || "{}");

    async function checkAndGenerate() {
        try {
            var budgetsResp = await fetch(BASE + "/budgets/" + user.id);
            if (!budgetsResp.ok) return;

            var budgets = await budgetsResp.json();
            if (!Array.isArray(budgets)) budgets = [];

            // Build spending map from the budgets response (already includes spent per category)
            var spending = {};
            budgets.forEach(function (b) { spending[b.category] = parseFloat(b.spent) || 0; });

            // 1. Budget Alerts (80–99%)
            if (prefs["notif-budget"] !== false) {
                budgets.forEach(function (b) {
                    var limit = parseFloat(b.limit_amount) || 0;
                    var spent = parseFloat(b.spent) || 0;
                    var pct   = limit > 0 ? Math.round(spent / limit * 100) : 0;
                    if (pct >= 80 && pct < 100) {
                        addNotif("budget", "⚠️", "#fef9c3",
                            "Budget Alert: " + b.category,
                            "You've used " + pct + "% of your £" + limit.toFixed(2) +
                            " " + b.category + " budget this month."
                        );
                    }
                });
            }

            // 2. Overspend Warnings (>100%)
            if (prefs["notif-overspend"] !== false) {
                budgets.forEach(function (b) {
                    var limit = parseFloat(b.limit_amount) || 0;
                    var spent = parseFloat(b.spent) || 0;
                    if (limit > 0 && spent > limit) {
                        var over = (spent - limit).toFixed(2);
                        addNotif("overspend", "🚨", "#fee2e2",
                            "Overspend: " + b.category,
                            "You are £" + over + " over your £" + limit.toFixed(2) +
                            " " + b.category + " budget this month."
                        );
                    }
                });
            }

            // 3. Weekly Summary (Mondays)
            if (prefs["notif-weekly"] !== false) {
                var isMonday   = new Date().getDay() === 1;
                var todayStr   = new Date().toDateString();
                var lastWeekly = localStorage.getItem("inAppLastWeekly");
                if (isMonday && lastWeekly !== todayStr) {
                    var totalSpent = Object.values(spending).reduce(function (s, v) {
                        return s + (parseFloat(v) || 0);
                    }, 0);
                    var top = Object.entries(spending).sort(function (a, b) { return b[1] - a[1]; })[0];
                    var topMsg = top ? " Top category: " + top[0] + " (£" + parseFloat(top[1]).toFixed(2) + ")." : "";
                    addNotif("weekly", "📊", "#dbeafe",
                        "Weekly Finance Summary",
                        "This month you've spent £" + totalSpent.toFixed(2) + " total." + topMsg
                    );
                    localStorage.setItem("inAppLastWeekly", todayStr);
                }
            }

            // 4. Large Transaction Alerts (expenses ≥ £100 in last 24h)
            if (prefs["notif-large"] !== false) {
                var expResp = await fetch(BASE + "/expenses/" + user.id);
                if (expResp.ok) {
                    var expData  = await expResp.json();
                    var expenses = expData.expenses || expData || [];
                    var since    = Date.now() - 86400000;
                    expenses.forEach(function (exp) {
                        var amt = parseFloat(exp.amount) || 0;
                        if (amt >= 100 && new Date(exp.date).getTime() >= since) {
                            addNotif("large", "💸", "#f3e8ff",
                                "Large Expense: £" + amt.toFixed(2),
                                exp.category + (exp.note ? " — " + exp.note : "") + " was logged."
                            );
                        }
                    });
                }
            }

            // 5. Student Money Tip (once per week)
            if (prefs["notif-tips"] !== false) {
                var lastTip = parseInt(localStorage.getItem("inAppLastTip") || "0");
                if (Date.now() - lastTip > 7 * 86400000) {
                    var tips = [
                        "Shop at Lidl or Aldi — save up to 40% on groceries vs premium stores.",
                        "Use the Cost Guide to compare grocery prices before your weekly shop.",
                        "A monthly bus pass (~£55) is far cheaper than buying singles every day.",
                        "Full-time students are exempt from Council Tax — get your certificate now!",
                        "Activate Clubcard or Nectar in-app before shopping to unlock member prices.",
                        "Cooking a batch meal once a week can cut food costs by up to 30%.",
                        "Check yellow-sticker reduced items near supermarket closing time."
                    ];
                    var tip = tips[Math.floor(Math.random() * tips.length)];
                    addNotif("tip", "💡", "#dcfce7",
                        "Student Money Tip",
                        tip
                    );
                    localStorage.setItem("inAppLastTip", String(Date.now()));
                }
            }

        } catch (e) {
            // Silently fail
        }

        nbRender();
    }

    // ── INIT ──
    function init() {
        injectBell();
        nbRender();
        checkAndGenerate(); // always check on every page load
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
