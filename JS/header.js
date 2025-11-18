document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('navLinks');

  if (!toggle || !navLinks) return;

  function closeMenu() {
    toggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('open');
    navLinks.classList.add('closed');
  }

  function openMenu() {
    toggle.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('open');
    navLinks.classList.remove('closed');
  }

  toggle.addEventListener('click', (e) => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
    e.stopPropagation();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      toggle.focus();
    }
  });

  // Click outside closes the menu
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!navLinks.contains(target) && !toggle.contains(target)) {
      // only close if menu is open
      if (toggle.getAttribute('aria-expanded') === 'true') closeMenu();
    }
  }, { capture: true });

  // Keep menu state in sync on resize (desktop vs mobile)
  window.addEventListener('resize', () => {
    if (window.innerWidth > 700) {
      // ensure menu visible on desktop and reset attributes
      navLinks.classList.remove('open');
      navLinks.classList.remove('closed');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      // ensure closed by default on small screens
      navLinks.classList.add('closed');
      navLinks.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Initialize state
  if (window.innerWidth <= 700) {
    navLinks.classList.add('closed');
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  } else {
    navLinks.classList.remove('closed');
    navLinks.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
});
