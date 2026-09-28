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
  Receipt
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '1rem 1.25rem' }}>موقعیت / آموزشگاه</th>
                  <th style={{ padding: '1rem 1rem' }}>مدل قرارداد</th>
                  <th style={{ padding: '1rem 1rem' }}>جلسات برگزار شده</th>
                  <th style={{ padding: '1rem 1rem' }}>درآمد ناخالص</th>
                  <th style={{ padding: '1rem 1rem' }}>سهم آموزشگاه / اجاره</th>
                  <th style={{ padding: '1rem 1.25rem', color: '#34d399' }}>خالص سهم مدرس</th>
                  <th style={{ padding: '1rem 1.25rem', textAlign: 'left' }} className="no-print">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => {
                  const fin = calculateLocationFinancials(loc, students);
                  return (
                    <tr key={loc.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{loc.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {toPersianDigits(fin.studentCount)} هنرجوی فعال
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        {loc.financialModel === 'studio_rent' ? (
                          <span className="badge badge-amber">اجاره جلسه: {formatToman(loc.studioRentPerSession)}</span>
                        ) : loc.type === 'private' ? (
                          <span className="badge badge-violet">۱۰۰٪ بدون کسر</span>
                        ) : (
                          <span className="badge badge-blue">{toPersianDigits(loc.academySharePercent)}٪ آموزشگاه / {toPersianDigits(100 - loc.academySharePercent)}٪ مدرس</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem 1rem', fontWeight: 600 }}>
                        {toPersianDigits(fin.totalSessionsHeld)} جلسه
                      </td>
                      <td style={{ padding: '1rem 1rem' }}>
                        {formatToman(fin.grossSessionRevenue)}
                      </td>
                      <td style={{ padding: '1rem 1rem', color: '#fb7185' }}>
                        {formatToman(fin.academyOrStudioCost)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                        {formatToman(fin.teacherNetEarnings)}
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'left' }} className="no-print">
                        <span className="badge badge-emerald">آماده تسویه</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RENEWAL ALERTS */}
      {activeSubTab === 'renewals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            هنرجویانی که بسته آنها به پایان رسیده است یا تنها ۱ جلسه تا اتمام بسته دارند:
          </p>

          {renewalStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <CheckCircle2 size={40} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
              <div>هیچ هنرجویی در آستانه اتمام بسته نیست. همه بسته‌ها فعال و معتبر هستند.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1rem' }}>
              {renewalStudents.map(student => {
                const fin = calculateStudentFinancials(student);
                const location = locations.find(l => l.id === student.locationId);

                return (
                  <div key={student.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '0.85rem', borderRight: '4px solid #f59e0b' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{student.name}</h4>
                          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                            <span className="badge badge-amber">{student.discipline}</span>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{location?.name}</span>
                          </div>
                        </div>

                        <span className={fin.isExpired ? 'badge badge-rose' : 'badge badge-amber'}>
                          {fin.isExpired ? 'پایان کامل دوره' : '۱ جلسه باقی‌مانده'}
                        </span>
                      </div>

                      <div style={{ marginTop: '0.85rem' }}>
                        <SessionCounter
                          total={student.packageTotalSessions}
                          completed={student.sessionsCompleted}
                          size="md"
                          showText={true}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <button
                        onClick={() => handleCopyReminder(student, 'renewal')}
                        className="btn btn-secondary"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                      >
                        <MessageSquare size={14} />
                        <span>{copiedId === student.id ? 'کپی شد!' : 'پیام یادآوری'}</span>
                      </button>

                      <button
                        onClick={() => setSelectedStudentForRenew(student)}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.8rem', padding: '0.45rem' }}
                      >
                        <RefreshCw size={14} />
                        <span>تمدید دوره جدید</span>
                      </button>
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
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              هنرجویانی که شهریه بسته خود را تسویه نکرده‌اند:
            </p>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fb7185' }}>
              مجموع کل بدهی‌های معوقه: {formatToman(globalStats.totalOutstandingDebt)}
            </div>
          </div>

          {debtorStudents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
              <ShieldCheck size={40} style={{ color: '#34d399', marginBottom: '0.5rem' }} />
              <div>هیچ بدهی معوقه‌ای وجود ندارد! حساب تمام هنرجویان تسویه است.</div>
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.9rem 1.25rem' }}>هنرجوی بدهکار</th>
                    <th style={{ padding: '0.9rem 1rem' }}>موقعیت / آموزشگاه</th>
                    <th style={{ padding: '0.9rem 1rem' }}>شهریه کل دوره</th>
                    <th style={{ padding: '0.9rem 1rem' }}>پرداخت شده</th>
                    <th style={{ padding: '0.9rem 1rem', color: '#fb7185' }}>مانده بدهی معوقه</th>
                    <th style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>اقدام سریع</th>
                  </tr>
                </thead>
                <tbody>
                  {debtorStudents.map(student => {
                    const fin = calculateStudentFinancials(student);
                    const location = locations.find(l => l.id === student.locationId);

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '0.9rem 1.25rem' }}>
                          <div style={{ fontWeight: 700 }}>{student.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {student.discipline} - تلفن: {toPersianDigits(student.phone)}
                          </div>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {location?.name}
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          {formatToman(student.packageFee)}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: '#34d399' }}>
                          {formatToman(student.paidAmount)}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: 800, color: '#fb7185' }}>
                          {formatToman(fin.debt)}
                        </td>
                        <td style={{ padding: '0.9rem 1.25rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleCopyReminder(student, 'debt')}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                              title="کپی پیامک اخطار تسویه بدهی"
                            >
                              <MessageSquare size={14} />
                              <span>{copiedId === student.id ? 'کپی شد!' : 'یادآوری'}</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedStudentForPay(student);
                                setIsPaymentModalOpen(true);
                              }}
                              className="btn btn-success"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                            >
                              <Wallet size={14} />
                              <span>ثبت دریافت</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
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
