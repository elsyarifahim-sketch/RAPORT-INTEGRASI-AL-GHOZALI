import React, { useState } from 'react';
import { CalculatedStudent, ClassItem } from '../types';
import { Search, Users, Printer, Download, PenTool, FileText, Plus, CheckCircle2, GraduationCap } from 'lucide-react';

interface DataMasterViewProps {
  students: CalculatedStudent[];
  classes: ClassItem[];
  selectedClassId: string;
  onSelectClassId: (classId: string) => void;
  onAddStudent: () => void;
  onEditStudent: (student: CalculatedStudent) => void;
  onDeleteStudent: (studentId: string) => void;
  onNavigateToGrading: (classId: string) => void;
  onNavigateToRaport: (studentId: string) => void;
}

export const DataMasterView: React.FC<DataMasterViewProps> = ({
  students,
  classes,
  selectedClassId,
  onSelectClassId,
  onAddStudent,
  onEditStudent,
  onDeleteStudent,
  onNavigateToGrading,
  onNavigateToRaport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'all' | '1' | '2' | '3'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');

  // Filter classes shown in selector cards based on selected level
  const displayedClasses = classes.filter((c) => {
    if (selectedLevel === 'all') return true;
    if (selectedLevel === '1') return c.id.startsWith('1');
    if (selectedLevel === '2') return c.id.startsWith('2');
    if (selectedLevel === '3') return c.id.startsWith('3');
    return true;
  });

  // Filter students based on level, class, and search term
  const filteredStudents = students.filter((s) => {
    const cId = s.classId || '1a';
    const matchesLevel =
      selectedLevel === 'all' ||
      (selectedLevel === '1' && cId.startsWith('1')) ||
      (selectedLevel === '2' && cId.startsWith('2')) ||
      (selectedLevel === '3' && cId.startsWith('3'));

    const matchesClass = filterClass === 'all' || cId === filterClass;

    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nisn.includes(searchTerm);

    return matchesLevel && matchesClass && matchesSearch;
  });

  // Counts
  const countLevel1 = students.filter((s) => (s.classId || '1a').startsWith('1')).length;
  const countLevel2 = students.filter((s) => (s.classId || '1a').startsWith('2')).length;
  const countLevel3 = students.filter((s) => (s.classId || '1a').startsWith('3')).length;

  const classCountMap: Record<string, number> = {};
  classes.forEach((c) => {
    classCountMap[c.id] = students.filter((s) => (s.classId || '1a') === c.id).length;
  });

  const handleLevelChange = (level: 'all' | '1' | '2' | '3') => {
    setSelectedLevel(level);
    setFilterClass('all');
  };

  const handleExportCSV = () => {
    const headers = ['NO', 'NISN', 'NAMA LENGKAP', 'KELAS', 'TOTAL NILAI', 'RATA-RATA', 'PERINGKAT', 'STATUS'];
    const rows = filteredStudents.map((s, idx) => {
      const cls = classes.find((c) => c.id === s.classId)?.nameLatin || s.classId || '-';
      return [
        idx + 1,
        `'${s.nisn}`,
        `"${s.name}"`,
        `"${cls}"`,
        s.totalScore,
        s.averageScore,
        s.rank,
        s.keterangan || 'Tuntas',
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const levelLabel = selectedLevel === 'all' ? 'Semua_Jenjang' : `Kelas_${selectedLevel}_SMP`;
    link.download = `Data_Master_Siswa_${levelLabel}_${filterClass}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const isGirlStudent = (classId: string) => {
    return (
      classId === '1a' ||
      classId === '1b' ||
      classId === '2a' ||
      classId === '2b' ||
      classId === '2c' ||
      classId === '3a' ||
      classId === '3b' ||
      classId === '3c'
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-inner">
              <Users size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-stone-900 tracking-tight">
                  Data Master Siswa SMP
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                  {students.length} Siswa Terdaftar
                </span>
                <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                  Kelas 1: {countLevel1} | Kelas 2: {countLevel2} | Kelas 3: {countLevel3}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Pondok Modern Al-Ghozali • Tahun Ajaran 2025/2026 • Kurikulum Terpadu Pesantren & Nasional
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
            >
              <Printer size={14} />
              <span>Cetak Daftar</span>
            </button>
            <button
              type="button"
              onClick={onAddStudent}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
            >
              <Plus size={15} />
              <span>Tambah Siswa</span>
            </button>
          </div>
        </div>

        {/* Level Tabs: Semua Jenjang / Kelas 1 SMP / Kelas 2 SMP / Kelas 3 SMP */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-stone-100 overflow-x-auto">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <GraduationCap size={15} className="text-emerald-600" />
            Tingkat:
          </span>
          <button
            type="button"
            onClick={() => handleLevelChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedLevel === 'all'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Semua Tingkat ({students.length})
          </button>
          <button
            type="button"
            onClick={() => handleLevelChange('1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedLevel === '1'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Kelas 1 SMP ({countLevel1} Siswa)
          </button>
          <button
            type="button"
            onClick={() => handleLevelChange('2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedLevel === '2'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Kelas 2 SMP ({countLevel2} Siswa)
          </button>
          <button
            type="button"
            onClick={() => handleLevelChange('3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
              selectedLevel === '3'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Kelas 3 SMP ({countLevel3} Siswa)
          </button>
        </div>

        {/* Quick Class Selector Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 mt-4">
          <button
            type="button"
            onClick={() => setFilterClass('all')}
            className={`p-2.5 rounded-xl border text-left transition ${
              filterClass === 'all'
                ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="text-[10px] font-bold text-stone-500 uppercase">Semua Kelas</div>
            <div className="text-base font-black text-stone-800 mt-0.5">
              {selectedLevel === 'all'
                ? students.length
                : selectedLevel === '1'
                ? countLevel1
                : selectedLevel === '2'
                ? countLevel2
                : countLevel3}{' '}
              Siswa
            </div>
            <div className="text-[10px] text-stone-400 mt-0.5">Tampilkan Semua</div>
          </button>

          {displayedClasses.map((c) => {
            const count = classCountMap[c.id] || 0;
            const isSelected = filterClass === c.id;
            const isPutri = isGirlStudent(c.id);

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setFilterClass(c.id);
                  onSelectClassId(c.id);
                }}
                className={`p-2.5 rounded-xl border text-left transition ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-stone-700">{c.nameLatin.split(' ')[0]}</span>
                  <span className="font-arabic text-xs text-emerald-700 font-bold">{c.nameAr}</span>
                </div>
                <div className="text-base font-black text-stone-800 mt-0.5">{count} Siswa</div>
                <div className="text-[10px] font-medium text-stone-400 truncate mt-0.5">
                  <span className={isPutri ? 'text-pink-600 font-semibold' : 'text-blue-600 font-semibold'}>
                    {isPutri ? 'Putri' : 'Putra'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        {/* Search & Action Bar */}
        <div className="p-4 bg-stone-50/80 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input
                type="text"
                placeholder="Cari nama santri / NISN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64 shadow-xs"
              />
            </div>
            <span className="text-xs text-stone-500">
              Menampilkan <strong>{filteredStudents.length}</strong> dari {students.length} santri
            </span>
          </div>

          {filterClass !== 'all' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigateToGrading(filterClass)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
              >
                <PenTool size={13} />
                <span>Input Nilai Kelas Ini</span>
              </button>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200">
                <th className="py-3 px-3 text-center w-12">NO</th>
                <th className="py-3 px-3 text-center w-32 font-mono">NISN</th>
                <th className="py-3 px-4">NAMA SANTRI</th>
                <th className="py-3 px-3 text-center w-28">KELAS</th>
                <th className="py-3 px-3 text-center w-24">TOTAL NILAI</th>
                <th className="py-3 px-3 text-center w-24">RATA-RATA</th>
                <th className="py-3 px-3 text-center w-20">RANK</th>
                <th className="py-3 px-3 text-center w-24">STATUS</th>
                <th className="py-3 px-3 text-center w-36 no-print">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 font-medium text-stone-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-stone-400">
                    Tidak ditemukan data santri yang sesuai.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, index) => {
                  const studentClass = classes.find((c) => c.id === std.classId);
                  const isFemale = isGirlStudent(std.classId || '1a');

                  return (
                    <tr key={std.id} className="hover:bg-emerald-50/40 transition">
                      <td className="py-2.5 px-3 text-center font-mono text-stone-500">
                        {index + 1}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-semibold text-stone-700">
                        {std.nisn}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-stone-900">
                        <div className="flex items-center gap-2">
                          <span>{std.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                              isFemale
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {isFemale ? 'Putri' : 'Putra'}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                          {studentClass?.nameLatin.split(' ')[0] || std.classId?.toUpperCase() || '1A'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-stone-800">
                        {std.totalScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-emerald-700">
                        {std.averageScore}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-stone-700">
                        #{std.rank}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 size={12} />
                          <span>{std.keterangan || 'Tuntas'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center no-print">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onNavigateToRaport(std.id)}
                            title="Buka Lembar Raport Kasyfud Darajat"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-100 rounded transition"
                          >
                            <FileText size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditStudent(std)}
                            title="Edit Data Santri"
                            className="text-[11px] px-2 py-1 font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteStudent(std.id)}
                            title="Hapus"
                            className="text-[11px] px-2 py-1 font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                          >
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
