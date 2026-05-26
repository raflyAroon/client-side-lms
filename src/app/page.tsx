'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import api from '@/lib/axios';

type Announcement = {
  id: number;
  title: string;
  content: string;
  published_at: string;
};

type Faq = {
  id: number;
  question: string;
  answer: string;
  display_order: number;
};

export default function LandingPage() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [annRes, faqRes] = await Promise.all([
          api.get('/announcements').catch(() => ({ data: [] })),
          api.get('/faqs').catch(() => ({ data: [] })),
        ]);
        setAnnouncements(annRes.data);
        setFaqs(faqRes.data);
      } catch (err) {
        console.error('Gagal mengambil data publik:', err);
        setAnnouncements([]);
        setFaqs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.animate-on-scroll');
    elements.forEach((el) => observerRef.current?.observe(el));

    return () => observerRef.current?.disconnect();
  }, [loading]);

  const timelineSteps = [
    {
      icon: '👥',
      color: '#3b82f6',
      date: '20 MEI – 10 JUNI',
      title: 'Pendaftaran Tim',
      desc: 'Registrasi regu melalui portal Lomba Coding MPR RI.',
    },
    {
      icon: '🎯',
      color: '#8b5cf6',
      date: '15 JUNI – 20 JUNI',
      title: 'Bootcamp Persiapan',
      desc: 'Pelatihan intensif materi teknis dan studi kasus nyata.',
    },
    {
      icon: '🏆',
      color: '#f59e0b',
      date: '25 JUNI',
      title: 'Hackathon Day',
      desc: 'Kompetisi coding & inovasi selama 24 jam penuh.',
    },
    {
      icon: '✅',
      color: '#10b981',
      date: '30 JUNI',
      title: 'Final & Kejuaraan',
      desc: 'Presentasi finalis dan pengumuman pemenang.',
    },
  ];

  return (
    <div className="page-root">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">
            <div className="brand-icon">A</div>
            <span className="brand-name">Hackathon Inovasi Digital Empat Pilar</span>
          </div>
          {user && (
            <div className="navbar-user">
              <div className="user-info">
                <span className="user-name">{user.name || 'Peserta'}</span>
                <span className="user-role">
                  {user.role === 'admin' ? 'Admin' : user.role === 'juri' ? 'Juri' : 'Participant'}
                </span>
              </div>
              <Link
                href={`/${user.role === 'admin' ? 'admin' : user.role === 'juri' ? 'juri' : 'peserta'}/dashboard`}
                className="nav-dashboard-btn"
              >
                ⊞
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot"></span>
              KOMPETISI NASIONAL — 2026
            </div>

            <h1 className="hero-title">
              Invonasi Digital<br />
              <span className="hero-accent">Empat Pilar.</span>
            </h1>

            <p className="hero-subtitle">
              Platform kolaborasi pemuda Indonesia dalam membangun
              solusi teknologi yang memperkuat nilai-negara. Gabung sekarang dan jadilah bagian dari perubahan! 🚀
            </p>

            {!user ? (
              <div className="hero-cta">
                <Link href="/auth/register" className="cta-primary">
                  📝 Daftar Sekarang
                </Link>
                <Link href="/auth/login" className="cta-outline">
                  🔐 Masuk LMS
                </Link>
              </div>
            ) : (
              <div className="hero-cta">
                <Link
                  href={`/${user.role === 'admin' ? 'admin' : user.role === 'juri' ? 'juri' : 'peserta'}/dashboard`}
                  className="cta-primary"
                >
                  Menuju Dashboard →
                </Link>
              </div>
            )}
          </div>

          <div className="hero-right">
            <div className="hero-image-card">
              <div className="image-inner">
                <div className="floating-icon fi-1">💻</div>
                <div className="floating-icon fi-2">🚀</div>
                <div className="floating-icon fi-3">⚡</div>
                <div className="floating-icon fi-4">🌐</div>
                <div className="center-graphic">
                  <div className="graphic-ring ring-1"></div>
                  <div className="graphic-ring ring-2"></div>
                  <div className="graphic-ring ring-3"></div>
                  <div className="graphic-core">
                    <span>🏆</span>
                  </div>
                </div>
                <div className="stat-pill sp-top">
                  <span className="sp-num">1000+</span>
                  <span className="sp-label">Peserta</span>
                </div>
                <div className="stat-pill sp-bottom">
                  <span className="sp-num">Rp 500jt</span>
                  <span className="sp-label">Hadiah</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ─────────────────────────────────────── */}
      <section className="timeline-section">
        <div className="section-inner">
          <div className="section-head animate-on-scroll">
            <h2 className="section-label">alur kegiatan.</h2>
            <div className="section-underline"></div>
          </div>
          <div className="timeline-grid">
            {timelineSteps.map((step, i) => (
              <div
                key={i}
                className="timeline-card animate-on-scroll"
                style={{ transitionDelay: `${i * 0.1}s` } as React.CSSProperties}
              >
                <div className="tc-icon" style={{ background: step.color }}>
                  {step.icon}
                </div>
                <div className="tc-date">{step.date}</div>
                <h3 className="tc-title">{step.title}</h3>
                <p className="tc-desc">{step.desc}</p>
                <div className="tc-step-num">{String(i + 1).padStart(2, '0')}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ────────────────────────────────── */}
      <section className="ann-section">
        <div className="section-inner">
          <div className="section-head animate-on-scroll">
            <div className="section-tag">📢 Terbaru</div>
            <h2 className="section-title-lg">Pengumuman</h2>
            <p className="section-desc">Update terkini seputar kompetisi dan jadwal kegiatan.</p>
          </div>

          {loading ? (
            <div className="skeleton-grid">
              {[1, 2, 3].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="sk-line sk-short"></div>
                  <div className="sk-line sk-long"></div>
                  <div className="sk-line sk-medium"></div>
                </div>
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📭</span>
              <p>Belum ada pengumuman.</p>
            </div>
          ) : (
            <div className="ann-grid">
              {announcements.map((ann, idx) => (
                <article
                  key={ann.id}
                  className="ann-card animate-on-scroll"
                  style={{ transitionDelay: `${idx * 0.08}s` } as React.CSSProperties}
                >
                  <div className="ann-card-top">
                    <span className="ann-chip">
                      {new Date(ann.published_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="ann-badge">Baru</span>
                  </div>
                  <h3 className="ann-title">{ann.title}</h3>
                  <p className="ann-content">{ann.content}</p>
                  <div className="ann-footer">
                    <span className="ann-read">Selengkapnya →</span>
                  </div>
                  <div className="ann-accent-bar"></div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="faq-section">
        <div className="section-inner faq-inner">
          <div className="faq-left animate-on-scroll">
            <div className="section-tag">❓ FAQ</div>
            <h2 className="section-title-lg">Pertanyaan<br />yang Sering<br />Ditanyakan.</h2>
            <p className="section-desc">
              Temukan jawaban atas pertanyaan umum seputar pendaftaran, kompetisi, dan hadiah.
            </p>
            <div className="faq-deco">
              <div className="faq-deco-circle c1"></div>
              <div className="faq-deco-circle c2"></div>
            </div>
          </div>

          <div className="faq-right">
            {loading ? (
              <div className="skeleton-grid" style={{ gap: '0.75rem' }}>
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="skeleton-card" style={{ height: '64px', borderRadius: '12px' }}>
                    <div className="sk-line sk-long"></div>
                  </div>
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🤷</span>
                <p>Belum ada FAQ.</p>
              </div>
            ) : (
              <div className="faq-list">
                {faqs.map((faq, idx) => (
                  <div
                    key={faq.id}
                    className={`faq-item animate-on-scroll ${openFaq === faq.id ? 'faq-open' : ''}`}
                    style={{ transitionDelay: `${idx * 0.06}s` } as React.CSSProperties}
                  >
                    <button
                      className="faq-question-btn"
                      onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                    >
                      <span className="faq-q-text">{faq.question}</span>
                      <span className="faq-chevron">{openFaq === faq.id ? '−' : '+'}</span>
                    </button>
                    <div className="faq-answer-wrap">
                      <p className="faq-answer-text">{faq.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="site-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-icon">A</div>
            <span className="brand-name">MPR RI 2026</span>
          </div>
          <p className="footer-copy">© 2026 Lomba Coding MPR RI. All rights reserved.</p>
          <p className="footer-contact">📧 support@lombacoding.mpr.go.id &nbsp;|&nbsp; 📞 (021) 12345678</p>
        </div>
      </footer>

      <style jsx>{`
        /* ─── GOOGLE FONTS ─────────────────────────────── */
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        /* ─── ROOT TOKENS ──────────────────────────────── */
        :global(*) { box-sizing: border-box; margin: 0; padding: 0; }
        :global(body) { background: #f4f6fb; }

        .page-root {
          min-height: 100vh;
          font-family: 'DM Sans', system-ui, sans-serif;
          background: #f4f6fb;
          color: #0f172a;
          overflow-x: hidden;
        }

        /* ─── NAVBAR ───────────────────────────────────── */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid #e8ecf2;
          box-shadow: 0 1px 12px rgba(0,0,0,0.05);
        }
        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.9rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .brand-icon {
          width: 34px;
          height: 34px;
          background: #2563eb;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
        }
        .brand-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          color: #0f172a;
          letter-spacing: -0.01em;
        }
        .navbar-user {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .user-info {
          text-align: right;
        }
        .user-name {
          display: block;
          font-weight: 600;
          font-size: 0.875rem;
          color: #0f172a;
        }
        .user-role {
          display: block;
          font-size: 0.75rem;
          color: #64748b;
        }
        .nav-dashboard-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #475569;
          font-size: 1.1rem;
          text-decoration: none;
          transition: background 0.2s;
        }
        .nav-dashboard-btn:hover { background: #e2e8f0; }

        /* ─── HERO ─────────────────────────────────────── */
        .hero {
          background: white;
          padding: 5rem 0 4rem;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #dbeafe 0%, transparent 70%);
          top: -200px;
          right: -100px;
          border-radius: 50%;
          pointer-events: none;
        }
        .hero-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }
        .hero-left { position: relative; z-index: 1; }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #2563eb;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 0.4rem 1rem;
          border-radius: 100px;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .badge-dot {
          width: 6px;
          height: 6px;
          background: #2563eb;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.3); }
        }
        .hero-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }
        .hero-accent {
          color: #2563eb;
        }
        .hero-subtitle {
          font-size: 1rem;
          color: #64748b;
          line-height: 1.7;
          max-width: 480px;
          margin-bottom: 2rem;
        }
        .hero-cta {
          display: flex;
          gap: 0.875rem;
          flex-wrap: wrap;
        }
        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.8rem 1.75rem;
          background: #2563eb;
          color: white;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 4px 14px rgba(37,99,235,0.3);
        }
        .cta-primary:hover {
          background: #1d4ed8;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }
        .cta-outline {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.8rem 1.75rem;
          background: transparent;
          color: #0f172a;
          border: 2px solid #e2e8f0;
          border-radius: 100px;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          transition: all 0.25s ease;
        }
        .cta-outline:hover {
          border-color: #2563eb;
          color: #2563eb;
          transform: translateY(-2px);
        }

        /* ─── HERO ILLUSTRATION ────────────────────────── */
        .hero-right { display: flex; justify-content: flex-end; }
        .hero-image-card {
          width: 420px;
          height: 380px;
          background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
          border-radius: 28px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 20px 60px rgba(0,0,0,0.08);
          overflow: hidden;
          position: relative;
          animation: heroFloat 6s ease-in-out infinite;
        }
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .image-inner {
          width: 100%;
          height: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .floating-icon {
          position: absolute;
          font-size: 1.5rem;
          animation: floatIcon 4s ease-in-out infinite;
          background: white;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }
        .fi-1 { top: 14%; left: 10%; animation-delay: 0s; }
        .fi-2 { top: 14%; right: 10%; animation-delay: -1s; }
        .fi-3 { bottom: 20%; left: 12%; animation-delay: -2s; }
        .fi-4 { bottom: 20%; right: 12%; animation-delay: -3s; }
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(5deg); }
        }
        .center-graphic {
          position: relative;
          width: 140px;
          height: 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .graphic-ring {
          position: absolute;
          border-radius: 50%;
          border: 2px solid;
          animation: spinRing 10s linear infinite;
        }
        .ring-1 { width: 140px; height: 140px; border-color: rgba(37,99,235,0.2); }
        .ring-2 { width: 100px; height: 100px; border-color: rgba(37,99,235,0.35); animation-duration: 7s; animation-direction: reverse; }
        .ring-3 { width: 60px; height: 60px; border-color: rgba(37,99,235,0.5); animation-duration: 5s; }
        @keyframes spinRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .graphic-core {
          width: 44px;
          height: 44px;
          background: #2563eb;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          z-index: 1;
          box-shadow: 0 4px 20px rgba(37,99,235,0.4);
        }
        .stat-pill {
          position: absolute;
          background: white;
          border-radius: 12px;
          padding: 0.5rem 1rem;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          border: 1px solid #e2e8f0;
        }
        .sp-top { top: 50%; right: 4%; transform: translateY(-80%); }
        .sp-bottom { bottom: 10%; left: 50%; transform: translateX(-50%); }
        .sp-num {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800;
          font-size: 1rem;
          color: #2563eb;
        }
        .sp-label { font-size: 0.7rem; color: #64748b; font-weight: 500; }

        /* ─── SHARED SECTION UTILS ─────────────────────── */
        .section-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
        }
        .section-head {
          text-align: center;
          margin-bottom: 3rem;
        }
        .section-label {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
        }
        .section-underline {
          width: 48px;
          height: 4px;
          background: #2563eb;
          border-radius: 4px;
          margin: 0 auto;
        }
        .section-tag {
          display: inline-block;
          background: #eff6ff;
          color: #2563eb;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 0.35rem 0.9rem;
          border-radius: 100px;
          margin-bottom: 0.75rem;
          text-transform: uppercase;
        }
        .section-title-lg {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 0.75rem;
          line-height: 1.15;
        }
        .section-desc {
          color: #64748b;
          font-size: 0.95rem;
          line-height: 1.6;
          max-width: 440px;
        }

        /* ─── TIMELINE ─────────────────────────────────── */
        .timeline-section {
          padding: 5rem 0;
          background: #f4f6fb;
        }
        .timeline-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
        }
        .timeline-card {
          background: white;
          border-radius: 20px;
          padding: 1.75rem 1.5rem 1.5rem;
          border: 1px solid #e8ecf2;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          cursor: default;
        }
        .timeline-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          border-color: #bfdbfe;
        }
        .tc-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          margin-bottom: 1.25rem;
          opacity: 0.92;
        }
        .tc-date {
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
        }
        .tc-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.6rem;
        }
        .tc-desc {
          font-size: 0.85rem;
          color: #64748b;
          line-height: 1.5;
        }
        .tc-step-num {
          position: absolute;
          bottom: 1.25rem;
          right: 1.25rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 2rem;
          font-weight: 900;
          color: #f1f5f9;
          line-height: 1;
          user-select: none;
        }

        /* ─── ANNOUNCEMENTS ────────────────────────────── */
        .ann-section {
          padding: 5rem 0;
          background: white;
        }
        .ann-section .section-head { text-align: left; }
        .ann-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .ann-card {
          background: #f8fafc;
          border-radius: 20px;
          padding: 1.75rem;
          border: 1px solid #e8ecf2;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .ann-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.07);
          border-color: #bfdbfe;
          background: white;
        }
        .ann-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .ann-chip {
          font-size: 0.72rem;
          font-weight: 600;
          color: #64748b;
          background: #e2e8f0;
          padding: 0.25rem 0.7rem;
          border-radius: 100px;
        }
        .ann-badge {
          font-size: 0.65rem;
          font-weight: 700;
          color: white;
          background: #2563eb;
          padding: 0.2rem 0.6rem;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .ann-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
          line-height: 1.3;
        }
        .ann-content {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.6;
          flex: 1;
        }
        .ann-footer { margin-top: auto; }
        .ann-read {
          font-size: 0.825rem;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
          transition: gap 0.2s;
        }
        .ann-read:hover { text-decoration: underline; }
        .ann-accent-bar {
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(180deg, #2563eb, #7c3aed);
          border-radius: 0 0 0 0;
        }

        /* ─── FAQ ──────────────────────────────────────── */
        .faq-section {
          padding: 5rem 0;
          background: #f4f6fb;
        }
        .faq-inner {
          display: grid;
          grid-template-columns: 1fr 1.4fr;
          gap: 4rem;
          align-items: start;
        }
        .faq-left { position: relative; padding-top: 0.5rem; }
        .faq-left .section-desc { margin-top: 1rem; }
        .faq-deco {
          position: absolute;
          bottom: -2rem;
          left: -1rem;
          pointer-events: none;
        }
        .faq-deco-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.08;
        }
        .c1 { width: 180px; height: 180px; background: #2563eb; top: 0; left: 0; }
        .c2 { width: 100px; height: 100px; background: #7c3aed; top: 60px; left: 60px; }

        .faq-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .faq-item {
          background: white;
          border-radius: 14px;
          border: 1px solid #e8ecf2;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .faq-item:hover { border-color: #bfdbfe; }
        .faq-item.faq-open {
          border-color: #2563eb;
          box-shadow: 0 4px 20px rgba(37,99,235,0.1);
        }
        .faq-question-btn {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          text-align: left;
        }
        .faq-q-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          color: #0f172a;
          line-height: 1.4;
        }
        .faq-chevron {
          width: 28px;
          height: 28px;
          min-width: 28px;
          background: #f1f5f9;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          font-weight: 700;
          color: #475569;
          transition: all 0.25s ease;
        }
        .faq-open .faq-chevron {
          background: #2563eb;
          color: white;
        }
        .faq-answer-wrap {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.35s ease, padding 0.35s ease;
        }
        .faq-open .faq-answer-wrap {
          max-height: 200px;
          padding-bottom: 1.1rem;
        }
        .faq-answer-text {
          padding: 0 1.25rem;
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.65;
        }

        /* ─── FOOTER ───────────────────────────────────── */
        .site-footer {
          background: white;
          border-top: 1px solid #e8ecf2;
          padding: 2.5rem 0;
        }
        .footer-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .footer-copy { font-size: 0.85rem; color: #94a3b8; }
        .footer-contact { font-size: 0.8rem; color: #94a3b8; }

        /* ─── SKELETON ─────────────────────────────────── */
        .skeleton-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }
        .skeleton-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8ecf2;
          padding: 1.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .sk-line {
          height: 14px;
          border-radius: 8px;
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .sk-short { width: 35%; }
        .sk-long { width: 100%; }
        .sk-medium { width: 65%; }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* ─── EMPTY STATE ──────────────────────────────── */
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 20px;
          border: 1px dashed #e2e8f0;
          color: #94a3b8;
        }
        .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }

        /* ─── SCROLL ANIMATIONS ────────────────────────── */
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }
        .animate-on-scroll.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ─── HERO ENTRANCE ────────────────────────────── */
        .hero-left { animation: slideInLeft 0.7s ease-out both; }
        .hero-right { animation: slideInRight 0.7s ease-out 0.15s both; }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* ─── RESPONSIVE ───────────────────────────────── */
        @media (max-width: 1024px) {
          .timeline-grid { grid-template-columns: repeat(2, 1fr); }
          .ann-grid { grid-template-columns: repeat(2, 1fr); }
          .faq-inner { grid-template-columns: 1fr; gap: 2rem; }
          .faq-left { padding-top: 0; }
          .skeleton-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .hero-inner { grid-template-columns: 1fr; }
          .hero-right { display: none; }
          .hero-title { font-size: 2.4rem; }
          .timeline-grid { grid-template-columns: 1fr 1fr; }
          .ann-grid { grid-template-columns: 1fr; }
          .section-title-lg { font-size: 1.85rem; }
          .skeleton-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .timeline-grid { grid-template-columns: 1fr; }
          .hero-title { font-size: 2rem; }
        }
      `}</style>
    </div>
  );
}