// app/auth/login/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchCsrfCookie } from '@/lib/axios';

/* ─────────────────── CURSOR SPOTLIGHT (dari kode kedua) ─────────────────── */
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

/* ─────────────────── PARTICLE CANVAS (dari kode kedua) ─────────────────── */
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

/* ─────────────────── FLOATING BLOBS (dari kode kedua) ─────────────────── */
function FloatingBlobs() {
  return (
    <>
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
    </>
  );
}

/* ─────────────────── MAIN PAGE ────────────────────────── */
export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError('Email dan password harus diisi.');
      setLoading(false);
      return;
    }

    try {
      await fetchCsrfCookie();
      await login(trimmedEmail, trimmedPassword);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Email atau password salah.';
      setError(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={`login-root ${mounted ? 'mounted' : ''}`}>
        <CursorSpotlight />
        <div className="bg-layer">
          <ParticleCanvas />
          <FloatingBlobs />
          <div className="bg-grid" />
        </div>

        {/* Left Panel - Brand & Hero */}
        <div className="left-panel">
          <div className="lp-content">
            <div className="lp-brand">
              <div className="lp-brand-icon">H</div>
              <span className="lp-brand-name">Hackathon MPR RI</span>
            </div>
            <h1 className="lp-headline">
              Selamat
              <br />
              Datang
              <br />
              <span className="lp-accent">Kembali.</span>
            </h1>
            <p className="lp-sub">
              Masuk ke dashboard-mu dan lanjutkan perjalanan inovasi bersama ratusan peserta
              terbaik Indonesia.
            </p>
            <div className="lp-stats">
              {[
                { num: '1.000+', label: 'Peserta' },
                { num: 'Rp 500jt', label: 'Hadiah' },
                { num: '4', label: 'Pilar' },
              ].map((s) => (
                <div key={s.label} className="lp-stat">
                  <strong>{s.num}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Form Card */}
        <div className="right-panel">
          <div className="form-card">
            <div className="card-shine" />

            <div className="form-mobile-brand">
              <div className="lp-brand-icon" style={{ width: 36, height: 36, fontSize: '0.9rem' }}>
                H
              </div>
              <span className="form-mobile-brand-name">Hackathon MPR RI</span>
            </div>

            <div className="form-header">
              <div className="form-icon-wrap">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <h2 className="form-title">Masuk ke Akun</h2>
              <p className="form-sub">Gunakan email dan password terdaftar kamu</p>
            </div>

            {error && (
              <div className="error-alert">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="form-body" noValidate>
              {/* Email Input (style dari kode kedua) */}
              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                />
                <div className="input-focus-line" />
              </div>

              {/* Password Input */}
              <div className="input-group">
                <label>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                />
                <div className="input-focus-line" />
              </div>

              <div className="forgot-row">
                <Link href="/auth/forgot-password" className="forgot-link">
                  Lupa password?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner" />
                    Memproses...
                  </span>
                ) : (
                  <span className="btn-text">
                    Masuk Sekarang
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </span>
                )}
                <span className="btn-glow" />
              </button>
            </form>

            <div className="form-divider">
              <span className="divider-line" />
              <span className="divider-text">atau</span>
              <span className="divider-line" />
            </div>

            <div className="register-row">
              <span>Belum punya akun?</span>
              <Link href="/auth/register" className="register-link">
                Daftar Sekarang
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </Link>
            </div>

            <div className="back-row">
              <Link href="/" className="back-link">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        </div>

        {/* Global & Scoped Styles */}
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
          /* ROOT & BACKGROUND */
          .login-root {
            min-height: 100vh;
            display: flex;
            position: relative;
            overflow: hidden;
          }
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
            pointer-events: none;
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
            width: 500px;
            height: 500px;
            background: radial-gradient(circle, rgba(0,119,255,0.12), transparent 70%);
            top: -200px;
            left: -150px;
            animation: floatBlob 16s ease-in-out infinite;
          }
          .b2 {
            width: 450px;
            height: 450px;
            background: radial-gradient(circle, rgba(0,212,255,0.1), transparent 70%);
            bottom: -150px;
            right: -120px;
            animation: floatBlob 18s ease-in-out infinite reverse;
          }
          .b3 {
            width: 320px;
            height: 320px;
            background: radial-gradient(circle, rgba(0,200,150,0.08), transparent 65%);
            top: 30%;
            left: 30%;
            animation: floatBlob 14s ease-in-out infinite 1s;
          }
          @keyframes floatBlob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(30px, -20px) scale(1.05); }
          }

          /* LEFT PANEL (tema terang) */
          .left-panel {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 3rem 2rem 3rem 3rem;
            position: relative;
            z-index: 1;
            opacity: 0;
            transform: translateX(-30px);
            animation: panelIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards;
          }
          @media (max-width: 900px) {
            .left-panel { display: none; }
          }
          .lp-content { max-width: 420px; }
          .lp-brand {
            display: inline-flex;
            align-items: center;
            gap: 0.65rem;
            margin-bottom: 2.5rem;
          }
          .lp-brand-icon {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            background: linear-gradient(135deg, var(--c), var(--cy));
            color: white;
            font-family: 'Clash Display', sans-serif;
            font-weight: 800;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 119, 255, 0.3);
          }
          .lp-brand-name {
            font-family: 'Clash Display', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            color: var(--t1);
          }
          .lp-headline {
            font-family: 'Clash Display', sans-serif;
            font-size: clamp(2.8rem, 4vw, 3.8rem);
            font-weight: 800;
            line-height: 1.05;
            color: var(--t1);
            letter-spacing: -0.04em;
            margin-bottom: 1.25rem;
          }
          .lp-accent { color: var(--c); display: block; }
          .lp-sub {
            font-size: 0.95rem;
            color: var(--t3);
            line-height: 1.7;
            max-width: 340px;
            margin-bottom: 2.5rem;
          }
          .lp-stats {
            display: flex;
            gap: 2rem;
            margin-bottom: 3rem;
          }
          .lp-stat {
            display: flex;
            flex-direction: column;
            gap: 0.2rem;
          }
          .lp-stat strong {
            font-family: 'Clash Display', sans-serif;
            font-size: 1.4rem;
            font-weight: 800;
            color: var(--t1);
            letter-spacing: -0.03em;
          }
          .lp-stat span {
            font-size: 0.78rem;
            color: var(--t3);
            font-weight: 500;
          }

          /* RIGHT PANEL & FORM CARD */
          .right-panel {
            width: min(480px, 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem 1.5rem;
            position: relative;
            z-index: 1;
            opacity: 0;
            transform: translateX(30px);
            animation: panelIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
          }
          @media (max-width: 900px) {
            .right-panel { width: 100%; padding: 1.5rem 1rem; }
          }
          @keyframes panelIn {
            to { opacity: 1; transform: translateX(0); }
          }
          .form-card {
            width: 100%;
            max-width: 420px;
            background: var(--bg-glass);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 119, 255, 0.15);
            border-radius: 28px;
            padding: 2.5rem 2.25rem 2rem;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0, 119, 255, 0.12), 0 0 0 1px rgba(0, 119, 255, 0.08);
            transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
            animation: cardPop 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
          }
          .form-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 28px 60px rgba(0, 119, 255, 0.18);
            border-color: rgba(0, 119, 255, 0.3);
          }
          @keyframes cardPop {
            from { opacity: 0; transform: scale(0.96) translateY(12px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .card-shine {
            position: absolute;
            top: 0;
            left: -100%;
            width: 60%;
            height: 100%;
            background: linear-gradient(90deg, transparent 0%, rgba(0, 119, 255, 0.04) 40%, rgba(0, 212, 255, 0.08) 50%, rgba(0, 119, 255, 0.04) 60%, transparent 100%);
            transform: skewX(-20deg);
            pointer-events: none;
            animation: cardShine 6s ease-in-out infinite 1s;
          }
          @keyframes cardShine {
            0% { left: -100%; }
            20% { left: 120%; }
            100% { left: 120%; }
          }
          .form-mobile-brand {
            display: none;
            align-items: center;
            gap: 0.6rem;
            justify-content: center;
            margin-bottom: 1.75rem;
          }
          .form-mobile-brand-name {
            font-family: 'Clash Display', sans-serif;
            font-weight: 700;
            font-size: 0.95rem;
            color: var(--t1);
          }
          @media (max-width: 900px) {
            .form-mobile-brand { display: flex; }
          }
          .form-header {
            text-align: center;
            margin-bottom: 1.75rem;
          }
          .form-icon-wrap {
            width: 52px;
            height: 52px;
            border-radius: 16px;
            margin: 0 auto 1rem;
            background: linear-gradient(135deg, rgba(0, 119, 255, 0.1), rgba(0, 212, 255, 0.1));
            border: 1px solid rgba(0, 119, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--c);
          }
          .form-title {
            font-family: 'Clash Display', sans-serif;
            font-size: 1.55rem;
            font-weight: 800;
            color: var(--t1);
            letter-spacing: -0.03em;
            margin-bottom: 0.4rem;
          }
          .form-sub {
            font-size: 0.85rem;
            color: var(--t3);
            line-height: 1.5;
          }

          /* ERROR ALERT (gaya kode kedua) */
          .error-alert {
            background: rgba(239, 68, 68, 0.12);
            border-left: 3px solid #ef4444;
            border-radius: 16px;
            padding: 0.8rem 1rem;
            font-size: 0.8rem;
            color: #b91c1c;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: shakeIn 0.4s cubic-bezier(0.22, 1, 0.36, 1);
          }
          @keyframes shakeIn {
            0% { transform: translateX(-6px); opacity: 0; }
            40% { transform: translateX(4px); }
            70% { transform: translateX(-2px); }
            100% { transform: translateX(0); opacity: 1; }
          }

          /* INPUT GROUP (style dari kode kedua) */
          .input-group {
            position: relative;
            margin-bottom: 0.25rem;
          }
          .input-group label {
            display: block;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--t2);
            margin-bottom: 0.4rem;
            transition: color 0.2s;
          }
          .input-group input {
            width: 100%;
            background: rgba(255, 255, 255, 0.9);
            border: 1.5px solid rgba(0, 119, 255, 0.2);
            border-radius: 20px;
            padding: 0.9rem 1rem;
            font-size: 0.9rem;
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: var(--t1);
            transition: all 0.25s ease;
            outline: none;
          }
          .input-group input:focus {
            border-color: var(--c);
            box-shadow: 0 0 0 3px rgba(0, 119, 255, 0.15);
          }
          .input-focus-line {
            position: absolute;
            bottom: 0;
            left: 50%;
            width: 0;
            height: 2.5px;
            background: linear-gradient(90deg, var(--c), var(--cy), var(--tl));
            border-radius: 4px;
            transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1), left 0.35s cubic-bezier(0.22, 1, 0.36, 1);
            pointer-events: none;
          }
          .input-group input:focus ~ .input-focus-line {
            width: calc(100% - 2rem);
            left: 1rem;
          }

          .forgot-row {
            display: flex;
            justify-content: flex-end;
            margin-top: 0.2rem;
          }
          .forgot-link {
            font-size: 0.8rem;
            color: var(--c);
            text-decoration: none;
            font-weight: 500;
            transition: color 0.2s;
          }
          .forgot-link:hover {
            color: var(--cy);
            text-decoration: underline;
          }

          /* SUBMIT BUTTON (gaya kode kedua) */
          .submit-btn {
            width: 100%;
            border: none;
            cursor: pointer;
            padding: 0.9rem 1.5rem;
            background: linear-gradient(135deg, var(--c), var(--cy));
            border-radius: 40px;
            font-family: 'Clash Display', sans-serif;
            font-size: 0.9rem;
            font-weight: 800;
            color: white;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 6px 18px rgba(0, 119, 255, 0.3);
            margin-top: 0.4rem;
          }
          .submit-btn:hover:not(:disabled) {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px rgba(0, 119, 255, 0.4);
          }
          .submit-btn:active:not(:disabled) { transform: translateY(0px); }
          .submit-btn:disabled {
            opacity: 0.65;
            cursor: not-allowed;
          }
          .btn-text, .btn-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            position: relative;
            z-index: 1;
          }
          .btn-text svg { transition: transform 0.3s; }
          .submit-btn:hover .btn-text svg { transform: translateX(4px); }
          .btn-glow {
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent);
            opacity: 0;
            transition: opacity 0.3s;
          }
          .submit-btn:hover .btn-glow { opacity: 1; }
          .spinner {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top-color: white;
            animation: spin 0.6s linear infinite;
            display: inline-block;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* DIVIDER & LINKS */
          .form-divider {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin: 1.5rem 0 1.1rem;
          }
          .divider-line {
            flex: 1;
            height: 1px;
            background: rgba(0, 0, 0, 0.08);
          }
          .divider-text {
            font-size: 0.78rem;
            color: var(--t3);
            white-space: nowrap;
          }
          .register-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-size: 0.85rem;
            color: var(--t3);
          }
          .register-link {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            color: var(--c);
            font-weight: 700;
            text-decoration: none;
            transition: all 0.2s;
          }
          .register-link:hover {
            color: var(--cy);
            gap: 0.5rem;
          }
          .back-row {
            text-align: center;
            margin-top: 1rem;
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-size: 0.78rem;
            color: var(--t3);
            text-decoration: none;
            transition: all 0.2s;
          }
          .back-link:hover {
            color: var(--c);
            gap: 0.55rem;
          }

          /* RESPONSIVE */
          @media (max-width: 640px) {
            .form-card { padding: 1.8rem; }
            .form-title { font-size: 1.4rem; }
            .input-group input { padding: 0.8rem; }
            .input-group input:focus ~ .input-focus-line {
              width: calc(100% - 1.6rem);
              left: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
}