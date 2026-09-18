import React, { useState } from 'react';
import { Subject, CalculatedStudent, SchoolConfig, ClassItem, AuthUser } from '../types';
import { getSubjectsForClass } from '../data/curriculumSubjects';
import { Printer, Download, Plus, RotateCcw, ExternalLink, Edit3, Trash2, Search, Filter, FileSpreadsheet } from 'lucide-react';
import { canUserEditSubject } from '../utils/authHelpers';
import { exportRekapToExcel } from '../utils/exportHelpers';

interface RekapitulasiTableProps {
  students: CalculatedStudent[];
  subjects: Subject[];
  config: SchoolConfig;
  classes?: ClassItem[];
  selectedClassId?: string;
  onSelectClassId?: (classId: string) => void;
  onUpdateScore: (studentId: string, subjectId: string, value: number) => void;
  onAddStudent: () => void;
  onDeleteStudent: (studentId: string) => void;
  onSelectStudentForRaport: (studentIndex: number) => void;
  onResetData: () => void;
  currentUser?: AuthUser | null;
}

export const RekapitulasiTable: React.FC<RekapitulasiTableProps> = ({
  students,
  subjects,
  config,
  classes = [],
  selectedClassId,
  onSelectClassId,
  onUpdateScore,
  onAddStudent,
  onDeleteStudent,
  onSelectStudentForRaport,
  onResetData,
  currentUser = null,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCell, setEditingCell] = useState<{ studentId: string; subjectId: string } | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const effectiveSubjects = (selectedClassId && selectedClassId !== 'all')
    ? getSubjectsForClass(selectedClassId)
    : subjects;

  const pondokSubjects = effectiveSubjects.filter((s) => s.category === 'pondok');
  const umumSubjects = effectiveSubjects.filter((s) => s.category === 'umum');
  const lisanSubjects = effectiveSubjects.filter((s) => s.category === 'lisan');

  const filteredStudents = students.filter(
    (s) =>
      (!selectedClassId || selectedClassId === 'all' || (s.classId || '1a') === selectedClassId) &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm))
  );


  const startEditing = (studentId: string, subjectId: string, currentVal: number) => {
    const student = students.find((s) => s.id === studentId);
    const studentClassId = student?.classId || selectedClassId || '1a';
    const sub = subjects.find((s) => s.id === subjectId);
    if (sub && !canUserEditSubject(currentUser, sub.nameId, studentClassId)) {
      alert(`Anda (${currentUser?.name || 'Pengguna'}) tidak berhak menginput atau mengubah nilai untuk mata pelajaran ${sub.nameId} di kelas ini.`);
      return;
    }
    setEditingCell({ studentId, subjectId });
    setTempValue(String(currentVal || ''));
  };

  const saveEditing = (studentId: string, subjectId: string) => {
    const num = Math.max(0, Math.min(100, parseInt(tempValue, 10) || 0));
    onUpdateScore(studentId, subjectId, num);
    setEditingCell(null);
  };

  const handleExportExcel = () => {
    const currentClass = classes.find((c) => c.id === selectedClassId);
    exportRekapToExcel(filteredStudents, effectiveSubjects, config, currentClass);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'Nama',
      'NISN',
      ...effectiveSubjects.map((s) => s.nameId),
      'Jumlah',
      'Rata-rata',
      'Ranking',
      'Keterangan',
    ];

    const rows = filteredStudents.map((s, idx) => [
      idx + 1,
      `"${s.name}"`,
      `"${s.nisn}"`,
      ...effectiveSubjects.map((sub) => s.scores[sub.id] || 0),
      s.totalScore,
      s.averageScore,
      s.rank,
      `"${s.keterangan || 'Tuntas'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekapitulasi_Nilai_${config.classLatin}_${config.academicYearLatin}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintRekap = () => {
    window.print();
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md border border-stone-200 overflow-hidden flex flex-col">
      {/* Top Action Bar */}
      <div className="no-print p-4 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Class Filter Dropdown */}
          {classes.length > 0 && onSelectClassId && (
            <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-2.5 py-1">
              <Filter size={13} className="text-emerald-600" />
              <span className="text-[11px] text-stone-500 font-medium">Kelas:</span>
              <select
                value={selectedClassId || (classes[0]?.id || 'all')}
                onChange={(e) => onSelectClassId(e.target.value)}
                className="text-xs font-bold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
              >
                {currentUser?.role === 'admin' && <option value="all">Semua Kelas</option>}
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameLatin} ({c.nameAr})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
            <input
              type="text"
              placeholder="Cari santri / NISN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-48"
            />
          </div>
          <span className="text-xs text-stone-500">
            Tampil: <strong>{filteredStudents.length}</strong> santri
          </span>
        </div>


        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onAddStudent}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
          >
            <Plus size={14} />
            Tambah Santri
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg shadow-sm transition"
            title="Download Rekap Nilai ke format Microsoft Excel (.xlsx)"
          >
            <FileSpreadsheet size={14} />
            Export Excel (.xlsx)
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-white hover:bg-stone-100 text-stone-700 border border-stone-300 rounded-lg transition"
            title="Download Rekap Nilai format CSV"
          >
            <Download size={13} />
            CSV
          </button>

          <button
            type="button"
            onClick={handlePrintRekap}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg shadow-sm transition"
          >
            <Printer size={14} />
            Cetak Rekap
          </button>

          <button
            type="button"
            onClick={onResetData}
            title="Kembalikan data santri default"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-stone-200 transition"
          >
            <RotateCcw size={13} />
            Reset Data
          </button>
        </div>
      </div>

      {/* Spreadsheet Header (Image 2 style) */}
      <div className="text-center py-5 px-4 border-b border-stone-300 bg-stone-50/50">
        <h2 className="text-lg md:text-xl font-extrabold uppercase tracking-wide text-stone-900">
          {config.subTitleId}
        </h2>
        <h3 className="text-base md:text-lg font-bold text-stone-800 mt-0.5">
          {config.schoolName}
        </h3>
        <p className="text-sm font-semibold text-stone-600">
          TAHUN PELAJARAN {config.academicYearLatin}
        </p>
        <div className="inline-block mt-2 px-3 py-0.5 bg-stone-200/80 rounded font-bold text-xs uppercase tracking-wider text-stone-800">
          KELAS : {config.classLatin}
        </div>
      </div>

      {/* Responsive Scrolling Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse border border-black text-[10.5px] text-center select-none whitespace-nowrap">
          {/* Header Rows */}
          <thead>
            {/* Top Category Header Row */}
            <tr className="bg-stone-200 font-bold border-b border-black">
              <th rowSpan={3} className="border border-black px-2 py-2 w-8 bg-stone-300">
                NO
              </th>
              <th rowSpan={3} className="border border-black px-3 py-2 text-left min-w-[170px] bg-stone-300">
                NAMA
              </th>
              <th rowSpan={3} className="border border-black px-2 py-2 min-w-[90px] bg-stone-300">
                NISN
              </th>

              {/* Pondok Subjects Group (Light Blue / Gray) */}
              <th
                colSpan={pondokSubjects.length}
                className="border border-black py-1.5 bg-[#cbd5e1] text-stone-900 font-extrabold"
              >
                MATA PELAJARAN PONDOK
              </th>

              {/* Umum Subjects Group (Light Green) */}
              <th
                colSpan={umumSubjects.length}
                className="border border-black py-1.5 bg-[#bbf7d0] text-stone-900 font-extrabold"
              >
                MATA PELAJARAN UMUM
              </th>

              {/* Lisan Subjects Group (Peach / Orange) */}
              <th
                colSpan={lisanSubjects.length}
                className="border border-black py-1.5 bg-[#fed7aa] text-stone-900 font-extrabold"
              >
                MATERI LISAN
              </th>

              {/* Calculated Outputs (Yellow / Gold) */}
              <th rowSpan={3} className="border border-black px-2 py-2 bg-[#fef08a] font-black text-[11px] w-14">
                JUMLAH
              </th>
              <th rowSpan={3} className="border border-black px-2 py-2 bg-[#fef08a] font-black text-[11px] w-14">
                RATA-RATA
              </th>
              <th rowSpan={3} className="border border-black px-2 py-2 bg-[#fde047] font-black text-[11px] w-14">
                RANGKING
              </th>
              <th rowSpan={3} className="border border-black px-2 py-2 bg-stone-300 font-bold w-20">
                KETERANGAN
              </th>
              <th rowSpan={3} className="no-print border border-black px-2 py-2 bg-stone-200 font-bold w-16">
                AKSI
              </th>
            </tr>

            {/* Subject Sequential Numbers (1-10, 1-15, 1-3) */}
            <tr className="bg-stone-100 font-bold border-b border-black text-[10px]">
              {pondokSubjects.map((_, i) => (
                <th key={`num-p-${i}`} className="border border-black py-0.5 bg-[#e2e8f0]">
                  {i + 1}
                </th>
              ))}
              {umumSubjects.map((_, i) => (
                <th key={`num-u-${i}`} className="border border-black py-0.5 bg-[#dcfce7]">
                  {i + 1}
                </th>
              ))}
              {lisanSubjects.map((_, i) => (
                <th key={`num-l-${i}`} className="border border-black py-0.5 bg-[#ffedd5]">
                  {i + 1}
                </th>
              ))}
            </tr>

            {/* Subject Names (Vertical-like / compact header) */}
            <tr className="bg-stone-50 font-bold border-b-2 border-black text-[9.5px]">
              {subjects.map((sub) => (
                <th
                  key={sub.id}
                  title={sub.nameId}
                  className="border border-black px-1 py-3 max-w-[42px] overflow-hidden text-ellipsis"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {sub.nameId}
                </th>
              ))}
            </tr>
          </thead>

          {/* Student Data Rows */}
          <tbody>
            {filteredStudents.map((student, idx) => {
              const originalIndex = students.findIndex((s) => s.id === student.id);
              return (
                <tr
                  key={student.id}
                  className="hover:bg-amber-50/60 transition-colors border-b border-black text-stone-900"
                >
                  {/* NO */}
                  <td className="border border-black py-1 px-1 font-bold">
                    {idx + 1}
                  </td>

                  {/* NAMA */}
                  <td className="border border-black py-1 px-3 text-left font-semibold text-[11px]">
                    <div className="flex items-center justify-between group">
                      <span>{student.name}</span>
                      <button
                        type="button"
                        onClick={() => onSelectStudentForRaport(originalIndex)}
                        title="Buka Raport Santri Ini"
                        className="no-print opacity-0 group-hover:opacity-100 text-emerald-700 hover:text-emerald-900 transition ml-2"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </td>

                  {/* NISN */}
                  <td className="border border-black py-1 px-2 font-mono text-[10px]">
                    {student.nisn || '-'}
                  </td>

                  {/* Subject Scores (Click to edit inline!) */}
                  {subjects.map((sub) => {
                    const score = student.scores[sub.id] || 0;
                    const isEditing =
                      editingCell?.studentId === student.id && editingCell?.subjectId === sub.id;

                    return (
                      <td
                        key={sub.id}
                        onClick={() => startEditing(student.id, sub.id, score)}
                        className={`border border-black py-1 px-1 cursor-pointer font-mono text-[10.5px] ${
                          score < 60 ? 'text-red-600 font-bold bg-red-50/40' : ''
                        } hover:bg-emerald-100/50 transition-colors`}
                        title="Klik untuk ubah nilai"
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            autoFocus
                            value={tempValue}
                            onChange={(e) => setTempValue(e.target.value)}
                            onBlur={() => saveEditing(student.id, sub.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditing(student.id, sub.id);
                              if (e.key === 'Escape') setEditingCell(null);
                            }}
                            className="w-10 text-center font-bold text-xs bg-white border border-emerald-500 rounded p-0 outline-none"
                          />
                        ) : (
                          score
                        )}
                      </td>
                    );
                  })}

                  {/* JUMLAH */}
                  <td className="border border-black py-1 px-1 font-bold font-mono bg-[#fef9c3] text-[11px]">
                    {student.totalScore}
                  </td>

                  {/* RATA-RATA */}
                  <td className="border border-black py-1 px-1 font-bold font-mono bg-[#fef9c3] text-[11px]">
                    {student.averageScore}
                  </td>

                  {/* RANKING */}
                  <td className="border border-black py-1 px-1 font-extrabold font-mono bg-[#fde047] text-[11px]">
                    {student.rank}
                  </td>

                  {/* KETERANGAN */}
                  <td className="border border-black py-1 px-2 font-medium text-[10px]">
                    {student.keterangan || (student.averageScore >= 60 ? 'Tuntas' : 'Perlu Bimbingan')}
                  </td>

                  {/* AKSI */}
                  <td className="no-print border border-black py-1 px-1">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onSelectStudentForRaport(originalIndex)}
                        title="Cetak Raport"
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteStudent(student.id)}
                        title="Hapus Santri"
                        className="p-1 text-rose-500 hover:bg-rose-100 rounded"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Empty filler rows up to 15 if needed for Excel appearance */}
            {filteredStudents.length < 10 &&
              Array.from({ length: 10 - filteredStudents.length }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-black text-stone-400 bg-stone-50/20">
                  <td className="border border-black py-1 text-xs">{filteredStudents.length + i + 1}</td>
                  <td className="border border-black py-1 px-3 text-left"></td>
                  <td className="border border-black py-1"></td>
                  {subjects.map((sub) => (
                    <td key={`empty-sub-${sub.id}-${i}`} className="border border-black py-1"></td>
                  ))}
                  <td className="border border-black py-1 bg-stone-100/50">0</td>
                  <td className="border border-black py-1 bg-stone-100/50">0</td>
                  <td className="border border-black py-1 bg-stone-100/50">-</td>
                  <td className="border border-black py-1"></td>
                  <td className="no-print border border-black py-1"></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Footer Instructions */}
      <div className="no-print p-3 bg-stone-50 border-t border-stone-200 text-xs text-stone-500 flex items-center justify-between">
        <p className="flex items-center gap-1">
          <Edit3 size={13} />
          <span>Tips: Klik pada angka nilai untuk mengedit nilai santri secara langsung.</span>
        </p>
        <p>Semua perubahan langsung memperbarui peringkat & rata-rata secara otomatis.</p>
      </div>
    </div>
  );
};
