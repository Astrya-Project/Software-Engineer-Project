import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import "./Guest List Management.css";

export default function GuestListManager({ eventId }) {
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const guestsRef = useMemo(
    () => collection(db, "events", eventId, "guests"),
    [eventId]
  );

  // Email validation
  const isValidEmail = (emailToCheck) => {
    if (!emailToCheck.trim()) return true; // Email is optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailToCheck);
  };

  // Check for duplicate email
  const isDuplicateEmail = (emailToCheck) => {
    if (!emailToCheck.trim()) return false;
    return guests.some(
      (g) => g.email.toLowerCase() === emailToCheck.toLowerCase()
    );
  };

  useEffect(() => {
    setLoading(true);
    const q = query(guestsRef);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setGuests(
          snap.docs.map((d) => ({
            id: d.id,
            name: d.data().name,
            email: d.data().email || "",
            notes: d.data().notes || "",
            rsvpStatus: d.data().rsvpStatus || "pending",
          }))
        );
        setLoading(false);
      },
      (err) => {
        console.error("Error loading guests:", err);
        setError("Failed to load guests");
        setLoading(false);
      }
    );
    return unsub;
  }, [guestsRef]);

  async function handleAddGuest(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!name.trim()) {
      setError("Guest name is required");
      return;
    }

    if (email.trim() && !isValidEmail(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    if (email.trim() && isDuplicateEmail(email.trim())) {
      setError("A guest with this email already exists");
      return;
    }

    try {
      setLoading(true);
      await addDoc(guestsRef, {
        name: name.trim(),
        email: email.trim(),
        notes: notes.trim(),
        rsvpStatus: "pending",
        createdAt: new Date(),
      });

      setName("");
      setEmail("");
      setNotes("");
      setSuccess("Guest added successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error adding guest:", err);
      setError("Failed to add guest. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function updateRsvp(guestId, status) {
    try {
      setError(null);
      await updateDoc(doc(guestsRef, guestId), { rsvpStatus: status });
      setSuccess(`RSVP updated to ${status}`);
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error("Error updating RSVP:", err);
      setError("Failed to update RSVP");
    }
  }

  async function removeGuest(guestId) {
    try {
      setError(null);
      await deleteDoc(doc(guestsRef, guestId));
      setDeleteConfirm(null);
      setSuccess("Guest removed successfully");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      console.error("Error removing guest:", err);
      setError("Failed to remove guest");
    }
  }

  const rsvpCounts = {
    yes: guests.filter((g) => g.rsvpStatus === "yes").length,
    no: guests.filter((g) => g.rsvpStatus === "no").length,
    pending: guests.filter((g) => g.rsvpStatus === "pending").length,
  };

  return (
    <div className="guest-list-container">
      <h2>Guest List Management</h2>

      {/* Alert Messages */}
      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success" role="alert">
          {success}
        </div>
      )}

      {/* Summary Stats */}
      <div className="guest-stats">
        <div className="stat-item">
          <strong>Total:</strong> {guests.length}
        </div>
        <div className="stat-item">
          <strong>Confirmed:</strong> {rsvpCounts.yes}
        </div>
        <div className="stat-item">
          <strong>Declined:</strong> {rsvpCounts.no}
        </div>
        <div className="stat-item">
          <strong>Pending:</strong> {rsvpCounts.pending}
        </div>
      </div>

      {/* Add Guest Form */}
      <form onSubmit={handleAddGuest} className="add-guest-form">
        <div className="form-group">
          <label htmlFor="guest-name">Guest Name *</label>
          <input
            id="guest-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter guest name"
            required
            disabled={loading}
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="guest-email">Email (Optional)</label>
          <input
            id="guest-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            disabled={loading}
            aria-describedby="email-hint"
          />
          <small id="email-hint">Used for sending RSVP links</small>
        </div>

        <div className="form-group">
          <label htmlFor="guest-notes">Notes (Optional)</label>
          <textarea
            id="guest-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Dietary restrictions, allergies, etc."
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? "Adding..." : "Add Guest"}
        </button>
      </form>

      {/* Guest List Table */}
      {loading && guests.length === 0 ? (
        <div className="loading">Loading guests...</div>
      ) : guests.length === 0 ? (
        <div className="empty-state">
          <p>No guests added yet. Add your first guest above!</p>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="guest-table">
            <thead>
              <tr>
                <th>Guest Name</th>
                <th>Email</th>
                <th>Notes</th>
                <th>RSVP Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((g) => (
                <tr key={g.id} className={`rsvp-${g.rsvpStatus}`}>
                  <td className="guest-name">{g.name}</td>
                  <td className="guest-email">{g.email || "-"}</td>
                  <td className="guest-notes" title={g.notes}>
                    {g.notes || "-"}
                  </td>
                  <td className="rsvp-status">
                    <span className={`badge badge-${g.rsvpStatus}`}>
                      {g.rsvpStatus}
                    </span>
                  </td>
                  <td className="actions">
                    <div className="action-buttons">
                      <button
                        onClick={() => updateRsvp(g.id, "yes")}
                        className="btn btn-sm btn-success"
                        aria-label={`Mark ${g.name} as confirmed`}
                        title="Confirm"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => updateRsvp(g.id, "no")}
                        className="btn btn-sm btn-danger"
                        aria-label={`Mark ${g.name} as declined`}
                        title="Decline"
                      >
                        No
                      </button>
                      <button
                        onClick={() => updateRsvp(g.id, "pending")}
                        className="btn btn-sm btn-warning"
                        aria-label={`Mark ${g.name} as pending`}
                        title="Pending"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(g.id)}
                        className="btn btn-sm btn-remove"
                        aria-label={`Remove ${g.name}`}
                        title="Remove guest"
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteConfirm(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Removal</h3>
            <p>
              Are you sure you want to remove{" "}
              <strong>{guests.find((g) => g.id === deleteConfirm)?.name}</strong>
              ? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => removeGuest(deleteConfirm)}
                className="btn btn-danger"
              >
                Remove Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
