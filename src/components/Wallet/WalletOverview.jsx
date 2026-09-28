import React, { useState } from 'react';
import { 
  Wallet, 
  Coins, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  Percent, 
  CheckCircle2, 
  Printer, 
  Copy, 
  MessageSquare, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw,
  Clock,
  ShieldCheck,
  TrendingUp,
  Receipt,
  ChevronDown,
  ChevronUp,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import { toPersianDigits, formatJalaliReadable } from '../../utils/jalali';
import { formatToman, formatPercent } from '../../utils/formatters';
import { calculateLocationFinancials, calculateStudentFinancials, calculateGlobalStats } from '../../utils/finance';
import { SessionCounter } from '../Common/SessionCounter';
import { PaymentModal } from './PaymentModal';
import { PackageRenewModal } from '../Students/PackageRenewModal';

export default function WalletOverview({ 
  locations, 
  students, 
  payments, 
  onSavePayment, 
  onRenewPackage 
}) {
  const [activeSubTab, setActiveSubTab] = useState('academies'); // 'academies', 'renewals', 'debts', 'transactions'
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedStudentForPay, setSelectedStudentForPay] = useState(null);
  const [selectedStudentForRenew, setSelectedStudentForRenew] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const globalStats = calculateGlobalStats(locations, students);

  // Filter students for renewals (sessionsLeft <= 1)
  const renewalStudents = students.filter(s => {
    const fin = calculateStudentFinancials(s);
    return fin.isRenewalAlert;
  });

  // Filter students for debts (debt > 0)
  const debtorStudents = students.filter(s => {
    const fin = calculateStudentFinancials(s);
    return fin.hasDebt;
  });

  // Accordion drawer states for card views
  const [expandedRenewalIds, setExpandedRenewalIds] = useState(() => new Set(renewalStudents.map(s => s.id)));
  const [expandedDebtIds, setExpandedDebtIds] = useState(() => new Set(debtorStudents.map(s => s.id)));
  const [expandedAcademyIds, setExpandedAcademyIds] = useState(() => new Set(locations.map(l => l.id)));

  const handleCopyReminder = (student, type) => {
    let msg = `سلام ${student.name} عزیز 🌺\n`;
    const fin = calculateStudentFinancials(student);

    if (type === 'renewal') {
      if (fin.isExpired) {
        msg += `بسته کلاس ${student.discipline} شما به پایان رسیده است. لطفاً جهت هماهنگی تمدید دوره اقدام نمایید.`;
      } else {
        msg += `تنها ${toPersianDigits(fin.sessionsLeft)} جلسه از بسته آموزشی شما باقی مانده است. جهت تمدید دوره بعد در خدمت شما هستیم.`;
      }
    } else {
      msg += `یادآوری بابت شهریه دوره ${student.discipline}؛ مانده حساب شما مبلغ ${formatToman(fin.debt)} می‌باشد.`;
    }

    navigator.clipboard.writeText(msg);
    setCopiedId(student.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'var(--bg-glass)',
        padding: '1.25rem 1.5rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              کیف پول، وضعیت تسویه و گزارش مالی
            </h2>
            <span className="badge badge-amber" style={{ fontSize: '0.82rem' }}>
              محاسبه سهم آموزشگاه و پلاتو
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            هشدار تمدید شهریه، پیگیری بدهی‌های معوقه و تفکیک خالص دریافتی از هر آموزشگاه
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }} className="no-print">
          <button onClick={handlePrintReport} className="btn btn-secondary">
            <Printer size={16} />
            <span>چاپ گزارش مالی</span>
          </button>

          <button 
            onClick={() => {
              setSelectedStudentForPay(null);
              setIsPaymentModalOpen(true);
            }} 
            className="btn btn-primary"
          >
            <Wallet size={16} />
            <span>ثبت واریزی جدید</span>
          </button>
        </div>
      </div>

      {/* Global Financial KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '1rem'
      }}>
        {/* Card 1: Total Gross Revenue */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>درآمد ناخالص کل (جلسات برگزار شده)</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <TrendingUp size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
            {formatToman(globalStats.totalGrossRevenue)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            بر مبنای {toPersianDigits(globalStats.totalSessionsHeld)} جلسه تدریس
          </div>
        </div>

        {/* Card 2: Total Academy & Studio Cut */}
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>سهم آموزشگاه‌ها و اجاره پلاتو</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.5rem', color: '#fb7185' }}>
            {formatToman(globalStats.totalAcademyStudioShare)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            کسورات قانونی و اجاره فضا
          </div>
        </div>

        {/* Card 3: Net Teacher Earnings */}
        <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.35)', background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(22, 30, 49, 0.85) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#34d399', fontSize: '0.82rem' }}>
            <span style={{ fontWeight: 700 }}>خالص دریافتی نهایی مدرس</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              <Coins size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, marginTop: '0.5rem', color: '#34d399' }}>
            {formatToman(globalStats.totalTeacherNet)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            عایدی خالص پس از کسر تمام سهم‌ها
          </div>
        </div>

        {/* Card 4: Overdue Receivables */}
        <div className="glass-card" style={{ padding: '1.25rem', border: globalStats.totalOutstandingDebt > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
            <span>مطالبات و بدهی‌های معوقه</span>
            <div style={{ padding: '0.35rem', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-gold)' }}>
              <AlertCircle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.45rem', fontWeight: 800, marginTop: '0.5rem', color: globalStats.totalOutstandingDebt > 0 ? '#fb7185' : 'var(--text-primary)' }}>
            {formatToman(globalStats.totalOutstandingDebt)}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {toPersianDigits(globalStats.totalDebtorsCount)} هنرجوی دارای مانده حساب
          </div>
        </div>
      </div>

      {/* Sub Tabs Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '0.5rem',
        overflowX: 'auto'
      }} className="no-print">
        {[
          { id: 'academies', label: 'گزارش خالص دریافتی آموزشگاه‌ها', icon: Building2 },
          { 
            id: 'renewals', 
            label: 'هشدارهای تمدید شهریه', 
            icon: Sparkles,
            badge: renewalStudents.length > 0 ? toPersianDigits(renewalStudents.length) : null,
            badgeColor: 'badge-amber'
          },
          { 
            id: 'debts', 
            label: 'پیگیری بدهی‌های معوقه', 
            icon: AlertCircle,
            badge: debtorStudents.length > 0 ? toPersianDigits(debtorStudents.length) : null,
            badgeColor: 'badge-rose'
          },
          { id: 'transactions', label: 'تاریخچه تراکنش‌ها و واریزی‌ها', icon: Receipt },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 500,
                background: isActive ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2))' : 'rgba(255, 255, 255, 0.03)',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                border: isActive ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-color)',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`badge ${tab.badgeColor}`} style={{ fontSize: '0.72rem', padding: '0.05rem 0.45rem' }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: ACADEMY NET SETTLEMENTS */}
      {activeSubTab === 'academies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              گزارش عملکرد مالی و تسویه به تفکیک موقعیت و مدل‌های قرارداد:
            </p>
            {locations.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (expandedAcademyIds.size === locations.length) {
                    setExpandedAcademyIds(new Set());
                  } else {
                    setExpandedAcademyIds(new Set(locations.map(l => l.id)));
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', minHeight: '32px' }}
              >
                {expandedAcademyIds.size === locations.length ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
                <span>{expandedAcademyIds.size === locations.length ? 'جمع کردن همه' : 'باز کردن همه'}</span>
              </button>
            )}
          </div>

          {/* Grid of Academy Cards with Collapsible Drawers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
            {locations.map(loc => {
              const fin = calculateLocationFinancials(loc, students);
              const isExpanded = expandedAcademyIds.has(loc.id);

              const modelText = loc.financialModel === 'studio_rent'
                ? `اجاره جلسه (${formatToman(loc.studioRentPerSession)})`
                : loc.type === 'private'
                ? '۱۰۰٪ سهم کامل مدرس'
                : `${toPersianDigits(loc.academySharePercent)}٪ آموزشگاه / ${toPersianDigits(100 - loc.academySharePercent)}٪ مدرس`;

              return (
                <div 
                  key={loc.id} 
                  className="glass-card" 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden', 
                    borderTop: `4px solid ${loc.color || 'var(--accent-amber)'}` 
                  }}
                >
                  {/* Clickable Header for Collapsing */}
                  <div
                    onClick={() => {
                      setExpandedAcademyIds(prev => {
                        const next = new Set(prev);
                        if (next.has(loc.id)) next.delete(loc.id);
                        else next.add(loc.id);
                        return next;
                      });
                    }}
                    style={{
                      padding: '1.1rem 1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      userSelect: 'none',
                      background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                      borderBottom: isExpanded ? '1px solid var(--border-color)' : '1px solid transparent',
                      transition: 'background 0.2s ease',
                      gap: '0.5rem'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{loc.name}</h4>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>آماده تسویه</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        {toPersianDigits(fin.studentCount)} هنرجوی فعال • {toPersianDigits(fin.totalSessionsHeld)} جلسه برگزار شده
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexShrink: 0 }}>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#34d399' }}>
                          {formatToman(fin.teacherNetEarnings)}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          خالص مدرس
                        </div>
                      </div>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        transition: 'transform 0.25s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <ChevronDown size={17} />
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Drawer */}
                  <div style={{
                    maxHeight: isExpanded ? '400px' : '0px',
                    opacity: isExpanded ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
                    padding: isExpanded ? '1rem 1.25rem' : '0 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', fontSize: '0.8rem' }}>
                      <div style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>مدل قرارداد:</span>
                        <span style={{ fontWeight: 600 }}>{modelText}</span>
                      </div>
                      <div style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>درآمد ناخالص جلسات:</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatToman(fin.grossSessionRevenue)}</span>
                      </div>
                      <div style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>سهم آموزشگاه / اجاره:</span>
                        <span style={{ fontWeight: 600, color: '#fb7185' }}>{formatToman(fin.academyOrStudioCost)}</span>
                      </div>
                      <div style={{ padding: '0.5rem 0.65rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                        <span style={{ color: '#34d399', display: 'block', fontSize: '0.72rem' }}>خالص سهم مدرس:</span>
                        <span style={{ fontWeight: 800, color: '#34d399' }}>{formatToman(fin.teacherNetEarnings)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUBTAB 2: RENEWAL ALERTS */}
      {activeSubTab === 'renewals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              هنرجویانی که بسته آنها به پایان رسیده است یا تنها ۱ جلسه تا اتمام بسته دارند:
            </p>
            {renewalStudents.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (expandedRenewalIds.size === renewalStudents.length) {
                    setExpandedRenewalIds(new Set());
                  } else {
                    setExpandedRenewalIds(new Set(renewalStudents.map(s => s.id)));
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', minHeight: '32px' }}
              >
                {expandedRenewalIds.size === renewalStudents.length ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
                <span>{expandedRenewalIds.size === renewalStudents.length ? 'جمع کردن همه' : 'باز کردن همه'}</span>
              </button>
            )}
          </div>

          {renewalStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
              <div>هیچ هنرجویی در آستانه اتمام بسته نیست. همه بسته‌ها فعال و معتبر هستند.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {renewalStudents.map(student => {
                const fin = calculateStudentFinancials(student);
                const location = locations.find(l => l.id === student.locationId);
                const isExpanded = expandedRenewalIds.has(student.id);

                return (
                  <div key={student.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', borderRight: '4px solid #f59e0b', overflow: 'hidden' }}>
                    {/* Header Row - Accordion Clickable Trigger */}
                    <div 
                      onClick={() => {
                        setExpandedRenewalIds(prev => {
                          const next = new Set(prev);
                          if (next.has(student.id)) next.delete(student.id);
                          else next.add(student.id);
                          return next;
                        });
                      }}
                      style={{
                        padding: '1.1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        borderBottom: isExpanded ? '1px solid var(--border-color)' : '1px solid transparent',
                        transition: 'background 0.2s ease'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{student.name}</h4>
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{student.discipline}</span>
                          <span className={fin.isExpired ? 'badge badge-rose' : 'badge badge-amber'} style={{ fontSize: '0.7rem' }}>
                            {fin.isExpired ? 'پایان دوره' : '۱ جلسه مانده'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {location?.name} • جلسه {toPersianDigits(student.sessionsCompleted)} از {toPersianDigits(student.packageTotalSessions)}
                        </div>
                      </div>

                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        transition: 'transform 0.25s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        <ChevronDown size={17} />
                      </div>
                    </div>

                    {/* Accordion Drawer Content */}
                    <div style={{
                      maxHeight: isExpanded ? '350px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
                      padding: isExpanded ? '1rem 1.25rem' : '0 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}>
                      <div>
                        <SessionCounter
                          total={student.packageTotalSessions}
                          completed={student.sessionsCompleted}
                          size="md"
                          showText={true}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCopyReminder(student, 'renewal')}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', minHeight: '34px' }}
                        >
                          <MessageSquare size={14} />
                          <span>{copiedId === student.id ? 'کپی شد!' : 'پیام یادآوری'}</span>
                        </button>

                        <button
                          onClick={() => setSelectedStudentForRenew(student)}
                          className="btn btn-primary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', minHeight: '34px' }}
                        >
                          <RefreshCw size={14} />
                          <span>تمدید دوره</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: OVERDUE DEBT TRACKER */}
      {activeSubTab === 'debts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                هنرجویانی که شهریه بسته خود را تسویه نکرده‌اند:
              </p>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fb7185', marginTop: '0.2rem' }}>
                مجموع کل بدهی‌های معوقه: {formatToman(globalStats.totalOutstandingDebt)}
              </div>
            </div>

            {debtorStudents.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (expandedDebtIds.size === debtorStudents.length) {
                    setExpandedDebtIds(new Set());
                  } else {
                    setExpandedDebtIds(new Set(debtorStudents.map(s => s.id)));
                  }
                }}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', minHeight: '32px' }}
              >
                {expandedDebtIds.size === debtorStudents.length ? <ChevronsUp size={14} /> : <ChevronsDown size={14} />}
                <span>{expandedDebtIds.size === debtorStudents.length ? 'جمع کردن همه' : 'باز کردن همه'}</span>
              </button>
            )}
          </div>

          {debtorStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <ShieldCheck size={40} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
              <div>هیچ بدهی معوقه‌ای وجود ندارد! حساب تمام هنرجویان تسویه است.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {debtorStudents.map(student => {
                const fin = calculateStudentFinancials(student);
                const location = locations.find(l => l.id === student.locationId);
                const isExpanded = expandedDebtIds.has(student.id);

                return (
                  <div 
                    key={student.id} 
                    className="glass-card" 
                    style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRight: '4px solid #f43f5e', 
                      overflow: 'hidden' 
                    }}
                  >
                    {/* Header Row - Accordion Clickable Trigger */}
                    <div
                      onClick={() => {
                        setExpandedDebtIds(prev => {
                          const next = new Set(prev);
                          if (next.has(student.id)) next.delete(student.id);
                          else next.add(student.id);
                          return next;
                        });
                      }}
                      style={{
                        padding: '1.1rem 1.25rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        userSelect: 'none',
                        background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                        borderBottom: isExpanded ? '1px solid var(--border-color)' : '1px solid transparent',
                        transition: 'background 0.2s ease',
                        gap: '0.5rem'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{student.name}</h4>
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>{student.discipline}</span>
                          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>
                            بدهی: {formatToman(fin.debt)}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {location?.name} • تلفن: {toPersianDigits(student.phone)}
                        </div>
                      </div>

                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        transition: 'transform 0.25s ease',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        flexShrink: 0
                      }}>
                        <ChevronDown size={17} />
                      </div>
                    </div>

                    {/* Accordion Drawer Content */}
                    <div style={{
                      maxHeight: isExpanded ? '400px' : '0px',
                      opacity: isExpanded ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
                      padding: isExpanded ? '1rem 1.25rem' : '0 1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                        <div style={{ padding: '0.5rem 0.4rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>شهریه کل:</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '0.15rem' }}>{formatToman(student.packageFee)}</div>
                        </div>
                        <div style={{ padding: '0.5rem 0.4rem', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>پرداخت شده:</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginTop: '0.15rem' }}>{formatToman(student.paidAmount)}</div>
                        </div>
                        <div style={{ padding: '0.5rem 0.4rem', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)' }}>
                          <div style={{ fontSize: '0.7rem', color: '#fb7185' }}>مانده بدهی:</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fb7185', marginTop: '0.15rem' }}>{formatToman(fin.debt)}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCopyReminder(student, 'debt')}
                          className="btn btn-secondary"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', minHeight: '34px' }}
                          title="کپی پیامک اخطار تسویه بدهی"
                        >
                          <MessageSquare size={14} />
                          <span>{copiedId === student.id ? 'کپی شد!' : 'پیام اخطار تسویه'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setSelectedStudentForPay(student);
                            setIsPaymentModalOpen(true);
                          }}
                          className="btn btn-success"
                          style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem', minHeight: '34px' }}
                        >
                          <Wallet size={14} />
                          <span>ثبت دریافت شهریه</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 4: TRANSACTION HISTORY */}
      {activeSubTab === 'transactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '0.9rem 1.25rem' }}>تاریخ</th>
                  <th style={{ padding: '0.9rem 1rem' }}>هنرجو</th>
                  <th style={{ padding: '0.9rem 1rem' }}>مبلغ واریزی</th>
                  <th style={{ padding: '0.9rem 1rem' }}>روش پرداخت</th>
                  <th style={{ padding: '0.9rem 1rem' }}>شناسه رهگیری</th>
                  <th style={{ padding: '0.9rem 1.25rem' }}>بابت و توضیحات</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => {
                  const student = students.find(s => s.id === pay.studentId);
                  return (
                    <tr key={pay.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {toPersianDigits(pay.date)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>
                        {student ? student.name : '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#34d399' }}>
                        {formatToman(pay.amount)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-blue">{pay.method}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', direction: 'ltr', textAlign: 'right', color: 'var(--text-muted)' }}>
                        {pay.referenceCode || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>
                        {pay.notes || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment and Renewal Modals */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSavePayment={onSavePayment}
        students={students}
        initialStudent={selectedStudentForPay}
      />

      {selectedStudentForRenew && (
        <PackageRenewModal
          isOpen={!!selectedStudentForRenew}
          onClose={() => setSelectedStudentForRenew(null)}
          onRenew={onRenewPackage}
          student={selectedStudentForRenew}
          location={locations.find(l => l.id === selectedStudentForRenew.locationId)}
        />
      )}
    </div>
  );
}
