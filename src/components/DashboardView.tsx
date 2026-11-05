import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceStatus } from '../types';
import {
  Users,
  CheckCircle2,
  Clock,
  HeartPulse,
  UserX,
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Edit3,
} from 'lucide-react';

export const DashboardView: React.FC<{ onNavigateToScanner: () => void }> = ({
  onNavigateToScanner,
}) => {
  const {
    students,
    records,
    settings,
    selectedDate,
    setSelectedDate,
    markManualAttendance,
    simulateRealtimeScan,
  } = useAttendance();

  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [manualNote, setManualNote] = useState<string>('');
  const [manualStatusChoice, setManualStatusChoice] = useState<AttendanceStatus>('Izin');

  // Filter students by grade if selected
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGrade = selectedGrade === 'Semua' || s.grade === selectedGrade;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery);
      return matchGrade && matchSearch;
    });
  }, [students, selectedGrade, searchQuery]);

  // Records for current selected date
  const dateRecords = useMemo(() => {
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  // Aggregate metrics
  const stats = useMemo(() => {
    const totalStudents = students.length;
    let hadir = 0;
    let terlambat = 0;
    let sakit = 0;
    let izin = 0;

    dateRecords.forEach((r) => {
      if (r.status === 'Hadir') hadir++;
      else if (r.status === 'Terlambat') terlambat++;
      else if (r.status === 'Sakit') sakit++;
      else if (r.status === 'Izin') izin++;
    });

    const recordedCount = hadir + terlambat + sakit + izin;
    const alpaOrNotYet = Math.max(0, totalStudents - recordedCount);
    const presentTotal = hadir + terlambat;
    const attendancePercentage = totalStudents > 0 ? (presentTotal / totalStudents) * 100 : 0;

    return {
      totalStudents,
      hadir,
      terlambat,
      sakit,
      izin,
      alpaOrNotYet,
      presentTotal,
      attendancePercentage,
    };
  }, [students.length, dateRecords]);

  // Breakdown by class
  const classBreakdowns = useMemo(() => {
    const classes = ['1A', '1B', '2', '3', '4', '5', '6'];
    return classes.map((cls) => {
      const classStudents = students.filter((s) => s.grade === cls);
      const studentIds = new Set(classStudents.map((s) => s.id));
      const classRecords = dateRecords.filter((r) => studentIds.has(r.studentId));

      const hadirCount = classRecords.filter(
        (r) => r.status === 'Hadir' || r.status === 'Terlambat'
      ).length;
      const total = classStudents.length;
      const pct = total > 0 ? Math.round((hadirCount / total) * 100) : 0;

      return {
        grade: cls,
        hadir: hadirCount,
        total,
        percentage: pct,
      };
    });
  }, [students, dateRecords]);

  // Combined row data: each student + their status for selectedDate
  const studentRows = useMemo(() => {
    return filteredStudents
      .map((student) => {
        const record = dateRecords.find((r) => r.studentId === student.id);
        const status: AttendanceStatus = record ? record.status : 'Alpa';
        return {
          student,
          record,
          status,
          checkInTime: record?.checkInTime || '-',
          checkOutTime: record?.checkOutTime || '-',
          source: record?.source || 'Belum Presensi',
          notes: record?.notes || '-',
        };
      })
      .filter((row) => {
        if (statusFilter === 'Semua') return true;
        if (statusFilter === 'Belum Hadir') return row.status === 'Alpa';
        return row.status === statusFilter;
      });
  }, [filteredStudents, dateRecords, statusFilter]);

  // Save manual attendance dialog
  const handleSaveManualAttendance = (studentId: string) => {
    markManualAttendance(studentId, selectedDate, manualStatusChoice, manualNote);
    setEditingStudentId(null);
    setManualNote('');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Real-Time Context Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>ADMINISTRASI SEKOLAH</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">{settings.schoolName}</span>
              <span aria-hidden="true">·</span>
              <span>KAB. LUMAJANG</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              Dashboard Kehadiran Real-Time
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Pemantauan langsung arus kehadiran siswa, keterlambatan, dan rekapitulasi harian sekolah.
            </p>
          </div>

          {/* Quick Date Selector & Scanner CTA */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="dashboard-date" className="font-semibold text-slate-700">
                Tanggal:
              </label>
              <input
                id="dashboard-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent font-mono text-slate-800 text-xs focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={onNavigateToScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Buka Scanner QR
            </button>

            <button
              type="button"
              onClick={() => simulateRealtimeScan()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
              title="Simulasikan 1 murid melakukan scan QR untuk menguji update real-time"
            >
              Simulasi Presensi
            </button>
          </div>
        </div>
      </div>

      {/* 5 Primary KPI Cards (60-30-10 & Tabular Numerals) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Siswa */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Murid</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {stats.totalStudents}
          </p>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Kelas 1 s/d 6
          </span>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-emerald-800">Tepat Waktu</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {stats.hadir}
          </p>
          <span className="text-[11px] text-emerald-700 mt-1 block font-medium">
            Sebelum {settings.checkInDeadline} WIB
          </span>
        </div>

        {/* Terlambat */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-amber-800">Terlambat</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-mono tabular-nums">
            {stats.terlambat}
          </p>
          <span className="text-[11px] text-amber-700 mt-1 block font-medium">
            Lewat {settings.checkInDeadline} WIB
          </span>
        </div>

        {/* Izin / Sakit */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-blue-800">Izin & Sakit</span>
            <HeartPulse className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-700 font-mono tabular-nums">
            {stats.sakit + stats.izin}
          </p>
          <span className="text-[11px] text-blue-700 mt-1 block font-medium">
            {stats.sakit} Sakit · {stats.izin} Izin
          </span>
        </div>

        {/* Belum Hadir / Alpa */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium text-rose-800">Belum Hadir</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {stats.alpaOrNotYet}
          </p>
          <span className="text-[11px] text-rose-700 mt-1 block font-medium">
            Alpa / Belum Scan
          </span>
        </div>
      </div>

      {/* Attendance Rate Strip & Class Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Attendance Gauge & Quick Analytics */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Tingkat Kehadiran Sekolah
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                <TrendingUp className="w-3.5 h-3.5" />
                {stats.attendancePercentage.toFixed(1)}%
              </span>
            </div>

            <div className="mt-4">
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-emerald-600 h-full transition-all duration-500"
                  style={{
                    width: `${(stats.hadir / (stats.totalStudents || 1)) * 100}%`,
                  }}
                  title={`Tepat Waktu: ${stats.hadir}`}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{
                    width: `${(stats.terlambat / (stats.totalStudents || 1)) * 100}%`,
                  }}
                  title={`Terlambat: ${stats.terlambat}`}
                />
                <div
                  className="bg-blue-400 h-full transition-all duration-500"
                  style={{
                    width: `${
                      ((stats.sakit + stats.izin) / (stats.totalStudents || 1)) * 100
                    }%`,
                  }}
                  title={`Izin/Sakit: ${stats.sakit + stats.izin}`}
                />
              </div>

              {/* Legend with typographic separators (anti-pill) */}
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                  <span>Hadir ({stats.hadir})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Terlambat ({stats.terlambat})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span>Izin/Sakit ({stats.sakit + stats.izin})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                  <span>Belum ({stats.alpaOrNotYet})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <p className="leading-relaxed">
              Target kehadiran harian minimal Kemendikbudristek: <strong className="text-slate-800">85%</strong>.
              Saat ini SDN Pasrujambe 01 berada pada status{' '}
              <span className="font-semibold text-emerald-700">
                {stats.attendancePercentage >= 85 ? 'Sangat Baik' : 'Perlu Ditingkatkan'}
              </span>.
            </p>
          </div>
        </div>

        {/* Right: Per-Class Attendance Breakdown */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm">
              Rekapitulasi Kehadiran per Rombel (Kelas)
            </h3>
            <span className="text-xs text-slate-500">
              {settings.academicYear} · Semester {settings.semester}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {classBreakdowns.map((cb) => (
              <div
                key={cb.grade}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center"
              >
                <span className="text-[11px] font-bold text-slate-700 uppercase block">
                  Kelas {cb.grade}
                </span>
                <p className="text-lg font-bold text-slate-900 font-mono tabular-nums mt-0.5">
                  {cb.hadir}{' '}
                  <span className="text-xs font-normal text-slate-500">/ {cb.total}</span>
                </p>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div
                    className={`h-full ${
                      cb.percentage >= 80 ? 'bg-emerald-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${cb.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono tabular-nums">
                  {cb.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real-Time Live Attendance Grid & Roster */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar / Filters */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-slate-900 text-sm whitespace-nowrap">
              Daftar Murid & Status Kehadiran
            </h3>
            <span className="text-xs text-slate-500">
              ({studentRows.length} dari {students.length} murid)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama / NISN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs py-1.5 pl-7 pr-3 border border-slate-300 rounded-lg focus:outline-emerald-600 w-44 bg-slate-50 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Kelas:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="border border-slate-300 rounded-lg py-1 px-2 text-xs bg-slate-50 font-medium text-slate-700"
              >
                <option value="Semua">Semua Kelas</option>
                <option value="1A">Kelas 1A</option>
                <option value="1B">Kelas 1B</option>
                <option value="2">Kelas 2</option>
                <option value="3">Kelas 3</option>
                <option value="4">Kelas 4</option>
                <option value="5">Kelas 5</option>
                <option value="6">Kelas 6</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-slate-300 rounded-lg py-1 px-2 text-xs bg-slate-50 font-medium text-slate-700"
              >
                <option value="Semua">Semua Status</option>
                <option value="Hadir">Hadir Tepat Waktu</option>
                <option value="Terlambat">Terlambat</option>
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Belum Hadir">Belum Hadir / Alpa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dense High-Density Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Nama Siswa</th>
                <th className="py-2.5 px-4">NISN / NIS</th>
                <th className="py-2.5 px-4">Kelas</th>
                <th className="py-2.5 px-4">Jam Masuk</th>
                <th className="py-2.5 px-4">Jam Pulang</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Keterangan / Sumber</th>
                <th className="py-2.5 px-4 text-right">Aksi Manual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentRows.length > 0 ? (
                studentRows.map((row, idx) => (
                  <tr
                    key={row.student.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2 px-4 text-center text-slate-400 font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2 px-4 font-semibold text-slate-900">
                      {row.student.name}
                      <span className="block text-[10px] font-normal text-slate-500">
                        Wali: {row.student.parentName}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-mono tabular-nums text-slate-600">
                      <span>{row.student.nisn}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        NIS: {row.student.nis}
                      </span>
                    </td>
                    <td className="py-2 px-4 font-medium text-slate-700">
                      Kelas {row.student.grade}
                    </td>
                    <td className="py-2 px-4 font-mono font-medium text-slate-800 tabular-nums">
                      {row.checkInTime}
                    </td>
                    <td className="py-2 px-4 font-mono text-slate-500 tabular-nums">
                      {row.checkOutTime}
                    </td>
                    <td className="py-2 px-4">
                      {/* Zero-Pill semantic status text */}
                      <span
                        className={`font-semibold inline-flex items-center gap-1.5 ${
                          row.status === 'Hadir'
                            ? 'text-emerald-700'
                            : row.status === 'Terlambat'
                            ? 'text-amber-700'
                            : row.status === 'Sakit'
                            ? 'text-blue-700'
                            : row.status === 'Izin'
                            ? 'text-indigo-700'
                            : 'text-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.status === 'Hadir'
                              ? 'bg-emerald-600'
                              : row.status === 'Terlambat'
                              ? 'bg-amber-500'
                              : row.status === 'Sakit'
                              ? 'bg-blue-500'
                              : row.status === 'Izin'
                              ? 'bg-indigo-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        {row.status === 'Alpa' ? 'Belum Presensi' : row.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500 text-[11px] max-w-[200px] truncate">
                      {row.notes !== '-' ? row.notes : row.source}
                    </td>
                    <td className="py-2 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingStudentId(row.student.id);
                          setManualStatusChoice(row.status === 'Alpa' ? 'Izin' : row.status);
                          setManualNote(row.notes !== '-' ? row.notes : '');
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        Ubah
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada siswa yang sesuai dengan filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Status Modal */}
      {editingStudentId && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-lg">
            <h4 className="font-bold text-slate-900 text-base mb-1">
              Catat Kehadiran Manual Siswa
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {students.find((s) => s.id === editingStudentId)?.name} (Kelas{' '}
              {students.find((s) => s.id === editingStudentId)?.grade})
            </p>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Status Kehadiran:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Hadir', 'Terlambat', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setManualStatusChoice(st)}
                        className={`py-2 px-3 rounded-lg border font-medium text-left flex items-center justify-between ${
                          manualStatusChoice === st
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{st}</span>
                        {manualStatusChoice === st && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Catatan / Keterangan Surat:
                </label>
                <textarea
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="Misal: Surat dokter demam berdarah, izin acara keluarga, dll..."
                  rows={3}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleSaveManualAttendance(editingStudentId)}
                className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 shadow-2xs"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
