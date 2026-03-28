/**
 * assets/i18n.js
 * ─────────────────────────────────────────────────────────────────────────
 * Lightweight i18n engine — mirrors the architecture from the reference.
 *
 * Language discovery:
 *   Reads  assets/lang/manifest.json  → array of locale codes ["zh_CN","en_US",…]
 *   Meta (flag, label, locale) lives inside each JSON under "_meta"
 *
 * Fallback chain per key:  current lang → en_US → raw key string
 *
 * To add a new language:
 *   1. Create  assets/lang/xx_YY.json  with a "_meta" block + translation keys
 *   2. Add "xx_YY" to  assets/lang/manifest.json
 *   — The UI picks it up automatically on next load.
 *
 * API:
 *   await I18n.init()             — detect lang, fetch manifest + all files
 *   await I18n.setLang("zh_CN")  — switch language (emits "langchange" event)
 *   I18n.t("key")                — translate
 *   I18n.lang                    — current locale code
 *   I18n.available               — array of locale codes from manifest
 *   I18n.meta(code)              — { flag, label, locale }
 */
const I18n = (() => {
  const MANIFEST_URL  = 'assets/lang/manifest.json';
  const FALLBACK_CODE = 'en_US';
  const LS_KEY        = 'profile-lang';

  let _available = [];
  let _lang      = FALLBACK_CODE;
  let _strings   = {};  // { "en_US": { key: val, … }, … }
  let _meta      = {};  // { "en_US": { flag, label, locale }, … }

  // ── helpers ───────────────────────────────────────────────────────────────

  function _mapBrowserLang(raw) {
    if (!raw) return FALLBACK_CODE;
    const l = raw.toLowerCase();
    if (l.startsWith('zh')) return 'zh_CN';
    // extend: if (l.startsWith('ja')) return 'ja_JP';
    return FALLBACK_CODE;
  }

  function _detectLang() {
    const stored = localStorage.getItem(LS_KEY);
    if (stored && _available.includes(stored)) return stored;
    const nav    = navigator.language || navigator.userLanguage || '';
    const mapped = _mapBrowserLang(nav);
    return _available.includes(mapped) ? mapped : (_available[0] || FALLBACK_CODE);
  }

  // ── loaders ───────────────────────────────────────────────────────────────

  async function _fetchManifest() {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(`[I18n] manifest fetch failed HTTP ${res.status}`);
    _available = await res.json();
  }

  async function _loadLang(code) {
    if (_strings[code]) return;
    try {
      const res  = await fetch(`assets/lang/${code}.json`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const m    = data['_meta'] || {};
      _meta[code] = {
        flag:   m.flag   || '🌐',
        label:  m.label  || code,
        locale: m.locale || code,
      };
      const strings = {};
      for (const [k, v] of Object.entries(data)) {
        if (k !== '_meta') strings[k] = v;
      }
      _strings[code] = strings;
    } catch (e) {
      console.warn(`[I18n] failed to load "${code}":`, e.message);
      _strings[code] = {};
      _meta[code] = { flag: '🌐', label: code, locale: code };
    }
  }

  // ── public API ────────────────────────────────────────────────────────────

  function t(key) {
    const cur      = _strings[_lang]         || {};
    const fallback = _strings[FALLBACK_CODE] || {};
    if (Object.prototype.hasOwnProperty.call(cur, key))      return cur[key];
    if (Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
    return key;
  }

  async function setLang(code) {
    if (!_available.includes(code)) {
      console.warn(`[I18n] unknown lang "${code}", falling back to ${FALLBACK_CODE}`);
      code = FALLBACK_CODE;
    }
    await _loadLang(code);
    _lang = code;
    localStorage.setItem(LS_KEY, code);
    document.documentElement.lang = _meta[code]?.locale || 'en';
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: code } }));
  }

  async function init() {
    await _fetchManifest();
    // Pre-load all lang files so _meta is ready for the dropdown
    await Promise.all(_available.map(c => _loadLang(c)));
    const detected = _detectLang();
    _lang = detected;
    document.documentElement.lang = _meta[detected]?.locale || 'en';
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: _lang } }));
  }

  function meta(code) {
    return _meta[code] || { flag: '🌐', label: code, locale: code };
  }

  return {
    init, setLang, t, meta,
    get lang()      { return _lang; },
    get available() { return _available.slice(); },
  };
})();