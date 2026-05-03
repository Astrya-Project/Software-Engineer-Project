import React, { useState } from "react";
import "./BudgetTracking.css";

export default function BudgetTracking() {
    const [totalBudget, setTotalBudget] = useState("");
    const [expense, setExpense] = useState("");
    const [remaining, setRemaining] = useState("");

    const calculateBudget = () => {
        const total = parseFloat(totalBudget);
        const total = parseFloat(expense);

        if (isNaN(total) || isNaN(spent)) {
            alert("Please enter valid number");
            return;
        }

        setRemaining(total - spent);
    };

    return (
        <div className="container">
            <h2>Budget Tracker</h2>

            <input
            type="number"
            placeholder="Total Budget"
            value={totalBudget}
            onChange={(e) => setTotalBudget(e.target.value)}
            />

            <input
            type="number"
            placeholder="Expense Amount"
            value={expense}
            onChange={(e) => setExpense(e.target.value)}
            />

            <button onClick={calculateBudget}>
                Calculate Remaining Budget
            </button>

            {remaining !== "" && (
                <p>Remaining Budget: ${remaining}</p>
            )}
        </div>
    );
}