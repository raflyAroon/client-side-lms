// app/peserta/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';
import { useTeam } from '@/hooks/useTeam';
import TeamRegistrationWizard from '@/components/TeamRegistrationWizard';

/* ---------- CURSOR SPOTLIGHT ---------- */
function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
    };
    const tick = () => {
      if (ref.current) {
        ref.current.style.transform = `translate(${pos.current.x - 250}px, ${pos.current.y - 250}px)`;
      }
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('mousemove', move);
      cancelAnimationFrame(raf.current);
    };
  }, []);
  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 500,
        height: 500,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 9999,
        background:
          'radial-gradient(circle, rgba(0,119,255,0.07) 0%, rgba(0,212,255,0.04) 35%, transparent 70%)',
        willChange: 'transform',
        mixBlendMode: 'multiply',
      }}
    />
  );
}

/* ---------- PARTICLE CANVAS ---------- */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const colors = ['#0077ff', '#00d4ff', '#00c896', '#38bdf8'];
    const pts: {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      a: number;
      c: string;
    }[] = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    for (let i = 0; i < 55; i++) {
      pts.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * 0.35 + 0.08,
        c: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c;
        ctx.globalAlpha = p.a;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x;
          const dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0,150,255,${0.08 * (1 - d / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

/* ---------- FLOATING BLOBS ---------- */
function FloatingBlobs() {
  return (
    <>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </>
  );
}

/* ---------- MAIN COMPONENT ---------- */
export default function PesertaDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { team, loading: teamLoading, fetchTeam, hasTeam } = useTeam();
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [showWizard, setShowWizard] = useState(false);

  // Scroll listener untuk navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollPct(Math.min((window.scrollY / h) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auth redirect
  useEffect(() => {
    if (!teamLoading){
      if (!user) { router.push('/auth/login'); } 
        else if (user.role !== 'peserta') { router.push('/dashboard'); }
    }
  }, [user, teamLoading, router]);
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user) return;
      try {
        const res = await api.get('/dashboard/peserta');
        setDashboardData(res.data);
      } catch (err: any) {
        console.error('Gagal mengambil data dashboard:', err);
        setDashboardData({
          progress: '0%',
          points: '0',
          rank: '#N/A',
          team_name: team?.team_name || 'Belum ada tim',
          team_members: team?.members || [],
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [user, team]);

  // Tampilkan wizard jika user login, tim belum ada
  useEffect(() => {
    if (!teamLoading && user && !hasTeam) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }
  }, [teamLoading, user, hasTeam]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleWizardSuccess = async () => {
    setShowWizard(false);
    await fetchTeam(); // refresh tim
    try {
      const res = await api.get('/dashboard/peserta');
      setDashboardData(res.data);
    } catch (err) {}
  };

  // Intersection Observer untuk animasi scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('ai');
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll('.a').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading || teamLoading) {
    return (
      <div className="dashboard-root">
        <div className="loading-screen">Memuat dashboard peserta...</div>
        <style jsx>{`
          .dashboard-root {
            min-height: 100vh;
            background: linear-gradient(145deg, #f0f7ff 0%, #e9f2fa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-screen {
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 1.2rem;
            color: var(--t1);
            background: rgba(255, 255, 255, 0.8);
            backdrop-filter: blur(12px);
            padding: 2rem 3rem;
            border-radius: 28px;
          }
        `}</style>
      </div>
    );
  }

  const stats = [
    { label: 'Progres Submission', value: dashboardData?.progress || '0%', icon: '📊' },
    { label: 'Poin Tim', value: dashboardData?.points || '0', icon: '🏆' },
    { label: 'Peringkat', value: dashboardData?.rank || '#N/A', icon: '🥇' },
    { label: 'Tim', value: team?.team_name || 'Belum ada tim', icon: '👥' },
  ];

  return (
    <div className="dashboard-root">
      <CursorSpotlight />
      <div className="bg-layer">
        <ParticleCanvas />
        <FloatingBlobs />
        <div className="bg-grid" />
      </div>

      {/* NAVBAR */}
      <nav className={`nav ${scrolled ? 'nav-s' : ''}`}>
        <div className="nav-prog">
          <div style={{ width: `${scrollPct}%` }} className="nav-prog-fill" />
        </div>
        <div className="nav-in">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <div className="brand-icon">H</div>
              <span className="brand-name">Hackathon MPR RI</span>
            </Link>
          </div>
          <div className="nav-r">
            <div className="nav-user">
              <div className="uav">{(user?.name || 'P').charAt(0).toUpperCase()}</div>
              <div className="ui">
                <span className="un">{user?.name || 'Peserta'}</span>
                <span className="ur">Peserta</span>
              </div>
              <button onClick={handleLogout} className="logout-btn" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <div className="container">
          <div className="welcome-card a">
            <div className="welcome-glow" />
            <h1 className="welcome-title">
              Selamat datang, <span className="welcome-name">{user?.name}</span>!
            </h1>
            <p className="welcome-sub">
              {hasTeam
                ? 'Kelola tim, unggah submission, dan pantau progresmu di sini.'
                : 'Silakan daftarkan tim Anda terlebih dahulu.'}
            </p>
          </div>

          {/* Statistik Cards */}
          <div className="stats-grid">
            {stats.map((stat, i) => (
              <div key={stat.label} className="stat-card a" style={{ '--d': `${i * 0.1}s` } as any}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Informasi Tambahan (hanya jika sudah punya tim) */}
          {hasTeam && (
            <>
              <div className="info-grid">
                <div className="info-card a" style={{ '--d': '0.2s' } as any}>
                  <h3>📢 Pengumuman Terbaru</h3>
                  <p>Pendaftaran tim ditutup 10 Juni 2026. Segera lengkapi data tim Anda!</p>
                  <Link href="/announcements" className="info-link">
                    Lihat semua →
                  </Link>
                </div>
                <div className="info-card a" style={{ '--d': '0.3s' } as any}>
                  <h3>📝 Submission Tugas</h3>
                  <p>Upload proposal, source code, dan video presentasi tim Anda.</p>
                  <Link href="/peserta/submission" className="info-link">
                    Upload sekarang →
                  </Link>
                </div>
                <div className="info-card a" style={{ '--d': '0.4s' } as any}>
                  <h3>🎯 Bootcamp & Jadwal</h3>
                  <p>Ikuti bootcamp intensif setiap Sabtu pukul 09.00 WIB.</p>
                  <Link href="/schedule" className="info-link">
                    Lihat jadwal →
                  </Link>
                </div>
              </div>

              {/* Tabel Anggota Tim */}
              <div className="team-card a" style={{ '--d': '0.5s' } as any}>
                <h3>👥 Anggota Tim</h3>
                {team?.members && team.members.length > 0 ? (
                  <table className="team-table">
                    <thead>
                      <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.members.map((member, idx) => (
                        <tr key={idx}>
                          <td>{member.name}</td>
                          <td>{member.email}</td>
                          <td>{member.position === 'ketua' ? 'Ketua' : 'Anggota'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="empty-team">Belum ada anggota tim.</p>
                )}
                <div className="team-actions">
                  <button className="btn-outline">➕ Undang Anggota</button>
                  <button className="btn-primary">✏️ Edit Tim</button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* POPUP WIZARD - FULLSCREEN MODAL TENGAH */}
      <div className="wizard-modal">
        <TeamRegistrationWizard isOpen={showWizard} onSuccess={handleWizardSuccess} />
      </div>
      {/* GLOBAL STYLES */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Clash+Display:wght@400;500;600;700&display=swap');
        :root {
          --c: #0077ff;
          --cy: #00d4ff;
          --tl: #00c896;
          --t1: #0a1628;
          --t2: #1e3a5f;
          --t3: #4a6fa5;
          --tm: #8ca8cc;
          --bg-glass: rgba(255, 255, 255, 0.96);
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: linear-gradient(145deg, #f0f7ff 0%, #e9f2fa 100%);
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          overflow-x: hidden;
        }
      `}</style>

      <style jsx>{`
        .dashboard-root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* BACKGROUND LAYER */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(0, 119, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 119, 255, 0.03) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .b1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0, 119, 255, 0.12), transparent 70%);
          top: -200px;
          left: -150px;
          animation: floatBlob 16s ease-in-out infinite;
        }
        .b2 {
          width: 450px;
          height: 450px;
          background: radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent 70%);
          bottom: -150px;
          right: -120px;
          animation: floatBlob 18s ease-in-out infinite reverse;
        }
        .b3 {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, rgba(0, 200, 150, 0.08), transparent 65%);
          top: 30%;
          left: 30%;
          animation: floatBlob 14s ease-in-out infinite 1s;
        }
        @keyframes floatBlob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
        }

        /* NAVBAR */
        .nav {
          position: sticky;
          top: 0;
          z-index: 500;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 119, 255, 0.12);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .nav.nav-s {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 2px solid rgba(0, 119, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 119, 255, 0.05) inset;
        }
        .nav-prog {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(0, 119, 255, 0.06);
        }
        .nav-prog-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--c), var(--tl));
          transition: width 0.2s;
        }
        .nav-in {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0.8rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .nav-brand {
          display: flex;
          align-items: center;
        }
        .brand-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          text-decoration: none;
        }
        .brand-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--c), var(--cy));
          color: white;
          font-family: 'Clash Display', sans-serif;
          font-weight: 800;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0, 119, 255, 0.3);
        }
        .brand-name {
          font-family: 'Clash Display', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--t1);
        }
        .nav-r {
          display: flex;
          align-items: center;
        }
        .nav-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .uav {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--c), var(--cy));
          color: #fff;
          font-weight: 800;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.15);
        }
        .ui {
          text-align: right;
        }
        .un {
          display: block;
          font-weight: 700;
          font-size: 0.84rem;
          color: var(--t1);
        }
        .ur {
          display: block;
          font-size: 0.68rem;
          color: var(--tm);
        }
        .logout-btn {
          background: rgba(0, 119, 255, 0.08);
          border: 1px solid rgba(0, 119, 255, 0.2);
          border-radius: 10px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--t3);
          transition: all 0.25s;
        }
        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.15);
          border-color: #ef4444;
          color: #ef4444;
        }

        /* MAIN CONTENT */
        .main-content {
          position: relative;
          z-index: 1;
          padding: 2rem 2rem 4rem;
        }
        .container {
          max-width: 1340px;
          margin: 0 auto;
        }

        /* WELCOME CARD */
        .welcome-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.15);
          border-radius: 28px;
          padding: 2rem 2rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 119, 255, 0.08);
          transition: all 0.4s ease;
        }
        .welcome-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 50px rgba(0, 119, 255, 0.12);
          border-color: rgba(0, 119, 255, 0.25);
        }
        .welcome-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 119, 255, 0.08), transparent 70%);
          pointer-events: none;
        }
        .welcome-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 0.5rem;
        }
        .welcome-name {
          background: linear-gradient(135deg, var(--c), var(--tl));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .welcome-sub {
          font-size: 0.9rem;
          color: var(--t3);
          line-height: 1.5;
        }

        /* STATS GRID */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 24px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.02);
        }
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 119, 255, 0.3);
          box-shadow: 0 12px 32px rgba(0, 119, 255, 0.1);
          background: rgba(255, 255, 255, 0.95);
        }
        .stat-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--c);
          margin-bottom: 0.3rem;
        }
        .stat-label {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--t3);
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        /* INFO GRID */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .info-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 24px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .info-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 119, 255, 0.25);
          background: rgba(255, 255, 255, 0.95);
        }
        .info-card h3 {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 0.75rem;
        }
        .info-card p {
          font-size: 0.85rem;
          color: var(--t3);
          line-height: 1.6;
          margin-bottom: 1rem;
        }
        .info-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--c);
          text-decoration: none;
          transition: gap 0.2s;
        }
        .info-link:hover {
          gap: 0.5rem;
          color: var(--cy);
        }

        /* TEAM CARD */
        .team-card {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 24px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .team-card h3 {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 1rem;
        }
        .team-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5rem;
        }
        .team-table th,
        .team-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgba(0, 119, 255, 0.1);
          font-size: 0.85rem;
        }
        .team-table th {
          font-weight: 700;
          color: var(--t2);
          background: rgba(0, 119, 255, 0.03);
        }
        .team-table td {
          color: var(--t3);
        }
        .empty-team {
          text-align: center;
          padding: 2rem;
          color: var(--tm);
          font-size: 0.85rem;
          background: rgba(0, 119, 255, 0.03);
          border-radius: 16px;
          margin-bottom: 1.5rem;
        }
        .team-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        .btn-outline {
          background: transparent;
          border: 1.5px solid rgba(0, 119, 255, 0.3);
          border-radius: 40px;
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          font-size: 0.8rem;
          color: var(--c);
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-outline:hover {
          background: rgba(0, 119, 255, 0.08);
          border-color: var(--c);
        }
        .btn-primary {
          background: linear-gradient(135deg, var(--c), var(--cy));
          border: none;
          border-radius: 40px;
          padding: 0.6rem 1.2rem;
          font-weight: 600;
          font-size: 0.8rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0, 119, 255, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 119, 255, 0.4);
        }

        .wizard-modul {
        position: fixed;
top: 0;
left: 0;
width: 100%;
height: 100%;
display: flex;
align-items: center;
justify-content: center;
z-index: 1000;
        }
        /* ANIMATION */
        .a {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--d, 0s);
        }
        .ai {
          opacity: 1;
          transform: none;
        }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 768px) {
          .main-content {
            padding: 1.5rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .nav-in {
            padding: 0.75rem 1rem;
          }
          .brand-name {
            display: none;
          }
          .ui {
            display: none;
          }
          .welcome-title {
            font-size: 1.4rem;
          }
        }
      `}</style>
    </div>
  );
}