import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CalculatedStudent, Subject, SchoolConfig, ClassItem } from '../types';
import { getSubjectsForClass } from '../data/curriculumSubjects';
import { getWaliKelasForClass } from '../data/waliKelasDatabase';
import { toEasternArabicNumerals, numberToArabicWords, rankToArabicOrdinal } from './arabicNumbers';

/**
 * Ekspor Rekapitulasi Nilai Seluruh Santri ke format Microsoft Excel (.xlsx)
 */
export function exportRekapToExcel(
  students: CalculatedStudent[],
  subjects: Subject[],
  config: SchoolConfig,
  selectedClass?: ClassItem | null
) {
  const className = selectedClass ? selectedClass.nameLatin : config.classLatin || 'Semua Kelas';
  const classAr = selectedClass ? selectedClass.nameAr : config.classAr || '';
  const academicYear = config.academicYearLatin || '2025-2026';
  const officialWali = (selectedClass ? getWaliKelasForClass(selectedClass.id) : null) || config.waliKelasName || '-';

  // 1. Header Information rows
  const headerData: (string | number)[][] = [
    ['PESANTREN AL-GHOZALI GUNUNG SINDUR BOGOR'],
    ['REKAPITULASI NILAI HASIL UJIAN SANTRI (KASYFUD DARAJAT / كَشْفُ الدَّرَجَاتِ)'],
    [`Kelas: ${className} (${classAr})`, '', `Tahun Ajaran: ${academicYear} (${config.academicYearAr || ''})`],
    [`Wali Kelas: ${officialWali}`, '', `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`],
    [], // empty row separator
  ];

  // 2. Table Column Headers
  const tableHeaders: string[] = [
    'No',
    'NISN',
    'Nama Santri',
    ...subjects.map((s) => `${s.nameId} (${s.nameAr})`),
    'Total Nilai',
    'Rata-rata',
    'Peringkat (Rank)',
    'Peringkat (Arab)',
    'Keterangan',
  ];

  headerData.push(tableHeaders);

  // 3. Student Data Rows
  students.forEach((s, idx) => {
    const scoreValues = subjects.map((sub) => {
      return s.scores[sub.id] ?? 0;
    });

    const row: (string | number)[] = [
      idx + 1,
      s.nisn || '-',
      s.name,
      ...scoreValues,
      s.totalScore,
      s.averageScore,
      s.rank,
      rankToArabicOrdinal(s.rank),
      s.keterangan || (s.averageScore >= 60 ? 'Tuntas' : 'Perbaikan'),
    ];
    headerData.push(row);
  });

  headerData.push([]);
  headerData.push(['', `Ditetapkan di: ${config.placeNameLatin || 'Gunung Sindur'}, ${config.dateMasehi || ''}`]);
  headerData.push(['', `Wali Kelas: ${officialWali}`, '', '', `Pimpinan: ${config.direkturName || 'H. Ahmad Syaikhu, Lc.'}`]);

  // 4. Create Workbook and Worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(headerData);

  // Auto column widths
  const colWidths = [
    { wch: 6 },   // No
    { wch: 18 },  // NISN
    { wch: 32 },  // Nama Santri
    ...subjects.map(() => ({ wch: 20 })), // Subjects
    { wch: 14 },  // Total Nilai
    { wch: 14 },  // Rata-rata
    { wch: 16 },  // Peringkat
    { wch: 18 },  // Peringkat Arab
    { wch: 16 },  // Keterangan
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Nilai');

  const safeFileName = `Rekapitulasi_Nilai_${className.replace(/[^a-zA-Z0-9_-]/g, '_')}_${academicYear.replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

/**
 * Ekspor Lembar Raport Santri Individu ke format Excel (.xlsx) dengan data autentik
 */
export function exportSingleRaportToExcel(
  student: CalculatedStudent,
  subjects: Subject[],
  config: SchoolConfig
) {
  const effectiveSubjects = student.classId ? getSubjectsForClass(student.classId) : subjects;
  const officialWali = (student.classId ? getWaliKelasForClass(student.classId) : null) || config.waliKelasName;

  const rows: (string | number)[][] = [
    ['PESANTREN AL-GHOZALI GUNUNG SINDUR BOGOR'],
    ['KASYFUD DARAJAT (كَشْفُ الدَّرَجَاتِ) - KARTU HASIL UJIAN SANTRI'],
    [`${config.subTitleAr || 'للامتحان التحريري لفصل الدّراسي الأوّل'}`],
    [],
    ['Nama Santri (الاسم كامل)', ':', student.name, '', 'Kelas (الصّفّ)', ':', `${config.classLatin || student.classId || ''} (${config.classAr || ''})`],
    ['NISN (الرقم)', ':', student.nisn || '-', '', 'Tahun Ajaran (العام الدّراسي)', ':', `${config.academicYearLatin || '2025-2026'} (${config.academicYearAr || ''})`],
    ['Wali Kelas (ولي الفصل)', ':', officialWali, '', 'Pimpinan (مدير المعهد)', ':', config.direkturName || 'H. Ahmad Syaikhu, Lc.'],
    [],
    ['No (الرقم)', 'المواد الدّراسيّة (Mata Pelajaran Arab)', 'Mata Pelajaran (Indonesia)', 'Nilai Angka', 'Angka Arab (بالأرقام)', 'Terbilang Arab / Tafqit (بالحروف)', 'Nilai Maks (نهاية)', 'Predikat'],
  ];

  effectiveSubjects.forEach((sub, idx) => {
    const score = student.scores[sub.id] ?? 0;
    let predikat = 'Maqbul';
    if (score >= 90) predikat = 'Mumtaz (A+)';
    else if (score >= 80) predikat = 'Jayyid Jiddan (A)';
    else if (score >= 70) predikat = 'Jayyid (B)';
    else if (score >= 60) predikat = 'Maqbul (C)';
    else predikat = 'Dhoif (D)';

    rows.push([
      idx + 1,
      sub.nameAr,
      sub.nameId,
      score,
      toEasternArabicNumerals(score),
      numberToArabicWords(score),
      100,
      predikat
    ]);
  });

  rows.push([]);
  rows.push(['', 'TOTAL NILAI (المجموع)', '', student.totalScore, toEasternArabicNumerals(student.totalScore), '', '', '']);
  rows.push(['', 'RATA-RATA (النتيجة المعدّلة)', '', student.averageScore, toEasternArabicNumerals(student.averageScore), '', '', '']);
  rows.push(['', 'PERINGKAT KELAS (المقام)', '', student.rank, toEasternArabicNumerals(student.rank), rankToArabicOrdinal(student.rank), '', '']);
  rows.push([]);
  rows.push(['', `Ditetapkan di: ${config.placeNameLatin || 'Gunung Sindur'}, ${config.dateMasehi || ''} / ${config.dateHijri || ''}`]);
  rows.push(['', `Wali Santri (ولي الأمر)`, '', '', `Wali Kelas (ولي الفصل): ${officialWali}`, '', '', `Pimpinan (مدير المعهد): ${config.direkturName || 'H. Ahmad Syaikhu, Lc.'}`]);

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 8 },   // No
    { wch: 28 },  // Mapel Arab
    { wch: 30 },  // Mapel Indo
    { wch: 14 },  // Nilai Angka
    { wch: 14 },  // Angka Arab
    { wch: 26 },  // Terbilang Arab
    { wch: 12 },  // Maks
    { wch: 20 },  // Predikat
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Raport Santri');

  const safeFileName = `Raport_${student.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${(config.classLatin || 'Kelas').replace(/[^a-zA-Z0-9_-]/g, '_')}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}

/**
 * Convert OKLCH color (L C H [/ A]) to standard sRGB rgb/rgba string.
 * This completely prevents html2canvas from crashing on unsupported oklch color functions.
 */
function oklchToRgb(lStr: string, cStr: string, hStr: string, aStr?: string): string {
  try {
    let L = parseFloat(lStr);
    if (lStr.includes('%')) L = L / 100;
    if (isNaN(L)) L = 0.5;

    let C = parseFloat(cStr);
    if (cStr.includes('%')) C = (C / 100) * 0.4;
    if (isNaN(C)) C = 0;

    let H = parseFloat(hStr);
    if (hStr.includes('rad')) H = (H * 180) / Math.PI;
    if (hStr.includes('turn')) H = H * 360;
    if (isNaN(H)) H = 0;

    let A = 1;
    if (aStr !== undefined && aStr.trim() !== '') {
      const cleanA = aStr.replace('/', '').trim();
      A = parseFloat(cleanA);
      if (cleanA.includes('%')) A = A / 100;
      if (isNaN(A)) A = 1;
    }

    const hRad = (H * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    const gamma = (v: number) =>
      v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;

    const R = Math.round(Math.min(255, Math.max(0, gamma(rLinear) * 255)));
    const G = Math.round(Math.min(255, Math.max(0, gamma(gLinear) * 255)));
    const B = Math.round(Math.min(255, Math.max(0, gamma(bLinear) * 255)));

    if (A < 0.999) {
      return `rgba(${R}, ${G}, ${B}, ${parseFloat(A.toFixed(3))})`;
    }
    return `rgb(${R}, ${G}, ${B})`;
  } catch {
    return '#15803d';
  }
}

/**
 * Convert OKLAB color (L a b [/ A]) to standard sRGB rgb/rgba string.
 */
function oklabToRgb(lStr: string, aStrVal: string, bStrVal: string, alphaStr?: string): string {
  try {
    let L = parseFloat(lStr);
    if (lStr.includes('%')) L = L / 100;
    if (isNaN(L)) L = 0.5;

    let a = parseFloat(aStrVal);
    if (aStrVal.includes('%')) a = (a / 100) * 0.4;
    if (isNaN(a)) a = 0;

    let b = parseFloat(bStrVal);
    if (bStrVal.includes('%')) b = (b / 100) * 0.4;
    if (isNaN(b)) b = 0;

    let A = 1;
    if (alphaStr !== undefined && alphaStr.trim() !== '') {
      const cleanA = alphaStr.replace('/', '').trim();
      A = parseFloat(cleanA);
      if (cleanA.includes('%')) A = A / 100;
      if (isNaN(A)) A = 1;
    }

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const gLinear = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bLinear = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    const gamma = (v: number) =>
      v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(Math.max(0, v), 1 / 2.4) - 0.055;

    const R = Math.round(Math.min(255, Math.max(0, gamma(rLinear) * 255)));
    const G = Math.round(Math.min(255, Math.max(0, gamma(gLinear) * 255)));
    const B = Math.round(Math.min(255, Math.max(0, gamma(bLinear) * 255)));

    if (A < 0.999) {
      return `rgba(${R}, ${G}, ${B}, ${parseFloat(A.toFixed(3))})`;
    }
    return `rgb(${R}, ${G}, ${B})`;
  } catch {
    return '#15803d';
  }
}

/**
 * Replaces all modern CSS color functions (oklch, oklab, lab, lch, color, color-mix)
 * from any string of CSS or attribute values.
 */
function replaceModernColors(cssText: string): string {
  if (!cssText || typeof cssText !== 'string') return '';

  // 1. Convert OKLCH: oklch(L C H [/ A])
  let result = cssText.replace(
    /oklch\s*\(\s*([^,\s/)]+)\s+([^,\s/)]+)\s+([^,\s/)]+)(?:\s*(?:\/|,)\s*([^)]+))?\s*\)/gi,
    (_match, l, c, h, a) => oklchToRgb(l, c, h, a)
  );

  // 2. Convert OKLAB: oklab(L a b [/ A])
  result = result.replace(
    /oklab\s*\(\s*([^,\s/)]+)\s+([^,\s/)]+)\s+([^,\s/)]+)(?:\s*(?:\/|,)\s*([^)]+))?\s*\)/gi,
    (_match, l, aVal, bVal, alpha) => oklabToRgb(l, aVal, bVal, alpha)
  );

  // 3. Fallback for any other modern color functions (color, color-mix, lab, lch)
  result = result.replace(/(?:lab|lch|color-mix|color)\s*\([^;}{)]*(?:\([^)]*\)[^;}{)]*)*\)/gi, (match) => {
    const lower = match.toLowerCase();
    if (lower.includes('emerald') || lower.includes('green') || lower.includes('166534')) {
      return '#166534';
    }
    if (lower.includes('white') || lower.includes('0.9') || lower.includes('255')) {
      return '#ffffff';
    }
    if (lower.includes('gray') || lower.includes('stone') || lower.includes('slate')) {
      return '#374151';
    }
    return '#1c1917';
  });

  // 4. Absolute safety catch: eliminate any stray oklch or oklab calls
  result = result.replace(/oklch\s*\([^)]*\)/gi, '#166534');
  result = result.replace(/oklab\s*\([^)]*\)/gi, '#166534');

  return result;
}

