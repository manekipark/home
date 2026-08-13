const menuToggle = document.getElementById('menuToggle');
const siteMenu = document.getElementById('siteMenu');
const menuScrim = document.getElementById('menuScrim');

if (menuToggle && siteMenu && menuScrim) {
  let menuReturnFocus = null;
  const focusableWithin = container => [...container.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')];

  function setMenu(open) {
    if (open) menuReturnFocus = document.activeElement;
    menuToggle.classList.toggle('open', open);
    siteMenu.classList.toggle('open', open);
    menuScrim.hidden = !open;
    requestAnimationFrame(() => menuScrim.classList.toggle('open', open));
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
    siteMenu.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('menu-open', open);
    if (open) focusableWithin(siteMenu)[0]?.focus();
    else menuReturnFocus?.focus();
  }

  menuToggle.addEventListener('click', () => setMenu(!siteMenu.classList.contains('open')));
  menuScrim.addEventListener('click', () => setMenu(false));
  siteMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  siteMenu.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = focusableWithin(siteMenu);
    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && siteMenu.classList.contains('open')) setMenu(false);
  });
}
