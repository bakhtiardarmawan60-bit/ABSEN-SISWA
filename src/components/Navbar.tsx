import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Camera, Clock } from 'lucide-react';

export type ActiveTab = 'dashboard' | 'scanner' | 'students' | 'reports' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { settings } = useAttendance();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark / brand zone */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <img
              src="/src/assets/images/logo_sdn_pasrujambe_1793849336635.jpg"
              alt="Logo SDN Pasrujambe 01"
              className="w-9 h-9 object-contain rounded-full shadow-2xs border border-slate-200"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-slate-900 leading-tight">
                {settings.schoolName}
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                PRESENSI DIGITAL REAL-TIME
              </span>
            </div>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'dashboard'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'scanner'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Scan QR
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'students'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Data Murid
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'reports'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Laporan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 pb-1 border-b-2 ${
                activeTab === 'settings'
                  ? 'border-emerald-700 text-emerald-800 font-bold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              Pengaturan
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Live Clock Tabular */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-mono tabular-nums px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold text-slate-800">{currentTime || '--:--:--'}</span>
              <span className="text-[10px] text-slate-400 font-sans">WIB</span>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors whitespace-nowrap shrink-0"
            >
              <Camera className="w-3.5 h-3.5" />
              Buka Scanner
            </button>
          </div>
        </div>

        {/* Mobile Navigation Strip */}
        <div className="md:hidden flex items-center justify-between border-t border-slate-100 py-2 text-xs font-semibold overflow-x-auto gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600'
            }`}
          >
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'scanner'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600'
            }`}
          >
            Scan QR
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'students'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600'
            }`}
          >
            Data Murid
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600'
            }`}
          >
            Laporan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-emerald-50 text-emerald-800'
                : 'text-slate-600'
            }`}
          >
            Pengaturan
          </button>
        </div>
      </div>
    </header>
  );
};
