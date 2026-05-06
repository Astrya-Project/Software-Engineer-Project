// src/firebase/services/messageService.js

// All Firestore reads and writes for /events/{eventId}/messages/{messageId}.
// Messages are append-only (no update/delete per security rules).

import {
  doc,
  getDocs,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db }               from "../firebaseConfig";
import { COLLECTIONS, createMessageDoc } from "../schema";

const messagesRef = (eventId) =>
  collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.MESSAGES);

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Sends a new message in an event's conversation thread.
 *
 * @param {string} eventId
 * @param {string} senderId    - Firebase Auth UID
 * @param {string} senderName  - Display name (denormalised)
 * @param {string} senderRole  - User role at time of send
 * @param {string} text        - Message body
 * @returns {Promise<string>}  New message document ID.
 */
export async function sendMessage(eventId, senderId, senderName, senderRole, text) {
  const docData = createMessageDoc(eventId, senderId, {
    senderName,
    senderRole,
    text,
  });
  const ref = await addDoc(messagesRef(eventId), docData);
  return ref.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * One-time fetch of all messages for an event, sorted oldest-first.
 *
 * @param {string} eventId
 * @returns {Promise<Object[]>}
 */
export async function getMessages(eventId) {
  const q    = query(messagesRef(eventId), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Real-time subscription ───────────────────────────────────────────────────

/**
 * Subscribes to the message stream for an event.
 * The callback is invoked with the full sorted message array on every change.
 *
 * USAGE in a React component:
 *   useEffect(() => {
 *     const unsub = subscribeToMessages(eventId, setMessages);
 *     return () => unsub();   // cleanup on unmount
 *   }, [eventId]);
 *
 * @param {string}   eventId
 * @param {Function} callback  - Receives (messages: Object[])
 * @returns {Function}  Unsubscribe function — call it on component unmount.
 */
export function subscribeToMessages(eventId, callback) {
  const q = query(messagesRef(eventId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(messages);
  });
}