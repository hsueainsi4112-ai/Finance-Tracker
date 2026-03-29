// ── FINANCE TRACKER — REAL BROWSER NOTIFICATIONS ──
// Runs on every page load. Checks real data and fires OS notifications.

(function () {
    var BASE = "http://127.0.0.1:5000";

    var user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || !user.id) return;

    // Only run if browser supports notifications and permission is granted
    if (!("Notification" in window) || Notification.permission !== "granted") return;

    var prefs = JSON.parse(localStorage.getItem("notifPrefs") || "{}");
    var anyEnabled = Object.values(prefs).some(function (v) { return v; });
    if (!anyEnabled) return;

    // Rate-limit: run checks at most once per hour per page load
    var lastCheck = parseInt(localStorage.getItem("notifLastCheck") || "0");
    var now = Date.now();
    if (now - lastCheck < 3600000) return;
    localStorage.setItem("notifLastCheck", String(now));

    function fire(title, body) {
        try {
            var n = new Notification(title, {
                body: body,
                icon: "favicon.ico",
                badge: "favicon.ico"
            });
            // Auto-close after 8 seconds
            setTimeout(function () { n.close(); }, 8000);
        } catch (e) {}
    }

    async function runChecks() {
        try {
            var spendingResp = await fetch(BASE + "/current_month_spending/" + user.id);
            var budgetsResp  = await fetch(BASE + "/budgets/" + user.id);
            if (!spendingResp.ok || !budgetsResp.ok) return;

            var spending = await spendingResp.json();
            var budData  = await budgetsResp.json();
            var budgets  = budData.budgets || budData || [];

            // ── 1. BUDGET ALERTS (≥ 80% used) ──
            if (prefs["notif-budget"]) {
                budgets.forEach(function (b) {
                    var spent = spending[b.category] || 0;
                    var pct   = b.limit > 0 ? (spent / b.limit * 100) : 0;
                    if (pct >= 80 && pct < 100) {
                        fire(
                            "⚠️ Budget Alert: " + b.category,
                            "You've used " + pct.toFixed(0) + "% of your £" + b.limit.toFixed(2) +
                            " " + b.category + " budget this month."
                        );
                    }
                });
            }

            // ── 2. OVERSPEND WARNINGS (> 100%) ──
            if (prefs["notif-overspend"]) {
                budgets.forEach(function (b) {
                    var spent = spending[b.category] || 0;
                    if (spent > b.limit) {
                        var over = (spent - b.limit).toFixed(2);
                        fire(
                            "🚨 Overspend: " + b.category,
                            "You are £" + over + " over your £" + b.limit.toFixed(2) +
                            " " + b.category + " budget this month!"
                        );
                    }
                });
            }

            // ── 3. WEEKLY SUMMARY (Mondays only, once per Monday) ──
            if (prefs["notif-weekly"]) {
                var dayOfWeek  = new Date().getDay(); // 0=Sun, 1=Mon
                var todayStr   = new Date().toDateString();
                var lastWeekly = localStorage.getItem("notifLastWeekly");
                if (dayOfWeek === 1 && lastWeekly !== todayStr) {
                    var totalSpent = Object.values(spending).reduce(function (s, v) {
                        return s + (parseFloat(v) || 0);
                    }, 0);
                    var topCat = Object.entries(spending).sort(function (a, b) {
                        return b[1] - a[1];
                    })[0];
                    var topMsg = topCat ? " Most spent on: " + topCat[0] + " (£" + topCat[1].toFixed(2) + ")." : "";
                    fire(
                        "📊 Weekly Finance Summary",
                        "This month you've spent £" + totalSpent.toFixed(2) + " across all categories." + topMsg
                    );
                    localStorage.setItem("notifLastWeekly", todayStr);
                }
            }

            // ── 4. LARGE TRANSACTION ALERTS (expenses > £100 in last 24 h) ──
            if (prefs["notif-large"]) {
                var expResp = await fetch(BASE + "/expenses/" + user.id);
                if (expResp.ok) {
                    var expData   = await expResp.json();
                    var expenses  = expData.expenses || expData || [];
                    var yesterday = Date.now() - 86400000;
                    var alreadyNotified = JSON.parse(localStorage.getItem("notifLargeIds") || "[]");

                    expenses.forEach(function (exp) {
                        var amt = parseFloat(exp.amount) || 0;
                        if (amt >= 100) {
                            var expDate = new Date(exp.date).getTime();
                            if (expDate >= yesterday && alreadyNotified.indexOf(exp.id) === -1) {
                                fire(
                                    "💸 Large Expense Logged",
                                    "£" + amt.toFixed(2) + " logged in " + exp.category +
                                    (exp.note ? ": " + exp.note : "") + "."
                                );
                                alreadyNotified.push(exp.id);
                            }
                        }
                    });
                    // Keep only last 50 notified IDs to prevent localStorage bloat
                    localStorage.setItem("notifLargeIds", JSON.stringify(alreadyNotified.slice(-50)));
                }
            }

        } catch (e) {
            // Silently fail — never break the page
        }
    }

    // ── 5. UK STUDENT MONEY TIPS (once per week) ──
    if (prefs["notif-tips"]) {
        var lastTipTime = parseInt(localStorage.getItem("notifLastTip") || "0");
        var weekMs      = 7 * 24 * 3600000;
        if (Date.now() - lastTipTime > weekMs) {
            var tips = [
                "Shop at Lidl or Aldi to save up to 40% on groceries vs premium stores.",
                "Use the Cost Guide in Finance Tracker to compare prices before your weekly shop.",
                "A monthly First Bus pass (~£55) is far cheaper than buying singles every day.",
                "Full-time students are exempt from Council Tax — get your certificate from your university.",
                "Check for student discounts with TOTUM or UNiDAYS before every purchase.",
                "Cooking a batch meal once a week can cut your food costs by 30%.",
                "Always check the yellow-sticker reduced section near supermarket closing time.",
                "Set a weekly cash limit and withdraw it — you'll spend less than paying by card."
            ];
            var tip = tips[Math.floor(Math.random() * tips.length)];
            fire("💡 UK Student Money Tip", tip);
            localStorage.setItem("notifLastTip", String(Date.now()));
        }
    }

    runChecks();
})();
