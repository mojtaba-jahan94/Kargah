import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  Table, 
  Sparkles, 
  AlertCircle, 
  MapPin, 
  Calendar, 
  Edit3, 
  Trash2, 
  ExternalLink,
  Users,
  ChevronsDown,
  ChevronsUp
} from 'lucide-react';
import { toPersianDigits } from '../../utils/jalali';
import { formatToman } from '../../utils/formatters';
import { calculateStudentFinancials } from '../../utils/finance';
import { StudentCard } from './StudentCard';
import { StudentModal } from './StudentModal';
import { StudentDetailModal } from './StudentDetailModal';
import { PackageRenewModal } from './PackageRenewModal';

export default function StudentList({ 
  students, 
  locations, 
  onSaveStudent, 
  onSaveLocation,
  onDeleteStudent, 
  onUpdateStudent, 
  onRenewPackage,
  onRecordQuickAttendance,
  onOpenPaymentModal,
  selectedLocationFilter = 'all'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState(selectedLocationFilter);
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'renewal', 'debt'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Set of expanded card IDs (defaults to all expanded)
  const [expandedIds, setExpandedIds] = useState(() => new Set(students.map(s => s.id)));

  // Automatically keep newly added students expanded
  useEffect(() => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      students.forEach(s => next.add(s.id));
      return next;
    });
  }, [students]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);
  const [renewingStudent, setRenewingStudent] = useState(null);

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.discipline.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.phone && student.phone.includes(searchTerm));

    const matchesLocation = locationFilter === 'all' || student.locationId === locationFilter;
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;

    const fin = calculateStudentFinancials(student);
    let matchesStatus = true;
    if (statusFilter === 'renewal') {
      matchesStatus = fin.isRenewalAlert;
    } else if (statusFilter === 'debt') {
      matchesStatus = fin.hasDebt;
    }

    return matchesSearch && matchesLocation && matchesLevel && matchesStatus;
  });

  const toggleExpandStudent = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isAllExpanded = filteredStudents.length > 0 && filteredStudents.every(s => expandedIds.has(s.id));

  const toggleAll = () => {
    if (isAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(students.map(s => s.id)));
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleSaveStudentInternal = (studentData) => {
    onSaveStudent(studentData);
    setExpandedIds(prev => new Set(prev).add(studentData.id));
  };

  const handleDelete = (student) => {
    if (confirm(`آیا از حذف پرونده هنرجو «${student.name}» اطمینان دارید؟`)) {
      onDeleteStudent(student.id);
    }
  };

  const handleRenew = (student) => {
    setRenewingStudent(student);
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Top Banner & Control Bar */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              کارت وضعیت و مدیریت هنرجویان
            </h2>
            <span className="badge badge-amber" style={{ fontSize: '0.8rem' }}>
              {toPersianDigits(filteredStudents.length)} هنرجو
            </span>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            ثبت پرونده، رشته تخصصی هنر، تاریخچه تکالیف، شمارنده جلسات و وضعیت مالی
          </p>
        </div>

        <button onClick={handleCreate} className="btn btn-primary">
          <Plus size={18} />
          <span>ثبت نام هنرجوی جدید</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
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
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '220px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="جستجوی نام هنرجو یا ساز / هنر..."
            style={{ width: '100%', paddingRight: '2.5rem' }}
          />
        </div>

        {/* Location Dropdown */}
        <div style={{ minWidth: '170px', flex: 1 }}>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">همه موقعیت‌ها و آموزشگاه‌ها</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Level Dropdown */}
        <div style={{ minWidth: '130px' }}>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="all">همه سطوح</option>
            <option value="مقدماتی">مقدماتی</option>
            <option value="متوسط">متوسط</option>
            <option value="پیشرفته">پیشرفته</option>
            <option value="حرفه‌ای">حرفه‌ای</option>
          </select>
        </div>

        {/* Status Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '10px' }}>
          <button
            onClick={() => setStatusFilter('all')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: statusFilter === 'all' ? 600 : 400,
              background: statusFilter === 'all' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: statusFilter === 'all' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            همه
          </button>
          <button
            onClick={() => setStatusFilter('renewal')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: statusFilter === 'renewal' ? 600 : 400,
              background: statusFilter === 'renewal' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: statusFilter === 'renewal' ? 'var(--accent-gold)' : 'var(--text-secondary)'
            }}
          >
            تمدید
          </button>
          <button
            onClick={() => setStatusFilter('debt')}
            style={{
              padding: '0.35rem 0.65rem',
              borderRadius: '7px',
              fontSize: '0.78rem',
              fontWeight: statusFilter === 'debt' ? 600 : 400,
              background: statusFilter === 'debt' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
              color: statusFilter === 'debt' ? '#fb7185' : 'var(--text-secondary)'
            }}
          >
            بدهی
          </button>
        </div>

        {/* Accordion Expand All / Collapse All Toggle */}
        {viewMode === 'grid' && (
          <button
            type="button"
            onClick={toggleAll}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.75rem', fontSize: '0.78rem', minHeight: '34px' }}
            title={isAllExpanded ? 'جمع کردن تمام کارت‌ها' : 'باز کردن تمام کارت‌ها'}
          >
            {isAllExpanded ? <ChevronsUp size={15} /> : <ChevronsDown size={15} />}
            <span>{isAllExpanded ? 'جمع کردن همه' : 'باز کردن همه'}</span>
          </button>
        )}

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.2rem', background: 'rgba(0,0,0,0.2)', padding: '0.2rem', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('grid')}
            className="btn-ghost"
            style={{
              padding: '0.35rem',
              borderRadius: '6px',
              background: viewMode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: viewMode === 'grid' ? 'var(--accent-gold)' : 'var(--text-muted)'
            }}
            title="نمای کارتی"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className="btn-ghost"
            style={{
              padding: '0.35rem',
              borderRadius: '6px',
              background: viewMode === 'table' ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: viewMode === 'table' ? 'var(--accent-gold)' : 'var(--text-muted)'
            }}
            title="نمای جدولی"
          >
            <Table size={16} />
          </button>
        </div>
      </div>

      {/* Main Students Display */}
      {students.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          background: 'var(--bg-glass)',
          borderRadius: '16px',
          border: '1px dashed var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <Users size={48} style={{ opacity: 0.35, marginBottom: '0.75rem', color: 'var(--accent-violet)' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            هنوز هیچ هنرجویی ثبت‌نام نشده است
          </h3>
          <p style={{ fontSize: '0.85rem', maxWidth: '440px', margin: '0 auto 1.25rem', lineHeight: 1.6 }}>
            با ثبت‌نام هنرجو، می‌توانید جلسات بسته، تاریخچه تکالیف و وضعیت حضور و غیاب را در فضایی مرتب و متمرکز دنبال کنید.
          </p>
          <button onClick={handleCreate} className="btn btn-primary" style={{ margin: '0 auto' }}>
            <Plus size={18} />
            <span>ثبت‌نام اولین هنرجو</span>
          </button>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '3.5rem 1.5rem',
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          color: 'var(--text-muted)'
        }}>
          <Users size={44} style={{ opacity: 0.3, marginBottom: '0.65rem' }} />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>هنرجویی با این مشخصات یافت نشد</h3>
          <p style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>با تغییر عبارت جستجو یا فیلترها دوباره تلاش کنید.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1rem'
        }}>
          {filteredStudents.map(student => {
            const location = locations.find(l => l.id === student.locationId);
            return (
              <StudentCard
                key={student.id}
                student={student}
                location={location}
                isExpanded={expandedIds.has(student.id)}
                onToggleExpand={() => toggleExpandStudent(student.id)}
                onViewDetails={(s) => setSelectedStudentForDetail(s)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onQuickAttendance={onRecordQuickAttendance}
                onRenew={handleRenew}
              />
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.9rem 1.2rem' }}>هنرجو</th>
                <th style={{ padding: '0.9rem 1rem' }}>ساز / رشته</th>
                <th style={{ padding: '0.9rem 1rem' }}>موقعیت</th>
                <th style={{ padding: '0.9rem 1rem' }}>وضعیت جلسات</th>
                <th style={{ padding: '0.9rem 1rem' }}>وضعیت مالی</th>
                <th style={{ padding: '0.9rem 1.2rem', textAlign: 'left' }}>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const location = locations.find(l => l.id === student.locationId);
                const fin = calculateStudentFinancials(student);
                return (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.15s' }}>
                    <td style={{ padding: '0.85rem 1.2rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{student.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{toPersianDigits(student.phone)}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-amber">{student.discipline}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{student.level}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{ fontSize: '0.85rem' }}>{location?.name || '—'}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700 }}>
                          {toPersianDigits(student.sessionsCompleted)} / {toPersianDigits(student.packageTotalSessions)}
                        </span>
                        {fin.isExpired ? (
                          <span className="badge badge-rose" style={{ fontSize: '0.7rem' }}>پایان بسته</span>
                        ) : fin.isRenewalAlert ? (
                          <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}>۱ مانده</span>
                        ) : null}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      {fin.hasDebt ? (
                        <span style={{ color: '#fb7185', fontWeight: 700 }}>بدهی: {formatToman(fin.debt)}</span>
                      ) : (
                        <span style={{ color: '#34d399', fontWeight: 600 }}>تسویه شده</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1.2rem', textAlign: 'left' }}>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setSelectedStudentForDetail(student)}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.7rem', fontSize: '0.78rem' }}
                        >
                          پرونده
                        </button>
                        <button
                          onClick={() => handleEdit(student)}
                          className="btn-ghost"
                          style={{ padding: '0.35rem' }}
                        >
                          <Edit3 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudentInternal}
        onSaveLocation={onSaveLocation}
        locations={locations}
        editingStudent={editingStudent}
      />

      {selectedStudentForDetail && (
        <StudentDetailModal
          isOpen={!!selectedStudentForDetail}
          onClose={() => setSelectedStudentForDetail(null)}
          student={selectedStudentForDetail}
          location={locations.find(l => l.id === selectedStudentForDetail.locationId)}
          onUpdateStudent={(updated) => {
            onUpdateStudent(updated);
            setSelectedStudentForDetail(updated);
          }}
          onOpenRenewModal={(s) => {
            setSelectedStudentForDetail(null);
            setRenewingStudent(s);
          }}
          onOpenPaymentModal={(s) => {
            setSelectedStudentForDetail(null);
            onOpenPaymentModal(s);
          }}
          onRecordQuickAttendance={(s) => {
            setSelectedStudentForDetail(null);
            onRecordQuickAttendance(s);
          }}
        />
      )}

      {renewingStudent && (
        <PackageRenewModal
          isOpen={!!renewingStudent}
          onClose={() => setRenewingStudent(null)}
          onRenew={onRenewPackage}
          student={renewingStudent}
          location={locations.find(l => l.id === renewingStudent.locationId)}
        />
      )}
    </div>
  );
}
