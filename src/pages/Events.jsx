import { useEffect, useState } from "react";
import { auth } from "../firebase/firebaseConfig";
import { getEventsByOwner } from "../firebase/services/eventService";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./Events.css";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const data = await getEventsByOwner(user.uid);
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="container">
      <h2>Your Events</h2>

      <button onClick={() => navigate("/event-creation")}>
        + Create Event
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : events.length === 0 ? (
        <p>No events yet.</p>
      ) : (
        events.map((event) => {
          let eventDate = "No date";

          if (event.date) {
            if (event.date.seconds) {
              eventDate = new Date(event.date.seconds * 1000).toLocaleDateString();
            } else {
              eventDate = new Date(event.date).toLocaleDateString();
            }
          }

          return (
            <div key={event.id} className="event-item">
              <strong>{event.title || "Untitled Event"}</strong>
              <br />
              {eventDate}
            </div>
          );
        })
      )}
    </div>
  );
}