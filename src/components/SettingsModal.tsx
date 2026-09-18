import React, { useState, useEffect } from 'react';
import { SchoolConfig } from '../types';
import { X, Save, Sliders, RotateCcw } from 'lucide-react';
import { INITIAL_SCHOOL_CONFIG } from '../data/initialData';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SchoolConfig;
  onSave: (newConfig: SchoolConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [formData, setFormData] = useState<SchoolConfig>(config);

  useEffect(() => {
    setFormData(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleChange = (key: keyof SchoolConfig, val: string) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFormData(INITIAL_SCHOOL_CONFIG);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-stone-200">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} />
            <h3 className="font-bold text-base">Pengaturan Raport & Tanda Tangan</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-300 hover:text-white rounded-lg hover:bg-stone-700 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto text-xs">
          {/* Institution & School */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Yayasan / Lembaga
              </label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => handleChange('institutionName', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Pondok Pesantren
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* Subtitle & Title Ar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Judul Raport (Arab)
              </label>
              <input
                type="text"
                value={formData.titleAr}
                onChange={(e) => handleChange('titleAr', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-arabic text-sm text-right focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Subjudul Raport (Arab)
              </label>
              <input
                type="text"
                value={formData.subTitleAr}
                onChange={(e) => handleChange('subTitleAr', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-arabic text-sm text-right focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Class & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 pt-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Kelas (Latin)
              </label>
              <input
                type="text"
                value={formData.classLatin}
                onChange={(e) => handleChange('classLatin', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Kelas (Arab)
              </label>
              <input
                type="text"
                value={formData.classAr}
                onChange={(e) => handleChange('classAr', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-arabic text-sm text-right focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Tahun Ajaran (Latin)
              </label>
              <input
                type="text"
                value={formData.academicYearLatin}
                onChange={(e) => handleChange('academicYearLatin', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-medium focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Tahun Ajaran (Arab)
              </label>
              <input
                type="text"
                value={formData.academicYearAr}
                onChange={(e) => handleChange('academicYearAr', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-arabic text-sm text-right focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Date string */}
          <div className="border-t border-stone-200 pt-4">
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Kalimat Tanggal & Tempat Lengkap (Arab)
            </label>
            <input
              type="text"
              value={formData.dateTextAr}
              onChange={(e) => handleChange('dateTextAr', e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg font-arabic text-sm text-right focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-200 pt-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Wali Kelas (dengan Gelar)
              </label>
              <input
                type="text"
                value={formData.waliKelasName}
                onChange={(e) => handleChange('waliKelasName', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-semibold focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Nama Direktur Pondok / Pimpinan
              </label>
              <input
                type="text"
                value={formData.direkturName}
                onChange={(e) => handleChange('direkturName', e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg font-semibold focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-700 transition"
            >
              <RotateCcw size={13} />
              Reset Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition"
              >
                <Save size={14} />
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
