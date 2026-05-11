import React, { useEffect, useMemo, useState } from "react";
import {
  addDoc, collection, deleteDoc, doc, onSnapshot,
  query, updateDoc, where
} from "firebase/firestore";
import { db } from "../firebase"; // adjust import based on your project

type RSVP = "pending" | "yes" | "no";

type Guest = {
  id: string;
  name: string;
  email: string;
  notes?: string;
  rsvpStatus: RSVP;
};

export default function GuestListManager({ eventId }: { eventId: string }) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const guestsRef = useMemo(
    () => collection(db, "events", eventId, "guests"),
    [eventId]
  );

  useEffect(() => {
    const q = query(guestsRef); // add filters with `where` later if needed
    const unsub = onSnapshot(q, (snap) => {
      setGuests(
        snap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          email: d.data().email,
          notes: d.data().notes ?? "",
          rsvpStatus: d.data().rsvpStatus ?? "pending",
        }))
      );
    });
    return unsub;
  }, [guestsRef]);

  async function handleAddGuest(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(guestsRef, {
      name: name.trim(),
      email: email.trim(),
      notes: notes.trim(),
      rsvpStatus: "pending" as RSVP,
      createdAt: new Date(),
    });

    setName("");
    setEmail("");
    setNotes("");
  }

  async function updateRsvp(guestId: string, status: RSVP) {
    await updateDoc(doc(guestsRef, guestId), { rsvpStatus: status });
  }

  async function removeGuest(guestId: string) {
    await deleteDoc(doc(guestsRef, guestId));
  }

  return (
    <div>
      <h2>Guest List</h2>

      <form onSubmit={handleAddGuest}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
        />
        <button type="submit">Add guest</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Guest</th>
            <th>Email</th>
            <th>Notes</th>
            <th>RSVP</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {guests.map((g) => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>{g.email}</td>
              <td>{g.notes}</td>
              <td>{g.rsvpStatus}</td>
              <td>
                <button onClick={() => updateRsvp(g.id, "yes")}>Yes</button>
                <button onClick={() => updateRsvp(g.id, "no")}>No</button>
                <button onClick={() => updateRsvp(g.id, "pending")}>Pending</button>
                <button onClick={() => removeGuest(g.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
