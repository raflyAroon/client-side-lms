'use client';

import { useState, useCallback } from 'react';
import { useAuditLog } from '@/hooks/useAuditLog';

export default function ManageAuditLogPage() {
  const { logs, pagination, loading, fetchLogs, rollback } = useAuditLog();
  const [selectedLog, setSelectedLog] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rollbacking, setRollbacking] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleViewDiff = (log: any) => {
    setSelectedLog(log);
    setIsModalOpen(true);
    setActionError(null);
  };

  const handleRollback = async (logId: number) => {
    if (!confirm('Yakin akan melakukan rollback ke data sebelumnya?')) return;
    
    setRollbacking(logId);
    setActionError(null);
    try {
      await rollback(logId);
      alert('✅ Rollback berhasil! Data telah dikembalikan ke versi sebelumnya.');
      // Refresh data
      await fetchLogs(pagination.currentPage);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Gagal melakukan rollback');
      alert('❌ Gagal rollback: ' + (err.response?.data?.message || 'Terjadi kesalahan'));
    } finally {
      setRollbacking(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
    setActionError(null);
  };

  // Format JSON with syntax highlighting
  const formatJSON = (data: any) => {
    if (!data) return 'null';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Check if old and new values are different
  const hasChanges = (log: any) => {
    if (!log.old_value_json || !log.new_value_json) return false;
    return JSON.stringify(log.old_value_json) !== JSON.stringify(log.new_value_json);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Manage Audit Log</h2>
          <p className="text-sm text-gray-500 mt-1">
            Melacak semua aktivitas perubahan data di sistem
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            Total {pagination.total} log
          </span>
          <button
            onClick={() => fetchLogs(1)}
            disabled={loading}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-400 text-red-800 rounded-md p-4 mb-4">
          <p className="text-sm">{actionError}</p>
        </div>
      )}

      {/* Tabel Audit Log */}
      {loading ? (
        <div className="flex justify-center py-16 bg-white rounded-lg shadow">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-3 text-gray-500">Memuat data audit log...</p>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-16 text-center">
          <span className="text-6xl block mb-4">📋</span>
          <p className="text-gray-500 text-lg">Belum ada aktivitas yang tercatat</p>
          <p className="text-gray-400 text-sm mt-1">Audit log akan muncul saat ada perubahan data</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengguna
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entitas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Entitas
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perubahan
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map((log) => {
                    const hasDiff = hasChanges(log);
                    const isRollbacking = rollbacking === log.id;
                    const isRollbackAction = log.action === 'rollback';

                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          isRollbackAction ? 'bg-purple-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                              {log.user?.name?.charAt(0)?.toUpperCase() || 'S'}
                            </div>
                            <span className="font-medium text-gray-800">
                              {log.user?.name || 'Sistem'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              log.action === 'create'
                                ? 'bg-green-100 text-green-800'
                                : log.action === 'update'
                                ? 'bg-blue-100 text-blue-800'
                                : log.action === 'delete'
                                ? 'bg-red-100 text-red-800'
                                : log.action === 'rollback'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {log.action}
                          </span>
                          {isRollbackAction && (
                            <span className="ml-1 text-xs text-purple-600 font-medium">
                              (restore)
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                            {log.entity_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-500">
                          #{log.entity_id}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {log.old_value_json && log.new_value_json ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium ${
                                hasDiff ? 'text-orange-600' : 'text-gray-400'
                              }`}
                            >
                              {hasDiff ? (
                                <>
                                  <span className="text-red-500">●</span>
                                  Ada perubahan
                                </>
                              ) : (
                                <>
                                  <span className="text-gray-400">●</span>
                                  Tidak ada perubahan
                                </>
                              )}
                            </span>
                          ) : log.old_value_json && !log.new_value_json ? (
                            <span className="text-xs text-red-600 font-medium">
                              ⚠️ Data dihapus
                            </span>
                          ) : !log.old_value_json && log.new_value_json ? (
                            <span className="text-xs text-green-600 font-medium">
                              ✨ Data baru
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-2">
                            {/* Tombol Lihat Perubahan */}
                            {log.old_value_json && log.new_value_json && (
                              <button
                                onClick={() => handleViewDiff(log)}
                                className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Lihat
                              </button>
                            )}

                            {/* Tombol Rollback */}
                            {log.old_value_json && log.action !== 'rollback' && (
                              <button
                                onClick={() => handleRollback(log.id)}
                                disabled={isRollbacking}
                                className={`text-orange-600 hover:text-orange-800 transition-colors flex items-center gap-1 ${
                                  isRollbacking ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                              >
                                {isRollbacking ? (
                                  <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Memproses...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Rollback
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.lastPage > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                <span className="text-sm text-gray-600">
                  Menampilkan halaman {pagination.currentPage} dari {pagination.lastPage}
                  <span className="ml-2 text-gray-400">
                    (Total {pagination.total} log)
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchLogs(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1 || loading}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    ← Sebelumnya
                  </button>
                  <button
                    onClick={() => fetchLogs(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.lastPage || loading}
                    className="px-3 py-1.5 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Selanjutnya →
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal Diff */}
      {isModalOpen && selectedLog && (
        <DiffModal
          log={selectedLog}
          onClose={handleCloseModal}
          onRollback={() => {
            handleCloseModal();
            handleRollback(selectedLog.id);
          }}
          isRollbacking={rollbacking === selectedLog.id}
        />
      )}
    </div>
  );
}

// ============================================================
// DIFF MODAL COMPONENT
// ============================================================
interface DiffModalProps {
  log: any;
  onClose: () => void;
  onRollback: () => void;
  isRollbacking: boolean;
}

function DiffModal({ log, onClose, onRollback, isRollbacking }: DiffModalProps) {
  const [showRaw, setShowRaw] = useState(false);

  // Format JSON dengan highlight
  const formatJSON = (data: any): string => {
    if (!data) return 'null';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  // Cek perbedaan antar objek
  const getDiffKeys = (oldData: any, newData: any) => {
    if (!oldData || !newData) return [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);
    const diff: Array<{ key: string; old: any; new: any; changed: boolean }> = [];
    
    allKeys.forEach((key) => {
      const oldVal = oldData[key];
      const newVal = newData[key];
      const changed = JSON.stringify(oldVal) !== JSON.stringify(newVal);
      diff.push({ key, old: oldVal, new: newVal, changed });
    });
    
    return diff;
  };

  const diffKeys = getDiffKeys(log.old_value_json || {}, log.new_value_json || {});

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-60 transition-opacity" onClick={onClose}></div>

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <span>📊</span> Detail Perubahan Data
              </h3>
              <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                <span>
                  Entitas: <strong className="text-gray-700">{log.entity_type}</strong>
                </span>
                <span>
                  ID: <strong className="text-gray-700">#{log.entity_id}</strong>
                </span>
                <span>
                  Aksi: <strong className="text-gray-700">{log.action}</strong>
                </span>
                <span>
                  Waktu: <strong className="text-gray-700">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </strong>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                {showRaw ? 'Tampilan Ringkas' : 'Tampilan JSON'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="overflow-y-auto p-6 max-h-[calc(92vh-180px)]">
            {showRaw ? (
              // Tampilan JSON
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    Sebelum (Old)
                  </h4>
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-[500px] font-mono">
                    {formatJSON(log.old_value_json)}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    Sesudah (New)
                  </h4>
                  <pre className="text-xs bg-gray-50 p-4 rounded-lg border border-gray-200 overflow-auto max-h-[500px] font-mono">
                    {formatJSON(log.new_value_json)}
                  </pre>
                </div>
              </div>
            ) : (
              // Tampilan Diff per field
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-200 border border-red-400"></span>
                    Old
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-200 border border-green-400"></span>
                    New
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-200 border border-yellow-400"></span>
                    Berubah
                  </span>
                </div>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/4">
                          Field
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                          Sebelum
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-1/3">
                          Sesudah
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-16 text-center">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {diffKeys.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            Tidak ada data untuk dibandingkan
                          </td>
                        </tr>
                      ) : (
                        diffKeys.map((item) => (
                          <tr
                            key={item.key}
                            className={`hover:bg-gray-50 transition-colors ${
                              item.changed ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <td className="px-4 py-2 text-sm font-medium text-gray-800">
                              <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {item.key}
                              </code>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={item.changed ? 'text-red-600' : 'text-gray-500'}>
                                {item.old !== undefined && item.old !== null
                                  ? typeof item.old === 'object'
                                    ? JSON.stringify(item.old)
                                    : String(item.old)
                                  : '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm">
                              <span className={item.changed ? 'text-green-600' : 'text-gray-500'}>
                                {item.new !== undefined && item.new !== null
                                  ? typeof item.new === 'object'
                                    ? JSON.stringify(item.new)
                                    : String(item.new)
                                  : '-'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm text-center">
                              {item.changed ? (
                                <span className="inline-flex items-center gap-1 text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                  Berubah
                                </span>
                              ) : (
                                <span className="text-gray-400 text-xs">Sama</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {log.action === 'rollback'
                ? '⚠️ Ini adalah rollback dari perubahan sebelumnya'
                : `${diffKeys.filter(k => k.changed).length} field berubah`}
            </div>
            <div className="flex gap-3">
              {log.old_value_json && log.action !== 'rollback' && (
                <button
                  onClick={() => {
                    if (confirm('Yakin akan melakukan rollback ke versi sebelumnya?')) {
                      onRollback();
                    }
                  }}
                  disabled={isRollbacking}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {isRollbacking ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Rollback
                    </>
                  )}
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}