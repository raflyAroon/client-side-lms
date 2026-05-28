'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { usePublicData } from '@/context/PublicDataContext';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Hackathon from '../../public/logohackathon.svg';
import MPR from '../../public/logo MPR RI.svg';
import ASN from '../../public/logo-ASN.png';

/* ─────────────── PARTICLE CANVAS ─────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const particles: {
      x: number; y: number; vx: number; vy: number;
      r: number; alpha: number; color: string;
    }[] = [];

    const colors = ['#3b82f6', '#6366f1', '#8b5cf6', '#06b6d4'];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 55; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.5 + 1,
        alpha: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(59,130,246,${0.12 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
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
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        pointerEvents: 'none', zIndex: 0,
      }}
    />
  );
}

/* ─────────────── COUNTER ANIMATION ───────────────── */
function AnimatedCounter({ end, suffix = '' }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const duration = 1800;
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * end));
        if (progress < 1) requestAnimationFrame(step);
        else setCount(end);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return <span ref={ref}>{count.toLocaleString('id-ID')}{suffix}</span>;
}

/* ─────────────── MAIN COMPONENT ──────────────────── */
export default function LandingPage() {
  const { user } = useAuth();
  const { announcements, faqs, loading } = usePublicData(); // 🔥 menggunakan context
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeAnn, setActiveAnn] = useState<number | null>(null);
  const [scrollPercent, setScrollPercent] = useState(0);

  // Scroll spy + scroll progress
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (winHeight > 0) {
        setScrollPercent(Math.min((window.scrollY / winHeight) * 100, 100));
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // AOS (scroll animation) – dijalankan setelah loading selesai
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('aos-in');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.12 }
    );
    document.querySelectorAll('.aos').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  const timelineSteps = [
    { icon: '👥', bg: 'linear-gradient(135deg,#3b82f6,#2563eb)', date: '20 MEI – 10 JUNI', title: 'Pendaftaran Tim', desc: 'Registrasi regu melalui portal Lomba Coding MPR RI.' },
    { icon: '🎯', bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', date: '15 JUNI – 20 JUNI', title: 'Bootcamp Persiapan', desc: 'Pelatihan intensif materi teknis dan studi kasus nyata.' },
    { icon: '🏆', bg: 'linear-gradient(135deg,#f59e0b,#d97706)', date: '25 JUNI', title: 'Hackathon Day', desc: 'Kompetisi coding & inovasi selama 24 jam penuh.' },
    { icon: '✅', bg: 'linear-gradient(135deg,#10b981,#059669)', date: '30 JUNI', title: 'Final & Kejuaraan', desc: 'Presentasi finalis dan pengumuman pemenang.' },
  ];

  const stats = [
    { label: 'Peserta Terdaftar', value: 1000, suffix: '+', icon: '👥' },
    { label: 'Total Hadiah', value: 500, suffix: 'jt', prefix: 'Rp ', icon: '💰' },
    { label: 'Tim Peserta', value: 250, suffix: '+', icon: '🏅' },
    { label: 'Juri Expert', value: 20, suffix: '+', icon: '⭐' },
  ];

  return (
    <div className="page-root">

      {/* ══════════ NAVBAR ══════════ */}
      <nav className={`navbar ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="navbar-shine" />
        <div className="navbar-progress">
          <div className="navbar-progress-fill" style={{ width: `${scrollPercent}%` }} />
        </div>
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-logo-item">
              <Image src={Hackathon} alt="hackathon" width={160} height={32} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-divider" />
            <div className="brand-logo-item">
              <Image src={MPR} alt="MPR RI" width={70} height={40} style={{ objectFit: 'contain' }} />
            </div>
            <div className="brand-divider" />
            <div className="brand-logo-item">
              <Image src={ASN} alt="ASN" width={100} height={28} style={{ objectFit: 'contain' }} />
            </div>
          </div>

          <div className="navbar-right">
            {!user ? (
              <div className="nav-auth-btns">
                <Link href="/auth/register" className="nav-btn-outline">Daftar</Link>
                <Link href="/auth/login" className="nav-btn-fill">Masuk</Link>
              </div>
            ) : (
              <div className="navbar-user">
                <div className="user-avatar">
                  {(user.name || 'P').charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.name || 'Peserta'}</span>
                  <span className="user-role">
                    {user.role === 'admin' ? 'Admin' : user.role === 'juri' ? 'Juri' : 'Peserta'}
                  </span>
                </div>
                <Link
                  href={`/${user.role === 'admin' ? 'admin' : user.role === 'juri' ? 'juri' : 'peserta'}/dashboard`}
                  className="nav-dashboard-btn"
                  title="Dashboard"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                  </svg>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section className="hero">
        <ParticleCanvas />
        <div className="hero-mesh-1" />
        <div className="hero-mesh-2" />

        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-pulse" />
              KOMPETISI NASIONAL — 2026
            </div>
            <h1 className="hero-title">
              <span className="ht-line ht-line-1">Inovasi Digital</span>
              <span className="ht-line ht-line-2">
                <span className="hero-accent">Empat Pilar.</span>
              </span>
            </h1>
            <p className="hero-subtitle">
              Platform kolaborasi pemuda Indonesia dalam membangun solusi teknologi
              yang memperkuat nilai-nilai negara. Gabung sekarang dan jadilah
              bagian dari perubahan! 🚀
            </p>
            {!user ? (
              <div className="hero-cta">
                <Link href="/auth/register" className="cta-primary">
                  <span className="cta-icon">📝</span>
                  Daftar Sekarang
                  <span className="cta-arrow">→</span>
                </Link>
                <Link href="/auth/login" className="cta-outline">
                  <span className="cta-icon">🔐</span>
                  Masuk LMS
                </Link>
              </div>
            ) : (
              <div className="hero-cta">
                <Link
                  href={`/${user.role === 'admin' ? 'admin' : user.role === 'juri' ? 'juri' : 'peserta'}/dashboard`}
                  className="cta-primary"
                >
                  Menuju Dashboard
                  <span className="cta-arrow">→</span>
                </Link>
              </div>
            )}

            <div className="scroll-hint">
              <div className="scroll-mouse">
                <div className="scroll-wheel" />
              </div>
              <span>Scroll ke bawah</span>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-card-glow" />
            <div className="hero-card">
              <div className="hc-chip hc-chip-tl">
                <span>💡</span><span>Inovasi</span>
              </div>
              <div className="hc-chip hc-chip-tr">
                <span>🤝</span><span>Kolaborasi</span>
              </div>
              <div className="hc-chip hc-chip-bl">
                <span>⚡</span><span>Teknologi</span>
              </div>
              <div className="hc-chip hc-chip-br">
                <span>🌐</span><span>Digital</span>
              </div>

              <div className="center-graphic">
                <div className="cg-ring cg-ring-1" />
                <div className="cg-ring cg-ring-2" />
                <div className="cg-ring cg-ring-3" />
                <div className="cg-dots">
                  <div className="cg-dot cg-dot-1" />
                  <div className="cg-dot cg-dot-2" />
                  <div className="cg-dot cg-dot-3" />
                  <div className="cg-dot cg-dot-4" />
                </div>
                <div className="cg-core">
                  <span>🏆</span>
                </div>
              </div>

              <div className="hc-stat hc-stat-top">
                <strong>1.000+</strong>
                <span>Peserta</span>
              </div>
              <div className="hc-stat hc-stat-bot">
                <strong>Rp 500jt</strong>
                <span>Total Hadiah</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS BAND ══════════ */}
      <section className="stats-band">
        <div className="stats-inner">
          {stats.map((s, i) => (
            <div key={i} className="stat-item aos" style={{ '--delay': `${i * 0.1}s` } as React.CSSProperties}>
              <div className="si-icon">{s.icon}</div>
              <div className="si-value">
                {s.prefix || ''}
                <AnimatedCounter end={s.value} suffix={s.suffix} />
              </div>
              <div className="si-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ TIMELINE ══════════ */}
      <section className="timeline-section">
        <div className="section-inner">
          <div className="section-head aos">
            <span className="sh-eyebrow">Jadwal Kegiatan</span>
            <h2 className="sh-title">alur kegiatan.</h2>
            <div className="sh-line" />
            <p className="sh-sub">Ikuti setiap tahapan kompetisi dari pendaftaran hingga pengumuman pemenang.</p>
          </div>

          <div className="timeline-track">
            {timelineSteps.map((step, i) => (
              <div key={i} className="tl-item aos" style={{ '--delay': `${i * 0.15}s` } as React.CSSProperties}>
                <div className="tl-connector" />
                <div className="tl-card">
                  <div className="tl-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="tl-icon" style={{ background: step.bg }}>{step.icon}</div>
                  <div className="tl-date">{step.date}</div>
                  <h3 className="tl-title">{step.title}</h3>
                  <p className="tl-desc">{step.desc}</p>
                  <div className="tl-progress">
                    <div
                      className="tl-bar"
                      style={{
                        background: step.bg,
                        width: i === 0 ? '100%' : i === 1 ? '65%' : i === 2 ? '30%' : '5%'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ ANNOUNCEMENTS ══════════ */}
      <section className="ann-section">
        <div className="section-inner">
          <div className="ann-layout">
            <div className="ann-head aos">
              <span className="sh-eyebrow">📢 Terbaru</span>
              <h2 className="sh-title" style={{ textAlign: 'left', fontSize: '2.25rem' }}>Pengumuman</h2>
              <div className="sh-line" style={{ margin: '0' }} />
              <p className="sh-sub" style={{ textAlign: 'left', marginTop: '0.75rem' }}>
                Update terkini seputar kompetisi dan jadwal kegiatan.
              </p>
            </div>

            {loading ? (
              <div className="ann-grid">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="sk-card">
                    <div className="sk-row"><div className="sk-pill w35" /><div className="sk-pill w15" /></div>
                    <div className="sk-block w90" />
                    <div className="sk-block w100" />
                    <div className="sk-block w75" />
                  </div>
                ))}
              </div>
            ) : announcements.length === 0 ? (
              <div className="empty-box">
                <div className="empty-icon">📭</div>
                <p>Belum ada pengumuman.</p>
              </div>
            ) : (
              <div className="ann-grid">
                {announcements.map((ann, idx) => (
                  <article
                    key={ann.id}
                    className={`ann-card aos ${activeAnn === ann.id ? 'ann-expanded' : ''}`}
                    style={{ '--delay': `${idx * 0.1}s` } as React.CSSProperties}
                    onClick={() => setActiveAnn(activeAnn === ann.id ? null : ann.id)}
                  >
                    <div className="ac-glow" />
                    <div className="ac-top">
                      <span className="ac-date">
                        {new Date(ann.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="ac-badge">Baru</span>
                    </div>
                    <h3 className="ac-title">{ann.title}</h3>
                    <p className="ac-body">{ann.content}</p>
                    <div className="ac-footer">
                      <span className="ac-read">
                        {activeAnn === ann.id ? 'Tutup ↑' : 'Selengkapnya →'}
                      </span>
                      <div className="ac-dot-row">
                        <span /><span /><span />
                      </div>
                    </div>
                    <div className="ac-bar" />
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="faq-section">
        <div className="section-inner">
          <div className="faq-layout">

            <div className="faq-left aos">
              <span className="sh-eyebrow">❓ FAQ</span>
              <h2 className="sh-title" style={{ textAlign: 'left' }}>
                Pertanyaan<br />yang Sering<br />
                <span style={{ color: '#2563eb' }}>Ditanyakan.</span>
              </h2>
              <p className="sh-sub" style={{ textAlign: 'left', maxWidth: '340px', marginTop: '1rem' }}>
                Temukan jawaban atas pertanyaan umum seputar pendaftaran, kompetisi, dan hadiah.
              </p>
              <div className="faq-visual">
                <div className="fv-ring fv-r1" />
                <div className="fv-ring fv-r2" />
                <div className="fv-ring fv-r3" />
                <div className="fv-center">❓</div>
              </div>
            </div>

            <div className="faq-right">
              {loading ? (
                <div className="faq-sk">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="sk-card" style={{ height: '60px', borderRadius: '14px' }}>
                      <div className="sk-block w80" />
                    </div>
                  ))}
                </div>
              ) : faqs.length === 0 ? (
                <div className="empty-box">
                  <div className="empty-icon">🤷</div>
                  <p>Belum ada FAQ.</p>
                </div>
              ) : (
                <div className="faq-list">
                  {faqs.map((faq, idx) => (
                    <div
                      key={faq.id}
                      className={`faq-item aos ${openFaq === faq.id ? 'faq-open' : ''}`}
                      style={{ '--delay': `${idx * 0.07}s` } as React.CSSProperties}
                    >
                      <button
                        className="faq-btn"
                        onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                      >
                        <div className="faq-icon-wrap">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                            <line x1="12" y1="17" x2="12.01" y2="17"/>
                          </svg>
                        </div>
                        <span className="faq-q">{faq.question}</span>
                        <div className={`faq-toggle ${openFaq === faq.id ? 'open' : ''}`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="6 9 12 15 18 9"/>
                          </svg>
                        </div>
                      </button>
                      <div className="faq-body">
                        <p className="faq-a">{faq.answer}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer className="site-footer">
        <div className="footer-mesh" />
        <div className="footer-inner">
          <div className="footer-brand">
            <Image src={Hackathon} alt="hackathon" width={120} height={38} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1) opacity(0.7)' }} />
          </div>
          <p className="footer-title">Hackathon Inovasi Digital Empat Pilar MPR RI 2026</p>
          <p className="footer-copy">© 2026 Lomba Coding MPR RI. All rights reserved.</p>
          <div className="footer-links">
            <span>📧 support@lombacoding.mpr.go.id</span>
            <span className="sep">|</span>
            <span>📞 (021) 12345678</span>
          </div>
        </div>
      </footer>

      {/* ══════════ STYLES (Global & Component) ══════════ */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: auto; }
        body { background: #f0f4fa; font-family: 'Outfit', system-ui, sans-serif; color: #0f172a; overflow-x: hidden; }

        /* AOS */
        .aos { opacity: 0; transform: translateY(32px); transition: opacity 0.65s cubic-bezier(.22,1,.36,1), transform 0.65s cubic-bezier(.22,1,.36,1); transition-delay: var(--delay, 0s); }
        .aos-in { opacity: 1; transform: translateY(0); }
      `}</style>

      <style jsx>{`
        /* ── PAGE ── */
        .page-root { min-height: 100vh; }

        /* ── NAVBAR ── */
        .navbar {
          position: sticky; top: 0; z-index: 200;
          background: rgba(255,255,255,0.92);
          backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(226,232,240,0.6);
          transition: box-shadow 0.3s, background 0.3s;
          overflow: hidden;
        }
        .nav-scrolled {
          background: rgba(255,255,255,0.98);
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
        }
        .navbar-shine {
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(37,99,235,0.07) 30%, 
            rgba(37,99,235,0.15) 50%, 
            rgba(37,99,235,0.07) 70%, 
            transparent 100%
          );
          transform: skewX(-20deg);
          animation: navbarShine 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }
        @keyframes navbarShine {
          0% { left: -100%; }
          20% { left: 100%; }
          100% { left: 100%; }
        }
        .navbar-progress {
          position: absolute;
          bottom: 0; left: 0; width: 100%;
          height: 3px;
          background: rgba(37,99,235,0.08);
          z-index: 5;
        }
        .navbar-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #6366f1);
          transition: width 0.3s ease;
          border-radius: 0 2px 2px 0;
        }
        .navbar-inner {
          max-width: 1340px; margin: 0 auto;
          padding: 0.75rem 2rem;
          display: flex; align-items: center; justify-content: space-between;
          gap: 1.5rem;
          position: relative; z-index: 2;
        }
        .navbar-brand {
          display: flex; align-items: center; gap: 0.875rem;
        }
        .brand-logo-item {
          display: flex; align-items: center;
        }
        .brand-divider {
          width: 1px; height: 28px;
          background: #e2e8f0;
          margin: 0 0.25rem;
          opacity: 0.7;
        }
        .navbar-right { display: flex; align-items: center; }
        .nav-auth-btns { display: flex; gap: 0.6rem; align-items: center; }
        .nav-btn-outline { 
          padding: 0.5rem 1.1rem; border-radius: 100px; border: 1.5px solid #e2e8f0; 
          color: #475569; font-size: 0.85rem; font-weight: 600; text-decoration: none; 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
        }
        .nav-btn-outline:hover { 
          border-color: #2563eb; color: #2563eb; 
          transform: scale(1.05); box-shadow: 0 0 15px rgba(37,99,235,0.3); 
        }
        .nav-btn-fill { 
          padding: 0.5rem 1.25rem; border-radius: 100px; background: #2563eb; 
          color: white; font-size: 0.85rem; font-weight: 600; text-decoration: none; 
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          box-shadow: 0 2px 10px rgba(37,99,235,0.3); 
        }
        .nav-btn-fill:hover { 
          background: #1d4ed8; transform: scale(1.05) translateY(-1px); 
          box-shadow: 0 4px 20px rgba(37,99,235,0.5); 
        }
        .navbar-user { display: flex; align-items: center; gap: 0.75rem; }
        .user-avatar { 
          width: 36px; height: 36px; border-radius: 50%; 
          background: linear-gradient(135deg, #3b82f6, #6366f1); 
          color: white; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.95rem; 
          display: flex; align-items: center; justify-content: center; 
          animation: avatarPulse 2.5s ease-in-out infinite;
        }
        @keyframes avatarPulse {
          0%, 100% { box-shadow: 0 2px 10px rgba(99,102,241,0.3); }
          50% { box-shadow: 0 4px 20px rgba(99,102,241,0.5); }
        }
        .user-info { text-align: right; }
        .user-name { display: block; font-weight: 600; font-size: 0.85rem; color: #0f172a; }
        .user-role { display: block; font-size: 0.7rem; color: #64748b; }
        .nav-dashboard-btn { 
          width: 36px; height: 36px; border-radius: 10px; 
          background: #f1f5f9; border: 1px solid #e2e8f0; 
          display: flex; align-items: center; justify-content: center; 
          color: #475569; text-decoration: none; 
          transition: all 0.3s ease; 
        }
        .nav-dashboard-btn:hover { 
          background: #2563eb; color: white; border-color: #2563eb; 
          transform: rotate(15deg); 
        }

        /* ── HERO ── */
        .hero {
          min-height: calc(100vh - 64px);
          background: linear-gradient(160deg, #ffffff 0%, #eef2ff 50%, #e0f2fe 100%);
          position: relative; overflow: hidden;
          display: flex; align-items: center;
        }
        .hero-mesh-1 {
          position: absolute; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%);
          top: -200px; right: -100px; pointer-events: none;
          animation: meshMove 12s ease-in-out infinite;
        }
        .hero-mesh-2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 65%);
          bottom: -150px; left: -50px; pointer-events: none;
          animation: meshMove 16s ease-in-out infinite reverse;
        }
        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(40px, -30px) scale(1.08); }
        }
        .hero-inner { max-width: 1340px; margin: 0 auto; padding: 5rem 2rem 4rem; display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: center; position: relative; z-index: 1; width: 100%; }
        .hero-badge {
          display: inline-flex; align-items: center; gap: 0.6rem;
          background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.2);
          color: #1d4ed8; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
          padding: 0.45rem 1rem; border-radius: 100px; margin-bottom: 1.5rem;
          text-transform: uppercase; font-family: 'Sora', sans-serif;
          animation: fadeSlideDown 0.6s ease-out both;
        }
        .badge-pulse { width: 7px; height: 7px; background: #2563eb; border-radius: 50%; animation: pulseGlow 2s infinite; }
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.6); } 50% { box-shadow: 0 0 0 5px rgba(37,99,235,0); } }
        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .hero-title { font-family: 'Sora', sans-serif; font-size: clamp(2.5rem, 4.5vw, 4rem); font-weight: 800; line-height: 1.08; color: #0f172a; letter-spacing: -0.04em; margin-bottom: 1.25rem; }
        .ht-line { display: block; }
        .ht-line-1 { animation: heroLineIn 0.7s cubic-bezier(.22,1,.36,1) 0.1s both; }
        .ht-line-2 { animation: heroLineIn 0.7s cubic-bezier(.22,1,.36,1) 0.22s both; }
        @keyframes heroLineIn { from { opacity: 0; transform: translateX(-24px); } to { opacity: 1; transform: translateX(0); } }
        .hero-accent { color: #2563eb; position: relative; display: inline-block; }
        .hero-accent::after { content: ''; position: absolute; left: 0; bottom: 4px; width: 100%; height: 4px; background: linear-gradient(90deg, #2563eb, #6366f1); border-radius: 4px; opacity: 0.4; transform: scaleX(0); transform-origin: left; animation: accentLine 0.5s ease 0.7s both; }
        @keyframes accentLine { to { transform: scaleX(1); } }
        .hero-subtitle { font-size: 1rem; color: #475569; line-height: 1.75; max-width: 500px; margin-bottom: 2.25rem; animation: fadeUp 0.7s ease 0.35s both; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .hero-cta { display: flex; gap: 0.875rem; flex-wrap: wrap; animation: fadeUp 0.7s ease 0.45s both; }
        .cta-primary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; background: linear-gradient(135deg,#2563eb,#4f46e5); color: white; border-radius: 100px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 4px 18px rgba(37,99,235,0.35), 0 1px 3px rgba(0,0,0,0.1); font-family: 'Sora', sans-serif; position: relative; overflow: hidden; }
        .cta-primary::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,#1d4ed8,#4338ca); opacity: 0; transition: opacity 0.3s; }
        .cta-primary:hover::before { opacity: 1; }
        .cta-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 28px rgba(37,99,235,0.4); }
        .cta-arrow { position: relative; z-index: 1; transition: transform 0.3s; display: inline-block; }
        .cta-primary:hover .cta-arrow { transform: translateX(4px); }
        .cta-outline { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; background: white; color: #334155; border: 1.5px solid #e2e8f0; border-radius: 100px; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.25s ease; font-family: 'Sora', sans-serif; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .cta-outline:hover { border-color: #2563eb; color: #2563eb; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .scroll-hint { display: flex; align-items: center; gap: 0.6rem; margin-top: 2.5rem; color: #94a3b8; font-size: 0.75rem; animation: fadeUp 0.7s ease 0.7s both; }
        .scroll-mouse { width: 22px; height: 34px; border: 2px solid #cbd5e1; border-radius: 11px; display: flex; justify-content: center; padding-top: 5px; }
        .scroll-wheel { width: 4px; height: 8px; background: #94a3b8; border-radius: 4px; animation: scrollWheel 1.8s ease-in-out infinite; }
        @keyframes scrollWheel { 0%, 100% { opacity: 1; transform: translateY(0); } 50% { opacity: 0.3; transform: translateY(6px); } }
        .hero-right { position: relative; display: flex; justify-content: flex-end; animation: fadeUp 0.8s ease 0.2s both; }
        .hero-card-glow { position: absolute; width: 300px; height: 300px; background: radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%); top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; animation: glowPulse 4s ease-in-out infinite; }
        @keyframes glowPulse { 0%, 100% { transform: translate(-50%,-50%) scale(1); opacity: 0.8; } 50% { transform: translate(-50%,-50%) scale(1.2); opacity: 1; } }
        .hero-card { width: min(400px, 100%); aspect-ratio: 1; background: linear-gradient(135deg,#f0f7ff,#faf5ff); border-radius: 32px; border: 1px solid rgba(99,102,241,0.15); box-shadow: 0 24px 64px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.8) inset; position: relative; overflow: hidden; animation: cardFloat 7s ease-in-out infinite; }
        @keyframes cardFloat { 0%, 100% { transform: translateY(0) rotate(0.5deg); } 50% { transform: translateY(-14px) rotate(-0.5deg); } }
        .hc-chip { position: absolute; display: flex; align-items: center; gap: 0.35rem; background: white; border: 1px solid #e8ecf2; border-radius: 100px; padding: 0.35rem 0.75rem; font-size: 0.75rem; font-weight: 600; color: #334155; box-shadow: 0 4px 16px rgba(0,0,0,0.08); z-index: 2; }
        .hc-chip-tl { top: 14%; left: 6%; animation: floatChip 5s ease-in-out infinite 0s; }
        .hc-chip-tr { top: 14%; right: 6%; animation: floatChip 5s ease-in-out infinite -1.25s; }
        .hc-chip-bl { bottom: 18%; left: 6%; animation: floatChip 5s ease-in-out infinite -2.5s; }
        .hc-chip-br { bottom: 18%; right: 6%; animation: floatChip 5s ease-in-out infinite -3.75s; }
        @keyframes floatChip { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
        .center-graphic { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 160px; height: 160px; display: flex; align-items: center; justify-content: center; }
        .cg-ring { position: absolute; border-radius: 50%; border: 1.5px solid; }
        .cg-ring-1 { width: 160px; height: 160px; border-color: rgba(37,99,235,0.15); animation: spin 14s linear infinite; }
        .cg-ring-2 { width: 115px; height: 115px; border-color: rgba(99,102,241,0.25); animation: spin 9s linear infinite reverse; }
        .cg-ring-3 { width: 72px; height: 72px; border-color: rgba(139,92,246,0.35); animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cg-dots { position: absolute; width: 160px; height: 160px; animation: spin 14s linear infinite; }
        .cg-dot { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 8px rgba(37,99,235,0.6); }
        .cg-dot-1 { top: 0; left: 50%; transform: translateX(-50%); }
        .cg-dot-2 { right: 0; top: 50%; transform: translateY(-50%); }
        .cg-dot-3 { bottom: 0; left: 50%; transform: translateX(-50%); background: #6366f1; }
        .cg-dot-4 { left: 0; top: 50%; transform: translateY(-50%); background: #8b5cf6; }
        .cg-core { width: 48px; height: 48px; background: linear-gradient(135deg,#2563eb,#6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; z-index: 2; box-shadow: 0 6px 24px rgba(37,99,235,0.4); animation: corePulse 3s ease-in-out infinite; }
        @keyframes corePulse { 0%, 100% { box-shadow: 0 6px 24px rgba(37,99,235,0.4); } 50% { box-shadow: 0 6px 36px rgba(37,99,235,0.65); } }
        .hc-stat { position: absolute; background: white; border-radius: 14px; padding: 0.6rem 1rem; text-align: center; border: 1px solid #e8ecf2; box-shadow: 0 6px 20px rgba(0,0,0,0.08); z-index: 3; display: flex; flex-direction: column; }
        .hc-stat strong { font-family: 'Sora', sans-serif; font-size: 1.1rem; font-weight: 800; color: #2563eb; }
        .hc-stat span { font-size: 0.7rem; color: #64748b; font-weight: 500; }
        .hc-stat-top { top: 38%; right: 2%; }
        .hc-stat-bot { bottom: 6%; left: 50%; transform: translateX(-50%); white-space: nowrap; }

        /* ── STATS BAND ── */
        .stats-band { background: white; border-top: 1px solid #e8ecf2; border-bottom: 1px solid #e8ecf2; padding: 2.25rem 0; }
        .stats-inner { max-width: 1340px; margin: 0 auto; padding: 0 2rem; display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; }
        .stat-item { text-align: center; padding: 1rem; border-radius: 16px; transition: background 0.25s; cursor: default; }
        .stat-item:hover { background: #f8fafc; }
        .si-icon { font-size: 1.6rem; margin-bottom: 0.5rem; display: block; }
        .si-value { font-family: 'Sora', sans-serif; font-size: 1.9rem; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; line-height: 1; margin-bottom: 0.3rem; }
        .si-label { font-size: 0.8rem; color: #64748b; font-weight: 500; }

        /* ── SECTION UTILS ── */
        .section-inner { max-width: 1340px; margin: 0 auto; padding: 0 2rem; }
        .section-head { text-align: center; margin-bottom: 3.5rem; }
        .sh-eyebrow { display: inline-block; font-family: 'Sora', sans-serif; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #2563eb; background: rgba(37,99,235,0.08); padding: 0.35rem 0.9rem; border-radius: 100px; margin-bottom: 0.85rem; }
        .sh-title { font-family: 'Sora', sans-serif; font-size: 2.5rem; font-weight: 800; color: #0f172a; letter-spacing: -0.04em; line-height: 1.1; margin-bottom: 0.75rem; }
        .sh-line { width: 40px; height: 4px; background: linear-gradient(90deg,#2563eb,#6366f1); border-radius: 4px; margin: 0 auto 1rem; }
        .sh-sub { font-size: 0.95rem; color: #64748b; line-height: 1.7; max-width: 520px; margin: 0 auto; }

        /* ── TIMELINE ── */
        .timeline-section { padding: 6rem 0; background: #f8faff; }
        .timeline-track { display: grid; grid-template-columns: repeat(4,1fr); gap: 1.5rem; position: relative; }
        .timeline-track::before { content: ''; position: absolute; top: 34px; left: 10%; right: 10%; height: 2px; background: linear-gradient(90deg, #bfdbfe, #c7d2fe, #ddd6fe, #a7f3d0); z-index: 0; }
        .tl-item { position: relative; }
        .tl-connector { position: absolute; top: 34px; left: 50%; width: 12px; height: 12px; background: white; border: 2px solid #3b82f6; border-radius: 50%; transform: translateX(-50%); z-index: 1; box-shadow: 0 0 0 4px rgba(59,130,246,0.15); }
        .tl-card { background: white; border-radius: 20px; padding: 2rem 1.5rem 1.5rem; border: 1px solid #e8ecf2; margin-top: 1.5rem; position: relative; overflow: hidden; transition: all 0.35s cubic-bezier(.22,1,.36,1); cursor: default; }
        .tl-card:hover { transform: translateY(-8px); box-shadow: 0 20px 48px rgba(0,0,0,0.09); border-color: #bfdbfe; }
        .tl-num { position: absolute; top: 1rem; right: 1rem; font-family: 'Sora', sans-serif; font-size: 2.5rem; font-weight: 900; color: #f1f5f9; line-height: 1; }
        .tl-icon { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 1.35rem; margin-bottom: 1.25rem; box-shadow: 0 4px 14px rgba(0,0,0,0.12); }
        .tl-date { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; font-family: 'Sora', sans-serif; }
        .tl-title { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: #0f172a; margin-bottom: 0.6rem; }
        .tl-desc { font-size: 0.85rem; color: #64748b; line-height: 1.55; margin-bottom: 1.25rem; }
        .tl-progress { height: 4px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
        .tl-bar { height: 100%; border-radius: 4px; transition: width 1.2s cubic-bezier(.22,1,.36,1); }

        /* ── ANNOUNCEMENTS ── */
        .ann-section { padding: 6rem 0; background: white; }
        .ann-layout { display: flex; flex-direction: column; gap: 2.5rem; }
        .ann-head { max-width: 560px; }
        .ann-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; }
        .ann-card { background: #f8fafc; border-radius: 22px; padding: 1.75rem; border: 1px solid #e8ecf2; position: relative; overflow: hidden; transition: all 0.35s cubic-bezier(.22,1,.36,1); display: flex; flex-direction: column; gap: 0.75rem; cursor: pointer; }
        .ann-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.09); border-color: rgba(37,99,235,0.25); background: white; }
        .ac-glow { position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; background: radial-gradient(circle, rgba(37,99,235,0.1), transparent 70%); border-radius: 50%; pointer-events: none; transition: opacity 0.3s; opacity: 0; }
        .ann-card:hover .ac-glow { opacity: 1; }
        .ac-top { display: flex; align-items: center; justify-content: space-between; }
        .ac-date { font-size: 0.72rem; font-weight: 600; color: #94a3b8; background: #f1f5f9; padding: 0.25rem 0.7rem; border-radius: 100px; }
        .ac-badge { font-size: 0.62rem; font-weight: 700; color: white; background: linear-gradient(135deg,#2563eb,#4f46e5); padding: 0.22rem 0.65rem; border-radius: 100px; letter-spacing: 0.04em; text-transform: uppercase; }
        .ac-title { font-family: 'Sora', sans-serif; font-size: 1.05rem; font-weight: 700; color: #0f172a; line-height: 1.3; }
        .ac-body { font-size: 0.875rem; color: #64748b; line-height: 1.65; flex: 1; }
        .ac-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; padding-top: 0.5rem; border-top: 1px solid #f1f5f9; }
        .ac-read { font-size: 0.82rem; font-weight: 600; color: #2563eb; transition: letter-spacing 0.2s; }
        .ann-card:hover .ac-read { letter-spacing: 0.02em; }
        .ac-dot-row { display: flex; gap: 4px; }
        .ac-dot-row span { width: 6px; height: 6px; background: #e2e8f0; border-radius: 50%; }
        .ac-bar { position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: linear-gradient(180deg,#2563eb,#6366f1); }

        /* ── FAQ ── */
        .faq-section { padding: 6rem 0; background: #f8faff; }
        .faq-layout { display: grid; grid-template-columns: 1fr 1.5fr; gap: 5rem; align-items: start; }
        .faq-left { position: sticky; top: 100px; }
        .faq-visual { position: relative; width: 160px; height: 160px; margin-top: 2.5rem; }
        .fv-ring { position: absolute; border-radius: 50%; border: 2px solid; animation: spin 10s linear infinite; top: 50%; left: 50%; }
        .fv-r1 { width: 160px; height: 160px; border-color: rgba(37,99,235,0.12); transform: translate(-50%,-50%); }
        .fv-r2 { width: 110px; height: 110px; border-color: rgba(99,102,241,0.2); transform: translate(-50%,-50%); animation-duration: 7s; animation-direction: reverse; }
        .fv-r3 { width: 68px; height: 68px; border-color: rgba(139,92,246,0.28); transform: translate(-50%,-50%); animation-duration: 5s; }
        .fv-center { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 40px; height: 40px; background: linear-gradient(135deg,#2563eb,#6366f1); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; box-shadow: 0 4px 16px rgba(37,99,235,0.35); }
        .faq-list { display: flex; flex-direction: column; gap: 0.65rem; }
        .faq-item { background: white; border-radius: 14px; border: 1px solid #e8ecf2; overflow: hidden; transition: all 0.3s ease; }
        .faq-item:hover { border-color: rgba(37,99,235,0.25); box-shadow: 0 4px 16px rgba(0,0,0,0.05); }
        .faq-open { border-color: #2563eb !important; box-shadow: 0 6px 24px rgba(37,99,235,0.12) !important; }
        .faq-btn { width: 100%; background: none; border: none; cursor: pointer; padding: 1.1rem 1.25rem; display: flex; align-items: center; gap: 0.875rem; text-align: left; }
        .faq-icon-wrap { width: 28px; height: 28px; min-width: 28px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #2563eb; transition: background 0.25s; }
        .faq-open .faq-icon-wrap { background: #2563eb; color: white; }
        .faq-q { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600; color: #0f172a; flex: 1; line-height: 1.4; }
        .faq-toggle { width: 26px; height: 26px; min-width: 26px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #64748b; transition: all 0.3s ease; }
        .faq-toggle.open { background: #2563eb; color: white; transform: rotate(-180deg); }
        .faq-body { max-height: 0; overflow: hidden; transition: max-height 0.4s cubic-bezier(.22,1,.36,1); }
        .faq-open .faq-body { max-height: 300px; }
        .faq-a { padding: 0 1.25rem 1.15rem 3.875rem; font-size: 0.875rem; color: #64748b; line-height: 1.7; }

        /* ── SKELETON & EMPTY ── */
        .sk-card { background: white; border-radius: 20px; border: 1px solid #e8ecf2; padding: 1.75rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .sk-pill, .sk-block { height: 13px; border-radius: 8px; background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
        .sk-row { display: flex; align-items: center; gap: 0.5rem; }
        .sk-pill { height: 24px; border-radius: 100px; }
        .w15 { width: 15%; } .w35 { width: 35%; } .w75 { width: 75%; } .w80 { width: 80%; } .w90 { width: 90%; } .w100 { width: 100%; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .empty-box { text-align: center; padding: 3.5rem 2rem; background: #f8fafc; border-radius: 20px; border: 1.5px dashed #e2e8f0; color: #94a3b8; }
        .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }

        /* ── FOOTER ── */
        .site-footer { background: #0f172a; color: rgba(255,255,255,0.7); padding: 3rem 0 2.5rem; position: relative; overflow: hidden; }
        .footer-mesh { position: absolute; inset: 0; background: radial-gradient(ellipse at 20% 50%, rgba(37,99,235,0.12) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.1) 0%, transparent 60%); pointer-events: none; }
        .footer-inner { max-width: 1340px; margin: 0 auto; padding: 0 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; position: relative; z-index: 1; }
        .footer-brand { margin-bottom: 0.5rem; }
        .footer-title { font-family: 'Sora', sans-serif; font-size: 0.9rem; font-weight: 600; color: rgba(255,255,255,0.85); }
        .footer-copy { font-size: 0.8rem; }
        .footer-links { display: flex; align-items: center; gap: 0.75rem; font-size: 0.8rem; }
        .sep { opacity: 0.4; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1100px) {
          .timeline-track { grid-template-columns: repeat(2,1fr); }
          .timeline-track::before { display: none; }
          .ann-grid { grid-template-columns: repeat(2,1fr); }
          .faq-layout { grid-template-columns: 1fr; gap: 2.5rem; }
          .faq-left { position: static; }
          .stats-inner { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; padding: 3rem 1.5rem 2.5rem; }
          .hero-right { display: none; }
          .hero-title { font-size: 2.4rem; }
          .timeline-track { grid-template-columns: 1fr; }
          .ann-grid { grid-template-columns: 1fr; }
          .navbar-inner { padding: 0.75rem 1.25rem; }
          .sh-title { font-size: 1.9rem; }
          .navbar-brand { gap: 0.5rem; }
          .brand-divider { height: 24px; }
        }
        @media (max-width: 480px) {
          .hero-title { font-size: 1.9rem; }
          .stats-inner { grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
          .si-value { font-size: 1.5rem; }
          .brand-logo-item img { max-width: 80px; height: auto; }
        }
      `}</style>
    </div>
  );
}