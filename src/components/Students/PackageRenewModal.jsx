import React, { useState } from 'react';
import { X, Sparkles, RefreshCw, DollarSign, CheckCircle2 } from 'lucide-react';
import { getTodayJalaliString, toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';

export function PackageRenewModal({ isOpen, onClose, onRenew, student, location }) {
  if (!isOpen || !student) return null;

  const defaultSessions = location?.defaultPackageSessions || 8;
  const defaultSessionFee = location?.defaultSessionPrice || student.sessionFee || 500000;
  const defaultPackageFee = defaultSessions * defaultSessionFee;

  const [sessions, setSessions] = useState(defaultSessions);
  const [fee, setFee] = useState(defaultPackageFee);
  const [paid, setPaid] = useState(defaultPackageFee);
  const [startDate, setStartDate] = useState(getTodayJalaliString());
  const [paymentMethod, setPaymentMethod] = useState('کارت به کارت');
  const [notes, setNotes] = useState(`تمدید دوره جدید (${toPersianDigits(defaultSessions)} جلسه)`);

  const handleSubmit = (e) => {
    e.preventDefault();
    const renewalData = {
      packageTotalSessions: Number(sessions),
      packageFee: Number(fee),
      paidAmount: Number(paid),
      debtAmount: Math.max(0, Number(fee) - Number(paid)),
      startDate,
      paymentMethod,
      notes,
    };
    onRenew(student.id, renewalData);
    onClose();
  };

  const calculatedDebt = Math.max(0, Number(fee) - Number(paid));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2))',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                تمدید بسته و ثبت دوره جدید
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                هنرجو: <strong style={{ color: 'var(--text-primary)' }}>{student.name}</strong> ({student.discipline})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                تعداد جلسات دوره جدید
              </label>
              <input
                type="number"
                min="1"
                max="40"
                value={sessions}
                onChange={(e) => {
                  const s = Number(e.target.value);
                  setSessions(s);
                  const newFee = s * (student.sessionFee || 500000);
                  setFee(newFee);
                  setPaid(newFee);
                }}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                تاریخ شروع دوره جدید
              </label>
              <input
                type="text"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ width: '100%', direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                شهریه کل این بسته (تومان)
              </label>
              <input
                type="number"
                step="50000"
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                مبلغ واریزی فعلی (تومان)
              </label>
              <input
                type="number"
                step="50000"
                value={paid}
                onChange={(e) => setPaid(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                روش واریز شهریه
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{ width: '100%' }}
              >
                <option value="کارت به کارت">کارت به کارت</option>
                <option value="کارتخوان آموزشگاه">کارتخوان آموزشگاه</option>
                <option value="انتقال پایا / ساتنا">انتقال پایا / ساتنا</option>
                <option value="نقدی">پرداخت نقدی</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                وضعیت حساب جدید
              </label>
              <div style={{
                padding: '0.65rem',
                borderRadius: '8px',
                background: calculatedDebt > 0 ? 'rgba(244, 63, 94, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                color: calculatedDebt > 0 ? '#fb7185' : '#34d399',
                fontWeight: 700,
                fontSize: '0.85rem',
                border: calculatedDebt > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {calculatedDebt > 0 ? `بدهی مانده: ${formatToman(calculatedDebt)}` : 'تسویه کامل'}
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
              توضیحات تمدید
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تمدید بسته پاییزه به همراه دریافت فیش واریزی"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              انصراف
            </button>
            <button type="submit" className="btn btn-success">
              <CheckCircle2 size={16} />
              ثبت و تمدید بسته جدید
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
