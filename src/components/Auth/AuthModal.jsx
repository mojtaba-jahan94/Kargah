import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Cloud, 
  Lock, 
  User, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    isAuthenticated,
    login, 
    register, 
    setStorageMode
  } = useAuth();

  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [uploadCurrentData, setUploadCurrentData] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If user is not authenticated, auth modal is strictly mandatory (gating)
  const isGated = !isAuthenticated;
  const isVisible = isAuthModalOpen || isGated;

  if (!isVisible) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password.length < 8) {
      setErrorMsg('رمز عبور برای امنیت بیشتر باید حداقل ۸ کاراکتر باشد.');
      return;
    }

    setLoading(true);

    try {
      if (activeTab === 'login') {
        const res = await login(username, password);
        if (res.success) {
          setSuccessMsg('با موفقیت وارد شدید!');
          setStorageMode('server');
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        } else {
          setErrorMsg(res.error || 'خطا در ورود به سیستم.');
        }
      } else {
        const res = await register({
          username,
          password,
          fullName,
          email,
          uploadCurrentData
        });
        if (res.success) {
          setSuccessMsg('حساب کاربری با موفقیت ساخته شد و وارد شدید!');
          setStorageMode('server');
          setTimeout(() => {
            closeAuthModal();
          }, 800);
        } else {
          setErrorMsg(res.error || 'خطا در ایجاد حساب کاربری.');
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'خطای غیرمنتظره در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const modalJSX = (
    <div className="modal-overlay" onClick={isGated ? undefined : closeAuthModal}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', direction: 'rtl' }}
      >
        {/* Header */}
        <div className="modal-header-fixed">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-purple, #a855f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cloud size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                {activeTab === 'login' ? 'ورود به سامانه کارگاه' : 'ایجاد حساب کاربری'}
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                ذخیره و همگام‌سازی امن اطلاعات در فضای ابری
              </p>
            </div>
          </div>

          {!isGated && (
            <button
              onClick={closeAuthModal}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.4rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          padding: '0.75rem 1.5rem 0',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'login' ? '2px solid var(--accent-purple, #a855f7)' : '2px solid transparent',
              color: activeTab === 'login' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'login' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <LogIn size={16} />
            ورود به حساب
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('register'); setErrorMsg(''); }}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'register' ? '2px solid var(--accent-purple, #a855f7)' : '2px solid transparent',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'register' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <UserPlus size={16} />
            ثبت‌نام جدید
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="modal-body-scrollable" style={{ padding: '1.25rem 1.5rem', gap: '1rem' }}>
          {errorMsg && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '8px',
              color: '#22c55e',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                نام و نام خانوادگی
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: نام شما"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.2rem 0.65rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input, rgba(255,255,255,0.05))',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              نام کاربری
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                placeholder="حداقل ۳ کاراکتر"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.2rem 0.65rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {activeTab === 'register' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                ایمیل <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(اختیاری)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.2rem 0.65rem 0.75rem',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-input, rgba(255,255,255,0.05))',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9rem',
                    direction: 'ltr',
                    textAlign: 'right',
                    outline: 'none'
                  }}
                />
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              رمز عبور <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(حداقل ۸ رقم/کاراکتر)</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                placeholder="حداقل ۸ کاراکتر"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 2.2rem 0.65rem 0.75rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-input, rgba(255,255,255,0.05))',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  direction: 'ltr',
                  textAlign: 'right',
                  outline: 'none'
                }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {activeTab === 'register' && (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              marginTop: '0.2rem'
            }}>
              <input
                type="checkbox"
                checked={uploadCurrentData}
                onChange={(e) => setUploadCurrentData(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--accent-purple, #a855f7)' }}
              />
              <span>ذخیره اطلاعات فعلی در حساب کاربری</span>
            </label>
          )}

          {/* E2EE Maximum Security Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            padding: '0.55rem 0.75rem',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '0.78rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.45'
          }}>
            <ShieldCheck size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              <strong style={{ color: '#10b981' }}>امنیت سرتاسری ۲۵۶ بیتی:</strong> کلیه اطلاعات قبل از ارسال، با رمز اختصاصی شما در مرورگر رمزگذاری می‌شوند و در سرور به شکل امن نگهداری خواهند شد.
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              padding: '0.75rem',
              backgroundColor: 'var(--accent-purple, #a855f7)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'opacity 0.2s',
              opacity: loading ? 0.8 : 1
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="spin-animation" />
                در حال برقراری ارتباط...
              </>
            ) : activeTab === 'login' ? (
              <>
                <LogIn size={18} />
                ورود به حساب کاربری
              </>
            ) : (
              <>
                <UserPlus size={18} />
                ثبت‌نام و ورود
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            سامانه مدیریت آموزشگاه و کارگاه هنری
          </span>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
