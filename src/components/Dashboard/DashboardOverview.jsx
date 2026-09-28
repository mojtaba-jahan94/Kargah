import React from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { toPersianDigits, getTodayJalaliString, getTodayDayOfWeek } from '../../utils/jalali';
import { formatToman, formatPercent } from '../../utils/formatters';
import { calculateGlobalStats, calculateStudentFinancials, calculateLocationFinancials } from '../../utils/finance';
import { SessionCounter } from '../Common/SessionCounter';

export default function DashboardOverview({ 
  locations, 
  students, 
  payments, 
  onNavigateTab, 
  onSelectStudent,
  onQuickAttendance
}) {
  const stats = calculateGlobalStats(locations, students);
  const todayDate = getTodayJalaliString();
  const dayOfWeek = getTodayDayOfWeek();

  // Urgent items
  const urgentRenewals = students.filter(s => calculateStudentFinancials(s).isRenewalAlert);
  const urgentDebtors = students.filter(s => calculateStudentFinancials(s).hasDebt);

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(16, 185, 129, 0.1) 100%)',
        border: '1px solid var(--border-highlight)',
        borderRadius: '20px',
        padding: '1.6rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.2rem',
        boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
              {dayOfWeek}، {toPersianDigits(todayDate)}
            </span>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              آتلیه و کارگاه هنری فعال
            </span>
          </div>

          <h2 style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.35rem', letterSpacing: '-0.02em' }}>
            سامانه هوشمند مدیریت کلاس‌های هنری
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '620px', marginTop: '0.3rem', lineHeight: 1.6 }}>
            مدیریت یکپارچه شاگردان خصوصی، آموزشگاه‌ها با درصد سهم، پلاتو، حضور و غیاب کسر از بسته، و کیف پول شفاف استاد.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', zIndex: 1 }}>
          <button
            onClick={() => onNavigateTab('attendance')}
            className="btn btn-primary"
            style={{ padding: '0.7rem 1.25rem', fontSize: '0.92rem' }}
          >
            <CalendarCheck2 size={18} />
            <span>حضور و غیاب امروز</span>
          </button>
          <button
            onClick={() => onNavigateTab('wallet')}
            className="btn btn-secondary"
            style={{ padding: '0.7rem 1.25rem', fontSize: '0.92rem' }}
          >
            <Wallet size={18} />
            <span>کیف پول و تسویه</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.1rem'
      }}>
        {/* KPI 1: Active Students */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('students')}
          style={{ padding: '1.25rem', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>کل هنرجویان فعال</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {toPersianDigits(stats.totalStudents)} نفر
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>در {toPersianDigits(stats.totalLocations)} آموزشگاه و موقعیت</span>
            <ArrowRight size={12} style={{ transform: 'rotate(180deg)' }} />
          </div>
        </div>

        {/* KPI 2: Net Teacher Earnings */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ padding: '1.25rem', cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.85) 100%)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#34d399', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700 }}>خالص دریافتی مدرس</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <Coins size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.5rem', color: '#34d399' }}>
            {formatToman(stats.totalTeacherNet)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            پس از کسر {formatToman(stats.totalAcademyStudioShare)} سهم آموزشگاه‌ها
          </div>
        </div>

        {/* KPI 3: Renewal Alerts */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ padding: '1.25rem', cursor: 'pointer', border: stats.totalRenewalAlerts > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>هشدار تمدید بسته</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <Sparkles size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.5rem', color: stats.totalRenewalAlerts > 0 ? 'var(--accent-gold)' : 'var(--text-primary)' }}>
            {toPersianDigits(stats.totalRenewalAlerts)} هنرجو
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            جلسه آخر یا پایان بسته آموزشی
          </div>
        </div>

        {/* KPI 4: Overdue Debts */}
        <div 
          className="glass-card" 
          onClick={() => onNavigateTab('wallet')}
          style={{ padding: '1.25rem', cursor: 'pointer', border: stats.totalOutstandingDebt > 0 ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid var(--border-color)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>بدهی‌های معوقه</span>
            <div style={{ padding: '0.4rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.65rem', fontWeight: 900, marginTop: '0.5rem', color: stats.totalOutstandingDebt > 0 ? '#fb7185' : 'var(--text-primary)' }}>
            {formatToman(stats.totalOutstandingDebt)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {toPersianDigits(stats.totalDebtorsCount)} هنرجو با مانده بدهی
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent Alerts & Academy Performance */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.4rem' }}>
        {/* Left Column: Urgent Actions & Renewal List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={18} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>اقدامات و هشدارهای نیازمند پیگیری</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('wallet')} 
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
              >
                مشاهده همه
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {urgentRenewals.slice(0, 3).map(student => {
                const fin = calculateStudentFinancials(student);
                return (
                  <div
                    key={student.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{student.name}</span>
                        <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{student.discipline}</span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {toPersianDigits(student.sessionsCompleted)} از {toPersianDigits(student.packageTotalSessions)} جلسه برگزار شده ({fin.isExpired ? 'پایان بسته' : '۱ جلسه مانده'})
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(student)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      بررسی و تمدید
                    </button>
                  </div>
                );
              })}

              {urgentDebtors.slice(0, 2).map(student => {
                const fin = calculateStudentFinancials(student);
                return (
                  <div
                    key={student.id}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: '12px',
                      background: 'rgba(244, 63, 94, 0.04)',
                      border: '1px solid rgba(244, 63, 94, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.75rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.92rem' }}>{student.name}</span>
                        <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                          بدهی: {formatToman(fin.debt)}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        شهریه {student.discipline} | تلفن: {toPersianDigits(student.phone)}
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectStudent(student)}
                      className="btn btn-secondary"
                      style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
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
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={18} color="#60a5fa" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>سهم و خالص دریافتی آموزشگاه‌ها</h3>
              </div>
              <button 
                onClick={() => onNavigateTab('locations')} 
                className="btn btn-ghost"
                style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
              >
                مدیریت موقعیت‌ها
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {locations.map(loc => {
                const fin = calculateLocationFinancials(loc, students);
                const shareModelText = loc.financialModel === 'studio_rent'
                  ? `اجاره ثابت پلاتو (${formatToman(loc.studioRentPerSession)}/جلسه)`
                  : loc.type === 'private'
                  ? '۱۰۰٪ عایدی مدرس'
                  : `سهم آموزشگاه: ${toPersianDigits(loc.academySharePercent)}٪`;

                return (
                  <div
                    key={loc.id}
                    style={{
                      padding: '0.85rem',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{loc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          {shareModelText} | {toPersianDigits(fin.studentCount)} هنرجو
                        </div>
                      </div>

                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#34d399' }}>
                          {formatToman(fin.teacherNetEarnings)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          خالص مدرس
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.85rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>مجموع خالص دریافتی تمام موقعیت‌ها:</span>
            <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1.05rem' }}>
              {formatToman(stats.totalTeacherNet)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
