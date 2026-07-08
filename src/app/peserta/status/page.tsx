'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePeserta } from '@/hooks/usePeserta';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/peserta/navbar';
import SideBar from '@/components/layout/peserta/sidebarMenu';

/* ═══════════════════════════════════════════════════════
   TILT CARD (dipertahankan untuk efek hover card)
═══════════════════════════════════════════════════════ */
function TiltCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg) translateY(-3px)`;
    el.style.transition = 'transform 0.05s linear';
  }, []);

  const handleLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = '';
    el.style.transition = 'transform 0.5s cubic-bezier(0.22,1,0.36,1)';
  }, []);

  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   ICONS
═══════════════════════════════════════════════════════ */
const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

const IconBolt = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconTeam = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>
);

const IconCode = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

const IconClock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 18l-6-6 6-6" />
  </svg>
);

const IconAlert = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconInfo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function StatusPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { status, loading, fetchStatus, confirmLolos, confirmBootcamp } = usePeserta();
  const [shirtSizes, setShirtSizes] = useState<Record<number, string>>({});
  const [projectType, setProjectType] = useState<'AI Application' | 'Game Dev' | 'Video Animation'>('AI Application');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Scroll-reveal animation
  useEffect(() => {
    if (loading || fetchError || !status) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    }, 60);
    return () => { clearTimeout(timer); obs.disconnect(); };
  }, [loading, fetchError, status]);

  // Fetch status data
  useEffect(() => {
    const load = async () => {
      setFetchError(null);
      try {
        await fetchStatus();
      } catch (err: any) {
        console.error(err);
        setFetchError(err.response?.data?.message || err.message || 'Gagal memuat data tim');
      }
    };
    load();
  }, [fetchStatus]);

  // Auth guard
  useEffect(() => {
    if (!user) router.replace('/auth/login');
    else if (user.role !== 'peserta') router.replace('/dashboard');
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleConfirmLolos = async () => {
    if (!status?.members) return;
    const missing = status.members.some(m => !shirtSizes[m.id]);
    if (missing) {
      setError('Harap pilih ukuran baju untuk semua anggota tim');
      setTimeout(() => setError(''), 3000);
      return;
    }
    const payload = { members: status.members.map(m => ({ member_id: m.id, shirt_size: shirtSizes[m.id] })) };
    try {
      await confirmLolos(payload);
      setMessage('Konfirmasi berhasil! Data tersimpan.');
      setError('');
      await fetchStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal konfirmasi');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleConfirmBootcamp = async () => {
    if (!projectType) {
      setError('Pilih jenis proyek terlebih dahulu');
      setTimeout(() => setError(''), 3000);
      return;
    }
    try {
      await confirmBootcamp({ project_type: projectType, description });
      setMessage('Konfirmasi berhasil! Tim siap mengikuti hackathon.');
      setError('');
      await fetchStatus();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal konfirmasi');
      setTimeout(() => setError(''), 3000);
    }
  };

  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  const statusMeta: Record<string, { color: string; bg: string; label: string }> = {
    lolos_seleksi: { color: '#0D9488', bg: '#ECFEFF', label: 'Lolos Seleksi' },
    rejected: { color: '#E11D48', bg: '#FFF1F2', label: 'Tidak Lolos' },
    follow_the_bootcamp: { color: '#0284C7', bg: '#EFF8FF', label: 'Tahap Bootcamp' },
    first_half_hackathon: { color: '#0284C7', bg: '#EFF8FF', label: 'Hackathon First Half' },
    semi_final: { color: '#0284C7', bg: '#EFF8FF', label: 'Semi Final' },
    final: { color: '#0284C7', bg: '#EFF8FF', label: 'Final' },
    pending: { color: '#0EA5E9', bg: '#F0F9FF', label: 'Menunggu Seleksi' },
  };

  const meta = status && status.team ? (statusMeta[status.team.selection_status] || statusMeta.pending) : statusMeta.pending;
  const statusColor = meta.color;
  const statusBg = meta.bg;
  const statusLabel = meta.label;

  const renderActionForm = () => {
    if (!status || !status.team) return null;
    if (status.team.selection_status === 'lolos_seleksi') {
      return (
        <div className="action-form">
          <div className="form-header">
            <div className="form-badge success">Konfirmasi Ukuran Baju</div>
            <p className="form-desc">Silakan isi ukuran baju untuk setiap anggota tim.</p>
          </div>
          <div className="members-list">
            {status.members.map((m, idx) => (
              <div key={m.id} className="member-row">
                <div className="member-info">
                  <span className="member-num">{String(idx + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="member-name">{m.name}</p>
                    <span className="member-role">{m.position || 'Anggota'}</span>
                  </div>
                </div>
                <div className="member-select">
                  <select
                    value={shirtSizes[m.id] || ''}
                    onChange={(e) => setShirtSizes({ ...shirtSizes, [m.id]: e.target.value })}
                    className="size-select"
                  >
                    <option value="">Pilih ukuran</option>
                    <option value="XS">XS</option><option value="S">S</option><option value="M">M</option>
                    <option value="L">L</option><option value="XL">XL</option><option value="XXL">XXL</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleConfirmLolos} className="btn-primary">
            <IconCheck /> Konfirmasi & Lanjutkan
          </button>
        </div>
      );
    }

    if (status.team.selection_status === 'follow_the_bootcamp') {
      return (
        <div className="action-form">
          <div className="form-header">
            <div className="form-badge info">Pilih Jenis Proyek</div>
            <p className="form-desc">Tentukan jenis proyek yang akan dikerjakan tim kamu.</p>
          </div>
          <div className="project-options">
            <label className={`project-option ${projectType === 'AI Application' ? 'active' : ''}`}>
              <input type="radio" name="projectType" value="AI Application" checked={projectType === 'AI Application'} onChange={(e) => setProjectType(e.target.value as any)} />
              <div className="project-icon ai">AI</div>
              <div><span className="project-label">AI Application</span><span className="project-desc">Aplikasi berbasis kecerdasan buatan</span></div>
            </label>
            <label className={`project-option ${projectType === 'Game Dev' ? 'active' : ''}`}>
              <input type="radio" name="projectType" value="Game Dev" checked={projectType === 'Game Dev'} onChange={(e) => setProjectType(e.target.value as any)} />
              <div className="project-icon game">GD</div>
              <div><span className="project-label">Game Dev</span><span className="project-desc">Pengembangan game interaktif</span></div>
            </label>
            <label className={`project-option ${projectType === 'Video Animation' ? 'active' : ''}`}>
              <input type="radio" name="projectType" value="Video Animation" checked={projectType === 'Video Animation'} onChange={(e) => setProjectType(e.target.value as any)} />
              <div className="project-icon video">VA</div>
              <div><span className="project-label">Video Animation</span><span className="project-desc">Animasi video kreatif</span></div>
            </label>
          </div>
          <textarea placeholder="Deskripsikan konsep proyek tim kamu (opsional)..." value={description} onChange={(e) => setDescription(e.target.value)} className="project-desc-input" rows={3} />
          <button onClick={handleConfirmBootcamp} className="btn-primary"><IconCheck /> Konfirmasi & Mulai Hackathon</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="root">
      {/* BACKGROUND DECORATIVE */}
      <div className="bg" aria-hidden>
        <div className="bg-grid" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
      </div>

      <Navbar user={user} onLogout={handleLogout} scrolled={scrolled} scrollPercent={scrollPct} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      {/* Main Content */}
      <main className="main">
        <div className="wrap">
          {/* Loading State */}
          {loading && (
            <div className="loader-root">
              <div className="loader-card">
                <div className="loader-rings">
                  <div className="lr lr1" /><div className="lr lr2" /><div className="lr lr3" />
                </div>
                <p className="loader-text">Memuat status tim...</p>
              </div>
            </div>
          )}

          {/* Fetch Error State */}
          {!loading && fetchError && (
            <div className="error-root">
              <div className="error-card">
                <div className="error-icon-wrap"><IconAlert /></div>
                <h2>Gagal memuat data</h2>
                <p>{fetchError}</p>
                <button onClick={() => window.location.reload()} className="btn-primary">Coba Lagi</button>
              </div>
            </div>
          )}

          {/* No Team State */}
          {!loading && !fetchError && (!status || !status.team) && (
            <div className="error-root">
              <div className="error-card">
                <div className="error-icon-wrap"><IconTeam /></div>
                <h2>Tim belum terdaftar</h2>
                <p>Anda belum memiliki tim. Silakan daftarkan tim Anda terlebih dahulu.</p>
                <Link href="/peserta/dashboard" className="btn-primary">Ke Dashboard</Link>
              </div>
            </div>
          )}

          {/* Normal Content (when data loaded) */}
          {!loading && !fetchError && status && status.team && (
            <div className="two-columns">
              {/* SIDEBAR KIRI */}
              <aside className="sidebar">
                <div className="back-link-wrap fade-up" style={{ '--fd': '0ms' } as React.CSSProperties}>
                  <Link href="/peserta/dashboard" className="back-link">
                    <IconArrowLeft />
                    Kembali ke Dashboard
                  </Link>
                </div>
                <SideBar/>
              </aside>

              {/* KONTEN UTAMA KANAN */}
              <div className="content-main">
                <div className="page-header fade-up" style={{ '--fd': '40ms' } as React.CSSProperties}>
                  <span className="page-eyebrow">Portal Peserta</span>
                  <h1 className="page-title">Status Tim</h1>
                  <p className="page-desc">Pantau progres tim, cek status seleksi, dan selesaikan tahapan berikutnya.</p>
                </div>

                {/* ─── CARD GRID – layout baru ─── */}
                <div className="cards-grid">
                  {/* ─── CARD 1: Team Overview + Review Status (dua kolom) ─── */}
                  <TiltCard
                    className="info-card card-hero fade-up"
                    style={{ '--fd': '80ms' } as React.CSSProperties}
                  >
                    <div className="team-overview-layout">
                      {/* KOLOM KIRI: Team Status */}
                      <div className="team-status-col">
                        <div className="card-header">
                          <div className="card-icon" style={{ background: statusBg, color: statusColor }}>
                            <IconTeam />
                          </div>
                          <h2 className="card-title">Team Status</h2>
                        </div>
                        <div className="team-name">{status.team.team_name || 'Nama Tim'}</div>
                        <div className="status-badge" style={{ background: statusBg, color: statusColor }}>
                          <span className="status-dot" style={{ background: statusColor }} />
                          {statusLabel}
                        </div>
                        <div className="team-code">
                          Kode Tim · <span>{String(status.team.id).slice(0, 8)}</span>
                        </div>
                        {status.team.selection_note && (
                          <div className="selection-note">{status.team.selection_note}</div>
                        )}
                      </div>

                      {/* KOLOM KANAN: Review Status (sebagai card kecil) */}
                      <div className="review-status-col">
                        <div className="review-inner-card">
                          <div className="card-header">
                            <div
                              className="card-icon"
                              style={{
                                background:
                                  status.team.selection_status === 'rejected' ? '#FFF1F2' : '#F0F9FF',
                                color:
                                  status.team.selection_status === 'rejected' ? '#E11D48' : '#0284C7',
                              }}
                            >
                              <IconAlert />
                            </div>
                            <h2 className="card-title">Review Status</h2>
                          </div>
                          {status.team.selection_status === 'rejected' ? (
                            <div className="review-rejected">
                              <div className="rejected-badge">Rejected</div>
                              {status.team.selection_note && (
                                <p className="rejected-note">{status.team.selection_note}</p>
                              )}
                              <p className="rejected-message">
                                Mohon maaf, tim kamu tidak lolos seleksi. Tetap semangat untuk event berikutnya!
                              </p>
                            </div>
                          ) : (
                            <div className="review-pending">
                              <p>Status tim masih dalam proses review atau sedang dalam tahap aktif.</p>
                              {status.team.selection_note && (
                                <p className="info-note-text">Catatan: {status.team.selection_note}</p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TiltCard>

                  {/* ─── CARD 3: Progress Steps (terpisah di bawah) ─── */}
                  <TiltCard
                    className="info-card fade-up"
                    style={{ '--fd': '120ms' } as React.CSSProperties}
                  >
                    <div className="card-header-3">
                      <div className="card-icon" style={{ background: '#F0F9FF', color: '#0284C7' }}>
                        <IconClock />
                      </div>
                      <h2 className="card-title">Team Progress</h2>
                    
                    <div className="progress-steps-row">
                      {[
                        { step: 1, label: 'Pendaftaran', completedFor: ['lolos_seleksi', 'follow_the_bootcamp', 'first_half_hackathon', 'semi_final', 'final'], activeWhen: 'pending' },
                        { step: 2, label: 'Seleksi Berkas', completedFor: ['follow_the_bootcamp', 'first_half_hackathon', 'semi_final', 'final'], activeWhen: 'lolos_seleksi' },
                        { step: 3, label: 'Hackathon', completedFor: ['first_half_hackathon', 'semi_final', 'final'], activeWhen: 'follow_the_bootcamp' },
                        { step: 4, label: 'Final & Pitching', completedFor: ['semi_final', 'final'], activeWhen: 'first_half_hackathon' },
                      ].map((item, idx) => {
                        const isCompleted = item.completedFor.includes(status.team.selection_status);
                        const isActive = !isCompleted && status.team.selection_status === item.activeWhen;
                        return (
                          <div
                            key={item.step}
                            className={`step-row ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                          >
                            <div className="step-number">{item.step}</div>
                            <span className="step-label">{item.label}</span>
                            {idx < 3 && <div className="step-line" />}
                          </div>
                        );
                      })}
                    </div>
                    </div>
                  </TiltCard>
                </div>

                {renderActionForm() && (
                  <div className="action-section fade-up" style={{ '--fd': '200ms' } as React.CSSProperties}>
                    <TiltCard className="action-card">
                      <div className="action-card-header">
                        <span className="action-spark" />
                        Aksi yang diperlukan
                      </div>
                      {renderActionForm()}
                    </TiltCard>
                  </div>
                )}

                {message && <div className="alert-success global-alert"><IconCheck /><span>{message}</span></div>}
                {error && <div className="alert-error global-alert"><span>{error}</span></div>}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ========== GLOBAL STYLES ========== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --blue:#0284C7;--blue-bright:#0EA5E9;--blue-50:#F0F9FF;--blue-100:#E0F2FE;--blue-200:#BAE6FD;
          --cyan:#0D9488;--cyan-bright:#06B6D4;--cyan-50:#ECFEFF;--cyan-100:#CFFAFE;
          --rose:#E11D48;
          --ink:#0F172A;--ink-2:#334155;--ink-3:#64748B;--ink-4:#94A3B8;
          --white:#FFFFFF;--bg:#F7FAFC;--surface:#FFFFFF;--surface-2:#F4F8FB;
          --border:rgba(2,132,199,0.10);
          --sh-xs:0 1px 3px rgba(15,23,42,0.05),0 1px 2px rgba(15,23,42,0.04);
          --sh-sm:0 4px 18px rgba(2,132,199,0.07),0 1px 4px rgba(15,23,42,0.04);
          --sh-md:0 12px 32px rgba(2,132,199,0.10),0 2px 8px rgba(15,23,42,0.05);
          --sh-lg:0 24px 64px rgba(2,132,199,0.14),0 4px 16px rgba(15,23,42,0.07);
          --r-sm:10px;--r-md:16px;--r-lg:22px;--r-xl:28px;--r-2xl:36px;
          --ff-display:'Outfit',system-ui,sans-serif;
          --ff-body:'Inter',system-ui,sans-serif;
          --ease:cubic-bezier(0.22,1,0.36,1);
        }
        body{background:var(--bg);font-family:var(--ff-body);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.6;}
        a{text-decoration:none;color:inherit;}
        @keyframes orbDrift {
          0%,100%{transform:translate(0,0) scale(1);}
          50%{transform:translate(20px,-16px) scale(1.04);}
        }
        @keyframes fadeUpIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spinRing{to{transform:rotate(360deg);}}
        @keyframes spinRingReverse{to{transform:rotate(-360deg);}}
        @keyframes dotPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.55;transform:scale(0.85);}}
        @keyframes sparkPulse{0%,100%{box-shadow:0 0 0 0 rgba(6,182,212,0.4);}50%{box-shadow:0 0 0 6px rgba(6,182,212,0);}}
        .fade-up{opacity:0;transform:translateY(18px);transition:opacity 0.55s var(--ease),transform 0.55s var(--ease);transition-delay:var(--fd,0ms);}
        .fade-up.in{opacity:1;transform:translateY(0);}
        .tilt-card{transform-style:preserve-3d;will-change:transform;transition:transform 0.5s var(--ease);}
        @media (prefers-reduced-motion: reduce){
          .fade-up{opacity:1;transform:none;transition:none;}
          .tilt-card{transition:none !important;transform:none !important;}
          .bg-orb{animation:none;}
          .status-dot, .action-spark{animation:none;}
        }
      `}</style>

      {/* ========== SCOPED STYLES ========== */}
      <style jsx>{`
        .root { min-height: 100vh; position: relative; overflow-x: clip; }

        /* BACKGROUND DECORATIVE */
        .bg { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(2,132,199,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(2,132,199,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(ellipse 65% 60% at 50% 20%, black 10%, transparent 75%);
        }
        .bg-orb { position: absolute; border-radius: 50%; filter: blur(90px); animation: orbDrift 24s ease-in-out infinite; }
        .bg-orb-1 { width: 600px; height: 600px; background: radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 65%); top: -220px; left: -160px; }
        .bg-orb-2 { width: 480px; height: 480px; background: radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%); bottom: -120px; right: -120px; animation-duration: 30s; animation-direction: reverse; }

        /* MAIN CONTENT */
        .main { position: relative; z-index: 1; padding: 2.25rem 2rem 5rem; }
        .wrap { max-width: 1280px; margin: 0 auto; }

        /* LAYOUT DUA KOLOM */
        .two-columns {
          display: flex;
          gap: 2rem;
          align-items: flex-start;
        }

        /* KONTEN UTAMA */
        .content-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        /* Back link */
        .back-link { display: flex; flex-direction: row; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 500; color: var(--blue); transition: gap 0.2s, color 0.2s; }
        .back-link:hover { gap: 0.7rem; color: var(--cyan-bright); }

        /* Page header */
        .page-header { display: flex; flex-direction: column; gap: 0.35rem; }
        .page-eyebrow { font-size: 0.7rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--blue); }
        .page-title { font-family: var(--ff-display); font-size: 2rem; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; }
        .page-desc { font-size: 0.92rem; color: var(--ink-3); }

        /* CARDS GRID - sekarang hanya dua card, dengan card 1 dua kolom dan card 3 sendiri */
        .cards-grid {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .info-card {
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          padding: 1.3rem;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .info-card:hover {
          border-color: var(--blue-200);
          box-shadow: var(--sh-md);
        }
        .card-hero { background: linear-gradient(165deg, var(--surface-2) 0%, var(--blue-50) 100%); }

        /* ─── LAYOUT DUA KOLOM DALAM CARD 1 ─── */
        .team-overview-layout {
        
        background: var(--white);
          border-radius: var(--r-md);
          padding: 1.1rem 1.1rem 1.1rem 1.1rem;
          border: 1px solid var(--border);
          box-shadow: var(--sh--xs);
          display: flex;
          gap: 1.5rem;
          align-items: stretch;
        }

        .team-status-col {
          flex: 1.2;  /* lebih lebar */
          min-width: 0;
        }

        .review-status-col {
          flex: 0.8;  /* lebih ramping */
          min-width: 0;
        }

        .review-inner-card {
          background: var(--white);
          border-radius: var(--r-md);
          padding: 1.1rem 1.1rem 1.1rem 1.1rem;
          border: 1px solid var(--border);
          height: 100%;
          box-shadow: var(--sh-xs);
          transition: border-color 0.25s, box-shadow 0.25s;
        }

        .review-inner-card:hover {
          border-color: var(--blue-200);
          box-shadow: var(--sh-sm);
        }

        .card-header { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }

        .card-header-3 {
        background: var(--white);
        border-radius: var(--r-lg);
        padding: 1.3rem;
        border: 1px solid var(--border);
        box-shadow: var(--sh-lg)
        display: flex; 
        align-items: center; 
        gap: 0.75rem; 
        margin-bottom: 1rem;
        }

        .card-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .card-title { font-family: var(--ff-display); font-size: 1rem; font-weight: 700; color: var(--ink); }
        .team-name { font-family: var(--ff-display); font-size: 1.25rem; font-weight: 700; color: var(--ink); margin-bottom: 0.6rem; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.7rem; font-weight: 700; padding: 0.35rem 0.9rem; border-radius: 999px; margin-bottom: 0.6rem; }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; animation: dotPulse 2.4s ease-in-out infinite; }
        .team-code { font-size: 0.72rem; color: var(--ink-4); font-weight: 500; }
        .team-code span { font-family: var(--ff-display); color: var(--ink-2); font-weight: 600; }
        .selection-note { font-size: 0.78rem; color: var(--ink-2); background: var(--white); border: 1px solid var(--border); padding: 0.6rem 0.75rem; border-radius: var(--r-sm); margin-top: 0.85rem; line-height: 1.5; }

        /* ─── PROGRESS STEPS ROW (horizontal) ─── */
        .progress-steps-row {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: flex-start;
          padding: 0.75rem 0 0.25rem;
          position: relative;
        }

        .step-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          text-align: center;
          position: relative;
          min-width: 0;
        }

        .step-row .step-number {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--surface-2);
          color: var(--ink-4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
          font-family: var(--ff-display);
          transition: background 0.3s, color 0.3s, box-shadow 0.3s;
          position: relative;
          z-index: 2;
          margin-bottom: 0.35rem;
        }

        .step-row.completed .step-number {
          background: linear-gradient(135deg, var(--cyan), var(--cyan-bright));
          color: white;
        }
        .step-row.active .step-number {
          background: linear-gradient(135deg, var(--blue), var(--blue-bright));
          color: white;
          box-shadow: 0 0 0 4px var(--blue-50);
        }

        .step-row .step-label {
          font-size: 0.65rem;
          font-weight: 500;
          color: var(--ink-3);
          line-height: 1.2;
          max-width: 70px;
          word-wrap: break-word;
        }
        .step-row.completed .step-label {
          color: var(--cyan);
          font-weight: 600;
        }
        .step-row.active .step-label {
          color: var(--blue);
          font-weight: 700;
        }

        /* Garis penghubung antar step */
        .step-line {
          position: absolute;
          top: 16px; /* sejajar dengan tengah step-number */
          left: calc(50% + 16px);
          width: calc(100% - 32px);
          height: 2.5px;
          background: var(--border);
          z-index: 1;
          transition: background 0.3s;
        }
        .step-row.completed + .step-row .step-line,
        .step-row.completed ~ .step-row .step-line {
          background: var(--cyan-bright);
        }
        .step-row.active + .step-row .step-line,
        .step-row.active ~ .step-row .step-line {
          background: var(--blue-bright);
        }

        /* Review */
        .review-rejected { text-align: center; }
        .rejected-badge { background: #FFF1F2; color: var(--rose); border-radius: 999px; padding: 0.32rem 1rem; display: inline-block; font-weight: 700; font-size: 0.7rem; margin-bottom: 0.75rem; }
        .rejected-note { background: var(--surface-2); border-radius: var(--r-md); padding: 0.65rem; font-size: 0.78rem; margin: 0.6rem 0; color: var(--ink-2); }
        .rejected-message { font-size: 0.82rem; color: var(--ink-3); }
        .review-pending { font-size: 0.83rem; color: var(--ink-3); line-height: 1.6; }
        .info-note-text { margin-top: 0.6rem; font-size: 0.74rem; color: var(--blue); font-weight: 500; }

        /* ACTION SECTION */
        .action-section { margin-top: 0.25rem; }
        .action-card { background: linear-gradient(165deg, var(--white) 0%, var(--cyan-50) 100%); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 1.75rem; box-shadow: var(--sh-md); }
        .action-card-header { display: flex; align-items: center; gap: 0.6rem; font-family: var(--ff-display); font-weight: 700; font-size: 1.05rem; margin-bottom: 1.25rem; color: var(--ink); }
        .action-spark { width: 9px; height: 9px; border-radius: 50%; background: var(--cyan-bright); animation: sparkPulse 2.4s infinite; flex-shrink: 0; }
        .action-form { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-header { text-align: center; }
        .form-badge { display: inline-block; padding: 0.32rem 0.95rem; border-radius: 999px; font-size: 0.72rem; font-weight: 700; margin-bottom: 0.55rem; }
        .form-badge.success { background: var(--cyan-50); color: var(--cyan); }
        .form-badge.info { background: var(--blue-50); color: var(--blue); }
        .form-desc { font-size: 0.83rem; color: var(--ink-3); }
        .members-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .member-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; padding: 0.7rem 0.85rem; background: var(--white); border: 1px solid var(--border); border-radius: var(--r-md); transition: border-color 0.2s; }
        .member-row:hover { border-color: var(--blue-200); }
        .member-info { display: flex; align-items: center; gap: 0.65rem; }
        .member-num { font-family: var(--ff-display); font-size: 0.68rem; font-weight: 700; color: var(--blue); background: var(--blue-50); padding: 0.15rem 0.5rem; border-radius: 20px; }
        .member-name { font-weight: 600; font-size: 0.83rem; color: var(--ink); }
        .member-role { font-size: 0.66rem; color: var(--ink-4); }
        .size-select { padding: 0.4rem 0.8rem; border-radius: 40px; border: 1.5px solid var(--border); font-size: 0.74rem; font-weight: 600; color: var(--ink-2); background: var(--white); cursor: pointer; transition: border-color 0.2s; }
        .size-select:focus { outline: none; border-color: var(--blue-bright); }
        .project-options { display: flex; flex-direction: column; gap: 0.6rem; }
        .project-option { display: flex; align-items: center; gap: 0.85rem; padding: 0.75rem 0.85rem; background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r-md); cursor: pointer; transition: border-color 0.2s, background 0.2s; }
        .project-option:hover { border-color: var(--blue-200); }
        .project-option.active { border-color: var(--blue-bright); background: var(--blue-50); }
        .project-option input { position: absolute; opacity: 0; pointer-events: none; }
        .project-icon { width: 38px; height: 38px; border-radius: 11px; display: flex; align-items: center; justify-content: center; font-family: var(--ff-display); font-weight: 800; font-size: 0.7rem; letter-spacing: 0.02em; flex-shrink: 0; color: white; }
        .project-icon.ai { background: linear-gradient(135deg, var(--blue), var(--blue-bright)); }
        .project-icon.game { background: linear-gradient(135deg, var(--cyan), var(--cyan-bright)); }
        .project-icon.video { background: linear-gradient(135deg, #6366F1, var(--blue-bright)); }
        .project-label { display: block; font-weight: 700; font-size: 0.85rem; color: var(--ink); }
        .project-desc { display: block; font-size: 0.7rem; color: var(--ink-4); margin-top: 0.1rem; }
        .project-desc-input { width: 100%; padding: 0.7rem 0.85rem; border-radius: var(--r-md); border: 1.5px solid var(--border); font-size: 0.8rem; font-family: var(--ff-body); resize: vertical; background: var(--white); color: var(--ink-2); transition: border-color 0.2s; }
        .project-desc-input:focus { outline: none; border-color: var(--blue-bright); }
        .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; background: linear-gradient(135deg, var(--blue-bright), var(--cyan-bright)); border: none; border-radius: 40px; padding: 0.7rem 1.4rem; font-weight: 700; font-size: 0.8rem; color: white; cursor: pointer; transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease); width: fit-content; font-family: var(--ff-body); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(14,165,233,0.35); }

        .alert-success, .alert-error { display: flex; align-items: center; gap: 0.6rem; padding: 0.85rem 1.1rem; border-radius: var(--r-md); font-size: 0.82rem; font-weight: 500; animation: fadeUpIn 0.3s var(--ease); }
        .alert-success { background: var(--cyan-50); color: #0F766E; border: 1px solid #99F6E4; }
        .alert-error { background: #FFF1F2; color: #BE123C; border: 1px solid #FECDD3; }

        .info-note { display: flex; align-items: center; gap: 0.85rem; padding: 0.95rem 1.2rem; background: var(--white); border: 1px solid var(--border); border-radius: var(--r-lg); font-size: 0.8rem; color: var(--ink-3); }
        .info-icon { width: 34px; height: 34px; border-radius: 10px; background: var(--blue-50); color: var(--blue); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .info-text a { color: var(--blue); font-weight: 600; }
        .info-text a:hover { color: var(--cyan-bright); }

        /* LOADER & ERROR STATES */
        .loader-root, .error-root { display: flex; align-items: center; justify-content: center; padding: 3rem 1rem; }
        .loader-card, .error-card { display: flex; flex-direction: column; align-items: center; gap: 1rem; background: var(--white); border: 1px solid var(--border); border-radius: 24px; padding: 2.25rem 2.75rem; box-shadow: var(--sh-md); text-align: center; max-width: 380px; }
        .error-icon-wrap { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; background: var(--blue-50); color: var(--blue); }
        .error-card h2 { font-family: var(--ff-display); font-size: 1.25rem; font-weight: 700; color: var(--ink); }
        .error-card p { color: var(--ink-3); font-size: 0.88rem; margin-bottom: 0.5rem; }
        .loader-rings { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
        .lr { position: absolute; border-radius: 50%; border-style: solid; border-color: transparent; }
        .lr1 { inset: 0; border-width: 3px; border-top-color: var(--blue-bright); animation: spinRing 0.9s linear infinite; }
        .lr2 { inset: 7px; border-width: 2.5px; border-right-color: var(--cyan-bright); animation: spinRingReverse 1.1s linear infinite; }
        .lr3 { inset: 14px; border-width: 2px; border-bottom-color: var(--cyan); animation: spinRing 1.3s linear infinite; }
        .loader-text { font-size: 0.85rem; font-weight: 500; color: var(--ink-4); }

        /* ─── RESPONSIVE ─── */
        @media (max-width: 900px) {
          .two-columns { flex-direction: column; }
          .sidebar {
            position: static;
            width: 100%;
          }
          .sidebar-menu {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .sidebar-item {
            flex: 1;
            min-width: 160px;
          }
        }

        @media (max-width: 768px) {
          .main { padding: 1.25rem 1rem 4rem; }
          .page-title { font-size: 1.5rem; }
          .action-card { padding: 1.25rem; }
          .sidebar-menu { flex-direction: column; }
          .team-overview-layout {
            flex-direction: column;
            gap: 1rem;
          }
          .review-status-col {
            flex: 1;
          }
          .progress-steps-row {
            flex-wrap: wrap;
            gap: 0.5rem 0;
            justify-content: center;
          }
          .step-row {
            flex: 0 0 auto;
            width: 45%;
            margin-bottom: 0.5rem;
          }
          .step-line {
            display: none; /* garis hilang di mobile agar rapi */
          }
          .step-row .step-label {
            font-size: 0.55rem;
            max-width: 60px;
          }
          .step-row .step-number {
            width: 26px;
            height: 26px;
            font-size: 0.65rem;
          }
        }

        @media (max-width: 480px) {
          .step-row {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}