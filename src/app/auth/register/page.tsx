// app/auth/register/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/* ── CURSOR SPOTLIGHT (dari kode kedua) ── */
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

/* ── PARTICLE CANVAS (dari kode kedua) ── */
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
    for (let i = 0; i < 35; i++) pts.push({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
      r: Math.random() * 2 + 0.5, a: Math.random() * 0.3 + 0.05,
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
        if (d < 100) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(0,150,255,${0.06 * (1 - d / 100)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />;
}

/* ── FLOATING BLOBS (dari kode kedua) ── */
function FloatingBlobs() {
  return (
    <>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </>
  );
}

/* ── PASSWORD STRENGTH (dari kode pertama, diadaptasi stylenya) ── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Min. 8 karakter', ok: password.length >= 8 },
    { label: 'Huruf kapital',   ok: /[A-Z]/.test(password) },
    { label: 'Angka',           ok: /[0-9]/.test(password) },
    { label: 'Simbol',          ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score  = checks.filter(c => c.ok).length;
  const colors = ['#ef4444','#f97316','#eab308','#10b981'];
  const labels = ['Lemah','Sedang','Kuat','Sangat Kuat'];

  if (!password) return null;
  return (
    <div className="pw-strength">
      <div className="pw-bars">
        {[0,1,2,3].map(i => (
          <div key={i} className="pw-bar" style={{
            background: i < score ? colors[score-1] : 'rgba(0,0,0,0.08)',
            transition: 'background 0.35s ease',
          }} />
        ))}
      </div>
      <span className="pw-label" style={{ color: score > 0 ? colors[score-1] : 'transparent' }}>
        {labels[score-1] ?? ''}
      </span>
      <div className="pw-checks">
        {checks.map(c => (
          <div key={c.label} className={`pw-check ${c.ok ? 'ok' : ''}`}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              {c.ok
                ? <polyline points="20 6 9 17 4 12"/>
                : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
            </svg>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── STEP INDICATOR (dari kode pertama) ── */
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div className="step-dots">
      {Array.from({length: total}).map((_,i) => (
        <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />
      ))}
    </div>
  );
}

/* ── MAIN PAGE ── */
export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState(0);   // 0 = identitas, 1 = password
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  // Step 0 → 1: validasi identitas
  const goToStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Nama lengkap wajib diisi.');
    if (!email.includes('@')) return setError('Format email tidak valid.');
    setStep(1);
  };

  // Step 1: submit register
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) return setError('Password minimal 6 karakter.');
    if (password !== confirm) return setError('Konfirmasi password tidak cocok.');
    setLoading(true);
    try {
      const response = await register(name, email, password, confirm);
      sessionStorage.setItem('otp_user_id', response.userId.toString());
      sessionStorage.setItem('otp_email', email);
      router.push('/auth/verify-otp');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registrasi gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <>
      <div className={`reg-root ${mounted ? 'mounted' : ''}`}>
        <CursorSpotlight />
        <div className="bg-layer">
          <ParticleCanvas />
          <FloatingBlobs />
          <div className="bg-grid" />
        </div>

        {/* ── LEFT PANEL (dari kode pertama, dengan konten yang diinginkan) ── */}
        <div className="left-panel">
          <div className="lp-content">
            <div className="lp-brand">
              <div className="brand-icon">H</div>
              <span className="brand-name">Hackathon Inovasi Digital 2026</span>
            </div>

            <h1 className="lp-headline">
              Registrasi <br /> Peserta <br />
              <span className="lp-accent">Hackathon</span>
            </h1>
            <p className="lp-sub">
              Daftarkan tim-mu, ikuti bootcamp intensif, dan buktikan inovasimu di Hackathon Inovasi Digital Empat Pilar MPR RI 2026.
            </p>

            {/* Benefits */}
            <div className="lp-benefits">
              {[
                { icon: '🎓', title: 'Bootcamp Gratis',   desc: 'Pelatihan intensif teknis & non-teknis' },
                { icon: '💰', title: 'Hadiah Jutaan Rupiah',   desc: 'Total prize pool jutaan rupiah' },
                { icon: '🤝', title: 'Networking Luas',   desc: 'Kolaborasi dengan ratusan peserta terbaik' },
                { icon: '🏛️', title: 'Sertifikat Resmi', desc: 'Diakui oleh MPR RI & mitra institusi' },
              ].map(b => (
                <div key={b.title} className="benefit-item">
                  <div className="benefit-icon">{b.icon}</div>
                  <div>
                    <div className="benefit-title">{b.title}</div>
                    <div className="benefit-desc">{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress visual */}
            <div className="lp-progress">
              {['Daftar Akun','Verifikasi OTP','Lengkapi Profil','Mulai Berkompetisi'].map((s,i) => (
                <div key={s} className="prog-step">
                  <div className={`prog-dot ${i === 0 ? 'prog-active' : ''}`}>
                    {i === 0 ? '1' : i+1}
                  </div>
                  {i < 3 && <div className="prog-line" />}
                  <span className="prog-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL (form card dengan step) ── */}
        <div className="right-panel">
          <div className="form-card">
            <div className="card-shine" />

            {/* Mobile brand */}
            <div className="form-mobile-brand">
              <div className="brand-icon" style={{width:34,height:34,fontSize:'0.85rem'}}>H</div>
              <span className="form-mobile-brand-name">Hackathon MPR RI</span>
            </div>

            {/* Step dots */}
            <StepDots step={step} total={2} />

            {/* Header */}
            <div className="form-header">
              <div className="form-icon-wrap">
                {step === 0
                  ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
              </div>
              <h2 className="form-title">
                {step === 0 ? 'Buat Akun Baru' : 'Buat Password'}
              </h2>
              <p className="form-sub">
                {step === 0
                  ? 'Langkah 1 dari 2 — Isi data dirimu'
                  : 'Langkah 2 dari 2 — Amankan akunmu'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="error-alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* ── STEP 0: Identitas ── */}
            {step === 0 && (
              <form onSubmit={goToStep1} className="form-body" noValidate>
                <div className="input-group">
                  <label>Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama sesuai KTP"
                    required
                  />
                  <div className="input-focus-line" />
                </div>

                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                  <div className="input-focus-line" />
                </div>

                <button type="submit" className="submit-btn">
                  <span className="btn-text">
                    Lanjutkan
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </span>
                  <span className="btn-glow" />
                </button>
              </form>
            )}

            {/* ── STEP 1: Password ── */}
            {step === 1 && (
              <form onSubmit={handleSubmit} className="form-body" noValidate>
                {/* Recap identity */}
                <div className="identity-recap">
                  <div className="ir-avatar">{name.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="ir-name">{name}</div>
                    <div className="ir-email">{email}</div>
                  </div>
                  <button type="button" className="ir-edit" onClick={() => { setStep(0); setError(''); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Ubah
                  </button>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    required
                  />
                  <div className="input-focus-line" />
                </div>
                <PasswordStrength password={password} />

                <div className="input-group">
                  <label>Konfirmasi Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Ketik ulang password"
                    required
                  />
                  <div className="input-focus-line" />
                </div>

                {/* Password match indicator */}
                {confirm.length > 0 && (
                  <div className={`match-indicator ${password === confirm ? 'match-ok' : 'match-fail'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      {password === confirm
                        ? <polyline points="20 6 9 17 4 12"/>
                        : <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>}
                    </svg>
                    {password === confirm ? 'Password cocok' : 'Password tidak cocok'}
                  </div>
                )}

                {/* Terms */}
                <p className="terms-text">
                  Dengan mendaftar, kamu menyetujui{' '}
                  <Link href="/terms" className="terms-link">Syarat & Ketentuan</Link>
                  {' '}dan{' '}
                  <Link href="/privacy" className="terms-link">Kebijakan Privasi</Link> kami.
                </p>

                <div className="btn-group">
                  <button type="button" className="back-btn" onClick={() => { setStep(0); setError(''); }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                    </svg>
                  </button>
                  <button type="submit" disabled={loading} className="submit-btn" style={{flex:1}}>
                    {loading ? (
                      <span className="btn-loading"><span className="spinner" />Mendaftar...</span>
                    ) : (
                      <span className="btn-text">
                        Buat Akun
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </span>
                    )}
                    <span className="btn-glow" />
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="form-divider">
              <span className="divider-line" /><span className="divider-text">sudah punya akun?</span><span className="divider-line" />
            </div>

            {/* Login link */}
            <div className="login-row">
              <Link href="/auth/login" className="login-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Masuk ke Akun
              </Link>
            </div>

            {/* Back to home */}
            <div className="back-home-row">
              <Link href="/" className="back-home-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* ── GLOBAL & SCOPED STYLES (gabungan: tema dari kode kedua, layout dari kode pertama) ── */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Clash+Display:wght@400;500;600;700&display=swap');
          :root {
            --c: #0077ff;
            --cy: #00d4ff;
            --tl: #00c896;
            --t1: #0a1628;
            --t2: #1e3a5f;
            --t3: #4a6fa5;
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
          /* ROOT */
          .reg-root {
            min-height: 100vh; display: flex; position: relative; overflow: hidden;
          }

          /* BACKGROUND LAYER */
          .bg-layer {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
          }
          .bg-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(rgba(0,119,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,119,255,0.03) 1px, transparent 1px);
            background-size: 48px 48px;
          }

          /* BLOBS (dari kode kedua) */
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

          /* LEFT PANEL (tema terang dari kode kedua) */
          .left-panel {
            flex: 1; display: flex; align-items: center; justify-content: center;
            padding: 3rem 2rem 3rem 3.5rem; position: relative; z-index: 1;
            opacity: 0; transform: translateX(-30px);
            animation: panelIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
          }
          @media (max-width: 960px) { .left-panel { display: none; } }
          @keyframes panelIn { to { opacity: 1; transform: translateX(0); } }

          .lp-content { max-width: 400px; }
          .lp-brand { display: inline-flex; align-items: center; gap: 0.65rem; margin-bottom: 2.25rem; }
          .brand-icon {
            width: 40px; height: 40px; border-radius: 10px;
            background: linear-gradient(135deg, var(--c), var(--cy)); color: white;
            font-family: 'Clash Display', sans-serif; font-weight: 800; font-size: 1rem;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 16px rgba(0,119,255,0.3);
          }
          .brand-name {
            font-family: 'Clash Display', sans-serif; font-weight: 700; font-size: 0.95rem;
            color: var(--t1);
          }
          .lp-headline {
            font-family: 'Clash Display', sans-serif; font-size: clamp(2.5rem, 3.5vw, 3.5rem);
            font-weight: 800; line-height: 1.05; color: var(--t1); letter-spacing: -0.04em;
            margin-bottom: 1.1rem;
          }
          .lp-accent { color: var(--c); }
          .lp-sub {
            font-size: 0.9rem; color: var(--t3); line-height: 1.7;
            max-width: 340px; margin-bottom: 2rem;
          }

          /* Benefits */
          .lp-benefits { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2.25rem; }
          .benefit-item { display: flex; align-items: flex-start; gap: 0.875rem; }
          .benefit-icon {
            width: 36px; height: 36px; min-width: 36px;
            background: rgba(0,119,255,0.08); border: 1px solid rgba(0,119,255,0.15);
            border-radius: 10px; display: flex; align-items: center; justify-content: center;
            font-size: 1rem;
          }
          .benefit-title {
            font-family: 'Clash Display', sans-serif; font-size: 0.85rem; font-weight: 600;
            color: var(--t1); margin-bottom: 0.15rem;
          }
          .benefit-desc { font-size: 0.75rem; color: var(--t3); line-height: 1.4; }

          /* Progress visual */
          .lp-progress { display: flex; align-items: flex-start; gap: 0; margin-top: 0.5rem; }
          .prog-step { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex: 1; position: relative; }
          .prog-dot {
            width: 28px; height: 28px; border-radius: 50%;
            background: rgba(0,119,255,0.1); border: 1px solid rgba(0,119,255,0.2);
            display: flex; align-items: center; justify-content: center;
            font-family: 'Clash Display', sans-serif; font-size: 0.7rem; font-weight: 700;
            color: var(--t3);
          }
          .prog-dot.prog-active {
            background: linear-gradient(135deg, var(--c), var(--cy)); color: white;
            border-color: transparent; box-shadow: 0 0 12px rgba(0,119,255,0.5);
          }
          .prog-line {
            position: absolute; top: 14px; left: calc(50% + 14px); right: calc(-50% + 14px);
            height: 1px; background: rgba(0,119,255,0.15);
          }
          .prog-label { font-size: 0.65rem; color: var(--t3); text-align: center; line-height: 1.3; }

          /* RIGHT PANEL */
          .right-panel {
            width: min(500px, 100%); display: flex; align-items: center; justify-content: center;
            padding: 2rem 1.5rem; position: relative; z-index: 1;
            opacity: 0; transform: translateX(30px);
            animation: panelIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
          }
          @media (max-width: 960px) { .right-panel { width: 100%; } }

          /* FORM CARD */
          .form-card {
            width: 100%; max-width: 430px;
            background: var(--bg-glass); backdrop-filter: blur(12px);
            border: 1px solid rgba(0,119,255,0.15); border-radius: 28px;
            padding: 2.25rem 2.25rem 1.75rem;
            position: relative; overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,119,255,0.12), 0 0 0 1px rgba(0,119,255,0.08);
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            animation: cardPop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
          }
          .form-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 28px 60px rgba(0,119,255,0.18);
            border-color: rgba(0,119,255,0.3);
          }
          @keyframes cardPop {
            from { opacity: 0; transform: scale(0.96) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .card-shine {
            position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(0,119,255,0.04) 40%, rgba(0,212,255,0.08) 50%, rgba(0,119,255,0.04) 60%, transparent 100%);
            transform: skewX(-20deg); pointer-events: none;
            animation: cardShine 7s ease-in-out infinite 1.5s;
          }
          @keyframes cardShine { 0% { left: -100%; } 18% { left: 120%; } 100% { left: 120%; } }

          .form-mobile-brand {
            display: none; align-items: center; gap: 0.6rem; justify-content: center; margin-bottom: 1.5rem;
          }
          .form-mobile-brand-name {
            font-family: 'Clash Display', sans-serif; font-weight: 700; font-size: 0.9rem;
            color: var(--t1);
          }
          @media (max-width: 960px) { .form-mobile-brand { display: flex; } }

          /* Step dots */
          .step-dots {
            display: flex; gap: 6px; align-items: center; justify-content: center; margin-bottom: 1.5rem;
          }
          .step-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(0,119,255,0.2); transition: all 0.3s ease;
          }
          .step-dot.active {
            background: var(--c); width: 24px; border-radius: 4px;
            box-shadow: 0 0 8px rgba(0,119,255,0.6);
          }
          .step-dot.done { background: var(--tl); }

          /* Header */
          .form-header { text-align: center; margin-bottom: 1.5rem; }
          .form-icon-wrap {
            width: 52px; height: 52px; border-radius: 16px; margin: 0 auto 0.875rem;
            background: linear-gradient(135deg, rgba(0,119,255,0.1), rgba(0,212,255,0.1));
            border: 1px solid rgba(0,119,255,0.2);
            display: flex; align-items: center; justify-content: center; color: var(--c);
          }
          .form-title {
            font-family: 'Clash Display', sans-serif; font-size: 1.45rem; font-weight: 800;
            color: var(--t1); letter-spacing: -0.03em; margin-bottom: 0.35rem;
          }
          .form-sub { font-size: 0.82rem; color: var(--t3); }

          /* Error alert */
          .error-alert {
            display: flex; align-items: center; gap: 0.55rem;
            background: rgba(239,68,68,0.12); border-left: 3px solid #ef4444;
            border-radius: 16px; padding: 0.7rem 1rem;
            font-size: 0.83rem; color: #b91c1c; margin-bottom: 1.1rem;
            animation: shakeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes shakeIn {
            0% { transform: translateX(-6px); opacity: 0; }
            40% { transform: translateX(4px); }
            70% { transform: translateX(-2px); }
            100% { transform: translateX(0); opacity: 1; }
          }

          /* Form body */
          .form-body { display: flex; flex-direction: column; gap: 1rem; }

          /* Input group (style dari kode kedua) */
          .input-group { position: relative; }
          .input-group label {
            display: block; font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.05em; color: var(--t2); margin-bottom: 0.4rem;
            transition: color 0.2s;
          }
          .input-group input {
            width: 100%; background: rgba(255,255,255,0.9);
            border: 1.5px solid rgba(0,119,255,0.2); border-radius: 20px;
            padding: 0.9rem 1rem; font-size: 0.9rem;
            font-family: 'Plus Jakarta Sans', sans-serif; color: var(--t1);
            transition: all 0.25s ease; outline: none;
          }
          .input-group input:focus {
            border-color: var(--c);
            box-shadow: 0 0 0 3px rgba(0,119,255,0.15);
          }
          .input-focus-line {
            position: absolute; bottom: 0; left: 50%; width: 0; height: 2.5px;
            background: linear-gradient(90deg, var(--c), var(--cy), var(--tl));
            border-radius: 4px; transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), left 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            pointer-events: none;
          }
          .input-group input:focus ~ .input-focus-line {
            width: calc(100% - 2rem); left: 1rem;
          }

          /* Identity recap */
          .identity-recap {
            display: flex; align-items: center; gap: 0.75rem;
            background: rgba(0,119,255,0.05); border: 1px solid rgba(0,119,255,0.12);
            border-radius: 16px; padding: 0.75rem 1rem; margin-bottom: 0.25rem;
          }
          .ir-avatar {
            width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
            background: linear-gradient(135deg, var(--c), var(--cy)); color: white;
            font-family: 'Clash Display', sans-serif; font-weight: 700; font-size: 0.9rem;
            display: flex; align-items: center; justify-content: center;
          }
          .ir-name { font-size: 0.85rem; font-weight: 600; color: var(--t1); }
          .ir-email { font-size: 0.75rem; color: var(--t3); }
          .ir-edit {
            margin-left: auto; background: none; border: 1px solid rgba(0,119,255,0.2);
            border-radius: 8px; padding: 0.3rem 0.65rem; cursor: pointer;
            display: flex; align-items: center; gap: 0.35rem;
            font-size: 0.72rem; color: var(--t3); font-family: inherit;
            transition: all 0.2s;
          }
          .ir-edit:hover { border-color: var(--c); color: var(--c); }

          /* Password strength */
          .pw-strength { margin-top: 0.3rem; display: flex; flex-direction: column; gap: 0.45rem; }
          .pw-bars { display: flex; gap: 4px; }
          .pw-bar { flex: 1; height: 3px; border-radius: 3px; background: rgba(0,0,0,0.08); }
          .pw-label { font-size: 0.72rem; font-weight: 600; transition: color 0.3s; }
          .pw-checks { display: flex; flex-wrap: wrap; gap: 0.4rem 0.8rem; margin-top: 0.2rem; }
          .pw-check {
            display: flex; align-items: center; gap: 0.3rem;
            font-size: 0.72rem; color: var(--t3); transition: color 0.25s;
          }
          .pw-check.ok { color: #10b981; }
          .pw-check svg { flex-shrink: 0; }

          /* Match indicator */
          .match-indicator {
            display: flex; align-items: center; gap: 0.4rem;
            font-size: 0.75rem; font-weight: 500; padding-left: 0.2rem;
          }
          .match-ok { color: #10b981; }
          .match-fail { color: #ef4444; }

          /* Terms */
          .terms-text {
            font-size: 0.75rem; color: var(--t3); line-height: 1.5; text-align: center;
          }
          .terms-link {
            color: var(--c); text-decoration: none; transition: color 0.2s;
          }
          .terms-link:hover { color: var(--cy); text-decoration: underline; }

          /* Button group */
          .btn-group { display: flex; gap: 0.65rem; align-items: stretch; }
          .back-btn {
            width: 46px; min-width: 46px; border-radius: 40px;
            background: rgba(0,119,255,0.08); border: 1px solid rgba(0,119,255,0.2);
            display: flex; align-items: center; justify-content: center;
            color: var(--t3); cursor: pointer; transition: all 0.2s;
          }
          .back-btn:hover { background: rgba(0,119,255,0.15); color: var(--c); border-color: var(--c); }

          /* Submit button (dari kode kedua) */
          .submit-btn {
            width: 100%; border: none; cursor: pointer; padding: 0.9rem 1.5rem;
            background: linear-gradient(135deg, var(--c), var(--cy)); border-radius: 40px;
            font-family: 'Clash Display', sans-serif; font-size: 0.88rem; font-weight: 700; color: white;
            position: relative; overflow: hidden; transition: all 0.3s ease;
            box-shadow: 0 6px 18px rgba(0,119,255,0.3);
          }
          .submit-btn:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 12px 28px rgba(0,119,255,0.4); }
          .submit-btn:active:not(:disabled) { transform: translateY(0); }
          .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
          .btn-text, .btn-loading {
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            position: relative; z-index: 1;
          }
          .btn-text svg { transition: transform 0.3s; }
          .submit-btn:hover .btn-text svg { transform: translateX(4px); }
          .btn-glow {
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
            opacity: 0; transition: opacity 0.3s;
          }
          .submit-btn:hover .btn-glow { opacity: 1; }
          .spinner {
            width: 16px; height: 16px; border-radius: 50%;
            border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
            animation: spin 0.6s linear infinite; display: inline-block;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* Divider */
          .form-divider {
            display: flex; align-items: center; gap: 0.75rem; margin: 1.4rem 0 1rem;
          }
          .divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
          .divider-text { font-size: 0.75rem; color: var(--t3); white-space: nowrap; }

          /* Login link */
          .login-row { display: flex; align-items: center; justify-content: center; }
          .login-link {
            display: inline-flex; align-items: center; gap: 0.45rem;
            padding: 0.65rem 1.5rem; border-radius: 100px;
            border: 1px solid rgba(0,119,255,0.25); color: var(--c);
            font-size: 0.85rem; font-weight: 600; text-decoration: none;
            transition: all 0.25s ease; font-family: 'Clash Display', sans-serif;
          }
          .login-link:hover { background: rgba(0,119,255,0.05); border-color: var(--c); color: var(--cy); }

          /* Back home */
          .back-home-row { text-align: center; margin-top: 0.875rem; }
          .back-home-link {
            display: inline-flex; align-items: center; gap: 0.4rem;
            font-size: 0.75rem; color: var(--t3); text-decoration: none; transition: all 0.2s;
          }
          .back-home-link:hover { color: var(--c); gap: 0.55rem; }

          /* Responsive */
          @media (max-width: 640px) {
            .form-card { padding: 1.8rem; }
            .input-group input { padding: 0.8rem; }
            .input-group input:focus ~ .input-focus-line {
              width: calc(100% - 1.6rem); left: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}