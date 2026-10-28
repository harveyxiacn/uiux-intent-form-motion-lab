// Motion supports reading. The website has no saved user state or application workflow.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reducedMotion) return;
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('reveal'); observer.unobserve(entry.target); }
  }), { threshold: .1 });
  document.querySelectorAll('.hero-copy > *, .about > *, .section-top > *, .exhibit, .curatorial > *, .visit > *, .faq > *, footer > *').forEach((element, index) => {
    element.style.animationDelay = `${index % 3 * 70}ms`;
    observer.observe(element);
  });
})();
