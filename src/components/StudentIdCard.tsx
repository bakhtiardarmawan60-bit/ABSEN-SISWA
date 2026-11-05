import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Student } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { Download, Printer, User } from 'lucide-react';

interface StudentIdCardProps {
  student: Student;
  onClose?: () => void;
  showActions?: boolean;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({
  student,
  showActions = true,
}) => {
  const { settings } = useAttendance();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const qrPayload = `SDNPASRUJAMBE01:NISN:${student.nisn}`;

  useEffect(() => {
    QRCode.toDataURL(qrPayload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [qrPayload]);

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `QR_${student.nisn}_${student.name.replace(/\s+/g, '_')}.png`;
    a.click();
  };

  const handlePrintCard = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Printable Official Student Card Container */}
      <div
        id={`student-card-${student.id}`}
        className="w-[340px] sm:w-[380px] bg-white rounded-xl border border-slate-300 shadow-sm overflow-hidden text-slate-800 print:shadow-none print:border print:border-slate-400 print:w-[350px]"
      >
        {/* Card Header */}
        <div className="bg-emerald-800 text-white p-3.5 flex items-center gap-3 border-b-2 border-amber-400">
          <img
            src="/src/assets/images/logo_sdn_pasrujambe_1793849336635.jpg"
            alt="Logo SDN Pasrujambe 01"
            className="w-12 h-12 object-contain rounded-full bg-white p-0.5 shadow-xs shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 text-center pr-2">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-100">
              Pemerintah Kab. Lumajang
            </p>
            <h4 className="text-sm font-bold tracking-tight text-white leading-tight">
              {settings.schoolName}
            </h4>
            <p className="text-[9px] text-emerald-200 leading-tight">
              KARTU PRESENSI RESMI SISWA
            </p>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 bg-slate-50">
          <div className="flex gap-3.5 items-center">
            {/* Student Photo/Avatar */}
            <div className="w-20 h-24 bg-white border border-slate-300 rounded-md flex flex-col items-center justify-center overflow-hidden shrink-0 shadow-2xs">
              {student.photoUrl ? (
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                  <User className="w-8 h-8 text-slate-400 mb-1" />
                  <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-tighter">
                    {student.gender === 'L' ? 'Siswa' : 'Siswi'}
                  </span>
                </div>
              )}
            </div>

            {/* Student Details */}
            <div className="flex-1 space-y-1 text-left text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Nama Murid
                </span>
                <span className="font-bold text-slate-900 leading-snug line-clamp-2">
                  {student.name}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    NISN
                  </span>
                  <span className="font-mono font-bold text-slate-800 text-[11px] tabular-nums">
                    {student.nisn}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                    Kelas
                  </span>
                  <span className="font-bold text-emerald-700 text-xs">
                    Kelas {student.grade}
                  </span>
                </div>
              </div>
              <div className="pt-0.5">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                  Wali Murid
                </span>
                <span className="text-slate-700 text-[11px] truncate block">
                  {student.parentName}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-center justify-between bg-white p-2.5 rounded-lg border">
            <div className="text-left pr-2">
              <span className="text-[10px] font-bold text-slate-900 uppercase block">
                Kode Presensi Digital
              </span>
              <p className="text-[10px] text-slate-500 leading-tight">
                Arahkan barcode QR ini ke kamera scanner sekolah saat jam masuk & pulang.
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[9px] text-slate-600 font-mono">
                <span>ID: {student.id}</span>
                <span aria-hidden="true">·</span>
                <span>NIS: {student.nis}</span>
              </div>
            </div>

            <div className="w-20 h-20 bg-white p-1 rounded border border-slate-200 shrink-0 flex items-center justify-center">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR ${student.nisn}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-slate-100 animate-pulse rounded" />
              )}
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="bg-slate-100 px-3 py-2 text-center border-t border-slate-200 text-[9px] text-slate-500 flex justify-between items-center">
          <span>{settings.district}, {settings.regency}</span>
          <span className="font-medium text-slate-600">T.A. {settings.academicYear}</span>
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      {showActions && (
        <div className="flex items-center gap-2 mt-4 no-print">
          <button
            type="button"
            onClick={handleDownloadQr}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download QR
          </button>
          <button
            type="button"
            onClick={handlePrintCard}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 shadow-2xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Kartu
          </button>
        </div>
      )}
    </div>
  );
};
