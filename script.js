// Auto Botics — getautobotics.com

// Header border once the page scrolls
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = open ? 'Close' : 'Menu';
});
nav.addEventListener('click', (e) => {
  if (e.target.closest('a') && nav.classList.contains('open')) toggle.click();
});

// Example day: manual vs automated
const day = document.querySelector('.day');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
day.querySelectorAll('.tasks li').forEach((li, i) => li.style.setProperty('--i', i));

function setMode(mode) {
  day.dataset.mode = mode;
  day.querySelectorAll('.switch button').forEach((b) =>
    b.setAttribute('aria-pressed', String(b.dataset.set === mode)));
  day.querySelectorAll('[data-manual]').forEach((el) => {
    if (!el.classList.contains('total')) el.textContent = el.dataset[mode];
  });
  countTo(mode === 'auto' ? 10 : 320);
}

// Animate the owner's total time between values (in minutes)
const totalEl = day.querySelector('.total');
let current = 320;
let frame;
const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m` : `${m}m`);

function countTo(target) {
  cancelAnimationFrame(frame);
  if (reduceMotion) { current = target; totalEl.textContent = fmt(target); return; }
  const start = current;
  const t0 = performance.now();
  const dur = 900;
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    const eased = 1 - Math.pow(1 - p, 3);
    current = Math.round(start + (target - start) * eased);
    totalEl.textContent = fmt(current);
    if (p < 1) frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
}

day.querySelectorAll('.switch button').forEach((b) =>
  b.addEventListener('click', () => setMode(b.dataset.set)));
setMode('manual');

// Contact form
// No backend yet: this opens the visitor's email app with the details filled in.
// To collect submissions directly, point the form at a service such as Formspree or Netlify Forms.
const CONTACT_EMAIL = 'hello@getautobotics.com';
const form = document.getElementById('contact-form');
const status = form.querySelector('.form-status');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  form.name.setAttribute('aria-invalid', String(!name));
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  form.email.setAttribute('aria-invalid', String(!emailOk));

  if (!name || !emailOk) {
    status.className = 'form-status error';
    status.textContent = !name
      ? 'Add your name so we know who to reply to.'
      : 'Enter a valid email address, like you@yourbusiness.com.';
    (!name ? form.name : form.email).focus();
    return;
  }

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    `Business: ${form.company.value.trim() || '-'}`,
    '',
    form.message.value.trim(),
  ].join('\n');
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Consultation request from ' + name)}&body=${encodeURIComponent(body)}`;
  status.className = 'form-status ok';
  status.textContent = 'Your email app should open with your request ready to send.';
});

document.getElementById('year').textContent = new Date().getFullYear();
