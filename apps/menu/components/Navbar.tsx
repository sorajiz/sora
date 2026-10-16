'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, LayoutDashboard, LogIn, LogOut, Shield, ChevronDown } from 'lucide-react';

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

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[var(--void)]/90 border-b border-[var(--line)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="text-xl font-bold tracking-tight text-[var(--white)] group-hover:text-[var(--silver-accent)] transition-colors font-display">
              PADE STORE
            </span>
            <span className="text-sm text-[var(--silver-dim)] group-hover:text-[var(--white)] transition-colors">
              𐙚
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-5 text-sm font-medium text-[var(--text-2)]">
            <Link href="/" className="hover:text-[var(--white)] transition-colors">
              Menu
            </Link>
            <a href={saleUrl} className="hover:text-[var(--white)] transition-colors">
              Sale
            </a>
            <a href={supportUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white)] transition-colors">
              Support
            </a>
            <a href={discordUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--white)] transition-colors">
              Discord
            </a>
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href={discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--ink)] hover:bg-[var(--graphite)] text-[var(--white)] text-xs font-medium border border-[var(--line)] transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[var(--silver-dim)]" />
            <span>Discord</span>
          </a>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-lg bg-[var(--ink)] hover:bg-[var(--graphite)] border border-[var(--line)] text-xs text-[var(--white)] transition-all"
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={24}
                    height={24}
                    className="rounded-full w-6 h-6 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[var(--steel)] flex items-center justify-center text-[10px] font-bold">
                    {user.username.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate font-medium">{user.username}</span>
                <ChevronDown className="w-3 h-3 text-[var(--ash)]" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--ink)] border border-[var(--line)] shadow-xl py-1 text-xs z-50">
                  <div className="px-3 py-2 border-b border-[var(--line)] text-[var(--ash)]">
                    Đăng nhập là <span className="text-[var(--white)] font-medium">{user.username}</span>
                    {isAdminOrOwner && (
                      <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-[var(--steel)] text-[var(--silver-accent)]">
                        {user.role}
                      </span>
                    )}
                  </div>

                  {isAdminOrOwner && (
                    <Link
                      href="/admin/menu"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--graphite)] text-[var(--white)]"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[var(--silver-accent)]" />
                      <span>Manage Menu</span>
                    </Link>
                  )}

                  <a
                    href="/api/auth/logout"
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-[var(--graphite)] text-red-400"
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
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[var(--off-white)] text-[var(--void)] text-xs font-semibold hover:bg-[var(--white)] transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login with Discord</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
