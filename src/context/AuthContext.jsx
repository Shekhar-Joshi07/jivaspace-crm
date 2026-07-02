import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TOKEN_KEY, USER_KEY } from '../api/axios';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const AUTH_ENTRY_PATHS = new Set(['/login', '/register']);

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const { pathname } = useLocation();
  const hasToken = Boolean(localStorage.getItem(TOKEN_KEY) || localStorage.getItem('token'));
  const isAuthEntryPage = AUTH_ENTRY_PATHS.has(pathname);
  const [user, setUser] = useState(readStoredUser);
  const [bootstrapping, setBootstrapping] = useState(hasToken && !isAuthEntryPage);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const saveSession = useCallback(result => {
    localStorage.setItem(TOKEN_KEY, result.token);
    localStorage.setItem(USER_KEY, JSON.stringify(result.user));
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(result.user);
  }, []);

  useEffect(() => {
    let active = true;
    const validateSession = async () => {
      if (!hasToken || isAuthEntryPage) {
        setBootstrapping(false);
        return;
      }
      setBootstrapping(true);
      try {
        const currentUser = await authService.me();
        if (active) {
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          setUser(currentUser);
        }
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setBootstrapping(false);
      }
    };
    validateSession();
    return () => { active = false; };
  }, [clearSession, hasToken, isAuthEntryPage]);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setBootstrapping(false);
    };
    window.addEventListener('crm:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('crm:unauthorized', handleUnauthorized);
  }, [clearSession]);

  const login = async credentials => {
    const result = await authService.login(credentials);
    saveSession(result);
    return result.user;
  };

  const register = async payload => {
    const result = await authService.register(payload);
    saveSession(result);
    return result.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // A local logout must still succeed if the API is unavailable.
    } finally {
      clearSession();
    }
  };

  const updateCurrentUser = nextUser => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const value = useMemo(() => ({
    user,
    bootstrapping,
    isAuthenticated: Boolean(user),
    login,
    register,
    logout,
    updateCurrentUser,
    hasRole: (...roles) => roles.includes(user?.role)
  }), [user, bootstrapping]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};
