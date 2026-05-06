// src/firebase/schema.js

import { serverTimestamp } from "firebase/firestore";

// Collection names (use instead of raw strings)
export const COLLECTIONS = {
  USERS: "users",
  EVENTS: "events",
  GUESTS: "guests",
  BUDGET_ITEMS: "budgetItems",
  MESSAGES: "messages",
  VENDORS: "vendors",
  RSVP_TOKENS: "rsvpTokens",
  SYSTEM_CONFIG: "systemConfig",
};

// Enums for consistent values across the app
export const USER_ROLES = {
  ADMIN: "admin",
  PLANNER: "planner",
  CLIENT: "client",
  GUEST: "guest",
};

export const EVENT_STATUS = {
  PLANNING: "planning",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const EVENT_TYPES = {
  WEDDING: "wedding",
  BIRTHDAY: "birthday",
  CORPORATE: "corporate",
  ANNIVERSARY: "anniversary",
  OTHER: "other",
};

export const RSVP_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  DECLINED: "declined",
};

export const BUDGET_CATEGORIES = {
  VENUE: "venue",
  CATERING: "catering",
  PHOTOGRAPHY: "photography",
  DECORATIONS: "decorations",
  ENTERTAINMENT: "entertainment",
  FLOWERS: "flowers",
  TRANSPORTATION: "transportation",
  OTHER: "other",
};

export const VENDOR_CATEGORIES = {
  VENUE: "venue",
  CATERING: "catering",
  PHOTOGRAPHY: "photography",
  DECORATIONS: "decorations",
  ENTERTAINMENT: "entertainment",
  FLOWERS: "flowers",
  OTHER: "other",
};

// Creates a user document with safe defaults
export function createUserDoc(overrides = {}) {
  return {
    // Basic info
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    photoURL: "",

    // Access control
    role: USER_ROLES.CLIENT,
    isActive: true,

    // Timestamps
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),

    ...overrides,
  };
}

// Top-level event document
export function createEventDoc(ownerId, overrides = {}) {
  return {
    // Core info
    title: "",
    description: "",
    eventType: EVENT_TYPES.OTHER,
    status: EVENT_STATUS.PLANNING,

    // Scheduling
    date: null,
    startTime: "",
    endTime: "",
    dresscode: "",

    // Venue
    venueName: "",
    venueAddress: "",
    venueCity: "",
    venueState: "",
    venueZip: "",
    venueCoords: null,

    // Ownership
    ownerId,

    // Cached summary values (kept in sync elsewhere)
    totalBudget: 0,
    totalSpent: 0,
    guestCount: 0,

    // Media & schedule
    coverImageUrl: "",
    eventSchedule: [],

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ...overrides,
  };
}

// Guest inside an event
export function createGuestDoc(eventId, overrides = {}) {
  return {
    eventId, // needed for collection-group queries

    // Identity
    userId: null,
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",

    // RSVP info
    rsvpStatus: RSVP_STATUS.PENDING,
    plusOne: false,
    plusOneName: "",
    dietaryRestrictions: "",
    message: "",

    // Invite tracking
    inviteToken: "",
    inviteSentAt: null,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ...overrides,
  };
}

// Budget line item
export function createBudgetItemDoc(eventId, overrides = {}) {
  return {
    eventId,

    name: "",
    category: BUDGET_CATEGORIES.OTHER,
    vendorId: null,
    vendorName: "",

    // Financials
    allocatedAmount: 0,
    actualAmount: 0,
    isPaid: false,

    notes: "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ...overrides,
  };
}

// Chat message (immutable after creation)
export function createMessageDoc(eventId, senderId, overrides = {}) {
  return {
    eventId,
    senderId,
    senderName: "",
    senderRole: "",
    text: "",
    createdAt: serverTimestamp(),

    ...overrides,
  };
}

// Vendor directory entry
export function createVendorDoc(overrides = {}) {
  return {
    name: "",
    category: VENDOR_CATEGORIES.OTHER,
    contactName: "",
    email: "",
    phoneNumber: "",
    website: "",

    location: "",
    address: "",

    // Performance
    rating: 0,
    eventsCompleted: 0,
    isActive: true,

    notes: "",

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),

    ...overrides,
  };
}

// One-time RSVP token mapping
export function createRsvpTokenDoc(eventId, guestId, overrides = {}) {
  return {
    eventId,
    guestId,
    used: false,
    expiresAt: null,
    createdAt: serverTimestamp(),

    ...overrides,
  };
}

// Global system settings
export function createSystemConfigDoc(overrides = {}) {
  return {
    companyName: "Astrya's Events",
    companyEmail: "",
    companyPhone: "",
    businessAddress: "",
    timezone: "America/New_York",

    notifications: {
      emailOnNewRsvp: true,
      emailOnGuestChange: true,
      emailOnBudgetAlert: true,
    },

    updatedAt: serverTimestamp(),

    ...overrides,
  };
}
