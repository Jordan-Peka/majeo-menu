const menuToggle = document.querySelector('.menu-toggle');
const topbar = document.querySelector('.topbar');
const navLinks = document.querySelector('.links');

if (menuToggle && topbar && navLinks) {
  const updateScrollProgress = () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0
      ? (window.scrollY / scrollableHeight) * 100
      : 0;
    topbar.style.setProperty('--scroll-progress', `${progress}%`);
  };

  const setMenuState = (isOpen) => {
    topbar.classList.toggle('menu-open', isOpen);
    navLinks.style.setProperty('opacity', isOpen ? '1' : '0', 'important');
    navLinks.style.setProperty('visibility', isOpen ? 'visible' : 'hidden', 'important');
    navLinks.style.setProperty('pointer-events', isOpen ? 'auto' : 'none', 'important');
    navLinks.style.setProperty('transform', isOpen ? 'translateY(0)' : 'translateY(-16px)', 'important');
    navLinks.style.setProperty('transition', 'none', 'important');
    document.body.classList.toggle('menu-open', isOpen);
    document.documentElement.classList.toggle('menu-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  };

  menuToggle.addEventListener('click', () => {
    setMenuState(!topbar.classList.contains('menu-open'));
  });

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();
}
