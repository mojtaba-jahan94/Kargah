import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  getStoredAuthSession, 
  saveStoredAuthSession, 
  clearStoredAuthSession, 
  getSavedStorageMode, 
  setSavedStorageMode,
  getLastSyncTime,
  setLastSyncTime,
  getStoredEncryptionPassphrase,
  saveStoredEncryptionPassphrase,
  clearStoredEncryptionPassphrase
} from '../data/storage';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  fetchServerData, 
  saveServerData, 
  checkServerStatus 
} from '../services/api';
import { encryptData, decryptData } from '../utils/crypto';

const AuthContext = createContext(null);

export function AuthProvider({ children, onServerDataLoaded, getCurrentAppState }) {
  const [session, setSession] = useState(() => getStoredAuthSession());
  const [passphrase, setPassphrase] = useState(() => getStoredEncryptionPassphrase());
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

  // Check backend database status on mount
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
          clearStoredEncryptionPassphrase();
          setSession({ token: null, user: null });
          setPassphrase(null);
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

  // Helper to decrypt server payload
  const decryptServerPayload = async (serverData, pass) => {
    if (!serverData) return null;
    const activePass = pass || passphrase || getStoredEncryptionPassphrase();
    return {
      ...serverData,
      locations: await decryptData(serverData.locations, activePass),
      students: await decryptData(serverData.students, activePass),
      payments: await decryptData(serverData.payments, activePass),
      settings: await decryptData(serverData.settings, activePass),
    };
  };

  // Login handler
  const login = async (username, password) => {
    setSyncStatus('idle');
    setSyncError(null);
    try {
      const res = await loginUser(username, password);
      saveStoredAuthSession(res.token, res.user);
      saveStoredEncryptionPassphrase(password);
      setSession({ token: res.token, user: res.user });
      setPassphrase(password);
      setIsAuthModalOpen(false);

      // Auto-load & decrypt data from server
      try {
        const rawServerData = await fetchServerData(res.token);
        if (rawServerData.found && onServerDataLoaded) {
          const decrypted = await decryptServerPayload(rawServerData, password);
          onServerDataLoaded(decrypted);
          setLastSync(decrypted.updatedAt || new Date().toISOString());
          setLastSyncTime(decrypted.updatedAt);
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
      let initialData = null;
      if (uploadCurrentData && getCurrentAppState) {
        const rawState = getCurrentAppState();
        // Client-side Encrypt before sending to server
        initialData = {
          locations: await encryptData(rawState.locations || [], password),
          students: await encryptData(rawState.students || [], password),
          payments: await encryptData(rawState.payments || [], password),
          settings: await encryptData(rawState.settings || {}, password),
        };
      }

      const res = await registerUser({ username, password, fullName, email, initialData });
      
      saveStoredAuthSession(res.token, res.user);
      saveStoredEncryptionPassphrase(password);
      setSession({ token: res.token, user: res.user });
      setPassphrase(password);
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
    clearStoredEncryptionPassphrase();
    setSession({ token: null, user: null });
    setPassphrase(null);
    handleSetStorageMode('local');
    setSyncStatus('idle');
    setSyncError(null);
  };

  // Manual Push to Server (Always Client-Side Encrypted)
  const pushToServer = useCallback(async (dataToSync) => {
    if (!token) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'ابتدا وارد حساب کاربری شوید' };
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const activePass = passphrase || getStoredEncryptionPassphrase();
      // Encrypt all data models before network transmission
      const encryptedPayload = {
        locations: await encryptData(dataToSync.locations || [], activePass),
        students: await encryptData(dataToSync.students || [], activePass),
        payments: await encryptData(dataToSync.payments || [], activePass),
        settings: await encryptData(dataToSync.settings || {}, activePass),
      };

      const res = await saveServerData(token, encryptedPayload);
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
  }, [token, passphrase]);

  // Manual Pull from Server (With Client-Side Decryption)
  const pullFromServer = useCallback(async () => {
    if (!token) {
      setIsAuthModalOpen(true);
      return { success: false, error: 'ابتدا وارد حساب کاربری شوید' };
    }

    setSyncStatus('syncing');
    setSyncError(null);
    try {
      const rawRes = await fetchServerData(token);
      if (rawRes.found && onServerDataLoaded) {
        const decrypted = await decryptServerPayload(rawRes);
        onServerDataLoaded(decrypted);
        const now = decrypted.updatedAt || new Date().toISOString();
        setLastSync(now);
        setLastSyncTime(now);
        setSyncStatus('synced');
        setTimeout(() => setSyncStatus('idle'), 3000);
        return { success: true, data: decrypted };
      } else {
        setSyncStatus('idle');
        return { success: true, message: 'داده‌ای روی سرور وجود ندارد' };
      }
    } catch (err) {
      setSyncStatus('error');
      setSyncError(err.message);
      return { success: false, error: err.message };
    }
  }, [token, passphrase, onServerDataLoaded]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAuthLoading,
        isE2EEActive: true,
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
