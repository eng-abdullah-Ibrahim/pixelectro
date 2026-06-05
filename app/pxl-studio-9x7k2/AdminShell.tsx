"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV = [
  { href: '/pxl-studio-9x7k2',               icon: '⬡', label: 'Dashboard' },
  { href: '/pxl-studio-9x7k2/homepage',      icon: '🏠', label: 'Homepage' },
  { href: '/pxl-studio-9x7k2/projects',      icon: '◈', label: 'Projects' },
  { href: '/pxl-studio-9x7k2/pages',         icon: '📄', label: 'Pages' },
  { href: '/pxl-studio-9x7k2/categories',    icon: '▤', label: 'Categories' },
  { href: '/pxl-studio-9x7k2/clients',       icon: '⭐', label: 'Clients' },
  { href: '/pxl-studio-9x7k2/testimonials',  icon: '💬', label: 'Testimonials' },
];

export default function AdminShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div className="adminShell" dir="ltr" lang="en">

      {/* Mobile sidebar toggle */}
      <button
        className="sidebarToggle"
        onClick={() => setSidebarOpen(v => !v)}
        aria-label="Toggle sidebar"
      >
        <span /><span /><span />
      </button>

      {/* Overlay (mobile) */}
      <div
        className={`sidebarOverlay ${sidebarOpen ? 'sidebarOpen' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'sidebarOpen' : ''}`}>
        <div className="sidebarBrand">
          <div className="sidebarBrandMark">P</div>
          <div>
            <div className="sidebarBrandName">PIXELECTRO</div>
            <div className="sidebarBrandSub">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebarNav">
          <span className="navSection">Main Menu</span>
          {NAV.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`navLink ${pathname === l.href ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="navIcon">{l.icon}</span>
              {l.label}
            </Link>
          ))}
          <span className="navSection">Site</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="navLink">
            <span className="navIcon">↗</span>
            View Website
          </a>
        </nav>

        <div className="sidebarFooter">
          <a href="/api/auth/signout" className="signOutBtn">
            <span>⎋</span>
            Sign Out
          </a>
        </div>
      </aside>

      <main className="mainArea">
        <header className="topBar">
          <div>
            <div className="topBarTitle">Control Center</div>
            <div className="topBarBreadcrumb">Pixelectro Studio</div>
          </div>
          <div className="topBarRight">
            <div>
              <div className="topBarUser">{userName}</div>
              <div className="topBarUserSub">Administrator</div>
            </div>
            <div className="topBarAvatar">{userInitial}</div>
          </div>
        </header>

        <div className="contentArea">
          {children}
        </div>
      </main>

    </div>
  );
}
