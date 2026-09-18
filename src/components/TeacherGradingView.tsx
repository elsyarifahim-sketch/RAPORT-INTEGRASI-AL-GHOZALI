import React, { useState, useRef, useMemo } from 'react';
import { ClassItem, Subject, CalculatedStudent, AuthUser, JenjangUnit } from '../types';
import { toEasternArabicNumerals, numberToArabicWords } from '../utils/arabicNumbers';
import { findTeachersForSubjectAndClass } from '../data/teacherSubjectsDatabase';
import { canUserEditSubject, getJenjangForClass } from '../utils/authHelpers';
import * as XLSX from 'xlsx';
import {
  BookOpen,
  Users,
  GraduationCap,
  Printer,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  Lock,
  Unlock,
  ShieldAlert,
  School,
  FileSpreadsheet,
} from 'lucide-react';

interface TeacherGradingViewProps {
  classes: ClassItem[];
  selectedClassId: string;
  onSelectClassId: (classId: string) => void;
  subjects: Subject[];
  selectedSubjectId: string;
  onSelectSubjectId: (subjectId: string) => void;
  studentsInClass: CalculatedStudent[];
  allStudents?: CalculatedStudent[];
  onUpdateScore: (studentId: string, subjectId: string, value: number) => void;
  onOpenRaportForStudent: (studentId: string) => void;
  currentUser?: AuthUser | null;
  activeJenjang?: JenjangUnit;
  onSelectJenjang?: (unit: JenjangUnit) => void;
}

