import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Percent, DollarSign, Building2, Home, Landmark, Sparkles } from 'lucide-react';
import { toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';

export function LocationModal({ isOpen, onClose, onSave, editingLocation = null, location = null }) {
  const activeLoc = editingLocation || location;
  const [formData, setFormData] = useState({
    name: '',
    type: 'academy', // 'private', 'academy', 'studio_rent'
    financialModel: 'percentage', // 'percentage' or 'studio_rent'
    academySharePercent: 30,
    studioRentPerSession: 150000,
    defaultSessionPrice: 500000,
    defaultPackageSessions: 8,
    address: '',
    contact: '',
    notes: '',
    color: '#3b82f6',
  });

  useEffect(() => {
    if (activeLoc) {
      setFormData({
        name: activeLoc.name || '',
        type: activeLoc.type || 'academy',
        financialModel: activeLoc.financialModel || 'percentage',
        academySharePercent: activeLoc.academySharePercent ?? (activeLoc.type === 'private' ? 0 : 30),
        studioRentPerSession: activeLoc.studioRentPerSession ?? 150000,
        defaultSessionPrice: activeLoc.defaultSessionPrice ?? 500000,
        defaultPackageSessions: activeLoc.defaultPackageSessions ?? 8,
        address: activeLoc.address || '',
        contact: activeLoc.contact || '',
        notes: activeLoc.notes || '',
        color: activeLoc.color || '#3b82f6',
      });
    } else {
      setFormData({
        name: '',
        type: 'academy',
        financialModel: 'percentage',
        academySharePercent: 30,
        studioRentPerSession: 150000,
        defaultSessionPrice: 500000,
        defaultPackageSessions: 8,
        address: '',
        contact: '',
        notes: '',
        color: '#3b82f6',
      });
    }
  }, [activeLoc, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('لطفاً عنوان موقعیت یا آموزشگاه را وارد کنید.');
      return;
    }

    const payload = {
      ...formData,
      id: activeLoc ? activeLoc.id : `loc-${Date.now()}`,
      academySharePercent: formData.type === 'private' ? 0 : (Number(formData.academySharePercent) || 0),
      studioRentPerSession: Number(formData.studioRentPerSession) || 0,
      defaultSessionPrice: Number(formData.defaultSessionPrice) || 0,
      defaultPackageSessions: Number(formData.defaultPackageSessions) || 8,
    };

    onSave(payload);
    onClose();
  };

  // Preview calculations
  const sampleGross = (Number(formData.defaultSessionPrice) || 0) * (Number(formData.defaultPackageSessions) || 8);
  let sampleAcademyCut = 0;
  if (formData.financialModel === 'studio_rent') {
    sampleAcademyCut = (Number(formData.studioRentPerSession) || 0) * (Number(formData.defaultPackageSessions) || 8);
  } else {
    sampleAcademyCut = (sampleGross * (Number(formData.academySharePercent) || 0)) / 100;
  }
  const sampleTeacherNet = Math.max(0, sampleGross - sampleAcademyCut);

  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header - Fixed */}
        <div className="modal-header-fixed">
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
              <MapPin size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {activeLoc ? 'ویرایش موقعیت / آموزشگاه' : 'افزودن موقعیت و آموزشگاه جدید'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                تعریف درصد سهم آموزشگاه، اجاره پلاتو و تعرفه کلاس‌ها
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form id="locationForm" onSubmit={handleSubmit} className="modal-body-scrollable">
          {/* Name & Type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                عنوان موقعیت / آموزشگاه *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: آموزشگاه موسیقی باربد یا شاگرد خصوصی"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                نوع موقعیت
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  let newModel = formData.financialModel;
                  let newShare = formData.academySharePercent;
                  if (newType === 'private') {
                    newModel = 'percentage';
                    newShare = 0;
                  } else if (newType === 'studio_rent') {
                    newModel = 'studio_rent';
                  }
                  setFormData({ ...formData, type: newType, financialModel: newModel, academySharePercent: newShare });
                }}
              >
                <option value="academy">آموزشگاه رسمی (سهم درصدی)</option>
                <option value="private">شاگرد خصوصی (حضوری / آنلاین - بدون سهم)</option>
                <option value="studio_rent">پلاتو و کارگاه تمرین (اجاره ثابت)</option>
              </select>
            </div>
          </div>

          {/* Financial Model Selection */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1rem',
          }}>
            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.65rem', color: 'var(--accent-gold)' }}>
              مدل مالی و تقسیم درآمد
            </label>

            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, financialModel: 'percentage' })}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: formData.financialModel === 'percentage' ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  background: formData.financialModel === 'percentage' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: formData.financialModel === 'percentage' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Percent size={16} />
                درصد سهم آموزشگاه (%)
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, financialModel: 'studio_rent' })}
                style={{
                  flex: 1,
                  minWidth: '160px',
                  padding: '0.65rem',
                  borderRadius: '8px',
                  border: formData.financialModel === 'studio_rent' ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  background: formData.financialModel === 'studio_rent' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                  color: formData.financialModel === 'studio_rent' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                <Building2 size={16} />
                اجاره ثابت پلاتو / جلسه
              </button>
            </div>

            {formData.financialModel === 'percentage' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    درصد سهم آموزشگاه
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.academySharePercent}
                      onChange={(e) => setFormData({ ...formData, academySharePercent: e.target.value })}
                      style={{ paddingLeft: '2.5rem' }}
                    />
                    <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>٪</span>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                    سهم خالص مدرس
                  </label>
                  <div style={{
                    padding: '0.65rem 0.9rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    borderRadius: '8px',
                    color: '#34d399',
                    fontWeight: 700,
                    fontSize: '0.92rem'
                  }}>
                    {toPersianDigits(Math.max(0, 100 - (Number(formData.academySharePercent) || 0)))}٪ سهم مدرس
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.35rem', color: 'var(--text-secondary)' }}>
                  مبلغ اجاره پلاتو برای هر جلسه (تومان)
                </label>
                <input
                  type="number"
                  step="10000"
                  value={formData.studioRentPerSession}
                  onChange={(e) => setFormData({ ...formData, studioRentPerSession: e.target.value })}
                  placeholder="مثال: ۱۵۰,۰۰۰"
                />
              </div>
            )}
          </div>

          {/* Pricing defaults */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                شهریه پیش‌فرض هر جلسه (تومان)
              </label>
              <input
                type="number"
                step="50000"
                value={formData.defaultSessionPrice}
                onChange={(e) => setFormData({ ...formData, defaultSessionPrice: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                تعداد جلسات پیش‌فرض بسته
              </label>
              <input
                type="number"
                min="1"
                max="36"
                value={formData.defaultPackageSessions}
                onChange={(e) => setFormData({ ...formData, defaultPackageSessions: e.target.value })}
              />
            </div>
          </div>

          {/* Preview Box */}
          <div style={{
            background: 'rgba(139, 92, 246, 0.08)',
            border: '1px solid rgba(139, 92, 246, 0.25)',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4b5fd' }}>
              <Sparkles size={16} />
              <span>پیش‌نمایش بسته {toPersianDigits(formData.defaultPackageSessions)} جلسه‌ای:</span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', fontWeight: 600, flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                کل: {formatToman(sampleGross)}
              </span>
              <span style={{ color: '#fb7185' }}>
                کسورات: {formatToman(sampleAcademyCut)}
              </span>
              <span style={{ color: '#34d399' }}>
                خالص مدرس: {formatToman(sampleTeacherNet)}
              </span>
            </div>
          </div>

          {/* Address & Contact */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                آدرس یا بستر آنلاین
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="آدرس فیزیکی یا لینک پلتفرم"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                شماره تماس یا مسئول هماهنگی
              </label>
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="مثال: ۰۲۱-۸۸۸۸۸۸۸۸ (خانم احمدی)"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              رنگ شناسه موقعیت
            </label>
            <div style={{ display: 'flex', gap: '0.65rem' }}>
              {colors.map((c) => (
                <div
                  key={c}
                  onClick={() => setFormData({ ...formData, color: c })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: c,
                    cursor: 'pointer',
                    border: formData.color === c ? '3px solid #fff' : '2px solid transparent',
                    boxShadow: formData.color === c ? '0 0 10px rgba(255,255,255,0.4)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </form>

        {/* Footer Actions - Fixed at bottom */}
        <div className="modal-footer-fixed">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            انصراف
          </button>
          <button type="submit" form="locationForm" className="btn btn-primary">
            {activeLoc ? 'ذخیره تغییرات' : 'ایجاد موقعیت'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
