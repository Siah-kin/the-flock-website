(function () {
  'use strict';

  function getApiOrigin() {
    var meta = document.querySelector('meta[name="bonzi-api-origin"]');
    var raw = meta && meta.content ? meta.content.trim().replace(/\/+$/, '') : '';
    return raw || 'https://bonzi-bot.fly.dev';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function showLocked(reason) {
    document.body.classList.remove('access-checking');
    document.body.classList.add('access-locked');
    var panel = document.getElementById('vault-access-panel');
    if (panel) return;
    panel = document.createElement('section');
    panel.id = 'vault-access-panel';
    panel.setAttribute('role', 'status');
    panel.innerHTML = '' +
      '<div class="vault-access-card">' +
      '<div class="vault-access-label">Supporter preview</div>' +
      '<h1>Checking your badge</h1>' +
      '<p>Open the Flock bot and send <strong>/vault</strong> to check your Die-hard badge, wallet, and current eligibility.</p>' +
      '<a class="vault-access-action" href="https://t.me/Arctide_TheFlock_Bot?start=vault">Open bot → /vault</a>' +
      (reason ? '<p class="vault-access-reason">' + escapeHtml(reason) + '</p>' : '') +
      '</div>';
    var nav = document.getElementById('mobile-menu-container') || document.body.firstChild;
    if (nav && nav.parentNode) {
      nav.parentNode.insertBefore(panel, nav.nextSibling);
    } else {
      document.body.insertBefore(panel, document.body.firstChild);
    }
  }

  function grantAccess() {
    document.body.classList.remove('access-checking', 'access-locked');
    document.body.classList.add('access-granted');
    var panel = document.getElementById('vault-access-panel');
    if (panel) panel.remove();
  }

  function verify() {
    fetch(getApiOrigin() + '/api/vault/verify_access', {
      method: 'GET',
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      return response.json().catch(function () { return {}; });
    }).then(function (payload) {
      if (payload && payload.valid) {
        grantAccess();
      } else {
        showLocked(payload && payload.reason ? String(payload.reason) : 'not_unlocked');
      }
    }).catch(function () {
      showLocked('check_failed');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', verify);
  } else {
    verify();
  }
})();
