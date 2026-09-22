/*
 * SORA PERFORMANCE ENGINE X2
 * ==========================
 * Adaptive 60 FPS governor for animation-heavy websites.
 * v2.1 focuses on lower self-overhead and fewer unnecessary observers/events.
 *
 * Designed for:
 * - WebGL / Canvas animated backgrounds
 * - CSS glass / blur / glow effects
 * - Mobile + low-end devices
 * - Keeping motion alive while reducing the expensive parts first
 *
 * IMPORTANT:
 * No browser script can guarantee 60 FPS on every device or guarantee zero heat.
 * This engine targets 60 FPS and dynamically trades visual cost for smoothness.
 *
 * DROP-IN:
 *   <script src="/js/sora-performance-x2.js" defer></script>
 *
 * OPTIONAL MARKUP:
 *   data-sora-ambient        -> pause decorative animation when offscreen
 *   data-sora-section        -> enable content-visibility optimization
 *   data-sora-animate        -> smart compositor promotion while active
 *   data-sora-auto-scale     -> allow automatic canvas backing-resolution scaling
 *   data-sora-ambient-video  -> pause decorative videos when offscreen
 *
 * OPTIONAL RENDERER HOOK:
 *   const stop = SoraPerformance.registerRenderer("bg", ({renderScale, quality}) => {
 *      // apply renderScale to canvas/WebGL resolution here
 *   });
 */

