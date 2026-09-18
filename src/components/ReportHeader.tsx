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
    <div className="w-full mb-1">
      {/* Top Section: Dual Official Pentagonal Logos & Authentic Arabic Calligraphy */}
      <div className="flex items-center justify-between px-2 pt-0.5 pb-1">
        {/* Left Official Logo */}
        <div className="flex-shrink-0">
          <SchoolLogo size={62} />
        </div>

        {/* Center Calligraphic Header */}
        <div className="flex-1 text-center px-2 flex flex-col items-center justify-center">
          {/* Main Calligraphic Title: كشف الدرجات */}
          <h1
            className="text-3xl md:text-[36px] font-bold text-stone-950 select-none my-0 leading-none"
            style={{
              fontFamily: "'Scheherazade New', 'Amiri', 'Traditional Arabic', serif",
              letterSpacing: 'normal',
            }}
            dir="rtl"
          >
            كَشْفُ الدَّرَجَاتِ
          </h1>

          {/* Official Arabic Subtitle */}
          <p
            className="text-sm md:text-[14px] font-bold text-stone-900 mt-1 select-none leading-none"
            style={{ 
              fontFamily: "'Amiri', 'Traditional Arabic', serif",
              letterSpacing: 'normal',
            }}
            dir="rtl"
          >
            {config.subTitleAr || 'للامتحان التحريري لفصل الدّراسي الأوّل'}
          </p>
        </div>

        {/* Right Official Logo */}
        <div className="flex-shrink-0">
          <SchoolLogo size={62} />
        </div>
      </div>

      {/* Student & Class Information Header Table (Rock-solid alignment for both Screen & PDF Canvas) */}
      <div className="w-full border-t border-stone-800 pt-1.5 pb-1 text-xs text-stone-900">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              {/* Left Column: Class & Academic Year */}
              <td className="w-1/2 align-top pr-3">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="leading-tight">
                      <td className="w-24 text-right font-arabic font-bold text-sm text-stone-950 pr-1" dir="rtl">
                        الصّفّ
                      </td>
                      <td className="w-3 text-center font-bold text-sm text-stone-950">:</td>
                      <td className="text-right font-arabic font-bold text-sm text-stone-900 pl-1" dir="rtl">
                        {config.classAr || 'الأول - A'}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="w-24 text-right font-arabic font-bold text-sm text-stone-950 pr-1 pt-0.5" dir="rtl">
                        العام الدّراسي
                      </td>
                      <td className="w-3 text-center font-bold text-sm text-stone-950 pt-0.5">:</td>
                      <td className="text-right font-arabic font-bold text-sm text-stone-900 pl-1 pt-0.5" dir="rtl">
                        {academicYearFormatted}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* Right Column: Student Name & NISN */}
              <td className="w-1/2 align-top pl-3 border-l border-stone-300">
                <table className="w-full border-collapse">
                  <tbody>
                    <tr className="leading-tight">
                      <td className="w-24 text-right font-arabic font-bold text-sm text-stone-950 pr-1" dir="rtl">
                        الاسم كامل
                      </td>
                      <td className="w-3 text-center font-bold text-sm text-stone-950">:</td>
                      <td className="text-left font-sans font-bold text-xs md:text-[13px] uppercase text-stone-950 pl-1 truncate">
                        {studentName}
                      </td>
                    </tr>
                    <tr className="leading-tight">
                      <td className="w-24 text-right font-arabic font-bold text-sm text-stone-950 pr-1 pt-0.5" dir="rtl">
                        الرقم
                      </td>
                      <td className="w-3 text-center font-bold text-sm text-stone-950 pt-0.5">:</td>
                      <td className="text-left font-mono font-bold text-xs md:text-[13px] text-stone-900 pl-1 tracking-wider pt-0.5">
                        {nisn || '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

