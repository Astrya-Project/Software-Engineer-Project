// src/firebase/services/eventService.js

// Firestore reads and writes for /events/{eventId}

import {
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { COLLECTIONS, createEventDoc } from "../schema";

const eventsRef = () => collection(db, COLLECTIONS.EVENTS);
const eventRef = (eventId) => doc(db, COLLECTIONS.EVENTS, eventId);

// Create a new event
export async function createEvent(ownerId, data) {
  const docData = createEventDoc(ownerId, data);
  const ref = await addDoc(eventsRef(), docData);
  return ref.id;
}

// Get single event by ID
export async function getEventById(eventId) {
  const snap = await getDoc(eventRef(eventId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Get all events for a specific owner (newest first)
export async function getEventsByOwner(ownerId) {
  const q = query(eventsRef(), where("ownerId", "==", ownerId), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get all events (optionally filter by status)
export async function getAllEvents(status = null) {
  let q = query(eventsRef(), orderBy("date", "desc"));
  if (status) {
    q = query(eventsRef(), where("status", "==", status), orderBy("date", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Update event fields
export async function updateEvent(eventId, changes) {
  await updateDoc(eventRef(eventId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

// Adjust cached guest count (+1 or -1)
export async function adjustGuestCount(eventId, delta) {
  const event = await getEventById(eventId);
  if (!event) return;

  const newCount = Math.max(0, (event.guestCount || 0) + delta);

  await updateDoc(eventRef(eventId), {
    guestCount: newCount,
    updatedAt: serverTimestamp(),
  });
}

// Update total spent (after recalculating from budget items)
export async function updateEventSpend(eventId, newTotalSpent) {
  await updateDoc(eventRef(eventId), {
    totalSpent: newTotalSpent,
    updatedAt: serverTimestamp(),
  });
}

// Delete event (does NOT delete subcollections)
export async function deleteEvent(eventId) {
  await deleteDoc(eventRef(eventId));
}
