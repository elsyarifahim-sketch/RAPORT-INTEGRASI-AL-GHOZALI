/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { INITIAL_SUBJECTS, INITIAL_SCHOOL_CONFIG, INITIAL_STUDENTS, INITIAL_CLASSES } from './data/initialData';
import { MASTER_STUDENTS_3_SMP } from './data/masterStudents3SMP';
import { MASTER_STUDENTS_1_INTENSIF } from './data/masterStudents1Intensif';
import { MASTER_STUDENTS_2_INTENSIF } from './data/masterStudents2Intensif';
import { MASTER_STUDENTS_4_SMA } from './data/masterStudents4SMA';
import { MASTER_STUDENTS_3_INTENSIF } from './data/masterStudents3Intensif';
import { MASTER_STUDENTS_5_SMA } from './data/masterStudents5SMA';
import { MASTER_STUDENTS_6_SMA } from './data/masterStudents6SMA';
import { exportRaportToPdf } from './utils/exportHelpers';
import { Subject, StudentRecord, CalculatedStudent, SchoolConfig, ClassItem, AuthUser, JenjangUnit } from './types';
import { ReportCertificate } from './components/ReportCertificate';
import { SidebarControls } from './components/SidebarControls';
import { RekapitulasiTable } from './components/RekapitulasiTable';
import { TeacherGradingView } from './components/TeacherGradingView';
import { DataMasterView } from './components/DataMasterView';
import { StudentModal } from './components/StudentModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchPrintView } from './components/BatchPrintView';
import { SchoolLogo } from './components/SchoolLogo';
import { MuatanMataPelajaranView } from './components/MuatanMataPelajaranView';
import { TeacherDatabaseView } from './components/TeacherDatabaseView';
import { LoginView } from './components/LoginView';
import { getSubjectsForClass, ensureStudentScoresForClass } from './data/curriculumSubjects';
import { getWaliKelasForClass } from './data/waliKelasDatabase';
import { getSavedAuthUser, saveAuthUser, getClassesForUserAndJenjang } from './utils/authHelpers';
import {
  FileText,
  FileSpreadsheet,
  Plus,
  Sliders,
  RotateCcw,
  PenTool,
  Users,
  BookOpen,
  GraduationCap,
  LogOut,
  ShieldCheck,
  UserCheck,
  Lock,
  School,
  Sparkles,
  Download,
  Loader2,
  FileType,
  Printer,
} from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'kasyfud_darajat_students_smp_v4';
const STORAGE_KEY_CONFIG = 'kasyfud_darajat_config_smp_v4';
const STORAGE_KEY_CLASSES = 'kasyfud_darajat_classes_smp_v4';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getSavedAuthUser());
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);

  const [activeJenjang, setActiveJenjang] = useState<JenjangUnit>(() => {
    const savedUser = getSavedAuthUser();
    if (savedUser?.unit) return savedUser.unit;
    if (savedUser?.availableUnits && savedUser.availableUnits.length > 0) return savedUser.availableUnits[0];
    return 'SMP';
  });
  
  const [classes] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) {
        const parsed: ClassItem[] = JSON.parse(saved);
        const hasLevel3 = parsed.some((c) => c.id.startsWith('3') && !c.id.startsWith('3int'));
        const hasLevel1Int = parsed.some((c) => c.id === '1int');
        const hasLevel2Int = parsed.some((c) => c.id.startsWith('2int'));
        const hasLevel4 = parsed.some((c) => c.id.startsWith('4') || c.level === '4');
        const hasLevel3Int = parsed.some((c) => c.id.startsWith('3int') || c.level === '3int');
        const hasLevel5 = parsed.some((c) => c.id.startsWith('5') || c.level === '5');
        const hasLevel6 = parsed.some((c) => c.id.startsWith('6') || c.level === '6');
        const has2IntIpa = parsed.some((c) => c.id === '2int-a' && c.nameLatin.includes('IPA'));
        const has3IntIpa = parsed.some((c) => c.id === '3int-a' && c.nameLatin.includes('IPA'));
        if (!hasLevel3 || !hasLevel1Int || !hasLevel2Int || !hasLevel4 || !hasLevel3Int || !hasLevel5 || !hasLevel6 || !has2IntIpa || !has3IntIpa) {
          return INITIAL_CLASSES;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_CLASSES;
  });

  // Active class ID e.g. '1a', '1b', '1d', '1e', '1-int-a'
  const [selectedClassId, setSelectedClassId] = useState<string>('1a');

  // Active subject ID for teacher grading e.g. 's1' (Tamrin Lughoh)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('s1');

  // Persistence via localStorage with fallback to initial data
  const [students, setStudents] = useState<StudentRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_STUDENTS);
      if (saved) {
        const parsed: StudentRecord[] = JSON.parse(saved);
        let updated = parsed;
        const hasLevel3 = updated.some((s) => (s.classId || '').startsWith('3') && !(s.classId || '').startsWith('3int'));
        if (!hasLevel3) {
          updated = [...updated, ...MASTER_STUDENTS_3_SMP];
        }
        const hasLevel1Int = updated.some((s) => (s.classId || '') === '1int');
        if (!hasLevel1Int) {
          updated = [...updated, ...MASTER_STUDENTS_1_INTENSIF];
        }
        const hasLevel2Int = updated.some((s) => (s.classId || '').startsWith('2int'));
        if (!hasLevel2Int) {
          updated = [...updated, ...MASTER_STUDENTS_2_INTENSIF];
        }
        const hasLevel4 = updated.some((s) => (s.classId || '').startsWith('4'));
        if (!hasLevel4) {
          updated = [...updated, ...MASTER_STUDENTS_4_SMA];
        }
        const hasLevel3Int = updated.some((s) => (s.classId || '').startsWith('3int'));
        if (!hasLevel3Int) {
          updated = [...updated, ...MASTER_STUDENTS_3_INTENSIF];
        }
        const hasLevel5 = updated.some((s) => (s.classId || '').startsWith('5'));
        if (!hasLevel5) {
          updated = [...updated, ...MASTER_STUDENTS_5_SMA];
        }
        const hasLevel6 = updated.some((s) => (s.classId || '').startsWith('6'));
        if (!hasLevel6) {
          updated = [...updated, ...MASTER_STUDENTS_6_SMA];
        }
        return updated;
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [config, setConfig] = useState<SchoolConfig>(() => {
    const defaultWali = getWaliKelasForClass('1a') || 'AMALIA NUR FARHIFA, S.Pd.';
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.waliKelasName || parsed.waliKelasName.includes('Siti Nurhaliza')) {
          parsed.waliKelasName = defaultWali;
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return {
      ...INITIAL_SCHOOL_CONFIG,
      classLatin: '1A (Kelas 1 SMP A)',
      classAr: 'الأوّل - A',
      waliKelasName: defaultWali,
    };
  });

  // Active view: 'master' (Data Master) | 'muatan' (Muatan Mapel) | 'databaseGuru' (Database Guru & Mapel) | 'guru' (Input Nilai) | 'raport' (Raport) | 'rekap' (Rekapitulasi)
  const [activeTab, setActiveTab] = useState<'master' | 'muatan' | 'databaseGuru' | 'guru' | 'raport' | 'rekap'>('master');

  // Selected student index within the currently viewed class for Raport preview (0-indexed)
  const [selectedClassStudentIndex, setSelectedClassStudentIndex] = useState<number>(0);

  // Range for batch printing
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(15);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<CalculatedStudent | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);

  // Auto-sync config header class information when selectedClassId changes
  useEffect(() => {
    const cls = classes.find((c) => c.id === selectedClassId) || INITIAL_CLASSES.find((c) => c.id === selectedClassId);
    if (cls) {
      const officialWali = getWaliKelasForClass(cls.id) || cls.waliKelasName || getWaliKelasForClass(cls.nameLatin);
      setConfig((prev) => ({
        ...prev,
        classLatin: cls.nameLatin,
        classAr: cls.nameAr,
        waliKelasName: officialWali || prev.waliKelasName,
      }));
    }
  }, [selectedClassId, classes]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
    } catch {
      // ignore
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    } catch {
      // ignore
    }
  }, [config]);

  // Dynamically compute totals, averages, and ranks for ALL students grouped by class
  const calculatedStudents: CalculatedStudent[] = useMemo(() => {
    // 1. Calculate raw total and average for each student based on their class-specific curriculum
    const withTotals = students.map((std) => {
      const classId = std.classId || '1a';
      const classSubjects = getSubjectsForClass(classId);
      const studentScores = ensureStudentScoresForClass(std.scores, classId, std.nisn || std.id);
      const total = classSubjects.reduce((sum, sub) => {
        const val = studentScores[sub.id];
        return sum + (typeof val === 'number' && !isNaN(val) ? val : 0);
      }, 0);
      const avg = classSubjects.length > 0 ? Math.round(total / classSubjects.length) : 0;
      return {
        ...std,
        scores: studentScores,
        totalScore: total,
        averageScore: avg,
        rank: 1, // placeholder
      };
    });

    // 2. Rank students descending by totalScore WITHIN EACH CLASS
    const rankMap = new Map<string, number>();
    const byClass: Record<string, typeof withTotals> = {};

    withTotals.forEach((s) => {
      const cId = s.classId || '1a';
      if (!byClass[cId]) byClass[cId] = [];
      byClass[cId].push(s);
    });

    Object.values(byClass).forEach((classGroup) => {
      const sorted = [...classGroup].sort((a, b) => b.totalScore - a.totalScore);
      let currentRank = 1;
      sorted.forEach((item, idx) => {
        if (idx > 0 && item.totalScore < sorted[idx - 1].totalScore) {
          currentRank = idx + 1;
        }
        rankMap.set(item.id, currentRank);
      });
    });

    // 3. Return students with assigned ranks
    return withTotals.map((s) => ({
      ...s,
      rank: rankMap.get(s.id) || 1,
    }));
  }, [students]);

  // Current subjects for the currently selected class
  const currentClassSubjects = useMemo(() => {
    return getSubjectsForClass(selectedClassId);
  }, [selectedClassId]);

  // Ensure active subject ID matches available subjects in selected class
  useEffect(() => {
    if (
      currentClassSubjects.length > 0 &&
      !currentClassSubjects.some((s) => s.id === selectedSubjectId)
    ) {
      setSelectedSubjectId(currentClassSubjects[0].id);
    }
  }, [currentClassSubjects, selectedSubjectId]);

  // Students in currently selected class
  const studentsInCurrentClass = useMemo(() => {
    return calculatedStudents.filter(
      (s) => (s.classId || '1a') === selectedClassId
    );
  }, [calculatedStudents, selectedClassId]);

  // Safe active student for Raport view
  const safeIndex = Math.max(
    0,
    Math.min(selectedClassStudentIndex, studentsInCurrentClass.length - 1)
  );
  const activeStudent = studentsInCurrentClass[safeIndex] || studentsInCurrentClass[0];

  // Update batch print range when class changes
  useEffect(() => {
    setRangeStart(1);
    setRangeEnd(Math.max(1, studentsInCurrentClass.length));
  }, [selectedClassId, studentsInCurrentClass.length]);

  // Handlers
  const handleUpdateScore = (studentId: string, subjectId: string, value: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        return {
          ...s,
          scores: {
            ...s.scores,
            [subjectId]: value,
          },
        };
      })
    );
  };

  const handleSaveStudent = (data: {
    id?: string;
    classId: string;
    name: string;
    nisn: string;
    scores: Record<string, number>;
    keterangan?: string;
  }) => {
    if (data.id) {
      // Edit existing
      setStudents((prev) =>
        prev.map((s) =>
          s.id === data.id
            ? {
                ...s,
                classId: data.classId,
                name: data.name,
                nisn: data.nisn,
                scores: data.scores,
                keterangan: data.keterangan,
              }
            : s
        )
      );
    } else {
      // Add new
      const newStudent: StudentRecord = {
        id: `std-${Date.now()}`,
        no: students.length + 1,
        classId: data.classId,
        name: data.name,
        nisn: data.nisn,
        scores: data.scores,
        keterangan: data.keterangan || 'Tuntas',
      };
      setStudents((prev) => [...prev, newStudent]);
      setSelectedClassId(data.classId);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (students.length <= 1) {
      return;
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    if (selectedClassStudentIndex >= studentsInCurrentClass.length - 1) {
      setSelectedClassStudentIndex(Math.max(0, studentsInCurrentClass.length - 2));
    }
  };

  const handleResetToDefault = () => {
    setStudents(INITIAL_STUDENTS);
    setSelectedClassId('1a');
    setSelectedClassStudentIndex(0);
    setRangeStart(1);
    setRangeEnd(15);
    try {
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
    } catch {
      // ignore
    }
  };

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handlePrintSingle = () => {
    window.print();
  };

  /**
   * Menggunakan exportRaportToPdf (jspdf + html2canvas) untuk mengekspor
   * tampilan aktif ReportCertificate ke dalam file PDF resmi (A4).
   */
  const handleDownloadActiveRaportPdf = async () => {
    if (!activeStudent) return;
    const certificateEl = document.getElementById('raport-certificate-container');
    if (!certificateEl) {
      alert('Elemen raport santri tidak ditemukan.');
      return;
    }

    setIsExportingPdf(true);
    try {
      const safeStudentName = activeStudent.name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const safeClassName = (config.classLatin || selectedClassId).replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Raport_${safeStudentName}_${safeClassName}.pdf`;

      const success = await exportRaportToPdf(certificateEl, fileName);
      if (!success) {
        alert('Gagal mengekspor PDF. Anda dapat menggunakan tombol Cetak browser sebagai alternatif.');
      }
    } catch (error) {
      console.error('Gagal mencetak raport ke PDF:', error);
      alert('Gagal mengekspor PDF. Anda dapat menggunakan tombol Cetak browser sebagai alternatif.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleOpenBatchPrint = () => {
    setIsBatchPrintOpen(true);
  };

  const handleOpenRaportForStudent = (studentId: string) => {
    const student = calculatedStudents.find((s) => s.id === studentId);
    if (student) {
      const targetClass = student.classId || '1a';
      setSelectedClassId(targetClass);
      const classStudents = calculatedStudents.filter((s) => (s.classId || '1a') === targetClass);
      const idxInClass = classStudents.findIndex((s) => s.id === studentId);
      if (idxInClass !== -1) {
        setSelectedClassStudentIndex(idxInClass);
      }
      setActiveTab('raport');
    }
  };

  const handleNavigateToGrading = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab('guru');
  };

  const handleSelectJenjang = (unit: JenjangUnit) => {
    setActiveJenjang(unit);
    const classesForUnit = getClassesForUserAndJenjang(currentUser, unit, classes);
    if (classesForUnit.length > 0) {
      setSelectedClassId(classesForUnit[0].id);
      setSelectedClassStudentIndex(0);
    }
  };

  const filteredClassesForUser = useMemo(() => {
    return getClassesForUserAndJenjang(currentUser, activeJenjang, classes);
  }, [currentUser, activeJenjang, classes]);

  // Ensure selectedClassId is valid within current filtered classes
  useEffect(() => {
    if (filteredClassesForUser.length > 0 && !filteredClassesForUser.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(filteredClassesForUser[0].id);
      setSelectedClassStudentIndex(0);
    }
  }, [filteredClassesForUser, selectedClassId]);

  const handleLoginSuccess = (user: AuthUser) => {
    saveAuthUser(user);
    setCurrentUser(user);

    const initialUnit: JenjangUnit = user.unit || user.availableUnits?.[0] || 'SMP';
    setActiveJenjang(initialUnit);

    const initialClasses = getClassesForUserAndJenjang(user, initialUnit, classes);

    if (user.role === 'guru') {
      setActiveTab('guru');
      if (initialClasses.length > 0) {
        setSelectedClassId(initialClasses[0].id);
      }
    } else if (user.role === 'wali_kelas') {
      if (user.homeroomClassId) {
        setSelectedClassId(user.homeroomClassId);
      } else if (initialClasses.length > 0) {
        setSelectedClassId(initialClasses[0].id);
      }
      setActiveTab('raport');
    } else {
      setActiveTab('master');
      if (initialClasses.length > 0) {
        setSelectedClassId(initialClasses[0].id);
      }
    }
  };

  const handleLogout = () => {
    saveAuthUser(null);
    setCurrentUser(null);
  };

  // If no user is logged in, present the Login Gateway
  if (!currentUser) {
    return <LoginView classes={classes} onLoginSuccess={handleLoginSuccess} />;
  }

  const isAdmin = currentUser.role === 'admin';
  const isWaliKelas = currentUser.role === 'wali_kelas';
  const isGuru = currentUser.role === 'guru';

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-emerald-200">
      {/* Top Application Navigation Bar (Hidden during print) */}
      <header className="no-print bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <SchoolLogo size={40} className="drop-shadow" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base tracking-wide text-white">
                  Kasyfud Darajat
                </h1>
                <span className="font-arabic text-emerald-400 font-bold text-base leading-none">
                  (كَشْفُ الدَّرَجَاتِ)
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium hidden sm:block">
                Pondok Modern Al-Ghozali • TA {config.academicYearLatin}
              </p>
            </div>
          </div>

          {/* View Mode Tabs (Role-tailored) */}
          <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs font-semibold overflow-x-auto max-w-full">
            {/* TAB 0: Data Master Siswa (Admin Only) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setActiveTab('master')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'master'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <Users size={14} />
                <span>Data Master ({students.length})</span>
              </button>
            )}

            {/* TAB 1: Input Nilai Guru */}
            <button
              type="button"
              onClick={() => setActiveTab('guru')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'guru'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <PenTool size={14} />
              <span>Input Nilai Guru</span>
            </button>

            {/* TAB 2: Cetak Raport Santri */}
            <button
              type="button"
              onClick={() => setActiveTab('raport')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'raport'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <FileText size={14} />
              <span>Cetak Raport</span>
            </button>

            {/* TAB 3: Rekapitulasi Nilai (Admin & Wali Kelas) */}
            {(isAdmin || isWaliKelas) && (
              <button
                type="button"
                onClick={() => setActiveTab('rekap')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                  activeTab === 'rekap'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>Rekapitulasi Nilai</span>
              </button>
            )}

            {/* TAB: Muatan Mata Pelajaran (13 Matriks Kurikulum) */}
            <button
              type="button"
              onClick={() => setActiveTab('muatan')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'muatan'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <BookOpen size={14} />
              <span>Muatan Mapel</span>
            </button>

            {/* TAB: Database Guru Mata Pelajaran (63 Mapel) */}
            <button
              type="button"
              onClick={() => setActiveTab('databaseGuru')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
                activeTab === 'databaseGuru'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
              }`}
            >
              <GraduationCap size={14} />
              <span>Database Guru</span>
            </button>
          </div>

          {/* User Profile Badge & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* User Info Badge */}
            <div className="hidden sm:flex items-center gap-2 bg-stone-800/90 border border-stone-700/80 px-2.5 py-1.5 rounded-xl">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isAdmin
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : isWaliKelas
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isAdmin ? (
                  <ShieldCheck size={16} />
                ) : isWaliKelas ? (
                  <GraduationCap size={16} />
                ) : (
                  <UserCheck size={16} />
                )}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5 leading-tight">
                  <span className="truncate max-w-[130px]">{currentUser.name}</span>
                </div>
                <span className="text-[10px] text-stone-400 block font-medium leading-tight">
                  {isAdmin
                    ? 'Administrator'
                    : isWaliKelas
                    ? `Wali ${currentUser.homeroomClassName || currentUser.unit || 'Kelas'}`
                    : `Guru • ${currentUser.unit || 'Pengampu'}`}
                </span>
              </div>
            </div>

            {/* Admin Extra Tools */}
            {isAdmin && (
              <div className="hidden lg:flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingStudent(null);
                    setIsStudentModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg transition shadow-sm"
                  title="Tambah Data Santri Baru"
                >
                  <Plus size={14} />
                  <span>Tambah</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetToDefault}
                  title="Reset ke Data Master SMP & SMA"
                  className="p-1.5 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            )}

            {/* Settings (Date/Kop/Wali) */}
            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-2.5 py-1.5 rounded-lg transition"
              title="Pengaturan Raport & Sistem"
            >
              <Sliders size={14} />
              <span className="hidden md:inline">Pengaturan</span>
            </button>

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-800/60 px-2.5 py-1.5 rounded-lg transition"
              title="Keluar / Ganti Akun"
            >
              <LogOut size={14} />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'master' ? (
          /* View 0: Data Master Siswa */
          <DataMasterView
            students={calculatedStudents}
            classes={isAdmin ? classes : filteredClassesForUser}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            onAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onEditStudent={(std) => {
              setEditingStudent(std);
              setIsStudentModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onNavigateToGrading={handleNavigateToGrading}
            onNavigateToRaport={handleOpenRaportForStudent}
          />
        ) : activeTab === 'muatan' ? (
          /* View: Muatan Mata Pelajaran (Matriks Lengkap 13 Kolom Sesuai Dokumen Kurikulum) */
          <MuatanMataPelajaranView
            onNavigateToGrading={(cId) => {
              setSelectedClassId(cId);
              setActiveTab('guru');
            }}
          />
        ) : activeTab === 'databaseGuru' ? (
          /* View: Database Guru Mata Pelajaran (63 Mapel SMA, SMP, TMMIA) */
          <TeacherDatabaseView
            onNavigateToGrading={(cId) => {
              if (cId) setSelectedClassId(cId);
              setActiveTab('guru');
            }}
          />
        ) : activeTab === 'guru' ? (
          /* View 1: Guru Pilih Kelas -> Tampil Siswa -> Pilih Mapel Yang Diajar */
          <TeacherGradingView
            classes={filteredClassesForUser}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            subjects={currentClassSubjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubjectId={setSelectedSubjectId}
            studentsInClass={studentsInCurrentClass}
            allStudents={calculatedStudents}
            onUpdateScore={handleUpdateScore}
            onOpenRaportForStudent={handleOpenRaportForStudent}
            currentUser={currentUser}
            activeJenjang={activeJenjang}
            onSelectJenjang={handleSelectJenjang}
          />
        ) : activeTab === 'raport' ? (
          /* View 2: Authentic Certificate Raport with Sidebar Controls (Image 1 layout) */
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Printable Report Certificate with Quick Actions */}
            <div className="w-full flex-1 flex flex-col items-center overflow-x-auto pb-6">
              {activeStudent ? (
                <>
                  {/* Top Action Bar above Certificate */}
                  <div className="w-full max-w-[800px] mb-3 bg-white border border-stone-200 rounded-xl p-3 shadow-xs flex items-center justify-between gap-3 flex-wrap print:hidden">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 font-bold text-xs">
                        #{activeStudent.rank}
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-stone-800 line-clamp-1">{activeStudent.name}</p>
                        <p className="text-[11px] text-stone-500 font-medium">
                          NISN: {activeStudent.nisn || '-'} • Kelas: {config.classLatin || selectedClassId}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadActiveRaportPdf}
                        disabled={isExportingPdf}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-800 active:scale-95 text-white font-bold text-xs rounded-lg shadow transition disabled:opacity-50"
                        title="Download Dokumen Raport Format PDF (jsPDF + html2canvas)"
                      >
                        {isExportingPdf ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Membuat PDF...</span>
                          </>
                        ) : (
                          <>
                            <FileType size={14} />
                            <span>Download PDF (.pdf)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintSingle}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-semibold text-xs rounded-lg shadow transition"
                        title="Buka Dialog Cetak Browser"
                      >
                        <Printer size={14} />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>

                  <ReportCertificate
                    student={activeStudent}
                    subjects={currentClassSubjects}
                    config={config}
                    onOpenDateSettings={() => setIsSettingsModalOpen(true)}
                  />
                </>
              ) : (
                <div className="bg-white p-12 rounded-xl text-center text-stone-500 shadow border border-stone-200">
                  <p className="font-bold">Belum ada santri di kelas {config.classLatin}.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStudent(null);
                      setIsStudentModalOpen(true);
                    }}
                    className="mt-3 inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg"
                  >
                    <Plus size={14} /> Tambah Santri di Kelas Ini
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Controls (Exact arrangement matching Image 1) */}
            <div className="w-full lg:w-auto flex justify-center">
              <SidebarControls
                students={studentsInCurrentClass}
                classes={filteredClassesForUser}
                selectedClassId={selectedClassId}
                onSelectClassId={setSelectedClassId}
                selectedIndex={safeIndex}
                onSelectIndex={setSelectedClassStudentIndex}
                rangeStart={rangeStart}
                rangeEnd={rangeEnd}
                onChangeRangeStart={setRangeStart}
                onChangeRangeEnd={setRangeEnd}
                onPrintSingle={handlePrintSingle}
                onPrintBatch={handleOpenBatchPrint}
                onOpenRekap={() => setActiveTab('rekap')}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                onEditStudent={(std) => {
                  setEditingStudent(std);
                  setIsStudentModalOpen(true);
                }}
                config={config}
                onUpdateConfig={setConfig}
                currentUser={currentUser}
                activeJenjang={activeJenjang}
                onSelectJenjang={handleSelectJenjang}
                subjects={currentClassSubjects}
              />
            </div>
          </div>
        ) : (
          /* View 3: Rekapitulasi Nilai Asesmen Sumatif (Image 2 layout) */
          <div className="w-full">
            <RekapitulasiTable
              students={calculatedStudents}
              subjects={subjects}
              config={config}
              classes={filteredClassesForUser}
              selectedClassId={selectedClassId}
              onSelectClassId={setSelectedClassId}
              onUpdateScore={handleUpdateScore}
              onAddStudent={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onSelectStudentForRaport={(idx) => {
                setSelectedClassStudentIndex(idx);
                setActiveTab('raport');
              }}
              onResetData={handleResetToDefault}
              currentUser={currentUser}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={editingStudent}
        subjects={subjects}
        classes={classes}
        defaultClassId={selectedClassId}
        onSave={handleSaveStudent}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        isAdmin={isAdmin}
        onSave={(newConf) => setConfig(newConf)}
      />

      <BatchPrintView
        isOpen={isBatchPrintOpen}
        onClose={() => setIsBatchPrintOpen(false)}
        students={studentsInCurrentClass}
        subjects={subjects}
        config={config}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
    </div>
  );
}
