import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import {
  FileSpreadsheet,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  HeartPulse,
  UserX,
  FileText,
  School,
  Download,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { students, records, settings, selectedDate, setSelectedDate } = useAttendance();

  const [reportType, setReportType] = useState<'harian' | 'bulanan'>('harian');
  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Filter students by grade
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      return selectedGrade === 'Semua' || s.grade === selectedGrade;
    });
  }, [students, selectedGrade]);

  // Harian records
  const dailyRecords = useMemo(() => {
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  // Bulanan aggregation: Calculate H, T, I, S, A for each student in the selected month
  const monthlySummary = useMemo(() => {
    return filteredStudents.map((st) => {
      const studentRecords = records.filter(
        (r) => r.studentId === st.id && r.date.startsWith(selectedMonth)
      );

      let hadir = 0;
      let terlambat = 0;
      let izin = 0;
      let sakit = 0;
      let alpa = 0;

      studentRecords.forEach((r) => {
        if (r.status === 'Hadir') hadir++;
        else if (r.status === 'Terlambat') terlambat++;
        else if (r.status === 'Izin') izin++;
        else if (r.status === 'Sakit') sakit++;
        else if (r.status === 'Alpa') alpa++;
      });

      const totalRecorded = hadir + terlambat + izin + sakit + alpa;
      const effectivePresent = hadir + terlambat;
      const pct = totalRecorded > 0 ? ((effectivePresent / totalRecorded) * 100).toFixed(0) : '100';

      return {
        student: st,
        hadir,
        terlambat,
        izin,
        sakit,
        alpa,
        totalRecorded,
        percentage: Number(pct),
      };
    });
  }, [filteredStudents, records, selectedMonth]);

  // Export CSV
  const handleExportCsv = () => {
    if (reportType === 'harian') {
      const headers = ['No', 'NISN', 'Nama Murid', 'Kelas', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan', 'Sumber Presensi'];
      const rows = filteredStudents.map((st, idx) => {
        const rec = dailyRecords.find((r) => r.studentId === st.id);
        return [
          idx + 1,
          `"${st.nisn}"`,
          `"${st.name}"`,
          st.grade,
          selectedDate,
          rec?.checkInTime || '-',
          rec?.checkOutTime || '-',
          rec?.status || 'Belum Presensi',
          `"${rec?.notes || '-'}"`,
          rec?.source || 'Belum Presensi',
        ];
      });

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Laporan_Harian_Presensi_${selectedDate}_${selectedGrade}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['No', 'NISN', 'Nama Murid', 'Kelas', 'Bulan', 'Hadir (H)', 'Terlambat (T)', 'Izin (I)', 'Sakit (S)', 'Alpa (A)', 'Persentase'];
      const rows = monthlySummary.map((ms, idx) => [
        idx + 1,
        `"${ms.student.nisn}"`,
        `"${ms.student.name}"`,
        ms.student.grade,
        selectedMonth,
        ms.hadir,
        ms.terlambat,
        ms.izin,
        ms.sakit,
        ms.alpa,
        `"${ms.percentage}%"`,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rekap_Bulanan_Presensi_${selectedMonth}_${selectedGrade}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Month Indonesian formatting
  const formattedMonthName = useMemo(() => {
    const [year, month] = selectedMonth.split('-');
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${year}`;
  }, [selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Top Banner and Filter Controls (Hidden in Print) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>LEMBAGA PENDIDIKAN DASAR</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">{settings.schoolName}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Laporan & Rekapitulasi Presensi
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Unduh rekapitulasi kehadiran resmi berkop surat dinas atau ekspor data ke Excel / CSV.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Unduh Excel/CSV
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Laporan Resmi
            </button>
          </div>
        </div>

        {/* Toolbar & Filter Switches */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Report Type Switch */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setReportType('harian')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  reportType === 'harian'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Laporan Harian
              </button>
              <button
                type="button"
                onClick={() => setReportType('bulanan')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  reportType === 'bulanan'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rekap Bulanan
              </button>
            </div>

            {/* Date/Month Picker */}
            {reportType === 'harian' ? (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-600">Pilih Tanggal:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono text-slate-800 text-xs focus:outline-none"
                />
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium text-slate-600">Pilih Bulan:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent font-mono text-slate-800 text-xs focus:outline-none"
                />
              </div>
            )}

            {/* Grade Filter */}
            <div className="flex items-center gap-1">
              <span className="font-medium text-slate-600">Filter Kelas:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700 text-xs"
              >
                <option value="Semua">Semua Kelas (1 s/d 6)</option>
                <option value="1A">Kelas 1A</option>
                <option value="1B">Kelas 1B</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </div>
          </div>

          <span className="text-slate-500 font-medium">
            T.A. {settings.academicYear} · Semester {settings.semester}
          </span>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 shadow-xs print:p-0 print:border-none print:shadow-none text-slate-800">
        {/* Official Kop Surat (Letterhead) */}
        <div className="border-b-4 border-double border-slate-800 pb-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <img
              src="/src/assets/images/logo_sdn_pasrujambe_1793849336635.jpg"
              alt="Logo SDN Pasrujambe 01"
              className="w-20 h-20 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="text-center flex-1">
              <h4 className="text-sm font-semibold tracking-wider uppercase text-slate-700">
                Pemerintah Kabupaten Lumajang
              </h4>
              <h3 className="text-base font-bold uppercase tracking-wider text-slate-800">
                Dinas Pendidikan dan Kebudayaan
              </h3>
              <h2 className="text-xl font-extrabold uppercase tracking-tight text-emerald-900 leading-tight">
                {settings.schoolName}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {settings.address}, {settings.district}, {settings.regency} - Kode Pos 67372
              </p>
              <p className="text-[11px] text-slate-500 font-mono">
                NPSN: {settings.npsn} · Akreditasi: A · Email: bakhtiardarmawan60@guru.sd.belajar.id
              </p>
            </div>
            {/* Tut Wuri Handayani / Spacer */}
            <div className="w-20 hidden sm:block" />
          </div>
        </div>

        {/* Report Document Title */}
        <div className="text-center mb-6">
          <h3 className="text-base font-bold uppercase tracking-wide underline underline-offset-4 text-slate-900">
            {reportType === 'harian'
              ? 'Laporan Harian Presensi Murid'
              : 'Rekapitulasi Bulanan Kehadiran Murid'}
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            {reportType === 'harian'
              ? `Hari/Tanggal: ${selectedDate} · Kelas: ${selectedGrade}`
              : `Periode Bulan: ${formattedMonthName} · Kelas: ${selectedGrade}`}
          </p>
        </div>

        {/* Report Table: Harian or Bulanan */}
        {reportType === 'harian' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700 uppercase text-[10px]">
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">NISN</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Lengkap Murid</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Kelas</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Jam Masuk</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Jam Pulang</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Status</th>
                  <th className="py-2 px-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.map((st, idx) => {
                  const rec = dailyRecords.find((r) => r.studentId === st.id);
                  const status = rec ? rec.status : 'Alpa';
                  return (
                    <tr key={st.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums text-slate-500">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-mono tabular-nums text-slate-700">
                        {st.nisn}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                        {st.name}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-emerald-800">
                        {st.grade}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                        {rec?.checkInTime || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums">
                        {rec?.checkOutTime || '-'}
                      </td>
                      <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold">
                        <span
                          className={
                            status === 'Hadir'
                              ? 'text-emerald-700'
                              : status === 'Terlambat'
                              ? 'text-amber-700'
                              : status === 'Sakit'
                              ? 'text-blue-700'
                              : status === 'Izin'
                              ? 'text-indigo-700'
                              : 'text-rose-700'
                          }
                        >
                          {status === 'Alpa' ? 'Belum Presensi' : status}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-600 text-[11px]">
                        {rec?.notes || rec?.source || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-300 border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700 uppercase text-[10px]">
                  <th className="py-2 px-3 border-r border-slate-300 text-center w-10">No</th>
                  <th className="py-2 px-3 border-r border-slate-300">NISN</th>
                  <th className="py-2 px-3 border-r border-slate-300">Nama Siswa</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center">Kelas</th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center text-emerald-700">
                    Hadir (H)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center text-amber-700">
                    Terlambat (T)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center text-indigo-700">
                    Izin (I)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center text-blue-700">
                    Sakit (S)
                  </th>
                  <th className="py-2 px-3 border-r border-slate-300 text-center text-rose-700">
                    Alpa (A)
                  </th>
                  <th className="py-2 px-3 text-right">Persentase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthlySummary.map((ms, idx) => (
                  <tr key={ms.student.id} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono tabular-nums text-slate-500">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono tabular-nums text-slate-700">
                      {ms.student.nisn}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-medium text-slate-900">
                      {ms.student.name}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-semibold text-emerald-800">
                      {ms.student.grade}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-emerald-700 tabular-nums">
                      {ms.hadir}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-amber-700 tabular-nums">
                      {ms.terlambat}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-indigo-700 tabular-nums">
                      {ms.izin}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-blue-700 tabular-nums">
                      {ms.sakit}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-mono font-bold text-rose-700 tabular-nums">
                      {ms.alpa}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-800 tabular-nums">
                      {ms.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signature Block (Tanda Tangan Kepala Sekolah & Guru Piket) */}
        <div className="mt-12 pt-6 flex justify-between items-start text-xs text-slate-700 break-inside-avoid">
          {/* Guru Piket */}
          <div className="text-center w-64">
            <p className="text-slate-500 mb-1">Mengetahui,</p>
            <p className="font-semibold text-slate-800">Guru Petugas Piket Presensi</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">Bakhtiar Darmawan, S.Pd.</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP: 19880914 201502 1 002</p>
          </div>

          {/* Kepala Sekolah */}
          <div className="text-center w-64">
            <p className="text-slate-500 mb-1">
              Pasrujambe, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="font-semibold text-slate-800">Kepala Sekolah SDN Pasrujambe 01</p>
            <div className="h-20" />
            <p className="font-bold underline text-slate-900">{settings.headmaster}</p>
            <p className="text-[11px] text-slate-500 font-mono">NIP: {settings.nipHeadmaster}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
