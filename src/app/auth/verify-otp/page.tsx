// app/auth/verify-otp/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
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

export default function VerifyOtpPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { verifyOtp, requestOtp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedUserId = sessionStorage.getItem('otp_user_id');
    const storedEmail = sessionStorage.getItem('otp_email');
    if (!storedUserId || !storedEmail) {
      router.push('/auth/register');
    } else {
      setUserId(parseInt(storedUserId));
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setError('');
    setLoading(true);
    try {
      await verifyOtp(userId, code);
      sessionStorage.removeItem('otp_user_id');
      sessionStorage.removeItem('otp_email');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kode OTP salah atau kadaluwarsa');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    setError('');
    try {
      await requestOtp(email);
      // Tampilkan notifikasi sukses (bisa menggunakan toast, di sini alert sederhana)
      alert('Kode OTP baru telah dikirim ke email Anda');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!userId) return null;

  return (
    <>
      <div className={`verify-root ${mounted ? 'mounted' : ''}`}>
        <CursorSpotlight />
        <div className="bg-layer">
          <ParticleCanvas />
          <FloatingBlobs />
          <div className="bg-grid" />
        </div>

        {/* LEFT PANEL - Informasi OTP */}
        <div className="left-panel">
          <div className="lp-content">
            <div className="lp-brand">
              <div className="brand-icon">H</div>
              <span className="brand-name">Hackathon Inovasi Digital 2026</span>
            </div>
            <h1 className="lp-headline">
              Verifikasi <br />
              <span className="lp-accent">Kode OTP</span>
            </h1>
            <p className="lp-sub">
              Kami telah mengirimkan kode 6 digit ke alamat email yang Anda daftarkan. Masukkan kode tersebut untuk mengaktifkan akun Anda.
            </p>

            {/* Informasi tambahan */}
            <div className="lp-info">
              <div className="info-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6" />
                  <polyline points="16 2 22 8 16 8" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>Kode berlaku 5 menit</span>
              </div>
              <div className="info-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>Pastikan email Anda aktif</span>
              </div>
            </div>

            {/* Progress step visual (mirip register) */}
            <div className="lp-progress">
              {['Daftar Akun','Verifikasi OTP','Lengkapi Profil','Mulai Berkompetisi'].map((s,i) => (
                <div key={s} className="prog-step">
                  <div className={`prog-dot ${i === 1 ? 'prog-active' : i < 1 ? 'prog-done' : ''}`}>
                    {i === 1 ? '2' : i+1}
                  </div>
                  {i < 3 && <div className="prog-line" />}
                  <span className="prog-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL - Form OTP */}
        <div className="right-panel">
          <div className="form-card">
            <div className="card-shine" />

            {/* Mobile brand */}
            <div className="form-mobile-brand">
              <div className="brand-icon" style={{width:34,height:34,fontSize:'0.85rem'}}>H</div>
              <span className="form-mobile-brand-name">Hackathon MPR RI</span>
            </div>

            {/* Header */}
            <div className="form-header">
              <div className="form-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4v16h16V4H4z" />
                  <polyline points="4 8 12 12 20 8" />
                </svg>
              </div>
              <h2 className="form-title">Verifikasi OTP</h2>
              <p className="form-sub">
                Masukkan kode 6 digit yang dikirim ke <strong>{email}</strong>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="error-alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="form-body">
              <div className="input-group">
                <label>Kode OTP</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0,6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="otp-input"
                />
                <div className="input-focus-line" />
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Memverifikasi...
                  </span>
                ) : (
                  <span className="btn-text">
                    Verifikasi & Lanjutkan
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
                <span className="btn-glow" />
              </button>
            </form>

            {/* Resend & Login links */}
            <div className="resend-row">
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="resend-link"
              >
                {resendLoading ? 'Mengirim...' : 'Kirim ulang kode OTP'}
              </button>
            </div>

            <div className="form-divider">
              <span className="divider-line" />
              <span className="divider-text">atau</span>
              <span className="divider-line" />
            </div>

            <div className="login-row">
              <Link href="/auth/login" className="login-link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Kembali ke Login
              </Link>
            </div>

            <div className="back-home-row">
              <Link href="/" className="back-home-link">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* GLOBAL & SCOPED STYLES - sama persis dengan login/register yang sudah disatukan */}
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
          .verify-root {
            min-height: 100vh; display: flex; position: relative; overflow: hidden;
          }

          /* BACKGROUND */
          .bg-layer {
            position: fixed; inset: 0; z-index: 0; pointer-events: none;
          }
          .bg-grid {
            position: absolute; inset: 0;
            background-image: linear-gradient(rgba(0,119,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,119,255,0.03) 1px, transparent 1px);
            background-size: 48px 48px;
          }

          /* BLOBS */
          .blob {
            position: absolute; border-radius: 50%; filter: blur(80px);
            pointer-events: none; z-index: 0;
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

          /* LEFT PANEL */
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
          .lp-info {
            display: flex; flex-direction: column; gap: 0.75rem;
            margin-bottom: 2.5rem;
          }
          .info-item {
            display: flex; align-items: center; gap: 0.65rem;
            font-size: 0.85rem; color: var(--t2);
          }
          .info-item svg { stroke: var(--c); opacity: 0.7; }

          /* Progress steps (mirip register) */
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
          .prog-dot.prog-done {
            background: var(--tl); color: white; border-color: transparent;
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

          /* HEADER */
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
          .form-sub {
            font-size: 0.82rem; color: var(--t3);
            word-break: break-all;
          }
          .form-sub strong { font-weight: 600; color: var(--t2); }

          /* ERROR */
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

          /* INPUT GROUP (sama dengan login/register) */
          .input-group { position: relative; margin-bottom: 0.5rem; }
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
            text-align: center; letter-spacing: 4px; font-size: 1.2rem;
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

          /* SUBMIT BUTTON */
          .submit-btn {
            width: 100%; border: none; cursor: pointer; padding: 0.9rem 1.5rem;
            background: linear-gradient(135deg, var(--c), var(--cy)); border-radius: 40px;
            font-family: 'Clash Display', sans-serif; font-size: 0.88rem; font-weight: 700; color: white;
            position: relative; overflow: hidden; transition: all 0.3s ease;
            box-shadow: 0 6px 18px rgba(0,119,255,0.3);
            margin-top: 0.5rem;
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

          /* RESEND LINK */
          .resend-row {
            text-align: center; margin-top: 1rem;
          }
          .resend-link {
            background: none; border: none;
            font-size: 0.8rem; color: var(--c); font-weight: 500;
            cursor: pointer; transition: all 0.2s;
            text-decoration: underline; text-underline-offset: 2px;
          }
          .resend-link:hover:not(:disabled) { color: var(--cy); }
          .resend-link:disabled { opacity: 0.5; cursor: not-allowed; }

          /* DIVIDER */
          .form-divider {
            display: flex; align-items: center; gap: 0.75rem; margin: 1.2rem 0 1rem;
          }
          .divider-line { flex: 1; height: 1px; background: rgba(0,0,0,0.08); }
          .divider-text { font-size: 0.75rem; color: var(--t3); white-space: nowrap; }

          /* LOGIN LINK */
          .login-row { display: flex; align-items: center; justify-content: center; }
          .login-link {
            display: inline-flex; align-items: center; gap: 0.45rem;
            padding: 0.65rem 1.5rem; border-radius: 100px;
            border: 1px solid rgba(0,119,255,0.25); color: var(--c);
            font-size: 0.85rem; font-weight: 600; text-decoration: none;
            transition: all 0.25s ease; font-family: 'Clash Display', sans-serif;
          }
          .login-link:hover { background: rgba(0,119,255,0.05); border-color: var(--c); color: var(--cy); }

          /* BACK HOME */
          .back-home-row { text-align: center; margin-top: 0.875rem; }
          .back-home-link {
            display: inline-flex; align-items: center; gap: 0.4rem;
            font-size: 0.75rem; color: var(--t3); text-decoration: none; transition: all 0.2s;
          }
          .back-home-link:hover { color: var(--c); gap: 0.55rem; }

          /* RESPONSIVE */
          @media (max-width: 640px) {
            .form-card { padding: 1.8rem; }
            .input-group input { padding: 0.8rem; font-size: 1rem; }
            .input-group input:focus ~ .input-focus-line {
              width: calc(100% - 1.6rem); left: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}