'use client';

import { useDashboard } from '@/hooks/useDashboard';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Navbar from '@/components/layout/admin/navbar';

export default function AdminDashboardPage() {
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

  const { summary, loading } = useDashboard();

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" />
        <p>Memuat dashboard...</p>
        <style jsx>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 60vh;
            gap: 14px;
            font-family: 'Inter', -apple-system, sans-serif;
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
        `}</style>
      </div>
    );
  }

  const stats = [
    { label: 'Total Pengguna', value: summary?.total_users || 0, icon: '👥' },
    { label: 'Total Tim', value: summary?.total_teams || 0, icon: '🏢' },
    { label: 'Submission', value: summary?.total_submissions || 0, icon: '📄' },
    { label: 'Penilaian', value: summary?.total_scores || 0, icon: '⭐' },
  ];

  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    lolos_seleksi: 'Lolos Seleksi',
    follow_the_bootcamp: 'Bootcamp',
    first_half_hackathon: 'First Half',
    semi_final: 'Semi Final',
    final: 'Final',
    rejected: 'Ditolak',
  };

  const stageOrder = [
    'pending',
    'lolos_seleksi',
    'follow_the_bootcamp',
    'first_half_hackathon',
    'semi_final',
    'final',
  ];

  const teamsByStatus = (summary?.teams_by_status || {}) as Record<string, number>;
  const totalTeams = Object.values(teamsByStatus).reduce((a, b) => a + b, 0);
  const rejectedCount = teamsByStatus['rejected'] || 0;
  const maxStageCount = Math.max(1, ...stageOrder.map((s) => teamsByStatus[s] || 0));

  const submissionStages = summary?.submissions_per_stage || [];
  const maxSubmissionCount = Math.max(1, ...submissionStages.map((s) => s.total));

  const logs = summary?.latest_audit_logs || [];

  const gradientColors = [
    '#a7e5d3', // mint
    '#f4c5a8', // peach
    '#c8b8e0', // lavender
    '#a8c8e8', // sky
    '#e8b8c4', // rose
  ];

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
      />

      {/* Hero compact */}
      <div className="hero">
        <div className="hero-content">
          <span className="hero-eyebrow">Admin Panel · Empat Pilar MPR RI</span>
          <h1>Selamat Datang, Admin!</h1>
          <p>Kelola pengguna, tim, submission, dan pantau statistik keseluruhan acara.</p>
        </div>
      </div>

      {/* Stats cards – lebih compact */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.label}>
            <span className="stat-icon">{stat.icon}</span>
            <div className="stat-body">
              <span className="stat-value">{stat.value.toLocaleString('id-ID')}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3 Columns – lebih compact */}
      <div className="three-col">
        {/* Status Tim */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Status Tim</h3>
              <span className="panel-subtitle">Alur seleksi</span>
            </div>
            <span className="panel-badge">{totalTeams} tim</span>
          </div>

          {summary?.teams_by_status ? (
            <div className="funnel">
              {stageOrder.map((key, i) => {
                const count = teamsByStatus[key] || 0;
                const widthPct = (count / maxStageCount) * 100;
                const color = gradientColors[i % gradientColors.length];
                return (
                  <div className="funnel-row" key={key}>
                    <div className="funnel-row-top">
                      <span className="funnel-label">{statusLabels[key]}</span>
                      <span className="funnel-count">{count}</span>
                    </div>
                    <div className="funnel-track">
                      <div
                        className="funnel-fill"
                        style={{
                          width: `${count > 0 ? Math.max(widthPct, 6) : 0}%`,
                          background: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
              {rejectedCount > 0 && (
                <div className="funnel-row funnel-row-muted">
                  <div className="funnel-row-top">
                    <span className="funnel-label">{statusLabels['rejected']}</span>
                    <span className="funnel-count">{rejectedCount}</span>
                  </div>
                  <div className="funnel-track">
                    <div
                      className="funnel-fill funnel-fill-muted"
                      style={{ width: `${Math.max((rejectedCount / maxStageCount) * 100, 6)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="empty-text">Data tidak tersedia</p>
          )}
        </div>

        {/* Submission per Stage */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h3>Submission per Stage</h3>
              <span className="panel-subtitle">Per tahap</span>
            </div>
          </div>

          {submissionStages.length > 0 ? (
            <div className="stage-list">
              {submissionStages.map((item, idx) => (
                <div className="stage-row" key={item.stage_name}>
                  <div className="stage-row-top">
                    <span className="stage-label">{item.stage_name}</span>
                    <span className="stage-count">{item.total}</span>
                  </div>
                  <div className="stage-track">
                    <div
                      className="stage-fill"
                      style={{
                        width: `${Math.max((item.total / maxSubmissionCount) * 100, 4)}%`,
                        background: gradientColors[idx % gradientColors.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Belum ada submission</p>
          )}

          <div className="panel-footer">
            Rata-rata nilai <strong>{summary?.average_score_overall || 0}</strong>
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="panel">
          <div className="panel-header">
            <h3>Aktivitas Terbaru</h3>
          </div>

          {logs.length > 0 ? (
            <ul className="activity-list">
              {logs.slice(0, 5).map((log) => (
                <li className="activity-row" key={log.id}>
                  <span className="activity-dot" />
                  <span className="activity-text">
                    {log.user?.name || 'Sistem'} <strong>{log.action}</strong> {log.entity_type} #{log.entity_id}
                  </span>
                  <span className="activity-time">
                    {new Date(log.created_at).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-text empty-text-center">Belum ada aktivitas.</p>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Base – compact */
        .admin-dashboard {
          background: #f5f5f5;
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #0c0a09;
          padding: 0 0 40px 0;
        }

        /* Hero – lebih kecil padding */
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

        /* Stats grid – lebih rapat */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          max-width: 1200px;
          margin: -16px auto 32px;
          padding: 0 32px;
          position: relative;
          z-index: 2;
        }

        .stat-card {
          background: #ffffff;
          border-radius: 12px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.2s;
        }

        .stat-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
        }

        .stat-icon {
          font-size: 24px;
          line-height: 1;
          opacity: 0.8;
        }

        .stat-body {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 22px;
          font-weight: 500;
          line-height: 1.2;
          color: #0c0a09;
          letter-spacing: -0.02em;
        }

        .stat-label {
          font-size: 13px;
          font-weight: 400;
          color: #777169;
          letter-spacing: 0.15px;
        }

        /* 3-column – gap lebih kecil */
        .three-col {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 32px;
        }

        @media (max-width: 1024px) {
          .three-col {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 640px) {
          .three-col {
            grid-template-columns: 1fr;
            padding: 0 16px;
          }
          .hero {
            padding: 32px 16px 24px;
          }
          .hero h1 {
            font-size: 28px;
            letter-spacing: -0.64px;
          }
          .stats-grid {
            padding: 0 16px;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: -12px;
          }
          .stat-card {
            padding: 12px;
          }
          .stat-icon {
            font-size: 20px;
          }
          .stat-value {
            font-size: 18px;
          }
        }

        /* Panel – padding lebih kecil */
        .panel {
          background: #ffffff;
          border-radius: 12px;
          padding: 18px 18px 16px;
          border: 1px solid #e7e5e4;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
          display: flex;
          flex-direction: column;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 14px;
          gap: 8px;
        }

        .panel-header h3 {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
          font-size: 20px;
          line-height: 1.2;
          letter-spacing: 0;
          color: #0c0a09;
          margin: 0 0 1px 0;
        }

        .panel-subtitle {
          font-size: 12px;
          font-weight: 400;
          color: #777169;
          letter-spacing: 0.15px;
        }

        .panel-badge {
          background: #f0efed;
          color: #0c0a09;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.96px;
          text-transform: uppercase;
          padding: 3px 10px;
          border-radius: 9999px;
          white-space: nowrap;
        }

        .panel-footer {
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #f0efed;
          font-size: 13px;
          color: #4e4e4e;
          letter-spacing: 0.15px;
        }

        .panel-footer strong {
          color: #292524;
          font-weight: 500;
        }

        /* Funnel – lebih rapat */
        .funnel {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .funnel-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .funnel-row-top {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          letter-spacing: 0.15px;
        }

        .funnel-label {
          color: #4e4e4e;
        }

        .funnel-count {
          font-weight: 500;
          color: #0c0a09;
        }

        .funnel-track {
          width: 100%;
          height: 5px;
          background: #f0efed;
          border-radius: 9999px;
          overflow: hidden;
        }

        .funnel-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        .funnel-fill-muted {
          background: #d6d3d1 !important;
        }

        .funnel-row-muted .funnel-label {
          color: #a8a29e;
        }

        /* Stage list – lebih rapat */
        .stage-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .stage-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .stage-row-top {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          letter-spacing: 0.15px;
        }

        .stage-label {
          color: #4e4e4e;
        }

        .stage-count {
          font-weight: 500;
          color: #0c0a09;
        }

        .stage-track {
          width: 100%;
          height: 5px;
          background: #f0efed;
          border-radius: 9999px;
          overflow: hidden;
        }

        .stage-fill {
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s ease;
        }

        /* Activity list – lebih rapat */
        .activity-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .activity-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          letter-spacing: 0.15px;
          color: #4e4e4e;
          padding: 6px 0;
          border-bottom: 1px solid #f0efed;
        }

        .activity-row:last-child {
          border-bottom: 0;
        }

        .activity-dot {
          width: 5px;
          height: 5px;
          border-radius: 9999px;
          background: #c8b8e0;
          flex-shrink: 0;
        }

        .activity-text {
          flex: 1;
        }

        .activity-text strong {
          color: #292524;
          font-weight: 500;
        }

        .activity-time {
          font-size: 11px;
          color: #a8a29e;
          white-space: nowrap;
        }

        .empty-text {
          color: #a8a29e;
          font-size: 13px;
          letter-spacing: 0.15px;
          margin: 12px 0;
        }

        .empty-text-center {
          text-align: center;
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }
          .stat-card {
            padding: 10px 12px;
            flex-direction: column;
            text-align: center;
            gap: 4px;
          }
          .stat-icon {
            font-size: 20px;
          }
          .stat-value {
            font-size: 18px;
          }
          .panel {
            padding: 14px;
          }
          .panel-header h3 {
            font-size: 18px;
          }
        }
      `}</style>
    </div>
  );
}