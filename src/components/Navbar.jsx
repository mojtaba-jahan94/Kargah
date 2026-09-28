import React, { useRef, useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  CalendarCheck2, 
  Wallet, 
  Download, 
  Upload, 
  Moon, 
  Sun, 
  Bell, 
  Sparkles, 
  Settings,
  Plus,
  ChevronDown,
  UserPlus,
  Building2
} from 'lucide-react';
import { PaintingIcon } from './Common/PaintingIcon';
import { toPersianDigits } from '../utils/jalali';
import { StorageModeSelector } from './Auth/StorageModeSelector';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  stats, 
  onExport, 
  onImport, 
  onOpenSettings,
  onOpenAddStudent,
  onOpenAddLocation,
  currentAppData,
  onApplyServerData
}) {
  const fileInputRef = useRef(null);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target)) {
        setIsAddMenuOpen(false);
      }
    };
    if (isAddMenuOpen) {
      document.addEventListener('pointerdown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
    };
  }, [isAddMenuOpen]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImport(parsed);
        } catch (err) {
          alert('خطا در خواندن فایل پشتیبان. لطفاً فایل معتبر JSON انتخاب کنید.');
        }
      };
      reader.readAsText(file);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'داشبورد', fullLabel: 'داشبورد جامع', icon: LayoutDashboard },
    { 
      id: 'locations', 
      label: 'آموزشگاه‌ها', 
      fullLabel: 'موقعیت‌ها و آموزشگاه‌ها', 
      icon: MapPin,
      badge: stats.totalLocations ? toPersianDigits(stats.totalLocations) : null
    },
    { 
      id: 'students', 
      label: 'هنرجویان', 
      fullLabel: 'هنرجویان و کارنامه', 
      icon: Users,
      badge: stats.totalStudents ? toPersianDigits(stats.totalStudents) : null
    },
    { 
      id: 'attendance', 
      label: 'حضور/غیاب', 
      fullLabel: 'حضور و غیاب هوشمند', 
      icon: CalendarCheck2 
    },
    { 
      id: 'wallet', 
      label: 'کیف پول', 
      fullLabel: 'کیف پول و تسویه', 
      icon: Wallet,
      alertCount: stats.urgentAlertsCount > 0 ? stats.urgentAlertsCount : null
    },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="navbar-header" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '0.6rem'
        }}>
          {/* Brand & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
            <div className="navbar-brand-icon" style={{
              width: '38px',
              height: '38px',
              borderRadius: '11px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.2)',
              flexShrink: 0
            }}>
              <PaintingIcon size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h1 className="navbar-brand-title" style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #f8fafc 30%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  margin: 0
                }}>
                  کارگاه
                </h1>
                <span className="hide-on-mobile" style={{
                  fontSize: '0.7rem',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  color: 'var(--accent-gold)',
                  fontWeight: 600,
                  border: '1px solid rgba(245, 158, 11, 0.25)'
                }}>
                  مدیریت کلاس‌های هنری
                </span>
              </div>
              <p className="hide-on-mobile" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                آموزشگاه، خصوصی و پلاتو
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="desktop-nav" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            background: 'rgba(0, 0, 0, 0.22)',
            padding: '0.25rem 0.35rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.fullLabel}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(139, 92, 246, 0.25))' : 'transparent',
                    border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                    boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.2)' : 'none',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icon size={16} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.05rem 0.35rem',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.12)',
                      color: 'var(--text-primary)',
                      fontWeight: 600
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.05rem 0.4rem',
                      borderRadius: '999px',
                      background: 'var(--accent-rose)',
                      color: '#fff',
                      fontWeight: 700,
                      animation: 'pulseGlow 2s infinite'
                    }}>
                      {toPersianDigits(item.alertCount)}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Utility Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            {/* Quick Add Menu */}
            <div style={{ position: 'relative' }} ref={addMenuRef}>
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="btn btn-primary"
                style={{
                  padding: '0.4rem 0.75rem',
                  fontSize: '0.82rem',
                  borderRadius: '9px',
                  gap: '0.35rem',
                  minHeight: '32px',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.25)',
                  whiteSpace: 'nowrap'
                }}
                title="منوی افزودن آموزشگاه یا هنرجو"
              >
                <Plus size={15} />
                <span>افزودن</span>
                <ChevronDown size={13} style={{ transform: isAddMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {isAddMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 150,
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '14px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  padding: '0.45rem',
                  minWidth: '220px',
                  animation: 'fadeIn 0.18s ease-out',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      if (onOpenAddStudent) onOpenAddStudent();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '9px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'right',
                      width: '100%',
                      transition: 'background 0.15s ease'
                    }}
                    className="btn-ghost"
                  >
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(139, 92, 246, 0.15)',
                      color: '#a78bfa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <UserPlus size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>ثبت‌نام هنرجوی جدید</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>پرونده، بسته و شهریه</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsAddMenuOpen(false);
                      if (onOpenAddLocation) onOpenAddLocation();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      padding: '0.6rem 0.75rem',
                      borderRadius: '9px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'right',
                      width: '100%',
                      transition: 'background 0.15s ease'
                    }}
                    className="btn-ghost"
                  >
                    <div style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--accent-gold)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Building2 size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>تعریف آموزشگاه / موقعیت</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>آموزشگاه درصدی یا خصوصی</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Storage Mode & Auth Switcher */}
            <StorageModeSelector 
              currentAppData={currentAppData} 
              onApplyServerData={onApplyServerData} 
            />

            {/* Backup / Export (Desktop only - accessible via Settings on mobile) */}
            <button
              onClick={onExport}
              className="btn btn-secondary hide-on-mobile"
              title="پشتیبان‌گیری از اطلاعات (Export JSON)"
              style={{ padding: '0.45rem', minHeight: '32px', minWidth: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Download size={14} />
            </button>

            {/* Import (Desktop only - accessible via Settings on mobile) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary hide-on-mobile"
              title="بازیابی اطلاعات از فایل (Import JSON)"
              style={{ padding: '0.45rem', minHeight: '32px', minWidth: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Upload size={14} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              style={{ display: 'none' }} 
            />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              style={{ padding: '0.45rem', minHeight: '32px', minWidth: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={14} color="var(--accent-gold)" /> : <Moon size={14} />}
            </button>

            {/* Settings Modal Button */}
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary"
              title="تنظیمات برنامه"
              style={{ padding: '0.45rem', minHeight: '32px', minWidth: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Settings size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="mobile-nav-bar" aria-label="Mobile Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                {item.alertCount && (
                  <span style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: 'var(--accent-rose)',
                    color: '#fff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {toPersianDigits(item.alertCount)}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
