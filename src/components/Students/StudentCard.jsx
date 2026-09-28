import React, { useState } from 'react';
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
  Wallet,
  ChevronDown,
  ChevronUp
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
  onRenew,
  isExpanded: controlledExpanded,
  onToggleExpand
}) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : internalExpanded;

  const toggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };

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
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'all 0.25s ease',
        borderRight: fin.isRenewalAlert ? '4px solid #f59e0b' : fin.hasDebt ? '4px solid #f43f5e' : '4px solid #10b981',
        overflow: 'hidden'
      }}
    >
      {/* Top Header - Always Visible & Clickable to Toggle Drawer */}
      <div 
        onClick={toggle}
        style={{
          padding: '1.1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.65rem',
          cursor: 'pointer',
          background: isExpanded ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
          borderBottom: isExpanded ? '1px solid var(--border-color)' : '1px solid transparent',
          transition: 'background 0.2s ease, border-color 0.2s ease',
          userSelect: 'none'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(139, 92, 246, 0.2))',
            color: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.2rem',
            fontWeight: 800,
            border: '1px solid rgba(245, 158, 11, 0.3)',
            flexShrink: 0
          }}>
            {student.name.slice(0, 1)}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
              <h3 style={{ 
                fontSize: '1.05rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {student.name}
              </h3>
              <span className={`badge ${levelColor}`} style={{ fontSize: '0.7rem', padding: '0.05rem 0.4rem' }}>
                {student.discipline}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>جلسه {toPersianDigits(student.sessionsCompleted)} از {toPersianDigits(student.packageTotalSessions)}</span>
              {fin.hasDebt && (
                <span style={{ color: '#fb7185', fontWeight: 600 }}>• بدهی: {formatToman(fin.debt)}</span>
              )}
              {fin.isRenewalAlert && !fin.hasDebt && (
                <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>• نیازمند تمدید</span>
              )}
            </div>
          </div>
        </div>

        {/* Toggle Chevron & Quick Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
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

      {/* Accordion Collapsible Drawer Content */}
      <div style={{
        maxHeight: isExpanded ? '600px' : '0px',
        opacity: isExpanded ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease, padding 0.25s ease',
        padding: isExpanded ? '1.1rem 1.25rem' : '0 1.25rem'
      }}>
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
          marginBottom: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.4rem'
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          {fin.hasDebt ? (
            <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
              <AlertCircle size={12} />
              بدهی معوقه: {formatToman(fin.debt)}
            </span>
          ) : (
            <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
              <CheckCircle2 size={11} />
              شهریه تسویه شده
            </span>
          )}

          {fin.isRenewalAlert && (
            <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
              <Sparkles size={12} />
              {fin.isExpired ? 'پایان بسته' : 'هشدار تمدید'}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          gap: '0.45rem',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => onQuickAttendance(student)}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '95px', padding: '0.45rem 0.5rem', fontSize: '0.78rem' }}
            title="ثبت سریع حضور و غیاب امروز"
          >
            <CheckCircle2 size={14} color="#34d399" />
            <span>حضور/غیاب</span>
          </button>

          <button
            onClick={() => onViewDetails(student)}
            className="btn btn-secondary"
            style={{ flex: 1, minWidth: '95px', padding: '0.45rem 0.5rem', fontSize: '0.78rem' }}
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
              <span>تمدید</span>
            </button>
          )}

          <div style={{ display: 'flex', gap: '0.2rem' }}>
            <button
              onClick={() => onEdit(student)}
              className="btn-ghost"
              title="ویرایش مشخصات"
              style={{ padding: '0.4rem', borderRadius: '6px' }}
            >
              <Edit3 size={15} />
            </button>
            <button
              onClick={() => onDelete(student)}
              className="btn-ghost"
              title="حذف هنرجو"
              style={{ padding: '0.4rem', borderRadius: '6px', color: 'var(--accent-rose)' }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
