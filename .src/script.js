/**
 * SORA - PURE GLASS & LUMINOUS FLOW INTERACTION ENGINE
 * Zero-Flicker SPA Router, Continuous Luminous Flow Engine,
 * Ambient Music Player (Volume 45%), Stable Tactile Navigation,
 * and Dynamic Cursor Spotlight.
 */

function _initSora() {
  'use strict';

  // 1. Elements Cache
  const loaderPage = document.getElementById('page') || document.querySelector('.loader-container');
  const navLinks = document.querySelectorAll('.nav-minimal-link');
  const sections = document.querySelectorAll('.page-section');
  const bgWrapper = document.getElementById('bgWrapper');
  const bgAudio = document.getElementById('bgAudio');
  const musicToggleBtn = document.getElementById('musicToggleBtn');
  const equalizerBars = document.getElementById('equalizerBars');
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  let startAudioPlayback = null;

  // 1a. Entrance Loading Screen Handler
  function initLoadingScreen() {
    if (!loaderPage) return;

    let isDismissed = false;
    function dismiss() {
      if (isDismissed) return;
      isDismissed = true;
      loaderPage.classList.add('loaded');
      if (typeof startAudioPlayback === 'function') {
        startAudioPlayback();
      }
      setTimeout(() => {
        if (loaderPage.parentElement) {
          loaderPage.style.display = 'none';
        }
      }, 750);
    }

    loaderPage.addEventListener('click', () => {
      dismiss();
    });

    const minDisplay = 850;
    const start = Date.now();
    function scheduleDismiss() {
      const elapsed = Date.now() - start;
      const delay = Math.max(0, minDisplay - elapsed);
      setTimeout(dismiss, delay);
    }

    if (document.readyState === 'complete') {
      scheduleDismiss();
    } else {
      window.addEventListener('load', scheduleDismiss);
      setTimeout(dismiss, 2400);
    }
  }

  initLoadingScreen();

  // Route Mapping Table
  const ROUTE_MAP = {
    home: { path: '/', title: 'Sora' },
    intro: { path: '/intro', title: 'Sora' },
    skills: { path: '/skills', title: 'Sora' },
    contact: { path: '/contact', title: 'Sora' }
  };

  // 1b. Dynamic Typewriter Title Loop ("Sora" typing and backspacing)
  function initTitleTypewriter() {
    const word = 'Sora';
    let charIndex = 0;
    let isDeleting = false;

    function tickTitle() {
      if (isDeleting) {
        charIndex--;
        document.title = word.substring(0, charIndex) || '\u200E';
        if (charIndex <= 0) {
          isDeleting = false;
          setTimeout(tickTitle, 550);
          return;
        }
        setTimeout(tickTitle, 160);
      } else {
        charIndex++;
        document.title = word.substring(0, charIndex);
        if (charIndex >= word.length) {
          isDeleting = true;
          setTimeout(tickTitle, 1800);
          return;
        }
        setTimeout(tickTitle, 240);
      }
    }

    tickTitle();
  }

  initTitleTypewriter();

  // 2. Toast Notification System
  function showToast(message) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // 3. Dynamic Contact Actions Binder (Telegram, Discord, Community, Copy)
  function bindContactActions() {
    const linkCards = document.querySelectorAll('.contact-card-link[data-href]');
    linkCards.forEach((card) => {
      const href = card.getAttribute('data-href');
      if (!href) return;

      const newCard = card.cloneNode(true);
      card.parentNode.replaceChild(newCard, card);

      const openLink = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(href, '_blank', 'noopener,noreferrer');
      };

      newCard.addEventListener('click', openLink);
      newCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          openLink(e);
        }
      });
    });

    const copyBtns = document.querySelectorAll('.inline-copy-btn');
    copyBtns.forEach((btn) => {
      const copyVal = btn.getAttribute('data-copy');
      if (!copyVal) return;

      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const textToCopy = newBtn.getAttribute('data-copy');
        try {
          await navigator.clipboard.writeText(textToCopy);
          showToast(`Đã sao chép: ${textToCopy}`);
          const originalText = newBtn.textContent;
          newBtn.textContent = 'Copied!';
          setTimeout(() => {
            newBtn.textContent = originalText;
          }, 2200);
        } catch (err) {
          const textarea = document.createElement('textarea');
          textarea.value = textToCopy;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          showToast(`Đã sao chép: ${textToCopy}`);
        }
      });
    });

    initLiveClock();
  }

  // 3b. Real-Time Vietnam GMT+7 Clock Counter & Date (day - tháng - năm)
  let liveClockTimer = null;
  function initLiveClock() {
    const clockDigits = document.getElementById('liveClockDigits');
    const clockDate = document.getElementById('liveClockDate');
    if (!clockDigits && !clockDate) return;

    function tick() {
      try {
        const now = new Date();
        if (clockDigits) {
          const timeFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });
          clockDigits.textContent = timeFormatter.format(now);
        }
        if (clockDate) {
          const dateFormatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Ho_Chi_Minh',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          });
          clockDate.textContent = dateFormatter.format(now).replace(/\//g, ' - ');
        }
      } catch (e) {
        const now = new Date();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        const vnDate = new Date(utc + 3600000 * 7);
        const pad = (n) => String(n).padStart(2, '0');
        if (clockDigits) {
          clockDigits.textContent = `${pad(vnDate.getHours())}:${pad(vnDate.getMinutes())}:${pad(vnDate.getSeconds())}`;
        }
        if (clockDate) {
          clockDate.textContent = `${pad(vnDate.getDate())} - ${pad(vnDate.getMonth() + 1)} - ${vnDate.getFullYear()}`;
        }
      }
    }

    tick();
    if (!liveClockTimer) {
      liveClockTimer = setInterval(tick, 1000);
    }
  }

  // 4. Update Nav Link Active States
  function updateNavActiveState(activeRoute) {
    navLinks.forEach((link) => {
      const route = link.getAttribute('data-route');
      if (route === activeRoute) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      } else {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
      }
    });
  }

  // 5. Zero-Flicker In-Memory SPA Router
  let isNavigating = false;

  function switchPage(targetRoute, pushState = true) {
    if (!ROUTE_MAP[targetRoute] || isNavigating) return;

    const currentActive = document.querySelector('.page-section.active');
    const targetSection = document.getElementById(`page-${targetRoute}`);

    if (!targetSection || currentActive === targetSection) {
      updateNavActiveState(targetRoute);
      return;
    }

    isNavigating = true;
    updateNavActiveState(targetRoute);

    currentActive.classList.add('fading-out');

    setTimeout(() => {
      currentActive.classList.remove('active', 'fading-out');
      targetSection.classList.add('active');

      window.scrollTo({ top: 0, behavior: 'smooth' });

      const pageInfo = ROUTE_MAP[targetRoute];
      // document.title is continuously driven by initTitleTypewriter ('Sora' typewriter animation)

      if (pushState && pageInfo) {
        history.pushState({ route: targetRoute }, '', pageInfo.path);
      }

      bindContactActions();
      isNavigating = false;
    }, 140);
  }

  // Initial Route Resolver from Current URL
  function resolveInitialRoute() {
    const path = window.location.pathname.toLowerCase().replace(/^\//, '');
    if (path.includes('intro')) return 'intro';
    if (path.includes('skills')) return 'skills';
    if (path.includes('contact')) return 'contact';
    return 'home';
  }

  // Browser History Back/Forward (popstate)
  window.addEventListener('popstate', (e) => {
    const route = (e.state && e.state.route) ? e.state.route : resolveInitialRoute();
    switchPage(route, false);
  });

  // Attach Stable Router Click Handlers (NO jitter, NO position shaking)
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const route = link.getAttribute('data-route');
      if (route) {
        switchPage(route, true);
      }
    });
  });

  // 6. Ambient Music Player Engine (Autoplay on Entry, 45% Volume)
  if (bgAudio) {
    function ensureAudioSource() {
      if (!bgAudio.src || bgAudio.src === '' || bgAudio.src === window.location.href) {
        const audioSrc = bgAudio.getAttribute('data-src') || '/music/crush.mp3';
        bgAudio.src = audioSrc;
      }
    }

    function updateAudioUi(isPlaying) {
      if (equalizerBars) {
        if (isPlaying) {
          equalizerBars.classList.add('playing');
        } else {
          equalizerBars.classList.remove('playing');
        }
      }
      if (musicToggleBtn) {
        musicToggleBtn.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
      }
    }

    startAudioPlayback = function() {
      ensureAudioSource();
      bgAudio.volume = 0.45;
      const playPromise = bgAudio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          updateAudioUi(true);
        }).catch(() => {
          // Autoplay deferred by browser policy - unlock on first user gesture
          const unlock = () => {
            bgAudio.volume = 0.45;
            bgAudio.play().then(() => updateAudioUi(true)).catch(() => {});
            ['click', 'touchstart', 'keydown', 'scroll'].forEach((evt) => {
              window.removeEventListener(evt, unlock);
            });
          };
          ['click', 'touchstart', 'keydown', 'scroll'].forEach((evt) => {
            window.addEventListener(evt, unlock, { once: true, passive: true });
          });
        });
      }
    };

    // Attempt instant autoplay immediately on load
    startAudioPlayback();

    if (musicToggleBtn) {
      musicToggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        ensureAudioSource();
        if (bgAudio.paused) {
          bgAudio.volume = 0.45;
          bgAudio.play().then(() => {
            updateAudioUi(true);
          }).catch(() => {});
        } else {
          bgAudio.pause();
          updateAudioUi(false);
        }
      });
    }

    bgAudio.addEventListener('play', () => updateAudioUi(true));
    bgAudio.addEventListener('pause', () => updateAudioUi(false));
  }


  // 7. Interactive Luminous Flow Parallax (background layers move subtly with mouse)
  if (isFinePointer && bgWrapper) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 36;
      targetY = (e.clientY / innerHeight - 0.5) * 26;

      if (!rafId) {
        rafId = requestAnimationFrame(animateLoop);
      }
    }, { passive: true });

    const animateLoop = () => {
      const diffX = targetX - currentX;
      const diffY = targetY - currentY;
      currentX += diffX * 0.07;
      currentY += diffY * 0.07;

      bgWrapper.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
      bgWrapper.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);

      if (Math.abs(diffX) > 0.05 || Math.abs(diffY) > 0.05) {
        rafId = requestAnimationFrame(animateLoop);
      } else {
        rafId = null;
      }
    };
  }

  // Initialize Route & Contact actions
  const initialRoute = resolveInitialRoute();
  if (initialRoute !== 'home') {
    switchPage(initialRoute, false);
  } else {
    updateNavActiveState('home');
  }

  bindContactActions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _initSora);
} else {
  _initSora();
}
