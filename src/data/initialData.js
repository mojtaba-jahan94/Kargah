// Initial Mock Data for Kargah (Art Class & Studio Manager)

export const initialLocations = [
  {
    id: 'loc-1',
    name: 'شاگرد خصوصی (حضوری / آنلاین)',
    type: 'private', // 'private', 'academy', 'studio_rent'
    financialModel: 'percentage', // 'percentage' or 'studio_rent'
    academySharePercent: 0, // 0% to academy, 100% to teacher
    studioRentPerSession: 0,
    defaultSessionPrice: 650000,
    defaultPackageSessions: 8,
    address: 'کلاس‌های آنلاین (Google Meet / Skype) و حضوری آتلیه استاد',
    contact: 'مستقیم مدرس',
    color: '#8b5cf6', // Violet
    notes: 'تسویه مستقیم توسط هنرجو در ابتدای دوره'
  },
  {
    id: 'loc-2',
    name: 'آموزشگاه موسیقی نوا',
    type: 'academy',
    financialModel: 'percentage',
    academySharePercent: 30, // 30% academy, 70% teacher
    studioRentPerSession: 0,
    defaultSessionPrice: 450000,
    defaultPackageSessions: 8,
    address: 'تهران، خیابان ولیعصر، بالاتر از توانیر، پلاک ۳۴',
    contact: '۰۲۱-۸۸۷۶۵۴۳۲ (خانم کمالی - مدیر آموزش)',
    color: '#3b82f6', // Blue
    notes: 'تسویه آخر هر ماه شمسی انجام می‌شود'
  },
  {
    id: 'loc-3',
    name: 'آموزشگاه هنرهای تجسمی باربد',
    type: 'academy',
    financialModel: 'percentage',
    academySharePercent: 35, // 35% academy, 65% teacher
    studioRentPerSession: 0,
    defaultSessionPrice: 500000,
    defaultPackageSessions: 8,
    address: 'تهران، سعادت‌آباد، بلوار دریا، پلاک ۸۲',
    contact: '۰۲۱-۲۲۱۱۴۴۵۵ (آقای صابری)',
    color: '#10b981', // Emerald
    notes: 'ارائه گزارش پایان ترم برای ثبت در سیستم اداری'
  },
  {
    id: 'loc-4',
    name: 'پلاتو و کارگاه تمرین مهر',
    type: 'studio_rent',
    financialModel: 'studio_rent',
    academySharePercent: 0,
    studioRentPerSession: 150000, // 150,000 Toman per session studio rent
    defaultSessionPrice: 550000,
    defaultPackageSessions: 8,
    address: 'تهران، خیابان انقلاب، خیابان وصال شیرازی، پلاک ۱۹',
    contact: '۰۲۱-۶۶۴۰۸۹۹۰ (مسئول رزرو پلاتو)',
    color: '#f59e0b', // Amber
    notes: 'هزینه پلاتو در پایان هر هفته نقداً تسویه می‌شود'
  }
];

