import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Music, MapPin, Calendar, Award, Phone, DollarSign, Clock, BookOpen, Plus, Sparkles, Building2, Check } from 'lucide-react';
import { getTodayJalaliString, toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';

const ART_DISCIPLINES = [
  'نقاشی رنگ روغن',
  'طراحی و سیاه‌قلم',
  'آبرنگ و گواش',
  'اکریلیک و میکس‌مدیا',
  'نگارگری و تذهیب',
  'تصویرسازی و دیجیتال‌پینت',
  'خوشنویسی و خط تحریری',
  'سفالگری و سرامیک',
  'مجسمه‌سازی',
  'پیانو کلاسیک',
  'سنتور',
  'تار و سه‌تار',
  'گیتار کلاسیک و فلامنکو',
  'ویولن و کمانچه',
  'دف و تمبک',
  'آواز و صداسازی',
  'سایر رشته‌های هنری (تایپ دلخواه)'
];

export function StudentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  onSaveLocation, 
  locations = [], 
  editingStudent = null, 
  student = null 
}) {
  const activeStudent = editingStudent || student;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    discipline: 'نقاشی رنگ روغن',
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

  // Custom discipline toggle
  const [isCustomDiscipline, setIsCustomDiscipline] = useState(false);
  const [customDisciplineText, setCustomDisciplineText] = useState('');

  // Inline location creator state
  const [showInlineLocationForm, setShowInlineLocationForm] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState('academy');
  const [newLocShare, setNewLocShare] = useState(30);

  useEffect(() => {
    if (activeStudent) {
      const isKnownDiscipline = ART_DISCIPLINES.includes(activeStudent.discipline);
      setIsCustomDiscipline(!isKnownDiscipline && !!activeStudent.discipline);
      setCustomDisciplineText(!isKnownDiscipline ? (activeStudent.discipline || '') : '');

      setFormData({
        name: activeStudent.name || '',
        phone: activeStudent.phone || '',
        discipline: isKnownDiscipline ? activeStudent.discipline : 'سایر رشته‌های هنری (تایپ دلخواه)',
        level: activeStudent.level || 'متوسط',
        locationId: activeStudent.locationId || locations[0]?.id || '',
        startDate: activeStudent.startDate || getTodayJalaliString(),
        packageTotalSessions: activeStudent.packageTotalSessions ?? 8,
        sessionsCompleted: activeStudent.sessionsCompleted ?? 0,
        sessionFee: activeStudent.sessionFee ?? 500000,
        packageFee: activeStudent.packageFee ?? 4000000,
        paidAmount: activeStudent.paidAmount ?? 4000000,
        status: activeStudent.status || 'active',
        preferredDayTime: activeStudent.preferredDayTime || '',
        notes: activeStudent.notes || '',
      });
    } else {
      const defaultLoc = locations[0];
      const defaultSession = defaultLoc?.defaultSessionPrice || 500000;
      const defaultTotal = defaultLoc?.defaultPackageSessions || 8;
      const totalFee = defaultSession * defaultTotal;

      setIsCustomDiscipline(false);
      setCustomDisciplineText('');

      setFormData({
        name: '',
        phone: '',
        discipline: 'نقاشی رنگ روغن',
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
  }, [activeStudent, isOpen, locations]);

  // Keep locationId in sync if locations was empty and a location is now available
  useEffect(() => {
    if (!formData.locationId && locations.length > 0) {
      setFormData(prev => ({
        ...prev,
        locationId: locations[0].id,
        sessionFee: locations[0].defaultSessionPrice || prev.sessionFee,
        packageFee: (locations[0].defaultSessionPrice || prev.sessionFee) * prev.packageTotalSessions,
        paidAmount: activeStudent ? prev.paidAmount : ((locations[0].defaultSessionPrice || prev.sessionFee) * prev.packageTotalSessions)
      }));
    }
  }, [locations, formData.locationId, activeStudent]);

  if (!isOpen) return null;

  const handleLocationChange = (locId) => {
    const selectedLoc = locations.find(l => l.id === locId);
    if (selectedLoc && !activeStudent) {
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
      paidAmount: activeStudent ? prev.paidAmount : calcPkgFee,
    }));
  };

  // Instant 1-click creation of default private location
  const handleQuickCreatePrivateLocation = () => {
    const newLoc = {
      id: `loc-${Date.now()}`,
      name: 'کلاس‌های خصوصی و آزاد',
      type: 'private',
      financialModel: 'percentage',
      academySharePercent: 0,
      studioRentPerSession: 0,
      defaultSessionPrice: formData.sessionFee || 500000,
      defaultPackageSessions: formData.packageTotalSessions || 8,
      address: 'خصوصی / آنلاین',
      contact: '',
      notes: 'ایجاد شده از پنجره ثبت‌نام هنرجو',
      color: '#8b5cf6'
    };
    if (onSaveLocation) {
      onSaveLocation(newLoc);
    }
    setFormData(prev => ({ ...prev, locationId: newLoc.id }));
    setShowInlineLocationForm(false);
  };

  // Inline custom location creator
  const handleCreateInlineLocation = (e) => {
    e.preventDefault();
    if (!newLocName.trim()) {
      alert('لطفاً عنوان آموزشگاه یا موقعیت را وارد کنید.');
      return;
    }
    const newLoc = {
      id: `loc-${Date.now()}`,
      name: newLocName.trim(),
      type: newLocType,
      financialModel: newLocType === 'studio_rent' ? 'studio_rent' : 'percentage',
      academySharePercent: newLocType === 'private' ? 0 : Number(newLocShare) || 0,
      studioRentPerSession: 150000,
      defaultSessionPrice: Number(formData.sessionFee) || 500000,
      defaultPackageSessions: Number(formData.packageTotalSessions) || 8,
      address: '',
      contact: '',
      notes: '',
      color: '#f59e0b'
    };
    if (onSaveLocation) {
      onSaveLocation(newLoc);
    }
    setFormData(prev => ({ ...prev, locationId: newLoc.id }));
    setNewLocName('');
    setShowInlineLocationForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('لطفاً نام هنرجو را وارد کنید.');
      return;
    }

    // Determine final discipline
    let finalDiscipline = formData.discipline;
    if (isCustomDiscipline || formData.discipline === 'سایر رشته‌های هنری (تایپ دلخواه)') {
      finalDiscipline = customDisciplineText.trim() || 'هنرهای تجسمی';
    }

    // Ensure valid locationId - auto-create default location if none exists!
    let finalLocationId = formData.locationId;
    if (!finalLocationId || (!locations.some(l => l.id === finalLocationId) && locations.length === 0)) {
      const fallbackLoc = {
        id: `loc-${Date.now()}`,
        name: 'کلاس‌های خصوصی و آزاد',
        type: 'private',
        financialModel: 'percentage',
        academySharePercent: 0,
        studioRentPerSession: 0,
        defaultSessionPrice: Number(formData.sessionFee) || 500000,
        defaultPackageSessions: Number(formData.packageTotalSessions) || 8,
        address: 'خصوصی / آنلاین',
        contact: '',
        notes: 'موقعیت پیش‌فرض خودکار برای هنرجویان خصوصی',
        color: '#8b5cf6'
      };
      if (onSaveLocation) {
        onSaveLocation(fallbackLoc);
      }
      finalLocationId = fallbackLoc.id;
    }

    const payload = {
      ...formData,
      id: activeStudent ? activeStudent.id : `std-${Date.now()}`,
      discipline: finalDiscipline,
      locationId: finalLocationId,
      packageTotalSessions: Number(formData.packageTotalSessions) || 8,
      sessionsCompleted: Number(formData.sessionsCompleted) || 0,
      sessionFee: Number(formData.sessionFee) || 0,
      packageFee: Number(formData.packageFee) || 0,
      paidAmount: Number(formData.paidAmount) || 0,
      debtAmount: Math.max(0, (Number(formData.packageFee) || 0) - (Number(formData.paidAmount) || 0)),
      assignments: activeStudent?.assignments || [],
      attendanceHistory: activeStudent?.attendanceHistory || []
    };

    onSave(payload);
    onClose();
  };

  const calculatedDebt = Math.max(0, (Number(formData.packageFee) || 0) - (Number(formData.paidAmount) || 0));

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Header - Fixed */}
        <div className="modal-header-fixed">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              color: 'var(--accent-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                {activeStudent ? 'ویرایش پرونده هنرجو' : 'ثبت نام هنرجوی جدید'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                مشخصات فردی، ساز و هنر تخصصی، موقعیت کلاس و تنظیم بسته
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
            <X size={20} />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form id="studentForm" onSubmit={handleSubmit} className="modal-body-scrollable">
          {/* Row 1: Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
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
                style={{ direction: 'ltr', textAlign: 'right' }}
              />
            </div>
          </div>

          {/* Row 2: Art Discipline & Level */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  ساز یا رشته تخصصی هنر *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomDiscipline(!isCustomDiscipline)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-gold)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  {isCustomDiscipline ? 'انتخاب از لیست' : 'تایپ رشته دلخواه'}
                </button>
              </div>

              {isCustomDiscipline || formData.discipline === 'سایر رشته‌های هنری (تایپ دلخواه)' ? (
                <input
                  type="text"
                  value={customDisciplineText}
                  onChange={(e) => setCustomDisciplineText(e.target.value)}
                  placeholder="مثال: نقاشی مدرن، طراحی فیگور، گیتار الکتریک..."
                  required
                />
              ) : (
                <select
                  value={formData.discipline}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, discipline: val });
                    if (val === 'سایر رشته‌های هنری (تایپ دلخواه)') {
                      setIsCustomDiscipline(true);
                    }
                  }}
                >
                  {ART_DISCIPLINES.map(art => (
                    <option key={art} value={art}>{art}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                سطح مهارتی هنرجو
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              >
                <option value="مقدماتی">مقدماتی (Level 1)</option>
                <option value="متوسط">متوسط (Level 2)</option>
                <option value="پیشرفته">پیشرفته (Level 3)</option>
                <option value="حرفه‌ای">حرفه‌ای / رپرتوار کنسرتی</option>
              </select>
            </div>
          </div>

          {/* Row 3: Location & Start Date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    موقعیت / آموزشگاه *
                  </label>
                  {locations.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowInlineLocationForm(!showInlineLocationForm)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem'
                      }}
                    >
                      <Plus size={13} />
                      <span>{showInlineLocationForm ? 'بستن فرم آموزشگاه' : 'آموزشگاه جدید'}</span>
                    </button>
                  )}
                </div>

                {locations.length === 0 ? (
                  <div style={{
                    padding: '0.8rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '10px'
                  }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '0.35rem' }}>
                      هنوز هیچ آموزشگاه یا موقعیتی ثبت نشده است
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
                      می‌توانید همین حالا با یک کلیک موقعیت خصوصی بسازید یا مشخصات آموزشگاه را وارد کنید:
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleQuickCreatePrivateLocation}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Sparkles size={13} />
                        <span>ایجاد سریع کلاس خصوصی (پیش‌فرض)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowInlineLocationForm(true)}
                        className="btn btn-primary"
                        style={{ fontSize: '0.76rem', padding: '0.35rem 0.65rem' }}
                      >
                        <Plus size={13} />
                        <span>تعریف آموزشگاه جدید</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <select
                    value={formData.locationId}
                    onChange={(e) => handleLocationChange(e.target.value)}
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} {loc.type === 'private' ? '(خصوصی)' : `(${loc.financialModel === 'studio_rent' ? 'پلاتو' : `${loc.academySharePercent}٪ سهم`})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  تاریخ شروع دوره (شمسی)
                </label>
                <input
                  type="text"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  placeholder="1403/07/01"
                  style={{ direction: 'ltr', textAlign: 'center' }}
                />
              </div>
            </div>

            {/* Inline Location Creator Form */}
            {showInlineLocationForm && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '0.9rem',
                marginTop: '0.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                animation: 'fadeIn 0.2s ease-out'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    <Building2 size={16} />
                    <span>افزودن سریع آموزشگاه / موقعیت جدید</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowInlineLocationForm(false)}
                    className="btn-ghost"
                    style={{ padding: '0.2rem', fontSize: '0.75rem' }}
                  >
                    <X size={15} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.65rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                      عنوان آموزشگاه / موقعیت *
                    </label>
                    <input
                      type="text"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      placeholder="مثال: آموزشگاه کمال‌الملک"
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                      نوع موقعیت
                    </label>
                    <select
                      value={newLocType}
                      onChange={(e) => setNewLocType(e.target.value)}
                      style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                    >
                      <option value="academy">آموزشگاه رسمی (سهم درصدی)</option>
                      <option value="private">شاگرد خصوصی (بدون کسر)</option>
                      <option value="studio_rent">پلاتو / کارگاه (اجاره ثابت)</option>
                    </select>
                  </div>

                  {newLocType === 'academy' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', marginBottom: '0.25rem', color: 'var(--text-secondary)' }}>
                        درصد سهم آموزشگاه (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newLocShare}
                        onChange={(e) => setNewLocShare(e.target.value)}
                        style={{ fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowInlineLocationForm(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.76rem', padding: '0.35rem 0.7rem' }}
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateInlineLocation}
                    className="btn btn-primary"
                    style={{ fontSize: '0.76rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Check size={14} />
                    <span>ایجاد و انتخاب این آموزشگاه</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Section: Package & Financial Setup */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '1.1rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                تنظیم بسته و وضعیت شهریه
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                کسر هوشمند جلسات بر اساس حضور و غیاب
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '0.85rem' }}>
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
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.3rem', color: 'var(--text-secondary)' }}>
                  شهریه کل دوره (تومان)
                </label>
                <input
                  type="number"
                  step="100000"
                  value={formData.packageFee}
                  onChange={(e) => setFormData({ ...formData, packageFee: Number(e.target.value) })}
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                روز و ساعت توافق‌شده
              </label>
              <input
                type="text"
                value={formData.preferredDayTime}
                onChange={(e) => setFormData({ ...formData, preferredDayTime: e.target.value })}
                placeholder="مثال: یکشنبه‌ها ساعت ۱۶:۳۰"
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
              />
            </div>
          </div>
        </form>

        {/* Footer Actions - Fixed at bottom */}
        <div className="modal-footer-fixed">
          <button type="button" onClick={onClose} className="btn btn-secondary">
            انصراف
          </button>
          <button type="submit" form="studentForm" className="btn btn-primary">
            {activeStudent ? 'ذخیره پرونده هنرجو' : 'ثبت نام و ایجاد پرونده'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
