/**
 * assets/app.js
 * ─────────────────────────────────────────────────────────────────────────
 * Main application entry point.
 * Depends on:  i18n.js, code-stats.js  (loaded before this file in HTML)
 */

// ── Year ──────────────────────────────────────────────────────────────────
document.getElementById('year').textContent =
  '2023 – ' + new Date().getFullYear();

// ── Language dropdown ─────────────────────────────────────────────────────

const _wrap  = document.getElementById('langDdWrap');
const _btn   = document.getElementById('langDdBtn');
const _panel = document.getElementById('langDdPanel');
const _flag  = document.getElementById('langDdFlag');
const _lbl   = document.getElementById('langDdLabel');

/** Toggle open/close */
_btn.addEventListener('click', e => {
  e.stopPropagation();
  _wrap.classList.toggle('open');
});

/** Close when clicking outside */
document.addEventListener('click', () => _wrap.classList.remove('open'));

/** Build dropdown items from manifest */
function buildLangDropdown() {
  _panel.innerHTML = '';
  I18n.available.forEach(code => {
    const m    = I18n.meta(code);
    const item = document.createElement('button');
    item.className       = 'lang-dd-item' + (code === I18n.lang ? ' active' : '');
    item.dataset.code    = code;
    item.innerHTML = `
      <span class="item-flag">${m.flag}</span>
      <span class="item-label">${m.label}</span>
      <span class="item-check">✓</span>
    `;
    item.addEventListener('click', async e => {
      e.stopPropagation();
      _wrap.classList.remove('open');
      if (code !== I18n.lang) await I18n.setLang(code);
    });
    _panel.appendChild(item);
  });
}

/** Sync button face to current lang */
function syncLangBtn() {
  const m     = I18n.meta(I18n.lang);
  _flag.textContent = m.flag;
  _lbl.textContent  = m.label;
  // update active state in list
  _panel.querySelectorAll('.lang-dd-item').forEach(el => {
    el.classList.toggle('active', el.dataset.code === I18n.lang);
  });
}

// ── Apply translations ────────────────────────────────────────────────────

function applyTranslations() {
  const t = key => I18n.t(key);
  document.title = t('title');
  document.getElementById('label').textContent          = t('label');
  document.getElementById('handle').textContent         = t('handle');
  document.getElementById('bio').innerHTML              = t('bio');
  document.getElementById('sectionInterest').textContent = t('sectionInterest');
  document.getElementById('sectionOverview').textContent = t('sectionOverview');
  document.getElementById('status').textContent         = t('status');

  // Tags (array value from JSON)
  const rawTags = I18n.t('tags');
  const tags    = Array.isArray(rawTags) ? rawTags : [];
  document.getElementById('tags').innerHTML =
    tags.map(tag => `<span class="tag">${tag}</span>`).join('');
}

// ── Card fade helper ──────────────────────────────────────────────────────

async function withFade(fn) {
  const card = document.getElementById('card');
  card.classList.add('fading');
  await new Promise(r => setTimeout(r, 180));
  fn();
  card.classList.remove('fading');
}

// ── langchange event ─────────────────────────────────────────────────────

document.addEventListener('langchange', async () => {
  await withFade(() => {
    applyTranslations();
    syncLangBtn();
  });
});

// ── Init ──────────────────────────────────────────────────────────────────

(async () => {
  await I18n.init();      // fetch manifest, detect lang, fire langchange
  buildLangDropdown();    // needs I18n.available populated
  syncLangBtn();
  // code-stats are language-agnostic; render once
  await CodeStats.init();
})();