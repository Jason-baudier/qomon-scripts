(function () {
  var SUBSTACK_URL = 'https://gwflow.substack.com/api/v1/free';
  var MIN_TIME_MS  = 30000;
  var MIN_SCROLL   = 40;
  var STORAGE_SHOWN      = 'gwtf_shown';
  var STORAGE_SUBSCRIBED = 'gwtf_subscribed';
  var ALLOWED_PATHS  = ['/', '/blog', '/expert-playbooks', '/events', '/testimonies'];
  var EXCLUDED_PATHS = ['/pricing', '/request-demo', '/canvassing-calculator'];

  var path = window.location.pathname;
  for (var e = 0; e < EXCLUDED_PATHS.length; e++) {
    if (path.startsWith(EXCLUDED_PATHS[e])) return;
  }
  var allowed = false;
  for (var a = 0; a < ALLOWED_PATHS.length; a++) {
    if (ALLOWED_PATHS[a] === '/' ? path === '/' : path.startsWith(ALLOWED_PATHS[a])) {
      allowed = true; break;
    }
  }
  if (!allowed) return;
  if (localStorage.getItem(STORAGE_SHOWN) || localStorage.getItem(STORAGE_SUBSCRIBED)) return;

  // Inject CSS
  var style = document.createElement('style');
  style.textContent = '#gwtf-overlay{display:none;position:fixed;inset:0;background:rgba(10,10,10,.55);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);z-index:99999;align-items:center;justify-content:center;padding:20px}#gwtf-overlay.gwtf-visible{display:flex;animation:gwtfFadeIn .3s ease forwards}@keyframes gwtfFadeIn{from{opacity:0}to{opacity:1}}#gwtf-modal{background:#fff;border-radius:16px;padding:36px 40px 32px;max-width:440px;width:100%;position:relative;box-shadow:0 24px 60px rgba(0,0,0,.18);animation:gwtfSlideUp .35s cubic-bezier(.16,1,.3,1) forwards}@keyframes gwtfSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}#gwtf-close{position:absolute;top:14px;right:16px;background:none;border:none;cursor:pointer;color:#9ca3af;font-size:20px;line-height:1;padding:4px;transition:color .2s}#gwtf-close:hover{color:#111}#gwtf-logo-area{margin-bottom:22px;display:flex;flex-direction:column;gap:4px}#gwtf-logo-title{font-family:Georgia,serif;font-size:22px;font-weight:900;color:#2d2d3a;letter-spacing:-.5px;line-height:1;text-transform:uppercase}#gwtf-logo-title .gwtf-flow{font-style:italic;text-transform:none}#gwtf-logo-sub{display:inline-block;background:#f5c4d1;color:#4b1528;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;padding:3px 8px 2px;border-radius:2px;width:fit-content}#gwtf-modal h2{font-size:19px;font-weight:700;color:#111827;margin:0 0 8px;line-height:1.35}#gwtf-modal p{font-size:14px;color:#6b7280;margin:0 0 22px;line-height:1.65}#gwtf-input-row{display:flex;gap:8px}#gwtf-email{flex:1;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s;box-sizing:border-box;color:#111827}#gwtf-email:focus{border-color:#111827}#gwtf-submit{padding:10px 16px;background:#2d2d3a;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .2s,transform .1s}#gwtf-submit:hover{background:#1f2937}#gwtf-submit:active{transform:scale(.98)}#gwtf-disclaimer{font-size:11px;color:#9ca3af;margin-top:10px;text-align:center}#gwtf-error{font-size:12px;color:#ef4444;display:none;margin-top:6px}#gwtf-success{display:none;text-align:center;padding:10px 0}#gwtf-success .gwtf-check{font-size:40px;margin-bottom:12px}#gwtf-success h3{font-size:18px;font-weight:700;color:#111827;margin:0 0 6px}#gwtf-success p{font-size:14px;color:#6b7280;margin:0}@media(max-width:480px){#gwtf-modal{padding:28px 24px}#gwtf-modal h2{font-size:17px}#gwtf-input-row{flex-direction:column}#gwtf-submit{width:100%}}';
  document.head.appendChild(style);

  // Inject HTML
  var div = document.createElement('div');
  div.id = 'gwtf-overlay';
  div.setAttribute('role', 'dialog');
  div.setAttribute('aria-modal', 'true');
  div.innerHTML = '<div id="gwtf-modal"><button id="gwtf-close" aria-label="Close">\u2715</button><div id="gwtf-logo-area"><span id="gwtf-logo-title">Go With The <span class="gwtf-flow">Flow</span></span><span id="gwtf-logo-sub">The Newsletter</span></div><h2>Stay ahead on nonprofit &amp; political tech</h2><p>Strategy, culture, and tactics for teams building movements. Join thousands of organizers.</p><div id="gwtf-form-wrapper"><div id="gwtf-input-row"><input type="email" id="gwtf-email" placeholder="Your email address" autocomplete="email"/><button id="gwtf-submit" type="button">Subscribe \u2192</button></div><div id="gwtf-error">Please enter a valid email address.</div><p id="gwtf-disclaimer">No spam. Unsubscribe anytime.</p></div><div id="gwtf-success"><div class="gwtf-check">\uD83C\uDF89</div><h3>You\'re in!</h3><p>Welcome to Go With The Flow. Check your inbox for a confirmation.</p></div></div>';
  document.body.appendChild(div);

  // Logic
  var timeEnough = false;
  var scrolledEnough = false;
  var triggered = false;

  function onScroll() {
    var el = document.documentElement;
    var pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    if (pct >= MIN_SCROLL) { scrolledEnough = true; window.removeEventListener('scroll', onScroll); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(function () { timeEnough = true; }, MIN_TIME_MS);

  function canShow() { return scrolledEnough && timeEnough && !triggered; }

  function showPopup() {
    if (!canShow()) return;
    triggered = true;
    localStorage.setItem(STORAGE_SHOWN, '1');
    document.getElementById('gwtf-overlay').classList.add('gwtf-visible');
  }

  function closePopup() {
    document.getElementById('gwtf-overlay').classList.remove('gwtf-visible');
  }

  document.addEventListener('mouseleave', function (e) { if (e.clientY <= 0) showPopup(); });

  var mobileFired = false;
  window.addEventListener('scroll', function () {
    if (mobileFired || !/Mobi|Android/i.test(navigator.userAgent)) return;
    var el = document.documentElement;
    var pct = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
    if (pct >= 70 && timeEnough && !triggered) { mobileFired = true; showPopup(); }
  }, { passive: true });

  document.getElementById('gwtf-close').addEventListener('click', closePopup);
  document.getElementById('gwtf-overlay').addEventListener('click', function (e) { if (e.target === this) closePopup(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePopup(); });

  document.getElementById('gwtf-submit').addEventListener('click', function () {
    var emailInput = document.getElementById('gwtf-email');
    var errorEl = document.getElementById('gwtf-error');
    var email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorEl.style.display = 'block';
      emailInput.style.borderColor = '#ef4444';
      return;
    }
    errorEl.style.display = 'none';
    emailInput.style.borderColor = '';
    var btn = document.getElementById('gwtf-submit');
    btn.textContent = 'Subscribing\u2026';
    btn.disabled = true;
    fetch(SUBSTACK_URL + '?email=' + encodeURIComponent(email), { method: 'POST', headers: { 'Content-Type': 'application/json' } })
      .then(function (res) {
        if (res.ok || res.status === 200) {
          localStorage.setItem(STORAGE_SUBSCRIBED, '1');
          document.getElementById('gwtf-form-wrapper').style.display = 'none';
          document.getElementById('gwtf-success').style.display = 'block';
          setTimeout(closePopup, 3000);
        } else { throw new Error('error'); }
      })
      .catch(function () {
        window.open('https://gwflow.substack.com/?utm_source=qomon_website&utm_medium=exit_popup', '_blank');
        localStorage.setItem(STORAGE_SUBSCRIBED, '1');
        closePopup();
      });
  });

  document.getElementById('gwtf-email').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('gwtf-submit').click();
  });
})();
