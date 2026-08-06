const PREFIX = 'omkr_';

export function readJSON(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function isQuotaExceededError(err) {
  return (
    err instanceof DOMException &&
    (err.code === 22 || err.code === 1014 || err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

/**
 * Returns true on success, false if the write failed (including quota
 * exceeded). Callers that need to tell the user should check the return
 * value themselves — this function never throws.
 */
export function writeJSON(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn(`Failed to persist "${key}" to localStorage`, err);
    }
    return false;
  }
}

export function removeKey(key) {
  window.localStorage.removeItem(PREFIX + key);
  window.sessionStorage.removeItem(PREFIX + key);
}

/**
 * "Remember Me" support for login sessions: when `remember` is true the
 * session is written to localStorage (survives browser restarts, the
 * existing default behaviour); when false it's written to sessionStorage
 * only (cleared when the tab/browser closes). Reads check both stores so a
 * session written either way round-trips through the same accessor.
 */
export function writeSessionValue(key, value, remember) {
  try {
    const store = remember ? window.localStorage : window.sessionStorage;
    const other = remember ? window.sessionStorage : window.localStorage;
    store.setItem(PREFIX + key, JSON.stringify(value));
    other.removeItem(PREFIX + key);
    return true;
  } catch (err) {
    if (import.meta.env?.DEV) {
      console.warn(`Failed to persist session "${key}"`, err);
    }
    return false;
  }
}

export function readSessionValue(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key) ?? window.sessionStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export const STORAGE_KEYS = {
  USERS: 'users',
  PROPERTIES: 'properties',
  NOTIFICATIONS: 'notifications',
  ENQUIRIES: 'enquiries',
  VISITS: 'visits',
  SESSION: 'session',
  FAVOURITES: 'favourites',
  RECENTLY_VIEWED: 'recently_viewed',
  AUDIT_LOG: 'audit_log',
  CMS: 'cms',
  MEDIA_RULES: 'media_rules',
  SEEDED: 'seeded_v2',
  LANGUAGE: 'language',
  WIZARD_DRAFT: 'wizard_draft',
  COMPARE: 'compare_properties',
  CALL_NOTES: 'call_notes',
  FOLLOW_UPS: 'follow_ups',
  INTERNAL_NOTES: 'internal_notes',
  SELECTED_LOCATION: 'selected_location',
  RECENT_LOCATIONS: 'recent_locations',
  WISHLIST: 'wishlist',
  GEO_PERMISSION: 'geo_permission',
  SAVED_SEARCHES: 'saved_searches',
};
