import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  Save, 
  RotateCcw,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { getTodayJalaliString, getTodayDayOfWeek, toPersianDigits, formatJalaliReadable } from '../../utils/jalali';
import { SessionCounter } from '../Common/SessionCounter';

export function AttendanceManager({ 
  students, 
  locations, 
  onBatchRecordAttendance,
  onRecordSingleAttendance 
}) {
  const [selectedDate, setSelectedDate] = useState(getTodayJalaliString());
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status map for today's session: { [studentId]: { status: 'present' | 'absent' | 'excused', note: '' } }
  const [attendanceState, setAttendanceState] = useState({});
  const [savedSuccessMessage, setSavedSuccessMessage] = useState(null);

  const filteredStudents = students.filter(s => {
    const matchesLoc = selectedLocation === 'all' || s.locationId === selectedLocation;
    const matchesSearch = s.name.includes(searchTerm) || s.discipline.includes(searchTerm);
    return matchesLoc && matchesSearch;
  });

  const handleStatusChange = (studentId, status) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNoteChange = (studentId, note) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        note
      }
    }));
  };

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceState };
    filteredStudents.forEach(s => {
      updated[s.id] = {
        ...(updated[s.id] || {}),
        status: 'present'
      };
    });
    setAttendanceState(updated);
  };

  const handleSubmitAttendance = (e) => {
    e.preventDefault();
    const recordsToSave = [];

    Object.entries(attendanceState).forEach(([studentId, data]) => {
      if (data && data.status) {
        recordsToSave.push({
          studentId,
          date: selectedDate,
          status: data.status,
          note: data.note || ''
        });
      }
    });

    if (recordsToSave.length === 0) {
      alert('لطفاً وضعیت حضور یا غیاب حداقل یک هنرجو را مشخص نمایید.');
      return;
    }

    onBatchRecordAttendance(recordsToSave);
    setAttendanceState({});
    setSavedSuccessMessage(`حضور و غیاب برای ${toPersianDigits(recordsToSave.length)} هنرجو با موفقیت ثبت و از بسته‌ها کسر گردید.`);
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
      {/* Top Banner */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              ثبت هوشمند حضور و غیاب کلاس‌ها
            </h2>
            <span className="badge badge-emerald" style={{ fontSize: '0.82rem' }}>
              کسر اتوماتیک از بسته
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            «حاضر» و «غایب» کسر ۱ جلسه از بسته | «کنسلی با هماهنگی» بدون کسر از بسته جهت جبرانی
          </p>
        </div>

        {/* Date Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.4rem 0.85rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)'
        }}>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            تاریخ جلسه ({getTodayDayOfWeek()}):
          </span>
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '120px', direction: 'ltr', textAlign: 'center', padding: '0.35rem 0.5rem', fontWeight: 700 }}
          />
        </div>
      </div>

      {savedSuccessMessage && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '12px',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.9rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={20} />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Control & Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem',
        background: 'var(--bg-card)',
        padding: '0.85rem 1.25rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی هنرجو یا ساز..."
              style={{ width: '100%', paddingRight: '2.5rem' }}
            />
          </div>

          {/* Location filter */}
          <div style={{ minWidth: '200px' }}>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="all">همه آموزشگاه‌ها و موقعیت‌ها</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem' }}
            title="علامت‌گذاری تمام افراد لیست به عنوان حاضر"
          >
            <CheckCheck size={16} />
            <span>حاضر بودن همه</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitAttendance}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem' }}
          >
            <Save size={16} />
            <span>ثبت نهایی حضور و غیاب</span>
          </button>
        </div>
      </div>

      {/* Attendance Students List */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        {filteredStudents.map(student => {
          const location = locations.find(l => l.id === student.locationId);
          const currentEntry = attendanceState[student.id] || {};
          const currentStatus = currentEntry.status || null;
          const remaining = Math.max(0, student.packageTotalSessions - student.sessionsCompleted);

          return (
            <div
              key={student.id}
              className="glass-card"
              style={{
                padding: '1.1rem 1.4rem',
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.1fr 1.6fr 1.2fr',
                alignItems: 'center',
                gap: '1.2rem',
                borderRight: currentStatus === 'present' 
                  ? '4px solid #10b981' 
                  : currentStatus === 'absent' 
                  ? '4px solid #f43f5e' 
                  : currentStatus === 'excused' 
                  ? '4px solid #f59e0b' 
                  : '4px solid transparent'
              }}
            >
              {/* Student identity */}
              <div>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {student.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span className="badge badge-amber" style={{ padding: '0.1rem 0.4rem', fontSize: '0.72rem' }}>
                    {student.discipline}
                  </span>
                  <span>{location?.name}</span>
                </div>
              </div>

              {/* Package Counter preview */}
              <div>
                <SessionCounter
                  total={student.packageTotalSessions}
                  completed={student.sessionsCompleted}
                  size="sm"
                  showText={true}
                />
              </div>

              {/* 3-State Attendance Selector */}
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                {/* Present (Deduct 1) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'present')}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.4rem',
                    borderRadius: '8px',
                    border: currentStatus === 'present' ? '1px solid #10b981' : '1px solid var(--border-color)',
                    background: currentStatus === 'present' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'present' ? '#34d399' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'present' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CheckCircle2 size={15} />
                  <span>حاضر (-۱)</span>
                </button>

                {/* Absent (Deduct 1) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.4rem',
                    borderRadius: '8px',
                    border: currentStatus === 'absent' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                    background: currentStatus === 'absent' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'absent' ? '#fb7185' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'absent' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <XCircle size={15} />
                  <span>غایب (-۱)</span>
                </button>

                {/* Excused (No deduction) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'excused')}
                  style={{
                    flex: 1.2,
                    padding: '0.55rem 0.4rem',
                    borderRadius: '8px',
                    border: currentStatus === 'excused' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                    background: currentStatus === 'excused' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'excused' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'excused' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.78rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="کنسلی با اطلاع قبلی - جلسه سوخت نمی‌شود"
                >
                  <Clock size={15} />
                  <span>کنسلی هماهنگ</span>
                </button>
              </div>

              {/* Session Note */}
              <div>
                <input
                  type="text"
                  placeholder="خلاصه درس یا یادداشت جلسه..."
                  value={currentEntry.note || ''}
                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                  style={{ width: '100%', fontSize: '0.82rem', padding: '0.45rem 0.65rem' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
