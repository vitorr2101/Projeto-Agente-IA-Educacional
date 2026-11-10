import Cookies from 'js-cookie';

const ACTIVE_SESSION_COOKIE = 'eduplan_active_session';
const SESSIONS_LIST_COOKIE = 'eduplan_sessions_list';
const SESSION_EXPIRY_DAYS = 30;

/**
 * Generate a clean context window / session ID for n8n
 * e.g.: edp_k8s9f1_m3p2
 */
export const generateSessionId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `edp_${timestamp}_${random}`;
};

/**
 * Get all active, non-decayed sessions
 */
export const getAllValidSessions = () => {
  try {
    const raw = Cookies.get(SESSIONS_LIST_COOKIE) || localStorage.getItem(SESSIONS_LIST_COOKIE);
    if (!raw) return [];

    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) return [];

    const now = Date.now();
    // Filter out decayed sessions (> 30 days)
    const validSessions = sessions.filter(s => s && s.expiresAt && s.expiresAt > now);

    // If any decayed sessions were removed, save the clean list back
    if (validSessions.length !== sessions.length) {
      persistSessionsList(validSessions);
    }

    return validSessions.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (e) {
    console.error('Error loading sessions list:', e);
    return [];
  }
};

/**
 * Persist sessions list to cookie and localStorage
 */
const persistSessionsList = (list) => {
  try {
    const serialized = JSON.stringify(list);
    Cookies.set(SESSIONS_LIST_COOKIE, serialized, { expires: SESSION_EXPIRY_DAYS, sameSite: 'lax' });
    localStorage.setItem(SESSIONS_LIST_COOKIE, serialized);
  } catch (e) {
    console.warn('Could not persist sessions list:', e);
  }
};

/**
 * Get currently active session ID or create a new one
 */
export const getActiveSessionId = () => {
  let activeId = Cookies.get(ACTIVE_SESSION_COOKIE);
  const validSessions = getAllValidSessions();

  if (activeId && validSessions.some(s => s.id === activeId)) {
    return activeId;
  }

  // If cookie exists in valid sessions or has valid list, pick latest or create
  if (validSessions.length > 0) {
    activeId = validSessions[0].id;
    Cookies.set(ACTIVE_SESSION_COOKIE, activeId, { expires: SESSION_EXPIRY_DAYS, sameSite: 'lax' });
    return activeId;
  }

  // Otherwise, create first session
  const newSession = createNewSession('Nova Conversa');
  return newSession.id;
};

/**
 * Create a new conversation session
 */
export const createNewSession = (title = 'Nova Conversa') => {
  const id = generateSessionId();
  const now = Date.now();
  const expiresAt = now + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const sessionObj = {
    id,
    title,
    createdAt: now,
    updatedAt: now,
    expiresAt,
    messageCount: 0,
    lastMessage: '',
    hasPlan: false,
  };

  const list = getAllValidSessions();
  const updatedList = [sessionObj, ...list.filter(s => s.id !== id)];
  persistSessionsList(updatedList);

  Cookies.set(ACTIVE_SESSION_COOKIE, id, { expires: SESSION_EXPIRY_DAYS, sameSite: 'lax' });
  return sessionObj;
};

/**
 * Switch active conversation session
 */
export const switchSession = (sessionId) => {
  const list = getAllValidSessions();
  const session = list.find(s => s.id === sessionId);
  if (session) {
    Cookies.set(ACTIVE_SESSION_COOKIE, sessionId, { expires: SESSION_EXPIRY_DAYS, sameSite: 'lax' });
    return session;
  }
  return null;
};

/**
 * Update session metadata and touch 30-day expiration
 */
export const updateSession = (sessionId, updates = {}) => {
  const list = getAllValidSessions();
  const now = Date.now();
  const expiresAt = now + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  const updatedList = list.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        ...updates,
        updatedAt: now,
        expiresAt,
      };
    }
    return s;
  });

  persistSessionsList(updatedList);
  Cookies.set(ACTIVE_SESSION_COOKIE, sessionId, { expires: SESSION_EXPIRY_DAYS, sameSite: 'lax' });
};

/**
 * Delete a session
 */
export const deleteSession = (sessionId) => {
  const list = getAllValidSessions().filter(s => s.id !== sessionId);
  persistSessionsList(list);

  // Clear messages and plan storage for this session
  try {
    localStorage.removeItem(`eduplan_msgs_${sessionId}`);
    localStorage.removeItem(`eduplan_plan_${sessionId}`);
  } catch (e) {
    // Ignore storage errors
  }

  // If deleted session was active, switch to next available or create new
  const currentActive = Cookies.get(ACTIVE_SESSION_COOKIE);
  if (currentActive === sessionId) {
    if (list.length > 0) {
      switchSession(list[0].id);
    } else {
      createNewSession('Nova Conversa');
    }
  }
};

/**
 * Save messages for a session
 */
export const saveSessionMessages = (sessionId, messages) => {
  try {
    localStorage.setItem(`eduplan_msgs_${sessionId}`, JSON.stringify(messages));
  } catch (e) {
    console.warn('Could not save messages to localStorage', e);
  }
};

/**
 * Load messages for a session
 */
export const loadSessionMessages = (sessionId) => {
  try {
    const raw = localStorage.getItem(`eduplan_msgs_${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Could not load messages from localStorage', e);
    return null;
  }
};

/**
 * Save rendered plan artifact for a session
 */
export const saveSessionPlan = (sessionId, plan) => {
  try {
    localStorage.setItem(`eduplan_plan_${sessionId}`, JSON.stringify(plan));
  } catch (e) {
    console.warn('Could not save plan to localStorage', e);
  }
};

/**
 * Load rendered plan artifact for a session
 */
export const loadSessionPlan = (sessionId) => {
  try {
    const raw = localStorage.getItem(`eduplan_plan_${sessionId}`);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('Could not load plan from localStorage', e);
    return null;
  }
};
