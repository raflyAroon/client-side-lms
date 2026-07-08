'use client';

import { useEffect, useState } from 'react';
import { adminService } from '@/services/adminService';
import { TeamDocumentsModalProps } from '@/types/team';

export default function TeamDocumentsModal({
  teamId,
  isOpen,
  onClose,
  onTeamUpdated,
}: TeamDocumentsModalProps) {
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && teamId) {
      loadTeam();
    }
  }, [isOpen, teamId]);

  const loadTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.showTeam(teamId);
      setTeam(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin menyetujui tim ini?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminService.approveTeam(teamId, note);
      onTeamUpdated();
      await loadTeam(); // Refresh data
      alert('✅ Tim berhasil disetujui!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal approve tim');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Apakah Anda yakin ingin menolak tim ini?')) return;
    if (!note.trim()) {
      setError('Catatan penolakan wajib diisi');
      return;
    }
    setActionLoading(true);
    setError(null);
    try {
      await adminService.rejectTeam(teamId, note);
      onTeamUpdated();
      await loadTeam(); // Refresh data
      alert('❌ Tim berhasil ditolak!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal reject tim');
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                {loading ? 'Memuat...' : `Dokumen Tim: ${team?.team_name || ''}`}
              </h3>
              {team && (
                <p className="text-sm text-gray-500">
                  ID: #{team.id} · Status: <span className="font-medium">{team.selection_status}</span>
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 max-h-[calc(90vh-140px)]">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">{error}</div>
            ) : team ? (
              <div className="space-y-6">
                {/* Informasi Tim */}
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Ketua Tim</p>
                    <p className="font-medium">{team.ketua?.name || '-'}</p>
                    <p className="text-sm text-gray-500">{team.ketua?.email || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Institusi</p>
                    <p className="font-medium">{team.institution || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Kota</p>
                    <p className="font-medium">{team.city || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Anggota</p>
                    <p className="font-medium">{team.members?.length || 0} orang</p>
                  </div>
                </div>

                {/* Daftar Dokumen */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>📎</span> Dokumen yang Diupload
                  </h4>
                  {team.documents && team.documents.length > 0 ? (
                    <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg">
                      {team.documents.map((doc: any) => (
                        <li key={doc.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {doc.type.includes('ktm') ? '🪪' :
                               doc.type.includes('video') ? '🎥' :
                               doc.type.includes('hak') ? '©️' :
                               doc.type.includes('komitmen') ? '📄' :
                               doc.type.includes('rekomendasi') ? '📩' :
                               doc.type.includes('summary') ? '📝' : '📄'}
                            </span>
                            <div>
                              <p className="font-medium text-gray-800">{doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                              <p className="text-sm text-gray-500">{doc.file_name || 'Nama file tidak tersedia'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Lihat File
                              </a>
                            )}
                            {doc.external_link && (
                              <a
                                href={doc.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Buka Link
                              </a>
                            )}
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                doc.is_verified
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {doc.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm bg-gray-50 p-4 rounded-lg text-center">
                      Tidak ada dokumen yang diupload
                    </p>
                  )}
                </div>

                {/* Anggota Tim */}
                {team.members && team.members.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>👤</span> Anggota Tim
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {team.members.map((member: any) => (
                        <div key={member.id} className="border border-gray-200 rounded-lg p-3">
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.position}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          {member.nim && <p className="text-sm text-gray-500">NIM: {member.nim}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Aksi Approve/Reject */}
                {team.selection_status === 'pending' && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Proses Seleksi</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catatan <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tambahkan catatan (wajib untuk penolakan)"
                        />
                      </div>
                      {error && <p className="text-sm text-red-600">{error}</p>}
                      <div className="flex gap-3">
                        <button
                          onClick={handleApprove}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {actionLoading ? 'Memproses...' : '✅ Setujui'}
                        </button>
                        <button
                          onClick={handleReject}
                          disabled={actionLoading}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                          {actionLoading ? 'Memproses...' : '❌ Tolak'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}