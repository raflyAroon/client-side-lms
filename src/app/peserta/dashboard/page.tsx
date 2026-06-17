// app/peserta/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTeam } from '@/hooks/useTeam';
import TeamRegistrationWizard from '@/components/TeamRegistrationWizard';
import Navbar from '@/components/layout/peserta/navbar';
import SidebarMenu from '@/components/layout/peserta/sidebarMenu';
import Link from 'next/link';

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER
═══════════════════════════════════════════════════════ */
function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const [val, setVal] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || ran.current) return;
        ran.current = true;
        obs.disconnect();
        const duration = 1400;
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / duration, 1);
          const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          setVal(Math.round(ease * to));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);

  return <span ref={spanRef}>{prefix}{val}{suffix}</span>;
}

/* ═══════════════════════════════════════════════════════
   ACTION CARD (tanpa tilt, hanya fade-up)
═══════════════════════════════════════════════════════ */
interface ActionCardProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  colorVar: string;
  delay?: number;
}

function ActionCard({ href, icon, label, colorVar, delay = 0 }: ActionCardProps) {
  return (
    <Link
      href={href}
      className="ac-link fade-up"
      style={{ '--fd': `${delay}ms` } as React.CSSProperties}
    >
      <div className="ac">
        <div className="ac-icon-box" style={{ '--ic': colorVar } as React.CSSProperties}>
          {icon}
        </div>
        <div className="ac-body">
          <span className="ac-label">{label}</span>
        </div>
      </div>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════
   SVG ICONS
═══════════════════════════════════════════════════════ */
const IconStatus = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
  </svg>
);
const IconTeam = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);
const IconCode = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);
const IconBolt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function PesertaDashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { team, loading: teamLoading, fetchTeam, hasTeam } = useTeam();
  const [showWizard, setShowWizard] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll progress
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

  // Auth guard
  useEffect(() => {
    if (!teamLoading) {
      if (!user) router.replace('/auth/login');
      else if (user.role !== 'peserta') router.replace('/dashboard');
    }
  }, [user, teamLoading, router]);

  // Wizard
  useEffect(() => {
    if (!teamLoading && user && !hasTeam) setShowWizard(true);
    else setShowWizard(false);
  }, [teamLoading, user, hasTeam]);

  // Scroll-reveal (fade-up) untuk konten kanan
  useEffect(() => {
    if (teamLoading) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    const t = setTimeout(() => {
      document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    }, 60);
    return () => { clearTimeout(t); obs.disconnect(); };
  }, [teamLoading]);

  const handleWizardSuccess = async () => { setShowWizard(false); await fetchTeam(); };
  const handleLogout = async () => { await logout(); router.push('/'); };

  const initials = (user?.name || 'U').charAt(0).toUpperCase();
  const firstName = user?.name?.split(' ')[0] || 'Peserta';

  const statusLabel =
    team?.selection_status === 'lolos_seleksi' ? 'Lolos Seleksi'
    : team?.selection_status === 'rejected'     ? 'Tidak Lolos'
    : team?.selection_status ?? 'Menunggu';
  const statusColor =
    team?.selection_status === 'lolos_seleksi' ? '#059669'
    : team?.selection_status === 'rejected'     ? '#dc2626'
    : '#4F46E5';

  // Loading screen
  if (teamLoading) {
    return (
      <div className="loader-root">
        <div className="loader-card">
          <div className="loader-rings">
            <div className="lr lr1" /><div className="lr lr2" /><div className="lr lr3" />
          </div>
          <p className="loader-text">Memuat dashboard…</p>
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
          .loader-rings {
            position: relative;
            width: 52px;
            height: 52px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .lr {
            position: absolute;
            border-radius: 50%;
            border-style: solid;
            border-color: transparent;
          }
          .lr1 {
            inset: 0;
            border-width: 3px;
            border-top-color: #4F46E5;
            animation: spinRing 0.9s linear infinite;
          }
          .lr2 {
            inset: 7px;
            border-width: 2.5px;
            border-right-color: #0EA5E9;
            animation: spinRingReverse 1.1s linear infinite;
          }
          .lr3 {
            inset: 14px;
            border-width: 2px;
            border-bottom-color: #059669;
            animation: spinRing 1.3s linear infinite;
          }
          @keyframes spinRing {
            to { transform: rotate(360deg); }
          }
          @keyframes spinRingReverse {
            to { transform: rotate(-360deg); }
          }
          .loader-text {
            font-size: 0.88rem;
            font-weight: 500;
            color: #94A3B8;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="root">

      {/* Background dekoratif */}
      <div className="bg" aria-hidden>
        <div className="bg-noise" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-lines" />
      </div>

      <Navbar user={user} onLogout={handleLogout} scrolled={scrolled} scrollPercent={scrollPct} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="main">
        <div className="dashboard-layout">
          {/* SIDEBAR KIRI - Sticky dengan 3 Action Cards */}
          <aside className="sidebar">
            <SidebarMenu/>  
          </aside>

          {/* KONTEN UTAMA KANAN */}
          <div className="content-main">
            {/* Hero Section */}
            <section className="hero fade-up" style={{ '--fd': '0ms' } as React.CSSProperties}>
              <div className="hero-left">
                <span className="hero-chip">
                  <span className="hero-chip-dot" />
                  Dashboard Peserta
                </span>
                <h1 className="hero-h1">
                  Halo,{' '}
                  <span className="hero-accent">{firstName}</span>
                  <span className="hero-wave"> 👋</span>
                </h1>
                <p className="hero-lead">
                  Pantau progres tim, cek status seleksi, dan kumpulkan karyamu — semua dari sini.
                </p>
                {hasTeam && team && (
                  <div className="hero-status">
                    <span className="hs-dot" style={{ background: statusColor }} />
                    <span className="hs-label">Status tim:</span>
                    <strong className="hs-val" style={{ color: statusColor }}>{statusLabel}</strong>
                    {team.selection_note && <span className="hs-note">— {team.selection_note}</span>}
                  </div>
                )}
              </div>

              <div className="id-card">
                <div className="idc-shimmer" />
                <div className="idc-top">
                  <div className="idc-logo"><IconBolt /></div>
                  <span className="idc-event">MPR RI · 2026</span>
                </div>
                <div className="idc-av-wrap">
                  <div className="idc-av">{initials}</div>
                  <div className="idc-av-ring" />
                </div>
                <div className="idc-info">
                  <p className="idc-name">{user?.name || '—'}</p>
                  <p className="idc-email">{user?.email || '—'}</p>
                </div>
                <div className="idc-foot">
                  <span className="idc-badge">Peserta Resmi</span>
                  <span className="idc-id">ID: {String(user?.id ?? '—').padStart(5, '0')}</span>
                </div>
              </div>
            </section>

            {/* Panduan Panel */}
            <section className="panel fade-up" style={{ '--fd': '80ms' } as React.CSSProperties}>
              <div className="panel-hd">
                <div>
                  <h2 className="panel-title">Panduan Peserta</h2>
                  <p className="panel-sub">Hal penting yang perlu kamu perhatikan</p>
                </div>
              </div>
              <div className="guide-grid">
                {[
                  { num: '01', title: 'Lengkapi Data Tim', body: 'Pastikan semua anggota sudah mengisi data diri lengkap. Data yang belum lengkap dapat mempengaruhi penilaian.' },
                  { num: '02', title: 'Upload Logbook Harian', body: 'Logbook wajib diupload setiap hari selama periode hackathon. Keterlambatan upload akan mengurangi skor proses.' },
                  { num: '03', title: 'Pantau Email & Notifikasi', body: 'Pengumuman resmi dikirim via email terdaftar. Cek secara berkala agar tidak ketinggalan informasi penting.' },
                ].map(g => (
                  <div className="guide-card" key={g.num}>
                    <span className="guide-num">{g.num}</span>
                    <h3 className="guide-title">{g.title}</h3>
                    <p className="guide-body">{g.body}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <TeamRegistrationWizard isOpen={showWizard} onSuccess={handleWizardSuccess} />

      {/* ========== GLOBAL STYLES ========== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --indigo:      #4F46E5;
          --indigo-50:   #EEF2FF;
          --indigo-100:  #E0E7FF;
          --indigo-200:  #C7D2FE;
          --indigo-600:  #4338CA;
          --sky:         #0EA5E9;
          --emerald:     #059669;
          --ink:         #0F172A;
          --ink-2:       #334155;
          --ink-3:       #64748B;
          --ink-4:       #94A3B8;
          --white:       #FFFFFF;
          --bg:          #F8FAFF;
          --surface-2:   #F1F5FF;
          --border:      rgba(79,70,229,0.12);
          --shadow-sm:   0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          --shadow-md:   0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
          --shadow-lg:   0 12px 28px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.02);
          --shadow-xl:   0 20px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.04);
          --radius-md:    16px;
          --radius-lg:    20px;
          --radius-xl:    24px;
          --radius-2xl:   32px;
          --ff-display:  'Bricolage Grotesque', system-ui, sans-serif;
          --ff-body:     'DM Sans', system-ui, sans-serif;
          --ease:        cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        body {
          background: var(--bg);
          font-family: var(--ff-body);
          color: var(--ink);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          line-height: 1.6;
        }
        a { text-decoration: none; color: inherit; }

        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(24px,-18px) scale(1.05); }
          70%     { transform: translate(-16px,12px) scale(0.97); }
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        @keyframes pulsePing {
          0%   { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) skewX(-12deg); }
          100% { transform: translateX(200%) skewX(-12deg); }
        }
        @keyframes waveHand {
          0%,100% { transform: rotate(0deg); }
          25%     { transform: rotate(18deg); }
          50%     { transform: rotate(-8deg); }
          75%     { transform: rotate(14deg); }
        }
        @keyframes dotBlink {
          0%,100% { opacity: 1; }
          50%     { opacity: 0.3; }
        }
        .fade-up {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s var(--ease), transform 0.6s var(--ease);
          transition-delay: var(--fd, 0ms);
        }
        .fade-up.in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* ========== SCOPED STYLES ========== */}
      <style jsx>{`
        .root {
          min-height: 100vh;
          position: relative;
        }

        /* Background */
        .bg {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        .bg-noise {
          position: absolute;
          inset: 0;
          opacity: 0.02;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 200px 200px;
        }
        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: orbDrift 22s ease-in-out infinite;
        }
        .bg-orb-1 {
          width: 640px; height: 640px;
          background: radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 65%);
          top: -200px; left: -180px;
        }
        .bg-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 65%);
          bottom: -100px; right: -100px;
          animation-duration: 28s; animation-direction: reverse;
        }
        .bg-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,70,229,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.03) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%);
        }

        /* Main layout - 2 kolom: sidebar kiri + konten kanan */
        .main {
          position: relative;
          z-index: 1;
          padding: 2rem 2rem 4rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        .dashboard-layout {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }


        /* Konten utama kanan */
        .content-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
          
        /* Hero */
        .hero {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          background: var(--white);
          border-radius: var(--radius-2xl);
          padding: 2rem 2.5rem;
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border);
        }
        .hero-left {
          flex: 1;
        }
        .hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--indigo);
          background: var(--indigo-50);
          border: 1px solid var(--indigo-100);
          border-radius: 100px;
          padding: 0.3rem 0.9rem;
          margin-bottom: 1rem;
        }
        .hero-chip-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--indigo);
          animation: dotBlink 2s ease infinite;
        }
        .hero-h1 {
          font-family: var(--ff-display);
          font-size: clamp(1.5rem, 2.8vw, 2.4rem);
          font-weight: 700;
          color: var(--ink);
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .hero-accent { color: var(--indigo); }
        .hero-wave {
          display: inline-block;
          animation: waveHand 2.4s ease-in-out 0.8s 2;
          transform-origin: 70% 80%;
        }
        .hero-lead {
          font-size: 0.9rem;
          color: var(--ink-3);
          max-width: 420px;
          margin-bottom: 1rem;
        }
        .hero-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 0.35rem 1rem;
          font-size: 0.75rem;
        }
        .hs-dot { width: 7px; height: 7px; border-radius: 50%; }
        .hs-label { color: var(--ink-3); }
        .hs-val { font-weight: 700; }
        .hs-note { color: var(--ink-4); margin-left: 0.3rem; }

        /* ID Card */
        .id-card {
          width: 240px;
          background: linear-gradient(145deg, #fff, var(--indigo-50));
          border: 1px solid var(--indigo-100);
          border-radius: var(--radius-xl);
          padding: 1.2rem;
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
        }
        .idc-shimmer {
          position: absolute;
          top: 0; left: 0;
          width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
          animation: shimmer 4s ease-in-out 1.5s infinite;
          pointer-events: none;
        }
        .idc-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
        }
        .idc-logo {
          width: 28px; height: 28px;
          background: var(--indigo);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .idc-event {
          font-size: 0.55rem;
          font-weight: 700;
          color: var(--indigo);
          letter-spacing: 0.06em;
        }
        .idc-av-wrap {
          position: relative;
          width: 52px; height: 52px;
          margin: 0 auto 0.8rem;
        }
        .idc-av {
          width: 52px; height: 52px;
          background: var(--indigo);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.2rem;
          color: white;
          box-shadow: 0 4px 12px rgba(79,70,229,0.3);
          position: relative;
          z-index: 1;
        }
        .idc-av-ring {
          position: absolute;
          inset: -4px;
          border: 2px dashed rgba(79,70,229,0.3);
          border-radius: 50%;
          animation: spinRing 16s linear infinite;
        }
        .idc-info {
          text-align: center;
          margin-bottom: 0.8rem;
        }
        .idc-name {
          font-weight: 700;
          font-size: 0.8rem;
          margin-bottom: 0.2rem;
        }
        .idc-email {
          font-size: 0.6rem;
          color: var(--ink-3);
        }
        .idc-foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-top: 1px solid var(--indigo-100);
          padding-top: 0.6rem;
        }
        .idc-badge {
          font-size: 0.55rem;
          font-weight: 700;
          background: var(--indigo-100);
          color: var(--indigo);
          padding: 0.15rem 0.5rem;
          border-radius: 100px;
        }
        .idc-id {
          font-size: 0.55rem;
          color: var(--ink-4);
        }

        /* Panel */
        .panel {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .panel-hd {
          margin-bottom: 1.2rem;
        }
        .panel-title {
          font-family: var(--ff-display);
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }
        .panel-sub {
          font-size: 0.75rem;
          color: var(--ink-3);
        }

        /* Guide */
        .guide-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .guide-card {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1rem;
        }
        .guide-card:hover {
          border-color: var(--indigo-200);
          box-shadow: var(--shadow-md);
        }
        .guide-num {
          font-size: 0.6rem;
          font-weight: 800;
          color: var(--indigo);
          display: block;
          margin-bottom: 0.4rem;
        }
        .guide-title {
          font-family: var(--ff-display);
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 0.3rem;
        }
        .guide-body {
          font-size: 0.75rem;
          color: var(--ink-3);
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 1000px) {
          .dashboard-layout {
            flex-direction: column;
          }
          .sidebar {
            flex: auto;
            width: 100%;
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .ac-container {
            flex: 1;
            min-width: 240px;
          }
          .hero {
            flex-direction: column;
            text-align: center;
            padding: 1.5rem;
          }
          .hero-left {
            text-align: center;
          }
          .hero-lead {
            margin-left: auto;
            margin-right: auto;
          }
          .guide-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 700px) {
          .main {
            padding: 1rem;
          }
          .sidebar {
            flex-direction: column;
          }
          .guide-grid {
            grid-template-columns: 1fr;
          }
          .id-card {
            width: 100%;
            max-width: 280px;
          }
        }
      `}</style>
    </div>
  );
}