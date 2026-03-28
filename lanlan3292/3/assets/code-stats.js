/**
 * assets/code-stats.js
 * ─────────────────────────────────────────────────────────────────────────
 * Loads  assets/code-stats.json  and renders the language composition bar
 * + legend into the DOM elements  #codeBar  and  #codeLegend.
 *
 * Usage:
 *   await CodeStats.init();   — call once after DOM ready
 *
 * The data file is language-agnostic (language names are proper nouns,
 * not translated). To update percentages, edit code-stats.json only.
 */
const CodeStats = (() => {
  const DATA_URL = 'assets/code-stats.json';
  let _data = null;

  async function _load() {
    if (_data) return _data;
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`[CodeStats] fetch failed HTTP ${res.status}`);
    _data = await res.json();
    return _data;
  }

  function _render(data) {
    const bar    = document.getElementById('codeBar');
    const legend = document.getElementById('codeLegend');
    if (!bar || !legend) return;

    bar.innerHTML    = '';
    legend.innerHTML = '';

    data.forEach(item => {
      // Bar segment
      const seg = document.createElement('div');
      seg.className        = 'code-bar-seg';
      seg.style.flex       = item.pct;
      seg.style.background = item.color;
      seg.title            = `${item.lang} ${item.pct}%`;
      bar.appendChild(seg);

      // Legend item
      const li = document.createElement('div');
      li.className = 'code-legend-item';
      li.innerHTML = `
        <span class="code-legend-dot" style="background:${item.color}"></span>
        <span class="code-legend-name">${item.lang}</span>
        <span class="code-legend-pct">${item.pct}%</span>
      `;
      legend.appendChild(li);
    });
  }

  async function init() {
    try {
      const data = await _load();
      _render(data);
    } catch (e) {
      console.error('[CodeStats]', e.message);
    }
  }

  return { init };
})();