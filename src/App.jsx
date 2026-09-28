import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import LocationList from './components/Locations/LocationList';
import StudentList from './components/Students/StudentList';
import { AttendanceManager } from './components/Attendance/AttendanceManager';
import WalletOverview from './components/Wallet/WalletOverview';
import { StudentDetailModal } from './components/Students/StudentDetailModal';
import { PackageRenewModal } from './components/Students/PackageRenewModal';
import { PaymentModal } from './components/Wallet/PaymentModal';
import { InstallPWA } from './components/Common/InstallPWA';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/Auth/AuthModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { Loader2 } from 'lucide-react';

import { 
  loadStoredData, 
  saveLocationsToStorage, 
  saveStudentsToStorage, 
  savePaymentsToStorage, 
  exportBackupJSON,
  clearAllAppData
} from './data/storage';
import { calculateGlobalStats } from './utils/finance';

function AppContent({ setAppBridge }) {
  const [data, setData] = useState(() => loadStoredData());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('all');

  // Modals controlled from App level
  const [selectedStudentForDetailId, setSelectedStudentForDetailId] = useState(null);
  const [selectedStudentForRenew, setSelectedStudentForRenew] = useState(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { storageMode, pushToServer, isAuthenticated, isAuthLoading } = useAuth();
  const isInitialMount = useRef(true);

  // Clear all data (demo/storage reset)
  const handleClearAllData = () => {
    const emptyData = clearAllAppData();
    setData(emptyData);
    if (storageMode === 'server' && isAuthenticated) {
      pushToServer(emptyData);
    }
  };

  // Sync to localStorage
  useEffect(() => {
    saveLocationsToStorage(data.locations);
  }, [data.locations]);

  useEffect(() => {
    saveStudentsToStorage(data.students);
  }, [data.students]);

  useEffect(() => {
    savePaymentsToStorage(data.payments);
  }, [data.payments]);

  // Auto-sync to Turso server when in server mode and logged in
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (storageMode === 'server' && isAuthenticated) {
      const timer = setTimeout(() => {
        pushToServer(data);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data, storageMode, isAuthenticated, pushToServer]);

  // Handler for applying data loaded from Turso server
  const handleApplyServerData = useCallback((serverData) => {
    if (serverData && (serverData.locations || serverData.students)) {
      setData(prev => ({
        locations: serverData.locations || prev.locations,
        students: serverData.students || prev.students,
        payments: serverData.payments || prev.payments,
      }));
    }
  }, []);

  // Expose methods to parent AuthProvider
  useEffect(() => {
    if (setAppBridge) {
      setAppBridge({
        applyServerData: handleApplyServerData,
        getData: () => data
      });
    }
  }, [setAppBridge, handleApplyServerData, data]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Scroll to top on tab switch
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Location Handlers
  const handleSaveLocation = (location) => {
    setData(prev => {
      const exists = prev.locations.some(l => l.id === location.id);
      const updatedLocations = exists
        ? prev.locations.map(l => (l.id === location.id ? location : l))
        : [...prev.locations, location];
      return { ...prev, locations: updatedLocations };
    });
  };

  const handleDeleteLocation = (locationId) => {
    setData(prev => ({
      ...prev,
      locations: prev.locations.filter(l => l.id !== locationId),
      students: prev.students.map(s => 
        s.locationId === locationId ? { ...s, locationId: prev.locations[0]?.id || '' } : s
      )
    }));
  };

  // Student Handlers
  const handleSaveStudent = (student) => {
    setData(prev => {
      const exists = prev.students.some(s => s.id === student.id);
      const updatedStudents = exists
        ? prev.students.map(s => (s.id === student.id ? student : s))
        : [student, ...prev.students];
      return { ...prev, students: updatedStudents };
    });
  };

  const handleUpdateStudent = (updatedStudent) => {
    setData(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === updatedStudent.id ? updatedStudent : s))
    }));
  };

  const handleDeleteStudent = (studentId) => {
    setData(prev => ({
      ...prev,
      students: prev.students.filter(s => s.id !== studentId)
    }));
  };

  // Package Renewal Handler
  const handleRenewPackage = (studentId, renewalData) => {
    setData(prev => {
      const target = prev.students.find(s => s.id === studentId);
      if (!target) return prev;

      const newPayment = {
        id: `pay-${Date.now()}`,
        studentId,
        amount: renewalData.paidAmount,
        date: renewalData.startDate,
        type: 'package_tuition',
        method: renewalData.paymentMethod || 'کارت به کارت',
        referenceCode: `RENEW-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: renewalData.notes || 'تمدید دوره آموزشی جدید'
      };

      const updatedStudent = {
        ...target,
        packageTotalSessions: renewalData.packageTotalSessions,
        sessionsCompleted: 0, // Reset counter for new package cycle
        packageFee: renewalData.packageFee,
        paidAmount: renewalData.paidAmount,
        debtAmount: renewalData.debtAmount,
        startDate: renewalData.startDate,
        lastPaymentDate: renewalData.startDate
      };

      return {
        ...prev,
        students: prev.students.map(s => (s.id === studentId ? updatedStudent : s)),
        payments: renewalData.paidAmount > 0 ? [newPayment, ...prev.payments] : prev.payments
      };
    });
  };

  // Payment Handler
  const handleSavePayment = (paymentRecord) => {
    setData(prev => {
      const target = prev.students.find(s => s.id === paymentRecord.studentId);
      let updatedStudents = prev.students;

      if (target) {
        const newPaidAmount = (target.paidAmount || 0) + paymentRecord.amount;
        const newDebt = Math.max(0, (target.packageFee || 0) - newPaidAmount);

        updatedStudents = prev.students.map(s => 
          s.id === target.id ? {
            ...s,
            paidAmount: newPaidAmount,
            debtAmount: newDebt,
            lastPaymentDate: paymentRecord.date
          } : s
        );
      }

      return {
        ...prev,
        students: updatedStudents,
        payments: [paymentRecord, ...prev.payments]
      };
    });
  };

  // Intelligent Attendance Auto-Deduction Handler
  const handleBatchRecordAttendance = (records) => {
    setData(prev => {
      const updatedStudents = prev.students.map(student => {
        const record = records.find(r => r.studentId === student.id);
        if (!record) return student;

        let increment = 0;
        if (record.status === 'present' || record.status === 'absent') {
          increment = 1;
        }

        const newSessionsCompleted = (student.sessionsCompleted || 0) + increment;
        const newAttendanceEntry = {
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          sessionIndex: newSessionsCompleted,
          date: record.date,
          status: record.status,
          note: record.note || (record.status === 'present' ? 'حاضر در کلاس' : record.status === 'absent' ? 'غایب' : 'کنسلی با هماهنگی')
        };

        return {
          ...student,
          sessionsCompleted: newSessionsCompleted,
          attendanceHistory: [...(student.attendanceHistory || []), newAttendanceEntry]
        };
      });

      return { ...prev, students: updatedStudents };
    });
  };

  // Export JSON backup
  const handleExportData = () => {
    exportBackupJSON(data.locations, data.students, data.payments);
  };

  // Import JSON backup
  const handleImportData = (parsed) => {
    if (parsed && parsed.locations && parsed.students) {
      setData({
        locations: parsed.locations,
        students: parsed.students,
        payments: parsed.payments || [],
      });
      alert('اطلاعات پشتیبان با موفقیت بازیابی شد.');
    } else {
      alert('ساختار فایل پشتیبان نامعتبر است.');
    }
  };

  const globalStats = calculateGlobalStats(data.locations, data.students);

  // Sync active detail student with updated data
  const currentDetailStudent = selectedStudentForDetailId
    ? data.students.find(s => s.id === selectedStudentForDetailId)
    : null;

  if (isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main, #0f172a)' }}>
        <Loader2 size={36} className="spin-animation" color="var(--accent-purple, #a855f7)" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main, #0f172a)' }}>
        <AuthModal />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
        stats={globalStats}
        onExport={handleExportData}
        onImport={handleImportData}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentAppData={data}
        onApplyServerData={handleApplyServerData}
      />

      <main style={{ maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '1.5rem', flex: 1 }}>
        <InstallPWA />

        {activeTab === 'dashboard' && (
          <DashboardOverview
            locations={data.locations}
            students={data.students}
            payments={data.payments}
            onNavigateTab={setActiveTab}
            onSelectStudent={(s) => setSelectedStudentForDetailId(s.id)}
            onQuickAttendance={(s) => setActiveTab('attendance')}
          />
        )}

        {activeTab === 'locations' && (
          <LocationList
            locations={data.locations}
            students={data.students}
            onSaveLocation={handleSaveLocation}
            onDeleteLocation={handleDeleteLocation}
            onSelectLocationFilter={(locId) => {
              setSelectedLocationFilter(locId);
              setActiveTab('students');
            }}
          />
        )}

        {activeTab === 'students' && (
          <StudentList
            students={data.students}
            locations={data.locations}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateStudent={handleUpdateStudent}
            onRenewPackage={handleRenewPackage}
            onRecordQuickAttendance={(s) => setActiveTab('attendance')}
            onOpenPaymentModal={(s) => setSelectedStudentForPayment(s)}
            selectedLocationFilter={selectedLocationFilter}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceManager
            students={data.students}
            locations={data.locations}
            onBatchRecordAttendance={handleBatchRecordAttendance}
            onRecordSingleAttendance={(record) => handleBatchRecordAttendance([record])}
          />
        )}

        {activeTab === 'wallet' && (
          <WalletOverview
            locations={data.locations}
            students={data.students}
            payments={data.payments}
            onSavePayment={handleSavePayment}
            onRenewPackage={handleRenewPackage}
          />
        )}
      </main>

      {/* Global Modals */}
      <AuthModal />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
        onExportData={handleExportData}
        onImportData={() => {
          setIsSettingsOpen(false);
          const fileInput = document.querySelector('input[type="file"][accept=".json"]');
          if (fileInput) fileInput.click();
        }}
        onClearAllData={handleClearAllData}
      />

      {currentDetailStudent && (
        <StudentDetailModal
          isOpen={!!currentDetailStudent}
          onClose={() => setSelectedStudentForDetailId(null)}
          student={currentDetailStudent}
          location={data.locations.find(l => l.id === currentDetailStudent.locationId)}
          onUpdateStudent={handleUpdateStudent}
          onOpenRenewModal={(s) => {
            setSelectedStudentForDetailId(null);
            setSelectedStudentForRenew(s);
          }}
          onOpenPaymentModal={(s) => {
            setSelectedStudentForDetailId(null);
            setSelectedStudentForPayment(s);
          }}
          onRecordQuickAttendance={(s) => {
            setSelectedStudentForDetailId(null);
            setActiveTab('attendance');
          }}
        />
      )}

      {selectedStudentForRenew && (
        <PackageRenewModal
          isOpen={!!selectedStudentForRenew}
          onClose={() => setSelectedStudentForRenew(null)}
          onRenew={handleRenewPackage}
          student={selectedStudentForRenew}
          location={data.locations.find(l => l.id === selectedStudentForRenew.locationId)}
        />
      )}

      {selectedStudentForPayment && (
        <PaymentModal
          isOpen={!!selectedStudentForPayment}
          onClose={() => setSelectedStudentForPayment(null)}
          onSavePayment={handleSavePayment}
          students={data.students}
          initialStudent={selectedStudentForPayment}
        />
      )}
    </div>
  );
}

export default function App() {
  const [appBridge, setAppBridge] = useState(null);

  return (
    <AuthProvider
      onServerDataLoaded={(serverData) => {
        if (appBridge?.applyServerData) {
          appBridge.applyServerData(serverData);
        }
      }}
      getCurrentAppState={() => (appBridge?.getData ? appBridge.getData() : loadStoredData())}
    >
      <AppContent setAppBridge={setAppBridge} />
    </AuthProvider>
  );
}
