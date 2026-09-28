import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  MapPin, 
  Phone, 
  Calendar, 
  Award, 
  BookOpen, 
  History, 
  Wallet, 
  Plus, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Copy,
  MessageSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { toPersianDigits, formatJalaliReadable, getTodayJalaliString } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';
import { calculateStudentFinancials } from '../../utils/finance';
import { SessionCounter } from '../Common/SessionCounter';
import { AssignmentModal } from './AssignmentModal';
import { PackageRenewModal } from './PackageRenewModal';

export function StudentDetailModal({ 
  isOpen, 
  onClose, 
  student, 
  location, 
  onUpdateStudent,
  onOpenRenewModal,
  onOpenPaymentModal,
  onRecordQuickAttendance
}) {
  const [activeTab, setActiveTab] = useState('assignments'); // 'assignments', 'attendance', 'finance'
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [copiedReminder, setCopiedReminder] = useState(false);

  if (!isOpen || !student) return null;

  const fin = calculateStudentFinancials(student);
  const assignments = student.assignments || [];
  const attendanceList = [...(student.attendanceHistory || [])].reverse();

  const handleAddAssignment = (newAssignment) => {
    const updatedAssignments = [newAssignment, ...assignments];
    onUpdateStudent({
      ...student,
      assignments: updatedAssignments
    });
  };

  const handleUpdateAssignmentStatus = (asgId, newStatus) => {
    const updatedAssignments = assignments.map(a => 
      a.id === asgId ? { ...a, status: newStatus } : a
    );
    onUpdateStudent({
      ...student,
      assignments: updatedAssignments
    });
  };

  const handleGenerateReminderText = () => {
    let msg = `سلام و درود خدمت ${student.name} گرامی 🎶\n`;
    if (fin.isExpired) {
      msg += `بسته آموزشی شما (${toPersianDigits(student.packageTotalSessions)} جلسه‌ای) در کلاس ${student.discipline} به پایان رسیده است.\nلطفاً جهت هماهنگی و تمدید بسته دوره جدید اقدام فرمایید.`;
    } else if (fin.isRenewalAlert) {
      msg += `به اطلاع می‌رساند تنها ${toPersianDigits(fin.sessionsLeft)} جلسه از بسته آموزشی شما در کلاس ${student.discipline} باقی مانده است.\nجهت استمرار روند آموزش می‌توانید برای تمدید دوره اقدام نمایید.`;
    }
    if (fin.hasDebt) {
      msg += `\nهمچنین مانده بدهی معوقه شما مبلغ ${formatToman(fin.debt)} می‌باشد.`;
    }
    msg += `\nبا آرزوی موفقیت، استاد ${student.discipline}`;

    navigator.clipboard.writeText(msg);
    setCopiedReminder(true);
    setTimeout(() => setCopiedReminder(false), 2500);
  };

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        {/* Header Profile Bar */}
        <div style={{
          padding: '1.25rem 1.4rem',
          borderBottom: '1px solid var(--border-color)',
          background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.08) 0%, transparent 100%)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '0.85rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f59e0b, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: '#fff',
              fontWeight: 800,
              boxShadow: '0 6px 16px rgba(245, 158, 11, 0.3)',
              flexShrink: 0
            }}>
              {student.name.slice(0, 1)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{student.name}</h2>
                <span className="badge badge-amber">{student.discipline}</span>
                <span className="badge badge-violet">{student.level}</span>
                {location && (
                  <span className="badge badge-blue">
                    <MapPin size={12} />
                    {location.name}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                {student.phone && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={12} />
                    {toPersianDigits(student.phone)}
                  </span>
                )}
                <span>شروع: {toPersianDigits(student.startDate)}</span>
                {student.preferredDayTime && <span>زمان: {student.preferredDayTime}</span>}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={handleGenerateReminderText}
              className="btn btn-secondary"
              title="کپی متن پیام یادآوری برای هنرجو"
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', minHeight: '34px' }}
            >
              <MessageSquare size={14} />
              <span>{copiedReminder ? 'کپی شد!' : 'پیام یادآوری'}</span>
            </button>
            <button onClick={onClose} className="btn-ghost" style={{ padding: '0.4rem', borderRadius: '8px' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Dynamic Visual Session & Financial Bar - Responsive Stack */}
        <div style={{
          padding: '1rem 1.4rem',
          background: 'rgba(255, 255, 255, 0.02)',
          borderBottom: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          alignItems: 'center'
        }}>
          {/* Visual Session Beads */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              وضعیت بسته آموزشی ({toPersianDigits(student.sessionsCompleted)} از {toPersianDigits(student.packageTotalSessions)} جلسه برگزار شده):
            </div>
            <SessionCounter
              total={student.packageTotalSessions}
              completed={student.sessionsCompleted}
              size="lg"
              showText={true}
            />
          </div>

          {/* Quick Financial Summary */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            borderRadius: '12px',
            background: fin.hasDebt ? 'rgba(244, 63, 94, 0.1)' : 'rgba(16, 185, 129, 0.1)',
            border: fin.hasDebt ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
            flexWrap: 'wrap',
            gap: '0.6rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>وضعیت تسویه شهریه:</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: fin.hasDebt ? '#fb7185' : '#34d399', marginTop: '0.15rem' }}>
                {fin.hasDebt ? `بدهی: ${formatToman(fin.debt)}` : 'تسویه کامل'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                onClick={() => onOpenRenewModal(student)}
                className="btn btn-primary"
                style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', minHeight: '34px' }}
              >
                <RefreshCw size={13} />
                <span>تمدید دوره</span>
              </button>
              {fin.hasDebt && (
                <button
                  onClick={() => onOpenPaymentModal(student)}
                  className="btn btn-success"
                  style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem', minHeight: '34px' }}
                >
                  <Wallet size={13} />
                  <span>تسویه</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 1rem',
          background: 'rgba(0, 0, 0, 0.1)',
          overflowX: 'auto'
        }}>
          {[
            { id: 'assignments', label: 'تکالیف و تمرین‌ها', icon: BookOpen, count: assignments.length },
            { id: 'attendance', label: 'سوابق جلسات و حضور', icon: History, count: attendanceList.length },
            { id: 'finance', label: 'امور مالی و پرداخت‌ها', icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.85rem 1rem',
                  borderBottom: isActive ? '2px solid var(--accent-amber)' : '2px solid transparent',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    fontSize: '0.72rem',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '999px',
                    background: isActive ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.08)'
                  }}>
                    {toPersianDigits(tab.count)}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Contents - Scrollable Body */}
        <div className="modal-body-scrollable" style={{ padding: '1.25rem 1.4rem' }}>
          {/* TAB 1: Assignments & Practice */}
          {activeTab === 'assignments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  تاریخچه قطعات، اتودها و تکالیف تعیین‌شده توسط استاد
                </p>
                <button
                  onClick={() => setIsAssignmentModalOpen(true)}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', minHeight: '34px' }}
                >
                  <Plus size={15} />
                  <span>ثبت تکلیف جدید</span>
                </button>
              </div>

              {assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <BookOpen size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>هنوز تکلیفی برای این هنرجو ثبت نشده است.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {assignments.map((asg) => {
                    const statusTag = {
                      completed: { label: 'تایید و انجام شده', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: CheckCircle },
                      in_progress: { label: 'در حال تمرین', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: Clock },
                      needs_repeat: { label: 'نیاز به تکرار', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', icon: RotateCcw },
                    }[asg.status] || { label: 'در حال تمرین', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: Clock };

                    const StatusIcon = statusTag.icon;

                    return (
                      <div
                        key={asg.id}
                        style={{
                          padding: '1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.65rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.98rem', fontWeight: 700 }}>{asg.title}</h4>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.2rem 0.55rem',
                              borderRadius: '6px',
                              background: statusTag.bg,
                              color: statusTag.color,
                              fontSize: '0.75rem',
                              fontWeight: 600
                            }}>
                              <StatusIcon size={12} />
                              {statusTag.label}
                            </span>
                          </div>

                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            تاریخ ارائه: {toPersianDigits(asg.dateAssigned)}
                            {asg.dueDate && ` | مهلت: ${toPersianDigits(asg.dueDate)}`}
                          </div>
                        </div>

                        {asg.description && (
                          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {asg.description}
                          </p>
                        )}

                        {asg.teacherNote && (
                          <div style={{
                            padding: '0.5rem 0.8rem',
                            background: 'rgba(245, 158, 11, 0.08)',
                            borderRight: '3px solid var(--accent-amber)',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            color: 'var(--accent-gold)'
                          }}>
                            <strong>نظر استاد:</strong> {asg.teacherNote}
                          </div>
                        )}

                        {/* Quick Status toggle buttons */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          paddingTop: '0.5rem',
                          borderTop: '1px solid var(--border-color)',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>تغییر وضعیت:</span>
                          <button
                            onClick={() => handleUpdateAssignmentStatus(asg.id, 'completed')}
                            className="btn btn-ghost"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#34d399', minHeight: '30px' }}
                          >
                            تایید و تکمیل
                          </button>
                          <button
                            onClick={() => handleUpdateAssignmentStatus(asg.id, 'in_progress')}
                            className="btn btn-ghost"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#fbbf24', minHeight: '30px' }}
                          >
                            در حال تمرین
                          </button>
                          <button
                            onClick={() => handleUpdateAssignmentStatus(asg.id, 'needs_repeat')}
                            className="btn btn-ghost"
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#fb7185', minHeight: '30px' }}
                          >
                            نیاز به تکرار
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Attendance & Session History */}
          {activeTab === 'attendance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  سوابق حضور و غیاب در این بسته و جلسات قبلی
                </p>
                <button
                  onClick={() => onRecordQuickAttendance(student)}
                  className="btn btn-primary"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', minHeight: '34px' }}
                >
                  <Plus size={15} />
                  <span>ثبت جلسه جدید</span>
                </button>
              </div>

              {attendanceList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  <History size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <div>هنوز رکوردی برای حضور و غیاب ثبت نشده است.</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {attendanceList.map((att, idx) => {
                    const statusTag = {
                      present: { label: 'حاضر (کسر ۱ جلسه)', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: CheckCircle2 },
                      absent: { label: 'غایب غیرموجه (کسر جلسه)', bg: 'rgba(244, 63, 94, 0.15)', color: '#fb7185', icon: XCircle },
                      excused: { label: 'کنسلی با هماهنگی (بدون کسر)', bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: Clock },
                    }[att.status] || { label: 'حاضر', bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: CheckCircle2 };

                    const StatusIcon = statusTag.icon;

                    return (
                      <div
                        key={att.id || idx}
                        style={{
                          padding: '0.8rem 1rem',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '0.75rem',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                          <span style={{
                            padding: '0.2rem 0.55rem',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.06)',
                            fontWeight: 700,
                            fontSize: '0.82rem'
                          }}>
                            جلسه {toPersianDigits(att.sessionIndex)}
                          </span>

                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                            background: statusTag.bg,
                            color: statusTag.color,
                            fontSize: '0.76rem',
                            fontWeight: 600
                          }}>
                            <StatusIcon size={13} />
                            {statusTag.label}
                          </span>

                          {att.note && (
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                              {att.note}
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {formatJalaliReadable(att.date)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Finances & Ledger */}
          {activeTab === 'finance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '0.85rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>شهریه کل دوره فعلی:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    {formatToman(student.packageFee)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {toPersianDigits(student.packageTotalSessions)} جلسه (جلسه‌ای {formatToman(student.sessionFee)})
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#34d399' }}>مبلغ واریز شده:</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                    {formatToman(student.paidAmount)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    آخرین پرداخت: {toPersianDigits(student.lastPaymentDate || '—')}
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: fin.hasDebt ? 'rgba(244, 63, 94, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  border: fin.hasDebt ? '1px solid rgba(244, 63, 94, 0.25)' : '1px solid var(--border-color)',
                  borderRadius: '12px'
                }}>
                  <div style={{ fontSize: '0.78rem', color: fin.hasDebt ? '#fb7185' : 'var(--text-secondary)' }}>
                    مانده بدهی معوقه:
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: fin.hasDebt ? '#fb7185' : 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {formatToman(fin.debt)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {fin.hasDebt ? 'نیازمند پیگیری و تسویه' : 'تسویه کامل'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>مدیریت دوره‌ها و امور مالی</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    ثبت واریزی جدید یا تمدید دوره برای ۸ جلسه بعدی
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => onOpenPaymentModal(student)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                  >
                    <Wallet size={15} />
                    <span>ثبت واریزی</span>
                  </button>

                  <button
                    onClick={() => onOpenRenewModal(student)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.82rem', padding: '0.45rem 0.85rem' }}
                  >
                    <RefreshCw size={15} />
                    <span>تمدید دوره جدید</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Sub-dialogs */}
        <AssignmentModal
          isOpen={isAssignmentModalOpen}
          onClose={() => setIsAssignmentModalOpen(false)}
          onSave={handleAddAssignment}
        />
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
}
