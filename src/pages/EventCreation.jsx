import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { createEvent } from "../firebase/services/eventService";
import "./EventCreation.css";

export default function EventCreation() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    const user = auth.currentUser;

    if (!user) {
      setError("You must be logged in.");
      return;
    }

    if (!title || !date) {
      setError("Title and date are required.");
      return;
    }

    try {
      const eventId = await createEvent(user.uid, {
        title,
        description,
        date: new Date(date),
      });

      navigate(`/events/${eventId}`);
    } catch {
      setError("Failed to create event.");
    }
  };

  return (
    <div className="container">
      <h2>Create Event</h2>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <button type="submit">Create Event</button>
      </form>

      {error && <p className="error">{error}</p>}
    </div>
  );
}