import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAttendance } from '../context/AttendanceContext';
import { ScanType, Student, AttendanceRecord } from '../types';
import {
  Camera,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Search,
  Volume2,
  VolumeX,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
  User,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const QrScannerView: React.FC = () => {
  const {
    students,
    records,
    settings,
    recentScans,
    processScan,
    updateSettings,
    simulateRealtimeScan,
  } = useAttendance();

  const [scanType, setScanType] = useState<ScanType>('Masuk');
  const [manualInput, setManualInput] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [lastScannedResult, setLastScannedResult] = useState<{
    success: boolean;
    message: string;
    student?: Student;
    record?: AttendanceRecord;
    isLate?: boolean;
    isDuplicate?: boolean;
    timestamp: string;
  } | null>(null);

  const [simulatedWaSent, setSimulatedWaSent] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'sdnp-qr-reader';
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start live camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      const qrCodeSuccessCallback = (decodedText: string) => {
        handleRawScan(decodedText, 'Kamera QR');
      };

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await html5QrCode.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        () => {
          // scanning frame - ignore silent errors
        }
      );

      setIsCameraActive(true);
    } catch (err: unknown) {
      console.warn('Camera start error:', err);
      setIsCameraActive(false);
      setCameraError(
        'Kamera tidak dapat diakses atau izin belum diberikan. Anda dapat mengunggah foto kartu QR atau menggunakan input manual di bawah.'
      );
    }
  };

  // Stop camera
  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Handle scanned raw text
  const handleRawScan = (rawText: string, source: AttendanceRecord['source'] = 'Kamera QR') => {
    const res = processScan(rawText, scanType, source);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('id-ID', { hour12: false });

    setLastScannedResult({
      ...res,
      timestamp: timeStr,
    });

    if (res.success) {
      setSimulatedWaSent(true);
      if (!res.isLate) {
        confetti({
          particleCount: 35,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setSimulatedWaSent(false);
    }
  };

  // Handle file scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('temp-qr-file-reader');
      const result = await html5QrCode.scanFile(file, true);
      handleRawScan(result, 'Upload Gambar');
    } catch {
      setLastScannedResult({
        success: false,
        message: 'Tidak ditemukan QR Code yang valid pada gambar tersebut. Coba gambar kartu yang lebih jelas.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour12: false }),
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle manual input submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleRawScan(manualInput.trim(), 'Manual Petugas');
    setManualInput('');
  };

  // Quick test demo
  const handleQuickDemoScan = (nisn: string) => {
    handleRawScan(nisn, 'Manual Petugas');
  };

  // Today's stats for header
  const todayRecords = records.filter(
    (r) => r.date === new Date().toISOString().split('T')[0]
  );
  const totalHadirToday = todayRecords.filter(
    (r) => r.status === 'Hadir' || r.status === 'Terlambat'
  ).length;

  return (
    <div className="space-y-6">
      {/* Hidden container for file scanner helper */}
      <div id="temp-qr-file-reader" className="hidden" />

      {/* Top Banner / Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>TERMINAL PRESENSI DIGITAL RESMI</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-500 font-normal">SDN PASRUJAMBE 01</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Pemindai QR Code Murid
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Arahkan kartu QR siswa ke kamera scanner atau unggah foto kartu untuk mencatat kehadiran seketika.
            </p>
          </div>

          {/* Mode Switch: Masuk vs Pulang */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setScanType('Masuk')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                  scanType === 'Masuk'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presensi Masuk
              </button>
              <button
                type="button"
                onClick={() => setScanType('Pulang')}
                className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${
                  scanType === 'Pulang'
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Presensi Pulang
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() =>
                updateSettings({ ...settings, soundAlert: !settings.soundAlert })
              }
              title={settings.soundAlert ? 'Suara Aktif' : 'Suara Senyap'}
              className={`p-2.5 rounded-lg border transition-colors ${
                settings.soundAlert
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {settings.soundAlert ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Current Shift Info Strip */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-700" />
            <span>
              Target Masuk: <strong className="font-semibold text-slate-800">{settings.checkInStart} - {settings.checkInDeadline} WIB</strong>
            </span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>
              Batas Terlambat: <strong className="font-semibold text-amber-700">&gt; {settings.checkInDeadline} WIB</strong>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              Total Terdata Hari Ini:{' '}
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {totalHadirToday}
              </span>{' '}
              / {students.length} Siswa
            </span>
            <button
              type="button"
              onClick={() => {
                const res = simulateRealtimeScan();
                if (res) {
                  const now = new Date();
                  setLastScannedResult({
                    ...res,
                    timestamp: now.toLocaleTimeString('id-ID', { hour12: false }),
                  });
                  setSimulatedWaSent(true);
                }
              }}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
            >
              Simulasi 1 Siswa Masuk
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Scanner Left + Live Feedback & Scans Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera / File Upload Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Kamera Pembaca QR
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {!isCameraActive ? (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 shadow-2xs transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Aktifkan Kamera
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                  >
                    Matikan Kamera
                  </button>
                )}
              </div>
            </div>

            {/* Video Viewport Container */}
            <div className="relative bg-slate-900 rounded-lg min-h-[300px] flex items-center justify-center overflow-hidden border border-slate-800">
              <div
                id={scannerContainerId}
                className={`w-full ${isCameraActive ? 'block' : 'hidden'}`}
              />

              {!isCameraActive && (
                <div className="text-center p-6 text-slate-300 max-w-sm">
                  <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-white text-sm mb-1">
                    Kamera Sedang Tidak Aktif
                  </h4>
                  <p className="text-xs text-slate-400 mb-4">
                    Tekan tombol di bawah untuk menyalakan webcam/kamera laptop/HP untuk mulai memindai QR code murid.
                  </p>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-500 shadow-sm transition-colors"
                  >
                    Nyalakan Kamera Sekarang
                  </button>
                </div>
              )}

              {/* Scanning Crosshair Overlay when Camera is Active */}
              {isCameraActive && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-lg relative">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400" />
                    <div className="absolute inset-x-2 top-1/2 h-0.5 bg-emerald-400/60 animate-pulse" />
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Info Kamera</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">{cameraError}</p>
                </div>
              </div>
            )}

            {/* Alternative Scanner: Upload Image or Manual Input */}
            <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload QR Image File */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="qr-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4 text-slate-500" />
                  Unggah Gambar/Foto QR
                </button>
              </div>

              {/* Manual Input Form */}
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Ketik NISN / Nama..."
                    className="w-full text-xs py-2 pl-7 pr-2 border border-slate-300 rounded-lg focus:outline-emerald-600 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Cek
                </button>
              </form>
            </div>
          </div>

          {/* Quick Demo Student Picker (Useful for quick testing without cards) */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Uji Coba Cepat (Klik salah satu siswa untuk simulasi scan):
              </span>
              <span className="text-[11px] text-slate-500">Mode: {scanType}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {students.slice(0, 7).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickDemoScan(s.nisn)}
                  className="px-2.5 py-1 text-xs bg-white hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 border border-slate-200 rounded-md text-slate-700 transition-colors shadow-2xs font-medium"
                >
                  {s.name.split(' ')[0]} ({s.grade})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Scan Result Popup & Recent Scans Stream */}
        <div className="lg:col-span-5 space-y-4">
          {/* Real-time Scan Result Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center justify-between">
              <span>Hasil Pemindaian Terakhir</span>
              {lastScannedResult && (
                <span className="text-[11px] font-mono text-slate-500 tabular-nums">
                  {lastScannedResult.timestamp} WIB
                </span>
              )}
            </h3>

            {lastScannedResult ? (
              <div
                className={`p-4 rounded-xl border ${
                  lastScannedResult.success
                    ? lastScannedResult.isLate
                      ? 'bg-amber-50 border-amber-200 text-amber-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : lastScannedResult.isDuplicate
                    ? 'bg-sky-50 border-sky-200 text-sky-950'
                    : 'bg-rose-50 border-rose-200 text-rose-950'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {lastScannedResult.success ? (
                      lastScannedResult.isLate ? (
                        <AlertTriangle className="w-6 h-6 text-amber-600" />
                      ) : (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      )
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-rose-600" />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-sm leading-snug">
                      {lastScannedResult.success
                        ? lastScannedResult.isLate
                          ? 'TERLAMBAT'
                          : 'HADIR TEPAT WAKTU'
                        : lastScannedResult.isDuplicate
                        ? 'SUDAH PRESENSI'
                        : 'PEMINDAIAN GAGAL'}
                    </p>
                    <p className="mt-1 opacity-90">{lastScannedResult.message}</p>

                    {lastScannedResult.student && (
                      <div className="mt-3 pt-3 border-t border-black/10 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">
                            {lastScannedResult.student.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                            <span>Kelas {lastScannedResult.student.grade}</span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">
                              NISN: {lastScannedResult.student.nisn}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* WhatsApp notification indicator */}
                    {simulatedWaSent && lastScannedResult.student && (
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-white/70 p-2 rounded border border-emerald-200">
                        <Send className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>
                          Notifikasi kehadiran terkirim ke Wali (
                          {lastScannedResult.student.parentName} -{' '}
                          {lastScannedResult.student.parentPhone})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                <Camera className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">Belum Ada Pemindaian</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scan QR code murid atau pilih murid uji coba untuk melihat feedback real-time.
                </p>
              </div>
            )}
          </div>

          {/* Real-time Session Scans Stream */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">
                Aktivitas Presensi Hari Ini
              </h3>
              <span className="text-[11px] text-slate-500">
                {recentScans.length} Aktivitas
              </span>
            </div>

            {recentScans.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[360px] overflow-y-auto">
                {recentScans.map((rec) => (
                  <div
                    key={rec.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          rec.status === 'Hadir'
                            ? 'bg-emerald-500'
                            : rec.status === 'Terlambat'
                            ? 'bg-amber-500'
                            : 'bg-rose-500'
                        }`}
                      />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 truncate">
                          {rec.studentName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Kelas {rec.grade} · {rec.scanType} ({rec.source})
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-800 tabular-nums">
                        {rec.checkInTime || rec.checkOutTime || '--:--'}
                      </span>
                      <span
                        className={`block text-[10px] font-semibold ${
                          rec.status === 'Hadir'
                            ? 'text-emerald-700'
                            : rec.status === 'Terlambat'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada aktivitas presensi di sesi ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
