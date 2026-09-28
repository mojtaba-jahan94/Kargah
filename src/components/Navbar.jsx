import React, { useRef } from 'react';
import { 
  Palette, 
  LayoutDashboard, 
  MapPin, 
  Users, 
  CalendarCheck2, 
  Wallet, 
  Download, 
  Upload, 
  RotateCcw, 
  Moon, 
  Sun,
  Bell,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/jalali';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  toggleTheme, 
  stats, 
  onExport, 
  onImport, 
  onReset 
}) {
  const fileInputRef = useRef(null);

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
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-glass)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem',
        transition: 'all var(--transition-normal)'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          gap: '0.75rem'
        }}>
          {/* Brand & Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
              transform: 'rotate(-4deg)',
              flexShrink: 0
            }}>
              <Palette size={22} style={{ transform: 'rotate(4deg)' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <h1 style={{ 
                  fontSize: '1.2rem', 
                  fontWeight: 800, 
                  letterSpacing: '-0.02em',
                  background: 'linear-gradient(135deg, #f8fafc 30%, #fbbf24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
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
            alignItems: 'center',
            gap: '0.35rem',
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '0.3rem',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto'
          }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.55rem 0.95rem',
                    borderRadius: '10px',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? '#fff' : 'var(--text-secondary)',
                    background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(139, 92, 246, 0.25))' : 'transparent',
                    border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                    boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <Icon size={17} color={isActive ? 'var(--accent-gold)' : 'currentColor'} />
                  <span>{item.fullLabel}</span>
                  {item.badge && (
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '999px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-primary)'
                    }}>
                      {item.badge}
                    </span>
                  )}
                  {item.alertCount && (
                    <span style={{
                      fontSize: '0.72rem',
                      padding: '0.1rem 0.45rem',
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
            {/* Backup / Export */}
            <button
              onClick={onExport}
              className="btn btn-secondary"
              title="پشتیبان‌گیری از اطلاعات (Export JSON)"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', minHeight: '36px' }}
            >
              <Download size={15} />
              <span className="hide-on-mobile">پشتیبان</span>
            </button>

            {/* Import */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary"
              title="بازیابی اطلاعات از فایل (Import JSON)"
              style={{ padding: '0.45rem 0.65rem', fontSize: '0.8rem', minHeight: '36px' }}
            >
              <Upload size={15} />
              <span className="hide-on-mobile">بازیابی</span>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept=".json" 
              style={{ display: 'none' }} 
            />

            {/* Reset Demo Data */}
            <button
              onClick={onReset}
              className="btn btn-ghost"
              title="بازنشانی داده‌های اولیه دمو"
              style={{ padding: '0.45rem', borderRadius: '8px', minHeight: '36px' }}
            >
              <RotateCcw size={16} />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="btn btn-secondary"
              title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
              style={{ padding: '0.45rem', borderRadius: '8px', minHeight: '36px' }}
            >
              {theme === 'dark' ? <Sun size={16} color="var(--accent-gold)" /> : <Moon size={16} />}
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
