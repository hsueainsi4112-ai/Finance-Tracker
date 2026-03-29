from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db import get_db_connection, init_db
from datetime import datetime, timedelta
import traceback
import os

app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app, resources={r"/*": {"origins": "*"}})

init_db()


@app.route("/")
def home():
    return send_from_directory(".", "main.html")


# ---------------------------------------------------
# LOGIN
# ---------------------------------------------------
@app.route("/login", methods=["POST"])
def login():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")

        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE email=? AND password=?", (email, password))
        row = cursor.fetchone()
        db.close()

        if row:
            return jsonify({"message": "Login success", "user": dict(row)}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401

    except Exception as e:
        print("\n--- LOGIN ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# REGISTER
# ---------------------------------------------------
@app.route("/register", methods=["POST"])
def register():
    try:
        data = request.json
        name = data.get("name")
        email = data.get("email")
        password = data.get("password")

        db = get_db_connection()
        cursor = db.cursor()

        cursor.execute("SELECT * FROM users WHERE email=?", (email,))
        existing = cursor.fetchone()

        if existing:
            db.close()
            return jsonify({"error": "Email already exists"}), 400

        cursor.execute(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            (name, email, password)
        )
        db.commit()
        db.close()
        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("\n--- REGISTER ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# ADD INCOME
# ---------------------------------------------------
@app.route("/add_income", methods=["POST"])
def add_income():
    try:
        data = request.json
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO income (user_id, amount, category, date, note)
            VALUES (?, ?, ?, ?, ?)
        """, (data.get("user_id"), data.get("amount"), data.get("category"), data.get("date"), data.get("note")))
        db.commit()
        db.close()
        return jsonify({"message": "Income added successfully!"}), 201

    except Exception as e:
        print("\n--- INCOME ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# ADD EXPENSE
# ---------------------------------------------------
@app.route("/add_expense", methods=["POST"])
def add_expense():
    try:
        data = request.json
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            INSERT INTO expenses (user_id, amount, category, date, note)
            VALUES (?, ?, ?, ?, ?)
        """, (data.get("user_id"), data.get("amount"), data.get("category"), data.get("date"), data.get("note")))
        db.commit()
        db.close()
        return jsonify({"message": "Expense added successfully!"}), 201

    except Exception as e:
        print("\n--- EXPENSE ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# SUMMARY
# ---------------------------------------------------
@app.route("/summary/<int:user_id>")
def summary(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()

        today = datetime.today()
        month = today.month
        year = today.year

        cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM income WHERE user_id=?", (user_id,))
        total_income = cursor.fetchone()["total"] or 0

        cursor.execute("SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE user_id=?", (user_id,))
        total_expense = cursor.fetchone()["total"] or 0

        balance = total_income - total_expense

        cursor.execute("""
            SELECT COALESCE(SUM(limit_amount), 0) AS total_budget
            FROM budget WHERE user_id=? AND month=?
        """, (user_id, month))
        budget_total = float(cursor.fetchone()["total_budget"])

        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) AS total_spent FROM expenses
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
        """, (user_id, month, year))
        month_spent = float(cursor.fetchone()["total_spent"])

        budget_remaining = budget_total - month_spent
        budget_used_percentage = (month_spent / budget_total * 100) if budget_total > 0 else 0
        budget_used_percentage = max(0, min(100, budget_used_percentage))

        cursor.execute("""
            SELECT category, date, amount FROM income WHERE user_id=?
            UNION ALL
            SELECT category, date, -amount FROM expenses WHERE user_id=?
            ORDER BY date DESC LIMIT 5
        """, (user_id, user_id))
        transactions = [dict(r) for r in cursor.fetchall()]
        db.close()

        return jsonify({
            "total_income": total_income,
            "total_expense": total_expense,
            "balance": balance,
            "budget_total": budget_total,
            "budget_remaining": budget_remaining,
            "budget_used_percentage": round(budget_used_percentage, 2),
            "transactions": transactions
        }), 200

    except Exception as e:
        print("SUMMARY ERROR:", e)
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# SPENDING FLOW
# ---------------------------------------------------
@app.route("/spending_flow/<int:user_id>")
def spending_flow(user_id):
    period = request.args.get("range")
    db = get_db_connection()
    cursor = db.cursor()

    if period == "weekly":
        labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
        income_data = [0, 0, 0, 0]
        expense_data = [0, 0, 0, 0]
        today = datetime.today()

        cursor.execute("""
            SELECT amount, date FROM income WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
        """, (user_id, today.month, today.year))
        for row in cursor.fetchall():
            d = datetime.strptime(str(row["date"]), '%Y-%m-%d')
            week = min((d.day - 1) // 7, 3)
            income_data[week] += row["amount"]

        cursor.execute("""
            SELECT amount, date FROM expenses WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
        """, (user_id, today.month, today.year))
        for row in cursor.fetchall():
            d = datetime.strptime(str(row["date"]), '%Y-%m-%d')
            week = min((d.day - 1) // 7, 3)
            expense_data[week] += row["amount"]

        db.close()
        return jsonify({"labels": labels, "income": income_data, "expense": expense_data})

    if period == "monthly":
        labels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
        income_data = [0]*12
        expense_data = [0]*12

        cursor.execute("SELECT amount, date FROM income WHERE user_id=?", (user_id,))
        for row in cursor.fetchall():
            d = datetime.strptime(str(row["date"]), '%Y-%m-%d')
            income_data[d.month - 1] += row["amount"]

        cursor.execute("SELECT amount, date FROM expenses WHERE user_id=?", (user_id,))
        for row in cursor.fetchall():
            d = datetime.strptime(str(row["date"]), '%Y-%m-%d')
            expense_data[d.month - 1] += row["amount"]

        db.close()
        return jsonify({"labels": labels, "income": income_data, "expense": expense_data})

    if period == "yearly":
        cursor.execute("""
            SELECT strftime('%Y', date) AS y, SUM(amount) AS total
            FROM income WHERE user_id=? GROUP BY strftime('%Y', date)
        """, (user_id,))
        income_rows = [dict(r) for r in cursor.fetchall()]

        cursor.execute("""
            SELECT strftime('%Y', date) AS y, SUM(amount) AS total
            FROM expenses WHERE user_id=? GROUP BY strftime('%Y', date)
        """, (user_id,))
        expense_rows = [dict(r) for r in cursor.fetchall()]

        years = sorted({int(r["y"]) for r in income_rows} | {int(r["y"]) for r in expense_rows})
        labels, income_data, expense_data = [], [], []
        for y in years:
            labels.append(str(y))
            income_data.append(next((r["total"] for r in income_rows if int(r["y"]) == y), 0))
            expense_data.append(next((r["total"] for r in expense_rows if int(r["y"]) == y), 0))

        db.close()
        return jsonify({"labels": labels, "income": income_data, "expense": expense_data})

    db.close()
    return jsonify({"labels": [], "income": [], "expense": []})


# ---------------------------------------------------
# FILTERED TRANSACTIONS (THIS MONTH / LAST MONTH)
# ---------------------------------------------------
@app.route("/transactions/<int:user_id>")
def get_transactions(user_id):
    month = int(request.args.get("month"))
    year  = int(request.args.get("year"))
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("""
        SELECT category, date, amount FROM income
        WHERE user_id=?
          AND CAST(strftime('%m', date) AS INTEGER) = ?
          AND CAST(strftime('%Y', date) AS INTEGER) = ?
        UNION ALL
        SELECT category, date, -amount FROM expenses
        WHERE user_id=?
          AND CAST(strftime('%m', date) AS INTEGER) = ?
          AND CAST(strftime('%Y', date) AS INTEGER) = ?
        ORDER BY date DESC
    """, (user_id, month, year, user_id, month, year))
    rows = [dict(r) for r in cursor.fetchall()]
    db.close()
    return jsonify(rows)


# ---------------------------------------------------
# GET ALL EXPENSES + CATEGORY TOTALS
# ---------------------------------------------------
@app.route("/expenses/<int:user_id>", methods=["GET"])
def get_expenses(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, category, amount, date, note FROM expenses
            WHERE user_id=? ORDER BY date DESC
        """, (user_id,))
        expenses = [dict(e) for e in cursor.fetchall()]
        for exp in expenses:
            exp["amount"] = float(exp["amount"])

        cursor.execute("""
            SELECT category, SUM(amount) AS total FROM expenses
            WHERE user_id=? GROUP BY category
        """, (user_id,))
        category_totals = {row["category"]: float(row["total"]) for row in cursor.fetchall()}

        db.close()
        return jsonify({"expenses": expenses, "category_totals": category_totals}), 200

    except Exception as e:
        print("\n--- GET EXPENSES ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# GET SINGLE EXPENSE
# ---------------------------------------------------
@app.route("/expense/<int:expense_id>", methods=["GET"])
def get_expense(expense_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM expenses WHERE id=?", (expense_id,))
        row = cursor.fetchone()
        db.close()
        if not row:
            return jsonify({"error": "Expense not found"}), 404
        result = dict(row)
        result["amount"] = float(result["amount"])
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# DELETE EXPENSE
# ---------------------------------------------------
@app.route("/delete_expense/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM expenses WHERE id=?", (expense_id,))
        db.commit()
        rowcount = cursor.rowcount
        db.close()
        if rowcount == 0:
            return jsonify({"error": "Expense not found"}), 404
        return jsonify({"message": "Expense deleted"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# UPDATE EXPENSE
# ---------------------------------------------------
@app.route("/update_expense/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    try:
        data = request.json
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE expenses SET category=?, amount=?, date=?, note=? WHERE id=?
        """, (data.get("category"), data.get("amount"), data.get("date"), data.get("note"), expense_id))
        db.commit()
        db.close()
        return jsonify({"message": "Expense updated"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# GET ALL INCOME + CATEGORY TOTALS
# ---------------------------------------------------
@app.route("/income/<int:user_id>", methods=["GET"])
def get_income(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            SELECT id, category, amount, date, note FROM income
            WHERE user_id=? ORDER BY date DESC
        """, (user_id,))
        incomes = [dict(i) for i in cursor.fetchall()]
        for inc in incomes:
            inc["amount"] = float(inc["amount"])

        cursor.execute("""
            SELECT category, SUM(amount) AS total FROM income
            WHERE user_id=? GROUP BY category
        """, (user_id,))
        category_totals = {row["category"]: float(row["total"]) for row in cursor.fetchall()}

        db.close()
        return jsonify({"incomes": incomes, "category_totals": category_totals}), 200

    except Exception as e:
        print("\n--- GET INCOME ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# GET SINGLE INCOME
# ---------------------------------------------------
@app.route("/income_item/<int:income_id>", methods=["GET"])
def get_income_item(income_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM income WHERE id=?", (income_id,))
        row = cursor.fetchone()
        db.close()
        if not row:
            return jsonify({"error": "Income not found"}), 404
        result = dict(row)
        result["amount"] = float(result["amount"])
        return jsonify(result), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# DELETE INCOME
# ---------------------------------------------------
@app.route("/delete_income/<int:income_id>", methods=["DELETE"])
def delete_income(income_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM income WHERE id=?", (income_id,))
        db.commit()
        db.close()
        return jsonify({"message": "Income deleted"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# UPDATE INCOME
# ---------------------------------------------------
@app.route("/update_income/<int:income_id>", methods=["PUT"])
def update_income(income_id):
    try:
        data = request.json
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("""
            UPDATE income SET category=?, amount=?, date=?, note=? WHERE id=?
        """, (data.get("category"), data.get("amount"), data.get("date"), data.get("note"), income_id))
        db.commit()
        db.close()
        return jsonify({"message": "Income updated"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# ADD BUDGET
# ---------------------------------------------------
@app.route("/add_budget", methods=["POST"])
def add_budget():
    try:
        data = request.json
        user_id = data.get("user_id")
        category = data.get("category")
        limit_amount = data.get("limit_amount")
        month = int(data.get("month")) if data.get("month") else datetime.today().month

        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT id FROM budget WHERE user_id=? AND category=? AND month=?", (user_id, category, month))
        existing = cursor.fetchone()

        if existing:
            cursor.execute("UPDATE budget SET limit_amount=? WHERE id=?", (limit_amount, existing["id"]))
        else:
            cursor.execute("INSERT INTO budget (user_id, category, month, limit_amount) VALUES (?, ?, ?, ?)",
                           (user_id, category, month, limit_amount))

        db.commit()
        db.close()
        return jsonify({"message": "Budget saved successfully"}), 201

    except Exception as e:
        print("\n--- ADD BUDGET ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# GET BUDGETS + CURRENT MONTH SPENT
# ---------------------------------------------------
@app.route("/budgets/<int:user_id>", methods=["GET"])
def get_budgets(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        month = int(request.args.get("month")) if request.args.get("month") else datetime.today().month
        year  = int(request.args.get("year"))  if request.args.get("year")  else datetime.today().year

        cursor.execute("SELECT id, category, limit_amount FROM budget WHERE user_id=? AND month=?", (user_id, month))
        budgets = [dict(b) for b in cursor.fetchall()]

        cursor.execute("""
            SELECT category, SUM(amount) AS spent FROM expenses
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
            GROUP BY category
        """, (user_id, month, year))
        spent_map = {row["category"]: float(row["spent"]) for row in cursor.fetchall()}

        result = []
        for b in budgets:
            limit_amount = float(b["limit_amount"])
            spent = spent_map.get(b["category"], 0.0)
            remaining = limit_amount - spent
            percentage = (spent / limit_amount * 100) if limit_amount else 0
            result.append({
                "id": b["id"],
                "category": b["category"],
                "limit_amount": limit_amount,
                "spent": spent,
                "remaining": remaining,
                "percentage": round(percentage, 2)
            })

        db.close()
        return jsonify(result), 200

    except Exception as e:
        print("\n--- GET BUDGETS ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# DELETE BUDGET
# ---------------------------------------------------
@app.route("/delete_budget/<int:budget_id>", methods=["DELETE"])
def delete_budget(budget_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM budget WHERE id=?", (budget_id,))
        db.commit()
        db.close()
        return jsonify({"message": "Budget deleted"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# UPDATE PASSWORD
# ---------------------------------------------------
@app.route("/update_password", methods=["PUT"])
def update_password():
    try:
        data = request.json
        user_id      = data.get("user_id")
        old_password = data.get("old_password")
        new_password = data.get("new_password")

        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("SELECT * FROM users WHERE id=? AND password=?", (user_id, old_password))
        user = cursor.fetchone()

        if not user:
            db.close()
            return jsonify({"error": "Current password is incorrect"}), 401

        cursor.execute("UPDATE users SET password=? WHERE id=?", (new_password, user_id))
        db.commit()
        db.close()
        return jsonify({"message": "Password updated successfully"}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# CLEAR ALL EXPENSES
# ---------------------------------------------------
@app.route("/clear_expenses/<int:user_id>", methods=["DELETE"])
def clear_expenses(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM expenses WHERE user_id=?", (user_id,))
        db.commit()
        db.close()
        return jsonify({"message": "All expenses cleared"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# CLEAR ALL INCOME
# ---------------------------------------------------
@app.route("/clear_income/<int:user_id>", methods=["DELETE"])
def clear_income(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM income WHERE user_id=?", (user_id,))
        db.commit()
        db.close()
        return jsonify({"message": "All income cleared"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# DELETE ACCOUNT
# ---------------------------------------------------
@app.route("/delete_account/<int:user_id>", methods=["DELETE"])
def delete_account(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        cursor.execute("DELETE FROM expenses WHERE user_id=?", (user_id,))
        cursor.execute("DELETE FROM income WHERE user_id=?", (user_id,))
        cursor.execute("DELETE FROM budget WHERE user_id=?", (user_id,))
        cursor.execute("DELETE FROM users WHERE id=?", (user_id,))
        db.commit()
        db.close()
        return jsonify({"message": "Account deleted"}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# CURRENT MONTH SPENDING BY CATEGORY
# ---------------------------------------------------
@app.route("/current_month_spending/<int:user_id>")
def current_month_spending(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        today = datetime.today()
        cursor.execute("""
            SELECT category, SUM(amount) AS total FROM expenses
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
            GROUP BY category
        """, (user_id, today.month, today.year))
        rows = cursor.fetchall()
        db.close()
        return jsonify({row["category"]: float(row["total"]) for row in rows}), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# AI BUDGET RECOMMENDATIONS
# ---------------------------------------------------
@app.route("/ai_budget_recommendations/<int:user_id>")
def ai_budget_recommendations(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        today = datetime.today()
        three_months_ago = today - timedelta(days=90)

        cursor.execute("""
            SELECT category,
                   SUM(amount) AS total,
                   COUNT(DISTINCT strftime('%Y-%m', date)) AS months_count
            FROM expenses
            WHERE user_id=? AND date >= ?
            GROUP BY category
        """, (user_id, three_months_ago.strftime('%Y-%m-%d')))
        rows = cursor.fetchall()
        db.close()

        if not rows:
            return jsonify({"recommendations": [], "months_analyzed": 0}), 200

        recommendations = []
        for row in rows:
            avg_monthly = float(row["total"]) / max(int(row["months_count"]), 1)
            recommended = avg_monthly * 1.10
            recommendations.append({
                "category": row["category"],
                "avg_monthly": round(avg_monthly, 2),
                "recommended": round(recommended, 2)
            })
        recommendations.sort(key=lambda x: x["recommended"], reverse=True)

        return jsonify({"recommendations": recommendations, "months_analyzed": 3}), 200

    except Exception as e:
        print("\n--- AI RECOMMENDATIONS ERROR ---")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# DASHBOARD INSIGHTS
# ---------------------------------------------------
@app.route("/dashboard_insights/<int:user_id>")
def dashboard_insights(user_id):
    try:
        db = get_db_connection()
        cursor = db.cursor()
        today = datetime.today()
        month, year = today.month, today.year
        last_month = month - 1 if month > 1 else 12
        last_year  = year if month > 1 else year - 1

        cursor.execute("""
            SELECT category, SUM(amount) AS total FROM expenses
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
            GROUP BY category
        """, (user_id, month, year))
        this_cats = {r["category"]: float(r["total"]) for r in cursor.fetchall()}

        cursor.execute("""
            SELECT category, SUM(amount) AS total FROM expenses
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
            GROUP BY category
        """, (user_id, last_month, last_year))
        last_cats = {r["category"]: float(r["total"]) for r in cursor.fetchall()}

        cursor.execute("""
            SELECT COALESCE(SUM(amount), 0) AS total FROM income
            WHERE user_id=?
              AND CAST(strftime('%m', date) AS INTEGER) = ?
              AND CAST(strftime('%Y', date) AS INTEGER) = ?
        """, (user_id, month, year))
        month_income = float(cursor.fetchone()["total"])
        db.close()

        total_spent = sum(this_cats.values())
        savings_rate = round((month_income - total_spent) / month_income * 100, 1) if month_income > 0 else 0

        top_category = max(this_cats, key=this_cats.get) if this_cats else None
        top_amount   = this_cats.get(top_category, 0) if top_category else 0

        tips = []
        for cat, amt in this_cats.items():
            last = last_cats.get(cat, 0)
            if last > 0:
                pct = (amt - last) / last * 100
                if pct > 20:
                    tips.append(f"Your {cat} spending is up {pct:.0f}% vs last month (£{amt:.0f} vs £{last:.0f}). Consider cutting back.")

        if savings_rate < 10 and month_income > 0:
            tips.append(f"You're saving only {savings_rate:.1f}% of your income this month — aim for at least 20%.")
        elif savings_rate >= 20:
            tips.append(f"Great job! You're saving {savings_rate:.1f}% of your income this month. Keep it up!")

        if not tips and top_category:
            tips.append(f"Your biggest spend this month is {top_category} (£{top_amount:.0f}). Check the Cost Guide for saving tips.")

        return jsonify({
            "savings_rate": savings_rate,
            "top_category": top_category,
            "top_amount": round(top_amount, 2),
            "category_breakdown": this_cats,
            "ai_tip": tips[0] if tips else None
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# AI TRIP PLANNER
# ---------------------------------------------------
TRIP_COSTS_DB = {
    "paris":      {"flight": (60, 130, 280),  "hotel": (45, 90,  180), "food": (22, 45, 85),  "activities": (12, 25, 55), "transport": (8, 12, 20)},
    "amsterdam":  {"flight": (50, 110, 250),  "hotel": (55, 100, 200), "food": (20, 40, 75),  "activities": (15, 28, 55), "transport": (6, 10, 18)},
    "rome":       {"flight": (70, 140, 300),  "hotel": (40, 85,  170), "food": (18, 38, 70),  "activities": (12, 25, 50), "transport": (5,  9, 15)},
    "barcelona":  {"flight": (65, 130, 280),  "hotel": (40, 80,  165), "food": (18, 36, 68),  "activities": (10, 22, 48), "transport": (6, 10, 16)},
    "prague":     {"flight": (55, 100, 220),  "hotel": (25, 55,  120), "food": (12, 25, 55),  "activities": (8,  18, 40), "transport": (4,  7, 12)},
    "berlin":     {"flight": (55, 110, 230),  "hotel": (35, 70,  150), "food": (15, 32, 60),  "activities": (10, 20, 45), "transport": (6,  9, 15)},
    "lisbon":     {"flight": (60, 120, 260),  "hotel": (35, 75,  155), "food": (15, 30, 60),  "activities": (8,  18, 40), "transport": (4,  8, 14)},
    "dublin":     {"flight": (40, 80,  180),  "hotel": (50, 95,  185), "food": (22, 42, 80),  "activities": (10, 22, 48), "transport": (5,  9, 15)},
    "madrid":     {"flight": (65, 130, 275),  "hotel": (38, 78,  158), "food": (16, 33, 63),  "activities": (9,  20, 44), "transport": (5,  9, 15)},
    "edinburgh":  {"flight": (30, 70,  150),  "hotel": (45, 85,  170), "food": (18, 36, 68),  "activities": (8,  18, 40), "transport": (4,  7, 12)},
    "budapest":   {"flight": (55, 100, 220),  "hotel": (22, 50,  115), "food": (10, 22, 50),  "activities": (6,  15, 35), "transport": (3,  6, 10)},
    "vienna":     {"flight": (60, 115, 240),  "hotel": (40, 82,  165), "food": (18, 36, 68),  "activities": (12, 24, 50), "transport": (5,  9, 14)},
    "athens":     {"flight": (80, 150, 300),  "hotel": (30, 65,  140), "food": (14, 28, 58),  "activities": (8,  18, 42), "transport": (4,  7, 12)},
    "krakow":     {"flight": (50, 95,  200),  "hotel": (20, 45,  100), "food": (8,  18, 42),  "activities": (5,  12, 30), "transport": (3,  5,  9)},
    "dubai":      {"flight": (200, 380, 750), "hotel": (55, 120, 280), "food": (20, 45, 100), "activities": (15, 35, 90), "transport": (7, 14, 28)},
    "bangkok":    {"flight": (350, 600,1100), "hotel": (20, 50,  130), "food": (8,  18, 45),  "activities": (8,  18, 45), "transport": (3,  6, 14)},
    "tokyo":      {"flight": (450, 700,1300), "hotel": (35, 80,  200), "food": (15, 30, 70),  "activities": (10, 22, 55), "transport": (5, 10, 18)},
    "new york":   {"flight": (300, 550,1000), "hotel": (80, 160, 350), "food": (25, 55, 110), "activities": (15, 35, 80), "transport": (8, 14, 25)},
    "cancun":     {"flight": (400, 650,1200), "hotel": (50, 110, 260), "food": (15, 32, 70),  "activities": (12, 28, 65), "transport": (5,  9, 18)},
    "milan":      {"flight": (65, 130, 270),  "hotel": (50, 100, 200), "food": (20, 40, 78),  "activities": (10, 22, 48), "transport": (5,  9, 15)},
    "default":    {"flight": (80, 160, 350),  "hotel": (40, 85,  175), "food": (15, 32, 65),  "activities": (10, 22, 50), "transport": (5, 10, 18)},
}

ORIGIN_REGION_MAP = {
    "bristol": "uk", "london": "uk", "manchester": "uk", "birmingham": "uk",
    "leeds": "uk", "glasgow": "uk", "edinburgh": "uk", "sheffield": "uk",
    "liverpool": "uk", "newcastle": "uk", "cardiff": "uk", "belfast": "uk",
    "united kingdom": "uk", "uk": "uk", "england": "uk", "scotland": "uk",
    "wales": "uk", "ireland": "uk", "dublin": "uk",
    "paris": "w_europe", "berlin": "w_europe", "madrid": "w_europe",
    "barcelona": "w_europe", "rome": "w_europe", "milan": "w_europe",
    "amsterdam": "w_europe", "lisbon": "w_europe", "vienna": "w_europe",
    "brussels": "w_europe", "zurich": "w_europe", "geneva": "w_europe",
    "france": "w_europe", "germany": "w_europe", "italy": "w_europe",
    "spain": "w_europe", "portugal": "w_europe", "netherlands": "w_europe",
    "prague": "e_europe", "budapest": "e_europe", "warsaw": "e_europe",
    "krakow": "e_europe", "bucharest": "e_europe", "athens": "e_europe",
    "sofia": "e_europe", "zagreb": "e_europe",
    "poland": "e_europe", "czech": "e_europe", "hungary": "e_europe",
    "greece": "e_europe", "romania": "e_europe",
    "dubai": "middle_east", "abu dhabi": "middle_east", "doha": "middle_east",
    "riyadh": "middle_east", "kuwait": "middle_east", "beirut": "middle_east",
    "uae": "middle_east", "qatar": "middle_east", "saudi": "middle_east",
    "bangkok": "se_asia", "singapore": "se_asia", "kuala lumpur": "se_asia",
    "bali": "se_asia", "jakarta": "se_asia", "hanoi": "se_asia",
    "ho chi minh": "se_asia", "manila": "se_asia", "myanmar": "se_asia",
    "thailand": "se_asia", "indonesia": "se_asia", "malaysia": "se_asia",
    "vietnam": "se_asia", "philippines": "se_asia",
    "india": "s_asia", "mumbai": "s_asia", "delhi": "s_asia",
    "bangalore": "s_asia", "chennai": "s_asia", "kolkata": "s_asia",
    "pakistan": "s_asia", "sri lanka": "s_asia", "nepal": "s_asia",
    "tokyo": "e_asia", "osaka": "e_asia", "kyoto": "e_asia",
    "beijing": "e_asia", "shanghai": "e_asia", "hong kong": "e_asia",
    "seoul": "e_asia", "busan": "e_asia", "taipei": "e_asia",
    "japan": "e_asia", "china": "e_asia", "south korea": "e_asia",
    "new york": "n_america", "los angeles": "n_america", "chicago": "n_america",
    "miami": "n_america", "toronto": "n_america", "montreal": "n_america",
    "cancun": "n_america", "mexico": "n_america", "usa": "n_america", "canada": "n_america",
    "brazil": "s_america", "sao paulo": "s_america", "rio": "s_america",
    "buenos aires": "s_america", "lima": "s_america", "bogota": "s_america",
    "cairo": "africa", "nairobi": "africa", "cape town": "africa",
    "johannesburg": "africa", "lagos": "africa", "marrakech": "africa",
    "egypt": "africa", "kenya": "africa", "south africa": "africa",
    "morocco": "africa", "nigeria": "africa",
    "sydney": "oceania", "melbourne": "oceania", "brisbane": "oceania",
    "auckland": "oceania", "australia": "oceania", "new zealand": "oceania",
}

FLIGHT_MULTIPLIERS = {
    ("uk",          "uk"):          0.3,
    ("uk",          "w_europe"):    1.0,
    ("uk",          "e_europe"):    0.9,
    ("uk",          "middle_east"): 1.3,
    ("uk",          "se_asia"):     1.8,
    ("uk",          "s_asia"):      1.6,
    ("uk",          "e_asia"):      2.2,
    ("uk",          "n_america"):   2.0,
    ("uk",          "s_america"):   2.5,
    ("uk",          "africa"):      1.5,
    ("uk",          "oceania"):     3.0,
    ("w_europe",    "w_europe"):    0.8,
    ("w_europe",    "e_europe"):    0.7,
    ("w_europe",    "middle_east"): 1.2,
    ("w_europe",    "se_asia"):     1.7,
    ("w_europe",    "e_asia"):      2.1,
    ("w_europe",    "n_america"):   1.9,
    ("e_europe",    "w_europe"):    0.8,
    ("e_europe",    "e_europe"):    0.6,
    ("e_europe",    "middle_east"): 1.1,
    ("middle_east", "middle_east"): 0.5,
    ("middle_east", "se_asia"):     0.9,
    ("middle_east", "e_asia"):      1.3,
    ("middle_east", "w_europe"):    1.2,
    ("middle_east", "n_america"):   1.8,
    ("se_asia",     "se_asia"):     0.4,
    ("se_asia",     "e_asia"):      0.7,
    ("se_asia",     "w_europe"):    1.8,
    ("se_asia",     "n_america"):   2.0,
    ("s_asia",      "s_asia"):      0.5,
    ("s_asia",      "w_europe"):    1.6,
    ("s_asia",      "se_asia"):     0.8,
    ("s_asia",      "n_america"):   2.1,
    ("e_asia",      "e_asia"):      0.5,
    ("e_asia",      "w_europe"):    2.1,
    ("e_asia",      "n_america"):   1.8,
    ("n_america",   "n_america"):   0.7,
    ("n_america",   "w_europe"):    1.9,
    ("n_america",   "s_america"):   1.0,
}

def get_region(city_str):
    s = city_str.strip().lower()
    for keyword, region in ORIGIN_REGION_MAP.items():
        if keyword in s:
            return region
    return "uk"

def get_dest_region(dest_key):
    eu_west  = {"paris","amsterdam","rome","barcelona","berlin","lisbon","madrid","milan","vienna"}
    eu_east  = {"prague","budapest","athens","krakow"}
    mid_east = {"dubai"}
    se_asia  = {"bangkok"}
    e_asia   = {"tokyo"}
    n_amer   = {"new york","cancun"}
    if dest_key in eu_west:     return "w_europe"
    if dest_key in eu_east:     return "e_europe"
    if dest_key in mid_east:    return "middle_east"
    if dest_key in se_asia:     return "se_asia"
    if dest_key in e_asia:      return "e_asia"
    if dest_key in n_amer:      return "n_america"
    if dest_key == "edinburgh": return "uk"
    if dest_key == "dublin":    return "uk"
    return "w_europe"

@app.route("/ai_trip_plan", methods=["POST"])
def ai_trip_plan():
    try:
        data        = request.json
        destination = data.get("destination", "").strip().lower()
        from_city   = data.get("from_city", "Bristol, UK").strip()
        days        = max(1, int(data.get("days", 3)))
        travellers  = max(1, int(data.get("travellers", 1)))
        style_idx   = max(0, min(2, int(data.get("style", 1))))

        costs        = None
        matched_name = destination.title() if destination else "Your Destination"
        matched_key  = "default"
        for key in TRIP_COSTS_DB:
            if key != "default" and (key in destination or destination.startswith(key)):
                costs        = TRIP_COSTS_DB[key]
                matched_name = key.title()
                matched_key  = key
                break
        if costs is None:
            costs = TRIP_COSTS_DB["default"]

        origin_region = get_region(from_city)
        dest_region   = get_dest_region(matched_key)
        flight_mult   = FLIGHT_MULTIPLIERS.get(
            (origin_region, dest_region),
            FLIGHT_MULTIPLIERS.get(("uk", dest_region), 1.0)
        )

        flight     = round(costs["flight"][style_idx]     * flight_mult * travellers, 2)
        hotel      = round(costs["hotel"][style_idx]      * days        * travellers, 2)
        food       = round(costs["food"][style_idx]       * days        * travellers, 2)
        activities = round(costs["activities"][style_idx] * days        * travellers, 2)
        transport  = round(costs["transport"][style_idx]  * days        * travellers, 2)

        subtotal = flight + hotel + food + activities + transport
        misc     = round(subtotal * 0.08, 2)
        total    = round(subtotal + misc, 2)

        style_names = ["Budget", "Mid-range", "Luxury"]
        tips = []
        if style_idx == 0:
            tips.append("Book flights 6–8 weeks early for the cheapest fares.")
            tips.append("Use public transport and self-cater some meals to stay on budget.")
        elif style_idx == 1:
            tips.append("Combo attraction tickets can save 20–30% on activities.")
            tips.append("Book accommodation mid-week for better rates.")
        else:
            tips.append("Consider travel insurance — it is worth it at this spending level.")
            tips.append("Look for loyalty programmes and travel cards to earn rewards.")

        daily_excl = round((total - flight) / days, 2)
        tips.append(f"Your daily cost excluding flights is approx £{daily_excl:.0f} per person — use this as your daily spending target.")

        return jsonify({
            "destination": matched_name,
            "from_city":   from_city,
            "days":        days,
            "travellers":  travellers,
            "style":       style_names[style_idx],
            "breakdown": {
                "Flights":          flight,
                "Accommodation":    hotel,
                "Food & Drinks":    food,
                "Activities":       activities,
                "Local Transport":  transport,
                "Misc / Emergency": misc,
            },
            "total": total,
            "tips":  tips,
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500


# ---------------------------------------------------
# RUN
# ---------------------------------------------------
if __name__ == "__main__":
    app.run(debug=True)
