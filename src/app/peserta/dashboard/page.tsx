// app/peserta/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTeam } from '@/hooks/useTeam';
import TeamRegistrationWizard from '@/components/TeamRegistrationWizard';
import Link from 'next/link';

/* ---------- CURSOR SPOTLIGHT ---------- */
function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      if (ref.current) ref.current.style.transform = `translate(${pos.current.x - 250}px, ${pos.current.y - 250}px)`;
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
    <div ref={ref} style={{
      position: 'fixed', top: 0, left: 0, width: 500, height: 500,
      borderRadius: '50%', pointerEvents: 'none', zIndex: 9999,
      background: 'radial-gradient(circle, rgba(0,119,255,0.07) 0%, rgba(0,212,255,0.04) 35%, transparent 70%)',
      willChange: 'transform', mixBlendMode: 'multiply',
    }} />
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
    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string }[] = [];
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
    <canvas ref={canvasRef} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    }} />
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
  const [showWizard, setShowWizard] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Scroll listener untuk navbar progress
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
    if (!teamLoading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (user.role !== 'peserta') {
        router.replace('/dashboard');
      }
    }
  }, [user, teamLoading, router]);

  // Tampilkan wizard jika user belum punya tim
  useEffect(() => {
    if (!teamLoading && user && !hasTeam) {
      setShowWizard(true);
    } else {
      setShowWizard(false);
    }
  }, [teamLoading, user, hasTeam]);

  const handleWizardSuccess = async () => {
    setShowWizard(false);
    await fetchTeam();
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeam();
    setRefreshing(false);
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

  if (teamLoading) {
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
          {/* PROFILE HEADER */}
          <div className="profile-card a">
            <div className="profile-glow" />
            <div className="profile-avatar">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{user?.name}</h1>
              <p className="profile-email">{user?.email}</p>
              <span className="role-badge">Peserta</span>
            </div>
          </div>

          {/* INFORMASI TIM */}
          {hasTeam && team && (
            <div className="team-section a" style={{ '--d': '0.15s' } as any}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className="section-title">📋 Informasi Tim</h2>
                <button onClick={handleRefresh} className="refresh-btn" disabled={refreshing}>
                  {refreshing ? '🔄 Memuat...' : '🔄 Refresh'}
                </button>
              </div>
              <div className="team-card">
                <div className="team-row">
                  <span className="team-label">Nama Tim</span>
                  <span className="team-value">{team.team_name}</span>
                </div>
                <div className="team-row">
                  <span className="team-label">Institusi</span>
                  <span className="team-value">{team.institution || '-'}</span>
                </div>
                <div className="team-row">
                  <span className="team-label">Kota</span>
                  <span className="team-value">{team.city || '-'}</span>
                </div>
                <div className="team-row selection-status-row">
                  <span className="team-label">Status Seleksi</span>
                  <span className={`status-badge ${team.selection_status || 'pending'}`}>
                    {team.selection_status === 'pending' && '⏳ Menunggu Verifikasi'}
                    {team.selection_status === 'approved' && '✅ Lolos Seleksi'}
                    {team.selection_status === 'rejected' && '❌ Tidak Lolos'}
                    {!team.selection_status && '⏳ Menunggu Verifikasi'}
                  </span>
                </div>
                {team.selection_note && (
                  <div className="team-row note-row">
                    <span className="team-label">Catatan</span>
                    <span className="team-note">{team.selection_note}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* WIZARD MODAL */}
      <TeamRegistrationWizard isOpen={showWizard} onSuccess={handleWizardSuccess} />

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
        .refresh-btn {
          background: rgba(0, 119, 255, 0.1);
          border: 1px solid rgba(0, 119, 255, 0.3);
          border-radius: 40px;
          padding: 0.4rem 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--c);
          cursor: pointer;
          transition: all 0.2s;
        }
        .refresh-btn:hover:not(:disabled) {
          background: rgba(0, 119, 255, 0.2);
          transform: translateY(-1px);
        }
        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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

        /* PROFILE CARD */
        .profile-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.15);
          border-radius: 32px;
          padding: 1.8rem;
          margin-bottom: 2.5rem;
          display: flex;
          align-items: center;
          gap: 1.8rem;
          position: relative;
          overflow: hidden;
          transition: all 0.4s ease;
        }
        .profile-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 119, 255, 0.3);
          box-shadow: 0 20px 40px rgba(0, 119, 255, 0.12);
        }
        .profile-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0, 119, 255, 0.08), transparent 70%);
          pointer-events: none;
        }
        .profile-avatar {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, var(--c), var(--cy));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          color: white;
          box-shadow: 0 8px 20px rgba(0, 119, 255, 0.3);
        }
        .profile-info {
          flex: 1;
        }
        .profile-name {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 0.25rem;
        }
        .profile-email {
          font-size: 0.9rem;
          color: var(--t3);
          margin-bottom: 0.5rem;
        }
        .role-badge {
          display: inline-block;
          background: rgba(0, 119, 255, 0.12);
          color: var(--c);
          font-weight: 700;
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0.3rem 1rem;
          border-radius: 100px;
          border: 1px solid rgba(0, 119, 255, 0.2);
        }

        /* TEAM SECTION */
        .section-title {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 1rem;
        }
        .team-card {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0, 119, 255, 0.15);
          border-radius: 28px;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .team-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0, 119, 255, 0.25);
          box-shadow: 0 12px 28px rgba(0, 119, 255, 0.1);
        }
        .team-row {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          padding: 0.7rem 0;
          border-bottom: 1px solid rgba(0, 119, 255, 0.08);
        }
        .team-row:last-child {
          border-bottom: none;
        }
        .team-label {
          width: 130px;
          font-weight: 700;
          font-size: 0.85rem;
          color: var(--t2);
        }
        .team-value {
          flex: 1;
          font-size: 0.9rem;
          color: var(--t1);
          font-weight: 500;
        }
        .status-badge {
          padding: 0.25rem 0.8rem;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          display: inline-block;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #b45309;
        }
        .status-badge.approved {
          background: #d1fae5;
          color: #065f46;
        }
        .status-badge.rejected {
          background: #fee2e2;
          color: #991b1b;
        }
        .team-note {
          flex: 1;
          font-size: 0.85rem;
          color: #4b5563;
          background: #f8fafc;
          padding: 0.4rem 0.8rem;
          border-radius: 12px;
        }

        /* ANIMATION SCROLL */
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
        @media (max-width: 768px) {
          .main-content {
            padding: 1.5rem;
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
          .profile-card {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }
          .team-row {
            flex-direction: column;
            gap: 0.3rem;
          }
          .team-label {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
}