// =====================================================
// HISTORY 12 - STORAGE MODULE
// Module: STORAGE
// [ST-001] LocalStorage manager for user progress
// Purpose: Save, load, update and clear learning progress & quiz results
// =====================================================

const STORAGE_KEYS = {
  PROGRESS: 'history12_progress',
  QUIZ_RESULTS: 'history12_quiz_results',
  PREFERENCES: 'history12_preferences'
};

/**
 * [ST-002] Safe get item from LocalStorage
 * Input: key (string)
 * Output: parsed value or null
 */
function safeGet(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Storage read error for ${key}:`, error);
    return null;
  }
}

/**
 * [ST-003] Safe set item to LocalStorage
 * Input: key (string), value (any)
 * Output: boolean success
 */
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Storage write error for ${key}:`, error);
    return false;
  }
}

/**
 * [ST-004] Get learning progress for an event
 * Input: eventId (string)
 * Output: progress object or null
 */
export function getProgress(eventId) {
  const allProgress = safeGet(STORAGE_KEYS.PROGRESS) || {};
  return allProgress[eventId] || null;
}

/**
 * [ST-005] Update learning progress for an event
 * Input: eventId (string), progressData (object)
 * Output: boolean success
 */
export function updateProgress(eventId, progressData) {
  const allProgress = safeGet(STORAGE_KEYS.PROGRESS) || {};
  allProgress[eventId] = {
    ...allProgress[eventId],
    ...progressData,
    lastUpdated: new Date().toISOString()
  };
  return safeSet(STORAGE_KEYS.PROGRESS, allProgress);
}

/**
 * [ST-006] Mark event as viewed/learned
 * Input: eventId (string)
 * Output: boolean success
 */
export function markEventViewed(eventId) {
  return updateProgress(eventId, { viewed: true });
}

/**
 * [ST-007] Mark event as mastered
 * Input: eventId (string)
 * Output: boolean success
 */
export function markEventMastered(eventId) {
  return updateProgress(eventId, { mastered: true });
}

/**
 * [ST-008] Get all learning progress
 * Input: None
 * Output: progress object map
 */
export function getAllProgress() {
  return safeGet(STORAGE_KEYS.PROGRESS) || {};
}

/**
 * [ST-009] Save quiz result
 * Input: examId (string), result (object)
 * Output: boolean success
 */
export function saveQuizResult(examId, result) {
  const allResults = safeGet(STORAGE_KEYS.QUIZ_RESULTS) || [];
  allResults.push({
    examId,
    ...result,
    timestamp: new Date().toISOString()
  });
  return safeSet(STORAGE_KEYS.QUIZ_RESULTS, allResults);
}

/**
 * [ST-010] Get all quiz results
 * Input: None
 * Output: array of result objects
 */
export function getAllQuizResults() {
  return safeGet(STORAGE_KEYS.QUIZ_RESULTS) || [];
}

/**
 * [ST-011] Get best score for an exam type
 * Input: examId (string)
 * Output: best score number or null
 */
export function getBestScore(examId) {
  const results = getAllQuizResults();
  const filtered = results.filter(r => r.examId === examId);
  if (filtered.length === 0) return null;
  return Math.max(...filtered.map(r => r.score || 0));
}

/**
 * [ST-012] Get user preferences
 * Input: None
 * Output: preferences object
 */
export function getPreferences() {
  return safeGet(STORAGE_KEYS.PREFERENCES) || {
    lastSection: 'timeline',
    learningMode: 'basic',
    showExplanations: true
  };
}

/**
 * [ST-013] Update user preference
 * Input: key (string), value (any)
 * Output: boolean success
 */
export function updatePreference(key, value) {
  const prefs = getPreferences();
  prefs[key] = value;
  return safeSet(STORAGE_KEYS.PREFERENCES, prefs);
}

/**
 * [ST-014] Clear all stored data
 * Input: None
 * Output: boolean success
 */
export function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Storage clear error:', error);
    return false;
  }
}

/**
 * [ST-015] Check if LocalStorage is available
 * Input: None
 * Output: boolean
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    console.warn('LocalStorage not available:', error);
    return false;
  }
}
