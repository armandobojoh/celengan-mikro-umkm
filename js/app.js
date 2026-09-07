/* =========================================================
   app.js — entry point, wires up the auth screen widgets
   and restores a saved session on page load
   ========================================================= */

document.getElementById('role-picker-login').addEventListener('click', e => {
  const btn = e.target.closest('.role-btn');
  if(!btn) return;
  [...e.currentTarget.children].forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedLoginRole = btn.dataset.role;
  fillLoginCredentials(selectedLoginRole);
});

document.getElementById('role-picker-daftar').addEventListener('click', e => {
  const btn = e.target.closest('.role-btn');
  if(!btn) return;
  [...e.currentTarget.children].forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedDaftarRole = btn.dataset.role;
});

/* on load: if the browser remembers a logged-in user, skip straight to the app */
(function init(){
  const remembered = restoreSession();
  if(remembered){
    loginAs(remembered, false);
  }
})();
