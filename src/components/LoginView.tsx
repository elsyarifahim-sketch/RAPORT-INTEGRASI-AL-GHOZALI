import React, { useState, useMemo } from 'react';
import { AuthUser, ClassItem, JenjangUnit, UserRole } from '../types';
import { SchoolLogo } from './SchoolLogo';
import {
  getTeachersByJenjang,
  getWaliKelasByJenjang,
  getTeacherAssignmentDetails,
  verifyAdminPin,
  saveAuthUser,
  DEFAULT_ADMIN_PIN,
} from '../utils/authHelpers';
import {
  GraduationCap,
  Users,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  School,
  KeyRound,
  UserCheck,
  Search,
} from 'lucide-react';

interface LoginViewProps {
  classes: ClassItem[];
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ classes, onLoginSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('guru');
  const [selectedUnit, setSelectedUnit] = useState<JenjangUnit>('SMP');
  const [selectedTeacherName, setSelectedTeacherName] = useState<string>('');
  const [teacherSearch, setTeacherSearch] = useState<string>('');
  const [adminPin, setAdminPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // List of teachers for current selected unit
  const teachersList = useMemo(() => {
    return getTeachersByJenjang(selectedUnit);
  }, [selectedUnit]);

  // List of wali kelas for current selected unit
  const waliKelasList = useMemo(() => {
    return getWaliKelasByJenjang(selectedUnit);
  }, [selectedUnit]);

  // Unified available teachers for dropdown based on role
  const availableTeachers = useMemo(() => {
    if (selectedRole === 'wali_kelas') {
      // Get unique names from Wali Kelas database for this unit
      const names = Array.from(new Set(waliKelasList.map((w) => w.waliName))).sort();
      return names.map((name) => {
        const profile = teachersList.find((t) => t.name.toLowerCase() === name.toLowerCase());
        const waliEntry = waliKelasList.find((w) => w.waliName.toLowerCase() === name.toLowerCase());
        return {
          name,
          academicTitle: profile?.academicTitle || '',
          homeroomInfo: waliEntry ? `${waliEntry.className} (${waliEntry.levelLabel || waliEntry.unit})` : undefined,
          classesCount: profile?.totalClassesCount || 1,
        };
      });
    }

    // Role === 'guru'
    return teachersList.map((t) => ({
      name: t.name,
      academicTitle: t.academicTitle,
      homeroomInfo: undefined,
      classesCount: t.totalClassesCount,
      subjectsCount: t.subjects.length,
    }));
  }, [selectedRole, selectedUnit, teachersList, waliKelasList]);

  // Filtered by internal search text if typed
  const filteredTeacherOptions = useMemo(() => {
    if (!teacherSearch.trim()) return availableTeachers;
    const q = teacherSearch.toLowerCase();
    return availableTeachers.filter((t) => t.name.toLowerCase().includes(q));
  }, [availableTeachers, teacherSearch]);

  // Auto-select first teacher when unit or role changes
  React.useEffect(() => {
    setErrorMessage('');
    if (selectedRole !== 'admin') {
      if (availableTeachers.length > 0) {
        // If current selection is not in list, select first
        const exists = availableTeachers.some((t) => t.name === selectedTeacherName);
        if (!exists) {
          setSelectedTeacherName(availableTeachers[0].name);
        }
      } else {
        setSelectedTeacherName('');
      }
    }
  }, [selectedRole, selectedUnit, availableTeachers]);

  // Selected teacher details preview
  const selectedTeacherDetails = useMemo(() => {
    if (selectedRole === 'admin' || !selectedTeacherName) return null;
    return getTeacherAssignmentDetails(selectedTeacherName, classes);
  }, [selectedRole, selectedTeacherName, classes]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      if (selectedRole === 'admin') {
        if (!adminPin) {
          setErrorMessage('Silakan masukkan PIN Administrator.');
          setIsLoading(false);
          return;
        }

        if (adminPin.length < 6) {
          setErrorMessage('PIN Administrator minimal 6 digit.');
          setIsLoading(false);
          return;
        }

        if (!verifyAdminPin(adminPin)) {
          setErrorMessage('PIN Administrator salah. Silakan periksa kembali atau gunakan PIN default awal.');
          setIsLoading(false);
          return;
        }

        const adminUser: AuthUser = {
          role: 'admin',
          name: 'Administrator Raport',
          unit: selectedUnit,
          availableUnits: ['SMP', 'SMA', 'TMMIA'],
        };

        saveAuthUser(adminUser);
        setIsLoading(false);
        onLoginSuccess(adminUser);
      } else {
        // Guru or Wali Kelas
        if (!selectedTeacherName) {
          setErrorMessage('Silakan pilih nama guru dari daftar Master Guru.');
          setIsLoading(false);
          return;
        }

        const details = getTeacherAssignmentDetails(selectedTeacherName, classes);

        const authUser: AuthUser = {
          role: selectedRole,
          name: selectedTeacherName,
          unit: details.availableUnits.includes(selectedUnit) ? selectedUnit : details.availableUnits[0],
          availableUnits: details.availableUnits,
          assignedClassIds: details.assignedClassIds,
          assignedClassIdsByUnit: details.assignedClassIdsByUnit,
          assignedSubjectNames: details.assignedSubjectNames,
          homeroomClassId: details.homeroomClass?.id || details.homeroomEntry?.classId,
          homeroomClassName: details.homeroomClass?.nameLatin || details.homeroomEntry?.className,
        };

        saveAuthUser(authUser);
        setIsLoading(false);
        onLoginSuccess(authUser);
      }
    }, 250);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-850 to-emerald-950 flex flex-col justify-between items-center p-4 sm:p-6 lg:p-8 font-sans text-stone-100 selection:bg-amber-400 selection:text-stone-900">
      {/* Decorative Islamic Background Patterns */}
      <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M40 0 L80 40 L40 80 L0 40 Z M40 10 L70 40 L40 70 L10 40 Z"
                fill="none"
                stroke="#d4af37"
                strokeWidth="1.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-grid)" />
        </svg>
      </div>

