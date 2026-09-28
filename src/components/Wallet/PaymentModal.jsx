import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, DollarSign, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { getTodayJalaliString, toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';

export function PaymentModal({ isOpen, onClose, onSavePayment, students, initialStudent = null }) {
  const [studentId, setStudentId] = useState(initialStudent?.id || students[0]?.id || '');
  const [amount, setAmount] = useState(initialStudent?.debtAmount || 1000000);
  const [date, setDate] = useState(getTodayJalaliString());
  const [method, setMethod] = useState('کارت به کارت');
  const [referenceCode, setReferenceCode] = useState('');
  const [notes, setNotes] = useState('تسویه بدهی شهریه');

  useEffect(() => {
    if (initialStudent) {
      setStudentId(initialStudent.id);
      setAmount(initialStudent.debtAmount || initialStudent.sessionFee || 500000);
    }
  }, [initialStudent, isOpen]);

  if (!isOpen) return null;

  const currentStudent = students.find(s => s.id === studentId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentId || !amount) {
      alert('لطفاً هنرجو و مبلغ پرداختی را مشخص کنید.');
      return;
    }

    const paymentRecord = {
      id: `pay-${Date.now()}`,
      studentId,
      amount: Number(amount),
      date,
      type: 'tuition_payment',
      method,
      referenceCode: referenceCode || `TRX-${Math.floor(100000 + Math.random() * 900000)}`,
      notes
    };

    onSavePayment(paymentRecord);
    onClose();
  };

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Fixed Header */}
        <div className="modal-header-fixed">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Wallet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                ثبت واریزی و تسویه حساب
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                ثبت پرداخت شهریه و کسر خودکار از مانده بدهی
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <form id="paymentForm" onSubmit={handleSubmit} className="modal-body-scrollable">
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              انتخاب هنرجو *
            </label>
            <select
              value={studentId}
              onChange={(e) => {
                const sId = e.target.value;
                setStudentId(sId);
                const s = students.find(st => st.id === sId);
                if (s && s.debtAmount > 0) {
                  setAmount(s.debtAmount);
                }
              }}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.discipline}) - بدهی: {formatToman(s.debtAmount || 0)}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                مبلغ واریزی (تومان) *
              </label>
              <input
                type="number"
                step="50000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                تاریخ پرداخت (شمسی)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                روش پرداخت
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option value="کارت به کارت">کارت به کارت</option>
                <option value="کارتخوان آموزشگاه">کارتخوان آموزشگاه</option>
                <option value="انتقال پایا / ساتنا">انتقال پایا / ساتنا</option>
                <option value="نقدی">پرداخت نقدی</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                شماره پیگیری / ارجاع
              </label>
              <input
                type="text"
                value={referenceCode}
                onChange={(e) => setReferenceCode(e.target.value)}
                placeholder="مثال: TRX-88491"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              توضیحات و بابت
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تسویه کامل شهریه دوره تابستان"
            />
          </div>

          {currentStudent && (
            <div style={{
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>مانده بدهی پس از این پرداخت:</span>
              <span style={{ fontWeight: 700, color: (currentStudent.debtAmount - Number(amount)) <= 0 ? '#34d399' : '#fb7185' }}>
                {formatToman(Math.max(0, (currentStudent.debtAmount || 0) - Number(amount)))}
              </span>
            </div>
          )}
        </form>

        {/* Fixed Footer */}
        <div className="modal-footer-fixed">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            انصراف
          </button>
          <button type="submit" form="paymentForm" className="btn btn-success">
            <CheckCircle2 size={16} />
            ثبت پرداخت
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
