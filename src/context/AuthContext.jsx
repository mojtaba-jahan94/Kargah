import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getStoredAuthSession, 
  saveStoredAuthSession, 
  clearStoredAuthSession, 
  getSavedStorageMode, 
  setSavedStorageMode,
  getLastSyncTime,
  setLastSyncTime
} from '../data/storage';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  fetchServerData, 
  saveServerData, 
  checkServerStatus 
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children, onServerDataLoaded, getCurrentAppState }) {
  const [session, setSession] = useState(() => getStoredAuthSession());
  const [storageMode, setMode] = useState(() => getSavedStorageMode()); // 'local' | 'server'
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'synced' | 'error'
  const [syncError, setSyncError] = useState(null);
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());
  const [tursoStatus, setTursoStatus] = useState({ configured: null, status: 'checking', message: '' });

  const user = session.user;
  const token = session.token;
  const isAuthenticated = !!(token && user);

  // Check Turso status on mount
  useEffect(() => {
    checkServerStatus()
      .then(res => setTursoStatus(res))
      .catch(() => setTursoStatus({ configured: false, status: 'offline', message: 'عدم ارتباط با سرور' }));
  }, []);

  // Validate session on mount
  useEffect(() => {
    async function validateSession() {
      if (token) {
        try {
          const res = await getCurrentUser(token);
          if (res?.user) {
            setSession({ token, user: res.user });
            saveStoredAuthSession(token, res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid, reverting to local guest mode', err);
          clearStoredAuthSession();
          setSession({ token: null, user: null });
        }
      }
      setIsAuthLoading(false);
    }
    validateSession();
  }, [token]);

  // Set storage mode
  const handleSetStorageMode = (newMode) => {
    if (newMode === 'server' && !isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }
    setMode(newMode);
    setSavedStorageMode(newMode);
  };

  // Login handler
  const login = async (username, password) => {
    setSyncStatus('idle');
    setSyncError(null);
    try {
      const res = await loginUser(username, password);
      saveStoredAuthSession(res.token, res.user);
      setSession({ token: res.token, user: res.user });
      setIsAuthModalOpen(false);

      // Prompt to load data from server
      try {
        const serverData = await fetchServerData(res.token);
        if (serverData.found && onServerDataLoaded) {
          onServerDataLoaded(serverData);
          setLastSync(serverData.updatedAt || new Date().toISOString());
          setLastSyncTime(serverData.updatedAt);
        }
      } catch (err) {
        console.warn('Could not auto-fetch server data on login', err);
      }

      return { success: true };
    } catch (err) {
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Register handler
  const register = async ({ username, password, fullName, email, uploadCurrentData }) => {
    setSyncStatus('idle');
    setSyncError(null);
    try {
      const initialData = uploadCurrentData && getCurrentAppState ? getCurrentAppState() : null;
      const res = await registerUser({ username, password, fullName, email, initialData });
      
      saveStoredAuthSession(res.token, res.user);
      setSession({ token: res.token, user: res.user });
      setIsAuthModalOpen(false);

      if (initialData) {
        const now = new Date().toISOString();
        setLastSync(now);
        setLastSyncTime(now);
      }

      return { success: true };
    } catch (err) {
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    clearStoredAuthSession();
    setSession({ token: null, user: null });
    handleSetStorageMode('local');
    setSyncStatus('idle');
    setSyncError(null);
  };

  // Manual Push to Server
  const pushToServer = useCallback(async (dataToSync) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'ابتدا وارد حساب کاربری شوید' };
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const res = await saveServerData(token, dataToSync);
      const now = res.updatedAt || new Date().toISOString();
      setLastSync(now);
      setLastSyncTime(now);
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return { success: true };
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [token]);

  // Manual Pull from Server
  const pullFromServer = useCallback(async () => {
    if (!token) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'ابتدا وارد حساب کاربری شوید' };
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const res = await fetchServerData(token);
      if (res.found && onServerDataLoaded) {
        onServerDataLoaded(res);
        const now = res.updatedAt || new Date().toISOString();
        setLastSync(now);
        setLastSyncTime(now);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
        return { success: true, data: res };
      } else {
        setSyncStatus('idle');
        return { success: true, message: 'داده‌ای روی سرور وجود ندارد' };
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, onServerDataLoaded]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAuthLoading,
        storageMode,
        setStorageMode: handleSetStorageMode,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        syncStatus,
        syncError,
        lastSync,
        tursoStatus,
        login,
        register,
        logout,
        pushToServer,
        pullFromServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
