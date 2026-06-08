// app/juri/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import Link from 'next/link';

/* ── CURSOR SPOTLIGHT ── */
function CursorSpotlight() {
  const ref = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -999, y: -999 });
  const raf = useRef<number>(0);
  useEffect(() => {
    const move = (e: MouseEvent) => { pos.current = { x: e.clientX, y: e.clientY }; };
    const tick = () => {
      if (ref.current) ref.current.style.transform = `translate(${pos.current.x - 250}px,${pos.current.y - 250}px)`;
      raf.current = requestAnimationFrame(tick);
    };
    window.addEventListener('mousemove', move, { passive: true });
    raf.current = requestAnimationFrame(tick);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf.current); };
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

/* ── PARTICLE CANVAS ── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    let raf: number;
    const colors = ['#0077ff', '#00d4ff', '#00c896', '#38bdf8'];
    const pts: { x: number; y: number; vx: number; vy: number; r: number; a: number; c: string }[] = [];
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize(); window.addEventListener('resize', resize);
    for (let i = 0; i < 55; i++) pts.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 0.5, a: Math.random() * 0.35 + 0.08,
      c: colors[Math.floor(Math.random() * colors.length)],
    });
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.c; ctx.globalAlpha = p.a; ctx.fill();
      });
      ctx.globalAlpha = 1;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,150,255,${0.08 * (1 - d / 120)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

/* ── FLOATING BLOBS ── */
function FloatingBlobs() {
  return (
    <>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </>
  );
}

interface SubmissionForJudge {
  id: number;
  team_name: string;
  title: string;
  status: string;
}

