// components/peserta/SidebarActions.tsx
'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

/* ═══════════════════════════════════════════════════════
   ANIMATED COUNTER (tidak digunakan di sidebar, tapi biarkan saja jika diperlukan)
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
   ACTION CARD (horizontal layout: icon dan label berdampingan)
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
    <Link href={href} className="ac-link fade-up" style={{ '--fd': `${delay}ms` } as React.CSSProperties}>
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

/* ═══════════════════════════════════════════════════════
   SIDEBAR COMPONENT (reusable, dengan layout horizontal)
═══════════════════════════════════════════════════════ */
export default function SidebarActions() {
  return (
    <aside className="sidebar">
      <div className="ac-container">
        <ActionCard
          href="/peserta/status"
          icon={<IconStatus />}
          label="Status Tim"
          colorVar="var(--indigo)"
          delay={100}
        />
      </div>
      <div className="ac-container">
        <ActionCard
          href="/peserta/profile"
          icon={<IconTeam />}
          label="Profil Tim"
          colorVar="var(--sky)"
          delay={180}
        />
      </div>
      <div className="ac-container">
        <ActionCard
          href="/peserta/submissions"
          icon={<IconCode />}
          label="Hackathon"
          colorVar="var(--emerald)"
          delay={260}
        />
      </div>

      {/* ========== GLOBAL STYLES (animasi fade-up + glassmorphism) ========== */}
      <style jsx global>{`
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
          0%   { transform: translateX(-110%) skewX(-18deg); }
          100% { transform: translateX(210%) skewX(-18deg); }
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
        @keyframes glassReveal {
          0%   { opacity: 0; transform: translateY(20px) scale(0.96); filter: blur(4px); }
          60%  { opacity: 1; transform: translateY(-3px) scale(1.01); filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .fade-up {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          filter: blur(3px);
          transition:
            opacity  0.55s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
            filter   0.45s cubic-bezier(0.22, 1, 0.36, 1);
          transition-delay: var(--fd, 0ms);
        }
        .fade-up.in {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }
      `}</style>

      {/* ========== SCOPED STYLES (sidebar dan action card dengan layout horizontal + glassmorphism) ========== */}
      <style jsx>{`
        .sidebar {
          flex: 0 0 320px;
          position: sticky;
          top: 90px;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        /* ── Glass container ── */
        .ac-container {
          position: relative;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.62);
          backdrop-filter: blur(18px) saturate(1.6);
          -webkit-backdrop-filter: blur(18px) saturate(1.6);
          border: 1px solid rgba(255, 255, 255, 0.75);
          border-radius: 20px;
          padding: 0.9rem 1.2rem;
          box-shadow:
            0 2px 8px rgba(79, 70, 229, 0.06),
            0 1px 2px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          /* iOS-style spring */
          transition:
            transform  0.42s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow 0.36s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.28s ease,
            background  0.28s ease;
          cursor: pointer;
        }

        /* Shimmer pseudo-element — slides across on hover */
        .ac-container::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 35%,
            rgba(255, 255, 255, 0.55) 50%,
            transparent 65%
          );
          transform: translateX(-110%) skewX(-18deg);
          pointer-events: none;
          z-index: 1;
          border-radius: inherit;
          transition: none;
        }

        /* Top-edge gloss — always visible, subtle */
        .ac-container::after {
          content: '';
          position: absolute;
          top: 0;
          left: 8%;
          right: 8%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
          pointer-events: none;
          border-radius: 999px;
        }

        .ac-container:hover {
          transform: translateY(-3px) scale(1.018);
          background: rgba(255, 255, 255, 0.78);
          border-color: rgba(255, 255, 255, 0.92);
          box-shadow:
            0 8px 28px rgba(79, 70, 229, 0.12),
            0 2px 6px rgba(0, 0, 0, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        /* Trigger shimmer sweep on hover */
        .ac-container:hover::before {
          animation: shimmer 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .ac-container:active {
          transform: translateY(0px) scale(0.985);
          box-shadow:
            0 2px 8px rgba(79, 70, 229, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          transition-duration: 0.14s;
        }

        /* ── Link & card row layout ── */
        .ac-link {
          display: block;
          width: 100%;
          position: relative;
          z-index: 2;           /* above shimmer pseudo */
        }
        .ac {
          display: flex;
          flex-direction: row;   /* icon dan label berdampingan */
          align-items: center;
          gap: 0.9rem;
          background: transparent;
          border: none;
          padding: 0;
          height: 100%;
          position: relative;
          overflow: visible;
        }

        /* ── Icon box ── */
        .ac-icon-box {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          background: color-mix(in srgb, var(--ic) 12%, rgba(255,255,255,0.9));
          color: var(--ic);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid color-mix(in srgb, var(--ic) 18%, rgba(255,255,255,0.6));
          box-shadow:
            0 1px 4px color-mix(in srgb, var(--ic) 15%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.8);
          transition:
            background  0.3s cubic-bezier(0.22, 1, 0.36, 1),
            transform   0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
            box-shadow  0.3s ease;
        }
        .ac-container:hover .ac-icon-box {
          background: color-mix(in srgb, var(--ic) 20%, rgba(255,255,255,0.95));
          transform: scale(1.1) rotate(-4deg);
          box-shadow:
            0 4px 12px color-mix(in srgb, var(--ic) 28%, transparent),
            inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .ac-container:active .ac-icon-box {
          transform: scale(0.94) rotate(0deg);
          transition-duration: 0.12s;
        }

        /* ── Label ── */
        .ac-body {
          flex: 1;
          min-width: 0;
        }
        .ac-label {
          font-family: var(--ff-display, 'Bricolage Grotesque', system-ui, sans-serif);
          font-size: 0.975rem;
          font-weight: 700;
          color: var(--ink, #0F172A);
          display: block;
          letter-spacing: -0.01em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.2s ease;
        }
        .ac-container:hover .ac-label {
          color: var(--ic);
        }
        .ac-desc {
          font-size: 0.75rem;
          color: var(--ink-3, #64748B);
          line-height: 1.4;
          display: block;
          margin-top: 0.2rem;
        }

        .ac-arrow {
          display: none;
        }

        @media (max-width: 1000px) {
          .sidebar {
            flex: auto;
            width: 100%;
            position: static;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 0.85rem;
          }
          .ac-container {
            flex: 1;
            min-width: 180px;
          }
        }
        @media (max-width: 700px) {
          .sidebar {
            flex-direction: column;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ac-container,
          .ac-container::before,
          .ac-icon-box,
          .fade-up {
            transition: none !important;
            animation: none !important;
          }
          .fade-up {
            opacity: 1;
            transform: none;
            filter: none;
          }
        }
      `}</style>
    </aside>
  );
}