import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  CalendarCheck2, 
  Wallet, 
  Coins, 
  TrendingUp, 
  Sparkles, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Building2,
  BookOpen,
  ArrowUpRight,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { toPersianDigits, getTodayJalaliString, getTodayDayOfWeek } from '../../utils/jalali';
import { formatToman, formatPercent } from '../../utils/formatters';
import { calculateGlobalStats, calculateStudentFinancials, calculateLocationFinancials } from '../../utils/finance';

export default function DashboardOverview({ 
  locations, 
  students, 
  payments, 
  onNavigateTab, 
  onSelectStudent,
  onQuickAttendance
}) {
  const [isUrgentExpanded, setIsUrgentExpanded] = useState(true);
  const [isLocationExpanded, setIsLocationExpanded] = useState(true);

  const stats = calculateGlobalStats(locations, students);
  const todayDate = getTodayJalaliString();
  const dayOfWeek = getTodayDayOfWeek();

  // Urgent items
  const urgentRenewals = students.filter(s => calculateStudentFinancials(s).isRenewalAlert);
  const urgentDebtors = students.filter(s => calculateStudentFinancials(s).hasDebt);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Welcome Banner */}
      <div className="dashboard-welcome-banner">
        <div style={{ zIndex: 1, maxWidth: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              {dayOfWeek}، {toPersianDigits(todayDate)}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              آتلیه و کارگاه هنری فعال
            </span>
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            سامانه هوشمند مدیریت کلاس‌های هنری
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '600px', marginTop: '0.25rem', lineHeight: 1.5 }}>
            مدیریت یکپارچه شاگردان خصوصی، آموزشگاه‌ها با درصد سهم، پلاتو، حضور و غیاب کسر از بسته و کیف پول شفاف استاد.
          </p>
        </div>

        <div className="dashboard-banner-actions">
          <button
            onClick={() => onNavigateTab('attendance')}
            className="btn btn-primary"
          >
            <CalendarCheck2 size={17} />
            <span>حضور و غیاب امروز</span>
          </button>
          <button
            onClick={() => onNavigateTab('wallet')}
            className="btn btn-secondary"
          >
            <Wallet size={17} />
            <span>کیف پول و تسویه</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row - 2x2 on Mobile, 4x1 on Desktop */}
      <div className="dashboard-kpi-grid">
        {/* KPI 1: Active Students */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('students')}
          style={{ padding: '1.1rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <span>هنرجویان فعال</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Users size={15} />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.4rem', color: 'var(--text-primary)' }}>
            {toPersianDigits(stats.totalStudents)} نفر
          </div>
          <div className="dashboard-kpi-subtext" style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>{toPersianDigits(stats.totalLocations)} موقعیت</span>
            <ArrowRight size={11} style={{ transform: 'rotate(180deg)' }} />
          </div>
        </div>

        {/* KPI 2: Net Teacher Earnings */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ 
            padding: '1.1rem', 
            cursor: 'pointer', 
            border: '1px solid rgba(16, 185, 129, 0.35)', 
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.88) 100%)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', fontSize: '0.78rem' }}>
            <span style={{ fontWeight: 700 }}>خالص دریافتی</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <Coins size={15} />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.4rem', color: '#34d399' }}>
            {formatToman(stats.totalTeacherNet)}
          </div>
          <div className="dashboard-kpi-subtext" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            کسورات: {formatToman(stats.totalAcademyStudioShare)}
          </div>
        </div>

        {/* KPI 3: Renewal Alerts */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ 
            padding: '1.1rem', 
            cursor: 'pointer', 
            border: stats.totalRenewalAlerts > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <span>هشدار تمدید بسته</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Sparkles size={15} />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ fontSize: '1.5rem', fontWeight: 900, marginTop: '0.4rem', color: stats.totalRenewalAlerts > 0 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
            {toPersianDigits(stats.totalRenewalAlerts)} هنرجو
          </div>
          <div className="dashboard-kpi-subtext" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            جلسه پایانی یا پایان بسته
          </div>
        </div>

        {/* KPI 4: Overdue Debts */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ 
            padding: '1.1rem', 
            cursor: 'pointer', 
            border: stats.totalOutstandingDebt > 0 ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-color)' 
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
            <span>بدهی‌های معوقه</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertCircle size={15} />
            </div>
          </div>
          <div className="dashboard-kpi-value" style={{ fontSize: '1.4rem', fontWeight: 900, marginTop: '0.4rem', color: stats.totalOutstandingDebt > 0 ? '#fb7185' : 'var(--text-primary)' }}>
            {formatToman(stats.totalOutstandingDebt)}
          </div>
          <div className="dashboard-kpi-subtext" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {toPersianDigits(stats.totalDebtorsCount)} هنرجو با مانده بدهی
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Alerts & Academy Performance (Stacks to 1 Column on Mobile) */}
      <div className="dashboard-grid-main">
        {/* Left Column: Urgent Actions & Renewal List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '1.15rem',
            overflow: 'hidden'
          }}>
            {/* Clickable Header for Collapsing */}
            <div 
              onClick={() => setIsUrgentExpanded(!isUrgentExpanded)}
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ShieldAlert size={17} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>اقدامات و هشدارهای نیازمند پیگیری</h3>
                {(urgentRenewals.length > 0 || urgentDebtors.length > 0) && (
                  <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>
                    {toPersianDigits(urgentRenewals.length + urgentDebtors.length)}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigateTab('wallet');
                  }} 
                  className="btn btn-ghost"
                  style={{ fontSize: '0.78rem', padding: '0.2rem 0.45rem', minHeight: '30px' }}
                >
                  مشاهده همه
                </button>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'transform 0.25s ease',
                  transform: isUrgentExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            {/* Collapsible Drawer */}
            <div style={{
              maxHeight: isUrgentExpanded ? '900px' : '0px',
              opacity: isUrgentExpanded ? 1 : 0,
              overflow: 'hidden',
              transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.25s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginTop: isUrgentExpanded ? '0.85rem' : '0px'
            }}>
              {urgentRenewals.length === 0 && urgentDebtors.length === 0 && (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  هیچ هشدار فوری وجود ندارد.
                </div>
              )}

              {urgentRenewals.slice(0, 3).map(student => {
                const fin = calculateStudentFinancials(student);
                return (
                  <div key={student.id} className="dashboard-alert-item">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{student.name}</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{student.discipline}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {toPersianDigits(student.sessionsCompleted)} از {toPersianDigits(student.packageTotalSessions)} جلسه برگزار شده ({fin.isExpired ? 'پایان بسته' : '۱ جلسه مانده'})
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(student)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', minHeight: '32px' }}
                    >
                      بررسی و تمدید
                    </button>
                  </div>
                );
              })}

              {urgentDebtors.slice(0, 2).map(student => {
                const fin = calculateStudentFinancials(student);
                return (
                  <div key={student.id} className="dashboard-alert-item" style={{ background: 'rgba(244, 63, 94, 0.04)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{student.name}</span>
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          بدهی: {formatToman(fin.debt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        شهریه {student.discipline} | تلفن: {toPersianDigits(student.phone)}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(student)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', minHeight: '32px' }}
                    >
                      تسویه بدهی
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Location Revenue Breakdown */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Clickable Header for Collapsing */}
          <div 
            onClick={() => setIsLocationExpanded(!isLocationExpanded)}
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <Building2 size={17} color="#60a5fa" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>سهم و خالص دریافتی آموزشگاه‌ها</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onNavigateTab('locations');
                }} 
                className="btn btn-ghost"
                style={{ fontSize: '0.78rem', padding: '0.2rem 0.45rem', minHeight: '30px' }}
              >
                مدیریت موقعیت‌ها
              </button>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                transition: 'transform 0.25s ease',
                transform: isLocationExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          {/* Collapsible Drawer */}
          <div style={{
            maxHeight: isLocationExpanded ? '1000px' : '0px',
            opacity: isLocationExpanded ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, margin 0.25s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1,
            marginTop: isLocationExpanded ? '0.85rem' : '0px'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {locations.map(loc => {
                const fin = calculateLocationFinancials(loc, students);
                const shareModelText = loc.financialModel === 'studio_rent'
                  ? `اجاره ثابت (${formatToman(loc.studioRentPerSession)}/جلسه)`
                  : loc.type === 'private'
                  ? '۱۰۰٪ عایدی مدرس'
                  : `سهم: ${toPersianDigits(loc.academySharePercent)}٪`;

                return (
                  <div key={loc.id} className="dashboard-location-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.4rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{loc.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {shareModelText} | {toPersianDigits(fin.studentCount)} هنرجو
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34d399' }}>
                          {formatToman(fin.teacherNetEarnings)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          خالص مدرس
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{
              marginTop: '1rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
              gap: '0.4rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>مجموع خالص تمام موقعیت‌ها:</span>
              <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                {formatToman(stats.totalTeacherNet)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
