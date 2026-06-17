'use client';

import Link from 'next/link';
import Image from 'next/image';
import HackathonLogo from '../../../../public/logohackathon.svg'; // impor logo

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface NavbarProps {
  user: { name?: string; email?: string } | null;
  onLogout: () => void;
  scrolled: boolean;
  scrollPercent: number;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
}

export default function Navbar({ user, onLogout, scrolled, scrollPercent, menuOpen, setMenuOpen }: NavbarProps) {
  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-progress">
          <div className="navbar-progress-fill" style={{ width: `${scrollPercent}%` }} />
        </div>
        <div className="navbar-container">
          {/* Brand: Logo Hackathon */}
          <div className="navbar-brand">
            <Link href="/" className="navbar-brand">
            <Image
                src={HackathonLogo}
                alt="Hackathon MPR RI"
                width={130}
                height={36}
                className="navbar-brand-logo"
                priority
                />
            </Link>
            <div className="navbar-brand-text">
                <span className="navbar-brand-title">Hackathon MPR RI · 2026</span>
            </div>
        </div>
        <div className="navbar-user">
            <div className="navbar-user-pill" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="navbar-user-avatar">{initials}</div>
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user?.name}</span>
                <span className="navbar-user-role">Peserta Aktif</span>
              </div>
              <svg className={`navbar-user-chevron ${menuOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
            {menuOpen && (
              <div className="navbar-dropdown">
                <div className="navbar-dropdown-header">
                  <div className="navbar-dropdown-avatar">{initials}</div>
                  <div>
                    <p className="navbar-dropdown-name">{user?.name}</p>
                    <p className="navbar-dropdown-email">{user?.email}</p>
                  </div>
                </div>
                <div className="navbar-dropdown-divider" />
                <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={onLogout}>
                  <IconLogout /> Keluar dari akun
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx>{`
        /* ========== STYLE SAMA PERSIS DENGAN LANDING PAGE ========== */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.96);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0, 119, 255, 0.12);
          transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .navbar.navbar-scrolled {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(16px) saturate(180%);
          border-bottom: 2px solid rgba(0, 119, 255, 0.3);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 119, 255, 0.05) inset;
        }
        .navbar-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: rgba(0, 119, 255, 0.06);
        }
        .navbar-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0077ff, #00c896);
          transition: width 0.2s;
        }
        .navbar-container {
          max-width: 1340px;
          margin: 0 auto;
          padding: 0.8rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          line-height: 0;
          gap: 2rem;
        }

         .navbar-brand-text {
          display: flex;
          flex-direction: column;
        }
        .navbar-brand-title {
          font-family: 'Outfit', system-ui, sans-serif;
          font-size: 0.92rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .navbar-brand-logo {
          height: auto;
          width: auto;
          max-height: 36px;
        }
        .navbar-user {
          position: relative;
        }
        .navbar-user-pill {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.4rem 0.85rem 0.4rem 0.4rem;
          background: white;
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 50px;
          cursor: pointer;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .navbar-user-pill:hover {
          border-color: rgba(0, 119, 255, 0.3);
          box-shadow: 0 4px 18px rgba(0, 119, 255, 0.07);
        }
        .navbar-user-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Outfit', system-ui, sans-serif;
        }
        .navbar-user-info {
          display: flex;
          flex-direction: column;
        }
        .navbar-user-name {
          font-size: 0.8rem;
          font-weight: 600;
          color: #0f172a;
        }
        .navbar-user-role {
          font-size: 0.63rem;
          color: #64748b;
        }
        .navbar-user-chevron {
          color: #64748b;
          transition: transform 0.22s;
        }
        .navbar-user-chevron.open {
          transform: rotate(180deg);
        }
        .navbar-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          min-width: 224px;
          background: white;
          border: 1px solid rgba(0, 119, 255, 0.12);
          border-radius: 22px;
          box-shadow: 0 24px 64px rgba(0, 119, 255, 0.14);
          overflow: hidden;
          animation: fadeUpIn 0.18s cubic-bezier(0.22, 1, 0.36, 1);
          z-index: 1100;
        }
        .navbar-dropdown-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.2rem;
          background: #f4f8fb;
        }
        .navbar-dropdown-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0077ff, #00d4ff);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .navbar-dropdown-name {
          font-size: 0.85rem;
          font-weight: 600;
          color: #0f172a;
        }
        .navbar-dropdown-email {
          font-size: 0.72rem;
          color: #334155;
        }
        .navbar-dropdown-divider {
          height: 1px;
          background: rgba(0, 119, 255, 0.12);
        }
        .navbar-dropdown-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.8rem 1.2rem;
          font-size: 0.84rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
          color: #334155;
        }
        .navbar-dropdown-item:hover {
          background: #f4f8fb;
        }
        .navbar-dropdown-logout:hover {
          background: #fff1f2;
          color: #e11d48;
        }
        @keyframes fadeUpIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @media (max-width: 768px) {
          .navbar-container {
            padding: 0.75rem 1rem;
          }
          .navbar-user-info {
            display: none;
          }
        }
      `}</style>
    </>
  );
}