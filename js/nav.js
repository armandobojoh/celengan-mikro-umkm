const NAV = {
  admin: [
    { id: 'admin-verifikasi', label: 'Verifikasi Data', icon: 'check' },
    { id: 'admin-history',    label: 'History Donasi',  icon: 'history' },
  ],
  rtrw: [
    { id: 'rtrw-daftar',    label: 'Daftarkan Warga',    icon: 'plus' },
    { id: 'rtrw-dashboard', label: 'Dashboard Progress', icon: 'chart' },
  ],
  donatur: [
    { id: 'donatur-pilih',   label: 'Pilih Warga & Donasi', icon: 'heart' },
    { id: 'donatur-riwayat', label: 'Riwayat Donasi Saya',  icon: 'history' },
  ],
};

const PAGE_RENDERERS = {
  'admin-verifikasi': renderAdminVerifikasi,
  'admin-history': renderAdminHistory,
  'rtrw-daftar': renderRtrwDaftar,
  'rtrw-dashboard': renderRtrwDashboard,
  'donatur-pilih': renderDonaturPilih,
  'donatur-riwayat': renderDonaturRiwayat,
};

let currentPage = null;

function renderSidebar(){
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = NAV[currentUser.role].map(item => `
    <button class="nav-item" data-page="${item.id}" onclick="goTo('${item.id}')">
      ${icon(item.icon)}<span>${item.label}</span>
    </button>`).join('');
}

function goTo(pageId){
  currentPage = pageId;
  [...document.querySelectorAll('.nav-item')].forEach(el => el.classList.toggle('active', el.dataset.page === pageId));
  PAGE_RENDERERS[pageId]();
}
