import React, { useState, useEffect } from 'react';
import { X, User, Music, MapPin, Calendar, Award, Phone, DollarSign, Clock, BookOpen } from 'lucide-react';
import { getTodayJalaliString, toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';

const ART_DISCIPLINES = [
  'پیانو کلاسیک',
  'سنتور',
  'تار',
  'سه‌تار',
  'گیتار کلاسیک و فلامنکو',
  'ویولن',
  'کمانچه',
  'دف و تمبک',
  'آواز ایرانی و صداسازی',
  'نقاشی رنگ روغن',
  'طراحی و سیاه‌قلم',
  'آبرنگ و گواش',
  'خوشنویسی و خط تحریری',
  'سفالگری و سرامیک',
  'سایر هنرهای تجسمی / موسیقی'
];

export function StudentModal({ isOpen, onClose, onSave, locations, editingStudent = null }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    discipline: 'سنتور',
    level: 'متوسط', // 'مقدماتی', 'متوسط', 'پیشرفته', 'حرفه‌ای'
    locationId: locations[0]?.id || '',
    startDate: getTodayJalaliString(),
    packageTotalSessions: 8,
    sessionsCompleted: 0,
    sessionFee: 500000,
    packageFee: 4000000,
    paidAmount: 4000000,
    status: 'active',
    preferredDayTime: '',
    notes: '',
  });

  useEffect(() => {
    if (editingStudent) {
      setFormData({
        name: editingStudent.name || '',
        phone: editingStudent.phone || '',
        discipline: editingStudent.discipline || 'سنتور',
        level: editingStudent.level || 'متوسط',
        locationId: editingStudent.locationId || locations[0]?.id || '',
        startDate: editingStudent.startDate || getTodayJalaliString(),
        packageTotalSessions: editingStudent.packageTotalSessions ?? 8,
        sessionsCompleted: editingStudent.sessionsCompleted ?? 0,
        sessionFee: editingStudent.sessionFee ?? 500000,
        packageFee: editingStudent.packageFee ?? 4000000,
        paidAmount: editingStudent.paidAmount ?? 4000000,
        status: editingStudent.status || 'active',
        preferredDayTime: editingStudent.preferredDayTime || '',
        notes: editingStudent.notes || '',
      });
    } else {
      const defaultLoc = locations[0];
      const defaultSession = defaultLoc?.defaultSessionPrice || 500000;
      const defaultTotal = defaultLoc?.defaultPackageSessions || 8;
      const totalFee = defaultSession * defaultTotal;

      setFormData({
        name: '',
        phone: '',
        discipline: 'سنتور',
        level: 'متوسط',
        locationId: defaultLoc?.id || '',
        startDate: getTodayJalaliString(),
        packageTotalSessions: defaultTotal,
        sessionsCompleted: 0,
        sessionFee: defaultSession,
        packageFee: totalFee,
        paidAmount: totalFee,
        status: 'active',
        preferredDayTime: '',
        notes: '',
      });
    }
  }, [editingStudent, isOpen, locations]);

  if (!isOpen) return null;

  const handleLocationChange = (locId) => {
    const selectedLoc = locations.find(l => l.id === locId);
    if (selectedLoc && !editingStudent) {
      const sessionFee = selectedLoc.defaultSessionPrice || 500000;
      const packageTotal = selectedLoc.defaultPackageSessions || 8;
      const packageFee = sessionFee * packageTotal;
      setFormData(prev => ({
        ...prev,
        locationId: locId,
        sessionFee,
        packageTotalSessions: packageTotal,
        packageFee,
        paidAmount: packageFee,
      }));
    } else {
      setFormData(prev => ({ ...prev, locationId: locId }));
    }
  };

  const handleFeeChange = (sessionFee, packageTotal) => {
    const sFee = Number(sessionFee) || 0;
    const pTot = Number(packageTotal) || 8;
    const calcPkgFee = sFee * pTot;
    setFormData(prev => ({
      ...prev,
      sessionFee: sFee,
      packageTotalSessions: pTot,
      packageFee: calcPkgFee,
      paidAmount: editingStudent ? prev.paidAmount : calcPkgFee,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('لطفاً نام هنرجو را وارد کنید.');
      return;
    }

    const payload = {
      ...formData,
      id: editingStudent ? editingStudent.name : `std-${Date.now()}`,
      packageTotalSessions: Number(formData.packageTotalSessions) || 8,
      sessionsCompleted: Number(formData.sessionsCompleted) || 0,
      sessionFee: Number(formData.sessionFee) || 0,
      packageFee: Number(formData.packageFee) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      debtAmount: Math.max(0, (Number(formData.packageFee) || 0) - (Number(formData.paidAmount) || 0)),
      assignments: editingStudent?.assignments || [],
      attendanceHistory: editingStudent?.attendanceHistory || []
    };

    onSave(payload);
    onClose();
  };

  const calculatedDebt = Math.max(0, (Number(formData.packageFee) || 0) - (Number(formData.paidAmount) || 0));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--accent-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                {editingStudent ? 'ویرایش پرونده هنرجو' : 'ثبت نام هنرجوی جدید'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                مشخصات فردی، ساز و هنر تخصصی، موقعیت کلاس و تنظیم بسته
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Row 1: Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                نام و نام خانوادگی هنرجو *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="مثال: کیهان کلهر"
                required
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                شماره تماس همراه
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="مثال: ۰۹۱۲۱۲۳۴۵۶۷"
                style={{ width: '100%', direction: 'ltr', textAlign: 'right' }}
              />
            </div>
          </div>

          {/* Row 2: Art Discipline & Level */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                ساز یا رشته تخصصی هنر *
              </label>
              <select
                value={formData.discipline}
                onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                style={{ width: '100%' }}
              >
                {ART_DISCIPLINES.map(art => (
                  <option key={art} value={art}>{art}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                سطح مهارتی هنرجو
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                style={{ width: '100%' }}
              >
                <option value="مقدماتی">مقدماتی (Level 1)</option>
                <option value="متوسط">متوسط (Level 2)</option>
                <option value="پیشرفته">پیشرفته (Level 3)</option>
                <option value="حرفه‌ای">حرفه‌ای / رپرتوار کنسرتی</option>
              </select>
            </div>
          </div>

          {/* Row 3: Location & Start Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                موقعیت / آموزشگاه *
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => handleLocationChange(e.target.value)}
                style={{ width: '100%' }}
              >
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} {loc.type === 'private' ? '(خصوصی)' : `(${loc.financialModel === 'studio_rent' ? 'پلاتو' : `${loc.academySharePercent}٪ سهم`})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                تاریخ شروع (شمسی)
              </label>
              <input
                type="text"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                placeholder="1403/07/01"
                style={{ width: '100%', direction: 'ltr', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Section: Package & Financial Setup */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                تنظیم بسته و وضعیت شهریه
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                کسر هوشمند جلسات بر اساس حضور و غیاب
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.85rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  تعداد کل جلسات بسته
                </label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formData.packageTotalSessions}
                  onChange={(e) => handleFeeChange(formData.sessionFee, e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  شهریه هر جلسه (تومان)
                </label>
                <input
                  type="number"
                  step="50000"
                  value={formData.sessionFee}
                  onChange={(e) => handleFeeChange(e.target.value, formData.packageTotalSessions)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  جلسات گذرانده (فعلی)
                </label>
                <input
                  type="number"
                  min="0"
                  max={formData.packageTotalSessions}
                  value={formData.sessionsCompleted}
                  onChange={(e) => setFormData({ ...formData, sessionsCompleted: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  شهریه کل دوره (تومان)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={formData.packageFee}
                  onChange={(e) => setFormData({ ...formData, packageFee: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  مبلغ پرداخت شده تاکنون (تومان)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={formData.paidAmount}
                  onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            {/* Live Debt indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '0.85rem',
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--border-color)',
              fontSize: '0.85rem'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>وضعیت حساب این بسته:</span>
              {calculatedDebt > 0 ? (
                <span style={{ color: '#fb7185', fontWeight: 700 }}>
                  بدهی معوقه: {formatToman(calculatedDebt)}
                </span>
              ) : (
                <span style={{ color: '#34d399', fontWeight: 700 }}>
                  تسویه کامل (بدون بدهی)
                </span>
              )}
            </div>
          </div>

          {/* Row 4: Preferred schedule & Teacher notes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                روز و ساعت توافق‌شده
              </label>
              <input
                type="text"
                value={formData.preferredDayTime}
                onChange={(e) => setFormData({ ...formData, preferredDayTime: e.target.value })}
                placeholder="مثال: یکشنبه‌ها ساعت ۱۶:۳۰"
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                یادداشت تکنیکی یا اهداف آموزشی استاد
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="مثال: نیاز به تمرین مداوم پدال و ریز مضراب"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              {editingStudent ? 'ذخیره پرونده هنرجو' : 'ثبت نام و ایجاد پرونده'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
