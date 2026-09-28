import React from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  ExternalLink,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';
import { calculateStudentFinancials } from '../../utils/finance';
import { SessionCounter } from '../Common/SessionCounter';

export function StudentCard({ 
  student, 
  location, 
  onViewDetails, 
  onEdit, 
  onDelete, 
  onQuickAttendance, 
  onRenew 
}) {
  const fin = calculateStudentFinancials(student);

  const levelColor = {
    'مقدماتی': 'badge-blue',
    'متوسط': 'badge-amber',
    'پیشرفته': 'badge-violet',
    'حرفه‌ای': 'badge-emerald',
  }[student.level] || 'badge-amber';

  return (
    <div 
      className="glass-card" 
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        position: 'relative',
        transition: 'all 0.2s ease',
        borderRight: fin.isRenewalAlert ? '4px solid #f59e0b' : fin.hasDebt ? '4px solid #f43f5e' : '4px solid #10b981'
      }}
    >
      {/* Top Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2))',
              color: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              fontWeight: 800,
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}>
              {student.name.slice(0, 1)}
            </div>

            <div>
              <h3 
                onClick={() => onViewDetails(student)}
                style={{ 
                  fontSize: '1.08rem', 
                  fontWeight: 700, 
                  color: 'var(--text-primary)', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <span>{student.name}</span>
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                <span className={`badge ${levelColor}`} style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem' }}>
                  {student.discipline} ({student.level})
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button
              onClick={() => onEdit(student)}
              className="btn-ghost"
              title="ویرایش مشخصات"
              style={{ padding: '0.35rem', borderRadius: '6px' }}
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(student)}
              className="btn-ghost"
              title="حذف هنرجو"
              style={{ padding: '0.35rem', borderRadius: '6px', color: 'var(--accent-rose)' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Location & Preferred time */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          padding: '0.45rem 0.65rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.02)',
          marginBottom: '0.85rem'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <MapPin size={13} color="var(--accent-amber)" />
            {location?.name || 'موقعیت نامشخص'}
          </span>
          {student.preferredDayTime && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)' }}>
              <Clock size={12} />
              {student.preferredDayTime}
            </span>
          )}
        </div>

        {/* Visual Session Beads */}
        <div style={{ marginBottom: '0.85rem' }}>
          <SessionCounter
            total={student.packageTotalSessions}
            completed={student.sessionsCompleted}
            size="md"
            showText={true}
          />
        </div>

        {/* Financial Badges & Alerts */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
          {fin.hasDebt ? (
            <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
              <AlertCircle size={12} />
              بدهی: {formatToman(fin.debt)}
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              <CheckCircle2 size={11} />
              تسویه کامل
            </span>
          )}

          {fin.isRenewalAlert && (
            <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={12} />
              {fin.isExpired ? 'پایان بسته' : 'هشدار تمدید'}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border-color)',
        gap: '0.5rem'
      }}>
        <button
          onClick={() => onQuickAttendance(student)}
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
          title="ثبت سریع حضور و غیاب امروز"
        >
          <CheckCircle2 size={14} color="#34d399" />
          <span>حضور/غیاب</span>
        </button>

        <button
          onClick={() => onViewDetails(student)}
          className="btn btn-secondary"
          style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
          title="مشاهده تکالیف و پرونده کامل"
        >
          <ExternalLink size={14} />
          <span>پرونده</span>
        </button>

        {fin.isRenewalAlert && (
          <button
            onClick={() => onRenew(student)}
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.65rem', fontSize: '0.78rem' }}
            title="تمدید بسته جدید"
          >
            <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
