'use client';

import { useEffect, useRef } from 'react';

interface LiveRealtimeRefresherProps {
  initialVersion: number;
  onVersionChanged: (newVersion: number) => void;
  intervalMs?: number;
}

export function LiveRealtimeRefresher({
  initialVersion,
  onVersionChanged,
  intervalMs = 1500,
}: LiveRealtimeRefresherProps) {
  const currentVersionRef = useRef(initialVersion);
  const etagRef = useRef(`"W/menu-v${initialVersion}"`);

  useEffect(() => {
    currentVersionRef.current = initialVersion;
    etagRef.current = `"W/menu-v${initialVersion}"`;
  }, [initialVersion]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    let isPolling = false;

    const checkVersion = async () => {
      // Respect Page Visibility API: pause when tab is in background
      if (document.visibilityState === 'hidden' || isPolling) {
        return;
      }

      isPolling = true;
      try {
        const res = await fetch('/api/menu/version', {
          headers: {
            'If-None-Match': etagRef.current,
          },
          cache: 'no-store',
        });

        // 304 Not Modified: version has not changed!
        if (res.status === 304) {
          isPolling = false;
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (data.version && data.version !== currentVersionRef.current) {
            console.log(`[PADE MENU] Detected version change: v${currentVersionRef.current} -> v${data.version}`);
            currentVersionRef.current = data.version;
            etagRef.current = `"W/menu-v${data.version}"`;
            onVersionChanged(data.version);
          }
        }
      } catch (err) {
        // Silent fail on network blips
      } finally {
        isPolling = false;
      }
    };

    timer = setInterval(checkVersion, intervalMs);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkVersion();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timer) clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs, onVersionChanged]);

  return null;
}
