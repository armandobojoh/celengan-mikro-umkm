async function renderAdminVerifikasi(){
  setTitle('Verifikasi Data Warga');
  const content = document.getElementById('content');

  let pending = [];
  try {
    pending = await apiFetch('/warga/pending');
  } catch (err) {
    content.innerHTML = emptyState('Gagal memuat data: ' + (err.message || ''));
    return;
  }

  document.getElementById('topbar-stat').innerHTML = `<b>${pending.length}</b> menunggu tinjauan`;

  if(pending.length === 0){
    content.innerHTML = emptyState('Tidak ada data warga yang menunggu verifikasi.');
    return;
  }
  content.innerHTML = `<div class="card"><div class="list">
    ${pending.map(w => `
      <div class="row">
        <div class="row-avatar">${w.foto ? `<img src="${w.foto}" alt="">` : (w.emoji || '🧑\u200d💼')}</div>
        <div class="row-main">
          <div class="name">${w.nama}</div>
          <div class="sub">${w.usaha} · Diajukan oleh ${w.rtrw?.name || '—'} · Butuh ${rupiah(w.modalDibutuhkan)}</div>
        </div>
        <div class="row-side">
          <button class="btn btn-reject btn-sm" onclick="rejectWarga('${w._id}')">Tolak</button>
          <button class="btn btn-approve btn-sm" onclick="approveWarga('${w._id}')">${icon('check')} Setujui</button>
        </div>
      </div>`).join('')}
  </div></div>`;
}

async function approveWarga(id){
  try {
    await apiFetch(`/warga/${id}/verifikasi`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'disetujui' }),
    });
    showToast('Warga disetujui dan kini tayang ke donatur.');
    renderAdminVerifikasi();
  } catch (err) {
    showToast(err.message || 'Gagal menyetujui warga.', true);
  }
}

async function rejectWarga(id){
  try {
    await apiFetch(`/warga/${id}/verifikasi`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'ditolak' }),
    });
    showToast('Pengajuan warga ditolak.', true);
    renderAdminVerifikasi();
  } catch (err) {
    showToast(err.message || 'Gagal menolak warga.', true);
  }
}

async function renderAdminHistory(){
  setTitle('History Donasi');
  const content = document.getElementById('content');

  let rows = [];
  try {
    rows = await apiFetch('/donasi');
  } catch (err) {
    content.innerHTML = emptyState('Gagal memuat data: ' + (err.message || ''));
    return;
  }

  const totalDana = rows.reduce((s, d) => s + d.nominal, 0);
  const donaturUnik = new Set(rows.map(d => d.donatur?._id)).size;
  const wargaTerbantu = new Set(rows.map(d => d.warga?._id)).size;
  document.getElementById('topbar-stat').innerHTML = `Total tersalurkan: <b>${rupiah(totalDana)}</b>`;

  rows = [...rows].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  content.innerHTML = `
    <div class="stat-row">
      <div class="stat"><span class="num">${rupiah(totalDana)}</span><span class="lbl">Total Donasi Tersalurkan</span></div>
      <div class="stat"><span class="num">${donaturUnik}</span><span class="lbl">Donatur Aktif</span></div>
      <div class="stat"><span class="num">${wargaTerbantu}</span><span class="lbl">Warga Terbantu</span></div>
    </div>
    <div class="card">
      ${rows.length === 0 ? emptyState('Belum ada transaksi donasi.') : `
      <div class="table-wrap">
      <table class="history-table">
        <thead><tr><th>Donatur</th><th>Warga Penerima</th><th>Usaha</th><th>Nominal</th><th>Tanggal</th></tr></thead>
        <tbody>
          ${rows.map(d => `<tr>
              <td>${d.donatur?.name || '—'}</td>
              <td>${d.warga?.nama || '—'}</td>
              <td>${d.warga?.usaha || '—'}</td>
              <td class="num">${rupiah(d.nominal)}</td>
              <td>${tglIndo(d.createdAt.slice(0,10))}</td>
            </tr>`).join('')}
        </tbody>
      </table>
      </div>`}
    </div>`;
}