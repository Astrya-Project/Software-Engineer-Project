// src/firebase/services/budgetService.js

// All Firestore reads and writes for /events/{eventId}/budgetItems/{itemId}.

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
  collectionGroup,
  serverTimestamp,
} from "firebase/firestore";
 
import { db }              from "../firebaseConfig";
import { COLLECTIONS, createBudgetItemDoc } from "../schema";
import { updateEventSpend }                  from "./eventService";
 
const budgetRef     = (eventId) =>
  collection(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.BUDGET_ITEMS);
 
const budgetItemRef = (eventId, itemId) =>
  doc(db, COLLECTIONS.EVENTS, eventId, COLLECTIONS.BUDGET_ITEMS, itemId);
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
/**
 * Recalculates the sum of all actualAmounts for an event and updates the
 * denormalised totalSpent field on the parent event document.
 *
 * Call this after every create/update/delete of a budget item.
 *
 * @param {string} eventId
 * @returns {Promise<number>}  The new total.
 */
async function recalcTotalSpent(eventId) {
  const items   = await getBudgetItemsByEvent(eventId);
  const total   = items.reduce((sum, i) => sum + (i.actualAmount || 0), 0);
  await updateEventSpend(eventId, total);
  return total;
}
 
// ─── Create ───────────────────────────────────────────────────────────────────
 
/**
 * Adds a new expense line item to an event.
 *
 * @param {string} eventId
 * @param {Object} itemData  - name, category, vendorId, allocatedAmount, actualAmount, etc.
 * @returns {Promise<string>}  New document ID.
 */
export async function addBudgetItem(eventId, itemData) {
  const docData = createBudgetItemDoc(eventId, itemData);
  const ref     = await addDoc(budgetRef(eventId), docData);
  await recalcTotalSpent(eventId);
  return ref.id;
}
 
// ─── Read ─────────────────────────────────────────────────────────────────────
 
/**
 * Fetches a single budget item.
 *
 * @param {string} eventId
 * @param {string} itemId
 * @returns {Promise<Object|null>}
 */
export async function getBudgetItemById(eventId, itemId) {
  const snap = await getDoc(budgetItemRef(eventId, itemId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}
 
/**
 * Fetches all budget items for an event, ordered by creation date.
 *
 * @param {string} eventId
 * @returns {Promise<Object[]>}
 */
export async function getBudgetItemsByEvent(eventId) {
  const q    = query(budgetRef(eventId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
 
/**
 * Fetches budget items grouped by category for a given event.
 * Returns a map: { [category]: Object[] }
 *
 * @param {string} eventId
 * @returns {Promise<Object>}
 */
export async function getBudgetByCategory(eventId) {
  const items = await getBudgetItemsByEvent(eventId);
  return items.reduce((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});
}
 
/**
 * Calculates a budget summary object.
 *
 * @param {string} eventId
 * @param {number} totalBudget  - The event's overall budget cap.
 * @returns {Promise<Object>}   { totalBudget, totalAllocated, totalSpent, remaining, percentUsed, byCategory }
 */
export async function getBudgetSummary(eventId, totalBudget) {
  const items          = await getBudgetItemsByEvent(eventId);
  const totalAllocated = items.reduce((s, i) => s + (i.allocatedAmount || 0), 0);
  const totalSpent     = items.reduce((s, i) => s + (i.actualAmount    || 0), 0);
  const remaining      = totalBudget - totalSpent;
  const percentUsed    = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
 
  const byCategory = items.reduce((acc, i) => {
    const cat = i.category || "other";
    if (!acc[cat]) acc[cat] = { allocated: 0, spent: 0, items: [] };
    acc[cat].allocated += i.allocatedAmount || 0;
    acc[cat].spent     += i.actualAmount    || 0;
    acc[cat].items.push(i);
    return acc;
  }, {});
 
  return { totalBudget, totalAllocated, totalSpent, remaining, percentUsed, byCategory };
}
 
// ─── Update ───────────────────────────────────────────────────────────────────
 
/**
 * Updates a budget item and recalculates the event's totalSpent.
 *
 * @param {string} eventId
 * @param {string} itemId
 * @param {Object} changes
 * @returns {Promise<void>}
 */
export async function updateBudgetItem(eventId, itemId, changes) {
  await updateDoc(budgetItemRef(eventId, itemId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
  await recalcTotalSpent(eventId);
}
 
/**
 * Marks a budget item as paid.
 *
 * @param {string} eventId
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function markAsPaid(eventId, itemId) {
  await updateBudgetItem(eventId, itemId, { isPaid: true });
}
 
// ─── Delete ───────────────────────────────────────────────────────────────────
 
/**
 * Removes a budget item and recalculates the event's totalSpent.
 *
 * @param {string} eventId
 * @param {string} itemId
 * @returns {Promise<void>}
 */
export async function deleteBudgetItem(eventId, itemId) {
  await deleteDoc(budgetItemRef(eventId, itemId));
  await recalcTotalSpent(eventId);
}