export default function JuriDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<SubmissionForJudge[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) setScrollPct(Math.min((window.scrollY / h) * 100, 100));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!loading){
      if (!user) { router.push('/auth/login'); }
      else if (user.role !== 'juri') router.push('/dashboard');
    } [user, loading, router]
    const fetchSubmissions = async () => {
      try {
        const res = await api.get('/juri/submissions');
        setSubmissions(res.data);
      } catch (err) {
        console.error('Gagal mengambil data submission:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  // Animasi on scroll
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('ai');
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.a').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-root">
        <div className="loading-screen">Memuat dashboard juri...</div>
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
            background: rgba(255,255,255,0.8);
            backdrop-filter: blur(12px);
            padding: 2rem 3rem;
            border-radius: 28px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          }
        `}</style>
      </div>
    );
  }

  // Statistik singkat (opsional)
  const stats = [
    { label: 'Total Submission', value: submissions.length, icon: '📄' },
    { label: 'Perlu Dinilai', value: submissions.filter(s => s.status === 'pending').length, icon: '⏳' },
    { label: 'Sudah Dinilai', value: submissions.filter(s => s.status === 'scored').length, icon: '✅' },
  ];

  return (
    <div className="dashboard-root">
      <CursorSpotlight />
      <div className="bg-layer">
        <ParticleCanvas />
        <FloatingBlobs />
        <div className="bg-grid" />
      </div>

      {/* NAVBAR dengan efek glass */}
      <nav className={`nav ${scrolled ? 'nav-s' : ''}`}>
        <div className="nav-prog"><div style={{ width: `${scrollPct}%` }} className="nav-prog-fill" /></div>
        <div className="nav-in">
          <div className="nav-brand">
            <Link href="/" className="brand-link">
              <div className="brand-icon">H</div>
              <span className="brand-name">Hackathon MPR RI</span>
            </Link>
          </div>
          <div className="nav-r">
            <div className="nav-user">
              <div className="uav">{(user?.name || 'J').charAt(0).toUpperCase()}</div>
              <div className="ui">
                <span className="un">{user?.name || 'Juri'}</span>
                <span className="ur">Juri</span>
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
              Dashboard Juri, <span className="welcome-name">{user?.name}</span>
            </h1>
            <p className="welcome-sub">
              Berikan penilaian objektif untuk setiap submission berdasarkan rubrik yang telah ditentukan.
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

          {/* Daftar Submission yang Perlu Dinilai */}
          <div className="submission-card a" style={{ '--d': '0.3s' } as any}>
            <h3>📝 Submission yang Perlu Dinilai</h3>
            {submissions.length === 0 ? (
              <p className="empty-submission">Belum ada submission yang perlu dinilai.</p>
            ) : (
              <div className="submission-grid">
                {submissions.map((sub, idx) => (
                  <div key={sub.id} className="submission-item a" style={{ '--d': `${0.4 + idx * 0.05}s` } as any}>
                    <div className="submission-header">
                      <span className="team-name">{sub.team_name}</span>
                      <span className={`status-badge ${sub.status === 'pending' ? 'status-pending' : 'status-done'}`}>
                        {sub.status === 'pending' ? 'Belum Dinilai' : 'Sudah Dinilai'}
                      </span>
                    </div>
                    <h4 className="submission-title">{sub.title}</h4>
                    <button
                      className="btn-score"
                      onClick={() => router.push(`/juri/submissions/${sub.id}/score`)}
                    >
                      {sub.status === 'pending' ? 'Nilai Submission →' : 'Lihat Nilai →'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Informasi Tambahan */}
          <div className="info-card a" style={{ '--d': '0.5s' } as any}>
            <h3>📌 Panduan Penilaian</h3>
            <p>Gunakan rubrik yang telah disediakan untuk memberikan skor pada setiap aspek: inovasi, teknis, presentasi, dan dampak.</p>
            <Link href="/juri/rubric" className="info-link">Lihat Rubrik Penilaian →</Link>
          </div>
        </div>
      </main>

      {/* STYLES - konsisten dengan landing page */}
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
        * { margin: 0; padding: 0; box-sizing: border-box; }
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
          background-image: linear-gradient(rgba(0,119,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,119,255,0.03) 1px, transparent 1px);
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
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(0,119,255,0.12), transparent 70%);
          top: -200px; left: -150px;
          animation: floatBlob 16s ease-in-out infinite;
        }
        .b2 {
          width: 450px; height: 450px;
          background: radial-gradient(circle, rgba(0,212,255,0.1), transparent 70%);
          bottom: -150px; right: -120px;
          animation: floatBlob 18s ease-in-out infinite reverse;
        }
        .b3 {
          width: 320px; height: 320px;
          background: radial-gradient(circle, rgba(0,200,150,0.08), transparent 65%);
          top: 30%; left: 30%;
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
          background: rgba(255,255,255,0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,119,255,0.12);
          transition: all 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .nav.nav-s {
          background: rgba(255,255,255,0.25);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 2px solid rgba(0,119,255,0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,119,255,0.05) inset;
        }
        .nav-prog {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(0,119,255,0.06);
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
          box-shadow: 0 4px 12px rgba(0,119,255,0.3);
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
          box-shadow: 0 0 0 3px rgba(0,119,255,0.15);
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
          background: rgba(0,119,255,0.08);
          border: 1px solid rgba(0,119,255,0.2);
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
          background: rgba(239,68,68,0.15);
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

        /* Welcome Card */
        .welcome-card {
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,119,255,0.15);
          border-radius: 28px;
          padding: 2rem 2rem;
          margin-bottom: 2.5rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,119,255,0.08);
          transition: all 0.4s ease;
        }
        .welcome-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 28px 50px rgba(0,119,255,0.12);
          border-color: rgba(0,119,255,0.25);
        }
        .welcome-glow {
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(0,119,255,0.08), transparent 70%);
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

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,119,255,0.12);
          border-radius: 24px;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(0,0,0,0.02);
        }
        .stat-card:hover {
          transform: translateY(-5px);
          border-color: rgba(0,119,255,0.3);
          box-shadow: 0 12px 32px rgba(0,119,255,0.1);
          background: rgba(255,255,255,0.95);
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

        /* Submission Card */
        .submission-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,119,255,0.12);
          border-radius: 24px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .submission-card h3 {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 1rem;
        }
        .submission-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        .submission-item {
          background: rgba(255,255,255,0.5);
          border-radius: 20px;
          padding: 1rem;
          border: 1px solid rgba(0,119,255,0.1);
          transition: all 0.25s;
        }
        .submission-item:hover {
          background: rgba(255,255,255,0.8);
          transform: translateY(-3px);
          border-color: rgba(0,119,255,0.2);
        }
        .submission-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .team-name {
          font-weight: 700;
          color: var(--t2);
          font-size: 0.9rem;
        }
        .status-badge {
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
        }
        .status-pending {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .status-done {
          background: rgba(16,185,129,0.1);
          color: #10b981;
          border: 1px solid rgba(16,185,129,0.2);
        }
        .submission-title {
          font-size: 0.9rem;
          color: var(--t3);
          margin-bottom: 1rem;
        }
        .btn-score {
          background: linear-gradient(135deg, var(--c), var(--cy));
          border: none;
          border-radius: 40px;
          padding: 0.5rem 1rem;
          font-weight: 600;
          font-size: 0.75rem;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
        }
        .btn-score:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,119,255,0.4);
        }
        .empty-submission {
          text-align: center;
          padding: 2rem;
          color: var(--tm);
          font-size: 0.85rem;
          background: rgba(0,119,255,0.03);
          border-radius: 16px;
        }

        /* Info Card */
        .info-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(0,119,255,0.12);
          border-radius: 24px;
          padding: 1.5rem;
        }
        .info-card h3 {
          font-family: 'Clash Display', sans-serif;
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--t1);
          margin-bottom: 0.5rem;
        }
        .info-card p {
          font-size: 0.85rem;
          color: var(--t3);
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

        /* Animation */
        .a {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1);
          transition-delay: var(--d, 0s);
        }
        .ai {
          opacity: 1;
          transform: none;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
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
          .submission-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}