// Financial calculation helpers for Kargah

export function calculateStudentFinancials(student) {
  const packageTotal = student.packageTotalSessions || 8;
  const sessionsCompleted = student.sessionsCompleted || 0;
  const sessionsLeft = Math.max(0, packageTotal - sessionsCompleted);
  const isExpired = sessionsLeft === 0;
  const isRenewalAlert = sessionsLeft <= 1; // 0 or 1 session left
  const debt = Math.max(0, (student.packageFee || 0) - (student.paidAmount || 0));
  const hasDebt = debt > 0;

  return {
    packageTotal,
    sessionsCompleted,
    sessionsLeft,
    isExpired,
    isRenewalAlert,
    debt,
    hasDebt,
    completionPercentage: Math.min(100, Math.round((sessionsCompleted / packageTotal) * 100)),
  };
}

export function calculateLocationFinancials(location, students) {
  const locStudents = students.filter(s => s.locationId === location.id);
  
  let totalSessionsHeld = 0;
  let grossSessionRevenue = 0;
  let totalPackageTuition = 0;
  let totalCollected = 0;
  let totalDebt = 0;

  locStudents.forEach(s => {
    const sSessions = s.sessionsCompleted || 0;
    const sFee = s.sessionFee || (location.defaultSessionPrice || 0);
    totalSessionsHeld += sSessions;
    grossSessionRevenue += sSessions * sFee;
    totalPackageTuition += (s.packageFee || 0);
    totalCollected += (s.paidAmount || 0);
    totalDebt += Math.max(0, (s.packageFee || 0) - (s.paidAmount || 0));
  });

  let academyOrStudioCost = 0;

  if (location.financialModel === 'studio_rent') {
    // Fixed rent per session
    academyOrStudioCost = totalSessionsHeld * (location.studioRentPerSession || 0);
  } else {
    // Percentage cut
    const pct = location.academySharePercent || 0;
    academyOrStudioCost = (grossSessionRevenue * pct) / 100;
  }

  const teacherNetEarnings = Math.max(0, grossSessionRevenue - academyOrStudioCost);

  return {
    studentCount: locStudents.length,
    totalSessionsHeld,
    grossSessionRevenue,
    totalPackageTuition,
    totalCollected,
    totalDebt,
    academyOrStudioCost,
    teacherNetEarnings,
    sharePercent: location.academySharePercent || 0,
    rentPerSession: location.studioRentPerSession || 0,
  };
}

export function calculateGlobalStats(locations, students) {
  let totalSessionsHeld = 0;
  let totalGrossRevenue = 0;
  let totalAcademyStudioShare = 0;
  let totalTeacherNet = 0;
  let totalOutstandingDebt = 0;
  let totalRenewalAlerts = 0;
  let totalDebtorsCount = 0;

  locations.forEach(loc => {
    const locFin = calculateLocationFinancials(loc, students);
    totalSessionsHeld += locFin.totalSessionsHeld;
    totalGrossRevenue += locFin.grossSessionRevenue;
    totalAcademyStudioShare += locFin.academyOrStudioCost;
    totalTeacherNet += locFin.teacherNetEarnings;
  });

  students.forEach(s => {
    const fin = calculateStudentFinancials(s);
    if (fin.isRenewalAlert) totalRenewalAlerts++;
    if (fin.hasDebt) {
      totalDebtorsCount++;
      totalOutstandingDebt += fin.debt;
    }
  });

  return {
    totalLocations: locations.length,
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    totalSessionsHeld,
    totalGrossRevenue,
    totalAcademyStudioShare,
    totalTeacherNet,
    totalOutstandingDebt,
    totalRenewalAlerts,
    totalDebtorsCount,
    urgentAlertsCount: totalRenewalAlerts + totalDebtorsCount,
  };
}
