import React from 'react';
import { SchoolLogo } from './SchoolLogo';
import { SchoolConfig } from '../types';
import { toEasternArabicNumerals } from '../utils/arabicNumbers';

interface ReportHeaderProps {
  studentName: string;
  nisn: string;
  config: SchoolConfig;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ studentName, nisn, config }) => {
  // Format Arabic Academic Year e.g. ٢٠٢٥ / ٢٠٢٦
  const academicYearFormatted = config.academicYearAr || 
    (config.academicYearLatin 
      ? `${toEasternArabicNumerals(config.academicYearLatin.split('-')[0] || '')} / ${toEasternArabicNumerals(config.academicYearLatin.split('-')[1] || '')}`
      : '٢٠٢٥ / ٢٠٢٦');

  return (
    <div className="w-full mb-2">
      {/* Top Section: Dual Official Pentagonal Logos & Authentic Arabic Calligraphy */}
      <div className="flex items-center justify-between px-2 pt-1 pb-1.5">
        {/* Left Official Logo */}
        <div className="flex-shrink-0">
          <SchoolLogo size={68} />
        </div>

        {/* Center Calligraphic Header */}
        <div className="flex-1 text-center px-2 flex flex-col items-center justify-center max-w-[480px]">
          {/* Main Calligraphic Title: كشف الدرجات */}
          <h1
            className="text-3xl md:text-[38px] font-bold tracking-normal text-stone-950 leading-tight select-none my-0"
            style={{
              fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', 'DecoType Thuluth', serif",
              textShadow: '0 0.5px 0 rgba(0,0,0,0.12)',
              letterSpacing: '0.02em',
            }}
            dir="rtl"
          >
            كَشْفُ الدَّرَجَاتِ
          </h1>

          {/* Official Arabic Subtitle */}
          <p
            className="text-sm md:text-[15px] font-bold text-stone-900 mt-0.5 tracking-wide select-none"
            style={{ fontFamily: "'Amiri', 'Traditional Arabic', serif" }}
            dir="rtl"
          >
            {config.subTitleAr || 'للامتحان التحريري لفصل الدّراسي الأوّل'}
          </p>
        </div>

        {/* Right Official Logo */}
        <div className="flex-shrink-0">
          <SchoolLogo size={68} />
        </div>
      </div>

      {/* Student & Class Information Header Block (Matches the official format) */}
      <div className="w-full border-t border-stone-800 pt-2 pb-1 text-xs md:text-sm text-stone-900 font-sans">
        <div className="grid grid-cols-2 gap-x-6 items-center">
          {/* Left Block: Class & Academic Year */}
          <div className="grid grid-cols-[auto_12px_1fr] items-center gap-y-1" dir="rtl">
            <span className="font-bold font-arabic text-sm text-stone-950 whitespace-nowrap text-right pl-1">
              الصّفّ
            </span>
            <span className="font-bold text-sm text-stone-950 text-center">:</span>
            <span className="font-bold font-arabic text-sm text-stone-900 pr-1 truncate">
              {config.classAr || 'الأول - A'}
            </span>

            <span className="font-bold font-arabic text-sm text-stone-950 whitespace-nowrap text-right pl-1">
              العام الدّراسي
            </span>
            <span className="font-bold text-sm text-stone-950 text-center">:</span>
            <span className="font-bold font-arabic text-sm text-stone-900 tracking-wider pr-1 truncate">
              {academicYearFormatted}
            </span>
          </div>

          {/* Right Block: Student Full Name & NISN / Nomor Induk */}
          <div className="grid grid-cols-[auto_12px_1fr] items-center gap-y-1" dir="rtl">
            <span className="font-bold font-arabic text-sm text-stone-950 whitespace-nowrap text-right pl-1">
              الاسم كامل
            </span>
            <span className="font-bold text-sm text-stone-950 text-center">:</span>
            <span className="font-extrabold uppercase font-sans text-xs md:text-[13px] tracking-wide text-stone-950 truncate max-w-[240px] pr-1">
              {studentName}
            </span>

            <span className="font-bold font-arabic text-sm text-stone-950 whitespace-nowrap text-right pl-1">
              الرقم
            </span>
            <span className="font-bold text-sm text-stone-950 text-center">:</span>
            <span className="font-bold font-mono text-xs md:text-[13px] tracking-widest text-stone-900 pr-1 truncate">
              {nisn || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

