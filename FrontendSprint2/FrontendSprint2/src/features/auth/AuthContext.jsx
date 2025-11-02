import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const AUTH_KEYS = ['auth.access', 'auth.refresh', 'auth.user', 'auth.remember'];

const defaultState = {
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  user: null,
  remember: false,
};

function parseUser(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    return null;
  }
}

function readAuthFromStorage(storage) {
  if (typeof window === 'undefined' || !storage) {
    return null;
  }

  const accessToken = storage.getItem('auth.access');
  if (!accessToken) {
    return null;
  }

  return {
    isAuthenticated: true,
    accessToken,
    refreshToken: storage.getItem('auth.refresh'),
    user: parseUser(storage.getItem('auth.user')),
    remember: storage.getItem('auth.remember') === 'true',
  };
}

function loadPersistedAuth() {
  if (typeof window === 'undefined') {
    return { ...defaultState };
  }

  return readAuthFromStorage(window.localStorage) ??
    readAuthFromStorage(window.sessionStorage) ?? { ...defaultState };
}

const AuthContext = createContext({
  ...defaultState,
  setAuthSession: () => {},
  refreshAuthState: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => loadPersistedAuth());

  const refreshAuthState = useCallback(() => {
    setAuthState(loadPersistedAuth());
  }, []);

  const setAuthSession = useCallback((payload = {}, options = {}) => {
    setAuthState((prev) => {
      const next = {
        ...prev,
        ...defaultState,
        ...payload,
        remember:
          typeof options.remember === 'boolean'
            ? options.remember
            : payload.remember ?? prev.remember ?? false,
      };

      next.isAuthenticated = Boolean(next.accessToken);
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      AUTH_KEYS.forEach((key) => {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      });
    }
    setAuthState({ ...defaultState });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleStorage = (event) => {
      if (!event.key || AUTH_KEYS.includes(event.key)) {
        refreshAuthState();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshAuthState]);

  const value = useMemo(
    () => ({
      ...authState,
      setAuthSession,
      refreshAuthState,
      logout,
    }),
    [authState, logout, refreshAuthState, setAuthSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
