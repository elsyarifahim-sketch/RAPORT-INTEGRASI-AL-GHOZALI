import React from 'react';
import { CalculatedStudent, ClassItem } from '../types';
import { Printer, ChevronUp, ChevronDown, Layers, FileSpreadsheet, Settings, UserCheck, GraduationCap } from 'lucide-react';

interface SidebarControlsProps {
  students: CalculatedStudent[];
  classes?: ClassItem[];
  selectedClassId?: string;
  onSelectClassId?: (classId: string) => void;
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  rangeStart: number;
  rangeEnd: number;
  onChangeRangeStart: (val: number) => void;
  onChangeRangeEnd: (val: number) => void;
  onPrintSingle: () => void;
  onPrintBatch: () => void;
  onOpenRekap: () => void;
  onOpenSettings: () => void;
  onEditStudent: (student: CalculatedStudent) => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  students,
  classes = [],
  selectedClassId,
  onSelectClassId,
  selectedIndex,
  onSelectIndex,
  rangeStart,
  rangeEnd,
  onChangeRangeStart,
  onChangeRangeEnd,
  onPrintSingle,
  onPrintBatch,
  onOpenRekap,
  onOpenSettings,
  onEditStudent,
}) => {
  const currentStudent = students[selectedIndex];
  const currentNumber = selectedIndex + 1;


  const handlePrev = () => {
    if (selectedIndex > 0) {
      onSelectIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex < students.length - 1) {
      onSelectIndex(selectedIndex + 1);
    }
  };

  return (
    <div className="no-print w-full lg:w-80 bg-white border border-stone-200 rounded-xl shadow-lg p-5 flex flex-col gap-5 sticky top-6">
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
            Panel Kontrol Raport
          </span>
          <h3 className="font-bold text-stone-800 text-sm mt-1">Cetak & Navigasi Santri</h3>
        </div>
        <button
          type="button"
          onClick={onOpenSettings}
          title="Pengaturan Kop, Tanggal & Tanda Tangan"
          className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Class Selector */}
      {classes.length > 0 && onSelectClassId && (
        <div className="space-y-1.5 pb-2 border-b border-stone-100">
          <label className="text-xs font-bold text-stone-600 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap size={14} className="text-emerald-600" />
            <span>Pilih Kelas</span>
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => onSelectClassId(e.target.value)}
            className="w-full text-xs font-bold bg-stone-50 border border-stone-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          >
            <optgroup label="Kelas 1 SMP">
              {classes.filter(c => c.id.startsWith('1')).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameLatin} ({c.nameAr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas 2 SMP">
              {classes.filter(c => c.id.startsWith('2')).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameLatin} ({c.nameAr})
                </option>
              ))}
            </optgroup>
            <optgroup label="Kelas 3 SMP">
              {classes.filter(c => c.id.startsWith('3')).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameLatin} ({c.nameAr})
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      {/* 1. Stepper & Student Selector (As shown in Image 1) */}
      <div className="space-y-3">

        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Pilih Santri
        </label>

        <div className="flex items-center gap-2">
          {/* Stepper with Up/Down buttons (Image 1 style) */}
          <div className="flex items-center border border-stone-300 rounded-md bg-stone-50 overflow-hidden">
            <span className="w-10 text-center font-bold text-base font-mono text-stone-800">
              {currentNumber}
            </span>
            <div className="flex flex-col border-l border-stone-300">
              <button
                type="button"
                onClick={handlePrev}
                disabled={selectedIndex <= 0}
                className="px-1.5 py-0.5 hover:bg-stone-200 disabled:opacity-30 transition"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                disabled={selectedIndex >= students.length - 1}
                className="px-1.5 py-0.5 hover:bg-stone-200 disabled:opacity-30 border-t border-stone-200 transition"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          {/* Student Dropdown selector */}
          <select
            value={selectedIndex}
            onChange={(e) => onSelectIndex(Number(e.target.value))}
            className="flex-1 border border-stone-300 rounded-md px-3 py-2 text-xs font-semibold text-stone-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {students.map((std, idx) => (
              <option key={std.id} value={idx}>
                {idx + 1}. {std.name}
              </option>
            ))}
          </select>
        </div>

        {/* Current Student Quick Info Card */}
        {currentStudent && (
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">NISN:</span>
              <span className="font-mono font-bold text-stone-700">{currentStudent.nisn || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Total Nilai:</span>
              <span className="font-bold text-emerald-700">{currentStudent.totalScore}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Rata-rata / Rank:</span>
              <span className="font-bold text-stone-800">
                {currentStudent.averageScore} (Peringkat #{currentStudent.rank})
              </span>
            </div>
            <button
              type="button"
              onClick={() => onEditStudent(currentStudent)}
              className="mt-2 w-full text-center text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline pt-1"
            >
              Edit Nilai Santri Ini →
            </button>
          </div>
        )}
      </div>

      {/* 2. Range Selector (Image 1 style: 'dari 1' ... 'sampai 8') */}
      <div className="space-y-2 border-t border-stone-200 pt-3">
        <label className="text-xs font-bold text-stone-600 uppercase tracking-wider">
          Rentang Cetak Masal
        </label>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[11px] text-stone-500 block mb-1">Dari No:</span>
            <select
              value={rangeStart}
              onChange={(e) => onChangeRangeStart(Number(e.target.value))}
              className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs font-medium bg-white focus:ring-1 focus:ring-emerald-500"
            >
              {students.map((_, i) => (
                <option key={`start-${i + 1}`} value={i + 1}>
                  {i + 1} ({students[i].name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[11px] text-stone-500 block mb-1">Sampai No:</span>
            <select
              value={rangeEnd}
              onChange={(e) => onChangeRangeEnd(Number(e.target.value))}
              className="w-full border border-stone-300 rounded px-2 py-1.5 text-xs font-medium bg-white focus:ring-1 focus:ring-emerald-500"
            >
              {students.map((_, i) => (
                <option key={`end-${i + 1}`} value={i + 1}>
                  {i + 1} ({students[i].name.split(' ')[0]})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Action Buttons (PRINT in Blue and PRINT ALL in Gray, as in Image 1) */}
      <div className="space-y-2 pt-1">
        {/* Blue Big PRINT Button */}
        <button
          type="button"
          onClick={onPrintSingle}
          className="w-full flex items-center justify-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2.5 px-4 rounded-md shadow transition-all tracking-wider text-sm active:scale-[0.99]"
        >
          <Printer size={16} />
          PRINT
        </button>

        {/* PRINT ALL / BATCH Button */}
        <button
          type="button"
          onClick={onPrintBatch}
          className="w-full flex items-center justify-center gap-2 bg-[#e2e8f0] hover:bg-[#cbd5e1] text-stone-700 font-semibold py-2 px-4 rounded-md border border-stone-300 transition-all text-xs active:scale-[0.99]"
        >
          <Layers size={15} />
          PRINT ALL ({rangeStart} s/d {rangeEnd})
        </button>
      </div>

      {/* 4. Rekapitulasi Shortcut */}
      <div className="border-t border-stone-200 pt-3">
        <button
          type="button"
          onClick={onOpenRekap}
          className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold py-2 px-3 rounded-lg text-xs transition"
        >
          <FileSpreadsheet size={15} />
          Lihat Rekapitulasi Nilai (Excel)
        </button>
      </div>
    </div>
  );
};
