/* =========================================================
   icons.js — tiny inline SVG icon set (line-style, 24x24)
   ========================================================= */

const ICONS = {
  plus: `<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>`,
  check: `<polyline points="20 6 9 17 4 12"/>`,
  history: `<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/>`,
  chart: `<line x1="5" y1="20" x2="5" y2="11"/><line x1="12" y1="20" x2="12" y2="6"/><line x1="19" y1="20" x2="19" y2="15"/>`,
  heart: `<path d="M20.8 8.6c0 4.7-8.8 10.4-8.8 10.4S3.2 13.3 3.2 8.6a4.6 4.6 0 0 1 8.8-1.9 4.6 4.6 0 0 1 8.8 1.9Z"/>`,
  photo: `<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.8"/><path d="m21 16-5-5-4 4-3-3-4 4"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  empty: `<rect x="4" y="4" width="16" height="16" rx="3"/><line x1="9" y1="12" x2="15" y2="12"/>`,
};

function icon(name, cls){
  return `<svg class="${cls || 'icon'}" viewBox="0 0 24 24">${ICONS[name] || ''}</svg>`;
}
