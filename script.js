/* ═══════════════════════════════════════════════════════
   FALLOUT TERMINAL — PORTFOLIO SCRIPT
   ═══════════════════════════════════════════════════════ */

(() => {
  'use strict';

  // ── Elements ──
  const bootScreen  = document.getElementById('boot-screen');
  const bootText    = document.getElementById('boot-text');
  const terminal    = document.getElementById('terminal');
  const navItems    = document.querySelectorAll('.nav-item');
  const sections    = document.querySelectorAll('.section');
  const clock       = document.getElementById('terminal-clock');
  const footerStatus = document.getElementById('footer-status');
  const contactForm = document.getElementById('contact-form');
  const formStatus  = document.getElementById('form-status');

  // ── Audio ──
  const tabChangeAudio = document.getElementById('audio-tab-change');

  // ══════════════════════════════════════
  //  BOOT SEQUENCE
  // ══════════════════════════════════════

  const bootLines = [
    { text: '> ESTABLISHING NETWORK CONNECTION...',              delay: 20 },
    { text: '  ████████████████████████████████  100%',          delay: 10 },
    { text: '> CONNECTION ESTABLISHED',                          delay: 20 },
    { text: '',                                                   delay: 40 },
    { text: '> LOADING PERSONNEL DATABASE...',                   delay: 20 },
    { text: '  ████████████████████████████████  100%',          delay: 10 },
    { text: '> DATABASE LOADED SUCCESSFULLY',                    delay: 20 },
    { text: '',                                                   delay: 40 },
    { text: '> DECRYPTING SECURE FILES...',                      delay: 20 },
    { text: '> ENCRYPTION KEY: ██████████████',                  delay: 10 },
    { text: '> ACCESS GRANTED',                                  delay: 20 },
  
  ];

  let isBootSkipped = false;

  // Helper: fade out an audio element over a duration (ms)
  function fadeOutAudio(audio, duration = 800) {
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = audio.volume / steps;
    const fade = setInterval(() => {
      if (audio.volume - volumeStep <= 0) {
        audio.volume = 0;
        audio.pause();
        clearInterval(fade);
      } else {
        audio.volume -= volumeStep;
      }
    }, stepTime);
  }

  async function runBootSequence() {
    
    
    // Add skip listener
    const skipHandler = () => {
      isBootSkipped = true;
      bootScreen.removeEventListener('click', skipHandler);
    };
    bootScreen.addEventListener('click', skipHandler);

    for (const line of bootLines) {
      if (isBootSkipped) break;
      await typeLine(bootText, line.text, line.delay);
    }

    // Skip all remaining delays if skipped
    if (isBootSkipped) {
      bootScreen.classList.remove('fade-out'); // Just in case
      bootText.textContent = bootLines.map(l => l.text).join('\n'); // Show all text
      bootText.scrollTop = bootText.scrollHeight;
    }

    // Transition
    if (!isBootSkipped) {
      await sleep(200);
    }
    
    bootScreen.classList.add('fade-out');
    await sleep(isBootSkipped ? 0 : 600);
    bootScreen.style.display = 'none';
    terminal.classList.remove('hidden');
    
   

    // Cleanup skip listener
    bootScreen.removeEventListener('click', skipHandler);

    // Start stat bar animation after terminal is visible
    animateStatBars();
    startClock();
  }

  function typeLine(container, text, charDelay = 30) {
    return new Promise(resolve => {
      if (text === '') {
        container.textContent += '\n';
        setTimeout(resolve, charDelay);
        return;
      }

      let i = 0;
      const interval = setInterval(() => {
        if (isBootSkipped) {
          clearInterval(interval);
          resolve();
          return;
        }

        container.textContent += text[i];
        i++;
        if (i >= text.length) {
          container.textContent += '\n';
          clearInterval(interval);
          // Auto-scroll boot text
          container.scrollTop = container.scrollHeight;
          resolve();
        }
      }, charDelay);
    });
  }

  function sleep(ms) {
    return new Promise(resolve => {
      if (isBootSkipped) {
        resolve();
        return;
      }
      setTimeout(resolve, ms);
    });
  }

  // ══════════════════════════════════════
  //  NAVIGATION
  // ══════════════════════════════════════

  let currentSection = 'about';

  function navigateTo(sectionName) {
    if (sectionName === currentSection) return;

    // Play tab-change sound
    if (tabChangeAudio) {
      tabChangeAudio.currentTime = 0;
      tabChangeAudio.volume = 0.4;
      tabChangeAudio.play().catch(() => {});
    }

    // Flash effect
    const flash = document.createElement('div');
    flash.classList.add('loading-flash');
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 200);

    // Update nav
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionName);
    });

    // Update sections
    sections.forEach(sec => {
      const id = sec.id.replace('section-', '');
      sec.classList.toggle('active', id === sectionName);
    });

    currentSection = sectionName;

    // Update footer
    const labels = {
      about:    'VIEWING: PERSONAL FILE',
      stats:    'VIEWING: APTITUDE EVALUATION',
      projects: 'VIEWING: PROJECT DATABASE',
      contact:  'VIEWING: COMMUNICATIONS RELAY'
    };
    footerStatus.textContent = labels[sectionName] || 'STATUS: OPERATIONAL';

    // Animate stat bars when switching to stats
    if (sectionName === 'stats') {
      animateStatBars();
    }

    // Scroll content back to top
    document.querySelector('.terminal-content').scrollTop = 0;
  }

  // Click navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navigateTo(item.dataset.section);
    });
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    const keyMap = {
      '1': 'about',
      '2': 'stats',
      '3': 'projects',
      '4': 'contact'
    };

    // Don't capture keys if typing in a form field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (keyMap[e.key]) {
      navigateTo(keyMap[e.key]);
    }
  });

  // ══════════════════════════════════════
  //  STAT BAR ANIMATION
  // ══════════════════════════════════════

  function animateStatBars() {
    const fills = document.querySelectorAll('.stat-fill');
    // Reset then animate
    fills.forEach(fill => fill.classList.remove('animate'));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        fills.forEach((fill, i) => {
          setTimeout(() => fill.classList.add('animate'), i * 100);
        });
      });
    });
  }

  // ══════════════════════════════════════
  //  TERMINAL CLOCK
  // ══════════════════════════════════════

  function startClock() {
    function updateClock() {
      const now = new Date();
      clock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // ══════════════════════════════════════
  //  CONTACT FORM
  // ══════════════════════════════════════

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = document.getElementById('contact-submit');
      const name    = document.getElementById('contact-name').value.trim();
      const email   = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        formStatus.textContent = '> ERROR: ALL FIELDS REQUIRED';
        formStatus.style.color = 'var(--red)';
        return;
      }

      btn.textContent = '[TRANSMITTING...]';
      btn.disabled = true;
      formStatus.textContent = '';

      // Simulate transmission
      await sleep(1500);

      formStatus.textContent = '> TRANSMISSION SUCCESSFUL. MESSAGE LOGGED.';
      formStatus.style.color = 'var(--green)';
      btn.textContent = '[TRANSMITTED ✓]';

      // Reset after delay
      setTimeout(() => {
        contactForm.reset();
        btn.textContent = '[TRANSMIT]';
        btn.disabled = false;
        formStatus.textContent = '';
      }, 3000);
    });
  }

 


  // ══════════════════════════════════════
  //  INIT
  // ══════════════════════════════════════

  runBootSequence();

})();
