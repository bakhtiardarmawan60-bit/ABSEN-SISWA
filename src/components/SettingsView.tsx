import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { SchoolSettings } from '../types';
import { soundFx } from '../utils/audio';
import {
  Settings,
  Save,
  RotateCcw,
  Volume2,
  Clock,
  School,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData } = useAttendance();
  const [formData, setFormData] = useState<SchoolSettings>(settings);
  const [savedNotification, setSavedNotification] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const testSoundSuccess = () => {
    soundFx.playSuccess();
  };

  const testSoundLate = () => {
    soundFx.playLate();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span>PENGATURAN SISTEM</span>
          <span aria-hidden="true">·</span>
          <span className="text-emerald-700 font-semibold">{settings.schoolName}</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mt-1">
          Konfigurasi Presensi & Profil Sekolah
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Atur jam masuk, toleransi keterlambatan otomatis, profil sekolah, dan audio pemindai.
        </p>
      </div>

      {savedNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan sistem presensi berhasil disimpan ke memori sekolah!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Jam Operasional Presensi */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Clock className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Jadwal & Batas Waktu Presensi Otomatis
            </h3>
          </div>

          <p className="text-xs text-slate-500">
            Sistem secara otomatis menandai status <strong>Terlambat</strong> jika scan QR code dilakukan setelah Batas Jam Masuk yang ditentukan di bawah ini.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Jam Masuk Dibuka
              </label>
              <input
                type="time"
                value={formData.checkInStart}
                onChange={(e) =>
                  setFormData({ ...formData, checkInStart: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Murid dapat mulai memindai kartu
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Batas Jam Masuk (Tepat Waktu) *
              </label>
              <input
                type="time"
                value={formData.checkInDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, checkInDeadline: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-emerald-600 font-bold text-amber-700"
              />
              <span className="text-[10px] text-amber-700 font-medium mt-1 block">
                Lewat jam ini = Status Terlambat
              </span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Jam Pulang Sekolah Dibuka
              </label>
              <input
                type="time"
                value={formData.checkOutStart}
                onChange={(e) =>
                  setFormData({ ...formData, checkOutStart: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-emerald-600"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Presensi kepulangan siswa
              </span>
            </div>
          </div>
        </div>

        {/* Profil Sekolah & Pejabat Penandatangan */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <School className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Profil SDN Pasrujambe 01 & Pejabat Sekolah
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Sekolah Resmi
              </label>
              <input
                type="text"
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData({ ...formData, schoolName: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                NPSN Sekolah
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">
                Alamat Sekolah
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Kabupaten & Provinsi
              </label>
              <input
                type="text"
                value={`${formData.regency}, ${formData.province}`}
                onChange={(e) => {
                  const parts = e.target.value.split(',');
                  setFormData({
                    ...formData,
                    regency: parts[0]?.trim() || formData.regency,
                    province: parts[1]?.trim() || formData.province,
                  });
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Nama Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.headmaster}
                onChange={(e) =>
                  setFormData({ ...formData, headmaster: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.nipHeadmaster}
                onChange={(e) =>
                  setFormData({ ...formData, nipHeadmaster: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg font-mono focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tahun Ajaran Aktif
              </label>
              <input
                type="text"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Semester
              </label>
              <select
                value={formData.semester}
                onChange={(e) =>
                  setFormData({ ...formData, semester: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600"
              >
                <option value="Ganjil">Ganjil</option>
                <option value="Genap">Genap</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audio Beep Settings */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">
                Efek Suara Bel Presensi
              </h3>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.soundAlert}
                onChange={(e) =>
                  setFormData({ ...formData, soundAlert: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <p className="text-xs text-slate-500">
            Memberikan umpan balik suara ganda saat kartu murid berhasil dipindai oleh kamera scanner sekolah.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={testSoundSuccess}
              className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Uji Bunyi: Hadir Tepat Waktu
            </button>
            <button
              type="button"
              onClick={testSoundLate}
              className="px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Uji Bunyi: Terlambat
            </button>
          </div>
        </div>

        {/* Save & Reset Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset ke Data Awal Contoh
          </button>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            Simpan Konfigurasi
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Kembalikan Data ke Standar Awal?
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Tindakan ini akan mengembalikan daftar 27 murid contoh SDN Pasrujambe 01 serta riwayat presensi hari ini. Seluruh perubahan kustom lokal akan dihapus.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setFormData(settings);
                  setResetConfirmOpen(false);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-600 text-white font-semibold hover:bg-rose-700 shadow-2xs"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
