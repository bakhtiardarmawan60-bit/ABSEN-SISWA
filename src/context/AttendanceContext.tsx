import React, { createContext, useContext, useState, useEffect } from 'react';
import { Student, AttendanceRecord, SchoolSettings, AttendanceStatus, ScanType } from '../types';
import { initialStudents, initialSchoolSettings, getInitialAttendanceRecords, getTodayDateString } from '../data/initialData';
import { soundFx } from '../utils/audio';

interface ScanResult {
  success: boolean;
  message: string;
  record?: AttendanceRecord;
  student?: Student;
  isLate?: boolean;
  isDuplicate?: boolean;
}

interface AttendanceContextType {
  students: Student[];
  records: AttendanceRecord[];
  settings: SchoolSettings;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  recentScans: AttendanceRecord[];
  processScan: (rawCode: string, scanType: ScanType, source?: AttendanceRecord['source']) => ScanResult;
  markManualAttendance: (studentId: string, date: string, status: AttendanceStatus, notes?: string) => void;
  addStudent: (studentData: Omit<Student, 'id'>) => Student;
  updateStudent: (student: Student) => void;
  deleteStudent: (studentId: string) => void;
  updateSettings: (newSettings: SchoolSettings) => void;
  resetToDefaultData: () => void;
  simulateRealtimeScan: () => ScanResult | null;
}

