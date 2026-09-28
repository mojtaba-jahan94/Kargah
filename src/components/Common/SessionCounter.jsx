import React from 'react';
import { toPersianDigits } from '../../utils/jalali';
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function SessionCounter({ 
  total = 8, 
  completed = 0, 
  size = 'md', // 'sm', 'md', 'lg'
  showText = true,
  interactive = false,
  onSessionClick = null
}) {
  const safeTotal = Math.max(1, total);
  const safeCompleted = Math.max(0, Math.min(safeTotal, completed));
  const remaining = Math.max(0, safeTotal - safeCompleted);
  const isFinished = remaining === 0;
  const isNearEnd = remaining === 1;

  const dotSize = size === 'sm' ? 14 : size === 'lg' ? 24 : 18;
  const fontSize = size === 'sm' ? '0.72rem' : size === 'lg' ? '1rem' : '0.85rem';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      {/* Beads / Dots Row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: size === 'sm' ? '4px' : '7px',
        flexWrap: 'wrap'
      }}>
        {Array.from({ length: safeTotal }).map((_, idx) => {
          const isDone = idx < safeCompleted;
          const isCurrent = idx === safeCompleted;
          
          let bg = 'rgba(255, 255, 255, 0.08)';
          let border = '1px solid rgba(255, 255, 255, 0.15)';
          let shadow = 'none';

          if (isDone) {
            bg = 'linear-gradient(135deg, #10b981, #059669)';
            border = '1px solid #34d399';
            shadow = '0 2px 6px rgba(16, 185, 129, 0.35)';
          } else if (isCurrent) {
            bg = 'rgba(245, 158, 11, 0.2)';
            border = '1.5px dashed #f59e0b';
            shadow = '0 0 8px rgba(245, 158, 11, 0.3)';
          }

          return (
            <div
              key={idx}
              onClick={() => interactive && onSessionClick && onSessionClick(idx + 1)}
              title={`جلسه ${toPersianDigits(idx + 1)} ${isDone ? '(برگزار شده)' : isCurrent ? '(جلسه بعدی)' : '(باقی‌مانده)'}`}
              style={{
                width: `${dotSize}px`,
                height: `${dotSize}px`,
                borderRadius: '50%',
                background: bg,
                border: border,
                boxShadow: shadow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: size === 'lg' ? '0.7rem' : '0.6rem',
                color: isDone ? '#fff' : 'var(--text-secondary)',
                cursor: interactive ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
                fontWeight: 600,
                transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              {size === 'lg' && toPersianDigits(idx + 1)}
            </div>
          );
        })}
      </div>

      {/* Text summary & status badge */}
      {showText && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '0.5rem',
          fontSize: fontSize
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>جلسات:</span>
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              {toPersianDigits(safeCompleted)} از {toPersianDigits(safeTotal)}
            </span>
          </div>

          <div>
            {isFinished ? (
              <span className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                <AlertCircle size={12} />
                پایان بسته (تمدید)
              </span>
            ) : isNearEnd ? (
              <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                <Sparkles size={12} />
                ۱ جلسه مانده
              </span>
            ) : (
              <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                <CheckCircle2 size={12} />
                {toPersianDigits(remaining)} جلسه باقی‌مانده
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