export const initialStudents = [
  {
    id: 'std-1',
    name: 'سهراب کریمی',
    phone: '09121234567',
    discipline: 'سنتور',
    level: 'متوسط', // 'مقدماتی', 'متوسط', 'پیشرفته', 'حرفه‌ای'
    locationId: 'loc-2',
    startDate: '1403/03/15',
    packageTotalSessions: 8,
    sessionsCompleted: 7, // 7 out of 8: RENEWAL ALERT!
    sessionFee: 450000,
    packageFee: 3600000,
    paidAmount: 3600000,
    debtAmount: 0,
    lastPaymentDate: '1403/06/01',
    status: 'active', // 'active', 'paused', 'graduated'
    notes: 'تکنیک مضراب‌نوازی عالی، تمرکز روی قطعات استاد پایور',
    preferredDayTime: 'سه‌شنبه‌ها ساعت ۱۷:۰۰',
    assignments: [
      {
        id: 'asg-101',
        title: 'چهارمضراب ابوعطا اثر استاد صبا',
        description: 'تمرکز روی ریزهای نرم و شفاف با ریتم ۶/۸ سنگین، صفحه ۴۲ کتاب دستور سنتور',
        dateAssigned: '1403/07/01',
        dueDate: '1403/07/08',
        status: 'in_progress', // 'completed', 'in_progress', 'needs_repeat'
        teacherNote: 'سرعت مترونوم روی ۷۲ تنظیم شود.'
      },
      {
        id: 'asg-102',
        title: 'اتودهای مضراب‌گذاری شماره ۱۲ و ۱۳',
        description: 'تمرین دوبل‌نت‌ها و حفظ تعادل دست چپ و راست',
        dateAssigned: '1403/06/24',
        dueDate: '1403/07/01',
        status: 'completed',
        teacherNote: 'بسیار مسلط و تمیز اجرا شد.'
      }
    ],
    attendanceHistory: [
      { id: 'att-1', sessionIndex: 1, date: '1403/06/05', status: 'present', note: 'شروع بسته، مرور اصول مضراب‌گیری' },
      { id: 'att-2', sessionIndex: 2, date: '1403/06/12', status: 'present', note: 'دستگاه شور، درآمد اول' },
      { id: 'att-3', sessionIndex: 3, date: '1403/06/19', status: 'present', note: 'گوشه کرشمه و تکنیک سرمضراب' },
      { id: 'att-4', sessionIndex: 4, date: '1403/06/26', status: 'excused', note: 'کنسلی با هماهنگی قبلی - جلسه جبرانی لحاظ شد' },
      { id: 'att-5', sessionIndex: 4, date: '1403/06/29', status: 'present', note: 'جلسه جبرانی، حل مشکلات ریتم' },
      { id: 'att-6', sessionIndex: 5, date: '1403/07/03', status: 'present', note: 'آغاز گوشه سلمک و قرچه' },
      { id: 'att-7', sessionIndex: 6, date: '1403/07/10', status: 'present', note: 'اتودهای سرعتی چپ‌ریز' },
      { id: 'att-8', sessionIndex: 7, date: '1403/07/17', status: 'present', note: 'چهارمضراب ابوعطا (جلسه هفتم - یادآوری تمدید شهریه دوره بعد داده شد)' }
    ]
  },
  {
    id: 'std-2',
    name: 'پریناز مهدوی',
    phone: '09359876543',
    discipline: 'پیانو کلاسیک',
    level: 'پیشرفته',
    locationId: 'loc-1',
    startDate: '1402/11/01',
    packageTotalSessions: 8,
    sessionsCompleted: 8, // 8 out of 8: EXPIRED & HAS DEBT!
    sessionFee: 650000,
    packageFee: 5200000,
    paidAmount: 2000000,
    debtAmount: 3200000, // OVERDUE DEBT ALERT!
    lastPaymentDate: '1403/05/20',
    status: 'active',
    notes: 'در حال آماده‌سازی برای سونات مهتاب بتهوون و رپرتوار کنسرت زمستانه',
    preferredDayTime: 'پنج‌شنبه‌ها ساعت ۱۱:۰۰',
    assignments: [
      {
        id: 'asg-201',
        title: 'سونات مهتاب - موومان اول (بتهوون)',
        description: 'تمرکز شدید روی داینامیک پیانیسیمو و تفکیک ملودی سوپرانو از آرپژهای زمینه',
        dateAssigned: '1403/07/03',
        dueDate: '1403/07/10',
        status: 'in_progress',
        teacherNote: 'پدال‌گیری دقیق با رعایت نیم‌پدال در میزان‌های ۱۵ تا ۲۰'
      }
    ],
    attendanceHistory: [
      { id: 'att-21', sessionIndex: 1, date: '1403/06/01', status: 'present', note: 'آغاز تمرینات فنی اتود چرنی' },
      { id: 'att-22', sessionIndex: 2, date: '1403/06/08', status: 'present', note: 'گام‌ها و آرپژهای مینور' },
      { id: 'att-23', sessionIndex: 3, date: '1403/06/15', status: 'present', note: 'آهنگسازی و سونات' },
      { id: 'att-24', sessionIndex: 4, date: '1403/06/22', status: 'present', note: 'تمرینات موومان اول' },
      { id: 'att-25', sessionIndex: 5, date: '1403/06/29', status: 'present', note: 'اصلاح فرم دست راست' },
      { id: 'att-26', sessionIndex: 6, date: '1403/07/06', status: 'present', note: 'کنترل ضرباهنگ متغیر' },
      { id: 'att-27', sessionIndex: 7, date: '1403/07/13', status: 'present', note: 'اتودهای باخ اینوانسیون ۲ صدایی' },
      { id: 'att-28', sessionIndex: 8, date: '1403/07/20', status: 'present', note: 'جلسه پایانی بسته - نیازمند تمدید فوری و تسویه بدهی' }
    ]
  },
  {
    id: 'std-3',
    name: 'امیرعلی شایان',
    phone: '09194443322',
    discipline: 'طراحی و سیاه‌قلم',
    level: 'مقدماتی',
    locationId: 'loc-3',
    startDate: '1403/06/01',
    packageTotalSessions: 8,
    sessionsCompleted: 3,
    sessionFee: 500000,
    packageFee: 4000000,
    paidAmount: 4000000,
    debtAmount: 0,
    lastPaymentDate: '1403/06/01',
    status: 'active',
    notes: 'علاقه‌مند به تکنیک هایپررئال چهره، استعداد خوب در تشخیص سایه و نیم‌سایه‌ها',
    preferredDayTime: 'دوشنبه‌ها ساعت ۱۵:۳۰',
    assignments: [
      {
        id: 'asg-301',
        title: 'طراحی کره و استوانه با محوکن و پودر گرافیت',
        description: 'ایجاد کنتراست‌های عمیق و نورهای بازتابی (Reflected Light)',
        dateAssigned: '1403/07/08',
        dueDate: '1403/07/15',
        status: 'in_progress',
        teacherNote: 'کاغذ الر ۲۰۰ گرمی استفاده شود.'
      },
      {
        id: 'asg-302',
        title: 'اسکیس سریع فیگور خطی (۱۰ طرح)',
        description: 'تمرین خطوط انرژی و بدون بلند کردن دست از روی کاغذ',
        dateAssigned: '1403/06/25',
        dueDate: '1403/07/02',
        status: 'completed',
        teacherNote: 'خطوط بسیار جسورانه و زنده بودند.'
      }
    ],
    attendanceHistory: [
      { id: 'att-31', sessionIndex: 1, date: '1403/06/10', status: 'present', note: 'آشنایی با درجات مداد B2 تا B8' },
      { id: 'att-32', sessionIndex: 2, date: '1403/06/17', status: 'present', note: 'تمرین تونالیته خاکستری و محوکاری' },
      { id: 'att-33', sessionIndex: 3, date: '1403/06/24', status: 'present', note: 'رسم احجام پایه هندسی' }
    ]
  },
  {
    id: 'std-4',
    name: 'نیلوفر روشن',
    phone: '09105557788',
    discipline: 'آواز ایرانی و صداسازی',
    level: 'متوسط',
    locationId: 'loc-4',
    startDate: '1403/04/10',
    packageTotalSessions: 8,
    sessionsCompleted: 5,
    sessionFee: 550000,
    packageFee: 4400000,
    paidAmount: 3400000,
    debtAmount: 1000000, // Partial debt
    lastPaymentDate: '1403/06/10',
    status: 'active',
    notes: 'تنفس دیافراگمی نیاز به تقویت بیشتر دارد. صدا دارای رنگ گرم و حجم مناسب.',
    preferredDayTime: 'چهارشنبه‌ها ساعت ۱۸:۳۰',
    assignments: [
      {
        id: 'asg-401',
        title: 'تحریر گوشه داد در ماهور',
        description: 'اجرای غلت‌ها و تحریرهای حلقی بدون انقباض فک، ضبط صدای روزانه ۵ دقیقه',
        dateAssigned: '1403/07/04',
        dueDate: '1403/07/11',
        status: 'in_progress',
        teacherNote: 'فیلم تمرین تنفس روزانه را ارسال نماید.'
      }
    ],
    attendanceHistory: [
      { id: 'att-41', sessionIndex: 1, date: '1403/06/07', status: 'present', note: 'تمرینات وکالیز و تنفس دیافراگم' },
      { id: 'att-42', sessionIndex: 2, date: '1403/06/14', status: 'present', note: 'گوشه درآمد ماهور' },
      { id: 'att-43', sessionIndex: 3, date: '1403/06/21', status: 'absent', note: 'غیبت غیرموجه بدون اطلاع قبلی (کسر ۱ جلسه)' },
      { id: 'att-44', sessionIndex: 4, date: '1403/06/28', status: 'excused', note: 'کنسلی با هماهنگی به علت سرماخوردگی (بدون کسر)' },
      { id: 'att-45', sessionIndex: 4, date: '1403/07/05', status: 'present', note: 'ادامه داد ماهور' },
      { id: 'att-46', sessionIndex: 5, date: '1403/07/12', status: 'present', note: 'تمرین شعر سعدی در دستگاه ماهور' }
    ]
  },
  {
    id: 'std-5',
    name: 'کسری فرهمند',
    phone: '09128889900',
    discipline: 'گیتار فلامنکو',
    level: 'حرفه‌ای',
    locationId: 'loc-1',
    startDate: '1403/07/01',
    packageTotalSessions: 8,
    sessionsCompleted: 1,
    sessionFee: 650000,
    packageFee: 5200000,
    paidAmount: 5200000,
    debtAmount: 0,
    lastPaymentDate: '1403/07/01',
    status: 'active',
    notes: 'آشنایی کامل با کمپاس سولئا و بولریاس، تمرینات آلزاپوا و راسگوادو پیشرفته',
    preferredDayTime: 'شنبه‌ها ساعت ۱۶:۰۰',
    assignments: [
      {
        id: 'asg-501',
        title: 'فالستا بولریاس اثر توماتیتو',
        description: 'تسلط روی ریتم ۱۲ ضربی و تاکید ضرب‌های ۳، ۶، ۸، ۱۰ و ۱۲',
        dateAssigned: '1403/07/07',
        dueDate: '1403/07/14',
        status: 'in_progress',
        teacherNote: 'ضرب پا فراموش نشود.'
      }
    ],
    attendanceHistory: [
      { id: 'att-51', sessionIndex: 1, date: '1403/07/07', status: 'present', note: 'شروع بسته جدید، بررسی رپرتوار فلامنکو' }
    ]
  },
  {
    id: 'std-6',
    name: 'مهسا افشار',
    phone: '09361112233',
    discipline: 'نقاشی رنگ روغن',
    level: 'مقدماتی',
    locationId: 'loc-3',
    startDate: '1403/02/10',
    packageTotalSessions: 8,
    sessionsCompleted: 8, // 8 out of 8: RENEWAL & EXPIRED!
    sessionFee: 500000,
    packageFee: 4000000,
    paidAmount: 2500000,
    debtAmount: 1500000, // OVERDUE DEBT!
    lastPaymentDate: '1403/05/15',
    status: 'active',
    notes: 'اجرای طبیعت بی‌جان با کاردک و قلم‌مو، ترکیب رنگ‌های گرم و سرد',
    preferredDayTime: 'دوشنبه‌ها ساعت ۱۷:۳۰',
    assignments: [
      {
        id: 'asg-601',
        title: 'تابلو طبیعت بی‌جان انار و ظروف مسی',
        description: 'لایه‌گذاری آلاپریما و بازتاب نور روی مس، بوم ۴۰ در ۵۰',
        dateAssigned: '1403/06/30',
        dueDate: '1403/07/14',
        status: 'needs_repeat',
        teacherNote: 'درخشندگی مس نیاز به لعاب‌رنگ لایت‌تر دارد.'
      }
    ],
    attendanceHistory: [
      { id: 'att-61', sessionIndex: 1, date: '1403/05/20', status: 'present', note: 'زیررنگ‌آمیزی ایمپریمیچورا' },
      { id: 'att-62', sessionIndex: 2, date: '1403/05/27', status: 'present', note: 'طراحی کلی با قلم موی تخت' },
      { id: 'att-63', sessionIndex: 3, date: '1403/06/03', status: 'present', note: 'بلوک‌بندی رنگی' },
      { id: 'att-64', sessionIndex: 4, date: '1403/06/10', status: 'present', note: 'کار با کاردک نقاشی' },
      { id: 'att-65', sessionIndex: 5, date: '1403/06/17', status: 'present', note: 'پرداخت میوه‌ها و زمینه' },
      { id: 'att-66', sessionIndex: 6, date: '1403/06/24', status: 'present', note: 'ایجاد بافت مس' },
      { id: 'att-67', sessionIndex: 7, date: '1403/06/31', status: 'present', note: 'افزودن هایلایت‌ها' },
      { id: 'att-68', sessionIndex: 8, date: '1403/07/07', status: 'present', note: 'اتمام بسته اول، نیازمند ثبت نام و تمدید بسته جدید' }
    ]
  }
];

