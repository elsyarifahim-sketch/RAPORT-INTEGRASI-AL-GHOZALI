/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_SUBJECTS, INITIAL_SCHOOL_CONFIG, INITIAL_STUDENTS, INITIAL_CLASSES } from './data/initialData';
import { MASTER_STUDENTS_3_SMP } from './data/masterStudents3SMP';
import { Subject, StudentRecord, CalculatedStudent, SchoolConfig, ClassItem } from './types';
import { ReportCertificate } from './components/ReportCertificate';
import { SidebarControls } from './components/SidebarControls';
import { RekapitulasiTable } from './components/RekapitulasiTable';
import { TeacherGradingView } from './components/TeacherGradingView';
import { DataMasterView } from './components/DataMasterView';
import { StudentModal } from './components/StudentModal';
import { SettingsModal } from './components/SettingsModal';
import { BatchPrintView } from './components/BatchPrintView';
import { SchoolLogo } from './components/SchoolLogo';
import { FileText, FileSpreadsheet, Plus, Sliders, RotateCcw, PenTool, Users } from 'lucide-react';

const STORAGE_KEY_STUDENTS = 'kasyfud_darajat_students_smp_v4';
const STORAGE_KEY_CONFIG = 'kasyfud_darajat_config_smp_v4';
const STORAGE_KEY_CLASSES = 'kasyfud_darajat_classes_smp_v4';

export default function App() {
  const [subjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  
  const [classes] = useState<ClassItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLASSES);
      if (saved) {
        const parsed: ClassItem[] = JSON.parse(saved);
        const hasLevel3 = parsed.some((c) => c.id.startsWith('3'));
        if (!hasLevel3) {
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
        const hasLevel3 = parsed.some((s) => (s.classId || '').startsWith('3'));
        if (!hasLevel3) {
          return [...parsed, ...MASTER_STUDENTS_3_SMP];
        }
        return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_STUDENTS;
  });

  const [config, setConfig] = useState<SchoolConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      ...INITIAL_SCHOOL_CONFIG,
      classLatin: '1A (Kelas 1 SMP A)',
      classAr: 'الأوّل - A',
      waliKelasName: 'Ustzh. Siti Nurhaliza, S.Pd',
    };
  });

  // Active view: 'master' (Data Master 77 Siswa) | 'guru' (Pilih kelas & mapel) | 'raport' (Certificate) | 'rekap' (Spreadsheet)
  const [activeTab, setActiveTab] = useState<'master' | 'guru' | 'raport' | 'rekap'>('master');

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
    const cls = classes.find((c) => c.id === selectedClassId);
    if (cls) {
      setConfig((prev) => ({
        ...prev,
        classLatin: cls.nameLatin,
        classAr: cls.nameAr,
        waliKelasName: cls.waliKelasName || prev.waliKelasName,
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
    // 1. Calculate raw total and average for each student
    const withTotals = students.map((std) => {
      const total = subjects.reduce((sum, sub) => {
        const val = std.scores[sub.id];
        return sum + (typeof val === 'number' && !isNaN(val) ? val : 0);
      }, 0);
      const avg = subjects.length > 0 ? Math.round(total / subjects.length) : 0;
      return {
        ...std,
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
  }, [students, subjects]);

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
      alert('Minimal harus ada 1 santri dalam sistem.');
      return;
    }
    if (window.confirm('Yakin ingin menghapus santri ini dari daftar?')) {
      setStudents((prev) => prev.filter((s) => s.id !== studentId));
      if (selectedClassStudentIndex >= studentsInCurrentClass.length - 1) {
        setSelectedClassStudentIndex(Math.max(0, studentsInCurrentClass.length - 2));
      }
    }
  };

  const handleResetToDefault = () => {
    if (window.confirm('Kembalikan data santri ke Data Master Resmi SMP Kelas 1, 2, & 3 (359 Siswa)?')) {
      setStudents(INITIAL_STUDENTS);
      setSelectedClassId('1a');
      setSelectedClassStudentIndex(0);
      setRangeStart(1);
      setRangeEnd(15);
      localStorage.removeItem(STORAGE_KEY_STUDENTS);
    }
  };

  const handlePrintSingle = () => {
    window.print();
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

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-emerald-200">
      {/* Top Application Navigation Bar (Hidden during print) */}
      <header className="no-print bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3">
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
              <p className="text-[11px] text-stone-400 font-medium">
                Pondok Modern Al-Ghozali • Kelas {config.classLatin} • TA {config.academicYearLatin}
              </p>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center bg-stone-800 p-1 rounded-xl border border-stone-700 text-xs font-semibold overflow-x-auto">
            {/* TAB 0: Data Master Siswa (77 Siswa) */}
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
              <span>Data Master Siswa ({students.length})</span>
            </button>

            {/* TAB 1: Input Nilai Guru (Per Kelas & Mapel) */}
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

            {/* TAB 2: Cetak Raport Santri (Kasyfud Darajat) */}
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

            {/* TAB 3: Rekapitulasi Nilai */}
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
          </div>

          {/* Action Tools */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-700/90 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition shadow-sm"
            >
              <Plus size={14} />
              <span>Tambah Santri</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 px-3 py-1.5 rounded-lg transition"
            >
              <Sliders size={14} />
              <span>Pengaturan</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              title="Reset ke Data Master SMP (Kelas 1, 2, & 3)"
              className="p-2 text-stone-400 hover:text-rose-400 hover:bg-stone-800 rounded-lg transition"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'master' ? (
          /* View 0: Data Master Siswa Kelas 1 SMP (1A, 1B, 1D, 1E: 77 Siswa) */
          <DataMasterView
            students={calculatedStudents}
            classes={classes}
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
        ) : activeTab === 'guru' ? (
          /* View 1: Guru Pilih Kelas -> Tampil Siswa -> Pilih Mapel Yang Diajar */
          <TeacherGradingView
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClassId={setSelectedClassId}
            subjects={subjects}
            selectedSubjectId={selectedSubjectId}
            onSelectSubjectId={setSelectedSubjectId}
            studentsInClass={studentsInCurrentClass}
            allStudents={calculatedStudents}
            onUpdateScore={handleUpdateScore}
            onOpenRaportForStudent={handleOpenRaportForStudent}
          />
        ) : activeTab === 'raport' ? (
          /* View 2: Authentic Certificate Raport with Sidebar Controls (Image 1 layout) */
          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Printable Report Certificate */}
            <div className="w-full flex-1 flex justify-center overflow-x-auto pb-6">
              {activeStudent ? (
                <ReportCertificate
                  student={activeStudent}
                  subjects={subjects}
                  config={config}
                />
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
                classes={classes}
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
              classes={classes}
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
