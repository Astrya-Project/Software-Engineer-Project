// src/firebase/services/vendorService.js

// All Firestore reads and writes for /vendors/{vendorId}.

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

import { db }              from "../firebaseConfig";
import { COLLECTIONS, createVendorDoc } from "../schema";

const vendorsRef = () => collection(db, COLLECTIONS.VENDORS);
const vendorRef  = (vendorId) => doc(db, COLLECTIONS.VENDORS, vendorId);

// ─── Create ───────────────────────────────────────────────────────────────────

/**
 * Adds a new vendor to the shared directory.
 *
 * @param {Object} vendorData
 * @returns {Promise<string>}  New vendor document ID.
 */
export async function addVendor(vendorData) {
  const docData = createVendorDoc(vendorData);
  const ref     = await addDoc(vendorsRef(), docData);
  return ref.id;
}

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Fetches a single vendor.
 *
 * @param {string} vendorId
 * @returns {Promise<Object|null>}
 */
export async function getVendorById(vendorId) {
  const snap = await getDoc(vendorRef(vendorId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

/**
 * Fetches all active vendors, sorted by highest-rated.
 *
 * @returns {Promise<Object[]>}
 */
export async function getAllVendors() {
  const q    = query(vendorsRef(), where("isActive", "==", true), orderBy("rating", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Fetches active vendors within a specific category.
 *
 * @param {string} category  - One of VENDOR_CATEGORIES.*
 * @returns {Promise<Object[]>}
 */
export async function getVendorsByCategory(category) {
  const q = query(
    vendorsRef(),
    where("category", "==", category),
    where("isActive", "==", true),
    orderBy("rating", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ─── Update ───────────────────────────────────────────────────────────────────

/**
 * Partially updates a vendor document.
 *
 * @param {string} vendorId
 * @param {Object} changes
 * @returns {Promise<void>}
 */
export async function updateVendor(vendorId, changes) {
  await updateDoc(vendorRef(vendorId), { ...changes, updatedAt: serverTimestamp() });
}

/**
 * Increments a vendor's eventsCompleted counter.
 *
 * @param {string} vendorId
 * @returns {Promise<void>}
 */
export async function incrementEventsCompleted(vendorId) {
  const vendor = await getVendorById(vendorId);
  if (!vendor) return;
  await updateDoc(vendorRef(vendorId), {
    eventsCompleted: (vendor.eventsCompleted || 0) + 1,
    updatedAt:       serverTimestamp(),
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Soft-deletes a vendor by setting isActive = false.
 * Keeps the record for historical budget item references.
 *
 * @param {string} vendorId
 * @returns {Promise<void>}
 */
export async function deactivateVendor(vendorId) {
  await updateDoc(vendorRef(vendorId), { isActive: false, updatedAt: serverTimestamp() });
}

/**
 * Hard-deletes a vendor document.  Admin only.
 *
 * @param {string} vendorId
 * @returns {Promise<void>}
 */
export async function deleteVendor(vendorId) {
  await deleteDoc(vendorRef(vendorId));
}