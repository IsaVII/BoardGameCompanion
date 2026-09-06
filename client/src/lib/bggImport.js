// Parse a BoardGameGeek collection export into Game[] the app understands.
// Supports the CSV export (Collection → Export) and the XML API2 response.

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalize(raw) {
  return {
    title: raw.title?.trim() || 'Untitled',
    bggId: raw.bggId ? Number(raw.bggId) : null,
    minPlayers: num(raw.minPlayers, 1),
    maxPlayers: num(raw.maxPlayers, 4),
    minTime: num(raw.minTime, 30),
    maxTime: num(raw.maxTime, num(raw.minTime, 60)),
    weight: Math.min(5, Math.max(1, num(raw.weight, 2))),
    mood: 'strategy',
    condition: 'good',
    estimatedValue: 0,
    categories: [],
    thumbnail: raw.thumbnail || '',
    notes: '',
    acquiredAt: new Date().toISOString().slice(0, 10),
  };
}

export function parseBggCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map((h) => h.toLowerCase().trim());
  const idx = (name) => headers.indexOf(name);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    if (!cols.length) continue;
    const own = idx('own') >= 0 ? cols[idx('own')] : '1';
    if (own === '0') continue;
    rows.push(
      normalize({
        title: cols[idx('objectname')] ?? cols[idx('name')],
        bggId: cols[idx('objectid')],
        minPlayers: cols[idx('minplayers')],
        maxPlayers: cols[idx('maxplayers')],
        minTime: cols[idx('minplaytime')],
        maxTime: cols[idx('maxplaytime')],
        weight: cols[idx('avgweight')],
      }),
    );
  }
  return rows;
}

export function parseBggXml(text) {
  const doc = new DOMParser().parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) return [];
  return [...doc.querySelectorAll('item')]
    .filter((item) => item.querySelector('status')?.getAttribute('own') !== '0')
    .map((item) =>
      normalize({
        title: item.querySelector('name')?.textContent,
        bggId: item.getAttribute('objectid'),
        minPlayers: item.querySelector('stats')?.getAttribute('minplayers'),
        maxPlayers: item.querySelector('stats')?.getAttribute('maxplayers'),
        minTime: item.querySelector('stats')?.getAttribute('minplaytime'),
        maxTime: item.querySelector('stats')?.getAttribute('maxplaytime'),
        thumbnail: item.querySelector('thumbnail')?.textContent,
      }),
    );
}

export function parseBggExport(text) {
  const trimmed = text.trimStart();
  return trimmed.startsWith('<') ? parseBggXml(text) : parseBggCsv(text);
}

function splitCsvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}
