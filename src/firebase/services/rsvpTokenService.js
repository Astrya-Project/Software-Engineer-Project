// src/firebase/services/rsvpTokenService.js

// Manages one-time invite tokens stored in /rsvpTokens/{token}.
// Each token is a UUID v4 that gets embedded in the guest's invite email link:
//   https://your-app.web.app/rsvp?token=<uuid>

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";   // npm install uuid

import { db } from "../firebaseConfig";
import { COLLECTIONS, createRsvpTokenDoc } from "../schema";

const tokenRef = (token) => doc(db, COLLECTIONS.RSVP_TOKENS, token);

/**
 * Creates a new RSVP invite token for a guest.
 *
 * @param {string} eventId
 * @param {string} guestId
 * @param {Date|null} expiresAt  - Optional JS Date; pass null for no expiry.
 * @returns {Promise<string>}    The UUID token string.
 */
export async function createRsvpToken(eventId, guestId, expiresAt = null) {
  const token   = uuidv4();
  const docData = createRsvpTokenDoc(eventId, guestId, {
    expiresAt: expiresAt ? expiresAt : null,
  });
  await setDoc(tokenRef(token), docData);
  return token;
}

/**
 * Looks up a token document.
 * Returns null if the token does not exist, is already used, or has expired.
 *
 * @param {string} token
 * @returns {Promise<Object|null>}
 */
export async function resolveRsvpToken(token) {
  const snap = await getDoc(tokenRef(token));
  if (!snap.exists()) return null;

  const data = snap.data();

  if (data.used) return null;

  if (data.expiresAt) {
    const expiry = data.expiresAt.toDate?.() ?? new Date(data.expiresAt);
    if (new Date() > expiry) return null;
  }

  return { token, ...data };
}

/**
 * Marks a token as used once the guest has submitted their RSVP.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function markTokenUsed(token) {
  await updateDoc(tokenRef(token), { used: true });
}

/**
 * Deletes a token document.  Call after it has been used and is no longer needed.
 *
 * @param {string} token
 * @returns {Promise<void>}
 */
export async function deleteRsvpToken(token) {
  await deleteDoc(tokenRef(token));
}