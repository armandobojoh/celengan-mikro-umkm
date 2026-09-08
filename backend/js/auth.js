let currentUser = null;
let selectedLoginRole = 'admin';
let selectedDaftarRole = 'rtrw';

function fillLoginCredentials(role){
  const demo = {
    admin:   { email: 'admin@test.com',   pass: '123456' },
    rtrw:    { email: 'rtrw@test.com',    pass: '123456' },
    donatur: { email: 'donatur@test.com', pass: '123456' },
  }[role];
  if(!demo) return;
  document.getElementById('login-email').value = demo.email;
  document.getElementById('login-password').value = demo.pass;
  document.getElementById('login-err').textContent = '';
}

function switchAuthTab(tab){
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-daftar').classList.toggle('active', tab === 'daftar');
  document.getElementById('form-login').hidden = tab !== 'login';
  document.getElementById('form-daftar').hidden = tab !== 'daftar';
}

async function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-err');

  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    if (data.user.role !== selectedLoginRole) {
      errEl.textContent = 'Peran tidak cocok dengan akun ini.';
      return;
    }

    errEl.textContent = '';
    localStorage.setItem('modalrt_token', data.token);
    localStorage.setItem('modalrt_user', JSON.stringify(data.user));
    loginAs(data.user);
  } catch (err) {
    errEl.textContent = err.message || 'Email atau kata sandi salah.';
  }
}

async function handleDaftar(e){
  e.preventDefault();
  const nama = document.getElementById('daftar-nama').value.trim();
  const email = document.getElementById('daftar-email').value.trim().toLowerCase();
  const pass = document.getElementById('daftar-password').value;
  const errEl = document.getElementById('daftar-err');

  try {
    await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name: nama, email, password: pass, role: selectedDaftarRole }),
    });

    // langsung login setelah daftar berhasil
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });

    errEl.textContent = '';
    localStorage.setItem('modalrt_token', data.token);
    localStorage.setItem('modalrt_user', JSON.stringify(data.user));
    showToast('Akun berhasil dibuat. Selamat datang, ' + nama + '!');
    loginAs(data.user);
  } catch (err) {
    errEl.textContent = err.message || 'Gagal mendaftar.';
  }
}

function loginAs(user){
  currentUser = user;
  document.getElementById('screen-auth').hidden = true;
  document.getElementById('screen-app').hidden = false;
  document.getElementById('user-name').textContent = user.name;
  document.getElementById('user-role').textContent = roleLabel(user.role);
  document.getElementById('user-avatar').textContent = user.name.trim()[0].toUpperCase();
  renderSidebar();
  const firstPage = { admin: 'admin-verifikasi', rtrw: 'rtrw-daftar', donatur: 'donatur-pilih' }[user.role];
  goTo(firstPage);
}

function handleLogout(){
  currentUser = null;
  localStorage.removeItem('modalrt_token');
  localStorage.removeItem('modalrt_user');
  document.getElementById('screen-app').hidden = true;
  document.getElementById('screen-auth').hidden = false;
  document.getElementById('form-login').reset();
  switchAuthTab('login');
}

function roleLabel(r){
  return { admin: 'Admin', rtrw: 'RT/RW', donatur: 'Donatur' }[r] || r;
}

function restoreSession(){
  const token = localStorage.getItem('modalrt_token');
  const userRaw = localStorage.getItem('modalrt_user');
  if(!token || !userRaw) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}