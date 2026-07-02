const slider = document.querySelector('.slider');
const viewport = document.querySelector('.slider-viewport');
const track = document.querySelector('.slides');
const realSlides = [...document.querySelectorAll('.slide')];
const prevButton = document.querySelector('.prev');
const nextButton = document.querySelector('.next');
const dotsWrap = document.querySelector('.slider-dots');
const number = document.querySelector('.slide-number');
const autoplayButton = document.querySelector('.autoplay-toggle');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const firstClone = realSlides[0].cloneNode(true);
const lastClone = realSlides.at(-1).cloneNode(true);
firstClone.setAttribute('aria-hidden', 'true');
lastClone.setAttribute('aria-hidden', 'true');
track.prepend(lastClone);
track.append(firstClone);
const allSlides = [...track.children];
let index = 1;
let timer = null;
let pausedByUser = false;
let interacting = false;

realSlides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `${i + 1}枚目の写真を表示`);
  dot.addEventListener('click', () => goTo(i + 1));
  dotsWrap.appendChild(dot);
});
const dots = [...dotsWrap.children];

function stepSize() {
  const gap = parseFloat(getComputedStyle(track).gap) || 0;
  return allSlides[0].getBoundingClientRect().width + gap;
}
function setPosition(animate = true) {
  track.style.transition = animate && !reduceMotion.matches ? '' : 'none';
  track.style.transform = `translateX(${-index * stepSize()}px)`;
  const realIndex = (index - 1 + realSlides.length) % realSlides.length;
  allSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  dots.forEach((dot, i) => {
    const active = i === realIndex;
    dot.classList.toggle('active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
  number.textContent = `${String(realIndex + 1).padStart(2, '0')} / ${String(realSlides.length).padStart(2, '0')}`;
}
function goTo(nextIndex) {
  index = nextIndex;
  setPosition(true);
  restartAutoplay();
}
function move(step) { goTo(index + step); }
track.addEventListener('transitionend', () => {
  if (index === 0) { index = realSlides.length; setPosition(false); }
  if (index === realSlides.length + 1) { index = 1; setPosition(false); }
});
prevButton.addEventListener('click', () => move(-1));
nextButton.addEventListener('click', () => move(1));
viewport.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1); }
  if (e.key === 'ArrowRight') { e.preventDefault(); move(1); }
});

let startX = 0;
viewport.addEventListener('pointerdown', e => { startX = e.clientX; interacting = true; stopAutoplay(); });
viewport.addEventListener('pointerup', e => {
  const delta = e.clientX - startX;
  interacting = false;
  if (Math.abs(delta) > 45) move(delta > 0 ? -1 : 1); else restartAutoplay();
});
viewport.addEventListener('pointercancel', () => { interacting = false; restartAutoplay(); });
slider.addEventListener('mouseenter', stopAutoplay);
slider.addEventListener('mouseleave', restartAutoplay);
slider.addEventListener('focusin', stopAutoplay);
slider.addEventListener('focusout', restartAutoplay);
document.addEventListener('visibilitychange', () => document.hidden ? stopAutoplay() : restartAutoplay());

function stopAutoplay() { clearInterval(timer); timer = null; }
function restartAutoplay() {
  stopAutoplay();
  if (!pausedByUser && !interacting && !document.hidden && !reduceMotion.matches) timer = setInterval(() => move(1), 4500);
}
autoplayButton.addEventListener('click', () => {
  pausedByUser = !pausedByUser;
  autoplayButton.setAttribute('aria-pressed', String(pausedByUser));
  autoplayButton.textContent = pausedByUser ? '再生する' : '一時停止';
  restartAutoplay();
});
reduceMotion.addEventListener('change', restartAutoplay);
window.addEventListener('resize', () => setPosition(false));
setPosition(false);
restartAutoplay();

const menuToggle = document.getElementById('menuToggle');
const siteMenu = document.getElementById('siteMenu');
const menuScrim = document.getElementById('menuScrim');
let menuReturnFocus = null;
function focusableWithin(container) { return [...container.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])')]; }
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
siteMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
siteMenu.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const items = focusableWithin(siteMenu);
  const first = items[0], last = items.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

const modal = document.getElementById('modal');
const videoButton = document.getElementById('videoButton');
const modalClose = document.getElementById('modalClose');
const featureVideo = document.getElementById('featureVideo');
let modalReturnFocus = null;
function openModal() {
  modalReturnFocus = document.activeElement;
  modal.hidden = false;
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('menu-open');
  modalClose.focus();
}
function closeModal() {
  featureVideo.pause();
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('menu-open');
  setTimeout(() => { modal.hidden = true; modalReturnFocus?.focus(); }, reduceMotion.matches ? 0 : 200);
}
videoButton.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
modal.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  const items = focusableWithin(modal);
  const first = items[0], last = items.at(-1);
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    if (!modal.hidden) closeModal();
    else if (siteMenu.classList.contains('open')) setMenu(false);
  }
});
