/* =========================================================
   ui-helpers.js — formatting + small reusable UI fragments
   ========================================================= */

const rupiah = n => new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR', maximumFractionDigits:0 }).format(n || 0);
const tglIndo = iso => new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

function showToast(msg, isError){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => { t.className = 'toast'; }, 2600);
}

function setTitle(title, stat){
  document.getElementById('page-title').textContent = title;
  document.getElementById('topbar-stat').innerHTML = stat || '';
}

function progressBar(terkumpul, modal){
  const pct = Math.min(100, Math.round((terkumpul / modal) * 100));
  const full = terkumpul >= modal;
  return `
    <div class="progress-wrap">
      <div class="progress-track"><div class="progress-fill ${full ? 'full' : ''}" style="width:${pct}%"></div></div>
      <div class="progress-nums"><span><b>${pct}%</b></span><span>${rupiah(terkumpul)} / ${rupiah(modal)}</span></div>
    </div>`;
}

function statusBadge(status, terkumpul, modal){
  if(status === 'pending') return `<span class="badge badge-pending">Menunggu Verifikasi</span>`;
  if(status === 'rejected') return `<span class="badge badge-rejected">Ditolak</span>`;
  if(terkumpul >= modal) return `<span class="badge badge-full">Modal Terpenuhi</span>`;
  return `<span class="badge badge-verified">Terverifikasi</span>`;
}

function emptyState(msg){
  return `<div class="empty">${icon('empty', '')}<p>${msg}</p></div>`;
}
