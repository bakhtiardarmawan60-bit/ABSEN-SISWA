export type AttendanceStatus = 'Hadir' | 'Terlambat' | 'Izin' | 'Sakit' | 'Alpa';
export type ScanType = 'Masuk' | 'Pulang';

export interface Student {
  id: string;
  nisn: string;
  nis: string;
  name: string;
  gender: 'L' | 'P';
  grade: string; // '1A', '1B', '2', '3', '4', '5', '6'
  parentName: string;
  parentPhone: string;
  address: string;
  photoUrl?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentNisn: string;
  studentName: string;
  grade: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  scanType: ScanType;
  notes?: string;
  source: 'Kamera QR' | 'Upload Gambar' | 'Manual Petugas';
}

export interface SchoolSettings {
  schoolName: string;
  npsn: string;
  address: string;
  district: string;
  regency: string;
  province: string;
  headmaster: string;
  nipHeadmaster: string;
  academicYear: string;
  semester: string;
  checkInStart: string; // e.g. "06:15"
  checkInDeadline: string; // e.g. "07:00" - if later, marked 'Terlambat'
  checkInEnd: string; // e.g. "08:00"
  checkOutStart: string; // e.g. "12:15"
  soundAlert: boolean;
}