export const initialPayments = [
  {
    id: 'pay-1',
    studentId: 'std-1',
    amount: 3600000,
    date: '1403/06/01',
    type: 'package_tuition',
    method: 'کارت به کارت',
    referenceCode: 'TRX-982134',
    notes: 'شهریه بسته ۸ جلسه‌ای دوره تابستان'
  },
  {
    id: 'pay-2',
    studentId: 'std-2',
    amount: 2000000,
    date: '1403/05/20',
    type: 'partial_payment',
    method: 'انتقال پایا',
    referenceCode: 'PAYA-44819',
    notes: 'پیش‌پرداخت بسته شهریور (مانده ۳,۲۰۰,۰۰۰ تومان)'
  },
  {
    id: 'pay-3',
    studentId: 'std-3',
    amount: 4000000,
    date: '1403/06/01',
    type: 'package_tuition',
    method: 'کارتخوان آموزشگاه',
    referenceCode: 'POS-00921',
    notes: 'شهریه کامل بسته پاییز'
  },
  {
    id: 'pay-4',
    studentId: 'std-4',
    amount: 3400000,
    date: '1403/06/10',
    type: 'partial_payment',
    method: 'کارت به کارت',
    referenceCode: 'TRX-10294',
    notes: 'علی‌الحساب بسته آواز (مانده ۱,۰۰۰,۰۰۰ تومان)'
  },
  {
    id: 'pay-5',
    studentId: 'std-5',
    amount: 5200000,
    date: '1403/07/01',
    type: 'package_tuition',
    method: 'انتقال ساتنا',
    referenceCode: 'SAT-77291',
    notes: 'شهریه دوره گیتار فلامنکو'
  },
  {
    id: 'pay-6',
    studentId: 'std-6',
    amount: 2500000,
    date: '1403/05/15',
    type: 'partial_payment',
    method: 'نقدی',
    referenceCode: 'CASH-01',
    notes: 'پیش‌پرداخت رنگ روغن (مانده ۱,۵۰۰,۰۰۰ تومان)'
  }
];
