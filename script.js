const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const orbitStage = document.querySelector('[data-card-wheel]');
const orbitCards = [...document.querySelectorAll('.orbit-card')];
const orbitPrev = document.querySelector('.orbit-prev');
const orbitNext = document.querySelector('.orbit-next');
const orbitCount = document.querySelector('.orbit-count');
const orbitMobile = window.matchMedia('(max-width: 760px)');
let orbitIndex = 0;
let orbitScrollFrame = 0;

function circularOffset(cardIndex, activeIndex, length) {
  let offset = cardIndex - activeIndex;
  const half = Math.floor(length / 2);
  if (offset > half) offset -= length;
  if (offset < -half) offset += length;
  return offset;
}

function scrollOrbitCardIntoView(cardIndex, behavior = 'smooth') {
  if (!orbitStage || !orbitMobile.matches) return;
  const card = orbitCards[cardIndex];
  const left = card.offsetLeft - (orbitStage.clientWidth - card.offsetWidth) / 2;
  orbitStage.scrollTo({ left, behavior: reduceMotion.matches ? 'auto' : behavior });
}

function setOrbit(nextIndex, scroll = false) {
  if (!orbitCards.length) return;
  orbitIndex = (nextIndex + orbitCards.length) % orbitCards.length;
  orbitCards.forEach((card, cardIndex) => {
    const offset = circularOffset(cardIndex, orbitIndex, orbitCards.length);
    const depth = Math.min(Math.abs(offset), 3);
    card.style.setProperty('--offset', offset);
    card.style.setProperty('--depth', depth);
    card.style.setProperty('--layer', 10 - depth);
    card.classList.toggle('is-active', cardIndex === orbitIndex);
    card.setAttribute('aria-current', cardIndex === orbitIndex ? 'true' : 'false');
  });
  if (orbitCount) orbitCount.textContent = `${String(orbitIndex + 1).padStart(2, '0')} / ${String(orbitCards.length).padStart(2, '0')}`;
  if (scroll) scrollOrbitCardIntoView(orbitIndex);
}

function moveOrbit(step) { setOrbit(orbitIndex + step, true); }

if (orbitStage && orbitCards.length) {
  orbitPrev?.addEventListener('click', () => moveOrbit(-1));
  orbitNext?.addEventListener('click', () => moveOrbit(1));
  orbitStage.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); moveOrbit(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); moveOrbit(1); }
  });
  orbitCards.forEach((card, cardIndex) => {
    card.addEventListener('focusin', () => setOrbit(cardIndex, orbitMobile.matches));
    card.addEventListener('pointerenter', () => {
      if (window.matchMedia('(min-width: 761px)').matches) setOrbit(cardIndex);
    });
  });
  orbitStage.addEventListener('scroll', () => {
    if (!orbitMobile.matches) return;
    cancelAnimationFrame(orbitScrollFrame);
    orbitScrollFrame = requestAnimationFrame(() => {
      const stageCenter = orbitStage.scrollLeft + orbitStage.clientWidth / 2;
      let closestIndex = orbitIndex;
      let closestDistance = Infinity;
      orbitCards.forEach((card, cardIndex) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - stageCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = cardIndex;
        }
      });
      if (closestIndex !== orbitIndex) setOrbit(closestIndex);
    });
  }, { passive: true });
  orbitMobile.addEventListener('change', event => {
    if (event.matches) requestAnimationFrame(() => scrollOrbitCardIntoView(orbitIndex, 'auto'));
    else orbitStage.scrollLeft = 0;
  });
  setOrbit(0);
}

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

const mediaList = document.getElementById('mediaList');
const mediaSheetUrl = 'https://docs.google.com/spreadsheets/d/1VJgPLSTKU752g4j9_PXB-sji7XwLDwqwxiMGPQvQ9jk/gviz/tq?tqx=out:csv';

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') { value += '"'; i++; }
      else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') { row.push(value); value = ''; }
    else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') value += char;
  }
  row.push(value);
  rows.push(row);
  return rows.filter(items => items.some(item => item.trim()));
}

function pick(row, names) {
  for (const name of names) {
    const value = row[name];
    if (value) return value.trim();
  }
  return '';
}

function normalizeMediaRows(rows) {
  const headers = rows.shift()?.map(header => header.trim()) || [];
  return rows.map(values => {
    const row = {};
    headers.forEach((header, index) => { row[header] = values[index] || ''; });
    return {
      date: pick(row, ['日付', '掲載日', '公開日', 'Date', 'Date / 掲載日']),
      source: pick(row, ['媒体', 'メディア', '掲載媒体', 'Media', 'Media / 媒体']),
      title: pick(row, ['タイトル', '記事名', '見出し', '掲載内容', 'Topic / 掲載内容', 'Title', 'Topic']),
      url: pick(row, ['URL', 'リンク', 'Link']),
      description: pick(row, ['概要', '説明', '内容', 'Description'])
    };
  }).filter(item => item.title || item.source || item.description);
}

function renderMediaItems(items) {
  if (!mediaList) return;
  if (!items.length) {
    mediaList.innerHTML = '<p class="media-status">掲載情報は準備中です。</p>';
    return;
  }
  mediaList.replaceChildren(...items.map(item => {
    const article = document.createElement('article');
    article.className = 'media-item';
    const meta = document.createElement('div');
    if (item.date) {
      const time = document.createElement('time');
      time.textContent = item.date;
      meta.appendChild(time);
    }
    if (item.source) {
      const source = document.createElement('span');
      source.className = 'media-source';
      source.textContent = item.source;
      meta.appendChild(source);
    }
    const title = document.createElement('h3');
    if (item.url) {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = item.title || item.url;
      title.appendChild(link);
    } else title.textContent = item.title || item.source;
    article.append(meta, title);
    if (item.description) {
      const description = document.createElement('p');
      description.textContent = item.description;
      article.appendChild(description);
    }
    return article;
  }));
}

async function loadMediaItems() {
  if (!mediaList) return;
  try {
    const response = await fetch(mediaSheetUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = parseCsv(await response.text());
    renderMediaItems(normalizeMediaRows(rows));
  } catch (_) {
    mediaList.innerHTML = '<p class="media-status">掲載情報を読み込めませんでした。</p>';
  }
}

loadMediaItems();
