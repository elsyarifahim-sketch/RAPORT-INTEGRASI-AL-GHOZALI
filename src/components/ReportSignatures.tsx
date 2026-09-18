import React from 'react';
import { SchoolConfig } from '../types';

interface ReportSignaturesProps {
  config: SchoolConfig;
}

export const ReportSignatures: React.FC<ReportSignaturesProps> = ({ config }) => {
  return (
    <div className="w-full mt-4 text-stone-900">
      {/* Date in Arabic & Hijri/Masehi */}
      <div className="text-center mb-4">
        <p
          className="text-xs md:text-sm font-bold font-arabic tracking-wide"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {config.dateTextAr}
        </p>
      </div>

      {/* Signatures Grid */}
      <div className="w-full px-4">
        {/* Top Row: Wali Santri (Left) & Wali Kelas (Right) */}
        <div className="flex justify-between items-start text-center mb-6">
          {/* Wali Santri */}
          <div className="w-48 flex flex-col items-center">
            <span
              className="font-bold text-sm md:text-base font-arabic mb-14"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {config.waliSantriLabelAr}
            </span>
            <div className="w-40 border-b border-stone-800" />
            <span className="text-[10px] text-stone-500 mt-1 italic">
              (Tanda Tangan Orang Tua/Wali)
            </span>
          </div>

          {/* Wali Kelas */}
          <div className="w-48 flex flex-col items-center">
            <span
              className="font-bold text-sm md:text-base font-arabic mb-14"
              style={{ fontFamily: "'Amiri', serif" }}
            >
              {config.waliKelasLabelAr}
            </span>
            <span className="font-bold font-sans text-xs md:text-sm underline underline-offset-4 decoration-1">
              {config.waliKelasName}
            </span>
          </div>
        </div>

        {/* Bottom Row Center: Mudir Al-Ma'had / Direktur Pondok */}
        <div className="flex flex-col items-center justify-center text-center mt-2">
          <span
            className="font-bold text-sm md:text-base font-arabic mb-14"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {config.direkturLabelAr}
          </span>
          <span className="font-bold font-sans text-xs md:text-sm underline underline-offset-4 decoration-1">
            {config.direkturName}
          </span>
        </div>
      </div>
    </div>
  );
};
