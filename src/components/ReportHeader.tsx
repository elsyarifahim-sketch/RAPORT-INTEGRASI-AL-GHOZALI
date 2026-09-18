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
  return (
    <div className="w-full mb-2">
      {/* Top Section: Dual Logos and Arabic Calligraphic Title */}
      <div className="flex items-center justify-between px-2 mb-3">
        {/* Left Emblem */}
        <div className="flex-shrink-0">
          <SchoolLogo size={75} />
        </div>

        {/* Center Title & Arabic Subtitle */}
        <div className="flex-1 text-center px-2 flex flex-col items-center justify-center">
          {/* Main Calligraphic Title */}
          <div className="relative inline-block my-1">
            <h1
              className="text-4xl md:text-5xl font-bold tracking-normal font-arabic text-stone-900 leading-tight"
              style={{
                fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
                textShadow: '0 0.5px 0.5px rgba(0,0,0,0.1)',
              }}
            >
              كَشْفُ الدَّرَجَاتِ
            </h1>
            {/* Elegant horizontal ornamental divider */}
            <div className="flex items-center justify-center gap-2 mt-0.5 mb-1">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-stone-800" />
              <div className="w-1.5 h-1.5 rotate-45 bg-stone-800" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-stone-800" />
            </div>
          </div>

          {/* Subtitle in Arabic */}
          <p
            className="text-base md:text-lg font-bold font-arabic text-stone-800 tracking-wide"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {config.subTitleAr}
          </p>
        </div>

        {/* Right Emblem */}
        <div className="flex-shrink-0">
          <SchoolLogo size={75} />
        </div>
      </div>

      {/* Student & Class Information Header Table */}
      <div className="w-full border-t border-stone-800 pt-2 pb-1 text-xs md:text-sm font-semibold text-stone-900">
        <div className="grid grid-cols-2 gap-x-6">
          {/* Left Column (Class & Academic Year) */}
          <div className="space-y-1">
            <div className="flex items-center">
              <span className="font-bold min-w-[95px] text-right font-arabic text-sm">الصف :</span>
              <span className="ml-2 font-bold font-arabic tracking-wide">{config.classAr}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold min-w-[95px] text-right font-arabic text-sm">العام الدّراسي :</span>
              <span className="ml-2 font-semibold font-arabic tracking-wider">
                {toEasternArabicNumerals(config.academicYearLatin)} / {config.academicYearLatin}
              </span>
            </div>
          </div>

          {/* Right Column (Student Full Name & NISN/No Induk) */}
          <div className="space-y-1">
            <div className="flex items-center justify-end">
              <span className="mr-2 font-bold tracking-wide uppercase font-sans text-[13px]">{studentName}</span>
              <span className="font-bold font-arabic text-sm min-w-[90px] text-right">: الاسم كامل</span>
            </div>
            <div className="flex items-center justify-end">
              <span className="mr-2 font-bold tracking-wider font-mono text-[13px]">{nisn || '-'}</span>
              <span className="font-bold font-arabic text-sm min-w-[90px] text-right">: الرقم</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
