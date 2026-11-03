// Footer year
document.getElementById('yr').textContent = new Date().getFullYear();

// ---- Tokenizer demo (simplified, runs in the browser) ----
// A tiny English-leaning vocabulary. "▁" marks the start of a word, like SentencePiece.
const VOCAB = ['▁', '.', ',', '?', '!', "'",
  '▁I', '▁am', '▁a', '▁an', '▁the', '▁is', '▁are', '▁and', '▁to', '▁of', '▁in', '▁my', '▁we', '▁you', '▁it',
  '▁hello', '▁learn', 'ing', 'ed', 's', 'er', 'ion', 'al', 'ly',
  '▁machine', '▁trans', 'lation', '▁data', '▁model', '▁language', '▁science', '▁build', '▁work',
  '▁comput', '▁engine', 'ering', '▁Nepal', '▁low', '▁resource'];
const vocab = new Set(VOCAB);
const maxLen = Math.max(...VOCAB.map(v => Array.from(v).length));

// Edit these to try your own sentences. Add real Newari sentences here.
const PRESETS = [
  { label: 'English',    text: 'I am learning machine translation.' },
  { label: 'Nepali',     text: 'मलाई नयाँ भाषाहरू मन पर्छ।' },
  { label: 'Nepal Bhasa', text: 'ज्वजलपा' }
];

const input  = document.getElementById('tok-input');
const out    = document.getElementById('tok-out');
const stats  = document.getElementById('tok-stats');
const presetBox = document.getElementById('presets');

// Greedy longest-match: take the longest known piece, else fall back to one character.
function splitWord(word) {
  const chars = Array.from('▁' + word), pieces = [];
  let i = 0;
  while (i < chars.length) {
    let found = null;
    for (let j = Math.min(chars.length, i + maxLen); j > i; j--) {
      const cand = chars.slice(i, j).join('');
      if (vocab.has(cand)) { found = cand; break; }
    }
    if (!found) found = chars[i];
    pieces.push({ t: found, known: vocab.has(found) });
    i += Array.from(found).length;
  }
  return pieces;
}

function render() {
  const parts = input.value.match(/[\p{L}\p{M}\p{N}']+|[^\s\p{L}\p{M}\p{N}]/gu) || [];
  let tokens = [], words = 0;
  parts.forEach(p => {
    if (/^[\p{L}\p{M}\p{N}']/u.test(p)) { words++; tokens = tokens.concat(splitWord(p)); }
    else tokens.push({ t: p, known: vocab.has(p) });
  });
  out.replaceChildren(...tokens.map(k => {
    const s = document.createElement('span');
    s.className = 'tok' + (k.known ? '' : ' unk');
    s.textContent = k.t;
    return s;
  }));
  const ratio = words ? (tokens.length / words).toFixed(1) : '0';
  stats.innerHTML = '<b>' + tokens.length + '</b> tokens for <b>' + words + '</b> words (<b>' + ratio + '</b> tokens per word)';
}

PRESETS.forEach((p, n) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn'; b.textContent = p.label;
  b.setAttribute('aria-pressed', 'false');
  b.addEventListener('click', () => {
    input.value = p.text;
    presetBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    render();
  });
  presetBox.appendChild(b);
  if (n === 0) b.click();
});
input.addEventListener('input', () => {
  presetBox.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
  render();
});

// ---- CV viewer and gated download ----
// Paste the Web app URL from your Google Apps Script deployment here.
const CV_FORM_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';

(function () {
  const dlg = document.getElementById('cv-dialog');
  const form = document.getElementById('cv-form');
  const msg = document.getElementById('cv-msg');
  const sendBtn = document.getElementById('cv-send');
  const toggle = document.getElementById('cv-dl-toggle');

  document.getElementById('cv-open').addEventListener('click', () => dlg.showModal());
  document.getElementById('cv-close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });

  const img = document.getElementById('cv-img');
  img.addEventListener('click', () => img.classList.toggle('zoom'));

  toggle.addEventListener('click', () => {
    form.hidden = !form.hidden;
    if (!form.hidden) form.elements.name.focus();
  });

  function say(text, cls) { msg.textContent = text; msg.className = cls || ''; }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (CV_FORM_URL.startsWith('PASTE')) { say('The download form is not connected yet.', 'err'); return; }
    sendBtn.disabled = true; say('Sending…');
    try {
      const res = await fetch(CV_FORM_URL, { method: 'POST', body: new URLSearchParams(new FormData(form)) });
      const data = await res.json();
      if (data.ok) { say('Done! The CV is on its way to your inbox. Please check your spam folder too.', 'ok'); form.reset(); }
      else say(data.error || 'Something went wrong. Please try again.', 'err');
    } catch (err) {
      say('Something went wrong. Please email me at sujankhatiwada321@gmail.com.', 'err');
    }
    sendBtn.disabled = false;
  });
})();
