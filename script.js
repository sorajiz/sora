/**
 * SORA - PURE GLASS INTERACTIVE LOGIC
 * Handles animations, mouse parallax, multi-page nav state, copy toast, and interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Elements Cache
  const navLinks = document.querySelectorAll('.nav-link');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const emailAddress = document.getElementById('emailAddress');
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const liveClock = document.getElementById('liveClock');
  const bgWrapper = document.getElementById('bgWrapper');

  // 3. Highlight Active Nav Link based on Current URL
  const currentPath = window.location.pathname;
  let activeFound = false;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;

    // Check match for root / index.html or other pages
    if (
      (currentPath.endsWith(href)) ||
      ((currentPath === '/' || currentPath.endsWith('/') || currentPath === '') && (href === 'index.html' || href === '/')) ||
      (currentPath.includes('intro') && href.includes('intro')) ||
      (currentPath.includes('skills') && href.includes('skills')) ||
      (currentPath.includes('contact') && href.includes('contact'))
    ) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      activeFound = true;
    }
  });

  // 4. Mobile Menu Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navMenu.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 5. Interactive Silk Wave Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    mouseX = (e.clientX / innerWidth - 0.5) * 45; // Max 45px shift
    mouseY = (e.clientY / innerHeight - 0.5) * 35; // Max 35px shift
  });

  const animateParallax = () => {
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    if (bgWrapper) {
      bgWrapper.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
      bgWrapper.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);
    }

    requestAnimationFrame(animateParallax);
  };
  animateParallax();

  // 6. Copy Email Address to Clipboard
  if (btnCopyEmail && emailAddress) {
    btnCopyEmail.addEventListener('click', async () => {
      const email = emailAddress.textContent.trim();
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email address copied to clipboard!');
        btnCopyEmail.innerHTML = '<i data-lucide="check"></i><span>Copied!</span>';
        if (window.lucide) window.lucide.createIcons();
        
        setTimeout(() => {
          btnCopyEmail.innerHTML = '<i data-lucide="copy"></i><span>Copy</span>';
          if (window.lucide) window.lucide.createIcons();
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

  // 7. Contact Form Interaction
  if (contactForm && formFeedback) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btnSubmitForm');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      setTimeout(() => {
        contactForm.style.display = 'none';
        formFeedback.classList.add('active');
        if (window.lucide) window.lucide.createIcons();
        showToast('✨ Message received! Thanks for reaching out.');
      }, 600);
    });
  }

  // 8. Toast Notification System
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
      <svg class="toast-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 400);
    }, 3200);
  }

  // 9. Live UTC Clock
  const updateClock = () => {
    if (!liveClock) return;
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    liveClock.textContent = `${hours}:${minutes}:${seconds} UTC`;
  };
  setInterval(updateClock, 1000);
  updateClock();
});
