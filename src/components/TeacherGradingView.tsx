import React, { useState, useRef } from 'react';
import { ClassItem, Subject, CalculatedStudent } from '../types';
import { toEasternArabicNumerals, numberToArabicWords } from '../utils/arabicNumbers';
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'pondok' | 'umum' | 'lisan'>('all');
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

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
    const valStr = prompt(`Masukkan nilai default untuk semua ${studentsInClass.length} santri di kelas ${currentClass.nameLatin}:`, '75');
    if (valStr !== null) {
      const num = Math.max(0, Math.min(100, parseInt(valStr, 10) || 0));
      studentsInClass.forEach((std) => {
        onUpdateScore(std.id, currentSubject.id, num);
      });
    }
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
              Pilih kelas untuk memuat seluruh daftar santri yang terdaftar
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 text-xs">
            <GraduationCap className="text-emerald-600" size={16} />
            <span className="text-stone-500">Wali Kelas:</span>
            <span className="font-bold text-stone-800">{currentClass.waliKelasName || '-'}</span>
          </div>
        </div>

        {/* Class Selection Buttons */}
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
              cls.id === '3c';
            const levelNum = cls.id.startsWith('3') ? '3' : cls.id.startsWith('2') ? '2' : '1';

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
                      {cls.nameLatin.split(' ')[0]}
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      levelNum === '3' ? 'bg-purple-50 text-purple-700' :
                      levelNum === '2' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {levelNum} SMP
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
                  <span className={`text-[10px] font-semibold ${isPutri ? 'text-pink-600' : 'text-blue-600'}`}>
                    {isPutri ? 'Putri' : 'Putra'}
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
              Pilih salah satu dari 28 materi kurikulum Pondok Modern Al-Ghozali
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
              Semua (28)
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
              Pondok (10)
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
              Umum (15)
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('lisan')}
              className={`px-3 py-1.5 rounded-lg transition ${
                categoryFilter === 'lisan'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Lisan (3)
            </button>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 max-h-56 overflow-y-auto pr-1">
          {filteredSubjects.map((sub) => {
            const isSelected = sub.id === selectedSubjectId;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubjectId(sub.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-100 text-stone-800'
                }`}
              >
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
                  className={`font-arabic text-xs mt-1 text-right truncate ${
                    isSelected ? 'text-emerald-100' : 'text-stone-500'
                  }`}
                  dir="rtl"
                >
                  {sub.nameAr}
                </div>
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
        <div className="no-print p-3 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
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

          <span className="text-xs text-stone-500 font-medium">
            KKM Standar: <strong>60</strong>
          </span>
        </div>

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
                            value={score}
                            onChange={(e) => {
                              const val = Math.max(0, Math.min(100, parseInt(e.target.value, 10) || 0));
                              onUpdateScore(student.id, currentSubject.id, val);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className={`w-16 text-center font-mono font-extrabold text-sm py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs transition ${
                              score < 60
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
