import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById } from "../firebase/services/eventService";
import "./EventDetails.css";

export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const data = await getEventById(eventId);
        if (!data) {
          setError("Event not found.");
        } else {
          setEvent(data);
        }
      } catch (err) {
        setError("Failed to load event details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="container">
        <p>Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <p className="error">{error}</p>
        <button onClick={() => navigate("/events")}>Back to Events</button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container">
        <p>Event not found.</p>
        <button onClick={() => navigate("/events")}>Back to Events</button>
      </div>
    );
  }

  let eventDate = "No date";
  if (event.date) {
    if (event.date.seconds) {
      eventDate = new Date(event.date.seconds * 1000).toLocaleDateString();
    } else {
      eventDate = new Date(event.date).toLocaleDateString();
    }
  }

  return (
    <div className="container">
      <button className="back-btn" onClick={() => navigate("/events")}>
        ← Back to Events
      </button>

      <div className="event-detail-card">
        <h2>{event.title || "Untitled Event"}</h2>
        
        <div className="detail-item">
          <strong>Date:</strong>
          <p>{eventDate}</p>
        </div>

        <div className="detail-item">
          <strong>Description:</strong>
          <p>{event.description || "No description provided."}</p>
        </div>

        <div className="action-buttons">
          <button 
            className="btn-edit"
            onClick={() => navigate(`/event-creation/${eventId}`)}
          >
            Edit Event
          </button>
          <button 
            className="btn-budget"
            onClick={() => navigate(`/budget/${eventId}`)}
          >
            View Budget
          </button>
          <button 
            className="btn-guests"
            onClick={() => navigate(`/guests/${eventId}`)}
          >
            Manage Guests
          </button>
        </div>
      </div>
    </div>
  );
}
