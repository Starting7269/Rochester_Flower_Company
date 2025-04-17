// Scroll fade-in animation
document.addEventListener('DOMContentLoaded', () => {
  const faders = document.querySelectorAll('.fade-in-on-scroll');

  const appearOnScroll = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.5
  });

  faders.forEach(el => {
    appearOnScroll.observe(el);
  });
});

// Tilt effect
const tiltContainer = document.querySelector('.tilt-wrapper');

document.addEventListener('mousemove', (e) => {
  const x = (window.innerWidth / 2 - e.clientX) / 25;
  const y = (window.innerHeight / 2 - e.clientY) / 25;

  tiltContainer.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

document.addEventListener('mouseleave', () => {
  tiltContainer.style.transform = 'rotateY(0deg) rotateX(0deg)';
});

// Parallax scroll
const parallaxBg = document.querySelector('.parallax-bg');

window.addEventListener('scroll', () => {
  const offset = window.pageYOffset;
  parallaxBg.style.transform = `translateY(${offset * 0.4}px)`;
});
