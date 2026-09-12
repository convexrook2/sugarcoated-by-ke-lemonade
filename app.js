(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const track = document.getElementById('story-track');
  const cards = [...track.querySelectorAll('.story-card')];
  const pauseButton = document.getElementById('stories-pause');
  const motionButton = document.getElementById('motion-toggle');
  let carouselPaused = reduced.matches;
  let animationsPaused = reduced.matches;
  let pointerInside = false;
  let timer;
  const currentIndex = () => cards.reduce((best, card, i) => Math.abs(card.offsetLeft - cards[0].offsetLeft - track.scrollLeft) < Math.abs(cards[best].offsetLeft - cards[0].offsetLeft - track.scrollLeft) ? i : best, 0);
  const move = (direction, announce = false) => {
    const max = track.scrollWidth - track.clientWidth;
    let next = currentIndex() + direction;
    if (direction > 0 && track.scrollLeft >= max - 4) next = 0;
    if (next < 0) next = cards.length - 1;
    next %= cards.length;
    track.scrollTo({left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: reduced.matches ? 'instant' : 'smooth'});
    if (announce) document.getElementById('story-status').textContent = `Showing ${cards[next].innerText.replace('↗','').trim()}`;
  };
  const update = () => {
    clearInterval(timer);
    pauseButton.textContent = carouselPaused ? 'Play scrolling' : 'Pause scrolling';
    pauseButton.setAttribute('aria-pressed', String(carouselPaused));
    motionButton.textContent = animationsPaused ? 'Play animations' : 'Pause animations';
    motionButton.setAttribute('aria-pressed', String(animationsPaused));
    document.body.classList.toggle('motion-paused', animationsPaused || document.hidden);
    if (!carouselPaused && !animationsPaused && !pointerInside && !track.contains(document.activeElement) && !document.hidden && !reduced.matches) timer = setInterval(() => move(1), 4500);
  };
  pauseButton.addEventListener('click', () => { carouselPaused = !carouselPaused; update(); });
  motionButton.addEventListener('click', () => { animationsPaused = !animationsPaused; update(); });
  document.getElementById('stories-previous').addEventListener('click', () => { move(-1,true); update(); });
  document.getElementById('stories-next').addEventListener('click', () => { move(1,true); update(); });
  track.addEventListener('pointerenter', () => { pointerInside = true; update(); });
  track.addEventListener('pointerleave', () => { pointerInside = false; update(); });
  track.addEventListener('pointerdown', () => { carouselPaused = true; update(); });
  track.addEventListener('focusin', update);
  track.addEventListener('focusout', () => setTimeout(update,0));
  track.addEventListener('keydown', event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault();move(event.key === 'ArrowRight' ? 1 : -1,true);} });
  reduced.addEventListener('change', () => { carouselPaused = reduced.matches; animationsPaused = reduced.matches; update(); });
  document.addEventListener('visibilitychange', update);
  update();

  const loadButton = document.getElementById('load-instagram');
  let embedLoaded = false;
  loadButton.addEventListener('click', async () => {
    const panel = document.getElementById('instagram-post');
    const status = document.getElementById('embed-status');
    panel.hidden = !panel.hidden;
    loadButton.setAttribute('aria-expanded', String(!panel.hidden));
    if (panel.hidden || embedLoaded) return;
    embedLoaded = true;
    try {
      const response = await fetch('instagram-september-embed.html');
      if (!response.ok) throw new Error('Embed unavailable');
      document.getElementById('embed-content').innerHTML = await response.text();
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => { status.textContent = 'Instagram post. If it does not appear, use the link below.'; };
      script.onerror = () => { status.textContent = 'Instagram could not load here. Open the post using the link below.'; };
      document.body.appendChild(script);
      setTimeout(() => { if (status.textContent === 'Loading Instagram…') status.textContent = 'Instagram is taking longer to load. You can open the full post below.'; }, 10000);
    } catch {
      embedLoaded = false;
      status.textContent = 'Instagram could not load here. Open the post using the link below.';
    }
  });
})();