/**
 * Helper to safely convert modern CSS color functions
 * into standard HEX/RGB colors compatible with html2canvas.
 */
function convertToRgbOrHex(cssColorStr: string): string {
  if (!cssColorStr || typeof cssColorStr !== 'string') return cssColorStr;
  return replaceModernColors(cssColorStr);
}

/**
 * Wait for all document fonts, images, and layout stabilization before capturing
 */
async function waitForAssetsToLoad(element: HTMLElement): Promise<void> {
  // 1. Wait for document fonts
  if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore
    }
  }

  // 2. Wait for all images inside container to be fully loaded
  const images = Array.from(element.querySelectorAll('img'));
  if (images.length > 0) {
    await Promise.all(
      images.map((img) => {
        if (img.complete && img.naturalHeight !== 0) {
          return Promise.resolve();
        }
        return new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          setTimeout(resolve, 400); // safety fallback
        });
      })
    );
  }

  // 3. Small RAF pause to ensure browser layout and CSS are completely painted
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/**
 * Sanitizes all stylesheets and DOM elements in cloned document for html2canvas
 * to prevent crash on modern CSS color functions, preserve Arabic & Latin fonts,
 * and lock exact A4 layout dimensions without distorting metrics.
 */
function sanitizeClonedDocumentForHtml2Canvas(clonedDoc: Document, clonedEl: HTMLElement) {
  // 1. Ensure Google Fonts and Arabic font definitions are explicitly available in clonedDoc
  try {
    let fontLink = clonedDoc.querySelector('link[href*="fonts.googleapis.com"]');
    if (!fontLink) {
      fontLink = clonedDoc.createElement('link');
      fontLink.setAttribute('rel', 'stylesheet');
      fontLink.setAttribute(
        'href',
        'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Scheherazade+New:wght@400;600;700&display=swap'
      );
      clonedDoc.head.appendChild(fontLink);
    }

    // Add explicit font-family utility styles to ensure rendering
    const customFontStyle = clonedDoc.createElement('style');
    customFontStyle.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Scheherazade+New:wght@400;600;700&display=swap');
      .font-arabic, [dir="rtl"] {
        font-family: 'Amiri', 'Scheherazade New', 'Traditional Arabic', serif !important;
        letter-spacing: normal !important;
      }
      .font-sans {
        font-family: 'Plus Jakarta Sans', system-ui, sans-serif !important;
      }
    `;
    clonedDoc.head.appendChild(customFontStyle);
  } catch {
    // ignore
  }

  // 2. Sanitize all <style> elements by replacing all oklab/oklch/color(...) with rgb/hex
  clonedDoc.querySelectorAll('style').forEach((styleEl) => {
    if (styleEl.textContent) {
      try {
        styleEl.textContent = replaceModernColors(styleEl.textContent);
      } catch {
        // ignore
      }
    }
  });

  // 3. Remove non-font external CSS that might cause CORS or syntax issues
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((linkEl) => {
    try {
      const href = linkEl.getAttribute('href') || '';
      if (!href.includes('fonts.googleapis.com') && !href.includes('fonts.gstatic.com')) {
        linkEl.parentNode?.removeChild(linkEl);
      }
    } catch {
      // ignore
    }
  });

  // 4. Ensure cloned element has standard box sizing and clean white background
  if (clonedEl) {
    clonedEl.style.boxShadow = 'none';
    clonedEl.style.backgroundColor = '#ffffff';
    clonedEl.style.color = '#1c1917';
    clonedEl.style.transform = 'none';
  }

  // 5. Sanitize all inline styles & computed styles on the element tree
  const targetElements = clonedEl
    ? [clonedEl, ...Array.from(clonedEl.querySelectorAll('*'))]
    : Array.from(clonedDoc.querySelectorAll('*'));

  const colorProps = [
    'color',
    'backgroundColor',
    'borderColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
    'textDecorationColor',
  ] as const;

  targetElements.forEach((node) => {
    const el = node as HTMLElement;
    if (!el || !el.style) return;

    // Handle inline style attributes
    const styleAttr = el.getAttribute('style');
    if (styleAttr && /(?:oklab|oklch|lab|lch|color|color-mix)\s*\(/i.test(styleAttr)) {
      el.setAttribute('style', replaceModernColors(styleAttr));
    }

    // Handle computed styles by overwriting them with resolved RGB/Hex inline
    try {
      const win = clonedDoc.defaultView || window;
      const computed = win.getComputedStyle(el);
      if (computed) {
        for (const prop of colorProps) {
          const val = (computed as any)[prop];
          if (typeof val === 'string' && /(?:oklab|oklch|lab|lch|color|color-mix)\s*\(/i.test(val)) {
            (el.style as any)[prop] = replaceModernColors(val);
          }
        }
      }
    } catch {
      // ignore
    }
  });
}

/**
 * Ekspor Raport Santri ke format PDF Resolusi Tinggi (Standar A4 210mm x 297mm)
 */
export async function exportRaportToPdf(
  element: HTMLElement | null,
  fileName: string = 'Raport_Santri.pdf'
): Promise<boolean> {
  if (!element) return false;

  try {
    // 1. Wait for fonts, images, and layout render
    await waitForAssetsToLoad(element);

    // 2. Capture element in fixed dimensions
    const canvas = await html2canvas(element, {
      scale: 3, // 3x High resolution for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedEl) => {
        sanitizeClonedDocumentForHtml2Canvas(clonedDoc, clonedEl);
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Fit canvas exactly to A4 (210mm x 297mm) with 0 margin
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    pdf.save(fileName);
    return true;
  } catch (err) {
    console.error('Failed to export PDF:', err);
    return false;
  }
}

/**
 * Ekspor Raport Santri ke format Gambar PNG / JPG Resolusi Tinggi
 */
export async function exportRaportToImage(
  element: HTMLElement | null,
  fileName: string = 'Raport_Santri.png',
  format: 'png' | 'jpeg' = 'png'
): Promise<boolean> {
  if (!element) return false;

  try {
    // 1. Wait for fonts, images, and layout render
    await waitForAssetsToLoad(element);

    // 2. Capture element in fixed dimensions
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc, clonedEl) => {
        sanitizeClonedDocumentForHtml2Canvas(clonedDoc, clonedEl);
      },
    });

    const imageType = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    const dataUrl = canvas.toDataURL(imageType, 0.98);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = fileName.endsWith(`.${format}`) ? fileName : `${fileName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('Failed to export Image:', err);
    return false;
  }
}

/**
 * Ekspor Raport Santri ke format Microsoft Word (.doc) yang 100% identik dengan tampilan sertifikat
 */
export function exportRaportToWord(
  student: CalculatedStudent,
  subjects: Subject[],
  config: SchoolConfig
) {
  const effectiveSubjects = student.classId ? getSubjectsForClass(student.classId) : subjects;
  const officialWali = (student.classId ? getWaliKelasForClass(student.classId) : null) || config.waliKelasName;

  const academicYearFormatted = config.academicYearAr || 
    (config.academicYearLatin 
      ? `${toEasternArabicNumerals(config.academicYearLatin.split('-')[0] || '')} / ${toEasternArabicNumerals(config.academicYearLatin.split('-')[1] || '')}`
      : '٢٠٢٥ / ٢٠٢٦');

  // Render 6-column rows matching ReportTable exactly
  const rowsHtml = effectiveSubjects.map((sub, index) => {
    const rawScore = student.scores[sub.id];
    const score = typeof rawScore === 'number' && !isNaN(rawScore) ? rawScore : 0;
    const arabicWords = numberToArabicWords(score);
    const easternNumber = toEasternArabicNumerals(score);
    const rowNumberAr = toEasternArabicNumerals(index + 1);

    return `
      <tr style="height: 22px;">
        <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 11pt;">
          ${arabicWords}
        </td>
        <td style="border: 1px solid #1f2937; padding: 4px 4px; text-align: center; font-family: 'Times New Roman', Times, serif; font-weight: bold; font-size: 11pt;">
          ${score}
        </td>
        <td style="border: 1px solid #1f2937; padding: 4px 4px; text-align: center; font-family: 'Amiri', 'Traditional Arabic', serif; font-weight: bold; font-size: 12pt;">
          ${easternNumber}
        </td>
        <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: left; font-family: 'Times New Roman', Times, serif; font-size: 10.5pt;">
          ${sub.nameId}
        </td>
        <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', 'Traditional Arabic', serif; font-size: 12pt;">
          ${sub.nameAr}
        </td>
        <td style="border: 1px solid #1f2937; padding: 4px 4px; text-align: center; font-family: 'Amiri', serif; font-weight: bold; font-size: 11pt;">
          ${rowNumberAr}
        </td>
      </tr>
    `;
  }).join('');

  const wordContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Raport_${student.name}</title>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 21.0cm 29.7cm;
          margin: 1.0cm 1.2cm 1.0cm 1.2cm;
          mso-header-margin: 0.5cm;
          mso-footer-margin: 0.5cm;
          mso-paper-source: 0;
        }
        div.Section1 { 
          page: Section1;
          border: 3px double #166534;
          padding: 18px 24px;
          background: #ffffff;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          color: #111827;
          background: #ffffff;
          margin: 0;
          padding: 0;
        }
        table {
          border-collapse: collapse;
          width: 100%;
        }
        .header-title {
          text-align: center;
          font-family: 'Amiri', 'Traditional Arabic', 'Scheherazade New', serif;
          font-size: 28pt;
          font-weight: bold;
          margin: 0;
          line-height: 1.1;
          color: #111827;
        }
        .header-sub {
          text-align: center;
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 13pt;
          font-weight: bold;
          margin-top: 4px;
          margin-bottom: 8px;
          color: #1f2937;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <!-- Dual Pentagonal Header with Arabic Calligraphy -->
        <table style="width: 100%; margin-bottom: 6px; border: none;">
          <tr>
            <td style="width: 15%; text-align: left; vertical-align: middle;">
              <div style="width: 55px; height: 55px; border: 2px solid #166534; border-radius: 8px; text-align: center; line-height: 50px; font-weight: bold; color: #166534; font-size: 8pt;">
                AL-GHOZALI
              </div>
            </td>
            <td style="width: 70%; text-align: center; vertical-align: middle;">
              <p class="header-title">كَشْفُ الدَّرَجَاتِ</p>
              <p class="header-sub">${config.subTitleAr || 'للامتحان التحريري لفصل الدّراسي الأوّل'}</p>
            </td>
            <td style="width: 15%; text-align: right; vertical-align: middle;">
              <div style="width: 55px; height: 55px; border: 2px solid #166534; border-radius: 8px; text-align: center; line-height: 50px; font-weight: bold; color: #166534; font-size: 8pt;">
                AL-GHOZALI
              </div>
            </td>
          </tr>
        </table>

        <!-- Student & Academic Info Header Block -->
        <table style="width: 100%; margin-bottom: 8px; border-top: 1.5px solid #1f2937; border-bottom: 1.5px solid #1f2937; padding: 4px 0; font-size: 11pt;" dir="rtl">
          <tr>
            <td style="width: 14%; font-weight: bold; text-align: right; font-family: 'Amiri', serif;">الصّفّ</td>
            <td style="width: 2%; text-align: center;">:</td>
            <td style="width: 34%; font-weight: bold; text-align: right; font-family: 'Amiri', serif;">${config.classAr || 'الأول - A'} (${config.classLatin})</td>
            
            <td style="width: 14%; font-weight: bold; text-align: right; font-family: 'Amiri', serif;">الاسم كامل</td>
            <td style="width: 2%; text-align: center;">:</td>
            <td style="width: 34%; font-weight: bold; text-align: right; font-family: 'Times New Roman', serif;">${student.name}</td>
          </tr>
          <tr>
            <td style="font-weight: bold; text-align: right; font-family: 'Amiri', serif;">العام الدّراسي</td>
            <td style="text-align: center;">:</td>
            <td style="font-weight: bold; text-align: right; font-family: 'Amiri', serif;">${academicYearFormatted}</td>

            <td style="font-weight: bold; text-align: right; font-family: 'Amiri', serif;">الرقم</td>
            <td style="text-align: center;">:</td>
            <td style="font-weight: bold; text-align: right; font-family: 'Times New Roman', serif;">${student.nisn || '-'}</td>
          </tr>
        </table>

        <!-- Main Official 6-Column Grade Table -->
        <table style="width: 100%; border: 1.5px solid #1f2937; margin-bottom: 6px;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th colspan="3" style="border: 1px solid #1f2937; padding: 6px 4px; text-align: center; font-family: 'Amiri', serif; font-size: 12pt;">
                الدرجة التي حصلت عليها الطالب / الطالبة
              </th>
              <th style="border: 1px solid #1f2937; padding: 6px 6px; width: 28%; text-align: center; font-family: 'Times New Roman', serif; font-size: 10.5pt;">
                Mata Pelajaran
              </th>
              <th style="border: 1px solid #1f2937; padding: 6px 6px; width: 28%; text-align: center; font-family: 'Amiri', serif; font-size: 12pt;">
                المواد الدّراسيّة
              </th>
              <th style="border: 1px solid #1f2937; padding: 6px 2px; width: 6%; text-align: center; font-family: 'Amiri', serif; font-size: 11pt;">
                الرقم
              </th>
            </tr>
            <tr style="background-color: #e2e8f0; font-size: 9.5pt;">
              <th style="border: 1px solid #1f2937; padding: 3px 6px; width: 24%; text-align: right; font-family: 'Amiri', serif;">بالحروف</th>
              <th style="border: 1px solid #1f2937; padding: 3px 2px; width: 7%; text-align: center;">Angka</th>
              <th style="border: 1px solid #1f2937; padding: 3px 2px; width: 7%; text-align: center; font-family: 'Amiri', serif;">بالأرقام</th>
              <th style="border: 1px solid #1f2937; padding: 3px 6px; text-align: left; font-style: italic;">Indonesian</th>
              <th style="border: 1px solid #1f2937; padding: 3px 6px; text-align: right; font-family: 'Amiri', serif;">عربي</th>
              <th style="border: 1px solid #1f2937; padding: 3px 2px; text-align: center; font-family: 'Amiri', serif;">No</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            
            <!-- Summary 1: Jumlah -->
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right;">—</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-size: 11pt;">${student.totalScore}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-family: 'Amiri', serif; font-size: 12pt;">${toEasternArabicNumerals(student.totalScore)}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: left;">Jumlah</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', serif; font-size: 11pt;">المجموع</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; background-color: #f1f5f9;"></td>
            </tr>

            <!-- Summary 2: Rata-Rata -->
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right;">—</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-size: 11pt;">${student.averageScore}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-family: 'Amiri', serif; font-size: 12pt;">${toEasternArabicNumerals(student.averageScore)}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: left;">Nilai Rata Rata</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', serif; font-size: 11pt;">النتيجة المعدّلة</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; background-color: #f1f5f9;"></td>
            </tr>

            <!-- Summary 3: Peringkat -->
            <tr style="background-color: #f8fafc; font-weight: bold;">
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', serif; font-size: 11pt; color: #166534;">${rankToArabicOrdinal(student.rank)}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-size: 11pt;">${student.rank}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; text-align: center; font-family: 'Amiri', serif; font-size: 12pt;">${toEasternArabicNumerals(student.rank)}</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: left;">Peringkat</td>
              <td style="border: 1px solid #1f2937; padding: 4px 6px; text-align: right; font-family: 'Amiri', serif; font-size: 11pt;">المقام</td>
              <td style="border: 1px solid #1f2937; padding: 4px 2px; background-color: #f1f5f9;"></td>
            </tr>
          </tbody>
        </table>

        <!-- Date Setting -->
        <div style="margin-top: 8px; text-align: center; font-family: 'Amiri', serif; font-size: 11pt;" dir="rtl">
          <p style="margin: 0; font-weight: bold;">${config.dateTextAr}</p>
          <p style="margin: 2px 0 0 0; font-family: 'Times New Roman', serif; font-size: 9.5pt; color: #4b5563;">
            (${config.placeNameLatin || 'Gunung Sindur'}, ${config.dateMasehi} / ${config.dateHijri})
          </p>
        </div>

        <!-- 3-Part Official Signatures Table -->
        <table style="width: 100%; margin-top: 10px; font-size: 10.5pt; border: none;">
          <tr>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <p style="font-weight: bold; font-family: 'Amiri', serif; font-size: 12pt; margin: 0;">${config.waliSantriLabelAr || 'ولي الأمر'}</p>
              <div style="height: 50px;"></div>
              <div style="width: 160px; margin: 0 auto; border-bottom: 1px solid #1f2937;"></div>
              <p style="font-size: 9pt; color: #6b7280; margin: 3px 0 0 0; font-style: italic;">(Tanda Tangan Orang Tua/Wali)</p>
            </td>
            <td style="width: 10%;"></td>
            <td style="width: 45%; text-align: center; vertical-align: top;">
              <p style="font-weight: bold; font-family: 'Amiri', serif; font-size: 12pt; margin: 0;">${config.waliKelasLabelAr || 'ولي الفصل'}</p>
              <div style="height: 50px;"></div>
              <p style="font-weight: bold; text-decoration: underline; margin: 0; font-size: 10.5pt;">${officialWali}</p>
            </td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: center; vertical-align: top; padding-top: 8px;">
              <p style="font-weight: bold; font-family: 'Amiri', serif; font-size: 12pt; margin: 0;">${config.direkturLabelAr || 'مدير المعهد'}</p>
              <div style="height: 48px;"></div>
              <p style="font-weight: bold; text-decoration: underline; margin: 0; font-size: 10.5pt;">${config.direkturName || 'H. Ahmad Syaikhu, Lc.'}</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', wordContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Raport_${student.name.replace(/[^a-zA-Z0-9_-]/g, '_')}_${(config.classLatin || 'Kelas').replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
