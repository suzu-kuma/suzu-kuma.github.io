(() => {
  const slides = document.querySelector('#slides');
  const pages = [...slides.querySelectorAll('.slide')];
  const previous = document.querySelector('#prev');
  const next = document.querySelector('#next');
  const currentLabel = document.querySelector('#current-page');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let target = 0;
  let frame;

  function update(index) {
    current = index;
    currentLabel.textContent = index + 1;
    previous.disabled = index === 0;
    next.disabled = index === pages.length - 1;
    document.querySelector('.lp').classList.toggle('booking-active', index === pages.length - 1);
    pages.forEach((page, i) => { page.inert = i !== index; });
  }

  function goTo(index) {
    target = Math.max(0, Math.min(pages.length - 1, index));
    slides.scrollTo({ left: target * slides.clientWidth, behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }

  previous.addEventListener('click', () => goTo(target - 1));
  next.addEventListener('click', () => goTo(target + 1));
  document.querySelector('.cta-button').addEventListener('click', () => {
    const booking = document.querySelector('#booking');
    booking.scrollTop = 0;
    goTo(pages.length - 1);
    if (current === pages.length - 1) document.querySelector('#booking-title').focus({ preventScroll: true });
    else slides.addEventListener('scrollend', () => document.querySelector('#booking-title').focus({ preventScroll: true }), { once: true });
  });
  slides.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => update(Math.round(slides.scrollLeft / slides.clientWidth)));
  }, { passive: true });
  slides.addEventListener('scrollend', () => { target = current; });
  // スワイプ開始時は、現在表示中のページから操作を再開します。
  slides.addEventListener('pointerdown', () => { target = current; }, { passive: true });
  document.addEventListener('keydown', event => {
    if (event.target.closest('form') || event.target.matches('[contenteditable="true"]')) return;
    const destinations = { ArrowLeft: target - 1, ArrowRight: target + 1, Home: 0, End: pages.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    goTo(destinations[event.key]);
  });
  // 画面回転やウィンドウ幅の変更後も、同じページを維持します。
  new ResizeObserver(() => {
    slides.scrollTo({ left: current * slides.clientWidth, behavior: 'instant' });
    target = current;
  }).observe(slides);
  update(0);
  if (window.location.hash === '#booking') goTo(pages.length - 1);

})();
