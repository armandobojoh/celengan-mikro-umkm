let pendingFotoData = null;

function renderRtrwDaftar(){
  setTitle('Daftarkan Warga Baru');
  document.getElementById('content').innerHTML = `
    <div class="section-head"><p>Data yang kamu kirim akan ditinjau Admin sebelum tampil ke donatur.</p></div>
    <div class="card">
      <form id="form-warga" class="form-grid" onsubmit="submitWarga(event)">
        <label>Nama Warga
          <input type="text" id="w-nama" placeholder="cth. Sri Wahyuni" required>
        </label>
        <label>Jenis Usaha
          <input type="text" id="w-usaha" placeholder="cth. Warung Sembako" required>
        </label>
        <label>Kebutuhan Modal (Rp)
          <input type="number" id="w-modal" placeholder="cth. 2000000" min="50000" step="10000" required>
        </label>
        <label>Foto Usaha
          <div class="photo-drop" id="photo-drop" onclick="document.getElementById('w-foto').click()">
            <div id="photo-drop-content">${icon('photo')}<span>Klik untuk unggah foto usaha (opsional)</span></div>
          </div>
          <input type="file" id="w-foto" accept="image/*" style="display:none" onchange="previewFoto(event)">
        </label>
        <button type="submit" class="btn btn-primary btn-block">Daftarkan Warga</button>
      </form>
    </div>`;
}

function previewFoto(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    pendingFotoData = ev.target.result;
    document.getElementById('photo-drop-content').innerHTML = `<img src="${ev.target.result}" alt="Pratinjau foto usaha">`;
  };
  reader.readAsDataURL(file);
}

async function submitWarga(e){
  e.preventDefault();
  const nama = document.getElementById('w-nama').value.trim();
  const usaha = document.getElementById('w-usaha').value.trim();
  const modalDibutuhkan = Number(document.getElementById('w-modal').value);

  if(!nama || !usaha || !modalDibutuhkan){
    showToast('Lengkapi semua data sebelum mendaftarkan.', true);
    return;
  }

  try {
    await apiFetch('/warga', {
      method: 'POST',
      body: JSON.stringify({ nama, usaha, modalDibutuhkan, foto: pendingFotoData }),
    });
    pendingFotoData = null;
    showToast('Data warga terkirim, menunggu verifikasi Admin.');
    renderRtrwDaftar();
  } catch (err) {
    showToast(err.message || 'Gagal mendaftarkan warga.', true);
  }
}

async function renderRtrwDashboard(){
  setTitle('Dashboard Progress Donasi');
  const content = document.getElementById('content');

  let mine = [];
  try {
    mine = await apiFetch('/warga/milik-saya');
  } catch (err) {
    content.innerHTML = emptyState('Gagal memuat data: ' + (err.message || ''));
    return;
  }

  const totalTerkumpul = mine.reduce((s, w) => s + w.terkumpul, 0);
  document.getElementById('topbar-stat').innerHTML = `Terkumpul untuk warga binaan: <b>${rupiah(totalTerkumpul)}</b>`;

  if(mine.length === 0){
    content.innerHTML = emptyState('Belum ada warga yang kamu daftarkan.');
    return;
  }
  content.innerHTML = `<div class="card"><div class="list">${mine.map(rowWargaForRtrw).join('')}</div></div>`;
}

function rowWargaForRtrw(w){
  return `
    <div class="row">
      <div class="row-avatar">${w.foto ? `<img src="${w.foto}" alt="">` : (w.emoji || '🧑\u200d💼')}</div>
      <div class="row-main">
        <div class="name">${w.nama}</div>
        <div class="sub">${w.usaha}</div>
      </div>
      <div class="row-side">
        ${statusBadge(w.status, w.terkumpul, w.modalDibutuhkan)}
        ${w.status !== 'ditolak' ? progressBar(w.terkumpul, w.modalDibutuhkan) : ''}
      </div>
    </div>`;
}