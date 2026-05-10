import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./BudgetTracking.css";

import {
  addBudgetItem,
  getBudgetItemsByEvent,
  deleteBudgetItem,
  updateBudgetItem,
  getBudgetSummary,
} from "../firebase/services/budgetService";

export default function BudgetTracking() {
  const { eventId } = useParams();
  const [totalBudget, setTotalBudget] = useState(1000);
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    loadBudget();
  }, []);

  async function loadBudget() {
    try {
      const data = await getBudgetItemsByEvent(eventId);
      setItems(data);

      const summaryData = await getBudgetSummary(
        eventId,
        totalBudget
      );

      setSummary(summaryData);

    } catch (err) {
      console.error(err);
      alert("Failed to load budget data.");
    }
  }

  async function handleAddItem() {
    if (!name || !amount) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      await addBudgetItem(eventId, {
        name,
        category,
        allocatedAmount: parseFloat(amount),
        actualAmount: parseFloat(amount),
      });

      setName("");
      setCategory("");
      setAmount("");

      loadBudget();

    } catch (err) {
      console.error(err);
      alert("Failed to add budget item.");
    }
  }

  async function handleDelete(itemId) {
    try {
      await deleteBudgetItem(eventId, itemId);
      loadBudget();

    } catch (err) {
      console.error(err);
      alert("Failed to delete budget item.");
    }
  }

  async function handleEdit(item) {
    const newAmount = prompt(
      "Enter updated amount:",
      item.actualAmount
    );

    if (!newAmount) return;

    try {
      await updateBudgetItem(eventId, item.id, {
        actualAmount: parseFloat(newAmount),
      });

      loadBudget();

    } catch (err) {
      console.error(err);
      alert("Failed to update budget item.");
    }
  }

  return (
    <div className="container">

      <h2>Budget Tracker</h2>

      {/* Total Budget */}
      <input
        type="number"
        placeholder="Total Budget"
        value={totalBudget}
        onChange={(e) =>
          setTotalBudget(parseFloat(e.target.value))
        }
      />

      {/* Expense Name */}
      <input
        type="text"
        placeholder="Expense Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* Category */}
      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      {/* Amount */}
      <input
        type="number"
        placeholder="Expense Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      {/* Add Button */}
      <button onClick={handleAddItem}>
        Add Expense
      </button>

      {/* Expense List */}
      <div className="expense-list">

        {items.length === 0 ? (
          <p>No budget items yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="expense-item">

              <div>
                <strong>{item.name}</strong>
                <br />

                Category: {item.category || "Uncategorized"}
                <br />

                Amount: ${item.actualAmount}
              </div>

              <div className="expense-buttons">

                <button onClick={() => handleEdit(item)}>
                  Edit
                </button>

                <button onClick={() => handleDelete(item.id)}>
                  Delete
                </button>

              </div>

            </div>
          ))
        )}

      </div>

      {/* Budget Summary */}
      {summary && (
        <div className="summary">

          <h3>Total Budget: ${summary.totalBudget}</h3>

          <h3>Total Spent: ${summary.totalSpent}</h3>

          <h3>Remaining Budget: ${summary.remaining}</h3>

          <h3>Budget Used: {summary.percentUsed}%</h3>

        </div>
      )}

    </div>
  );
}