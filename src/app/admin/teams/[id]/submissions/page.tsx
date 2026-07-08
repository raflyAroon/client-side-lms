// app/admin/teams/[id]/submissions/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { adminService } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/admin/navbar';

export default function AdminTeamSubmissionsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Navbar state
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Page state
  const [team, setTeam] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<number | null>(null);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

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
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await adminService.teamSubmissions(Number(id));
      setTeam(res.data.team);
      setSubmissions(res.data.submissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (submissionId: number, action: 'approved' | 'rejected') => {
    if (actionInProgress) return;
    setActionInProgress(submissionId);
    try {
      await adminService.reviewSubmission(submissionId, action, reviewNote);
      alert(`Submission ${action === 'approved' ? 'disetujui' : 'ditolak'}`);
      loadData();
      setReviewNote('');
      setSelectedSubmission(null);
    } catch (err) {
      alert('Gagal review submission');
    } finally {
      setActionInProgress(null);
    }
  };

  // Status badge mapping
  const statusColor: Record<string, string> = {
    submitted: 'badge-yellow',
    approved: 'badge-green',
    rejected: 'badge-red',
    reviewed: 'badge-gray',
  };

  const statusLabel: Record<string, string> = {
    submitted: 'Menunggu Review',
    approved: 'Disetujui',
    rejected: 'Ditolak',
    reviewed: 'Direview',
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
          <p>Memuat data submission...</p>
        </div>
      </>
    );
  }

  if (!team) {
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
          <span className="error-icon">🔍</span>
          <h2>Tim tidak ditemukan</h2>
          <p>Tim dengan ID ini tidak ada atau telah dihapus.</p>
          <Link href="/admin/team-participant" className="btn-back">
            ← Kembali ke Daftar Tim
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="admin-page">
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

      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Admin Panel · Empat Pilar MPR RI</span>
          <h1>{team.team_name}</h1>
          <p>
            Status Tim: <span className="team-status-badge">{team.selection_status}</span>
          </p>
        </div>
      </div>

      {/* Action bar */}
      <div className="action-bar">
        <Link href="/admin/team-participant" className="btn-back">
          ← Kembali ke Daftar Tim
        </Link>
        <span className="submission-count">📄 {submissions.length} Submission</span>
      </div>

      {/* Submissions */}
      {submissions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p className="empty-title">Belum ada submission</p>
          <p className="empty-desc">Tim ini belum mengirimkan submission apapun.</p>
        </div>
      ) : (
        <div className="submissions-grid">
          {submissions.map((sub: any) => {
            const isReviewing = selectedSubmission === sub.id;
            const isSubmitting = actionInProgress === sub.id;
            const subStatus = sub.status || 'submitted';

            return (
              <div key={sub.id} className="panel submission-card">
                <div className="card-header">
                  <div className="card-title-wrapper">
                    <h3 className="card-title">{sub.stage.name}</h3>
                    <span className={`badge ${statusColor[subStatus] || 'badge-gray'}`}>
                      {statusLabel[subStatus] || subStatus}
                    </span>
                  </div>
                  {sub.submitted_at && (
                    <span className="submitted-date">
                      📅 {new Date(sub.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>

                <div className="card-body">
                  <div className="info-row">
                    <span className="info-label">Jenis Proyek</span>
                    <span className="info-value">{sub.project_type || '-'}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Deskripsi</span>
                    <p className="info-value text-sm">{sub.description || 'Tidak ada deskripsi'}</p>
                  </div>

                  {sub.files && sub.files.length > 0 && (
                    <div className="files-section">
                      <span className="files-label">📎 File yang diupload</span>
                      <div className="files-list">
                        {sub.files.map((f: any) => (
                          <a
                            key={f.id}
                            href={f.file_url || f.external_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="file-link"
                          >
                            {f.file_type === 'file' ? '📄' : '🔗'}
                            {f.file_name || 'Link'}
                            <span className="file-category">[{f.submission_category}]</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {sub.review_note && (
                    <div className="review-note">
                      <span className="review-note-label">📝 Catatan Review</span>
                      <p className="review-note-text">{sub.review_note}</p>
                    </div>
                  )}
                </div>

                {subStatus === 'submitted' && (
                  <div className="card-footer">
                    {isReviewing ? (
                      <div className="review-form">
                        <textarea
                          placeholder="Catatan review (opsional)"
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          rows={2}
                          className="review-textarea"
                          disabled={isSubmitting}
                        />
                        <div className="review-actions">
                          <button
                            onClick={() => handleReview(sub.id, 'approved')}
                            className="btn btn-approve"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Memproses...' : '✅ Setujui'}
                          </button>
                          <button
                            onClick={() => handleReview(sub.id, 'rejected')}
                            className="btn btn-reject"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? 'Memproses...' : '❌ Tolak'}
                          </button>
                          <button
                            onClick={() => { setSelectedSubmission(null); setReviewNote(''); }}
                            className="btn btn-cancel"
                            disabled={isSubmitting}
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSubmission(sub.id)}
                        className="btn-review"
                      >
                        Review Submission
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        /* ===== BASE ===== */
        .admin-page {
          background: #f5f5f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c0a09;
          padding: 0 0 40px 0;
        }

        /* ===== LOADING ===== */
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

        /* ===== ERROR ===== */
        .error-state {
          max-width: 600px;
          margin: 40px auto;
          text-align: center;
          padding: 28px;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e7e5e4;
        }
        .error-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 8px;
        }
        .error-state h2 {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 28px;
          color: #0c0a09;
          margin: 8px 0 4px;
        }
        .error-state p {
          font-size: 15px;
          color: #4e4e4e;
          margin-bottom: 16px;
        }

        /* ===== HERO ===== */
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
        .team-status-badge {
          display: inline-block;
          background: #f0efed;
          color: #0c0a09;
          padding: 2px 10px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 12px;
        }

        /* ===== ACTION BAR ===== */
        .action-bar {
          max-width: 1200px;
          margin: 0 auto 16px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
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
        .submission-count {
          font-size: 13px;
          font-weight: 500;
          color: #292524;
          background: #f0efed;
          padding: 4px 14px;
          border-radius: 9999px;
        }

        /* ===== EMPTY STATE ===== */
        .empty-state {
          max-width: 1200px;
          margin: 32px auto 0;
          padding: 48px 20px;
          text-align: center;
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e7e5e4;
        }
        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 8px;
        }
        .empty-title {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 24px;
          color: #0c0a09;
          margin: 0 0 4px;
        }
        .empty-desc {
          font-size: 14px;
          color: #a8a29e;
          margin: 0;
        }

        /* ===== SUBMISSIONS GRID ===== */
        .submissions-grid {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* ===== PANEL / CARD ===== */
        .panel {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 20px 16px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          display: flex;
          flex-direction: column;
        }

        .submission-card {
          transition: box-shadow 0.2s ease;
        }
        .submission-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
          gap: 12px;
          flex-wrap: wrap;
        }
        .card-title-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .card-title {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 18px;
          line-height: 1.2;
          color: #0c0a09;
          margin: 0;
        }
        .badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 500;
          padding: 2px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }
        .badge-yellow {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-green {
          background: #d1fae5;
          color: #065f46;
        }
        .badge-red {
          background: #fee2e2;
          color: #991b1b;
        }
        .badge-gray {
          background: #f0efed;
          color: #4e4e4e;
        }

        .submitted-date {
          font-size: 12px;
          color: #777169;
          white-space: nowrap;
        }

        .card-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .info-row {
          display: flex;
          flex-direction: column;
        }
        .info-label {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.15px;
          color: #a8a29e;
        }
        .info-value {
          font-size: 14px;
          color: #0c0a09;
          margin: 0;
        }
        .text-sm {
          font-size: 13px;
          color: #4e4e4e;
        }

        .files-section {
          margin-top: 4px;
        }
        .files-label {
          font-size: 12px;
          font-weight: 500;
          color: #4e4e4e;
        }
        .files-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 4px;
        }
        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #292524;
          background: #f0efed;
          padding: 3px 10px;
          border-radius: 9999px;
          text-decoration: none;
          transition: background 0.12s ease;
        }
        .file-link:hover {
          background: #e7e5e4;
        }
        .file-category {
          font-weight: 400;
          color: #777169;
          font-size: 10px;
        }

        .review-note {
          margin-top: 4px;
          background: #fafafa;
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #f0efed;
        }
        .review-note-label {
          font-size: 11px;
          font-weight: 500;
          color: #777169;
        }
        .review-note-text {
          font-size: 13px;
          color: #0c0a09;
          margin: 2px 0 0;
        }

        .card-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0efed;
        }

        /* ===== REVIEW BUTTON ===== */
        .btn-review {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          background: #292524;
          color: #ffffff;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .btn-review:hover {
          background: #0c0a09;
        }

        .review-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .review-textarea {
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
          min-height: 56px;
        }
        .review-textarea:focus {
          border-color: #292524;
          box-shadow: 0 0 0 3px rgba(41, 37, 36, 0.08);
        }
        .review-textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .review-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 14px;
          border: none;
          border-radius: 9999px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          cursor: pointer;
          transition: background 0.15s ease, opacity 0.15s ease;
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-approve {
          background: #292524;
          color: #ffffff;
        }
        .btn-approve:hover:not(:disabled) {
          background: #0c0a09;
        }
        .btn-reject {
          background: transparent;
          color: #292524;
          border: 1px solid #d6d3d1;
        }
        .btn-reject:hover:not(:disabled) {
          background: #f0efed;
          border-color: #292524;
        }
        .btn-cancel {
          background: transparent;
          color: #777169;
          border: 1px solid #e7e5e4;
        }
        .btn-cancel:hover:not(:disabled) {
          background: #f0efed;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .hero {
            padding: 24px 16px 16px;
          }
          .hero h1 {
            font-size: 26px;
          }
          .action-bar {
            padding: 0 16px;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }
          .btn-back {
            justify-content: center;
          }
          .submission-count {
            text-align: center;
          }
          .submissions-grid {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          .panel {
            padding: 14px 16px;
          }
          .card-title {
            font-size: 16px;
          }
          .review-actions {
            flex-direction: column;
          }
          .btn {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .card-header {
            flex-direction: column;
            align-items: stretch;
          }
          .card-title-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }
          .submitted-date {
            align-self: flex-start;
          }
        }
      `}</style>
    </div>
  );
}