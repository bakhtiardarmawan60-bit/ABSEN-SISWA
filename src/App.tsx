/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { QrScannerView } from './components/QrScannerView';
import { StudentsView } from './components/StudentsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { School, MapPin, Award, Phone } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const { settings } = useAttendance();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Top Bar Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Hero Header Strip with School Visual */}
      <section className="relative bg-slate-900 overflow-hidden no-print">
        {/* Background School Photography */}
        <div className="absolute inset-0 z-0">
          <img
            src="/src/assets/images/banner_sdn_pasrujambe_1793849337288.jpg"
            alt="Halaman Sekolah SDN Pasrujambe 01"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-emerald-950/80" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1 text-white">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>KECAMATAN PASRUJAMBE · KABUPATEN LUMAJANG · JAWA TIMUR</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Sistem Presensi Digital & Monitoring Kehadiran Murid
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
                Pencatatan kehadiran murid terintegrasi dengan kartu QR Code, deteksi otomatis keterlambatan jam masuk, dan laporan kehadiran real-time SDN Pasrujambe 01.
              </p>
            </div>

            {/* School Trust Badges */}
            <div className="flex md:flex-col items-start md:items-end justify-between md:justify-center gap-1.5 shrink-0 text-right">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-800/60">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Terakreditasi A (Unggul)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                NPSN: {settings.npsn} · T.A. {settings.academicYear}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView onNavigateToScanner={() => setActiveTab('scanner')} />
        )}
        {activeTab === 'scanner' && <QrScannerView />}
        {activeTab === 'students' && <StudentsView />}
        {activeTab === 'reports' && <ReportsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Quiet, Human Editorial Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/logo_sdn_pasrujambe_1793849336635.jpg"
              alt="Logo SDN Pasrujambe 01"
              className="w-7 h-7 object-contain rounded-full border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <p className="font-bold text-slate-900 leading-tight">
                {settings.schoolName} Kabupaten Lumajang
              </p>
              <p className="text-[11px] text-slate-500">
                Dinas Pendidikan dan Kebudayaan Pemerintah Kabupaten Lumajang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Dusun Krajan, Kec. Pasrujambe</span>
            <span aria-hidden="true">·</span>
            <span>Jawa Timur 67372</span>
            <span aria-hidden="true">·</span>
            <span>Presensi QR Murid v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <MainLayout />
    </AttendanceProvider>
  );
}
