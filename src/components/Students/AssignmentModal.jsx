import React, { useState, useEffect } from 'react';
import { X, BookOpen, CheckCircle, Clock, RotateCcw } from 'lucide-react';
import { getTodayJalaliString } from '../../utils/jalali';

export function AssignmentModal({ isOpen, onClose, onSave, editingAssignment = null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateAssigned: getTodayJalaliString(),
    dueDate: '',
    status: 'in_progress', // 'in_progress', 'completed', 'needs_repeat'
    teacherNote: '',
  });

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title || '',
        description: editingAssignment.description || '',
        dateAssigned: editingAssignment.dateAssigned || getTodayJalaliString(),
        dueDate: editingAssignment.dueDate || '',
        status: editingAssignment.status || 'in_progress',
        teacherNote: editingAssignment.teacherNote || '',
      });
    } else {
      setFormData({
        title: '',
        description: '',
        dateAssigned: getTodayJalaliString(),
        dueDate: '',
        status: 'in_progress',
        teacherNote: '',
      });
    }
  }, [editingAssignment, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('لطفاً عنوان تکلیف یا قطعه تمرینی را وارد کنید.');
      return;
    }

    const payload = {
      ...formData,
      id: editingAssignment ? editingAssignment.id : `asg-${Date.now()}`,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {editingAssignment ? 'ویرایش تکلیف / تمرین' : 'ثبت تکلیف و قطعه جدید'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                ثبت درس جلسه، میزان‌ها و دستورالعمل تمرینی برای هنرجو
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              عنوان قطعه، اتود یا تمرین *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="مثال: چهارمضراب ابوعطا صبا یا اتود شماره ۵"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              توضیحات تمرینی و نکات اجرایی
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="مثال: تمرکز روی ریزهای نرم با ریتم ۶/۸، صفحه ۴۲ کتاب... سرعت مترونوم ۷۲"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                تاریخ ارائه (شمسی)
              </label>
              <input
                type="text"
                value={formData.dateAssigned}
                onChange={(e) => setFormData({ ...formData, dateAssigned: e.target.value })}
                placeholder="1403/07/01"
                style={{ direction: 'ltr', textAlign: 'center' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                مهلت تحویل / جلسه بعد
              </label>
              <input
                type="text"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                placeholder="1403/07/08"
                style={{ direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              وضعیت ارزیابی تکلیف
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'in_progress' })}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: formData.status === 'in_progress' ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  background: formData.status === 'in_progress' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: formData.status === 'in_progress' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem'
                }}
              >
                <Clock size={15} />
                در حال تمرین
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'completed' })}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: formData.status === 'completed' ? '1px solid #10b981' : '1px solid var(--border-color)',
                  background: formData.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                  color: formData.status === 'completed' ? '#34d399' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem'
                }}
              >
                <CheckCircle size={15} />
                تایید و انجام شده
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'needs_repeat' })}
                style={{
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: formData.status === 'needs_repeat' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                  background: formData.status === 'needs_repeat' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
                  color: formData.status === 'needs_repeat' ? '#fb7185' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.35rem',
                  fontSize: '0.8rem'
                }}
              >
                <RotateCcw size={15} />
                نیاز به تکرار
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              بازخورد و یادداشت استاد برای این تمرین
            </label>
            <input
              type="text"
              value={formData.teacherNote}
              onChange={(e) => setFormData({ ...formData, teacherNote: e.target.value })}
              placeholder="مثال: تکنیک مضراب عالی بود، روی تمپوی پایانی کار شود."
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
            <button type="submit" className="btn btn-primary">
              ثبت تکلیف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
