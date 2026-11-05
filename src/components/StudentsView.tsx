import React, { useState, useMemo } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Student } from '../types';
import { StudentIdCard } from './StudentIdCard';
import {
  UserPlus,
  Search,
  Filter,
  CreditCard,
  Printer,
  Download,
  Trash2,
  Edit2,
  X,
  FileSpreadsheet,
  Check,
  School,
} from 'lucide-react';

export const StudentsView: React.FC = () => {
  const { students, addStudent, updateStudent, deleteStudent, settings } = useAttendance();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Semua');
  const [selectedGender, setSelectedGender] = useState('Semua');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingCardStudent, setViewingCardStudent] = useState<Student | null>(null);
  const [isBatchPrintModalOpen, setIsBatchPrintModalOpen] = useState(false);
  const [batchGradeFilter, setBatchGradeFilter] = useState('Semua');

  // New Student Form State
  const [formData, setFormData] = useState({
    name: '',
    nisn: '',
    nis: '',
    grade: '1A',
    gender: 'L' as 'L' | 'P',
    parentName: '',
    parentPhone: '',
    address: '',
  });

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGrade = selectedGrade === 'Semua' || s.grade === selectedGrade;
      const matchGender = selectedGender === 'Semua' || s.gender === selectedGender;
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery) ||
        s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchGender && matchSearch;
    });
  }, [students, selectedGrade, selectedGender, searchQuery]);

  // Batch Print Students
  const batchStudents = useMemo(() => {
    if (batchGradeFilter === 'Semua') return students;
    return students.filter((s) => s.grade === batchGradeFilter);
  }, [students, batchGradeFilter]);

  // Handle Add Student Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.nisn) return;

    addStudent({
      ...formData,
      nis: formData.nis || `24${Math.floor(Math.random() * 9000 + 1000)}`,
    });

    setIsAddModalOpen(false);
    setFormData({
      name: '',
      nisn: '',
      nis: '',
      grade: '1A',
      gender: 'L',
      parentName: '',
      parentPhone: '',
      address: '',
    });
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    updateStudent(editingStudent);
    setEditingStudent(null);
  };

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['ID', 'NISN', 'NIS', 'Nama Murid', 'Jenis Kelamin', 'Kelas', 'Wali Murid', 'No HP Wali', 'Alamat'];
    const rows = filteredStudents.map((s) => [
      s.id,
      `"${s.nisn}"`,
      `"${s.nis}"`,
      `"${s.name}"`,
      s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      s.grade,
      `"${s.parentName}"`,
      `"${s.parentPhone}"`,
      `"${s.address}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Data_Siswa_SDN_Pasrujambe_01_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>DATABASE POKOK PENDIDIKAN</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-700 font-semibold">{settings.schoolName}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Data Murid & Generator Kartu QR
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola data master murid, unduh kode QR presensi, serta cetak kartu pelajar resmi ukuran standar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              Ekspor CSV
            </button>

            <button
              type="button"
              onClick={() => setIsBatchPrintModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Cetak Massal Kartu QR
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-2xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Tambah Murid Baru
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari nama, NISN, atau orang tua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-1.5 pl-7 pr-3 border border-slate-300 rounded-lg w-56 text-xs bg-slate-50 focus:bg-white focus:outline-emerald-600"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Kelas:</span>
              <select
                value={selectedGrade}
                onChange={(e) => setSelectedGrade(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700"
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

            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-medium">Gender:</span>
              <select
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="py-1 px-2 border border-slate-300 rounded-lg bg-slate-50 font-medium text-slate-700"
              >
                <option value="Semua">Semua</option>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>

          <span className="text-slate-500">
            Menampilkan <strong className="text-slate-800">{filteredStudents.length}</strong> murid
          </span>
        </div>
      </div>

      {/* Student List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-4 w-12 text-center">No</th>
                <th className="py-2.5 px-4">Nama Lengkap Murid</th>
                <th className="py-2.5 px-4">NISN / NIS</th>
                <th className="py-2.5 px-4">Kelas</th>
                <th className="py-2.5 px-4">L/P</th>
                <th className="py-2.5 px-4">Wali Murid</th>
                <th className="py-2.5 px-4">No. HP / WA</th>
                <th className="py-2.5 px-4">Alamat Domisili</th>
                <th className="py-2.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, idx) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-2.5 px-4 text-center text-slate-400 font-mono tabular-nums">
                      {idx + 1}
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">
                      {student.name}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                      <span>{student.nisn}</span>
                      <span className="block text-[10px] text-slate-400 font-sans">
                        NIS: {student.nis}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-emerald-800">
                      Kelas {student.grade}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-600">
                      {student.gender === 'L' ? 'L' : 'P'}
                    </td>
                    <td className="py-2.5 px-4 text-slate-700">
                      {student.parentName}
                    </td>
                    <td className="py-2.5 px-4 font-mono tabular-nums text-slate-600">
                      {student.parentPhone}
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] max-w-[180px] truncate">
                      {student.address}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingCardStudent(student)}
                          title="Lihat / Cetak Kartu Pelajar QR"
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded border border-emerald-200 transition-colors"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingStudent(student)}
                          title="Edit Siswa"
                          className="p-1.5 text-slate-700 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Yakin ingin menghapus ${student.name}?`)) {
                              deleteStudent(student.id);
                            }
                          }}
                          title="Hapus Siswa"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Tidak ada siswa yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Student Card Preview Modal */}
      {viewingCardStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-md w-full shadow-xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              type="button"
              onClick={() => setViewingCardStudent(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1 text-center">
              Pratinjau Kartu Murid QR
            </h3>
            <p className="text-xs text-slate-500 mb-4 text-center">
              Dapat dicetak langsung pada kertas kartu / foto atau diunduh untuk dibagikan ke wali murid.
            </p>

            <StudentIdCard
              student={viewingCardStudent}
              onClose={() => setViewingCardStudent(null)}
            />
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-base">
                Tambah Data Murid Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Murid *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Muhammad Bintang Pratama"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NISN (10 Digit) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 0165849999"
                    value={formData.nisn}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NIS Lokal
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 240120"
                    value={formData.nis}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelas / Rombel *
                  </label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  >
                    <option value="1A">Kelas 1A</option>
                    <option value="1B">Kelas 1B</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Orang Tua / Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Sugiono"
                    value={formData.parentName}
                    onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. HP / WhatsApp Wali
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 081234567890"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alamat Tempat Tinggal
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Dusun Krajan RT 01, Desa Pasrujambe"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 shadow-2xs"
                >
                  Simpan & Buat QR Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Edit Data Murid</h3>
              <button
                type="button"
                onClick={() => setEditingStudent(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Lengkap Murid *
                </label>
                <input
                  type="text"
                  required
                  value={editingStudent.name}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, name: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NISN *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.nisn}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, nisn: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    NIS
                  </label>
                  <input
                    type="text"
                    value={editingStudent.nis}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, nis: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Kelas *
                  </label>
                  <select
                    value={editingStudent.grade}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, grade: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  >
                    <option value="1A">Kelas 1A</option>
                    <option value="1B">Kelas 1B</option>
                    <option value="2">Kelas 2</option>
                    <option value="3">Kelas 3</option>
                    <option value="4">Kelas 4</option>
                    <option value="5">Kelas 5</option>
                    <option value="6">Kelas 6</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Jenis Kelamin *
                  </label>
                  <select
                    value={editingStudent.gender}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        gender: e.target.value as 'L' | 'P',
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Wali
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parentName}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, parentName: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    No. Telepon / WA Wali
                  </label>
                  <input
                    type="text"
                    value={editingStudent.parentPhone}
                    onChange={(e) =>
                      setEditingStudent({ ...editingStudent, parentPhone: e.target.value })
                    }
                    className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Alamat Domisili
                </label>
                <input
                  type="text"
                  value={editingStudent.address}
                  onChange={(e) =>
                    setEditingStudent({ ...editingStudent, address: e.target.value })
                  }
                  className="w-full p-2 border border-slate-300 rounded-lg focus:outline-emerald-600 text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 shadow-2xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Print Modal (Formatted for printing multiple ID cards on paper) */}
      {isBatchPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto p-4 sm:p-6 flex flex-col items-center">
          <div className="bg-white rounded-xl border border-slate-300 w-full max-w-4xl p-6 shadow-2xl relative my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4 no-print">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Cetak Massal Kartu Presensi QR
                </h3>
                <p className="text-xs text-slate-500">
                  Total {batchStudents.length} kartu siap dicetak pada format lembar A4.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={batchGradeFilter}
                  onChange={(e) => setBatchGradeFilter(e.target.value)}
                  className="text-xs p-1.5 border border-slate-300 rounded-lg bg-slate-50 font-medium"
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

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Cetak Sekarang
                </button>

                <button
                  type="button"
                  onClick={() => setIsBatchPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto p-2 print:overflow-visible print:max-h-none print:grid-cols-2">
              {batchStudents.map((st) => (
                <div key={st.id} className="p-1 break-inside-avoid">
                  <StudentIdCard student={st} showActions={false} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
