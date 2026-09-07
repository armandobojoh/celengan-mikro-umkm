async function renderDonaturPilih(){
  setTitle('Pilih Warga & Donasi');
  const content = document.getElementById('content');

  let eligible = [];
  try {
    eligible = await apiFetch('/warga/disetujui');
  } catch (err) {
    content.innerHTML = emptyState('Gagal memuat data: ' + (err.message || ''));
    return;
  }

  document.getElementById('topbar-stat').innerHTML = `<b>${eligible.length}</b> usaha siap dibantu`;

  if(eligible.length === 0){
    content.innerHTML = emptyState('Belum ada warga terverifikasi saat ini.');
    return;
  }
  content.innerHTML = `<div class="card"><div class="list">
    ${eligible.map(w => {
      const full = w.terkumpul >= w.modalDibutuhkan;
      return `
      <div class="row">
        <div class="row-avatar">${w.foto ? `<img src="${w.foto}" alt="">` : (w.emoji || '🧑\u200d💼')}</div>
        <div class="row-main">
          <div class="name">${w.nama}</div>
          <div class="sub">${w.usaha} · Diajukan oleh ${w.rtrw?.name || '—'}</div>
        </div>
        ${progressBar(w.terkumpul, w.modalDibutuhkan)}
        <div class="row-side">
          ${full
            ? `<span class="badge badge-full">Terpenuhi</span>`
            : `<button class="btn btn-primary btn-sm" onclick="openDonasiModal('${w._id}')">${icon('heart')} Bantu</button>`}
        </div>
      </div>`;
    }).join('')}
  </div></div>`;
}

let donasiCache = {}; // simpan data warga sementara supaya modal tidak perlu fetch ulang

