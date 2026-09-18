import React from 'react';
import { Subject, CalculatedStudent, SchoolConfig } from '../types';
import { ReportCertificate } from './ReportCertificate';
import { Printer, X, Eye } from 'lucide-react';

interface BatchPrintViewProps {
  isOpen: boolean;
  onClose: () => void;
  students: CalculatedStudent[];
  subjects: Subject[];
  config: SchoolConfig;
  rangeStart: number;
  rangeEnd: number;
}

export const BatchPrintView: React.FC<BatchPrintViewProps> = ({
  isOpen,
  onClose,
  students,
  subjects,
  config,
  rangeStart,
  rangeEnd,
}) => {
  if (!isOpen) return null;

  // Filter students by range (1-based index)
  const selectedStudents = students.filter(
    (s, idx) => idx + 1 >= rangeStart && idx + 1 <= rangeEnd
  );

  const handlePrintNow = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-stone-900/90 backdrop-blur-sm overflow-y-auto">
      {/* Top Floating Control Bar */}
      <div className="no-print sticky top-0 z-50 bg-stone-900 border-b border-stone-800 text-white px-6 py-3 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <Eye className="text-emerald-400" size={20} />
          <div>
            <h3 className="font-bold text-sm">
              Pratinjau Cetak Masal ({selectedStudents.length} Raport Santri)
            </h3>
            <p className="text-xs text-stone-400">
              Rentang No. {rangeStart} s/d {rangeEnd} • Masing-masing santri akan tercetak 1 lembar A4
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintNow}
            className="flex items-center gap-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold py-2 px-5 rounded-lg shadow-lg transition active:scale-95 text-xs tracking-wider"
          >
            <Printer size={15} />
            CETAK SEKARANG ({selectedStudents.length} LEMBAR)
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Printable Area containing all certificates */}
      <div className="flex-1 p-4 md:p-8 space-y-12 bg-stone-800/40 print:bg-white print:p-0 print:space-y-0">
        {selectedStudents.map((std, i) => (
          <div key={std.id} className="relative">
            {/* Santri Banner on preview screen only */}
            <div className="no-print max-w-[820px] mx-auto mb-2 text-xs font-semibold text-emerald-300 flex justify-between items-center px-2">
              <span>Lembar {i + 1} dari {selectedStudents.length}</span>
              <span>Santri: {std.name} (NISN: {std.nisn || '-'})</span>
            </div>

            <ReportCertificate
              student={std}
              subjects={subjects}
              config={config}
              isPrintOnly={false}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
