import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Settings, 
  Trash2, 
  Download, 
  Upload, 
  LogOut, 
  Sun, 
  Moon, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  ShieldCheck, 
  Cloud, 
  Database,
  Loader2,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function SettingsModal({
  isOpen,
  onClose,
  theme,
  toggleTheme,
  onExportData,
  onImportData,
  onClearAllData
}) {
  const { user, logout, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('data'); // 'data' | 'account' | 'appearance'
  
  // Clear Data confirmation state
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearSuccessMsg, setClearSuccessMsg] = useState('');

  // Delete Account confirmation state
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  if (!isOpen) return null;

  const handleExecuteClearData = () => {
    onClearAllData();
    setShowClearConfirm(false);
    setClearSuccessMsg('تمامی داده‌های نمونه و ذخیره‌شده با موفقیت پاک شدند و برنامه خام شد.');
    setTimeout(() => setClearSuccessMsg(''), 4000);
  };

  const handleExecuteDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError('لطفاً رمز عبور خود را وارد کنید.');
      return;
    }
    setDeleteLoading(true);
    setDeleteError('');

    try {
      const res = await deleteAccount(deletePassword);
      if (res.success) {
        onClose();
      } else {
        setDeleteError(res.error || 'خطا در حذف حساب کاربری.');
      }
    } catch (err) {
      setDeleteError(err.message || 'خطای غیرمنتظره در سرور.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '560px', direction: 'rtl' }}
      >
        {/* Modal Header */}
        <div className="modal-header-fixed">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-gold, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Settings size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                تنظیمات برنامه
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                مدیریت داده‌ها، حساب کاربری و تنظیمات سامانه
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
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
        </div>

        {/* Tabs Bar */}
        <div style={{
          display: 'flex',
          padding: '0.75rem 1.5rem 0',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'rgba(0, 0, 0, 0.1)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('data')}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'data' ? '2px solid var(--accent-gold, #f59e0b)' : '2px solid transparent',
              color: activeTab === 'data' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'data' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Database size={16} />
            مدیریت داده‌ها
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('account')}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'account' ? '2px solid var(--accent-gold, #f59e0b)' : '2px solid transparent',
              color: activeTab === 'account' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'account' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <User size={16} />
            حساب و امنیت
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            style={{
              flex: 1,
              padding: '0.65rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'appearance' ? '2px solid var(--accent-gold, #f59e0b)' : '2px solid transparent',
              color: activeTab === 'appearance' ? 'var(--text-primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'appearance' ? 600 : 400,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'all 0.15s ease'
            }}
          >
            <Sun size={16} />
            ظاهر برنامه
          </button>
        </div>

        {/* Tab Contents */}
        <div className="modal-body-scrollable" style={{ padding: '1.25rem 1.5rem', gap: '1.25rem' }}>
          
          {clearSuccessMsg && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(34, 197, 94, 0.12)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              borderRadius: '10px',
              color: '#22c55e',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <CheckCircle2 size={16} />
              <span>{clearSuccessMsg}</span>
            </div>
          )}

          {/* TAB 1: DATA MANAGEMENT */}
          {activeTab === 'data' && (
            <>
              {/* Wipe all data / Clean Demo */}
              <div style={{
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Trash2 size={18} color="#ef4444" />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    پاک کردن داده‌های نمونه و خالی کردن برنامه
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  اگر قصد دارید اطلاعات تستی و دمو را حذف کنید تا سامانه را به صورت خام و با هنرجویان و کلاس‌های واقعی خود شروع کنید، از این گزینه استفاده کنید.
                </p>

                {!showClearConfirm ? (
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(true)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.9rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s'
                    }}
                  >
                    <Trash2 size={15} />
                    حذف کل داده‌ها و شروع از صفر
                  </button>
                ) : (
                  <div style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '8px',
                    border: '1px dashed #ef4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.6rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>
                      <AlertTriangle size={16} />
                      <span>آیا از پاک کردن کامل داده‌ها اطمینان دارید؟</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                      این عملیات تمام هنرجویان، شعب و دریافتی‌ها را پاک می‌کند و قابل بازگشت نخواهد بود.
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.2rem' }}>
                      <button
                        type="button"
                        onClick={handleExecuteClearData}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        بله، پاک شود
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(false)}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: 'var(--bg-input, rgba(255,255,255,0.08))',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        انصراف
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Backup & Restore */}
              <div style={{
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem'
              }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  پشتیبان‌گیری و بازیابی داده‌ها
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
                  می‌توانید در هر زمان یک نسخه کامل پشتیبان از اطلاعات در قالب فایل JSON دانلود کنید یا فایلی را مجدداً بارگذاری نمایید.
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={onExportData}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.9rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Download size={15} />
                    دانلود فایل پشتیبان (Export)
                  </button>

                  <button
                    type="button"
                    onClick={onImportData}
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.9rem',
                      fontSize: '0.85rem'
                    }}
                  >
                    <Upload size={15} />
                    بازیابی از فایل پشتیبان (Import)
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: ACCOUNT & SECURITY */}
          {activeTab === 'account' && (
            <>
              {/* User profile card */}
              <div style={{
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    color: 'var(--accent-purple, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem',
                    fontWeight: 700
                  }}>
                    {user?.fullName ? user.fullName[0] : (user?.username ? user.username[0] : <User size={20} />)}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      {user?.fullName || user?.username}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
                      @{user?.username} {user?.email && `• ${user.email}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => { logout(); onClose(); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.8rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    color: '#ef4444',
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <LogOut size={15} />
                  خروج
                </button>
              </div>

              {/* Encryption & Cloud Status */}
              <div style={{
                padding: '0.9rem 1.1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.82rem',
                color: 'var(--text-secondary)'
              }}>
                <ShieldCheck size={20} color="#10b981" style={{ flexShrink: 0 }} />
                <span>
                  <strong>رمزنگاری سرتاسری AES-256 فعال است:</strong> اطلاعات شما پیش از ارسال به سرور با کلید اختصاصی رمزگذاری شده و روی سرور ذخیره می‌گردند.
                </span>
              </div>

              {/* Danger Zone: Delete Account */}
              <div style={{
                padding: '1.1rem',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                backgroundColor: 'rgba(239, 68, 68, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                  <AlertTriangle size={18} />
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                    حذف حساب کاربری از سرور
                  </h3>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                  با حذف حساب کاربری، نام کاربری و تمامی اطلاعات ذخیره شده در سرور به طور کامل و برای همیشه پاک خواهند شد.
                </p>

                {!showDeleteAccountModal ? (
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountModal(true)}
                    style={{
                      alignSelf: 'flex-start',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 0.9rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      borderRadius: '8px',
                      color: '#ef4444',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={15} />
                    حذف کامل حساب کاربری
                  </button>
                ) : (
                  <form onSubmit={handleExecuteDeleteAccount} style={{
                    padding: '0.85rem',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    borderRadius: '8px',
                    border: '1px dashed #ef4444',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem'
                  }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#ef4444' }}>
                      جهت تایید حذف نهایی، رمز عبور حساب خود را وارد کنید:
                    </span>

                    {deleteError && (
                      <span style={{ fontSize: '0.78rem', color: '#ef4444' }}>
                        {deleteError}
                      </span>
                    )}

                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        required
                        placeholder="رمز عبور فعلی"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.55rem 2rem 0.55rem 0.75rem',
                          borderRadius: '6px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-input, rgba(255,255,255,0.05))',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem',
                          direction: 'ltr',
                          textAlign: 'right'
                        }}
                      />
                      <KeyRound size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                      <button
                        type="submit"
                        disabled={deleteLoading}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          fontWeight: 600,
                          cursor: deleteLoading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {deleteLoading && <Loader2 size={14} className="spin-animation" />}
                        تایید و حذف دائمی اکانت
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowDeleteAccountModal(false); setDeletePassword(''); setDeleteError(''); }}
                        style={{
                          padding: '0.45rem 0.85rem',
                          backgroundColor: 'var(--bg-input, rgba(255,255,255,0.08))',
                          color: 'var(--text-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '6px',
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        انصراف
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}

          {/* TAB 3: APPEARANCE */}
          {activeTab === 'appearance' && (
            <div style={{
              padding: '1.1rem',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  پوسته و تم بصری
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
                  حالت نمایش مورد علاقه خود را انتخاب کنید.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { if (theme !== 'dark') toggleTheme(); }}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: theme === 'dark' ? '2px solid var(--accent-gold, #f59e0b)' : '1px solid var(--border-color)',
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Moon size={24} color={theme === 'dark' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>حالت شب (تاریک)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (theme !== 'light') toggleTheme(); }}
                  style={{
                    padding: '1rem',
                    borderRadius: '10px',
                    border: theme === 'light' ? '2px solid var(--accent-gold, #f59e0b)' : '1px solid var(--border-color)',
                    backgroundColor: 'rgba(248, 250, 252, 0.1)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Sun size={24} color={theme === 'light' ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>حالت روز (روشن)</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
