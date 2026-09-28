import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, 
  HardDrive, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  User, 
  LogOut, 
  UploadCloud, 
  DownloadCloud, 
  ChevronDown,
  Database,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function StorageModeSelector({ currentAppData, onApplyServerData }) {
  const { 
    user, 
    isAuthenticated, 
    storageMode, 
    setStorageMode, 
    openAuthModal, 
    logout, 
    syncStatus, 
    syncError,
    pushToServer, 
    pullFromServer,
    tursoStatus
  } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const menuRef = useRef(null);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleMode = (newMode) => {
    if (newMode === 'server' && !isAuthenticated) {
      openAuthModal();
      return;
    }
    setStorageMode(newMode);
    setMenuOpen(false);
  };

  const handlePushToServer = async () => {
    if (!currentAppData) return;
    setFeedback('در حال ارسال به سرور...');
    const res = await pushToServer(currentAppData);
    if (res.success) {
      setFeedback('اطلاعات با موفقیت در سرور Turso ذخیره شد.');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(res.error || 'خطا در ارسال به سرور');
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  const handlePullFromServer = async () => {
    setFeedback('در حال دریافت از سرور...');
    const res = await pullFromServer();
    if (res.success) {
      if (res.data && onApplyServerData) {
        onApplyServerData(res.data);
      }
      setFeedback('اطلاعات با موفقیت از سرور دریافت و بروز شد.');
      setTimeout(() => setFeedback(''), 3000);
    } else {
      setFeedback(res.error || 'خطا در دریافت از سرور');
      setTimeout(() => setFeedback(''), 4000);
    }
  };

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.5rem' }} ref={menuRef}>
      {/* Mode Switcher Pill */}
      <div 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.04))',
          border: '1px solid var(--border-color)',
          borderRadius: '9999px',
          padding: '2px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Local mode button */}
        <button
          type="button"
          onClick={() => handleToggleMode('local')}
          title="ذخیره محلی داده‌ها در مرورگر (آفلاین)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: storageMode === 'local' ? 600 : 400,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: storageMode === 'local' 
              ? 'rgba(16, 185, 129, 0.18)' 
              : 'transparent',
            color: storageMode === 'local' 
              ? 'var(--accent-green, #10b981)' 
              : 'var(--text-muted)',
            transition: 'all 0.2s ease',
          }}
        >
          <HardDrive size={13} />
          <span>مرورگر</span>
        </button>

        {/* Server mode button */}
        <button
          type="button"
          onClick={() => handleToggleMode('server')}
          title={isAuthenticated ? 'ذخیره ابری روی سرور ورسل و دیتابیس Turso' : 'ورود و فعال‌سازی ذخیره روی سرور'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: storageMode === 'server' ? 600 : 400,
            border: 'none',
            cursor: 'pointer',
            backgroundColor: storageMode === 'server' 
              ? 'rgba(168, 85, 247, 0.2)' 
              : 'transparent',
            color: storageMode === 'server' 
              ? 'var(--accent-purple, #a855f7)' 
              : 'var(--text-muted)',
            transition: 'all 0.2s ease',
          }}
        >
          <Cloud size={13} />
          <span>سرور (Turso)</span>
        </button>
      </div>

      {/* Sync Action Button (Visible when in server mode or logged in) */}
      {isAuthenticated && (
        <button
          type="button"
          onClick={handlePushToServer}
          disabled={syncStatus === 'syncing'}
          title="همگام‌سازی و ذخیره آنی در سرور Turso"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.05))',
            border: '1px solid var(--border-color)',
            color: syncStatus === 'error' ? '#ef4444' : syncStatus === 'synced' ? '#10b981' : 'var(--text-secondary)',
            cursor: syncStatus === 'syncing' ? 'wait' : 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {syncStatus === 'syncing' ? (
            <RefreshCw size={14} className="spin-animation" />
          ) : syncStatus === 'synced' ? (
            <Check size={14} />
          ) : syncStatus === 'error' ? (
            <AlertCircle size={14} />
          ) : (
            <RefreshCw size={14} />
          )}
        </button>
      )}

      {/* User Button / Modal Trigger */}
      {!isAuthenticated ? (
        <button
          type="button"
          onClick={openAuthModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.4rem 0.75rem',
            backgroundColor: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '8px',
            color: 'var(--accent-purple, #a855f7)',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <User size={14} />
          <span>ورود / اتصال به سرور</span>
        </button>
      ) : (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.35rem 0.65rem',
              backgroundColor: 'var(--bg-card, rgba(255, 255, 255, 0.05))',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-purple, #a855f7)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.72rem',
              fontWeight: 700
            }}>
              {(user?.fullName || user?.username || 'ک')[0]}
            </div>
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.fullName || user?.username}
            </span>
            <ChevronDown size={14} color="var(--text-muted)" />
          </button>

          {/* User Menu Dropdown */}
          {menuOpen && (
            <div 
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '260px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                padding: '0.6rem',
                zIndex: 1000,
                direction: 'rtl'
              }}
            >
              {/* User info */}
              <div style={{ padding: '0.5rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.4rem' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {user?.fullName || user?.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  نام کاربری: @{user?.username}
                </div>
                <div style={{
                  marginTop: '0.4rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '2px 6px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  backgroundColor: storageMode === 'server' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: storageMode === 'server' ? 'var(--accent-purple, #a855f7)' : 'var(--accent-green, #10b981)'
                }}>
                  {storageMode === 'server' ? <Cloud size={10} /> : <HardDrive size={10} />}
                  حالت ذخیره: {storageMode === 'server' ? 'سرور ابری' : 'حافظه محلی مرورگر'}
                </div>

                <div style={{
                  marginTop: '0.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)'
                }}>
                  <ShieldCheck size={13} style={{ flexShrink: 0 }} />
                  <span>رمزنگاری سرتاسری ۲۵۶ بیتی (E2EE) فعال</span>
                </div>
              </div>

              {/* Status or Turso check */}
              <div style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Database size={13} color="var(--accent-purple, #a855f7)" />
                  <span>وضعیت پایگاه داده:</span>
                  <span style={{ 
                    fontWeight: 600, 
                    color: tursoStatus.configured ? '#10b981' : '#f59e0b' 
                  }}>
                    {tursoStatus.configured ? 'متصل به Turso' : 'تنظیم نشده در ورسل'}
                  </span>
                </div>
              </div>

              {/* Push local data to server */}
              <button
                type="button"
                onClick={handlePushToServer}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <UploadCloud size={15} color="var(--accent-purple, #a855f7)" />
                <span>ارسال اطلاعات مرورگر به سرور (Upload)</span>
              </button>

              {/* Pull server data to local */}
              <button
                type="button"
                onClick={handlePullFromServer}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  textAlign: 'right',
                  transition: 'background 0.15s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <DownloadCloud size={15} color="#3b82f6" />
                <span>دریافت آخرین اطلاعات از سرور (Download)</span>
              </button>

              {/* Feedback alert if any */}
              {feedback && (
                <div style={{
                  margin: '0.4rem 0.3rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#60a5fa',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {feedback}
                </div>
              )}

              {/* Logout */}
              <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.4rem', paddingTop: '0.4rem' }}>
                <button
                  type="button"
                  onClick={() => { logout(); setMenuOpen(false); }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'none',
                    color: '#ef4444',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textAlign: 'right',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={15} />
                  <span>خروج از حساب</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