async function openDonasiModal(wargaId){
  let w;
  try {
    const eligible = await apiFetch('/warga/disetujui');
    w = eligible.find(x => x._id === wargaId);
  } catch (err) {
    showToast('Gagal memuat data warga.', true);
    return;
  }
  if(!w) return;
  donasiCache[wargaId] = w;

  const overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'donasi-overlay';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <div>
          <h3 style="font-size:1.1rem;">Bantu ${w.nama}</h3>
          <p class="hint" style="margin-top:4px;">${w.usaha} · sisa kebutuhan ${rupiah(Math.max(0, w.modalDibutuhkan - w.terkumpul))}</p>
        </div>
        <button class="modal-close" onclick="closeDonasiModal()">${icon('close')}</button>
      </div>
      <label style="font-size:.85rem;font-weight:700;">Pilih nominal donasi</label>
      <div class="chip-row" id="chip-row">
        ${[10000, 25000, 50000, 100000].map(v => `<button type="button" class="chip" data-val="${v}" onclick="pickChip(${v})">${rupiah(v)}</button>`).join('')}
      </div>
      <label style="font-size:.85rem;font-weight:700; display:flex; flex-direction:column; gap:7px;">
        Atau masukkan nominal lain (Rp)
        <input type="number" id="donasi-nominal" min="1000" step="1000" placeholder="cth. 75000"
          style="border:1.5px solid var(--line); border-radius:8px; padding:11px 13px; font-size:.95rem;">
      </label>
      <button class="btn btn-primary btn-block" style="margin-top:18px;" onclick="lanjutkanPembayaran('${w._id}')">Lanjutkan</button>
    </div>`;
  document.body.appendChild(overlay);
}

function pickChip(val){
  [...document.querySelectorAll('#chip-row .chip')].forEach(c => c.classList.toggle('active', Number(c.dataset.val) === val));
  document.getElementById('donasi-nominal').value = val;
}

function closeDonasiModal(){
  const el = document.getElementById('donasi-overlay');
  if(el) el.remove();
}

function lanjutkanPembayaran(wargaId){
  const nominal = Number(document.getElementById('donasi-nominal').value);
  if(!nominal || nominal < 1000){
    showToast('Masukkan nominal donasi yang valid.', true);
    return;
  }

  const w = donasiCache[wargaId];
  const overlay = document.getElementById('donasi-overlay');
  if(!w || !overlay) return;

  overlay.innerHTML = `
    <div class="modal payment-modal">
      <div class="modal-head">
        <div>
          <h3 style="font-size:1.1rem;">Konfirmasi Pembayaran</h3>
          <p class="hint" style="margin-top:4px;">Donasi ${rupiah(nominal)} untuk ${w.nama}</p>
        </div>
        <button class="modal-close" onclick="closeDonasiModal()" aria-label="Tutup">${icon('close')}</button>
      </div>
      <p class="payment-label">Pilih metode pembayaran</p>
      <div class="payment-methods">
        <button type="button" class="payment-method active" data-method="qris" onclick="pilihMetodePembayaran('qris')">
          <strong>QRIS</strong>
          <span>Bayar dengan scan QR</span>
        </button>
        <button type="button" class="payment-method" data-method="bank" onclick="pilihMetodePembayaran('bank')">
          <strong>Transfer Bank</strong>
          <span>Transfer melalui rekening bank</span>
        </button>
      </div>
      <div id="payment-qris" class="payment-option">
        <div class="qr-placeholder" role="img" aria-label="Placeholder QR code">QRIS</div>
        <p class="hint">Scan QR code dummy di atas untuk simulasi pembayaran.</p>
        <button type="button" class="btn btn-primary btn-block" onclick="submitDonasi('${wargaId}', ${nominal})">Saya Sudah Bayar</button>
      </div>
      <div id="payment-bank" class="payment-option" hidden>
        <div class="bank-account">
          <span class="hint">Rekening tujuan</span>
          <strong>BCA 1234567890</strong>
          <span>a.n. ModalRT</span>
        </div>
        <button type="button" class="btn btn-primary btn-block" onclick="submitDonasi('${wargaId}', ${nominal})">Saya Sudah Transfer</button>
      </div>
      <button type="button" class="btn btn-cancel btn-block" onclick="closeDonasiModal()">Batal</button>
    </div>`;
}

function pilihMetodePembayaran(method){
  document.querySelectorAll('.payment-method').forEach(button => {
    button.classList.toggle('active', button.dataset.method === method);
  });
  document.getElementById('payment-qris').hidden = method !== 'qris';
  document.getElementById('payment-bank').hidden = method !== 'bank';
}

async function submitDonasi(wargaId, confirmedNominal){
  const nominal = confirmedNominal || Number(document.getElementById('donasi-nominal').value);
  if(!nominal || nominal < 1000){
    showToast('Masukkan nominal donasi yang valid.', true);
    return;
  }

  const w = donasiCache[wargaId];
  try {
    await apiFetch('/donasi', {
      method: 'POST',
      body: JSON.stringify({ wargaId, nominal }),
    });
    closeDonasiModal();
    showToast(`Terima kasih! Donasi ${rupiah(nominal)} untuk ${w?.nama || ''} berhasil dikirim.`);
    renderDonaturPilih();
  } catch (err) {
    showToast(err.message || 'Gagal mengirim donasi.', true);
  }
}

async function renderDonaturRiwayat(){
  setTitle('Riwayat Donasi Saya');
  const content = document.getElementById('content');

  let mine = [];
  try {
    mine = await apiFetch('/donasi/milik-saya');
  } catch (err) {
    content.innerHTML = emptyState('Gagal memuat data: ' + (err.message || ''));
    return;
  }

  mine = mine.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = mine.reduce((s, d) => s + d.nominal, 0);
  const wargaCount = new Set(mine.map(d => d.warga?._id)).size;
  document.getElementById('topbar-stat').innerHTML = `Kamu telah membantu: <b>${rupiah(total)}</b>`;

  if(mine.length === 0){
    content.innerHTML = emptyState('Kamu belum pernah berdonasi. Yuk mulai dari menu "Pilih Warga & Donasi".');
    return;
  }
  content.innerHTML = `
    <div class="stat-row">
      <div class="stat"><span class="num">${rupiah(total)}</span><span class="lbl">Total Donasi Kamu</span></div>
      <div class="stat"><span class="num">${wargaCount}</span><span class="lbl">Warga yang Kamu Bantu</span></div>
    </div>
    <div class="card"><div class="list">
      ${mine.map(d => {
        const w = d.warga;
        return `
        <div class="row">
          <div class="row-avatar">${w?.foto ? `<img src="${w.foto}" alt="">` : (w?.emoji || '❓')}</div>
          <div class="row-main">
            <div class="name">${w ? w.nama : 'Warga tidak ditemukan'}</div>
            <div class="sub">${w ? w.usaha : ''} · ${tglIndo(d.createdAt.slice(0,10))}</div>
          </div>
          <div class="row-side">
            <span class="badge badge-verified">Donasi ${rupiah(d.nominal)}</span>
          </div>
        </div>`;
      }).join('')}
    </div></div>`;
}