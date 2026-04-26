# Personal Finance Tracker — Web Application

A student-focused personal finance tracking web app built with Python Flask, MySQL, and vanilla JavaScript. No bank integration required.

---

## How to Run

### Requirements
- Python 3.10 or newer
- MySQL Server 8.0 or newer
- MySQL Workbench (recommended for running the schema)

### Step 1 — Install Python

1. Download Python from [https://www.python.org/downloads/](https://www.python.org/downloads/)
2. Run the installer — **tick "Add Python to PATH"** before clicking Install
3. Open a new Command Prompt and verify:
```
py --version
```

### Step 2 — Install required packages

```
py -m pip install flask flask-cors werkzeug
```

### Step 3 — Start the app

```
py app.py
```

The database is created automatically — no MySQL, no password, no extra setup needed.

### Step 4 — Open the app

```
http://127.0.0.1:5000
```

Register a new account and you are ready to go.

---

## File Structure

```
finance-tracker/
├── main.html           ← Landing page
├── login.html          ← Login
├── register.html       ← Register / Sign up
├── dashboard.html      ← Financial dashboard with charts
├── expenses.html       ← Log and manage expenses
├── income.html         ← Log and manage income
├── budgets.html        ← Budget manager + AI Trip Planner
├── costguide.html      ← AI Grocery Planner + price guide
├── settings.html       ← Profile, notifications, export, account
├── css/                ← All stylesheets
├── js/                 ← All JavaScript modules
│   ├── notif-bell.js   ← Universal in-app notification bell
│   ├── dashboard.js
│   ├── expenses.js
│   ├── income.js
│   ├── budgets.js
│   ├── costguide.js
│   └── settings.js
├── app.py              ← Flask backend (all API routes)
└── db.py               ← MySQL database connection
```

---

## Features

- **Authentication** — Register and login with hashed passwords
- **Expense Tracking** — Log, view, filter, and delete expenses by category
- **Income Tracking** — Log and manage income sources
- **Budget Management** — Set monthly category budgets with visual progress bars and overspend alerts
- **Dashboard** — Pie chart and bar chart visualisations of spending
- **AI Trip Budget Planner** — Enter your origin city and destination for a personalised travel cost estimate
- **AI Grocery Planner** — Enter a weekly budget and get an optimised shopping list
- **In-App Notifications** — Automatic budget alerts, overspend warnings, and weekly summaries via the bell icon
- **CSV Export** — Download all your income and expense data
- **Dark Mode** — Full dark theme support across all pages
- **Responsive Design** — Works on desktop and mobile screens
- **Settings** — Edit profile, change password, manage notifications, delete account

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/register` | Create new user account |
| POST | `/login` | Authenticate user |
| GET | `/expenses/<user_id>` | Get all expenses for user |
| POST | `/add_expense` | Add new expense |
| DELETE | `/delete_expense/<id>` | Delete an expense |
| GET | `/income/<user_id>` | Get all income for user |
| POST | `/add_income` | Add new income entry |
| DELETE | `/delete_income/<id>` | Delete an income entry |
| GET | `/budgets/<user_id>` | Get budgets with current month spending |
| POST | `/add_budget` | Create or update a budget |
| DELETE | `/delete_budget/<id>` | Delete a budget |
| POST | `/ai_trip_plan` | Generate AI trip cost estimate |
| POST | `/ai_grocery_plan` | Generate AI grocery shopping list |
| PUT | `/update_password` | Change user password |
| DELETE | `/clear_expenses/<user_id>` | Delete all expenses for user |
| DELETE | `/clear_income/<user_id>` | Delete all income for user |
| DELETE | `/delete_account/<user_id>` | Delete user account and all data |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Charts | Chart.js (CDN) |
| PDF Export | jsPDF (CDN) |
| Backend | Python Flask |
| Database | MySQL |
| Password Hashing | werkzeug.security |

---

## Notes for Markers

- The `.env` file stores your local MySQL password — **do not share it publicly**
- The `.env.example` file shows the required format — copy it to `.env` and fill in your password
- The `schema.sql` file creates all database tables — run it once in MySQL Workbench before starting the app
- No API keys or internet connection are required — all AI features are rule-based and run locally

---

## Developer

**Hsu Si** — UWE Bristol, UXCFXK-30-3 Digital Systems Project