(() => {
  "use strict";

  if (window.SoraPerformance && window.SoraPerformance.version === "2.1.0") return;

  const VERSION = "2.1.0";
  const TARGET_FPS = 60;
  const FRAME_BUDGET = 1000 / TARGET_FPS;

  const QUALITY = ["low", "medium", "high", "ultra"];

  const PRESETS = {
    low: {
      renderScale: 0.58,
      blurScale: 0.46,
      shadowScale: 0.44,
      glowScale: 0.48,
      particleScale: 0.38,
      detailScale: 0.50,
      motionScale: 0.88,
      maxCanvasPixels: 1_050_000,
      dprCap: 0.90
    },
    medium: {
      renderScale: 0.72,
      blurScale: 0.62,
      shadowScale: 0.60,
      glowScale: 0.64,
      particleScale: 0.58,
      detailScale: 0.68,
      motionScale: 0.94,
      maxCanvasPixels: 1_600_000,
      dprCap: 1.00
    },
    high: {
      renderScale: 0.86,
      blurScale: 0.80,
      shadowScale: 0.80,
      glowScale: 0.82,
      particleScale: 0.80,
      detailScale: 0.86,
      motionScale: 1.00,
      maxCanvasPixels: 2_300_000,
      dprCap: 1.15
    },
    ultra: {
      renderScale: 1.00,
      blurScale: 1.00,
      shadowScale: 1.00,
      glowScale: 1.00,
      particleScale: 1.00,
      detailScale: 1.00,
      motionScale: 1.00,
      maxCanvasPixels: 3_000_000,
      dprCap: 1.25
    }
  };

  const state = {
    quality: "high",
    baseQuality: "high",
    fps: TARGET_FPS,
    emaFps: TARGET_FPS,
    p95Frame: FRAME_BUDGET,
    frameTime: FRAME_BUDGET,
    renderScale: 1,
    interactionMode: false,
    hidden: document.hidden,
    frozen: false,
    longTaskScore: 0,
    pressureScore: 0,
    stableWindows: 0,
    weakWindows: 0,
    severeWindows: 0,
    lastQualityChange: 0,
    lastInteractionAt: 0,
    callbacks: new Map(),
    canvasMeta: new WeakMap(),
    managedCanvases: new Set(),
    ambientObserver: null,
    videoObserver: null,
    mutationObserver: null,
    resizeObserver: null,
    sample: [],
    rafId: 0,
    started: false
  };

  const device = {
    cores: navigator.hardwareConcurrency || 4,
    memory: navigator.deviceMemory || 4,
    dpr: window.devicePixelRatio || 1,
    touch: matchMedia("(pointer: coarse)").matches,
    reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    saveData: !!(navigator.connection && navigator.connection.saveData),
    connection: navigator.connection?.effectiveType || "unknown"
  };

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  function qIndex(name) {
    const i = QUALITY.indexOf(name);
    return i < 0 ? 2 : i;
  }

  function detectBaseQuality() {
    let score = 0;

    if (device.cores >= 8) score += 2;
    else if (device.cores >= 6) score += 1;
    else if (device.cores <= 2) score -= 3;
    else if (device.cores <= 4) score -= 1;

    if (device.memory >= 8) score += 2;
    else if (device.memory >= 6) score += 1;
    else if (device.memory <= 2) score -= 3;
    else if (device.memory <= 4) score -= 1;

    if (device.dpr >= 3) score -= 2;
    else if (device.dpr >= 2) score -= 1;

    if (device.touch) score -= 1;
    if (device.saveData) score -= 2;
    if (device.connection === "slow-2g" || device.connection === "2g") score -= 1;

    if (score <= -4) return "low";
    if (score <= 0) return "medium";
    if (score >= 4) return "ultra";
    return "high";
  }

  function bootQuality() {
    const base = detectBaseQuality();
    state.baseQuality = base;

    // First-load boost: start one step cheaper so weak devices can enter smoothly.
    const i = qIndex(base);
    if (i > 0) return QUALITY[i - 1];
    return base;
  }

  function currentPreset() {
    return PRESETS[state.quality];
  }

  function computeRenderScale() {
    const preset = currentPreset();
    let scale = preset.renderScale;

    // Interaction boost protects scroll/touch responsiveness.
    if (state.interactionMode) scale *= 0.90;

    // Repeated long tasks are a useful proxy for thermal/main-thread pressure.
    if (state.pressureScore >= 5) scale *= 0.86;
    else if (state.pressureScore >= 3) scale *= 0.92;

    // Very high DPR devices get a lower internal render scale,
    // while CSS size remains identical.
    if (device.dpr >= 3) scale *= 0.84;
    else if (device.dpr >= 2) scale *= 0.92;

    return clamp(scale, 0.46, 1.00);
  }

  function injectCSS() {
    if (document.getElementById("sora-performance-x2-css")) return;

    const style = document.createElement("style");
    style.id = "sora-performance-x2-css";
    style.textContent = `
      :root {
        --sora-render-scale: 1;
        --sora-blur-scale: 1;
        --sora-shadow-scale: 1;
        --sora-glow-scale: 1;
        --sora-particle-scale: 1;
        --sora-detail-scale: 1;
        --sora-motion-scale: 1;
        --sora-live-fps: 60;
      }

      /* GPU isolation only for dedicated rendering surfaces. */
      canvas[data-sora-auto-scale],
      #bgFlowCanvas {
        contain: strict;
        backface-visibility: hidden;
        transform: translateZ(0);
      }

      /* Explicit opt-in sections: large below-the-fold DOM won't paint early. */
      [data-sora-section] {
        content-visibility: auto;
        contain-intrinsic-size: auto 720px;
      }

      /* Decorative animations pause only when explicitly marked. */
      [data-sora-ambient][data-sora-visible="0"],
      html.sora-page-hidden [data-sora-ambient] {
        animation-play-state: paused !important;
      }

      /* Temporary compositor promotion during interaction/animation. */
      [data-sora-animate][data-sora-active="1"] {
        will-change: transform, opacity;
      }

      /*
       * Optional variable-driven glass/effect helpers.
       * These do nothing unless your CSS uses the variables.
       */
      [data-sora-glass] {
        --sora-local-blur: var(--sora-blur-scale);
        --sora-local-shadow: var(--sora-shadow-scale);
        --sora-local-glow: var(--sora-glow-scale);
      }

      @media (prefers-reduced-motion: reduce) {
        :root {
          --sora-motion-scale: .72;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function syncVariables() {
    const p = currentPreset();
    state.renderScale = computeRenderScale();

    const root = document.documentElement;
    root.dataset.soraQuality = state.quality;
    root.dataset.soraPerformance = state.interactionMode ? "interaction" : "normal";

    root.style.setProperty("--sora-render-scale", state.renderScale.toFixed(3));
    root.style.setProperty("--sora-blur-scale", p.blurScale.toFixed(3));
    root.style.setProperty("--sora-shadow-scale", p.shadowScale.toFixed(3));
    root.style.setProperty("--sora-glow-scale", p.glowScale.toFixed(3));
    root.style.setProperty("--sora-particle-scale", p.particleScale.toFixed(3));
    root.style.setProperty("--sora-detail-scale", p.detailScale.toFixed(3));

    const motion = device.reducedMotion
      ? Math.min(p.motionScale, 0.72)
      : p.motionScale;

    root.style.setProperty("--sora-motion-scale", motion.toFixed(3));
    root.style.setProperty("--sora-live-fps", state.fps.toFixed(1));
  }

  function payload(reason = "sync") {
    const p = currentPreset();
    return Object.freeze({
      version: VERSION,
      reason,
      targetFPS: TARGET_FPS,
      fps: state.fps,
      emaFps: state.emaFps,
      p95Frame: state.p95Frame,
      frameTime: state.frameTime,
      quality: state.quality,
      baseQuality: state.baseQuality,
      renderScale: state.renderScale,
      blurScale: p.blurScale,
      shadowScale: p.shadowScale,
      glowScale: p.glowScale,
      particleScale: p.particleScale,
      detailScale: p.detailScale,
      motionScale: p.motionScale,
      interactionMode: state.interactionMode,
      hidden: state.hidden,
      pressureScore: state.pressureScore
    });
  }

  function notify(reason) {
    const data = payload(reason);

    state.callbacks.forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.warn("[SoraPerformance:X2] renderer callback failed:", err);
      }
    });

    window.dispatchEvent(new CustomEvent("sora:performance", { detail: data }));
  }

  function setQuality(next, reason = "adaptive", force = false) {
    if (!PRESETS[next]) return false;
    if (next === state.quality && !force) return false;

    const now = performance.now();

    // Hysteresis prevents rapid quality ping-pong.
    if (!force && now - state.lastQualityChange < 5200) return false;

    state.quality = next;
    state.lastQualityChange = now;
    state.stableWindows = 0;
    state.weakWindows = 0;
    state.severeWindows = 0;

    syncVariables();
    scheduleCanvasRefresh();
    notify(reason);
    return true;
  }

  function lowerQuality(reason = "adaptive") {
    const i = qIndex(state.quality);
    if (i <= 0) return false;
    return setQuality(QUALITY[i - 1], reason);
  }

  function raiseQuality(reason = "adaptive") {
    const i = qIndex(state.quality);
    const baseI = qIndex(state.baseQuality);

    // Never auto-promote beyond detected device capability.
    if (i >= baseI || i >= QUALITY.length - 1) return false;
    return setQuality(QUALITY[i + 1], reason);
  }

  function setInteractionMode(active) {
    if (state.interactionMode === active) return;
    state.interactionMode = active;
    syncVariables();
    notify(active ? "interaction-start" : "interaction-end");
  }

  let interactionTimer = 0;

  function markInteraction() {
    state.lastInteractionAt = performance.now();

    if (!state.interactionMode) setInteractionMode(true);

    clearTimeout(interactionTimer);
    interactionTimer = setTimeout(() => {
      setInteractionMode(false);
    }, 650);
  }

  function installInteractionGovernor() {
    const opts = { passive: true };

    window.addEventListener("pointerdown", markInteraction, opts);
    window.addEventListener("touchstart", markInteraction, opts);
    window.addEventListener("wheel", markInteraction, opts);
    window.addEventListener("scroll", markInteraction, opts);

    window.addEventListener("keydown", () => {
      markInteraction();
    }, { passive: true });
  }

  function shouldManageCanvas(canvas) {
    return (
      canvas.matches("canvas[data-sora-auto-scale]") ||
      canvas.id === "bgFlowCanvas"
    );
  }

  function discoverCanvases(root = document) {
    if (root instanceof HTMLCanvasElement && shouldManageCanvas(root)) {
      state.managedCanvases.add(root);
    }

    if (root.querySelectorAll) {
      root.querySelectorAll("canvas[data-sora-auto-scale], #bgFlowCanvas")
        .forEach((canvas) => state.managedCanvases.add(canvas));
    }
  }

  /*
   * Safe auto-scaling:
   * We only resize a canvas if it is explicitly opt-in or is #bgFlowCanvas.
   * A "sora:canvasresize" event is fired after resize so a WebGL renderer can
   * call gl.viewport(...) if needed.
   */
  function resizeManagedCanvas(canvas) {
    if (!canvas.isConnected) {
      state.managedCanvases.delete(canvas);
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2) return;

    const p = currentPreset();
    const dpr = Math.min(device.dpr, p.dprCap);
    const scale = state.renderScale;

    let w = Math.max(2, Math.round(rect.width * dpr * scale));
    let h = Math.max(2, Math.round(rect.height * dpr * scale));

    const pixels = w * h;
    if (pixels > p.maxCanvasPixels) {
      const correction = Math.sqrt(p.maxCanvasPixels / pixels);
      w = Math.max(2, Math.round(w * correction));
      h = Math.max(2, Math.round(h * correction));
    }

    const meta = state.canvasMeta.get(canvas) || { width: 0, height: 0 };

    // Ignore tiny changes to avoid clearing the drawing buffer too often.
    if (Math.abs(meta.width - w) < 12 && Math.abs(meta.height - h) < 12) return;

    canvas.width = w;
    canvas.height = h;

    state.canvasMeta.set(canvas, { width: w, height: h });

    canvas.dispatchEvent(new CustomEvent("sora:canvasresize", {
      detail: {
        width: w,
        height: h,
        renderScale: state.renderScale,
        quality: state.quality
      }
    }));
  }

  let canvasRefreshTimer = 0;

  function scheduleCanvasRefresh() {
    clearTimeout(canvasRefreshTimer);

    canvasRefreshTimer = setTimeout(() => {
      discoverCanvases();
      state.managedCanvases.forEach(resizeManagedCanvas);
    }, 140);
  }

  function installCanvasObserver() {
    discoverCanvases();

    if ("ResizeObserver" in window) {
      state.resizeObserver = new ResizeObserver(() => scheduleCanvasRefresh());

      state.managedCanvases.forEach((canvas) => {
        state.resizeObserver.observe(canvas);
      });
    }

    window.addEventListener("resize", scheduleCanvasRefresh, { passive: true });
    window.addEventListener("orientationchange", scheduleCanvasRefresh, { passive: true });
  }

  function optimizeImage(img) {
    if (!(img instanceof HTMLImageElement)) return;

    if (!img.hasAttribute("decoding")) img.decoding = "async";

    const viewportH = Math.max(window.innerHeight, 1);
    const rect = img.getBoundingClientRect();

    // Do not lazy-load important/above-the-fold imagery.
    if (
      rect.top > viewportH * 1.25 &&
      !img.hasAttribute("loading") &&
      img.getAttribute("fetchpriority") !== "high"
    ) {
      img.loading = "lazy";
    }
  }

  function optimizeMedia(root = document) {
    if (root instanceof HTMLImageElement) optimizeImage(root);

    if (root.querySelectorAll) {
      root.querySelectorAll("img").forEach(optimizeImage);
    }
  }

  function installAmbientObserver() {
    if (!("IntersectionObserver" in window)) return;

    const observedAmbient = new WeakSet();

    state.ambientObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          entry.target.dataset.soraVisible = entry.isIntersecting ? "1" : "0";
        }
      },
      {
        rootMargin: "180px 0px",
        threshold: 0.01
      }
    );

    function observe(root = document) {
      const nodes = [];

      if (root instanceof Element && root.matches("[data-sora-ambient]")) {
        nodes.push(root);
      }

      if (root.querySelectorAll) {
        root.querySelectorAll("[data-sora-ambient]").forEach((el) => nodes.push(el));
      }

      for (const el of nodes) {
        if (!observedAmbient.has(el)) {
          observedAmbient.add(el);
          state.ambientObserver.observe(el);
        }
      }
    }

    observe();

    window.__soraObserveAmbient = observe;
  }

  function installAmbientVideoObserver() {
    if (!("IntersectionObserver" in window)) return;

    const observedVideos = new WeakSet();

    state.videoObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const video = entry.target;

          if (entry.isIntersecting && !state.hidden) {
            if (video.dataset.soraWasPlaying === "1") {
              video.play().catch(() => {});
            }
          } else {
            if (!video.paused) {
              video.dataset.soraWasPlaying = "1";
              video.pause();
            }
          }
        }
      },
      {
        rootMargin: "120px 0px",
        threshold: 0.01
      }
    );

    function observe(root = document) {
      const videos = [];

      if (root instanceof HTMLVideoElement && root.hasAttribute("data-sora-ambient-video")) {
        videos.push(root);
      }

      if (root.querySelectorAll) {
        root.querySelectorAll("video[data-sora-ambient-video]").forEach((v) => videos.push(v));
      }

      for (const video of videos) {
        if (!observedVideos.has(video)) {
          observedVideos.add(video);
          state.videoObserver.observe(video);
        }
      }
    }

    observe();
    window.__soraObserveVideos = observe;
  }

  function installMutationOptimizer() {
    state.mutationObserver = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;

          optimizeMedia(node);
          discoverCanvases(node);

          window.__soraObserveAmbient?.(node);
          window.__soraObserveVideos?.(node);
        }
      }

      if (!state.hidden) scheduleCanvasRefresh();
    });

    state.mutationObserver.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  function installVisibilityLifecycle() {
    function syncVisibility() {
      state.hidden = document.hidden;

      document.documentElement.classList.toggle(
        "sora-page-hidden",
        state.hidden
      );

      if (!state.hidden) {
        // Short grace period avoids a heavy burst on tab restore.
        setTimeout(() => {
          state.sample.length = 0;
          scheduleCanvasRefresh();
          notify("visible");
        }, 120);
      } else {
        notify("hidden");
      }
    }

    document.addEventListener("visibilitychange", syncVisibility, { passive: true });

    // Page Lifecycle API where available.
    window.addEventListener("freeze", () => {
      state.frozen = true;
      notify("freeze");
    }, { passive: true });

    window.addEventListener("resume", () => {
      state.frozen = false;
      state.sample.length = 0;
      scheduleCanvasRefresh();
      notify("resume");
    }, { passive: true });

    syncVisibility();
  }

  function installLongTaskPressure() {
    if (!("PerformanceObserver" in window)) return;

    try {
      const po = new PerformanceObserver((list) => {
        let extra = 0;

        for (const entry of list.getEntries()) {
          if (entry.duration >= 120) extra += 2;
          else if (entry.duration >= 50) extra += 1;
        }

        if (!extra) return;

        state.longTaskScore += extra;
        state.pressureScore = clamp(state.pressureScore + extra, 0, 10);

        if (state.longTaskScore >= 4) {
          lowerQuality("long-task");
          state.longTaskScore = 0;
        }
      });

      po.observe({ type: "longtask", buffered: true });
    } catch (_) {}
  }

  function installBatteryAwareness() {
    if (!navigator.getBattery) return;

    navigator.getBattery().then((battery) => {
      const evaluate = () => {
        if (!battery.charging && battery.level <= 0.15) {
          state.pressureScore = Math.max(state.pressureScore, 5);
          lowerQuality("low-battery");
        }
      };

      battery.addEventListener("levelchange", evaluate);
      battery.addEventListener("chargingchange", evaluate);
      evaluate();
    }).catch(() => {});
  }

  function installConnectionAwareness() {
    const c = navigator.connection;
    if (!c?.addEventListener) return;

    c.addEventListener("change", () => {
      device.saveData = !!c.saveData;
      device.connection = c.effectiveType || "unknown";

      if (device.saveData) lowerQuality("save-data");
    });
  }

  function percentile95(values) {
    if (!values.length) return FRAME_BUDGET;

    const copy = values.slice().sort((a, b) => a - b);
    const index = Math.min(
      copy.length - 1,
      Math.floor(copy.length * 0.95)
    );

    return copy[index];
  }

  function evaluatePerformance(sampleDuration, frames, frameSum) {
    if (!frames || sampleDuration <= 0) return;

    const fps = frames * 1000 / sampleDuration;
    const avg = frameSum / frames;
    const p95 = percentile95(state.sample);

    state.fps = Math.round(fps * 10) / 10;
    state.frameTime = Math.round(avg * 100) / 100;
    state.p95Frame = Math.round(p95 * 100) / 100;
    state.emaFps = state.emaFps * 0.72 + fps * 0.28;

    document.documentElement.style.setProperty(
      "--sora-live-fps",
      state.fps.toFixed(1)
    );

    /*
     * Three bands:
     * severe: visibly dropping frames -> react quickly
     * weak: below smooth 60 target -> react after 2 windows
     * stable: near 60 with headroom -> slowly restore quality
     */
    const severe = fps < 44 || p95 > 29;
    const weak = fps < 53.5 || p95 > 21.5;
    const stable = fps >= 58.0 && p95 <= 18.5;

    if (severe) {
      state.severeWindows++;
      state.weakWindows++;
      state.stableWindows = 0;
      state.pressureScore = clamp(state.pressureScore + 2, 0, 10);
    } else if (weak) {
      state.weakWindows++;
      state.severeWindows = 0;
      state.stableWindows = 0;
      state.pressureScore = clamp(state.pressureScore + 1, 0, 10);
    } else if (stable) {
      state.stableWindows++;
      state.weakWindows = 0;
      state.severeWindows = 0;
      state.pressureScore = clamp(state.pressureScore - 1, 0, 10);
    } else {
      state.weakWindows = Math.max(0, state.weakWindows - 1);
      state.stableWindows = Math.max(0, state.stableWindows - 1);
      state.severeWindows = 0;
    }

    if (state.severeWindows >= 1) {
      lowerQuality("severe-fps-drop");
    } else if (state.weakWindows >= 2) {
      lowerQuality("fps-protection");
    } else if (
      state.stableWindows >= 6 &&
      state.pressureScore === 0 &&
      !device.saveData &&
      !state.interactionMode
    ) {
      raiseQuality("stable-headroom");
    }

    syncVariables();
  }

  function startFpsGovernor() {
    let last = performance.now();
    let sampleStart = last;
    let frameCount = 0;
    let frameSum = 0;

    function frame(now) {
      state.rafId = requestAnimationFrame(frame);

      if (state.hidden || state.frozen) {
        last = now;
        sampleStart = now;
        frameCount = 0;
        frameSum = 0;
        state.sample.length = 0;
        return;
      }

      const dt = clamp(now - last, 0, 100);
      last = now;

      if (dt > 0) {
        frameCount++;
        frameSum += dt;

        state.sample.push(dt);
        if (state.sample.length > 120) state.sample.shift();
      }

      const elapsed = now - sampleStart;

      if (elapsed >= 1200) {
        evaluatePerformance(elapsed, frameCount, frameSum);

        sampleStart = now;
        frameCount = 0;
        frameSum = 0;
      }
    }

    state.rafId = requestAnimationFrame(frame);
  }

  /*
   * requestIdleCallback wrapper:
   * moves non-urgent work outside animation-critical frames.
   */
  function idle(task, timeout = 1000) {
    if (typeof task !== "function") return 0;

    if ("requestIdleCallback" in window) {
      return requestIdleCallback(task, { timeout });
    }

    return setTimeout(() => {
      task({
        didTimeout: false,
        timeRemaining: () => 0
      });
    }, 32);
  }

  /*
   * Optimized animation loop helper.
   * The callback always receives current adaptive quality state.
   * Page-hidden/frozen work is skipped automatically.
   */
  function createLoop(callback) {
    if (typeof callback !== "function") {
      return { start() {}, stop() {} };
    }

    let running = false;
    let id = 0;
    let last = performance.now();

    const tick = (now) => {
      if (!running) return;

      id = requestAnimationFrame(tick);

      if (state.hidden || state.frozen) {
        last = now;
        return;
      }

      const dt = Math.min(64, now - last);
      last = now;

      callback({
        now,
        dt,
        targetFPS: TARGET_FPS,
        quality: state.quality,
        renderScale: state.renderScale,
        interactionMode: state.interactionMode,
        pressureScore: state.pressureScore
      });
    };

    return {
      start() {
        if (running) return;
        running = true;
        last = performance.now();
        id = requestAnimationFrame(tick);
      },

      stop() {
        running = false;
        if (id) cancelAnimationFrame(id);
        id = 0;
      }
    };
  }

  function registerRenderer(name, callback) {
    if (typeof name !== "string" || typeof callback !== "function") {
      return () => {};
    }

    state.callbacks.set(name, callback);

    try {
      callback(payload("register"));
    } catch (err) {
      console.warn("[SoraPerformance:X2] renderer callback failed:", err);
    }

    return () => {
      state.callbacks.delete(name);
    };
  }

  function activateAnimationLayer(element, duration = 900) {
    if (!(element instanceof Element)) return;

    element.dataset.soraActive = "1";

    clearTimeout(element.__soraLayerTimer);

    element.__soraLayerTimer = setTimeout(() => {
      element.dataset.soraActive = "0";
    }, duration);
  }

  function snapshot() {
    return {
      version: VERSION,
      targetFPS: TARGET_FPS,
      fps: state.fps,
      emaFps: Math.round(state.emaFps * 10) / 10,
      frameTime: state.frameTime,
      p95Frame: state.p95Frame,
      quality: state.quality,
      baseQuality: state.baseQuality,
      renderScale: state.renderScale,
      interactionMode: state.interactionMode,
      pressureScore: state.pressureScore,
      device: { ...device }
    };
  }

  function boot() {
    if (state.started) return;
    state.started = true;

    state.quality = bootQuality();

    injectCSS();
    syncVariables();

    installVisibilityLifecycle();
    installInteractionGovernor();
    installAmbientObserver();
    installAmbientVideoObserver();
    installCanvasObserver();
    installMutationOptimizer();
    installLongTaskPressure();
    installConnectionAwareness();
    installBatteryAwareness();

    idle(() => optimizeMedia(), 500);

    /*
     * Initial page-join strategy:
     * 1. Start slightly cheaper.
     * 2. Let critical layout/fonts/images settle.
     * 3. FPS governor restores visual quality only if the device has headroom.
     */
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scheduleCanvasRefresh();
        notify("boot");
      });
    });

    // Let the page settle before allowing auto-upgrades.
    setTimeout(() => {
      if (
        state.quality !== state.baseQuality &&
        state.fps >= 58 &&
        state.pressureScore === 0
      ) {
        raiseQuality("post-load-headroom");
      }
    }, 5200);

    startFpsGovernor();
  }

  window.SoraPerformance = Object.freeze({
    version: VERSION,
    targetFPS: TARGET_FPS,

    get fps() {
      return state.fps;
    },

    get quality() {
      return state.quality;
    },

    get renderScale() {
      return state.renderScale;
    },

    get pressureScore() {
      return state.pressureScore;
    },

    registerRenderer,
    createLoop,
    idle,
    activateAnimationLayer,

    setQuality(name) {
      return setQuality(name, "manual", true);
    },

    lowerQuality() {
      return lowerQuality("manual");
    },

    raiseQuality() {
      return raiseQuality("manual");
    },

    refresh() {
      optimizeMedia();
      discoverCanvases();
      scheduleCanvasRefresh();
      syncVariables();
      notify("manual-refresh");
    },

    snapshot
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
