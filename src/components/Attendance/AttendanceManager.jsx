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
  AlertCircle,
  Calendar
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
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        background: 'var(--bg-glass)',
        padding: '1.25rem 1.4rem',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              ثبت هوشمند حضور و غیاب کلاس‌ها
            </h2>
            <span className="badge badge-emerald" style={{ fontSize: '0.8rem' }}>
              کسر خودکار از بسته
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            «حاضر» و «غایب» کسر ۱ جلسه | «کنسلی با هماهنگی» بدون کسر جهت جلسه جبرانی
          </p>
        </div>

        {/* Date Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '0.4rem 0.75rem',
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            تاریخ جلسه ({getTodayDayOfWeek()}):
          </span>
          <input
            type="text"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ width: '110px', direction: 'ltr', textAlign: 'center', padding: '0.35rem 0.5rem', fontWeight: 700 }}
          />
          <button
            type="button"
            onClick={() => setSelectedDate(getTodayJalaliString())}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', minHeight: '30px' }}
          >
            امروز
          </button>
        </div>
      </div>

      {savedSuccessMessage && (
        <div style={{
          padding: '0.85rem 1.2rem',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '12px',
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Control & Filters */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        background: 'var(--bg-card)',
        padding: '0.85rem 1.2rem',
        borderRadius: '14px',
        border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap', minWidth: '260px' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search size={15} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="جستجوی هنرجو یا ساز..."
              style={{ width: '100%', paddingRight: '2.4rem' }}
            />
          </div>

          {/* Location filter */}
          <div style={{ flex: 1, minWidth: '180px' }}>
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

        <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between', marginTop: '0.25rem' }}>
          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="btn btn-secondary"
            style={{ fontSize: '0.82rem', flex: 1 }}
          >
            <CheckCheck size={16} />
            <span>حاضر بودن همه</span>
          </button>

          <button
            type="button"
            onClick={handleSubmitAttendance}
            className="btn btn-primary"
            style={{ fontSize: '0.85rem', flex: 1.2 }}
          >
            <Save size={16} />
            <span>ثبت نهایی حضور/غیاب</span>
          </button>
        </div>
      </div>

      {/* Attendance Students List - Highly Mobile Optimized */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredStudents.map(student => {
          const location = locations.find(l => l.id === student.locationId);
          const currentEntry = attendanceState[student.id] || {};
          const currentStatus = currentEntry.status || null;

          return (
            <div
              key={student.id}
              className="glass-card"
              style={{
                padding: '1.1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                borderRight: currentStatus === 'present' 
                  ? '4px solid #10b981' 
                  : currentStatus === 'absent' 
                  ? '4px solid #f43f5e' 
                  : currentStatus === 'excused' 
                  ? '4px solid #f59e0b' 
                  : '4px solid transparent'
              }}
            >
              {/* Header Row: Student info & Session status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.02rem', color: 'var(--text-primary)' }}>
                    {student.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                    <span className="badge badge-amber" style={{ padding: '0.1rem 0.45rem', fontSize: '0.72rem' }}>
                      {student.discipline}
                    </span>
                    <span>•</span>
                    <span>{location?.name}</span>
                    {student.preferredDayTime && (
                      <>
                        <span>•</span>
                        <span style={{ color: 'var(--text-muted)' }}>{student.preferredDayTime}</span>
                      </>
                    )}
                  </div>
                </div>

                <div style={{ minWidth: '150px' }}>
                  <SessionCounter
                    total={student.packageTotalSessions}
                    completed={student.sessionsCompleted}
                    size="sm"
                    showText={true}
                  />
                </div>
              </div>

              {/* 3-State Attendance Selector Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1.2fr',
                gap: '0.45rem'
              }}>
                {/* Present (Deduct 1) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'present')}
                  style={{
                    padding: '0.65rem 0.35rem',
                    borderRadius: '8px',
                    border: currentStatus === 'present' ? '1px solid #10b981' : '1px solid var(--border-color)',
                    background: currentStatus === 'present' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'present' ? '#34d399' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'present' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>حاضر (-۱)</span>
                </button>

                {/* Absent (Deduct 1) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'absent')}
                  style={{
                    padding: '0.65rem 0.35rem',
                    borderRadius: '8px',
                    border: currentStatus === 'absent' ? '1px solid #f43f5e' : '1px solid var(--border-color)',
                    background: currentStatus === 'absent' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'absent' ? '#fb7185' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'absent' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.82rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <XCircle size={16} />
                  <span>غایب (-۱)</span>
                </button>

                {/* Excused (No deduction) */}
                <button
                  type="button"
                  onClick={() => handleStatusChange(student.id, 'excused')}
                  style={{
                    padding: '0.65rem 0.35rem',
                    borderRadius: '8px',
                    border: currentStatus === 'excused' ? '1px solid #f59e0b' : '1px solid var(--border-color)',
                    background: currentStatus === 'excused' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                    color: currentStatus === 'excused' ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fontWeight: currentStatus === 'excused' ? 700 : 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem',
                    fontSize: '0.8rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="کنسلی با اطلاع قبلی - جلسه سوخت نمی‌شود"
                >
                  <Clock size={16} />
                  <span>کنسلی هماهنگ</span>
                </button>
              </div>

              {/* Session Note */}
              <div>
                <input
                  type="text"
                  placeholder="خلاصه درس، قطعه تدریس‌شده یا علت غیبت/کنسلی..."
                  value={currentEntry.note || ''}
                  onChange={(e) => handleNoteChange(student.id, e.target.value)}
                  style={{ fontSize: '0.82rem', padding: '0.55rem 0.75rem' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
