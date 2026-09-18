import React from 'react';
import { Subject } from '../types';
import { toEasternArabicNumerals, numberToArabicWords, rankToArabicOrdinal } from '../utils/arabicNumbers';

interface ReportTableProps {
  subjects: Subject[];
  scores: Record<string, number>;
  totalScore: number;
  averageScore: number;
  rank: number;
}

export const ReportTable: React.FC<ReportTableProps> = ({
  subjects,
  scores,
  totalScore,
  averageScore,
  rank,
}) => {
  // Determine compact row padding based on number of subjects
  const isCompact = subjects.length > 20;
  const cellPaddingY = isCompact ? 'py-[1.5px]' : 'py-[3px]';

  return (
    <div className="w-full my-0.5">
      <table className="w-full table-fixed border-collapse border border-stone-800 text-[11px] leading-tight select-none">
        <colgroup>
          <col style={{ width: '23%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '7%' }} />
          <col style={{ width: '29%' }} />
          <col style={{ width: '28%' }} />
          <col style={{ width: '6%' }} />
        </colgroup>
        <thead>
          <tr className="bg-stone-50 border-b border-stone-800 font-bold text-center">
            {/* Column 1: Grades received (with 3 sub-columns) */}
            <th
              colSpan={3}
              className="border border-stone-800 py-1 px-1.5 font-arabic text-xs md:text-sm text-stone-900 bg-stone-100/60"
              dir="rtl"
            >
              الدرجة التي حصلت عليها الطالب / الطالبة
            </th>

            {/* Column 2: Mata Pelajaran */}
            <th className="border border-stone-800 py-1 px-1.5 text-stone-900 font-bold text-xs">
              Mata Pelajaran
            </th>

            {/* Column 3: Al-Mawad Ad-Dirasiyyah */}
            <th className="border border-stone-800 py-1 px-1.5 font-arabic text-xs md:text-sm text-stone-900" dir="rtl">
              المواد الدّراسيّة
            </th>

            {/* Column 4: Number */}
            <th className="border border-stone-800 py-1 px-1 font-arabic text-xs text-stone-900" dir="rtl">
              الرقم
            </th>
          </tr>

          {/* Sub-header row for grades */}
          <tr className="border-b border-stone-800 text-[10px] text-center font-semibold bg-stone-100/90">
            <th className="border border-stone-800 py-0.5 px-1.5 text-right font-arabic" dir="rtl">
              بالحروف
            </th>
            <th className="border border-stone-800 py-0.5 px-0.5 font-sans font-bold">
              Angka
            </th>
            <th className="border border-stone-800 py-0.5 px-0.5 font-arabic" dir="rtl">
              بالأرقام
            </th>
            <th className="border border-stone-800 py-0.5 px-1.5 font-normal text-stone-500 italic text-left">
              Indonesian
            </th>
            <th className="border border-stone-800 py-0.5 px-1.5 font-arabic text-stone-500 text-right" dir="rtl">
              عربي
            </th>
            <th className="border border-stone-800 py-0.5 px-0.5 font-arabic text-stone-500 text-center">
              No
            </th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subject, index) => {
            const rawScore = scores[subject.id];
            const score = typeof rawScore === 'number' && !isNaN(rawScore) ? rawScore : 0;
            const arabicWords = numberToArabicWords(score);
            const easternNumber = toEasternArabicNumerals(score);
            const rowNumberAr = toEasternArabicNumerals(index + 1);

            return (
              <tr
                key={subject.id}
                className="hover:bg-amber-50/40 transition-colors border-b border-stone-800 text-stone-900"
              >
                {/* 1. Score in Arabic Words (Tafqit) */}
                <td className={`border border-stone-800 ${cellPaddingY} px-1.5 text-right font-arabic font-medium text-[11px] truncate leading-tight`} dir="rtl">
                  {arabicWords}
                </td>

                {/* 2. Score in Latin Numerals */}
                <td className={`border border-stone-800 ${cellPaddingY} px-0.5 text-center font-bold font-mono text-[11px] leading-tight`}>
                  {score}
                </td>

                {/* 3. Score in Eastern Arabic Numerals */}
                <td className={`border border-stone-800 ${cellPaddingY} px-0.5 text-center font-arabic font-bold text-[12px] leading-tight`} dir="rtl">
                  {easternNumber}
                </td>

                {/* 4. Mata Pelajaran (Latin Indonesian) */}
                <td className={`border border-stone-800 ${cellPaddingY} px-1.5 text-left font-sans text-[10.5px] font-medium truncate leading-tight`}>
                  {subject.nameId}
                </td>

                {/* 5. Al-Mawad Ad-Dirasiyyah (Arabic) */}
                <td className={`border border-stone-800 ${cellPaddingY} px-1.5 text-right font-arabic font-medium text-[11.5px] truncate leading-tight`} dir="rtl">
                  {subject.nameAr}
                </td>

                {/* 6. Row number in Eastern Arabic */}
                <td className={`border border-stone-800 ${cellPaddingY} px-0.5 text-center font-arabic font-semibold text-[11px] leading-tight`} dir="rtl">
                  {rowNumberAr}
                </td>
              </tr>
            );
          })}

          {/* SUMMARY ROW 1: JUMLAH / المجموع */}
          <tr className="border-t-2 border-b border-stone-800 font-bold bg-stone-50/80">
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-stone-400" dir="rtl">
              —
            </td>
            <td className="border border-stone-800 py-1 px-0.5 text-center font-mono text-[11px] font-extrabold">
              {totalScore}
            </td>
            <td className="border border-stone-800 py-1 px-0.5 text-center font-arabic text-[12px] font-bold" dir="rtl">
              {toEasternArabicNumerals(totalScore)}
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-left font-sans text-[11px]">
              Jumlah
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-[11.5px] font-bold" dir="rtl">
              المجموع
            </td>
            <td className="border border-stone-800 py-1 px-0.5 bg-stone-100" />
          </tr>

          {/* SUMMARY ROW 2: NILAI RATA-RATA / النتيجة المعدلة */}
          <tr className="border-b border-stone-800 font-bold bg-stone-50/80">
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-stone-400" dir="rtl">
              —
            </td>
            <td className="border border-stone-800 py-1 px-0.5 text-center font-mono text-[11px] font-extrabold">
              {averageScore}
            </td>
            <td className="border border-stone-800 py-1 px-0.5 text-center font-arabic text-[12px] font-bold" dir="rtl">
              {toEasternArabicNumerals(averageScore)}
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-left font-sans text-[11px]">
              Nilai Rata Rata
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-[11.5px] font-bold" dir="rtl">
              النتيجة المعدّلة
            </td>
            <td className="border border-stone-800 py-1 px-0.5 bg-stone-100" />
          </tr>

          {/* SUMMARY ROW 3: PERINGKAT / المقام */}
          <tr className="border-b-2 border-stone-800 font-bold bg-stone-50/80">
            {/* Arabic ordinal word e.g. التاسع */}
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-[11.5px] font-bold text-emerald-900" dir="rtl">
              {rankToArabicOrdinal(rank)}
            </td>
            {/* Latin rank e.g. 9 */}
            <td className="border border-stone-800 py-1 px-0.5 text-center font-mono text-[11px] font-extrabold">
              {rank}
            </td>
            {/* Arabic digit e.g. ٩ */}
            <td className="border border-stone-800 py-1 px-0.5 text-center font-arabic text-[12px] font-bold" dir="rtl">
              {toEasternArabicNumerals(rank)}
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-left font-sans text-[11px]">
              Peringkat
            </td>
            <td className="border border-stone-800 py-1 px-1.5 text-right font-arabic text-[11.5px] font-bold" dir="rtl">
              المقام
            </td>
            <td className="border border-stone-800 py-1 px-0.5 bg-stone-100" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};
