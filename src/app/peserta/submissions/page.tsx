'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { usePeserta } from '@/hooks/usePeserta';
import { pesertaService } from '@/services/pesertaService';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/peserta/navbar';
import SideBar from '@/components/layout/peserta/sidebarMenu';

/* ═══════════════════════════════════════════════════════
   TILT CARD
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
    el.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
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

const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
  </svg>
);

const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
  </svg>
);

const IconFile = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/>
  </svg>
);

const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6"/>
  </svg>
);

const IconCode = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
  </svg>
);

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════ */
export default function SubmissionsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { submissions, fetchSubmissions, loading } = usePeserta();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<{ subId: number; cat: string } | null>(null);

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
    if (loading) return;
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); }),
      { threshold: 0.1 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll('.fade-up').forEach(el => obs.observe(el));
    }, 60);
    return () => { clearTimeout(timer); obs.disconnect(); };
  }, [loading]);

  // Fetch submissions
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Auth guard
  useEffect(() => {
    if (!user) router.replace('/auth/login');
    else if (user.role !== 'peserta') router.replace('/dashboard');
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleUpload = async (submissionId: number, category: string, fileType: string, file?: File, url?: string) => {
    const formData = new FormData();
    formData.append('submission_category', category);
    formData.append('file_type', fileType);
    if (fileType === 'file' && file) formData.append('file', file);
    if (fileType === 'link' && url) formData.append('external_url', url);
    
    setUploading(true);
    setUploadingFor({ subId: submissionId, cat: category });
    setError('');
    try {
      await pesertaService.uploadSubmissionFile(submissionId, formData);
      setMessage('File/link berhasil diupload');
      await fetchSubmissions();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal upload');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
      setUploadingFor(null);
    }
  };

  const handleSubmit = async (submissionId: number) => {
    setUploading(true);
    setError('');
    try {
      await pesertaService.submitSubmission(submissionId);
      setMessage('Submission berhasil dikumpulkan');
      await fetchSubmissions();
      setTimeout(() => setMessage(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal submit');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  if (loading) {
    return (
      <div className="loader-root">
        <div className="loader-card">
          <div className="loader-rings">
            <div className="lr lr1" /><div className="lr lr2" /><div className="lr lr3" />
          </div>
          <p className="loader-text">Memuat submission...</p>
        </div>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
          :root{
            --indigo:#4F46E5;--sky:#0EA5E9;--emerald:#059669;
            --ink:#0F172A;--ink-4:#94A3B8;--bg:#F8FAFF;--white:#FFFFFF;
            --border:rgba(79,70,229,0.10);--sh-md:0 10px 36px rgba(79,70,229,0.12);
          }
          body{background:var(--bg);font-family:'DM Sans',system-ui,sans-serif;}
          .loader-root{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;}
          .loader-card{display:flex;flex-direction:column;align-items:center;gap:1.5rem;background:white;border:1px solid var(--border);border-radius:28px;padding:3rem 4rem;box-shadow:var(--sh-md);}
          .loader-rings{position:relative;width:52px;height:52px;display:flex;align-items:center;justify-content:center;}
          .lr{position:absolute;border-radius:50%;border-style:solid;border-color:transparent;}
          .lr1{inset:0;border-width:3px;border-top-color:var(--indigo);animation:spinRing 0.9s linear infinite;}
          .lr2{inset:7px;border-width:2.5px;border-right-color:var(--sky);animation:spinRingReverse 1.1s linear infinite;}
          .lr3{inset:14px;border-width:2px;border-bottom-color:var(--emerald);animation:spinRing 1.3s linear infinite;}
          .loader-text{font-size:0.88rem;font-weight:500;color:var(--ink-4);}
          @keyframes spinRing{to{transform:rotate(360deg);}}
          @keyframes spinRingReverse{to{transform:rotate(-360deg);}}
        `}</style>
      </div>
    );
  }

  return (
    <div className="root">
      {/* BACKGROUND DECORATIVE */}
      <div className="bg" aria-hidden>
        <div className="bg-noise" />
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-lines" />
      </div>

      {/* NAVBAR */}
      <Navbar user={user} onLogout={handleLogout} scrolled={scrolled} scrollPercent={scrollPct} menuOpen={menuOpen} setMenuOpen={setMenuOpen}/>

      {/* MAIN CONTENT */}
      <main className="main">
        <div className='dashboard-layout'>
        <aside>
          <SideBar/>
        </aside>
        <div className="wrap">
          <div className="back-link-wrap fade-up" style={{ '--fd': '0ms' } as React.CSSProperties}>
            <Link href="/peserta/dashboard" className="back-link">
              <IconArrowLeft /> Kembali ke Dashboard
            </Link>
          </div>

          <div className="page-header fade-up" style={{ '--fd': '40ms' } as React.CSSProperties}>
            <span className="page-eyebrow">Hackathon</span>
            <h1 className="page-title">Submission Karya</h1>
            <p className="page-desc">Upload logbook harian, file final submission, atau tautan proyekmu di sini. Pastikan semua terisi sebelum batas waktu.</p>
          </div>

          {message && (
            <div className="alert-success global-alert fade-up" style={{ '--fd': '80ms' } as React.CSSProperties}>
              <IconCheck /><span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert-error global-alert fade-up" style={{ '--fd': '80ms' } as React.CSSProperties}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {submissions.length === 0 ? (
            <TiltCard className="empty-card fade-up" style={{ '--fd': '120ms' } as React.CSSProperties}>
              <div className="empty-icon">📭</div>
              <h3 className="empty-title">Belum ada submission</h3>
              <p className="empty-desc">Pastikan tim kamu sudah melewati tahap bootcamp. Jika sudah, silakan hubungi panitia.</p>
            </TiltCard>
          ) : (
            <div className="submissions-grid">
              {submissions.map((sub: any, idx: number) => (
                <TiltCard key={sub.id} className="submission-card fade-up" style={{ '--fd': `${120 + idx * 40}ms` } as React.CSSProperties}>
                  <div className="card-header">
                    <div className="card-icon"><IconCode /></div>
                    <div>
                      <h2 className="card-title">{sub.stage_name}</h2>
                      <p className="card-subtitle">Project Type: <strong>{sub.project_type}</strong></p>
                    </div>
                    <div className={`status-badge ${sub.status === 'submitted' ? 'submitted' : 'draft'}`}>
                      {sub.status === 'submitted' ? '✓ Submitted' : 'Draft'}
                    </div>
                  </div>

                  {['logbook_1', 'logbook_2', 'final_submission'].map((cat) => {
                    const existingFiles = sub.files?.filter((f: any) => f.submission_category === cat) || [];
                    const isUploading = uploading && uploadingFor?.subId === sub.id && uploadingFor?.cat === cat;
                    return (
                      <div key={cat} className="upload-section">
                        <div className="upload-header">
                          <span className="upload-label">
                            {cat === 'logbook_1' ? '📘 Logbook Hari 1' : cat === 'logbook_2' ? '📗 Logbook Hari 2' : '🏆 Final Submission'}
                          </span>
                          {existingFiles.length > 0 && (
                            <span className="upload-status done">✓ Terupload</span>
                          )}
                        </div>
                        <div className="upload-actions">
                          <label className={`upload-btn ${isUploading ? 'loading' : ''}`}>
                            <IconUpload />
                            <span>{isUploading ? 'Mengupload...' : 'Upload File'}</span>
                            <input
                              type="file"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleUpload(sub.id, cat, 'file', e.target.files[0]);
                              }}
                              disabled={uploading}
                              className="hidden-input"
                            />
                          </label>
                          <div className="upload-link">
                            <IconLink />
                            <input
                              type="text"
                              placeholder="Atau masukkan link URL (Google Drive, YouTube, dll)"
                              className="link-input"
                              onBlur={(e) => {
                                if (e.target.value && !uploading) {
                                  handleUpload(sub.id, cat, 'link', undefined, e.target.value);
                                  e.target.value = '';
                                }
                              }}
                              disabled={uploading}
                            />
                          </div>
                        </div>
                        {existingFiles.length > 0 && (
                          <div className="uploaded-files">
                            {existingFiles.map((f: any) => (
                              <div key={f.id} className="file-item">
                                {f.file_type === 'file' ? (
                                  <a href={f.file_url} target="_blank" rel="noopener noreferrer" className="file-link">
                                    <IconFile /> {f.file_name || 'File'}
                                  </a>
                                ) : (
                                  <a href={f.external_url} target="_blank" rel="noopener noreferrer" className="file-link">
                                    <IconLink /> Link eksternal
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {sub.status === 'draft' && (
                    <button
                      onClick={() => handleSubmit(sub.id)}
                      disabled={uploading}
                      className="submit-btn"
                    >
                      <IconCheck /> Kumpulkan Submission
                    </button>
                  )}
                  {sub.status === 'submitted' && (
                    <div className="submitted-note">
                      <IconCheck /> Submission telah dikumpulkan dan sedang direview panitia.
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>
          )}

          <div className="info-note fade-up" style={{ '--fd': '400ms' } as React.CSSProperties}>
            <div className="info-icon">ℹ️</div>
            <div className="info-text">
              <strong>Panduan:</strong> Upload file (PDF, ZIP, MP4, dll) maksimal 50MB per file. Untuk link, pastikan tautan dapat diakses publik.
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* ========== GLOBAL & SCOPED STYLES ========== */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        :root{
          --indigo:#4F46E5;--indigo-50:#EEF2FF;--indigo-100:#E0E7FF;--indigo-200:#C7D2FE;
          --sky:#0EA5E9;--emerald:#059669;--rose:#F43F5E;
          --ink:#0F172A;--ink-2:#334155;--ink-3:#64748B;--ink-4:#94A3B8;
          --white:#FFFFFF;--bg:#F8FAFF;--surface:#FFFFFF;--surface-2:#F1F5FF;
          --border:rgba(79,70,229,0.10);
          --sh-xs:0 1px 3px rgba(15,23,42,0.06),0 1px 2px rgba(15,23,42,0.04);
          --sh-sm:0 4px 16px rgba(79,70,229,0.08),0 1px 4px rgba(15,23,42,0.04);
          --sh-md:0 10px 36px rgba(79,70,229,0.12),0 2px 8px rgba(15,23,42,0.06);
          --sh-lg:0 24px 64px rgba(79,70,229,0.16),0 4px 16px rgba(15,23,42,0.08);
          --r-sm:12px;--r-md:18px;--r-lg:24px;--r-xl:32px;--r-2xl:40px;
          --ff-display:'Bricolage Grotesque',system-ui,sans-serif;
          --ff-body:'DM Sans',system-ui,sans-serif;
          --ease:cubic-bezier(0.22,1,0.36,1);
        }
        body{background:var(--bg);font-family:var(--ff-body);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden;line-height:1.6;}
        a{text-decoration:none;color:inherit;}
        @keyframes orbDrift{0%,100%{transform:translate(0,0) scale(1);}40%{transform:translate(24px,-18px) scale(1.05);}70%{transform:translate(-16px,12px) scale(0.97);}}
        @keyframes shimmer{0%{transform:translateX(-100%) skewX(-12deg);}100%{transform:translateX(200%) skewX(-12deg);}}
        @keyframes fadeUpIn{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spinRing{to{transform:rotate(360deg);}}
        @keyframes spinRingReverse{to{transform:rotate(-360deg);}}
        @keyframes dotBlink{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .fade-up{opacity:0;transform:translateY(28px);transition:opacity 0.6s var(--ease),transform 0.6s var(--ease);transition-delay:var(--fd,0ms);}
        .fade-up.in{opacity:1;transform:translateY(0);}
        .tilt-card{transform-style:preserve-3d;will-change:transform;transition:transform 0.5s var(--ease);}
      `}</style>

      <style jsx>{`
        .root {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        /* BACKGROUND */
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
          opacity: 0.025;
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
          background: radial-gradient(circle, rgba(79,70,229,0.09) 0%, transparent 65%);
          top: -200px; left: -180px;
        }
        .bg-orb-2 {
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 65%);
          bottom: -100px; right: -100px;
          animation-duration: 28s; animation-direction: reverse;
        }
        .bg-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(79,70,229,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(79,70,229,0.04) 1px, transparent 1px);
          background-size: 52px 52px;
          mask-image: radial-gradient(ellipse 70% 70% at 50% 30%, black 20%, transparent 80%);
        }

        
        /* MAIN */
        .main {
          position: relative;
          z-index: 1;
          padding: 2.5rem 2.5rem 5rem;
        }

        .dashboard-layout {
        display: flex;
        gap: 2rem;
        align-items: flex-start;
        }

        .wrap {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--indigo);
          transition: gap 0.2s;
        }
        .back-link:hover { gap: 0.7rem; color: var(--sky); }
        .page-header { margin-bottom: 0; }
        .page-eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--indigo);
        }
        .page-title {
          font-family: var(--ff-display);
          font-size: 2rem;
          font-weight: 800;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .page-desc {
          font-size: 0.92rem;
          color: var(--ink-3);
          max-width: 540px;
        }

        /* ALERTS */
        .global-alert { margin: 0; }
        .alert-success, .alert-error {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1.1rem;
          border-radius: var(--r-md);
          font-size: 0.85rem;
          border: 1px solid;
        }
        .alert-success {
          background: #ECFDF5;
          color: var(--emerald);
          border-color: rgba(5,150,105,0.2);
        }
        .alert-error {
          background: #FEF2F2;
          color: var(--rose);
          border-color: rgba(244,63,94,0.2);
        }

        /* EMPTY STATE */
        .empty-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: var(--sh-sm);
        }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-title {
          font-family: var(--ff-display);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 0.5rem;
        }
        .empty-desc { font-size: 0.88rem; color: var(--ink-3); }

        /* SUBMISSIONS GRID */
        .submissions-grid {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .submission-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: var(--r-xl);
          padding: 1.5rem;
          box-shadow: var(--sh-sm);
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .submission-card:hover {
          border-color: var(--indigo-200);
          box-shadow: var(--sh-md);
        }
        .card-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        .card-icon {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--indigo-50);
          color: var(--indigo);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .card-title {
          font-family: var(--ff-display);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--ink);
        }
        .card-subtitle {
          font-size: 0.75rem;
          color: var(--ink-3);
        }
        .status-badge {
          margin-left: auto;
          padding: 0.2rem 0.7rem;
          border-radius: 999px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .status-badge.draft {
          background: #FEF3C7;
          color: #D97706;
        }
        .status-badge.submitted {
          background: #D1FAE5;
          color: #059669;
        }

        /* UPLOAD SECTION */
        .upload-section {
          margin-top: 1rem;
          padding: 1rem;
          background: var(--surface-2);
          border-radius: var(--r-md);
          border: 1px solid var(--border);
        }
        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .upload-label {
          font-weight: 600;
          font-size: 0.85rem;
          color: var(--ink);
        }
        .upload-status.done {
          font-size: 0.7rem;
          color: var(--emerald);
          background: rgba(5,150,105,0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 999px;
        }
        .upload-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          align-items: center;
        }
        .upload-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--indigo);
          cursor: pointer;
          transition: all 0.2s;
        }
        .upload-btn:hover {
          background: var(--indigo-50);
          border-color: var(--indigo-200);
        }
        .upload-btn.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .hidden-input {
          display: none;
        }
        .upload-link {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 0.25rem 0.75rem;
        }
        .link-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 0.75rem;
          padding: 0.4rem 0;
          outline: none;
          color: var(--ink);
        }
        .link-input::placeholder {
          color: var(--ink-4);
        }
        .uploaded-files {
          margin-top: 0.75rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .file-item {
          background: var(--white);
          border-radius: 999px;
          padding: 0.2rem 0.7rem;
          font-size: 0.7rem;
          border: 1px solid var(--border);
        }
        .file-link {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          color: var(--indigo);
        }
        .file-link:hover {
          text-decoration: underline;
        }
        .submit-btn {
          margin-top: 1.25rem;
          width: 100%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          background: linear-gradient(135deg, var(--emerald), #047857);
          border: none;
          border-radius: 999px;
          padding: 0.75rem 1.5rem;
          font-weight: 700;
          font-size: 0.85rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s var(--ease);
          box-shadow: 0 4px 12px rgba(5,150,105,0.3);
        }
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(5,150,105,0.4);
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        .submitted-note {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #ECFDF5;
          border-radius: var(--r-md);
          color: var(--emerald);
          font-size: 0.8rem;
          font-weight: 500;
        }

        /* INFO NOTE */
        .info-note {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1.1rem;
          background: var(--surface-2);
          border: 1px solid var(--border);
          border-radius: var(--r-lg);
          font-size: 0.8rem;
          color: var(--ink-2);
        }
        .info-icon { color: var(--indigo); flex-shrink: 0; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .main { padding: 1.5rem 1rem 4rem; }
          .nav-inner { padding: 0 1rem; }
          .brand-sub, .pill-info { display: none; }
          .page-title { font-size: 1.5rem; }
          .upload-actions { flex-direction: column; align-items: stretch; }
          .upload-link { width: 100%; }
        }
      `}</style>
    </div>
  );
}