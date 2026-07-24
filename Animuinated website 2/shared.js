/* ══════════════════════════════════════════════
   CODE CRAFT - Shared Cursor & Hover Logic
   ══════════════════════════════════════════════ */

(function () {
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');
  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    ringX += (mouseX - ringX) * 0.08;
    ringY += (mouseY - ringY) * 0.08;

    if (dot) {
      dot.style.left = `${dotX}px`;
      dot.style.top = `${dotY}px`;
    }
    if (ring) {
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
    }

    requestAnimationFrame(animateCursor);
  }
  requestAnimationFrame(animateCursor);

  // Hover scale cursors
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    if (
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('.portfolio-card') ||
      target.closest('.auth-tabs') ||
      target.closest('.file-input-label')
    ) {
      document.body.classList.add('hover-interactive');
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target;
    if (
      target.tagName === 'A' ||
      target.tagName === 'BUTTON' ||
      target.closest('a') ||
      target.closest('button') ||
      target.closest('.portfolio-card') ||
      target.closest('.auth-tabs') ||
      target.closest('.file-input-label')
    ) {
      document.body.classList.remove('hover-interactive');
    }
  });

  // Navbar scroll state
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });
})();
