// app/admin/team-participant/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import Link from 'next/link';
import ScoreDetailModal from '@/components/layout/admin/ScoreDetailModal';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/admin/navbar';

const NAVY = '#0a1628';
const BLUE = '#0077ff';
const CYAN = '#00d4ff';
const TEAL = '#00c896';

function hexToRgb(hex: string) {
  const v = hex.replace('#', '');
  const num = parseInt(v, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.round(Math.min(255, Math.max(0, x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function mixHex(hexA: string, hexB: string, t: number) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  });
}

function stageColor(index: number, total: number) {
  const t = total <= 1 ? 1 : index / (total - 1);
  if (t <= 0.35) return mixHex(NAVY, BLUE, t / 0.35);
  if (t <= 0.7) return mixHex(BLUE, CYAN, (t - 0.35) / 0.35);
  return mixHex(CYAN, TEAL, (t - 0.7) / 0.3);
}

const STAGE_ORDER = [
  'pending',
  'lolos_seleksi',
  'follow_the_bootcamp',
  'first_half_hackathon',
  'semi_final',
  'final',
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Menunggu',
  lolos_seleksi: 'Lolos Seleksi',
  follow_the_bootcamp: 'Bootcamp',
  first_half_hackathon: 'First Half',
  semi_final: 'Semi Final',
  final: 'Final',
  rejected: 'Ditolak',
};

function getStatusBadge(status: string) {
  if (status === 'rejected') {
    return {
      label: STATUS_LABELS.rejected,
      color: 'rgba(10, 22, 40, 0.6)',
      bg: 'rgba(10, 22, 40, 0.08)',
    };
  }
  const idx = STAGE_ORDER.indexOf(status);
  if (idx === -1) {
    return { label: status, color: mixHex(NAVY, '#ffffff', 0.4), bg: mixHex(NAVY, '#ffffff', 0.92) };
  }
  const solid = stageColor(idx, STAGE_ORDER.length);
  return {
    label: STATUS_LABELS[status] || status,
    color: mixHex(solid, NAVY, 0.15),
    bg: mixHex(solid, '#ffffff', 0.86),
  };
}

function getScoreStatusBadge(status: string) {
  if (status === 'approved') {
    return { label: 'Approved', color: mixHex(TEAL, NAVY, 0.1), bg: mixHex(TEAL, '#ffffff', 0.85) };
  }
  if (status === 'rejected') {
    return { label: 'Rejected', color: 'rgba(10, 22, 40, 0.6)', bg: 'rgba(10, 22, 40, 0.08)' };
  }
  return { label: status || 'Draft', color: mixHex(BLUE, NAVY, 0.1), bg: mixHex(BLUE, '#ffffff', 0.88) };
}

export default function TeamParticipantPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const [activeTab, setActiveTab] = useState<'teams' | 'scores'>('teams');
  const [teams, setTeams] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedSubmissionId, setSelectedSubmissionId] = useState<number | null>(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'teams') {
        const res = await adminService.listTeams(statusFilter || undefined);
        setTeams(res.data.data);
      } else {
        const data = await adminService.getTeamScores();
        setScores(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenScoreDetail = (submissionId: number) => {
    setSelectedSubmissionId(submissionId);
    setIsScoreModalOpen(true);
  };

  const filteredTeams = teams.filter((team: any) =>
    team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.ketua?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const flattenedScores = scores.flatMap((team: any) =>
    team.submissions.map((sub: any) => ({
      teamId: team.id,
      teamName: team.team_name,
      ketua: team.ketua,
      selectionStatus: team.selection_status,
      ...sub,
    }))
  );

  const getScoreTier = (value: number) => {
    if (value >= 80) return 'score-high';
    if (value > 0) return 'score-mid';
    return 'score-low';
  };

  return (
    <div className="admin-dashboard">
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
          <h1>Team Participant</h1>
          <p>Kelola tim peserta, lihat status seleksi, dan pantau penilaian submission.</p>
        </div>
      </div>

      {/* Tab Bar – back to dashboard di kiri, tab di kanan */}
      <div className="tab-bar">
        <Link href="/admin/" className="btn-back">
          ← Back to Dashboard
        </Link>
        <div className="tab-nav">
          <button
            className={`tab-btn ${activeTab === 'teams' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('teams')}
          >
            📋 Daftar Tim
          </button>
          <button
            className={`tab-btn ${activeTab === 'scores' ? 'tab-btn-active' : ''}`}
            onClick={() => setActiveTab('scores')}
          >
            📊 Rekap Nilai
          </button>
        </div>
      </div>

      {/* Konten */}
      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Memuat data...</p>
        </div>
      ) : activeTab === 'teams' ? (
        <div className="table-wrapper">
          <div className="filter-bar">
            <div className="filter-group">
              <label htmlFor="statusFilter">Status</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="pending">Menunggu</option>
                <option value="lolos_seleksi">Lolos Seleksi</option>
                <option value="follow_the_bootcamp">Bootcamp</option>
                <option value="first_half_hackathon">First Half</option>
                <option value="semi_final">Semi Final</option>
                <option value="final">Final</option>
                <option value="rejected">Ditolak</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="searchQuery">Cari</label>
              <input
                id="searchQuery"
                type="text"
                placeholder="Nama tim atau ketua..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <span className="filter-count">{filteredTeams.length} tim ditampilkan</span>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama Tim</th>
                  <th>Ketua</th>
                  <th>Institusi</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <div className="empty-icon-wrap">👥</div>
                        <p>Tidak ada tim ditemukan</p>
                        <p className="empty-sub">Coba ubah filter atau kata kunci</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeams.map((team: any) => {
                    const status = getStatusBadge(team.selection_status);
                    return (
                      <tr key={team.id}>
                        <td className="cell-id">#{team.id}</td>
                        <td className="cell-strong">{team.team_name}</td>
                        <td>{team.ketua?.name || '-'}</td>
                        <td>{team.institution || '-'}</td>
                        <td>
                          <span className="status-badge" style={{ backgroundColor: status.bg, color: status.color }}>
                            <span className="status-dot" style={{ background: status.color }} />
                            {status.label}
                          </span>
                        </td>
                        <td>
                          <Link
                            href={`/admin/team-participant/${team.id}/documents`}
                            className="row-action"
                          >
                            📄 Dokumen
                          </Link>
                          <Link
                            href={`/admin/teams/${team.id}/submissions`}
                            className="row-action row-action-teal"
                          >
                            📝 Submissions
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <div className="filter-bar">
            <span className="filter-count">{flattenedScores.length} submission ditampilkan</span>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tim</th>
                  <th>Stage</th>
                  <th>Rata-rata Nilai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {flattenedScores.length === 0 ? (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-icon-wrap">📊</div>
                        <p>Belum ada data penilaian</p>
                        <p className="empty-sub">Tunggu hingga juri memberikan penilaian</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  flattenedScores.map((item: any) => {
                    const scoreNum = Number(item.average_score) || 0;
                    const statusStyle = getScoreStatusBadge(item.status);
                    return (
                      <tr key={`${item.teamId}-${item.submission_id}`}>
                        <td className="cell-strong">{item.teamName}</td>
                        <td>{item.stage_name || '-'}</td>
                        <td>
                          <span className={`score-value ${getScoreTier(scoreNum)}`}>{scoreNum}</span>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}
                          >
                            <span className="status-dot" style={{ background: statusStyle.color }} />
                            {statusStyle.label}
                          </span>
                        </td>
                        <td>
                          <button onClick={() => handleOpenScoreDetail(item.submission_id)} className="row-action">
                            🔍 Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isScoreModalOpen && selectedSubmissionId && (
        <ScoreDetailModal
          submissionId={selectedSubmissionId}
          isOpen={isScoreModalOpen}
          onClose={() => {
            setIsScoreModalOpen(false);
            setSelectedSubmissionId(null);
          }}
        />
      )}

      <style jsx>{`
        /* ---------- Design System Tokens ---------- */
        .admin-dashboard {
          background: #f5f5f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c0a09;
          padding: 0 0 40px 0;
        }

        /* ---------- Hero ---------- */
        .hero {
          background: #f5f5f5;
          padding: 48px 32px 32px;
          text-align: center;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-eyebrow {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.96px;
          text-transform: uppercase;
          color: #777169;
          background: #f0efed;
          padding: 3px 10px;
          border-radius: 9999px;
          margin-bottom: 16px;
        }

        .hero h1 {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -0.96px;
          color: #0c0a09;
          margin: 0 0 8px 0;
        }

        .hero p {
          font-size: 15px;
          line-height: 1.5;
          letter-spacing: 0.15px;
          color: #4e4e4e;
          max-width: 540px;
          margin: 0 auto;
        }

        /* ---------- Tab Bar – back di kiri, tab di kanan ---------- */
        .tab-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1200px;
          margin: 0 auto 24px;
          padding: 0 32px;
        }

        /* Back button – di kiri */
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          color: #777169;
          padding: 8px 16px;
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

        /* Tab nav – di kanan */
        .tab-nav {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #ffffff;
          border: 1px solid #e7e5e4;
          padding: 5px;
          border-radius: 14px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .tab-btn {
          padding: 8px 18px;
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 13px;
          background: transparent;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          color: #777169;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .tab-btn:hover {
          color: #0c0a09;
          background: #f0efed;
        }

        .tab-btn-active,
        .tab-btn-active:hover {
          color: #ffffff;
          background: #292524;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        /* ---------- Loading ---------- */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 40vh;
          gap: 14px;
          font-family: 'Inter', sans-serif;
        }

        .loading-spinner {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 3px solid #e7e5e4;
          border-top-color: #292524;
          animation: spin 0.85s linear infinite;
        }

        .loading-state p {
          margin: 0;
          font-size: 15px;
          font-weight: 400;
          letter-spacing: 0.15px;
          color: #777169;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .loading-spinner {
            animation: none;
          }
        }

        /* ---------- Table Wrapper ---------- */
        .table-wrapper {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          overflow: hidden;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 0 0 0;
        }

        .table-scroll {
          overflow-x: auto;
        }

        /* ---------- Filter Bar ---------- */
        .filter-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-bottom: 1px solid #f0efed;
          background: #fafafa;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .filter-bar label {
          font-family: 'Inter', sans-serif;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.15px;
          color: #777169;
        }

        .filter-bar select,
        .filter-bar input {
          padding: 7px 11px;
          border: 1px solid #e7e5e4;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          background: #ffffff;
          color: #0c0a09;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }

        .filter-bar select:focus,
        .filter-bar input:focus {
          border-color: #292524;
          box-shadow: 0 0 0 3px rgba(41, 37, 36, 0.08);
        }

        .filter-bar input[type='text'] {
          min-width: 200px;
        }

        .filter-bar .filter-count {
          margin-left: auto;
          font-size: 12px;
          font-weight: 500;
          color: #292524;
          background: #f0efed;
          padding: 4px 12px;
          border-radius: 9999px;
          white-space: nowrap;
        }

        /* ---------- Data Table ---------- */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-family: 'Inter', sans-serif;
          background: #ffffff;
        }

        .data-table thead {
          background: #fafafa;
        }

        .data-table th {
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.96px;
          color: #777169;
          border-bottom: 1px solid #e7e5e4;
          padding: 12px 18px;
          text-align: left;
          white-space: nowrap;
        }

        .data-table td {
          padding: 12px 18px;
          font-size: 14px;
          color: #4e4e4e;
          border-bottom: 1px solid #f0efed;
          vertical-align: middle;
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .data-table tbody tr:hover {
          background: #fafafa;
        }

        .cell-id {
          font-weight: 500;
          color: #a8a29e;
          font-size: 13px;
        }

        .cell-strong {
          font-weight: 500;
          color: #0c0a09;
        }

        /* ---------- Status Badge ---------- */
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          border-radius: 9999px;
          font-weight: 500;
          font-size: 12px;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        /* ---------- Row Actions ---------- */
        .row-action {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 500;
          padding: 5px 12px;
          border-radius: 9999px;
          text-decoration: none;
          color: #292524;
          background: #f0efed;
          margin-right: 6px;
          border: none;
          cursor: pointer;
          transition: background 0.12s ease;
          white-space: nowrap;
        }

        .row-action:hover {
          background: #e7e5e4;
        }

        .row-action-teal {
          color: #0c0a09;
          background: #e7e5e4;
        }

        .row-action-teal:hover {
          background: #d6d3d1;
        }

        /* ---------- Empty State ---------- */
        .empty-state {
          padding: 48px 20px;
          text-align: center;
        }

        .empty-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: #f0efed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          margin: 0 auto 12px;
        }

        .empty-state p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
          color: #0c0a09;
        }

        .empty-state .empty-sub {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 400;
          color: #a8a29e;
        }

        /* ---------- Score Value ---------- */
        .score-value {
          display: inline-block;
          font-weight: 500;
          font-size: 14px;
          padding: 3px 10px;
          border-radius: 8px;
        }

        .score-high {
          color: #0c0a09;
          background: #f0efed;
        }

        .score-mid {
          color: #4e4e4e;
          background: #fafafa;
        }

        .score-low {
          color: #a8a29e;
          background: #f5f5f5;
        }

        /* ---------- Responsive ---------- */
        @media (max-width: 1024px) {
          .filter-bar {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .filter-bar .filter-count {
            margin-left: 0;
          }
        }

        @media (max-width: 768px) {
          .hero {
            padding: 32px 16px 24px;
          }
          .hero h1 {
            font-size: 28px;
            letter-spacing: -0.64px;
          }

          .tab-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
            padding: 0 16px;
            margin-bottom: 16px;
          }

          .btn-back {
            justify-content: center;
          }

          .tab-nav {
            justify-content: center;
          }

          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-bar input[type='text'] {
            min-width: 0;
            width: 100%;
          }
          .filter-bar .filter-count {
            margin-left: 0;
            text-align: center;
          }
          .data-table th,
          .data-table td {
            padding: 10px 12px;
            font-size: 13px;
          }
          .row-action {
            font-size: 11px;
            padding: 4px 10px;
          }
        }

        @media (max-width: 480px) {
          .data-table th,
          .data-table td {
            padding: 8px 10px;
            font-size: 12px;
          }
          .status-badge {
            font-size: 10px;
            padding: 2px 8px;
          }
          .row-action {
            font-size: 10px;
            padding: 3px 8px;
          }
        }
      `}</style>
    </div>
  );
}