      {/* Top Header / Branding */}
      <header className="relative z-10 w-full max-w-xl text-center pt-2 sm:pt-4">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/30 shadow-2xl mb-3">
          <SchoolLogo size={64} className="filter drop-shadow-md" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/30 text-amber-300 text-[11px] font-semibold tracking-wider uppercase">
            <Sparkles size={12} className="text-amber-400" />
            <span>Sistem Informasi Raport Terintegrasi</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>PONDOK MODERN AL-GHOZALI</span>
          </h1>

          <p
            className="font-arabic text-amber-400/90 text-sm sm:text-base font-bold tracking-wide"
            dir="rtl"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            كشف الدرجات والتقييم النصفي والنهائي
          </p>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 w-full max-w-lg my-auto pt-4 pb-6">
        <div className="bg-stone-900/90 backdrop-blur-md border border-stone-700/80 rounded-3xl shadow-2xl overflow-hidden shadow-emerald-950/60">
          {/* Card Top Border Gradient Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-600 via-amber-400 to-emerald-600" />

          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Masuk ke Aplikasi Raport
              </h2>
              <p className="text-xs text-stone-400">
                Pilih peran dan identitas Anda untuk mengakses lembar penilaian & raport
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* ========================================================
                  KOMPONEN 1: PILIH PERAN (GURU / WALI KELAS / ADMIN)
                  ======================================================== */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck size={14} className="text-emerald-400" />
                  <span>1. Pilih Peran Pengguna</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Role: GURU */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('guru');
                      setErrorMessage('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedRole === 'guru'
                        ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                        : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <BookOpen
                      size={20}
                      className={`mb-1.5 ${
                        selectedRole === 'guru' ? 'text-amber-400' : 'text-stone-400'
                      }`}
                    />
                    <span className="font-bold text-xs">Guru</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Mapel</span>
                  </button>

                  {/* Role: WALI KELAS */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('wali_kelas');
                      setErrorMessage('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedRole === 'wali_kelas'
                        ? 'bg-emerald-600/25 border-emerald-400 text-white shadow-lg ring-1 ring-emerald-400'
                        : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <GraduationCap
                      size={20}
                      className={`mb-1.5 ${
                        selectedRole === 'wali_kelas' ? 'text-amber-400' : 'text-stone-400'
                      }`}
                    />
                    <span className="font-bold text-xs">Wali Kelas</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Cetak & Nilai</span>
                  </button>

                  {/* Role: ADMINISTRATOR */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('admin');
                      setErrorMessage('');
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedRole === 'admin'
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg ring-1 ring-amber-400'
                        : 'bg-stone-800/80 border-stone-700 text-stone-400 hover:text-stone-200 hover:bg-stone-800 hover:border-stone-600'
                    }`}
                  >
                    <ShieldCheck
                      size={20}
                      className={`mb-1.5 ${
                        selectedRole === 'admin' ? 'text-amber-400' : 'text-stone-400'
                      }`}
                    />
                    <span className="font-bold text-xs">Administrator</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">Akses Penuh</span>
                  </button>
                </div>
              </div>

              {/* ========================================================
                  KOMPONEN 2: PILIH JENJANG SEKOLAH (TMMIA: SMP & SMA)
                  (Hanya tampil saat memilih Guru atau Wali Kelas)
                  ======================================================== */}
              {selectedRole !== 'admin' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <School size={14} className="text-emerald-400" />
                      <span>2. Pilih Jenjang Sekolah (TMMIA)</span>
                    </label>
                    <span className="text-[11px] text-emerald-400/90 font-medium hidden sm:inline">
                      TMMIA mencakup SMP & SMA
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['SMP', 'SMA', 'TMMIA'] as JenjangUnit[]).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setSelectedUnit(unit)}
                        className={`py-2 px-2.5 rounded-xl border text-center font-bold text-xs transition-all duration-150 flex flex-col items-center justify-center ${
                          selectedUnit === unit
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow ring-1 ring-emerald-400'
                            : 'bg-stone-800 text-stone-300 border-stone-700 hover:bg-stone-750 hover:border-stone-600'
                        }`}
                      >
                        <span className="font-bold">
                          {unit === 'SMP' ? 'Tingkat SMP' : unit === 'SMA' ? 'Tingkat SMA' : 'Semua TMMIA'}
                        </span>
                        <span className={`text-[10px] mt-0.5 ${selectedUnit === unit ? 'text-emerald-100' : 'text-stone-400'}`}>
                          {unit === 'SMP' ? 'Kelas 1-3 & Int' : unit === 'SMA' ? 'Kelas 4-6 & Int' : 'SMP + SMA'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================
                  KOMPONEN 3: PILIH NAMA GURU (MASTER GURU)
                  (Hanya tampil saat memilih Guru atau Wali Kelas)
                  ======================================================== */}
              {selectedRole !== 'admin' && (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Users size={14} className="text-emerald-400" />
                      <span>3. Pilih Nama {selectedRole === 'wali_kelas' ? 'Wali Kelas' : 'Guru'}</span>
                    </label>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {availableTeachers.length} Guru di {selectedUnit}
                    </span>
                  </div>

                  {/* Search filter for long teacher lists */}
                  {availableTeachers.length > 8 && (
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                      <input
                        type="text"
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        placeholder={`Cari nama guru ${selectedUnit}...`}
                        className="w-full pl-9 pr-3 py-1.5 bg-stone-800/90 border border-stone-700 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  )}

                  {/* Dropdown Select */}
                  <select
                    value={selectedTeacherName}
                    onChange={(e) => setSelectedTeacherName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-stone-100 font-bold text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-inner"
                  >
                    {filteredTeacherOptions.map((t) => (
                      <option key={t.name} value={t.name} className="bg-stone-800 text-stone-100 py-1">
                        {t.name} {t.homeroomInfo ? `— [${t.homeroomInfo}]` : ''}
                      </option>
                    ))}
                  </select>

                  {/* Info Badge for Selected Teacher Assignment */}
                  {selectedTeacherDetails && (
                    <div className="bg-stone-800/80 border border-stone-700/80 rounded-xl p-3 text-xs space-y-1.5 text-stone-300 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                          <Sparkles size={11} />
                          Penugasan Terdaftar:
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {selectedTeacherDetails.assignedSubjectNames.length} Mapel • {selectedTeacherDetails.totalClassesCount} Kelas
                        </span>
                      </div>

                      {selectedTeacherDetails.availableUnits.length > 1 && (
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold bg-amber-950/60 border border-amber-500/30 px-2 py-1 rounded-lg">
                          <Sparkles size={12} className="text-amber-400 shrink-0" />
                          <span>
                            Mengajar di <strong>{selectedTeacherDetails.availableUnits.length} Jenjang</strong> ({selectedTeacherDetails.availableUnits.join(', ')})
                          </span>
                        </div>
                      )}

                      {selectedTeacherDetails.homeroomClass && (
                        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                          <GraduationCap size={13} className="shrink-0" />
                          <span>Wali Kelas: <strong>{selectedTeacherDetails.homeroomClass.nameLatin}</strong></span>
                        </div>
                      )}

                      {selectedTeacherDetails.assignedSubjectNames.length > 0 && (
                        <p className="text-[11px] text-stone-400 line-clamp-1">
                          Mapel: {selectedTeacherDetails.assignedSubjectNames.join(', ')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================
                  KOMPONEN 4: PIN ADMINISTRATOR
                  (Hanya tampil saat memilih Administrator)
                  ======================================================== */}
              {selectedRole === 'admin' && (
                <div className="space-y-3 pt-1 animate-fadeIn">
                  <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound size={14} className="text-amber-400" />
                    <span>2. Masukkan PIN Administrator</span>
                  </label>

                  <div className="relative">
                    <input
                      type={showPin ? 'text' : 'password'}
                      value={adminPin}
                      onChange={(e) => setAdminPin(e.target.value)}
                      placeholder="Masukkan PIN (Minimal 6 Digit)"
                      autoComplete="current-password"
                      className="w-full pl-4 pr-12 py-3 bg-stone-800 border border-amber-500/50 rounded-xl text-stone-100 font-mono text-base font-bold tracking-widest focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPin(!showPin)}
                      className="absolute right-3 top-3.5 text-stone-400 hover:text-amber-300 transition"
                      title={showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
                    >
                      {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
                    <span className="flex items-center gap-1">
                      <Lock size={12} className="text-amber-400" />
                      PIN Keamanan Sistem (Min. 6 digit)
                    </span>
                    <button
                      type="button"
                      onClick={() => setAdminPin(DEFAULT_ADMIN_PIN)}
                      className="text-amber-400 hover:underline hover:text-amber-300 font-semibold"
                    >
                      Isi PIN Default ({DEFAULT_ADMIN_PIN})
                    </button>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMessage && (
                <div className="flex items-center gap-2 p-3 bg-rose-950/80 border border-rose-500/60 rounded-xl text-rose-200 text-xs animate-shake">
                  <AlertCircle size={16} className="text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ========================================================
                  KOMPONEN 5: TOMBOL MASUK
                  ======================================================== */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-sm sm:text-base tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-950/80 transition-all duration-200 active:scale-[0.99] border border-emerald-400/30 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} className="text-amber-300" />
                    <span>
                      Masuk Sebagai{' '}
                      {selectedRole === 'guru'
                        ? 'Guru Mapel'
                        : selectedRole === 'wali_kelas'
                        ? 'Wali Kelas'
                        : 'Administrator'}
                    </span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Bar */}
          <div className="px-6 py-3.5 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Otorisasi Penugasan Resmi</span>
            </span>
            <span className="text-stone-400 font-medium">T.A. 2026/2027</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-xl text-center pb-2 text-[11px] text-stone-400 space-y-0.5">
        <p>© 2026 Pondok Modern Al-Ghozali • Gunung Sindur, Bogor, Jawa Barat</p>
        <p className="text-stone-400 font-arabic text-xs" dir="rtl">
          المعهد العصري الغزالي للتربية الإسلامية
        </p>
      </footer>
    </div>
  );
};
