'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, LayoutDashboard, LogIn, LogOut, ChevronDown } from 'lucide-react';

interface NavbarProps {
  discordUrl?: string;
  supportUrl?: string;
  saleUrl?: string;
}

interface UserProfile {
  discordId: string;
  username: string;
  avatar: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'GUEST';
}

const NAV_LINKS = [
  { label: 'Menu', key: 'menu' },
  { label: 'Sale', key: 'sale' },
  { label: 'Support', key: 'support' },
  { label: 'Discord', key: 'discord' },
] as const;

export function Navbar({
  discordUrl = 'https://discord.gg/pade',
  supportUrl = 'https://discord.gg/pade',
  saleUrl = '#sale',
}: NavbarProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const isAdminOrOwner = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const resolveHref = (key: (typeof NAV_LINKS)[number]['key']) => {
    switch (key) {
      case 'menu':
        return '/';
      case 'sale':
        return saleUrl;
      case 'support':
        return supportUrl;
      case 'discord':
        return discordUrl;
    }
  };

  const isExternal = (key: (typeof NAV_LINKS)[number]['key']) =>
    key === 'support' || key === 'discord';

  return (
    <header className="sticky top-0 z-50 w-full pade-glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <span className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--graphite)] border border-[var(--line)] overflow-hidden">
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_60%)]" />
              <span className="relative text-sm font-bold text-[var(--silver-accent)] font-display">
                P
              </span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-[0.16em] text-[var(--white)] group-hover:text-[var(--silver-accent)] transition-colors font-display">
                PADE STORE
              </span>
              <span className="text-[9px] tracking-[0.28em] text-[var(--ash)] uppercase mt-0.5">
                menu / v2
              </span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.key}
                href={resolveHref(link.key)}
                {...(isExternal(link.key)
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="group relative px-3 py-2 text-sm font-medium text-[var(--text-2)] hover:text-[var(--white)] transition-colors"
              >
                <span>{link.label}</span>
                <span className="pointer-events-none absolute left-3 right-3 -bottom-0.5 h-px bg-gradient-to-r from-transparent via-[var(--silver-accent)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pade-btn pade-btn-ghost hidden sm:inline-flex px-3 py-1.5 text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--silver-dim)]" />
            <span>Discord</span>
          </a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 p-1.5 pr-2.5 rounded-xl bg-[var(--ink)] hover:bg-[var(--graphite)] border border-[var(--line)] hover:border-[var(--line-strong)] text-xs text-[var(--white)] transition-all"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
              >
                {user.avatar ? (
                  <span className="relative w-6 h-6 rounded-full ring-1 ring-[var(--line-strong)] overflow-hidden">
                    <Image
                      src={user.avatar}
                      alt={user.username}
                      width={24}
                      height={24}
                      className="rounded-full w-6 h-6 object-cover"
                    />
                  </span>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[var(--steel)] to-[var(--ink)] ring-1 ring-[var(--line-strong)] flex items-center justify-center text-[10px] font-bold">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate font-medium">{user.username}</span>
                <ChevronDown
                  className={`w-3 h-3 text-[var(--ash)] transition-transform duration-200 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 rounded-xl pade-glass shadow-2xl py-1 text-xs z-50 overflow-hidden animate-scale-in"
                >
                  <div className="px-3 py-2 border-b border-[var(--line)] text-[var(--ash)] flex items-center justify-between">
                    <span className="truncate">
                      <span className="text-[var(--white)] font-medium">{user.username}</span>
                    </span>
                    {isAdminOrOwner && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--steel)] text-[var(--silver-accent)] border border-[var(--line)]">
                        {user.role}
                      </span>
                    )}
                  </div>

                  {isAdminOrOwner && (
                    <Link
                      href="/admin/menu"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--graphite)] text-[var(--white)] transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[var(--silver-accent)]" />
                      <span>Manage Menu</span>
                    </Link>
                  )}

                  <a
                    href="/api/auth/logout"
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--graphite)] text-red-400 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/api/auth/discord/login"
              className="pade-btn pade-btn-primary pade-btn-sheen px-3.5 py-2 text-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login with Discord</span>
            </Link>
          )}
        </div>
      </div>

      {/* Silver hairline base */}
      <span className="pointer-events-none absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[rgba(208,211,217,0.35)] to-transparent" />
    </header>
  );
}
