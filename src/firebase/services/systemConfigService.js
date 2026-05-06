// src/firebase/services/systemConfigService.js

// Reads and writes /systemConfig/general — the admin's System Settings page
// (Figure 11 in the SRS).

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebaseConfig";
import { COLLECTIONS, createSystemConfigDoc } from "../schema";

const CONFIG_DOC_ID = "general";
const configRef     = () => doc(db, COLLECTIONS.SYSTEM_CONFIG, CONFIG_DOC_ID);

/**
 * Reads the system configuration document.
 * Returns default values if the document doesn't exist yet.
 *
 * @returns {Promise<Object>}
 */
export async function getSystemConfig() {
  const snap = await getDoc(configRef());
  if (!snap.exists()) {
    // First time — return defaults without writing to Firestore yet
    return createSystemConfigDoc();
  }
  return { id: snap.id, ...snap.data() };
}

/**
 * Saves the entire system configuration.
 * Uses setDoc (merge: true) so partial objects are safe.
 *
 * @param {Object} config
 * @returns {Promise<void>}
 */
export async function saveSystemConfig(config) {
  await setDoc(configRef(), { ...config, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Updates individual fields within the system configuration.
 *
 * @param {Object} changes
 * @returns {Promise<void>}
 */
export async function updateSystemConfig(changes) {
  await updateDoc(configRef(), { ...changes, updatedAt: serverTimestamp() });
}