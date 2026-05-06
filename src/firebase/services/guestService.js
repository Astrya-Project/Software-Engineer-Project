// src/firebase/services/guestService.js

// All Firestore reads and writes for /events/{eventId}/guests/{guestId}.

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
  collectionGroup,
  serverTimestamp,
} from "firebase/firestore";

import { db }              from "../firebaseConfig";
import { COLLECTIONS, createGuestDoc, RSVP_STATUS } from "../schema";
import { adjustGuestCount }                          from "./eventService";

// Helper: reference to the guests sub-collection under a specific event
const guestsRef = (eventId) =>
  collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.GUESTS);

const guestRef = (eventId, guestId) =>
  doc(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.GUESTS, guestId);

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Adds a new guest to an event and increments the event's guestCount.
 *
 * @param {string} eventId
 * @param {Object} guestData  - firstName, lastName, email, phoneNumber, etc.
 * @returns {Promise<string>}  New guest document ID.
 */
export async function addGuest(eventId, guestData) {
  const docData = createGuestDoc(eventId, guestData);
  const ref     = await addDoc(guestsRef(eventId), docData);
  await adjustGuestCount(eventId, +1); 
  return ref.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a single guest document.
 *
 * @param {string} eventId
 * @param {string} guestId
 * @returns {Promise<Object|null>}
 */
export async function getGuestById(eventId, guestId) {
  const snap = await getDoc(guestRef(eventId, guestId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetches all guests for an event.
 *
 * @param {string} eventId
 * @returns {Promise<Object[]>}
 */
export async function getGuestsByEvent(eventId) {
  const snap = await getDocs(guestsRef(eventId));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetches guests for an event filtered by RSVP status.
 *
 * @param {string} eventId
 * @param {string} rsvpStatus  - One of RSVP_STATUS.*
 * @returns {Promise<Object[]>}
 */
export async function getGuestsByRsvpStatus(eventId, rsvpStatus) {
  const q    = query(guestsRef(eventId), where("rsvpStatus", "==", rsvpStatus));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Builds an RSVP summary object: { confirmed, declined, pending, total }.
 *
 * @param {string} eventId
 * @returns {Promise<Object>}
 */
export async function getRsvpSummary(eventId) {
  const guests = await getGuestsByEvent(eventId);
  const summary = { confirmed: 0, declined: 0, pending: 0, total: guests.length };
  guests.forEach((g) => {
    if      (g.rsvpStatus === RSVP_STATUS.CONFIRMED) summary.confirmed++;
    else if (g.rsvpStatus === RSVP_STATUS.DECLINED)  summary.declined++;
    else                                             summary.pending++;
  });
  return summary;
}

/**
 * Looks up which events a Firebase Auth user has been invited to.
 * Uses a collection-group query across all guests sub-collections.
 *
 * @param {string} userId  - Firebase Auth UID
 * @returns {Promise<Object[]>}  Array of guest records (each includes eventId).
 */
export async function getInvitationsByUser(userId) {
  const q    = query(collectionGroup(db, COLLECTIONS.GUESTS), where("userId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Looks up a guest record by their invite token.
 * Used in the RSVP flow when a guest clicks their invite link.
 *
 * @param {string} eventId
 * @param {string} token
 * @returns {Promise<Object|null>}
 */
export async function getGuestByToken(eventId, token) {
  const q    = query(guestsRef(eventId), where("inviteToken", "==", token));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Updates an existing guest's record.
 *
 * @param {string} eventId
 * @param {string} guestId
 * @param {Object} changes
 * @returns {Promise<void>}
 */
export async function updateGuest(eventId, guestId, changes) {
  await updateDoc(guestRef(eventId, guestId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Records an RSVP response.  Safe to call from an unauthenticated guest
 * (Firestore rules allow updates limited to RSVP fields).
 *
 * @param {string} eventId
 * @param {string} guestId
 * @param {Object} rsvpData  - { rsvpStatus, plusOne, plusOneName, dietaryRestrictions, message }
 * @returns {Promise<void>}
 */
export async function submitRsvp(eventId, guestId, rsvpData) {
  const allowed = {
    rsvpStatus:          rsvpData.rsvpStatus,
    plusOne:             rsvpData.plusOne             ?? false,
    plusOneName:         rsvpData.plusOneName         ?? "",
    dietaryRestrictions: rsvpData.dietaryRestrictions ?? "",
    message:             rsvpData.message             ?? "",
    updatedAt:           serverTimestamp(),
  };
  await updateDoc(guestRef(eventId, guestId), allowed);
}

/**
 * Links a guest record to a Firebase Auth account after the guest signs up.
 *
 * @param {string} eventId
 * @param {string} guestId
 * @param {string} userId   - The newly created Firebase Auth UID
 * @returns {Promise<void>}
 */
export async function linkGuestToUser(eventId, guestId, userId) {
  await updateDoc(guestRef(eventId, guestId), {
    userId:    userId,
    updatedAt: serverTimestamp(),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Removes a guest from an event and decrements the event's guestCount.
 *
 * @param {string} eventId
 * @param {string} guestId
 * @returns {Promise<void>}
 */
export async function removeGuest(eventId, guestId) {
  await deleteDoc(guestRef(eventId, guestId));
  await adjustGuestCount(eventId, -1);
}