'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminService } from '@/services/adminService';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/admin/navbar';

// ===== Design System Tokens =====
const COLORS = {
  canvas: '#f5f5f5',
  canvasSoft: '#fafafa',
  ink: '#0c0a09',
  body: '#4e4e4e',
  muted: '#777169',
  mutedSoft: '#a8a29e',
  surfaceCard: '#ffffff',
  surfaceStrong: '#f0efed',
  hairline: '#e7e5e4',
  hairlineSoft: '#f0efed',
  hairlineStrong: '#d6d3d1',
  primary: '#292524',
  onPrimary: '#ffffff',
};

// ===== Helper untuk badge =====
function getStatusBadge(status: string) {
  if (status === 'rejected') {
    return {
      label: 'Ditolak',
      color: COLORS.mutedSoft,
      bg: COLORS.canvas,
    };
  }
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    lolos_seleksi: 'Lolos Seleksi',
    follow_the_bootcamp: 'Bootcamp',
    first_half_hackathon: 'First Half',
    semi_final: 'Semi Final',
    final: 'Final',
  };
  return {
    label: labels[status] || status,
    color: COLORS.ink,
    bg: COLORS.surfaceStrong,
  };
}

export default function TeamDocumentsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollPct(Math.min((window.scrollY / h) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.showTeam(Number(id));
      setTeam(res.data);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal memuat data tim');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirm('Apakah Anda yakin ingin menyetujui tim ini?')) return;
    setActionLoading(true);
    setError(null);
    try {
      await adminService.approveTeam(Number(id), note);
      alert('✅ Tim berhasil disetujui!');
      await loadTeam();
      setNote('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal approve tim');
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
      await adminService.rejectTeam(Number(id), note);
      alert('❌ Tim berhasil ditolak!');
      await loadTeam();
      setNote('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Gagal reject tim');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          scrolled={scrolled}
          scrollPercent={scrollPct}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          showQuickActions={true}
          roleLabel="Admin"
        />
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Memuat data...</p>
        </div>
      </>
    );
  }

  if (error || !team) {
    return (
      <>
        <Navbar
          user={user}
          onLogout={handleLogout}
          scrolled={scrolled}
          scrollPercent={scrollPct}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          showQuickActions={true}
          roleLabel="Admin"
        />
        <div className="error-state">
          <p>{error || 'Tim tidak ditemukan'}</p>
          <Link href="/admin/team-participant" className="btn-back">
            ← Kembali ke Team Participant
          </Link>
        </div>
      </>
    );
  }

  const statusBadge = getStatusBadge(team.selection_status);

  return (
    <div className="admin-doc-page">
      <Navbar
        user={user}
        onLogout={handleLogout}
        scrolled={scrolled}
        scrollPercent={scrollPct}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        showQuickActions={true}
        roleLabel="Admin"
      />

      {/* Hero – compact */}
      <div className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Admin Panel · Empat Pilar MPR RI</span>
          <h1>{team.team_name}</h1>
          <p>
            ID: #{team.id} · Status:{' '}
            <span
              className="status-badge"
              style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
            >
              <span className="status-dot" style={{ background: statusBadge.color }} />
              {statusBadge.label}
            </span>
          </p>
        </div>
      </div>

      {/* Action bar – back button */}
      <div className="action-bar">
        <Link href="/admin/team-participant" className="btn-back">
          ← Kembali ke Team Participant
        </Link>
      </div>

      {/* Kartu Informasi Tim + Anggota – 1 row horizontal dengan konten di tengah */}
      <div className="panel panel-team">
        <div className="team-info-row">
          {/* Kiri: Informasi Tim */}
          <div className="team-info-left">
            <h3 className="panel-title">📋 Informasi Tim</h3>
            <div className="info-row-horizontal">
              <div className="info-item">
                <p className="info-label">Institusi</p>
                <p className="info-value">{team.institution || '-'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Kota</p>
                <p className="info-value">{team.city || '-'}</p>
              </div>
              <div className="info-item">
                <p className="info-label">Anggota</p>
                <p className="info-value">{team.members?.length || 0} orang</p>
              </div>
            </div>
          </div>

          {/* Kanan: Anggota Tim */}
          <div className="team-info-right">
            <h3 className="panel-title">👥 Anggota Tim</h3>
            {team.members && team.members.length > 0 ? (
              <div className="members-row">
                {team.members.map((member: any) => (
                  <div key={member.id} className="member-card-horizontal">
                    <p className="member-name">{member.name}</p>
                    <p className="member-role">{member.position}</p>
                    <p className="member-email">{member.email}</p>
                    {member.nim && <p className="member-nim">NIM: {member.nim}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-text-small">Tidak ada anggota</p>
            )}
          </div>
        </div>
      </div>

      {/* Kartu Dokumen – 2 column grid dengan card */}
      <div className="panel">
        <h3 className="panel-title">📎 Dokumen yang Diupload</h3>
        {team.documents && team.documents.length > 0 ? (
          <div className="doc-grid">
            {team.documents.map((doc: any) => (
              <div key={doc.id} className="doc-card">
                <div className="doc-card-icon">
                  {doc.type.includes('ktm') ? '🪪' :
                   doc.type.includes('video') ? '🎥' :
                   doc.type.includes('hak') ? '©️' :
                   doc.type.includes('komitmen') ? '📄' :
                   doc.type.includes('rekomendasi') ? '📩' :
                   doc.type.includes('summary') ? '📝' : '📄'}
                </div>
                <div className="doc-card-body">
                  <p className="doc-card-name">{doc.type.replace(/_/g, ' ').toUpperCase()}</p>
                  <p className="doc-card-filename">{doc.file_name || 'Nama file tidak tersedia'}</p>
                  <div className="doc-card-actions">
                    {doc.file_url && (
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        Lihat File
                      </a>
                    )}
                    {doc.external_link && (
                      <a
                        href={doc.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="doc-link"
                      >
                        Buka Link
                      </a>
                    )}
                    <span
                      className={`doc-verified ${doc.is_verified ? 'verified' : 'unverified'}`}
                    >
                      {doc.is_verified ? 'Terverifikasi' : 'Belum Verifikasi'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-text">Tidak ada dokumen yang diupload</p>
        )}
      </div>

      {/* Aksi Approve/Reject – compact */}
      {team.selection_status === 'pending' && (
        <div className="panel">
          <h3 className="panel-title">⚡ Proses Seleksi</h3>
          <div className="action-form">
            <div>
              <label className="form-label">
                Catatan <span className="required">*</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                className="form-textarea"
                placeholder="Tambahkan catatan (wajib untuk penolakan)"
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="action-buttons">
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="btn-primary"
              >
                {actionLoading ? 'Memproses...' : '✅ Setujui'}
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading}
                className="btn-outline"
              >
                {actionLoading ? 'Memproses...' : '❌ Tolak'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        /* ---------- Base ---------- */
        .admin-doc-page {
          background: #f5f5f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c0a09;
          padding: 0 0 32px 0;
        }

        /* ---------- Loading ---------- */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 14px;
        }
        .loading-spinner {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid #e7e5e4;
          border-top-color: #292524;
          animation: spin 0.85s linear infinite;
        }
        .loading-state p {
          margin: 0;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.15px;
          color: #777169;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          .loading-spinner { animation: none; }
        }

        /* ---------- Error ---------- */
        .error-state {
          max-width: 600px;
          margin: 40px auto;
          text-align: center;
          padding: 28px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e7e5e4;
        }
        .error-state p {
          font-size: 15px;
          color: #4e4e4e;
          margin-bottom: 16px;
        }

        /* ---------- Hero ---------- */
        .hero {
          background: #f5f5f5;
          padding: 32px 32px 20px;
          text-align: center;
        }
        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }
        .hero-eyebrow {
          display: inline-block;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.96px;
          text-transform: uppercase;
          color: #777169;
          background: #f0efed;
          padding: 2px 10px;
          border-radius: 9999px;
          margin-bottom: 12px;
        }
        .hero h1 {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 34px;
          line-height: 1.08;
          letter-spacing: -0.96px;
          color: #0c0a09;
          margin: 0 0 4px 0;
        }
        .hero p {
          font-size: 14px;
          line-height: 1.5;
          letter-spacing: 0.15px;
          color: #4e4e4e;
          max-width: 540px;
          margin: 0 auto;
        }

        /* ---------- Status Badge ---------- */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 11px;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .status-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ---------- Action Bar ---------- */
        .action-bar {
          max-width: 1200px;
          margin: 0 auto 16px;
          padding: 0 32px;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          color: #777169;
          padding: 6px 14px;
          border: 1px solid #e7e5e4;
          border-radius: 9999px;
          background: #ffffff;
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
          white-space: nowrap;
        }
        .btn-back:hover {
          background: #f0efed;
          color: #0c0a09;
          border-color: #d6d3d1;
        }

        /* ---------- Panel ---------- */
        .panel {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 20px 16px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          max-width: 1200px;
          margin: 0 auto 14px;
        }
        .panel-title {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 18px;
          line-height: 1.2;
          letter-spacing: 0;
          color: #0c0a09;
          margin: 0 0 10px 0;
          text-align: center;
        }

        /* ---------- Team Info Row – 1 baris horizontal ---------- */
        .panel-team {
          padding: 16px 20px;
        }
        .team-info-row {
          display: flex;
          gap: 24px;
          align-items: stretch;
        }

        /* Kiri: Informasi Tim – konten di tengah */
        .team-info-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding-right: 24px;
          border-right: 1px solid #f0efed;
        }
        .team-info-left .panel-title {
          text-align: center;
        }

        .info-row-horizontal {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px 32px;
          flex: 1;
          align-items: center;
        }
        .info-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .info-label {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15px;
          text-transform: uppercase;
          color: #a8a29e;
          margin: 0 0 1px 0;
        }
        .info-value {
          font-size: 14px;
          font-weight: 500;
          color: #0c0a09;
          margin: 0;
        }

        /* Kanan: Anggota Tim – konten di tengah */
        .team-info-right {
          flex: 1.5;
          display: flex;
          flex-direction: column;
        }
        .team-info-right .panel-title {
          text-align: center;
        }

        .members-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          flex: 1;
          align-items: center;
        }
        .member-card-horizontal {
          background: #fafafa;
          border: 1px solid #f0efed;
          border-radius: 8px;
          padding: 8px 14px;
          min-width: 160px;
          flex: 0 1 auto;
          text-align: center;
        }
        .member-name {
          font-weight: 500;
          font-size: 13px;
          color: #0c0a09;
          margin: 0 0 1px 0;
        }
        .member-role {
          font-size: 11px;
          color: #777169;
          margin: 0;
        }
        .member-email {
          font-size: 11px;
          color: #4e4e4e;
          margin: 1px 0 0 0;
        }
        .member-nim {
          font-size: 11px;
          color: #a8a29e;
          margin: 1px 0 0 0;
        }

        .empty-text-small {
          font-size: 13px;
          color: #a8a29e;
          margin: 0;
          text-align: center;
          width: 100%;
        }

        /* ---------- Dokumen Grid – 2 kolom ---------- */
        .doc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .doc-card {
          background: #fafafa;
          border: 1px solid #f0efed;
          border-radius: 10px;
          padding: 14px 16px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          transition: background 0.12s ease;
        }
        .doc-card:hover {
          background: #f5f5f5;
        }
        .doc-card-icon {
          font-size: 28px;
          flex-shrink: 0;
          line-height: 1;
        }
        .doc-card-body {
          flex: 1;
          min-width: 0;
        }
        .doc-card-name {
          font-weight: 500;
          font-size: 13px;
          color: #0c0a09;
          margin: 0 0 2px 0;
        }
        .doc-card-filename {
          font-size: 12px;
          color: #4e4e4e;
          margin: 0 0 8px 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .doc-card-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }
        .doc-link {
          font-size: 11px;
          font-weight: 500;
          color: #292524;
          background: #e7e5e4;
          padding: 3px 10px;
          border-radius: 9999px;
          text-decoration: none;
          transition: background 0.12s ease;
          white-space: nowrap;
        }
        .doc-link:hover {
          background: #d6d3d1;
        }
        .doc-verified {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .doc-verified.verified {
          background: #e7e5e4;
          color: #292524;
        }
        .doc-verified.unverified {
          background: #f5f5f5;
          color: #a8a29e;
        }

        .empty-text {
          text-align: center;
          color: #a8a29e;
          font-size: 13px;
          letter-spacing: 0.15px;
          padding: 12px 0;
          margin: 0;
        }

        /* ---------- Action Form ---------- */
        .action-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 500;
          color: #0c0a09;
          margin-bottom: 3px;
        }
        .required {
          color: #dc2626;
        }
        .form-textarea {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: #0c0a09;
          background: #ffffff;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          resize: vertical;
          min-height: 70px;
        }
        .form-textarea:focus {
          border-color: #292524;
          box-shadow: 0 0 0 3px rgba(41, 37, 36, 0.08);
        }
        .error-text {
          font-size: 12px;
          color: #dc2626;
          margin: 0;
        }

        .action-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        /* ---------- Buttons ---------- */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: #292524;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-primary:hover:not(:disabled) {
          background: #0c0a09;
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 8px 16px;
          background: transparent;
          color: #292524;
          border: 1px solid #d6d3d1;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          line-height: 1;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .btn-outline:hover:not(:disabled) {
          background: #f0efed;
          border-color: #292524;
        }
        .btn-outline:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 768px) {
          .hero {
            padding: 24px 16px 16px;
          }
          .hero h1 {
            font-size: 26px;
            letter-spacing: -0.64px;
          }
          .action-bar {
            padding: 0 16px;
            margin-bottom: 12px;
          }
          .panel {
            padding: 14px 16px 12px;
            margin: 0 16px 12px;
            border-radius: 10px;
          }

          /* Team info row menjadi vertikal */
          .team-info-row {
            flex-direction: column;
            gap: 16px;
          }
          .team-info-left {
            padding-right: 0;
            border-right: none;
            border-bottom: 1px solid #f0efed;
            padding-bottom: 12px;
          }
          .info-row-horizontal {
            gap: 12px 20px;
          }
          .team-info-right {
            flex: 1;
          }
          .members-row {
            flex-direction: column;
            align-items: center;
          }
          .member-card-horizontal {
            min-width: 0;
            width: 100%;
            max-width: 300px;
          }

          .doc-grid {
            grid-template-columns: 1fr;
          }
          .action-buttons {
            flex-direction: column;
          }
          .btn-primary, .btn-outline {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .info-row-horizontal {
            flex-direction: column;
            gap: 6px;
          }
          .doc-card {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .doc-card-actions {
            justify-content: center;
          }
          .panel-title {
            font-size: 16px;
          }
        }
      `}</style>
    </div>
  );
}