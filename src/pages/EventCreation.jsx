import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { auth } from "../firebase/firebaseConfig";
import { createEvent, getEventById, updateEvent } from "../firebase/services/eventService";
import "./EventCreation.css";

export default function EventCreation() {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      if (!eventId) return;
      setLoading(true);

      try {
        const event = await getEventById(eventId);
        if (!event) {
          setError("Event not found.");
          return;
        }

        setTitle(event.title || "");
        setDescription(event.description || "");

        if (event.date) {
          const rawDate = event.date.seconds
            ? new Date(event.date.seconds * 1000)
            : new Date(event.date);
          setDate(rawDate.toISOString().slice(0, 10));
        }
      } catch {
        setError("Unable to load event details.");
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
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
      if (eventId) {
        await updateEvent(eventId, {
          title,
          description,
          date: new Date(date),
        });
      } else {
        await createEvent({
          title,
          description,
          date: new Date(date),
        });
      }

      navigate("/events");
    } catch {
      setError(eventId ? "Failed to update event." : "Failed to create event.");
    }
  };

  const heading = eventId ? "Edit Event" : "Create Event";
  const submitLabel = eventId ? "Save Changes" : "Create Event";

  return (
    <div className="container">
      <h2>{heading}</h2>

      {loading ? (
        <p>Loading event...</p>
      ) : (
        <form onSubmit={handleSubmit}>
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

          <button type="submit">{submitLabel}</button>
        </form>
      )}

      {error && <p className="error">{error}</p>}
    </div>
  );
}