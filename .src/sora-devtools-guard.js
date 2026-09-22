/*
 * SORA DEVTOOLS GUARD v2.0
 * ========================
 * Cross-browser, low-overhead deterrent for common Developer Tools entry points.
 *
 * Targets common shortcuts used by:
 * - Chrome / Chromium
 * - Microsoft Edge
 * - Brave
 * - Opera / Opera GX
 * - Firefox
 * - Safari (when Web Inspector is enabled)
 *
 * Design goals:
 * - Do NOT use infinite `debugger` loops.
 * - Do NOT spam console or resize the page every frame.
 * - Do NOT interfere with normal typing, scrolling, clicking, animations, or forms.
 * - Keep CPU usage negligible.
 *
 * IMPORTANT:
 * Client-side code cannot truly make HTML/CSS/JS/Network/Application data
 * inaccessible to a determined user because the browser must download it.
 * This file is a deterrent layer, not a security boundary.
 */

(() => {
  "use strict";

  if (window.SoraDevtoolsGuard) return;

  const VERSION = "2.0.0";

  const CONFIG = Object.freeze({
    // Main protection switches
    blockDevtoolsShortcuts: true,
    blockViewSource: true,

    // Right click is optional because blocking it can affect normal UX.
    blockContextMenu: false,

    // Lightweight docked-devtools heuristic.
    detectDockedDevtools: true,
    lockWhenDetected: true,

    // Keep detection light.
    detectionIntervalMs: 1400,

    // Avoid false positives on smaller/mobile screens.
    minViewportWidth: 760,
    minViewportHeight: 420,

    // Outer/inner viewport difference used for docked tools detection.
    dockThresholdPx: 180,

    // Number of consecutive positive checks required before locking.
    confirmChecks: 2,

    // Number of consecutive clean checks required before unlocking.
    releaseChecks: 2,

    overlayTitle: "Developer Tools blocked",
    overlayText: "Please close Developer Tools to continue using this page."
  });

  const state = {
    started: false,
    locked: false,
    positiveChecks: 0,
    cleanChecks: 0,
    timer: 0,
    overlay: null,
    browser: "unknown"
  };

  function detectBrowser() {
    const ua = navigator.userAgent || "";
    const vendor = navigator.vendor || "";

    if (/Firefox\//i.test(ua)) return "firefox";
    if (/Edg\//i.test(ua)) return "edge";
    if (/OPR\//i.test(ua) || /Opera/i.test(ua)) return "opera";
    if (/Brave/i.test(ua) || navigator.brave) return "brave";
    if (/Chrome\//i.test(ua) && /Google Inc/i.test(vendor)) return "chrome";
    if (/Safari\//i.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR/i.test(ua)) return "safari";
    if (/Chromium/i.test(ua)) return "chromium";

    return "unknown";
  }

  function isMacLike() {
    return /Mac|iPhone|iPad|iPod/i.test(
      navigator.platform || navigator.userAgent || ""
    );
  }

  function normalizeKey(event) {
    return String(event.key || "").toLowerCase();
  }

  function isDevtoolsShortcut(event) {
    if (!CONFIG.blockDevtoolsShortcuts) return false;

    const key = normalizeKey(event);
    const code = String(event.code || "");
    const ctrl = !!event.ctrlKey;
    const shift = !!event.shiftKey;
    const alt = !!event.altKey;
    const meta = !!event.metaKey;
    const mac = isMacLike();

    // Universal F12
    if (key === "f12" || code === "F12" || event.keyCode === 123) {
      return true;
    }

    /*
     * Chromium / Chrome / Edge / Brave / Opera / Firefox
     * Ctrl + Shift + I = DevTools
     * Ctrl + Shift + J = Console
     * Ctrl + Shift + C = Element picker / Inspector
     * Ctrl + Shift + K = Web Console in Firefox
     */
    if ((ctrl || meta) && shift && ["i", "j", "c", "k"].includes(key)) {
      return true;
    }

    /*
     * Firefox additional Browser Toolbox-ish / dev shortcuts commonly used.
     * Keep this narrow to avoid normal browser shortcuts.
     */
    if (ctrl && shift && key === "e") {
      // Network monitor in Firefox on some layouts.
      return true;
    }

    /*
     * Safari / macOS Web Inspector:
     * Command + Option + I = Web Inspector
     * Command + Option + C = Console
     * Command + Option + U = Page Resources / Source-related shortcut variants
     */
    if (mac && meta && alt && ["i", "c", "u"].includes(key)) {
      return true;
    }

    /*
     * Chrome/Chromium on macOS:
     * Command + Option + J = JavaScript Console
     */
    if (mac && meta && alt && key === "j") {
      return true;
    }

    return false;
  }

  function isViewSourceShortcut(event) {
    if (!CONFIG.blockViewSource) return false;

    const key = normalizeKey(event);
    const mac = isMacLike();

    // Ctrl+U on Windows/Linux, Cmd+U on macOS.
    if (!mac && event.ctrlKey && key === "u") return true;
    if (mac && event.metaKey && key === "u") return true;

    return false;
  }

  function stop(event) {
    event.preventDefault();
    event.stopPropagation();

    if (typeof event.stopImmediatePropagation === "function") {
      event.stopImmediatePropagation();
    }

    return false;
  }

  function installKeyboardGuard() {
    document.addEventListener(
      "keydown",
      (event) => {
        if (isDevtoolsShortcut(event) || isViewSourceShortcut(event)) {
          return stop(event);
        }
      },
      true
    );
  }

  function installContextMenuGuard() {
    if (!CONFIG.blockContextMenu) return;

    document.addEventListener(
      "contextmenu",
      (event) => stop(event),
      true
    );
  }

  function injectStyle() {
    if (document.getElementById("sora-devtools-guard-style")) return;

    const style = document.createElement("style");
    style.id = "sora-devtools-guard-style";
    style.textContent = `
      #sora-devtools-guard-overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: none;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(
            circle at 50% 36%,
            rgba(255,255,255,.075),
            transparent 35%
          ),
          rgba(20,21,23,.985);
        color: rgba(255,255,255,.94);
        font-family:
          Inter,
          ui-sans-serif,
          system-ui,
          -apple-system,
          BlinkMacSystemFont,
          "Segoe UI",
          sans-serif;
        text-align: center;
        user-select: none;
        -webkit-user-select: none;
      }

      html.sora-devtools-locked #sora-devtools-guard-overlay {
        display: grid;
      }

      #sora-devtools-guard-overlay .sora-devtools-card {
        width: min(430px, calc(100vw - 40px));
        padding: 26px;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 20px;
        background: rgba(255,255,255,.05);
        box-shadow:
          0 22px 70px rgba(0,0,0,.38),
          inset 0 1px rgba(255,255,255,.07);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }

      #sora-devtools-guard-overlay .sora-devtools-icon {
        width: 42px;
        height: 42px;
        margin: 0 auto 14px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255,255,255,.12);
        border-radius: 13px;
        background: rgba(255,255,255,.06);
        font-size: 18px;
      }

      #sora-devtools-guard-overlay h2 {
        margin: 0 0 8px;
        font-size: 19px;
        line-height: 1.3;
        font-weight: 650;
        letter-spacing: -.02em;
      }

      #sora-devtools-guard-overlay p {
        margin: 0;
        color: rgba(255,255,255,.6);
        font-size: 13px;
        line-height: 1.6;
      }

      /*
       * Only pointer interaction is suspended while locked.
       * We intentionally avoid touching layout, animation timing,
       * transforms, or rendering quality.
       */
      html.sora-devtools-locked body > :not(#sora-devtools-guard-overlay) {
        pointer-events: none !important;
      }
    `;

    document.head.appendChild(style);
  }

  function createOverlay() {
    if (state.overlay?.isConnected) return state.overlay;

    const overlay = document.createElement("div");
    overlay.id = "sora-devtools-guard-overlay";
    overlay.setAttribute("role", "alert");
    overlay.setAttribute("aria-live", "assertive");

    const card = document.createElement("div");
    card.className = "sora-devtools-card";

    const icon = document.createElement("div");
    icon.className = "sora-devtools-icon";
    icon.textContent = "✦";

    const title = document.createElement("h2");
    title.textContent = CONFIG.overlayTitle;

    const text = document.createElement("p");
    text.textContent = CONFIG.overlayText;

    card.append(icon, title, text);
    overlay.appendChild(card);

    document.body.appendChild(overlay);

    state.overlay = overlay;
    return overlay;
  }

  function lock(reason = "detected") {
    if (!CONFIG.lockWhenDetected || state.locked) return;

    state.locked = true;

    createOverlay();

    document.documentElement.classList.add("sora-devtools-locked");
    document.documentElement.dataset.soraDevtoolsReason = reason;

    window.dispatchEvent(
      new CustomEvent("sora:devtools-lock", {
        detail: {
          locked: true,
          reason,
          browser: state.browser
        }
      })
    );
  }

  function unlock(reason = "clean") {
    if (!state.locked) return;

    state.locked = false;

    document.documentElement.classList.remove("sora-devtools-locked");
    delete document.documentElement.dataset.soraDevtoolsReason;

    window.dispatchEvent(
      new CustomEvent("sora:devtools-lock", {
        detail: {
          locked: false,
          reason,
          browser: state.browser
        }
      })
    );
  }

  function viewportLooksLikeDockedDevtools() {
    if (!CONFIG.detectDockedDevtools) return false;

    const innerW = window.innerWidth || 0;
    const innerH = window.innerHeight || 0;
    const outerW = window.outerWidth || innerW;
    const outerH = window.outerHeight || innerH;

    // Avoid mobile/tablet false positives and tiny popup windows.
    if (
      innerW < CONFIG.minViewportWidth ||
      innerH < CONFIG.minViewportHeight
    ) {
      return false;
    }

    const widthGap = Math.max(0, outerW - innerW);
    const heightGap = Math.max(0, outerH - innerH);

    return (
      widthGap > CONFIG.dockThresholdPx ||
      heightGap > CONFIG.dockThresholdPx
    );
  }

  function checkDevtools() {
    const likelyOpen = viewportLooksLikeDockedDevtools();

    if (likelyOpen) {
      state.positiveChecks++;
      state.cleanChecks = 0;

      if (state.positiveChecks >= CONFIG.confirmChecks) {
        lock("docked-devtools");
      }
    } else {
      state.cleanChecks++;
      state.positiveChecks = 0;

      if (state.cleanChecks >= CONFIG.releaseChecks) {
        unlock("devtools-closed");
      }
    }

    return likelyOpen;
  }

  function startDetector() {
    if (!CONFIG.detectDockedDevtools) return;

    clearInterval(state.timer);

    checkDevtools();

    state.timer = window.setInterval(() => {
      if (document.hidden) return;
      checkDevtools();
    }, CONFIG.detectionIntervalMs);
  }

  function installVisibilityHandling() {
    document.addEventListener(
      "visibilitychange",
      () => {
        if (document.hidden) return;

        // Small delay lets viewport dimensions settle.
        setTimeout(checkDevtools, 120);
      },
      { passive: true }
    );

    window.addEventListener(
      "resize",
      () => {
        if (document.hidden) return;

        // No expensive work; a single delayed check only.
        clearTimeout(window.__soraDevtoolsResizeTimer);

        window.__soraDevtoolsResizeTimer = setTimeout(
          checkDevtools,
          160
        );
      },
      { passive: true }
    );
  }

  function boot() {
    if (state.started) return;
    state.started = true;

    state.browser = detectBrowser();

    injectStyle();
    createOverlay();

    installKeyboardGuard();
    installContextMenuGuard();
    installVisibilityHandling();
    startDetector();
  }

  window.SoraDevtoolsGuard = Object.freeze({
    version: VERSION,

    get browser() {
      return state.browser;
    },

    get locked() {
      return state.locked;
    },

    check() {
      return checkDevtools();
    },

    lock() {
      lock("manual");
    },

    unlock() {
      unlock("manual");
    },

    status() {
      return {
        version: VERSION,
        browser: state.browser,
        locked: state.locked,
        devtoolsLikelyOpen: viewportLooksLikeDockedDevtools()
      };
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