export const TeacherGradingView: React.FC<TeacherGradingViewProps> = ({
  classes,
  selectedClassId,
  onSelectClassId,
  subjects,
  selectedSubjectId,
  onSelectSubjectId,
  studentsInClass,
  allStudents = [],
  onUpdateScore,
  onOpenRaportForStudent,
  currentUser = null,
  activeJenjang,
  onSelectJenjang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pondok' | 'umum' | 'lisan'>('all');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0] || {
    id: '1a',
    nameLatin: '1A (1 A Tahfiz Putri)',
    nameAr: 'الأوّل - A تحفيظ (بنات)',
    waliKelasName: '',
  };

  const isAdmin = currentUser?.role === 'admin';
  const availableUnits: JenjangUnit[] = currentUser?.availableUnits || (isAdmin ? ['SMP', 'SMA', 'TMMIA'] : ['SMP']);
  const effectiveJenjang: JenjangUnit = activeJenjang || (currentClass ? getJenjangForClass(currentClass) : 'SMP');
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0] || {
    id: 's1',
    order: 1,
    nameId: 'Mata Pelajaran',
    nameAr: 'المادة الدراسية',
    category: 'pondok' as const,
  };

  // Find teachers assigned to this subject & class from Database Guru
  const assignedTeachers = useMemo(() => {
    return findTeachersForSubjectAndClass(currentSubject.nameId, currentClass.nameLatin);
  }, [currentSubject.nameId, currentClass.nameLatin]);

  // Check if current logged-in user is authorized to edit scores for this subject in this class
  const canEditCurrentSubject = useMemo(() => {
    if (!currentUser) return true;
    return canUserEditSubject(currentUser, currentSubject.nameId, currentClass.nameLatin);
  }, [currentUser, currentSubject.nameId, currentClass.nameLatin]);

  // Filtered subjects based on category filter
  const filteredSubjects = subjects.filter(
    (s) => categoryFilter === 'all' || s.category === categoryFilter
  );

  // Filtered students by search term
  const filteredStudents = studentsInClass.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm)
  );

  // Auto-select first authorized subject for guru when class changes
  React.useEffect(() => {
    if (currentUser?.role === 'guru' && subjects.length > 0) {
      const isCurrentEditable = canUserEditSubject(currentUser, currentSubject.nameId, currentClass.nameLatin);
      if (!isCurrentEditable) {
        const firstEditable = subjects.find((s) => canUserEditSubject(currentUser, s.nameId, currentClass.nameLatin));
        if (firstEditable) {
          onSelectSubjectId(firstEditable.id);
        }
      }
    }
  }, [currentClass.id, currentClass.nameLatin, subjects, currentUser]);

  // Statistics for the selected subject in this class
  const scores = studentsInClass.map((s) => s.scores[currentSubject.id] || 0);
  const totalScore = scores.reduce((a, b) => a + b, 0);
  const avgScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;
  const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
  const minScore = scores.length > 0 ? Math.min(...scores) : 0;
  const passedCount = scores.filter((sc) => sc >= 60).length;
  const passPercentage = scores.length > 0 ? Math.round((passedCount / scores.length) * 100) : 0;

  // Grade predicate (Indonesian & Pesantren Arabic standards)
  const getPredicate = (score: number) => {
    if (score >= 85) return { label: 'A (Mumtaz)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (score >= 75) return { label: 'B (Jayyid Jiddan)', color: 'text-blue-700 bg-blue-50 border-blue-200' };
    if (score >= 65) return { label: 'C (Jayyid)', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    if (score >= 60) return { label: 'D (Maqbul)', color: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: 'E (Rasib)', color: 'text-red-700 bg-red-50 border-red-200' };
  };

  // Keyboard navigation: pressing Enter or ArrowDown jumps to next student
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextStudent = filteredStudents[currentIndex + 1];
      if (nextStudent && inputRefs.current[nextStudent.id]) {
        inputRefs.current[nextStudent.id]?.focus();
        inputRefs.current[nextStudent.id]?.select();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevStudent = filteredStudents[currentIndex - 1];
      if (prevStudent && inputRefs.current[prevStudent.id]) {
        inputRefs.current[prevStudent.id]?.focus();
        inputRefs.current[prevStudent.id]?.select();
      }
    }
  };

  const handleBatchFill = () => {
    if (!canEditCurrentSubject) {
      alert(`Anda (${currentUser?.name || 'Pengguna'}) tidak berhak menginput nilai untuk mata pelajaran ${currentSubject.nameId} di kelas ini.`);
      return;
    }
    const valStr = prompt(`Masukkan nilai default untuk semua ${studentsInClass.length} santri di kelas ${currentClass.nameLatin}:`, '75');
    if (valStr !== null) {
      const num = Math.max(0, Math.min(100, parseInt(valStr, 10) || 0));
      studentsInClass.forEach((std) => {
        onUpdateScore(std.id, currentSubject.id, num);
      });
    }
  };

  const handleExportMapelExcel = () => {
    const headerInfo = [
      ['PESANTREN AL-GHOZALI GUNUNG SINDUR BOGOR'],
      ['DAFTAR NILAI ASESMEN HASIL BELAJAR SANTRI'],
      [`Mata Pelajaran: ${currentSubject.nameId} (${currentSubject.nameAr})`, '', `Kelas: ${currentClass.nameLatin}`],
      [`Guru Pengampu: ${assignedTeachers.join(', ') || currentUser?.name || '-'}`, '', `Wali Kelas: ${currentClass.waliKelasName || '-'}`],
      [],
      ['No', 'NISN', 'Nama Lengkap Santri', 'Kelas', 'Nilai Angka', 'Angka Arab', 'Terbilang Arab', 'Predikat', 'Keterangan'],
    ];

    const dataRows = studentsInClass.map((s, idx) => {
      const sc = s.scores[currentSubject.id] || 0;
      return [
        idx + 1,
        s.nisn || '-',
        s.name,
        currentClass.nameLatin,
        sc,
        toEasternArabicNumerals(sc),
        numberToArabicWords(sc),
        getPredicate(sc).label,
        sc >= 60 ? 'Tuntas' : 'Belum Tuntas',
      ];
    });

    const worksheet = XLSX.utils.aoa_to_sheet([...headerInfo, ...dataRows]);
    worksheet['!cols'] = [
      { wch: 5 },
      { wch: 16 },
      { wch: 32 },
      { wch: 16 },
      { wch: 12 },
      { wch: 14 },
      { wch: 20 },
      { wch: 20 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Nilai');
    const safeMapel = currentSubject.nameId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeKelas = currentClass.nameLatin.replace(/[^a-zA-Z0-9_-]/g, '_');
    XLSX.writeFile(workbook, `Daftar_Nilai_${safeMapel}_${safeKelas}.xlsx`);
  };

  const handleExportMapelCSV = () => {
    const headers = ['No', 'Nama Santri', 'NISN', 'Kelas', 'Mata Pelajaran', 'Nilai', 'Angka Arab', 'Terbilang Arab', 'Predikat', 'Status'];
    const rows = studentsInClass.map((s, idx) => {
      const sc = s.scores[currentSubject.id] || 0;
      return [
        idx + 1,
        `"${s.name}"`,
        `"${s.nisn}"`,
        `"${currentClass.nameLatin}"`,
        `"${currentSubject.nameId}"`,
        sc,
        `"${toEasternArabicNumerals(sc)}"`,
        `"${numberToArabicWords(sc)}"`,
        `"${getPredicate(sc).label}"`,
        sc >= 60 ? 'Tuntas' : 'Belum Tuntas',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nilai_${currentSubject.nameId.replace(/\s+/g, '_')}_${currentClass.nameLatin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full space-y-6">
      {/* =========================================================
          STEP 1: GURU PILIH KELAS
          ========================================================= */}
      <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">1</span>
              <span>Langkah Pertama</span>
            </div>
            <h2 className="text-lg font-extrabold text-stone-900 mt-0.5">
              Pilih Kelas Yang Diajar
            </h2>
            <p className="text-xs text-stone-500">
              {isAdmin
                ? `Menampilkan seluruh kelas di Jenjang ${effectiveJenjang}`
                : `Menampilkan hanya kelas yang Anda ampu di Jenjang ${effectiveJenjang}`}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <GraduationCap className="text-emerald-600" size={16} />
            <span className="text-stone-500">Wali Kelas:</span>
            <span className="font-bold text-stone-800">{currentClass.waliKelasName || '-'}</span>
          </div>
        </div>

        {/* Multi-Jenjang Selector (Otomatis tampil jika guru mengajar di 2 jenjang atau admin) */}
        {availableUnits.length > 1 && onSelectJenjang && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-stone-900 via-stone-850 to-emerald-950 p-3.5 rounded-2xl border border-emerald-500/40 text-white mb-4 shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <School size={16} />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-amber-400" />
                  {isAdmin ? 'Pilih Jenjang Sekolah:' : `Anda Mengajar di ${availableUnits.length} Jenjang:`}
                </span>
                <span className="text-[11px] text-stone-300">
                  {isAdmin ? 'Filter kelas berdasarkan unit' : 'Pilih jenjang untuk menampilkan kelas yang Anda ampu:'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {availableUnits.map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => onSelectJenjang(unit)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    effectiveJenjang === unit
                      ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400 font-extrabold'
                      : 'bg-stone-800/90 text-stone-300 hover:bg-stone-750 hover:text-white border border-stone-700'
                  }`}
                >
                  <span>{unit === 'SMP' ? 'SMP (Kelas 1-3)' : unit === 'SMA' ? 'SMA (Kelas 4-6)' : 'TMMIA / INT'}</span>
                  {effectiveJenjang === unit && <CheckCircle2 size={13} className="text-amber-300" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notification Bar of Displayed Classes */}
        <div className="flex items-center justify-between bg-stone-50 border border-stone-200 px-3.5 py-2 rounded-xl mb-3 text-xs">
          <div className="flex items-center gap-2 text-stone-700 font-semibold">
            <Users size={14} className="text-emerald-600" />
            <span>
              {isAdmin
                ? `Menampilkan ${classes.length} Kelas di Jenjang ${effectiveJenjang}`
                : `Hanya Menampilkan ${classes.length} Kelas Yang Diampu di Jenjang ${effectiveJenjang}`}
            </span>
          </div>
          <span className="text-[11px] text-stone-500 font-medium">
            {currentUser ? `${currentUser.name} (${currentUser.role === 'guru' ? 'Guru' : currentUser.role === 'wali_kelas' ? 'Wali Kelas' : 'Admin'})` : ''}
          </span>
        </div>

        {/* Class Selection Buttons */}
        {classes.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 border border-dashed border-stone-300 rounded-2xl">
            <ShieldAlert size={36} className="mx-auto text-amber-600 mb-2" />
            <h3 className="font-bold text-stone-800 text-sm">
              Tidak Ada Kelas yang Diampu di Jenjang {effectiveJenjang}
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Berdasarkan Master Penugasan Guru, Anda ({currentUser?.name || 'Guru'}) tidak memiliki jadwal mengajar pada jenjang ini.
              {availableUnits.length > 1 && ' Silakan beralih ke tombol jenjang lain di atas untuk melihat kelas yang Anda ampu.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {classes.map((cls) => {
              const isSelected = cls.id === selectedClassId;
              const count = allStudents.length > 0
                ? allStudents.filter((s) => (s.classId || '1a') === cls.id).length
                : (cls.id === selectedClassId ? studentsInClass.length : 0);
              const isPutri =
                cls.id === '1a' ||
                cls.id === '1b' ||
                cls.id === '2a' ||
                cls.id === '2b' ||
                cls.id === '2c' ||
                cls.id === '3a' ||
                cls.id === '3b' ||
                cls.id === '3c' ||
                cls.id === '4a' ||
                cls.id === '5a' ||
                cls.id === '5b' ||
                cls.id === '6a' ||
                cls.id === '6b';
              const is1Int = cls.id === '1int';
              const is2IntA = cls.id === '2int-a';
              const is2IntB = cls.id === '2int-b';
              const is2Int = is2IntA || is2IntB;
              const is3IntA = cls.id === '3int-a';
              const is3IntB = cls.id === '3int-b';
              const is3Int = is3IntA || is3IntB;
              const is4 = cls.id.startsWith('4');
              const is5 = cls.id.startsWith('5');
              const is6 = cls.id.startsWith('6');
              const levelNum = is1Int ? '1 INT' : is2Int ? '2 INT' : is3Int ? '3 INT' : is4 ? '4 / 1 SMA' : is5 ? '5 / 2 SMA' : is6 ? '6 / 3 SMA' : (cls.id.startsWith('3') && !is3Int) ? '3' : cls.id.startsWith('2') ? '2' : '1';

              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => onSelectClassId(cls.id)}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/80 shadow-md ring-2 ring-emerald-500/20'
                      : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-extrabold text-sm ${
                          isSelected ? 'text-emerald-900' : 'text-stone-800'
                        }`}
                      >
                        {is1Int ? '1 INT' : is2IntA ? '2INT.A IPA' : is2IntB ? '2INT.B IPS' : is3IntA ? '3INT.A IPA' : is3IntB ? '3INT.B IPS' : cls.id === '5a' ? '5A IPA' : cls.id === '5b' ? '5B IPS' : cls.id === '5c' ? '5C IPA' : cls.id === '5d' ? '5D IPS' : cls.id === '6a' ? '6A IPA' : cls.id === '6b' ? '6B IPS' : cls.id === '6c' ? '6C IPA' : cls.id === '6d' ? '6D IPS' : cls.nameLatin.split(' ')[0]}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        is1Int ? 'bg-fuchsia-100 text-fuchsia-800' :
                        is2Int ? 'bg-purple-100 text-purple-800' :
                        is3Int ? 'bg-rose-100 text-rose-800' :
                        is4 ? 'bg-emerald-100 text-emerald-800' :
                        is5 ? 'bg-amber-100 text-amber-800' :
                        is6 ? 'bg-teal-100 text-teal-800' :
                        levelNum === '3' ? 'bg-purple-50 text-purple-700' :
                        levelNum === '2' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {is1Int ? '1 INT / SMA' : is2Int ? '2 INT / SMA' : is3Int ? '3 INT / 3 SMA' : is4 ? '4 / 1 SMA' : is5 ? '5 / 2 SMA' : is6 ? '6 / 3 SMA' : `${levelNum} SMP`}
                      </span>
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center justify-between w-full mt-1">
                    <span className="font-arabic text-sm text-stone-500 font-bold" dir="rtl">
                      {cls.nameAr}
                    </span>
                    <span className={`text-[10px] font-semibold ${
                      is1Int || is2Int ? 'text-purple-600' : is3Int ? 'text-rose-600' : isPutri ? 'text-pink-600' : 'text-blue-600'
                    }`}>
                      {is1Int ? '8 Pi • 11 Pa' : is2IntA ? '4 Pi • 4 Pa (IPA)' : is2IntB ? '5 Pi • 4 Pa (IPS)' : is3IntA ? '9 Pi • 9 Pa (IPA)' : is3IntB ? '9 Pi • 7 Pa (IPS)' : cls.id === '5a' || cls.id === '6a' ? 'Putri (IPA)' : cls.id === '5b' || cls.id === '6b' ? 'Putri (IPS)' : cls.id === '5c' || cls.id === '6c' ? 'Putra (IPA)' : cls.id === '5d' || cls.id === '6d' ? 'Putra (IPS)' : isPutri ? 'Putri' : 'Putra'}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] font-medium text-stone-600 flex items-center gap-1">
                    <Users size={12} className="text-stone-400" />
                    <span>{count} Santri</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================
          STEP 2: GURU PILIH MATA PELAJARAN YANG DIAJAR DI KELAS ITU
          ========================================================= */}
      <section className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">2</span>
              <span>Langkah Kedua</span>
            </div>
            <h2 className="text-lg font-extrabold text-stone-900 mt-0.5">
              Pilih Mata Pelajaran Yang Diajar di Kelas {currentClass.nameLatin}
            </h2>
            <p className="text-xs text-stone-500">
              Menampilkan {subjects.length} mata pelajaran resmi kurikulum untuk kelas {currentClass.nameLatin}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Semua ({subjects.length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('pondok')}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === 'pondok'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Pondok ({subjects.filter((s) => s.category === 'pondok').length})
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('umum')}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === 'umum'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Umum ({subjects.filter((s) => s.category === 'umum').length})
            </button>
            {subjects.some((s) => s.category === 'lisan') && (
              <button
                type="button"
                onClick={() => setCategoryFilter('lisan')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  categoryFilter === 'lisan'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Lisan ({subjects.filter((s) => s.category === 'lisan').length})
              </button>
            )}
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 max-h-64 overflow-y-auto pr-1">
          {filteredSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            const isTaughtByMe = canUserEditSubject(currentUser, sub.nameId, currentClass.nameLatin);
            const teachersForSub = findTeachersForSubjectAndClass(sub.nameId, currentClass.nameLatin);

            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubjectId(sub.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                    : isTaughtByMe && currentUser?.role === 'guru'
                    ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-stone-800 ring-1 ring-emerald-400/30'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span
                      className={`font-mono px-1.5 py-0.2 rounded font-bold text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      #{sub.order}
                    </span>
                    <span
                      className={`text-[9.5px] uppercase font-bold ${
                        isSelected ? 'text-emerald-100' : 'text-stone-400'
                      }`}
                    >
                      {sub.category}
                    </span>
                  </div>

                  <div className="text-xs font-bold truncate" title={sub.nameId}>
                    {sub.nameId}
                  </div>

                  <div
                    className={`font-arabic text-xs mt-0.5 text-right truncate ${
                      isSelected ? 'text-emerald-100' : 'text-stone-500'
                    }`}
                    dir="rtl"
                  >
                    {sub.nameAr}
                  </div>
                </div>

                {/* Teacher ownership badge */}
                {currentUser?.role === 'guru' && (
                  <div className="mt-2 pt-1 border-t border-black/5 flex items-center justify-between text-[9.5px]">
                    {isTaughtByMe ? (
                      <span className={`inline-flex items-center gap-0.5 font-bold ${isSelected ? 'text-amber-300' : 'text-emerald-700'}`}>
                        <CheckCircle2 size={10} />
                        <span>Diampu Anda</span>
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-0.5 truncate ${isSelected ? 'text-emerald-200' : 'text-stone-400'}`} title={`Diampu: ${teachersForSub[0] || 'Guru Lain'}`}>
                        <Lock size={9} />
                        <span className="truncate">{teachersForSub[0] ? teachersForSub[0].split(' ')[0] : 'Lain'}</span>
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* =========================================================
          STEP 3: TAMPIL SELURUH SISWA DI KELAS & LEMBAR INPUT NILAI
          ========================================================= */}
      <section className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Header & Stats Bar */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/60">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs">3</span>
                <span>Daftar Nilai Siswa</span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 mt-0.5 flex items-center gap-2 flex-wrap">
                <span>{currentSubject.nameId}</span>
                <span className="font-arabic text-lg font-bold text-emerald-700">
                  ({currentSubject.nameAr})
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-stone-200 text-stone-700 font-semibold font-sans">
                  Kelas {currentClass.nameLatin}
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Menampilkan seluruh {studentsInClass.length} santri di kelas {currentClass.nameLatin}. Tekan Enter/Panah Bawah untuk pindah ke santri berikutnya.
              </p>

              {/* Guru Pengampu dari Database Guru */}
              {assignedTeachers.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                    <GraduationCap size={13} className="text-emerald-700" />
                    Guru Pengampu:
                  </span>
                  {assignedTeachers.map((guru) => (
                    <span
                      key={guru}
                      className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2 py-0.5 rounded-md text-[11px] font-semibold flex items-center gap-1"
                    >
                      <span>{guru}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Teacher Quick Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleBatchFill}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg shadow-2xs transition"
              >
                <Sparkles size={14} className="text-amber-500" />
                Isi Cepat Nilai
              </button>

              <button
                type="button"
                onClick={handleExportMapelExcel}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg shadow-sm transition"
                title="Download Lembar Nilai Format Microsoft Excel (.xlsx)"
              >
                <FileSpreadsheet size={14} />
                Export Excel (.xlsx)
              </button>

              <button
                type="button"
                onClick={handleExportMapelCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg shadow-2xs transition"
              >
                <Download size={14} />
                Export CSV
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg shadow-sm transition"
              >
                <Printer size={14} />
                Cetak Lembar Nilai
              </button>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <TrendingUp size={18} />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">Rata-Rata Mapel</span>
                <span className="text-lg font-extrabold text-stone-900">{avgScore}</span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
                <Award size={18} />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">Tertinggi / Terendah</span>
                <span className="text-lg font-extrabold text-stone-900">
                  {maxScore} <span className="text-xs text-stone-400 font-normal">/ {minScore}</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">Santri Tuntas</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {passedCount} <span className="text-xs text-stone-400 font-normal">/ {studentsInClass.length}</span>
                </span>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                <BookOpen size={18} />
              </div>
              <div>
                <span className="text-[11px] text-stone-500 font-medium block">Tingkat Kelulusan</span>
                <span className="text-lg font-extrabold text-stone-900">{passPercentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Student Search & Table Toolbar */}
        <div className="no-print p-3 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={15} />
            <input
              type="text"
              placeholder="Cari santri di kelas ini..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-64"
            />
          </div>

          <div className="flex items-center gap-3">
            {!canEditCurrentSubject && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2.5 py-1 rounded-md border border-amber-300/80">
                <Lock size={12} />
                <span>Mode Hanya-Lihat (Bukan Pengampu)</span>
              </span>
            )}
            <span className="text-xs text-stone-500 font-medium">
              KKM Standar: <strong>60</strong>
            </span>
          </div>
        </div>

        {!canEditCurrentSubject && (
          <div className="no-print mx-4 my-3 p-3 bg-amber-50/90 border border-amber-300/70 rounded-xl text-amber-900 text-xs flex items-center gap-2.5">
            <Lock size={16} className="text-amber-700 shrink-0" />
            <span>
              <strong>Perhatian Otoritas Pengajar:</strong> Anda ({currentUser?.name}) tidak terdaftar sebagai pengampu mata pelajaran <strong>{currentSubject.nameId}</strong> di kelas <strong>{currentClass.nameLatin}</strong>. Kolom nilai dalam mode hanya-baca untuk menjaga integritas data.
            </span>
          </div>
        )}

        {/* Table of Students in the Selected Class */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 text-[11px]">
                <th className="py-2.5 px-3 w-12 text-center">No</th>
                <th className="py-2.5 px-3 w-28">NISN</th>
                <th className="py-2.5 px-4 min-w-[200px]">Nama Lengkap Santri</th>
                <th className="py-2.5 px-3 w-32 text-center">Input Nilai (0-100)</th>
                <th className="py-2.5 px-3 w-20 text-center font-arabic text-xs">الأرقام</th>
                <th className="py-2.5 px-4 min-w-[170px] text-right font-arabic text-xs">بالحروف (Tafqit)</th>
                <th className="py-2.5 px-3 w-28 text-center">Predikat</th>
                <th className="py-2.5 px-3 w-24 text-center">Status</th>
                <th className="no-print py-2.5 px-3 w-24 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    <Users size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="font-semibold">Tidak ada santri di kelas ini.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => {
                  const score = student.scores[currentSubject.id] ?? 0;
                  const predicate = getPredicate(score);
                  const isPassed = score >= 60;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      {/* No */}
                      <td className="py-2 px-3 text-center font-bold text-stone-600">
                        {index + 1}
                      </td>

                      {/* NISN */}
                      <td className="py-2 px-3 font-mono text-[11px] text-stone-600">
                        {student.nisn || '-'}
                      </td>

                      {/* Nama Santri */}
                      <td className="py-2 px-4 font-bold text-stone-900">
                        <div className="flex items-center justify-between">
                          <span>{student.name}</span>
                          <span className="text-[10px] text-stone-400 font-normal hidden group-hover:inline">
                            Peringkat #{student.rank}
                          </span>
                        </div>
                      </td>

                      {/* Input Nilai Field */}
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            ref={(el) => {
                              inputRefs.current[student.id] = el;
                            }}
                            type="number"
                            min="0"
                            max="100"
                            disabled={!canEditCurrentSubject}
                            value={score}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                              onUpdateScore(student.id, currentSubject.id, val);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            title={!canEditCurrentSubject ? 'Hanya Guru Pengampu resmi yang berhak mengedit nilai ini' : undefined}
                            className={`w-16 text-center font-mono font-extrabold text-sm py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs transition ${
                              !canEditCurrentSubject
                                ? 'bg-stone-100 border-stone-300 text-stone-500 cursor-not-allowed'
                                : score < 60
                                ? 'border-red-400 bg-red-50 text-red-700'
                                : 'border-stone-300 bg-white text-stone-900'
                            }`}
                          />
                        </div>
                      </td>

                      {/* Angka Arab Timur */}
                      <td className="py-2 px-3 text-center font-arabic font-bold text-sm text-stone-800">
                        {toEasternArabicNumerals(score)}
                      </td>

                      {/* Terbilang Huruf Arab */}
                      <td className="py-2 px-4 text-right font-arabic font-semibold text-xs text-stone-900 whitespace-nowrap">
                        {numberToArabicWords(score)}
                      </td>

                      {/* Predikat */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold border ${predicate.color}`}
                        >
                          {predicate.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                            isPassed ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {isPassed ? (
                            <CheckCircle2 size={13} />
                          ) : (
                            <AlertCircle size={13} />
                          )}
                          <span>{isPassed ? 'Tuntas' : 'Remidi'}</span>
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="no-print py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onOpenRaportForStudent(student.id)}
                          title="Buka Raport Kasyfud Darajat Santri Ini"
                          className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-md transition inline-flex items-center gap-1 text-[11px] font-semibold"
                        >
                          <ExternalLink size={13} />
                          <span>Raport</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
          <span>
            Nilai tersimpan otomatis dan langsung memperbarui Raport Kasyfud Darajat serta Rekapitulasi Umum.
          </span>
          <span className="font-semibold text-stone-700">
            Pondok Modern Al-Ghozali
          </span>
        </div>
      </section>
    </div>
  );
};
