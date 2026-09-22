/**
 * SORA - PURE GLASS & LUMINOUS FLOW INTERACTION ENGINE
 * Applies Impeccable motion choreography, magnetic floating islands,
 * dynamic cursor spotlight, and instant touch responsiveness.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elements Cache
  const navPills = document.querySelectorAll('.nav-pill');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const emailAddress = document.getElementById('emailAddress');
  const bgWrapper = document.getElementById('bgWrapper');
  const bgSpotlight = document.getElementById('bgSpotlight');

  // 2. Active Pill State Matching
  const currentPath = window.location.pathname;

  navPills.forEach((pill) => {
    const href = pill.getAttribute('href');
    if (!href) return;

    if (
      (currentPath.endsWith(href)) ||
      ((currentPath === '/' || currentPath.endsWith('/') || currentPath === '') && (href === 'index.html' || href === '/')) ||
      (currentPath.includes('intro') && href.includes('intro')) ||
      (currentPath.includes('skills') && href.includes('skills')) ||
      (currentPath.includes('contact') && href.includes('contact'))
    ) {
      navPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    }
  });

  // 3. Instant Tap & Touch Responsiveness ("Bấm ăn hơn")
  navPills.forEach((pill) => {
    pill.addEventListener('pointerdown', () => {
      pill.style.transform = 'scale(0.92)';
    }, { passive: true });

    const resetScale = () => {
      if (!pill.matches(':hover')) {
        pill.style.transform = '';
      }
    };

    pill.addEventListener('pointerup', resetScale, { passive: true });
    pill.addEventListener('pointercancel', resetScale, { passive: true });
    pill.addEventListener('pointerleave', resetScale, { passive: true });
  });

  // 4. Magnetic Floating Island Pills (Desktop Physics)
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (isFinePointer) {
    navPills.forEach((pill) => {
      pill.addEventListener('mousemove', (e) => {
        const rect = pill.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * 0.28;
        const deltaY = (e.clientY - centerY) * 0.28;

        pill.style.transform = `translate3d(${deltaX.toFixed(1)}px, ${deltaY.toFixed(1)}px, 0) scale(1.02)`;
      });

      pill.addEventListener('mouseleave', () => {
        pill.style.transform = '';
      });
    });
  }

  // 5. Interactive Luminous Flow Parallax & Cursor Spotlight
  if (isFinePointer && bgWrapper) {
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let cursorX = -500;
    let cursorY = -500;
    let spotCurrentX = -500;
    let spotCurrentY = -500;
    let rafId = null;

    window.addEventListener('mousemove', (e) => {
      document.body.classList.add('mouse-active');
      const { innerWidth, innerHeight } = window;
      targetX = (e.clientX / innerWidth - 0.5) * 40;
      targetY = (e.clientY / innerHeight - 0.5) * 30;
      cursorX = e.clientX;
      cursorY = e.clientY;

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

      // Smooth spotlight lerp
      spotCurrentX += (cursorX - spotCurrentX) * 0.12;
      spotCurrentY += (cursorY - spotCurrentY) * 0.12;
      document.documentElement.style.setProperty('--cursor-x', `${spotCurrentX.toFixed(1)}px`);
      document.documentElement.style.setProperty('--cursor-y', `${spotCurrentY.toFixed(1)}px`);

      if (Math.abs(diffX) > 0.05 || Math.abs(diffY) > 0.05 || Math.abs(cursorX - spotCurrentX) > 0.5) {
        rafId = requestAnimationFrame(animateLoop);
      } else {
        rafId = null;
      }
    };
  }

  // 6. Copy Email Address to Clipboard
  if (btnCopyEmail && emailAddress) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = emailAddress.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email address copied to clipboard!');
        btnCopyEmail.textContent = 'Copied!';
        
        setTimeout(() => {
          btnCopyEmail.textContent = 'Copy';
        }, 2500);
      } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Email address copied to clipboard!');
      }
    });
  }

  // 7. Toast Notification System
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
});
