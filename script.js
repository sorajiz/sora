/**
 * SORA PROFILE - INTERACTIVE JAVASCRIPT
 * Handles animations, smooth navigation, copy toast, and parallax
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Elements Cache
  const header = document.getElementById('header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section.section');
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');
  const btnCopyEmail = document.getElementById('btnCopyEmail');
  const emailAddress = document.getElementById('emailAddress');
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const liveClock = document.getElementById('liveClock');
  const bgWrapper = document.getElementById('bgWrapper');

  // 3. Header Scroll Effect
  const handleScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Active Section Detection (ScrollSpy for 4 Tabs: Home, Intro, Skills, Contact)
    let currentSection = 'home';
    const scrollPosition = window.scrollY + 180;

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      if (link.getAttribute('data-section') === currentSection) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // 4. Smooth Nav Link Click
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          const offsetTop = targetElement.offsetTop - 70;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      }
      // Close mobile menu if open
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  });

  // 5. Mobile Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target) && navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  }

  // 6. Interactive Silk Wave Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    const { innerWidth, innerHeight } = window;
    // Normalized between -1 and 1
    mouseX = (e.clientX / innerWidth - 0.5) * 40; // Max 40px shift
    mouseY = (e.clientY / innerHeight - 0.5) * 30; // Max 30px shift
  });

  const animateParallax = () => {
    // Smooth lerp (linear interpolation)
    currentX += (mouseX - currentX) * 0.05;
    currentY += (mouseY - currentY) * 0.05;

    if (bgWrapper) {
      bgWrapper.style.setProperty('--parallax-x', `${currentX.toFixed(2)}px`);
      bgWrapper.style.setProperty('--parallax-y', `${currentY.toFixed(2)}px`);
    }

    requestAnimationFrame(animateParallax);
  };
  animateParallax();

  // 7. Copy Email Address to Clipboard
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
        // Fallback
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

  // 8. Contact Form Interaction
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
      }, 700);
    });
  }

  // 9. Toast Notification System
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

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

  // 10. Live UTC Clock
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