const STORAGE_KEYS = {
  STUDENTS: 'sdnp01_students_v1',
  RECORDS: 'sdnp01_records_v1',
  SETTINGS: 'sdnp01_settings_v1',
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [recentScans, setRecentScans] = useState<AttendanceRecord[]>([]);

  // Load from localStorage or initialize
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialStudents;
  });

  const [settings, setSettings] = useState<SchoolSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialSchoolSettings;
  });

  const [records, setRecords] = useState<AttendanceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return getInitialAttendanceRecords(getTodayDateString());
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.error(e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  }, [records]);

  // Clean raw QR code: Supports pure NISN ("0165849201") or structured ("SDNPASRUJAMBE01:NISN:0165849201" or URL)
  const extractNisnOrId = (rawCode: string): string => {
    const trimmed = rawCode.trim();
    if (trimmed.includes(':NISN:')) {
      const parts = trimmed.split(':NISN:');
      return parts[1]?.trim() || trimmed;
    }
    if (trimmed.includes(':')) {
      const parts = trimmed.split(':');
      return parts[parts.length - 1]?.trim() || trimmed;
    }
    return trimmed;
  };

  // Process a QR Scan or manual NISN check-in
  const processScan = (
    rawCode: string,
    scanType: ScanType = 'Masuk',
    source: AttendanceRecord['source'] = 'Kamera QR'
  ): ScanResult => {
    const query = extractNisnOrId(rawCode);
    const today = getTodayDateString();

    // Find student by NISN, NIS, or ID
    const student = students.find(
      (s) =>
        s.nisn.toLowerCase() === query.toLowerCase() ||
        s.nis.toLowerCase() === query.toLowerCase() ||
        s.id.toLowerCase() === query.toLowerCase() ||
        s.name.toLowerCase() === query.toLowerCase()
    );

    if (!student) {
      if (settings.soundAlert) soundFx.playError();
      return {
        success: false,
        message: `Murid dengan kode/NISN "${query}" tidak ditemukan dalam database SDN Pasrujambe 01.`,
      };
    }

    const now = new Date();
    const currentTimeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const currentHourMin = currentTimeStr.slice(0, 5); // HH:mm

    // Check existing record for today
    const existingIndex = records.findIndex(
      (r) => r.studentId === student.id && r.date === today
    );

    if (scanType === 'Masuk') {
      if (existingIndex >= 0) {
        const existing = records[existingIndex];
        if (existing.checkInTime) {
          if (settings.soundAlert) soundFx.playError();
          return {
            success: false,
            message: `${student.name} sudah tercatat presensi MASUK pada pukul ${existing.checkInTime} WIB.`,
            student,
            record: existing,
            isDuplicate: true,
          };
        }
      }

      // Check if late (after checkInDeadline)
      const isLate = currentHourMin > settings.checkInDeadline;
      const status: AttendanceStatus = isLate ? 'Terlambat' : 'Hadir';

      const newRecord: AttendanceRecord = {
        id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        studentId: student.id,
        studentNisn: student.nisn,
        studentName: student.name,
        grade: student.grade,
        date: today,
        checkInTime: currentTimeStr,
        status,
        scanType: 'Masuk',
        source,
      };

      if (existingIndex >= 0) {
        // update existing (e.g. if was placeholder)
        const updated = [...records];
        updated[existingIndex] = {
          ...updated[existingIndex],
          checkInTime: currentTimeStr,
          status,
          source,
        };
        setRecords(updated);
      } else {
        setRecords((prev) => [newRecord, ...prev]);
      }

      setRecentScans((prev) => [newRecord, ...prev.slice(0, 19)]);

      if (settings.soundAlert) {
        if (isLate) {
          soundFx.playLate();
        } else {
          soundFx.playSuccess();
        }
      }

      return {
        success: true,
        message: isLate
          ? `Presensi Masuk TERLAMBAT tercatat: ${student.name} (${currentHourMin} WIB). Batas waktu ${settings.checkInDeadline} WIB.`
          : `Presensi Masuk BERHASIL: ${student.name} (${currentHourMin} WIB). Tepat waktu!`,
        student,
        record: newRecord,
        isLate,
      };
    } else {
      // Presensi Pulang
      if (existingIndex >= 0) {
        const existing = records[existingIndex];
        const updatedRecord: AttendanceRecord = {
          ...existing,
          checkOutTime: currentTimeStr,
        };
        const updated = [...records];
        updated[existingIndex] = updatedRecord;
        setRecords(updated);
        setRecentScans((prev) => [updatedRecord, ...prev.slice(0, 19)]);

        if (settings.soundAlert) soundFx.playSuccess();

        return {
          success: true,
          message: `Presensi PULANG tercatat: ${student.name} (${currentTimeStr} WIB). Selamat beristirahat!`,
          student,
          record: updatedRecord,
        };
      } else {
        // Student didn't check in this morning but is checking out
        const newRecord: AttendanceRecord = {
          id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: student.id,
          studentNisn: student.nisn,
          studentName: student.name,
          grade: student.grade,
          date: today,
          checkOutTime: currentTimeStr,
          status: 'Hadir',
          scanType: 'Pulang',
          source,
          notes: 'Langsung presensi pulang',
        };
        setRecords((prev) => [newRecord, ...prev]);
        setRecentScans((prev) => [newRecord, ...prev.slice(0, 19)]);

        if (settings.soundAlert) soundFx.playSuccess();

        return {
          success: true,
          message: `Presensi PULANG langsung tercatat: ${student.name} (${currentTimeStr} WIB).`,
          student,
          record: newRecord,
        };
      }
    }
  };

  // Manual marking (e.g. Guru marks student Sakit / Izin / Alpa)
  const markManualAttendance = (
    studentId: string,
    date: string,
    status: AttendanceStatus,
    notes?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setRecords((prev) => {
      const existingIdx = prev.findIndex((r) => r.studentId === studentId && r.date === date);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          status,
          notes: notes !== undefined ? notes : copy[existingIdx].notes,
          source: 'Manual Petugas',
        };
        return copy;
      } else {
        const newRecord: AttendanceRecord = {
          id: `REC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          studentId: student.id,
          studentNisn: student.nisn,
          studentName: student.name,
          grade: student.grade,
          date,
          status,
          scanType: 'Masuk',
          notes,
          source: 'Manual Petugas',
        };
        return [newRecord, ...prev];
      }
    });
  };

  // Add student
  const addStudent = (studentData: Omit<Student, 'id'>): Student => {
    const newStudent: Student = {
      ...studentData,
      id: `STU-${String(students.length + 1).padStart(3, '0')}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    return newStudent;
  };

  // Update student
  const updateStudent = (updatedStudent: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s))
    );
    // Also update any records cached with old name
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === updatedStudent.id
          ? {
              ...r,
              studentName: updatedStudent.name,
              studentNisn: updatedStudent.nisn,
              grade: updatedStudent.grade,
            }
          : r
      )
    );
  };

  // Delete student
  const deleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  // Update settings
  const updateSettings = (newSettings: SchoolSettings) => {
    setSettings(newSettings);
  };

  // Reset to default
  const resetToDefaultData = () => {
    setStudents(initialStudents);
    setSettings(initialSchoolSettings);
    const today = getTodayDateString();
    setRecords(getInitialAttendanceRecords(today));
    setRecentScans([]);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.RECORDS);
  };

  // Simulation feature for demonstration: pick a student who hasn't checked in yet today and scan them
  const simulateRealtimeScan = (): ScanResult | null => {
    const today = getTodayDateString();
    const todayRecordedIds = new Set(
      records.filter((r) => r.date === today && r.checkInTime).map((r) => r.studentId)
    );
    const unrecorded = students.filter((s) => !todayRecordedIds.has(s.id));

    if (unrecorded.length === 0) {
      // Pick any student for demonstration
      const randomStudent = students[Math.floor(Math.random() * students.length)];
      return processScan(randomStudent.nisn, 'Masuk', 'Kamera QR');
    }

    const nextStudent = unrecorded[Math.floor(Math.random() * unrecorded.length)];
    return processScan(nextStudent.nisn, 'Masuk', 'Kamera QR');
  };

  return (
    <AttendanceContext.Provider
      value={{
        students,
        records,
        settings,
        selectedDate,
        setSelectedDate,
        recentScans,
        processScan,
        markManualAttendance,
        addStudent,
        updateStudent,
        deleteStudent,
        updateSettings,
        resetToDefaultData,
        simulateRealtimeScan,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = (): AttendanceContextType => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
