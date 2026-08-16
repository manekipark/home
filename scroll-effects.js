const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (!prefersReducedMotion.matches && 'IntersectionObserver' in window) {
  const revealTargets = [];

  document.querySelectorAll('.feature').forEach(section => {
    const image = section.querySelector('.media-frame');
    if (image) revealTargets.push({ element: image, delay: 0, image: true });
    section.querySelectorAll('.copy > *').forEach((element, index) => {
      revealTargets.push({ element, delay: 90 + index * 85 });
    });
  });

  document.querySelectorAll('.card-grid article').forEach((element, index) => {
    revealTargets.push({ element, delay: index * 110, image: true });
  });

  document.querySelectorAll('.content-shell > hr').forEach(element => {
    element.classList.add('scroll-rule');
    revealTargets.push({ element, delay: 0 });
  });

  const video = document.querySelector('.video');
  if (video) revealTargets.push({ element: video, delay: 80 });

  revealTargets.forEach(({ element, delay, image }) => {
    element.classList.add('scroll-reveal');
    if (image) element.classList.add('scroll-reveal-image');
    element.style.setProperty('--reveal-delay', `${delay}ms`);
  });

  document.documentElement.classList.add('scroll-effects');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

  revealTargets.forEach(({ element }) => observer.observe(element));
}
