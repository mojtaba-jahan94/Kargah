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
    { id: 'dashboard', label: 'داشبورد جامع', icon: LayoutDashboard },
    { 
      id: 'locations', 
      label: 'موقعیت‌ها و آموزشگاه‌ها', 
      icon: MapPin,
      badge: stats.totalLocations ? toPersianDigits(stats.totalLocations) : null
    },
    { 
      id: 'students', 
      label: 'هنرجویان و کارنامه', 
      icon: Users,
      badge: stats.totalStudents ? toPersianDigits(stats.totalStudents) : null
    },
    { 
      id: 'attendance', 
      label: 'حضور و غیاب هوشمند', 
      icon: CalendarCheck2 
    },
    { 
      id: 'wallet', 
      label: 'کیف پول و تسویه', 
      icon: Wallet,
      alertCount: stats.urgentAlertsCount > 0 ? stats.urgentAlertsCount : null
    },
  ];

  return (
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
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Brand & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
            transform: 'rotate(-4deg)'
          }}>
            <Palette size={24} style={{ transform: 'rotate(4deg)' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #f8fafc 30%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}>
                کارگاه
              </h1>
              <span style={{
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
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              استودیو، آموزشگاه و شاگردان خصوصی
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
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
                <span>{item.label}</span>
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

        {/* Utility Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Backup / Export */}
          <button
            onClick={onExport}
            className="btn btn-secondary"
            title="پشتیبان‌گیری از اطلاعات (Export JSON)"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
          >
            <Download size={16} />
            <span className="hide-on-mobile">پشتیبان</span>
          </button>

          {/* Import */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
            title="بازیابی اطلاعات از فایل (Import JSON)"
            style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}
          >
            <Upload size={16} />
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
            title="بازنشانی داده‌های نمونه اولیه"
            style={{ padding: '0.5rem', borderRadius: '8px' }}
          >
            <RotateCcw size={17} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            title={theme === 'dark' ? 'حالت روز' : 'حالت شب'}
            style={{ padding: '0.5rem', borderRadius: '8px' }}
          >
            {theme === 'dark' ? <Sun size={17} color="var(--accent-gold)" /> : <Moon size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}
