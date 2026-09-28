import React, { useState } from 'react';
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
  Landmark
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

  const handleEdit = (loc) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleDelete = (loc) => {
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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner & Action */}
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
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            مدیریت موقعیت‌ها و پروفایل آموزشگاه‌ها
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            دسته‌بندی کلاس‌ها به خصوصی/آنلاین، آموزشگاه‌های دارای سهم درصد، یا پلاتو با اجاره ثابت
          </p>
        </div>

        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>افزودن موقعیت جدید</span>
        </button>
      </div>

      {/* Grid of Location Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '1.25rem'
      }}>
        {locations.map((loc) => {
          const fin = calculateLocationFinancials(loc, students);
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
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                borderTop: `4px solid ${loc.color || 'var(--accent-amber)'}`
              }}
            >
              <div>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  <div>
                    <span className={`badge ${typeBadge.color}`} style={{ marginBottom: '0.45rem' }}>
                      {typeBadge.label}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {loc.name}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      onClick={() => handleEdit(loc)}
                      className="btn-ghost"
                      title="ویرایش موقعیت"
                      style={{ padding: '0.4rem', borderRadius: '8px' }}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(loc)}
                      className="btn-ghost"
                      title="حذف موقعیت"
                      style={{ padding: '0.4rem', borderRadius: '8px', color: 'var(--accent-rose)' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Model Tag */}
                <div style={{
                  padding: '0.65rem 0.85rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>مدل تسهیم درآمد:</span>
                  <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {loc.financialModel === 'studio_rent' ? (
                      `اجاره پلاتو: ${formatToman(loc.studioRentPerSession)} / جلسه`
                    ) : loc.type === 'private' ? (
                      '۱۰۰٪ عایدی مدرس (بدون کسر)'
                    ) : (
                      `سهم آموزشگاه: ${formatPercent(loc.academySharePercent)} (سهم مدرس: ${formatPercent(100 - loc.academySharePercent)})`
                    )}
                  </span>
                </div>

                {/* Live Financial Stats Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.2rem'
                }}>
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <UserCheck size={14} />
                      هنرجویان فعال
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.2rem' }}>
                      {toPersianDigits(fin.studentCount)} نفر
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {toPersianDigits(fin.totalSessionsHeld)} جلسه برگزار شده
                    </div>
                  </div>

                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.08)',
                    borderRadius: '10px',
                    border: '1px solid rgba(16, 185, 129, 0.25)'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Coins size={14} />
                      خالص دریافتی مدرس
                    </div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                      {formatToman(fin.teacherNetEarnings)}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      کسر سهم/اجاره: {formatToman(fin.academyOrStudioCost)}
                    </div>
                  </div>
                </div>

                {/* Address & Contact Details */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.2rem' }}>
                  {loc.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem' }}>
                      <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--text-muted)' }} />
                      <span>{loc.address}</span>
                    </div>
                  )}
                  {loc.contact && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={15} style={{ color: 'var(--text-muted)' }} />
                      <span>{loc.contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Action */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.9rem',
                borderTop: '1px solid var(--border-color)',
                marginTop: 'auto'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  نرخ هر جلسه: {formatToman(loc.defaultSessionPrice)}
                </span>
                
                <button
                  onClick={() => onSelectLocationFilter(loc.id)}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  <ExternalLink size={14} />
                  <span>هنرجویان ({toPersianDigits(fin.studentCount)})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <LocationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveLocation}
        editingLocation={editingLocation}
      />
    </div>
  );
}
