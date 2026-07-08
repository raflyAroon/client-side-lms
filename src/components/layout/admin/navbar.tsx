// src/components/layout/NavbarAdmin.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import HackathonLogo from '../../../../public/logohackathon.svg';

const IconLogout = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

interface NavbarAdminProps {
  user: { name?: string; email?: string; role?: string } | null;
  onLogout: () => void;
  scrolled: boolean;
  scrollPercent: number;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  showQuickActions?: boolean;
  roleLabel?: string;
}

export default function NavbarAdmin({
  user,
  onLogout,
  scrolled,
  scrollPercent,
  menuOpen,
  setMenuOpen,
  showQuickActions = true,
  roleLabel = 'Admin',
}: NavbarAdminProps) {
  const initials = (user?.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <div className="navbar-brand-wrapper">
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
            <span className="navbar-brand-text">Hackathon MPR RI · 2026</span>
          </div>

          <div className="navbar-right">
            {showQuickActions && (
              <div className="navbar-actions">
                <div className="navbar-action-wrapper">
                  <Link href="/admin/team-participant" className="navbar-action-btn">
                    👥 Kelola Tim
                  </Link>
                </div>
                <div className="navbar-action-wrapper">
                  <Link href="/admin/manage-landing" className="navbar-action-btn">
                    📄 Kelola Landing
                  </Link>
                </div>
                <div className="navbar-action-wrapper">
                  <Link href="/admin/manage-auditlog" className="navbar-action-btn">
                    📋 Audit Log
                  </Link>
                </div>
              </div>
            )}

            <div className="navbar-user">
              <div className="navbar-user-pill" onClick={() => setMenuOpen(!menuOpen)}>
                <div className="navbar-user-avatar">{initials}</div>
                <div className="navbar-user-info">
                  <span className="navbar-user-name">{user?.name}</span>
                  <span className="navbar-user-role">{roleLabel}</span>
                </div>
                <svg
                  className={`navbar-user-chevron ${menuOpen ? 'open' : ''}`}
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
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
        </div>
      </nav>

      <style jsx>{`
        /* ===== DESIGN SYSTEM — NAVBAR ===== */
        .navbar {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.72);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(231, 229, 228, 0.6);
          transition: background 0.2s ease, box-shadow 0.2s ease;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .navbar-scrolled {
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
        }

        .navbar-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .navbar-brand-wrapper {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          text-decoration: none;
          flex-shrink: 0;
        }

        .navbar-brand-logo {
          height: 32px;
          width: auto;
          flex-shrink: 0;
        }

        .navbar-brand-text {
          font-size: 15px;
          font-weight: 500;
          color: #0c0a09;
          letter-spacing: 0.15px;
          white-space: nowrap;
        }

        .navbar-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* Style dipindahkan ke wrapper */
        .navbar-action-wrapper {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border: 1px solid #d6d3d1;
          border-radius: 9999px;
          background: transparent;
          transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
          cursor: pointer;
        }

        .navbar-action-wrapper:hover {
          background: #f0efed;
          border-color: #a8a29e;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
        }

        .navbar-action-wrapper:active {
          background: #e7e5e4;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
        }

        /* Link di dalam wrapper hanya teks, tanpa style */
        .navbar-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          color: #0c0a09;
          text-decoration: none;
          white-space: nowrap;
          letter-spacing: 0.15px;
          background: transparent;
          border: none;
          padding: 0;
          margin: 0;
          line-height: 1;
        }

        /* ===== USER PILL ===== */
        .navbar-user {
          position: relative;
        }

        .navbar-user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 12px 4px 4px;
          background: #ffffff;
          border: 1px solid #e7e5e4;
          border-radius: 9999px;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
        }

        .navbar-user-pill:hover {
          border-color: #d6d3d1;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }

        .navbar-user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #f0efed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 13px;
          color: #0c0a09;
          flex-shrink: 0;
        }

        .navbar-user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.3;
        }

        .navbar-user-name {
          font-size: 13px;
          font-weight: 500;
          color: #0c0a09;
        }

        .navbar-user-role {
          font-size: 10px;
          font-weight: 400;
          color: #777169;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .navbar-user-chevron {
          transition: transform 0.2s ease;
          color: #777169;
        }

        .navbar-user-chevron.open {
          transform: rotate(180deg);
        }

        /* ===== DROPDOWN ===== */
        .navbar-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 8px);
          width: 260px;
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid #e7e5e4;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          animation: dropdownFade 0.15s ease;
        }

        @keyframes dropdownFade {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .navbar-dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 16px 12px;
        }

        .navbar-dropdown-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f0efed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 500;
          font-size: 16px;
          color: #0c0a09;
          flex-shrink: 0;
        }

        .navbar-dropdown-name {
          margin: 0;
          font-weight: 500;
          font-size: 14px;
          color: #0c0a09;
        }

        .navbar-dropdown-email {
          margin: 2px 0 0;
          font-size: 12px;
          color: #777169;
          word-break: break-all;
        }

        .navbar-dropdown-divider {
          height: 1px;
          background: #f0efed;
          margin: 0 16px;
        }

        .navbar-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          width: 100%;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 400;
          color: #4e4e4e;
          cursor: pointer;
          transition: background 0.12s ease;
          font-family: inherit;
        }

        .navbar-dropdown-item:hover {
          background: #fafafa;
        }

        .navbar-dropdown-logout {
          color: #dc2626;
        }

        .navbar-dropdown-logout:hover {
          background: #fef2f2;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .navbar-container {
            padding: 0 16px;
            height: 56px;
          }

          .navbar-brand-text {
          font-family: 'Waldenburg Light', 'Times New Roman', serif;
          font-weight: 300;
            font-size: 13px;
          }

          .navbar-brand-logo {
            height: 26px;
          }

          .navbar-actions {
            gap: 6px;
          }

          .navbar-action-wrapper {
            padding: 4px 10px;
          }

          .navbar-action-btn {
            font-size: 11px;
          }

          .navbar-user-info {
            display: none;
          }

          .navbar-user-pill {
            padding: 4px;
          }

          .navbar-user-avatar {
            width: 28px;
            height: 28px;
            font-size: 11px;
          }

          .navbar-dropdown {
            width: 240px;
            right: -8px;
          }
        }

        @media (max-width: 480px) {
          .navbar-brand-text {
            font-size: 11px;
          }

          .navbar-brand-logo {
            height: 22px;
          }

          .navbar-action-wrapper {
            padding: 3px 8px;
          }

          .navbar-action-btn {
            font-size: 10px;
            gap: 2px;
          }

          .navbar-actions {
            gap: 4px;
          }

          .navbar-right {
            gap: 8px;
          }

          .navbar-user-avatar {
            width: 24px;
            height: 24px;
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}