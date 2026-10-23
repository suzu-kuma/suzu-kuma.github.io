const slides = document.getElementById('slides');
const prev   = document.getElementById('prev');
const next   = document.getElementById('next');
const cur    = document.getElementById('current-page');
const total  = 9;
let page = 1;

function update() {
  cur.textContent = page;
  prev.disabled = page === 1;
  next.disabled = page === total;
}

function go(n) {
  page = Math.max(1, Math.min(total, n));
  slides.scrollTo({ left: (page - 1) * slides.offsetWidth, behavior: 'smooth' });
  update();
}

prev.addEventListener('click', () => go(page - 1));
next.addEventListener('click', () => go(page + 1));

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') go(page + 1);
  if (e.key === 'ArrowLeft')  go(page - 1);
});

// スクロールで現在ページを同期
let t;
slides.addEventListener('scroll', () => {
  clearTimeout(t);
  t = setTimeout(() => {
    const n = Math.round(slides.scrollLeft / slides.offsetWidth) + 1;
    if (n !== page) { page = n; update(); }
  }, 80);
}, { passive: true });

update();
