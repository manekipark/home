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
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') value += char;
  }
  row.push(value);
  if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}

function pick(row, keys) {
  for (const key of keys) {
    const value = row[key]?.trim();
    if (value) return value;
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
      link.rel = 'noopener noreferrer';
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
