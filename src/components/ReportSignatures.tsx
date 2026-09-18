import React from 'react';
import { SchoolConfig } from '../types';

interface ReportSignaturesProps {
  config: SchoolConfig;
  onOpenDateSettings?: () => void;
}

export const ReportSignatures: React.FC<ReportSignaturesProps> = ({ config, onOpenDateSettings }) => {
  return (
    <div className="w-full mt-2 text-stone-900 select-none">
      {/* Date in Arabic & Hijri/Masehi */}
      <div 
        onClick={onOpenDateSettings}
        className={`text-center mb-2.5 ${onOpenDateSettings ? 'cursor-pointer hover:opacity-80 transition group' : ''}`}
        title={onOpenDateSettings ? 'Klik untuk mengubah tanggal penetapan raport' : undefined}
      >
        <p
          className="text-xs md:text-sm font-bold font-arabic tracking-wide text-stone-900"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {config.dateTextAr}
        </p>
        {config.dateMasehi && (
          <p className="text-[10.5px] font-sans font-medium text-stone-600 mt-0.5 tracking-tight">
            ({config.placeNameLatin || 'Gunung Sindur'}, {config.dateMasehi} / {config.dateHijri})
          </p>
        )}
      </div>

      {/* Signatures Grid */}
      <div className="w-full px-2">
        {/* Top Row: Wali Santri (Left) & Wali Kelas (Right) */}
        <div className="flex justify-between items-start text-center mb-3">
          {/* Wali Santri */}
          <div className="flex-1 max-w-[260px] flex flex-col items-center">
            <span
              className="font-bold text-sm md:text-base font-arabic mb-8"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {config.waliSantriLabelAr || 'ولي الأمر'}
            </span>
            <div className="w-40 border-b border-stone-800" />
            <span className="text-[10px] text-stone-500 mt-1 italic whitespace-nowrap">
              (Tanda Tangan Orang Tua/Wali)
            </span>
          </div>

          {/* Wali Kelas (Single Line Guaranteed) */}
          <div className="flex-1 max-w-[320px] min-w-[180px] flex flex-col items-center">
            <span
              className="font-bold text-sm md:text-base font-arabic mb-8"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {config.waliKelasLabelAr || 'ولي الفصل'}
            </span>
            <span className="font-bold font-sans text-xs md:text-[13px] underline underline-offset-4 decoration-1 whitespace-nowrap tracking-tight text-stone-900 block max-w-full text-center">
              {config.waliKelasName}
            </span>
          </div>
        </div>

        {/* Bottom Row Center: Mudir Al-Ma'had / Direktur Pondok */}
        <div className="flex flex-col items-center justify-center text-center relative z-20 pb-1">
          <span
            className="font-bold text-sm md:text-base font-arabic mb-8"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {config.direkturLabelAr || 'مدير المعهد'}
          </span>
          <span className="font-bold font-sans text-xs md:text-[13px] underline underline-offset-4 decoration-1 whitespace-nowrap tracking-tight text-stone-900 block max-w-full text-center">
            {config.direkturName}
          </span>
        </div>
      </div>
    </div>
  );
};

