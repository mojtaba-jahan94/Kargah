import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  MapPin, 
  Percent, 
  Building2, 
  UserCheck, 
  Coins, 
  Phone, 
  Edit3, 
  Trash2, 
  ExternalLink,
  WalletCards,
  Landmark,
  ChevronDown,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import { toPersianDigits } from '../../utils/jalali';
import { formatToman, formatPercent } from '../../utils/formatters';
import { calculateLocationFinancials } from '../../utils/finance';
import { LocationModal } from './LocationModal';

export default function LocationList({ 
  locations, 
  students, 
  onSaveLocation, 
  onDeleteLocation, 
  onSelectLocationFilter 
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  // Accordion expanded state set (defaults to all expanded)
  const [expandedLocIds, setExpandedLocIds] = useState(() => new Set(locations.map(l => l.id)));

  // Automatically keep newly added locations expanded so they never render collapsed
  useEffect(() => {
    setExpandedLocIds(prev => {
      const next = new Set(prev);
      locations.forEach(l => next.add(l.id));
      return next;
    });
  }, [locations]);

  const isAllExpanded = locations.length > 0 && locations.every(l => expandedLocIds.has(l.id));

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedLocIds(new Set());
    } else {
      setExpandedLocIds(new Set(locations.map(l => l.id)));
    }
  };

  const toggleLocation = (id) => {
    setExpandedLocIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleEdit = (loc, e) => {
    e.stopPropagation();
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleSaveLocationInternal = (loc) => {
    onSaveLocation(loc);
    setExpandedLocIds(prev => new Set(prev).add(loc.id));
  };

  const handleDelete = (loc, e) => {
    e.stopPropagation();
    const studentCount = students.filter(s => s.locationId === loc.id).length;
    if (studentCount > 0) {
      if (!confirm(`این موقعیت دارای ${toPersianDigits(studentCount)} هنرجو است. آیا از حذف کامل آن مطمئن هستید؟`)) {
        return;
      }
    } else {
      if (!confirm(`آیا از حذف موقعیت «${loc.name}» مطمئن هستید؟`)) {
        return;
      }
    }
    onDeleteLocation(loc.id);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Action */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        background: 'var(--bg-glass)',
        padding: '1.25rem 1.4rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
      }}>
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
            مدیریت موقعیت‌ها و پروفایل آموزشگاه‌ها
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            دسته‌بندی کلاس‌ها به خصوصی/آنلاین، آموزشگاه‌های دارای سهم درصد، یا پلاتو با اجاره ثابت
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={toggleAll}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.8rem', minHeight: '36px' }}
          >
            {isAllExpanded ? <ChevronsUp size={15} /> : <ChevronsDown size={15} />}
            <span>{isAllExpanded ? 'جمع کردن همه' : 'باز کردن همه'}</span>
          </button>

          <button onClick={handleCreate} className="btn btn-primary" style={{ fontSize: '0.85rem', minHeight: '36px' }}>
            <Plus size={17} />
            <span>افزودن موقعیت جدید</span>
          </button>
        </div>
      </div>

      {/* Locations Display */}
      {locations.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          background: 'var(--bg-glass)',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <Building2 size={48} style={{ opacity: 0.35, marginBottom: '0.75rem', color: 'var(--accent-gold)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            هنوز هیچ آموزشگاه یا موقعیتی ثبت نکرده‌اید
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '460px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
            آموزشگاه‌ها، کلاس‌های خصوصی و پلاتوهای تمرین خود را اضافه کنید تا سهم درآمد و محاسبات مالی جلسات به طور خودکار انجام شود.
          </p>
          <button onClick={handleCreate} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={18} />
            <span>افزودن اولین آموزشگاه / کلاس خصوصی</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {locations.map((loc) => {
            const fin = calculateLocationFinancials(loc, students);
            const isExpanded = expandedLocIds.has(loc.id);

            const typeBadge = {
              private: { label: 'خصوصی / آنلاین', color: 'badge-violet' },
              academy: { label: 'آموزشگاه رسمی', color: 'badge-blue' },
              studio_rent: { label: 'اجاره پلاتو / کارگاه', color: 'badge-amber' },
            }[loc.type] || { label: 'سفارشی', color: 'badge-emerald' };

            return (
              <div 
                key={loc.id} 
                className="glass-card" 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: `4px solid ${loc.color || 'var(--accent-amber)'}`,
                  transition: 'all 0.25s ease'
                }}
              >
                {/* Card Header Row (Clickable Accordion Trigger) */}
                <div
                  onClick={() => toggleLocation(loc.id)}
                  style={{
                    padding: '1.1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    userSelect: 'none',
                    background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : 'transparent',
                    borderBottom: isExpanded ? '1px solid var(--border-color)' : '1px solid transparent',
                    transition: 'background 0.2s ease, border-color 0.2s ease'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.25rem' }}>
                      <span className={`badge ${typeBadge.color}`} style={{ fontSize: '0.7rem', padding: '0.05rem 0.45rem' }}>
                        {typeBadge.label}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        • {toPersianDigits(fin.studentCount)} هنرجو
                      </span>
                    </div>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {loc.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600, marginTop: '0.15rem' }}>
                      خالص دریافتی: {formatToman(fin.teacherNetEarnings)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}>
                    <button
                      onClick={(e) => handleEdit(loc, e)}
                      className="btn-ghost"
                      title="ویرایش موقعیت"
                      style={{ padding: '0.35rem', borderRadius: '6px' }}
                    >
                      <Edit3 size={15} />
                    </button>

                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-secondary)',
                      transition: 'transform 0.25s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                    }}>
                      <ChevronDown size={18} />
                    </div>
                  </div>
                </div>

                {/* Accordion Drawer Body */}
                <div style={{
                  maxHeight: isExpanded ? '600px' : '0px',
                  opacity: isExpanded ? 1 : 0,
                  overflow: 'hidden',
                  transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
                  padding: isExpanded ? '1.1rem 1.25rem' : '0 1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem'
                }}>
                  {/* Model Tag */}
                  <div style={{
                    padding: '0.6rem 0.8rem',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    fontSize: '0.8rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.35rem'
                  }}>
                    <span style={{ color: 'var(--text-secondary)' }}>مدل تسهیم درآمد:</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                      {loc.financialModel === 'studio_rent' ? (
                        `اجاره پلاتو: ${formatToman(loc.studioRentPerSession)} / جلسه`
                      ) : loc.type === 'private' ? (
                        '۱۰۰٪ عایدی مدرس (بدون کسر)'
                      ) : (
                        `سهم آموزشگاه: ${formatPercent(loc.academySharePercent)} (مدرس: ${formatPercent(100 - loc.academySharePercent)})`
                      )}
                    </span>
                  </div>

                  {/* Live Financial Stats Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '0.65rem'
                  }}>
                    <div style={{
                      padding: '0.7rem',
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <UserCheck size={13} />
                        هنرجویان
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.15rem' }}>
                        {toPersianDigits(fin.studentCount)} نفر
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {toPersianDigits(fin.totalSessionsHeld)} جلسه
                      </div>
                    </div>

                    <div style={{
                      padding: '0.7rem',
                      background: 'rgba(16, 185, 129, 0.08)',
                      borderRadius: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}>
                      <div style={{ fontSize: '0.72rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Coins size={13} />
                        خالص مدرس
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399', marginTop: '0.15rem' }}>
                        {formatToman(fin.teacherNetEarnings)}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        کسر: {formatToman(fin.academyOrStudioCost)}
                      </div>
                    </div>
                  </div>

                  {/* Address & Contact Details */}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {loc.address && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                        <MapPin size={14} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
                        <span>{loc.address}</span>
                      </div>
                    )}
                    {loc.contact && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Phone size={14} style={{ color: 'var(--text-muted)' }} />
                        <span>{loc.contact}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid var(--border-color)',
                    marginTop: 'auto',
                    gap: '0.5rem',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => onSelectLocationFilter(loc.id)}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.45rem 0.75rem', fontSize: '0.78rem', minHeight: '34px' }}
                    >
                      <ExternalLink size={13} />
                      <span>مشاهده هنرجویان ({toPersianDigits(fin.studentCount)})</span>
                    </button>

                    <button
                      onClick={(e) => handleDelete(loc, e)}
                      className="btn btn-danger"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.78rem', minHeight: '34px' }}
                      title="حذف موقعیت"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLocationInternal}
        editingLocation={editingLocation}
      />
    </div>
  );
}
