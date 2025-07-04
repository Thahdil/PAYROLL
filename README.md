# Advanced Payroll Processing System

A full-stack payroll management platform built with Django REST Framework and React + Tailwind CSS. This system streamlines payroll workflows for organizations, supporting file uploads, manual incentive entry, payroll calculation, review/approval, archiving, and a complete audit trail.

## ✨ Features

### Employee & Payroll Data Management
* Upload employee master, incentive, and deduction files (`.csv`/`.xlsx`).
* Manual entry of incentives with remarks and attachments.

### Payroll Calculation & Review
* Automated payroll calculation (base salary + incentives - deductions).
* Detailed results table with breakdowns for each employee.

### Approval Workflow
* Approve or reject payroll results (with rejection reason).
* Status tracking: `Pending`, `Approved`, `Rejected`.

### Archiving & History
* Archive finalized payroll runs with custom or timestamped names.
* View and manage payroll history, including expandable details and deletion.

### Audit Trail
* Every payroll result and run is fully auditable with component-level snapshots.

### Modern UI/UX
* Responsive, animated, and professional interface using Tailwind CSS and `lucide-react` icons.
* Consistent, user-friendly upload experience with clear feedback.

## 🛠️ Tech Stack

* **Backend:** Django, Django REST Framework, pandas, openpyxl, django-filter, SQLite
* **Frontend:** React, Tailwind CSS, lucide-react, axios, Create React App

## 🚀 Getting Started

To get a local copy up and running, please follow these simple steps.

### Prerequisites

Make sure you have the following installed on your machine:
* Python & Pip
* Node.js & npm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
    ```
2.  **Navigate to the backend directory and install dependencies:**
    ```bash
    cd backend  # Or your backend folder name
    pip install -r requirements.txt
    python manage.py migrate
    ```
3.  **Navigate to the frontend directory and install dependencies:**
    ```bash
    cd ../frontend # Or your frontend folder name
    npm install
    ```
4.  **Run the servers:**
    * Start the Django backend server:
        ```bash
        python manage.py runserver
        ```
    * In a separate terminal, start the React frontend server:
        ```bash
        npm start
        ```

## 📋 Workflow

1.  **Upload** employee master, incentive, and deduction files.
2.  **Manually add** incentives if needed.
3.  **Calculate** payrolls and review results.
4.  **Approve or reject** each payroll result.
5.  **Archive** finalized payroll runs to history.
6.  **View and manage** payroll history with full audit details.

## 💡 Why Use This Project?

* **End-to-end payroll workflow** with real-world complexity.
* **Clean, modern, and user-friendly** UI/UX.
* **Robust backend** with data validation, audit trail, and approval logic.
* **Modular, extensible, and production-ready** architecture.

> **Perfect for:**
> HR/payroll departments, SaaS payroll products, or as a showcase of full-stack engineering skills.
