'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePeserta } from '@/hooks/usePeserta';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/peserta/navbar';
import SideBar from '@/components/layout/peserta/sidebarMenu';

// ═══════════════════════════════════════════════════════
// MAPPING POSITION DARI BACKEND KE LABEL FRONTEND
// ═══════════════════════════════════════════════════════
const positionLabels: Record<string, string> = {
  ketua: 'Ketua',
  anggota1: 'Anggota 1',
  anggota2: 'Anggota 2',
};

/* ═══════════════════════════════════════════════════════
   CURSOR SPOTLIGHT
═══════════════════════════════════════════════════════ */
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
      background: 'radial-gradient(circle, rgba(79,70,229,0.07) 0%, rgba(14,165,233,0.04) 35%, transparent 70%)',
      willChange: 'transform', mixBlendMode: 'multiply',
    }} />
  );
}

/* ═══════════════════════════════════════════════════════
   PARTICLE CANVAS
═══════════════════════════════════════════════════════ */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const colors = ['#4F46E5', '#0EA5E9', '#059669', '#38BDF8'];
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
            ctx.strokeStyle = `rgba(79,70,229,${0.08 * (1 - d / 120)})`;
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

/* ═══════════════════════════════════════════════════════
   FLOATING BLOBS
═══════════════════════════════════════════════════════ */
function FloatingBlobs() {
  return (
    <>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function ProfilePage() {
  const { profile, fetchProfile } = usePeserta();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Scroll listener
  useEffect(() => {
    const fn = () => {
      setScrolled(window.scrollY > 20);
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(h > 0 ? Math.min((window.scrollY / h) * 100, 100) : 0);
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const fn = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest('.nav-pill')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [menuOpen]);

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [profile]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!profile) {
    return (
      <div className="loader-root">
        <div className="loader-card">
          <div className="loader-rings"><div className="lr lr1" /><div className="lr lr2" /><div className="lr lr3" /></div>
          <p className="loader-text">Memuat profil tim...</p>
        </div>
        <style jsx>{`
          .loader-root {
            min-height: 100vh;
            background: #F8FAFF;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', system-ui, sans-serif;
          }
          .loader-card {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            background: white;
            border: 1px solid rgba(79,70,229,0.10);
            border-radius: 28px;
            padding: 3rem 4rem;
            box-shadow: 0 10px 40px rgba(79,70,229,0.10);
          }
          .loader-rings { position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; }
          .lr { position: absolute; border-radius: 50%; border-style: solid; border-color: transparent; }
          .lr1 { inset: 0; border-width: 3px; border-top-color: #4F46E5; animation: spinRing 0.9s linear infinite; }
          .lr2 { inset: 7px; border-width: 2.5px; border-right-color: #0EA5E9; animation: spinRingReverse 1.1s linear infinite; }
          .lr3 { inset: 14px; border-width: 2px; border-bottom-color: #059669; animation: spinRing 1.3s linear infinite; }
          @keyframes spinRing { to { transform: rotate(360deg); } }
          @keyframes spinRingReverse { to { transform: rotate(-360deg); } }
          .loader-text { font-size: 0.88rem; font-weight: 500; color: #94A3B8; }
        `}</style>
      </div>
    );
  }

  const getPositionLabel = (position: string): string => {
    return positionLabels[position] || position;
  }

  return (
    <div className="root">
      <CursorSpotlight />
      <div className="bg" aria-hidden>
        <div className="bg-noise" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-lines" />
        <ParticleCanvas />
        <FloatingBlobs />
      </div>

      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} scrolled={scrolled} scrollPercent={scrollPct} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>

      {/* MAIN CONTENT */}
      <main className="main">
        <div className="two-columns">
          <aside>
            {/* Back link dengan border white */}
            <div className="back-link-wrap fade-up" style={{ '--fd': '0ms'} as React.CSSProperties}>
              <Link href="/peserta/dashboard" className="back-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                Kembali ke Dashboard
              </Link>
            </div>
            <SideBar />
          </aside>

          <div className="content">
            {/* HERO */}
            <div className="hero fade-up" style={{ '--fd': '0ms' } as React.CSSProperties}>
              <div className="hero-left">
                <h1 className="hero-h1">Profil Tim</h1>
                <p className="hero-lead">Informasi lengkap tim dan dokumen pendaftaran</p>
              </div>
              <div className="hero-stats">
                <div className="stat-badge">
                  <span className="stat-badge-icon">👥</span>
                  <span>{profile.members.length} Anggota</span>
                </div>
                <div className="stat-badge">
                  <span className="stat-badge-icon">📄</span>
                  <span>{profile.documents.length} Dokumen</span>
                </div>
              </div>
            </div>

            {/* CARD UTAMA: Informasi Tim + Anggota Tim (dua kolom) */}
            <div className="main-card fade-up" style={{ '--fd': '80ms' } as React.CSSProperties}>
              <div className="main-card-inner">
                {/* Kolom Kiri: Informasi Tim (1 column down) */}
                <div className="info-section">
                  <div className="section-header">
                    <div className="section-icon">🏢</div>
                    <div>
                      <h2 className="section-title">Informasi Tim</h2>
                      <p className="section-subtitle">Data pendaftaran tim peserta</p>
                    </div>
                  </div>
                  <div className="info-list">
                    <div className="info-row">
                      <span className="info-label">Nama Tim</span>
                      <span className="info-value">{profile.team.team_name}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Institusi</span>
                      <span className="info-value">{profile.team.institution || '-'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Kota</span>
                      <span className="info-value">{profile.team.city || '-'}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Status Seleksi</span>
                      <span className="info-value status-badge">{profile.team.selection_status}</span>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Anggota Tim (dengan background white, border, outline) */}
                <div className="members-section">
                  <div className="section-header">
                    <div className="section-icon">👥</div>
                    <div>
                      <h2 className="section-title">Anggota Tim</h2>
                      <p className="section-subtitle">Data lengkap ketua dan anggota</p>
                    </div>
                  </div>
                  <div className="members-list">
                    {profile.members.map((m: any, idx: number) => (
                      <div key={m.id} className="member-item" style={{ animationDelay: `${idx * 50}ms` }}>
                        <div className="member-avatar">{m.name.charAt(0).toUpperCase()}</div>
                        <div className="member-details">
                          <div className="member-name">{m.name} <span className="member-role">({getPositionLabel(m.position)})</span></div>
                          <div className="member-meta">📧 {m.email}</div>
                          <div className="member-meta">🎓 NIM: {m.nim}</div>
                          <div className="member-meta">🏛️ {m.faculty}</div>
                          <div className="member-meta">📚 {m.study_program}</div>
                          {m.shirt_size && <div className="member-meta">👕 Ukuran Baju: {m.shirt_size}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CARD DOKUMEN (3 kolom) */}
            <div className="doc-card fade-up" style={{ '--fd': '200ms' } as React.CSSProperties}>
              <div className="section-header">
                <div className="section-icon">📄</div>
                <div>
                  <h2 className="section-title">Dokumen Pendaftaran</h2>
                  <p className="section-subtitle">Berkas yang sudah diunggah</p>
                </div>
              </div>
              <div className="docs-grid">
                {profile.documents.map((doc: any) => (
                  <a key={doc.id} href={doc.external_link || doc.file_url} target="_blank" rel="noopener noreferrer" className="doc-item">
                    <div className="doc-icon">{doc.external_link ? '🔗' : '📎'}</div>
                    <div className="doc-info">
                      <div className="doc-name">{doc.type.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="doc-filename">{doc.file_name || doc.external_link?.slice(0, 30)}</div>
                    </div>
                    <div className="doc-arrow">→</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root {
          --indigo:#4F46E5; --indigo-50:#EEF2FF; --indigo-100:#E0E7FF; --indigo-200:#C7D2FE;
          --sky:#0EA5E9; --emerald:#059669; --rose:#F43F5E;
          --ink:#0F172A; --ink-2:#334155; --ink-3:#64748B; --ink-4:#94A3B8;
          --white:#FFFFFF; --bg:#F8FAFF; --surface:#FFFFFF; --surface-2:#F1F5FF;
          --border:rgba(79,70,229,0.10); --sh-sm:0 4px 16px rgba(79,70,229,0.08);
          --sh-md:0 10px 36px rgba(79,70,229,0.12); --sh-lg:0 24px 64px rgba(79,70,229,0.16);
          --r-lg:24px; --r-xl:32px; --r-2xl:40px;
          --ff-display:'Bricolage Grotesque',system-ui,sans-serif;
          --ff-body:'DM Sans',system-ui,sans-serif;
          --ease:cubic-bezier(0.22,1,0.36,1);
        }
        body { background: var(--bg); font-family: var(--ff-body); color: var(--ink); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        a { text-decoration: none; color: inherit; }
        @keyframes orbDrift { 0%,100%{transform:translate(0,0) scale(1);} 40%{transform:translate(24px,-18px) scale(1.05);} 70%{transform:translate(-16px,12px) scale(0.97);} }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0%{transform:translateX(-100%) skewX(-12deg);} 100%{transform:translateX(200%) skewX(-12deg);} }
        @keyframes fadeUpIn { from{opacity:0;transform:translateY(28px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { opacity: 0; transform: translateY(28px); transition: opacity 0.6s var(--ease), transform 0.6s var(--ease); transition-delay: var(--fd, 0ms); }
        .fade-up.in { opacity: 1; transform: translateY(0); }
      `}</style>

      <style jsx>{`
        .root { min-height: 100vh; position: relative; overflow-x: clip; }

        /* BACKGROUND */
        .bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .bg-noise { position: absolute; inset: 0; opacity: 0.025; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(80px); animation: orbDrift 22s ease-in-out infinite; }
        .bg-orb-1 { width: 640px; height: 640px; background: radial-gradient(circle, rgba(79,70,229,0.09) 0%, transparent 65%); top: -200px; left: -180px; }
        .bg-orb-2 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%); bottom: -100px; right: -100px; animation-duration: 28s; animation-direction: reverse; }
        .bg-lines { position: absolute; inset: 0; background-image: linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px); background-size: 52px 52px; mask-image: radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%); }
        .blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .b1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(79,70,229,0.12), transparent 70%); top: -200px; left: -150px; animation: orbDrift 16s ease-in-out infinite; }
        .b2 { width: 450px; height: 450px; background: radial-gradient(circle, rgba(14,165,233,0.1), transparent 70%); bottom: -150px; right: -120px; animation: orbDrift 18s ease-in-out infinite reverse; }
        .b3 { width: 320px; height: 320px; background: radial-gradient(circle, rgba(5,150,105,0.08), transparent 65%); top: 30%; left: 30%; animation: orbDrift 14s ease-in-out infinite 1s; }
        
        /* MAIN */
        .main { position: relative; z-index: 1; padding: 2rem 2rem 4rem; }
        .two-columns {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
          max-width: 1400px;
          margin: 0 auto;
        }

        aside {
          flex: 0 0 240px;
          position: sticky;
          top: 2rem;
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Back link with white border */
        .back-link-wrap {
          display: inline-block;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 40px;
          padding: 0.4rem 1rem 0.4rem 0.8rem;
          transition: box-shadow 0.2s, border-color 0.2s;
          margin-bottom: 1.2rem;
        }
        .back-link-wrap:hover {
          border-color: var(--indigo);
          box-shadow: var(--sh-sm);
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--indigo);
        }

        /* HERO */
        .hero { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .hero-h1 { font-family: var(--ff-display); font-size: 2.2rem; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; margin: 0.5rem 0 0.5rem; }
        .hero-lead { font-size: 0.9rem; color: var(--ink-3); }
        .hero-stats { display: flex; gap: 1rem; }
        .stat-badge { display: flex; align-items: center; gap: 0.5rem; background: var(--white); border: 1px solid var(--border); border-radius: 999px; padding: 0.5rem 1rem; font-size: 0.8rem; font-weight: 500; color: var(--ink-2); box-shadow: var(--sh-sm); }
        .stat-badge-icon { font-size: 1rem; }

        /* MAIN CARD (dua kolom) */
        .main-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          overflow: hidden;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .main-card:hover {
          border-color: var(--indigo-200);
          box-shadow: var(--sh-lg), 0 0 0 4px rgba(79,70,229,0.05);
          transform: translateY(-3px);
        }
        .main-card-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }

        /* Info section (kiri) */
        .info-section {
          padding: 1.8rem 2rem;
          background: var(--surface-2);
          border-right: 1px solid var(--border);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.2rem;
        }
        .section-icon {
          font-size: 1.8rem;
          width: 50px;
          height: 50px;
          background: var(--white);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          flex-shrink: 0;
        }
        .section-title {
          font-family: var(--ff-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink);
        }
        .section-subtitle {
          font-size: 0.75rem;
          color: var(--ink-4);
        }

        .info-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.4rem 0;
          border-bottom: 1px solid rgba(79,70,229,0.06);
        }
        .info-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--ink-3);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .info-value {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--ink);
        }
        .status-badge {
          text-transform: capitalize;
          background: var(--indigo-50);
          padding: 0.15rem 0.6rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
        }

        /* Members section (kanan) dengan background putih, border, outline */
        .members-section {
          padding: 1.8rem 2rem;
          background: white;
          border-left: 1px solid var(--border);
          outline: 2px solid white;
          outline-offset: -1px;
        }
        .members-list {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          max-height: none;
          overflow: visible;
        }

        .member-item {
          display: flex;
          gap: 0.8rem;
          padding: 0.7rem 1rem;
          background: var(--surface-2);
          border-radius: var(--r-lg);
          border: 1px solid var(--border);
          transition: all 0.2s;
          animation: fadeUpIn 0.5s var(--ease) both;
          animation-delay: var(--delay,0ms);
        }
        .member-item:hover {
          transform: translateY(-2px);
          border-color: var(--indigo-200);
          box-shadow: var(--sh-sm);
        }
        .member-avatar {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, var(--indigo), var(--sky));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .member-details {
          flex: 1;
          min-width: 0;
        }
        .member-name {
          font-weight: 700;
          color: var(--ink);
          font-size: 0.9rem;
        }
        .member-role {
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--indigo);
          background: var(--indigo-50);
          padding: 0.1rem 0.4rem;
          border-radius: 999px;
          margin-left: 0.4rem;
        }
        .member-meta {
          font-size: 0.7rem;
          color: var(--ink-3);
          margin-top: 0.1rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        /* DOKUMEN CARD (3 kolom) */
        .doc-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 1.5rem 1.8rem;
          transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
        }
        .doc-card:hover {
          border-color: var(--indigo-200);
          box-shadow: var(--sh-lg), 0 0 0 4px rgba(79,70,229,0.05);
          transform: translateY(-3px);
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }

        .doc-item {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.9rem 1rem;
          background: var(--surface-2);
          border-radius: var(--r-lg);
          border: 1px solid var(--border);
          transition: all 0.2s;
          text-decoration: none;
          color: inherit;
        }
        .doc-item:hover {
          transform: translateY(-3px);
          border-color: var(--indigo-200);
          background: var(--white);
          box-shadow: var(--sh-sm);
        }
        .doc-icon { font-size: 1.3rem; width: 38px; height: 38px; background: var(--white); border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .doc-info { flex: 1; min-width: 0; }
        .doc-name { font-weight: 700; font-size: 0.8rem; color: var(--ink); text-transform: capitalize; }
        .doc-filename { font-size: 0.65rem; color: var(--ink-4); margin-top: 0.1rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .doc-arrow { color: var(--ink-4); transition: transform 0.2s; flex-shrink: 0; }
        .doc-item:hover .doc-arrow { transform: translateX(4px); color: var(--indigo); }

        /* RESPONSIVE */
        @media (max-width: 1024px) {
          .two-columns {
            flex-direction: column;
          }
          aside {
            flex: 1;
            position: static;
          }
          .main-card-inner {
            grid-template-columns: 1fr;
          }
          .info-section {
            border-right: none;
            border-bottom: 1px solid var(--border);
          }
          .members-section {
            border-left: none;
            outline: none;
          }
          .docs-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .main { padding: 1rem; }
          .hero { flex-direction: column; align-items: flex-start; gap: 1rem; }
          .hero-h1 { font-size: 1.8rem; }
          .docs-grid { grid-template-columns: 1fr; }
          .member-item { flex-direction: column; align-items: center; text-align: center; }
          .member-avatar { width: 56px; height: 56px; font-size: 1.4rem; }
          .member-meta { justify-content: center; }
          .main-card-inner { gap: 0; }
        }
      `}</style>
    </div>
  );
}