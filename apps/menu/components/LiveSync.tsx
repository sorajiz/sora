'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface LiveSyncProps {
  initialVersion: number;
  isAdmin?: boolean;
}

export function LiveSync({ initialVersion, isAdmin = false }: LiveSyncProps) {
  const router = useRouter();
  const currentVersionRef = useRef<number>(initialVersion);
  const [showToast, setShowToast] = useState(false);
  const backoffRef = useRef<number>(isAdmin ? 1500 : 3000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    currentVersionRef.current = initialVersion;
  }, [initialVersion]);

  useEffect(() => {
    let isMounted = true;

    const checkVersion = async () => {
      // Pause polling if document is hidden (§12.3)
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') {
        return;
      }

      try {
        const res = await fetch('/api/menu/version', {
          headers: {
            'If-None-Match': `"menu-v${currentVersionRef.current}"`,
          },
        });

        if (res.status === 304) {
          // Version unchanged, reset backoff
          backoffRef.current = isAdmin ? 1500 : 3000;
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.version === 'number') {
            if (data.version > currentVersionRef.current) {
              console.log(`[LiveSync]: Version change detected (${currentVersionRef.current} -> ${data.version}). Refreshing router...`);
              currentVersionRef.current = data.version;
              router.refresh();
              setShowToast(true);
              setTimeout(() => {
                if (isMounted) setShowToast(false);
              }, 4000);
            }
            backoffRef.current = isAdmin ? 1500 : 3000;
          }
        } else {
          // Exponential backoff on errors, cap at 30s
          backoffRef.current = Math.min(30000, backoffRef.current * 1.5);
        }
      } catch {
        backoffRef.current = Math.min(30000, backoffRef.current * 1.5);
      }
    };

    const scheduleNext = () => {
      if (!isMounted) return;
      // ±30% jitter to prevent thundering herd (§12.3)
      const jitter = (Math.random() * 0.6 - 0.3) * backoffRef.current;
      const delay = Math.max(1000, backoffRef.current + jitter);

      timerRef.current = setTimeout(async () => {
        await checkVersion();
        scheduleNext();
      }, delay);
    };

    scheduleNext();

    // Immediate check on visibility change, focus, or online
    const handleImmediateCheck = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };

    document.addEventListener('visibilitychange', handleImmediateCheck);
    window.addEventListener('focus', handleImmediateCheck);
    window.addEventListener('online', handleImmediateCheck);

    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', handleImmediateCheck);
      window.removeEventListener('focus', handleImmediateCheck);
      window.removeEventListener('online', handleImmediateCheck);
    };
  }, [isAdmin, router]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-in pointer-events-none">
      <div className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[var(--ink)]/95 border border-[var(--silver-dim)] text-xs text-[var(--white)] shadow-2xl backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span className="font-medium">Menu vừa được cập nhật ✧</span>
      </div>
    </div>
  );
}
