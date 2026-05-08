// src/firebase/services/userService.js

// All Firestore reads and writes that involve /users/{userId}.
//
// USAGE (from a React component or another service):
//   import { createUser, getUserById, updateUser } from './userService';

import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db }           from "../firebaseConfig";
import { COLLECTIONS, createUserDoc } from "../schema";

const usersRef = () => collection(db, COLLECTIONS.USERS);
const userRef  = (uid) => doc(db, COLLECTIONS.USERS, uid);

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Writes a new user document.  Called from the auth sign-up flow so that
 * every Firebase Auth account has a corresponding Firestore profile.
 *
 * @param {string} uid        - Firebase Auth UID
 * @param {Object} userData   - Fields to merge into the default user shape
 * @returns {Promise<void>}
 */
export async function createUser(uid, userData) {
  const docData = createUserDoc(userData);
  await setDoc(userRef(uid), docData);
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a single user document by UID.
 *
 * @param {string} uid
 * @returns {Promise<Object|null>}  The document data, or null if not found.
 */
export async function getUserById(uid) {
  const snap = await getDoc(userRef(uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetches all users.  Admin-only (enforced by Firestore security rules).
 *
 * @returns {Promise<Object[]>}
 */
export async function getAllUsers() {
  const snap = await getDocs(query(usersRef(), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetches users filtered by role.
 *
 * @param {string} role  - One of USER_ROLES.*
 * @returns {Promise<Object[]>}
 */
export async function getUsersByRole(role) {
  const q    = query(usersRef(), where("role", "==", role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Partially updates a user document.  Only the fields in `changes` are touched.
 *
 * @param {string} uid
 * @param {Object} changes
 * @returns {Promise<void>}
 */
export async function updateUser(uid, changes) {
  await updateDoc(userRef(uid), { ...changes, updatedAt: serverTimestamp() });
}

/**
 * Records the user's last login timestamp.
 * Call this after a successful Firebase Auth sign-in.
 *
 * @param {string} uid
 * @returns {Promise<void>}
 */
export async function touchLastLogin(uid) {
  await updateDoc(userRef(uid), { lastLoginAt: serverTimestamp() });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Soft-deletes a user by setting isActive = false.
 * Preserves audit history while blocking login access.
 *
 * @param {string} uid
 * @returns {Promise<void>}
 */
export async function deactivateUser(uid) {
  await updateDoc(userRef(uid), { isActive: false, updatedAt: serverTimestamp() });
}

/**
 * Hard-deletes a user document.  Admin-only.
 * Does NOT delete the Firebase Auth account — call auth.deleteUser() separately.
 *
 * @param {string} uid
 * @returns {Promise<void>}
 */
export async function deleteUserDoc(uid) {
  await deleteDoc(userRef(uid));
}