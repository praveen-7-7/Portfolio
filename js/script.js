/*
  script.js - Interaction layer
  - Custom cursor
  - Reveal on scroll (IntersectionObserver)
  - Parallax / scene updates on scroll
  - Tilt on hover for cards (mouse-driven)
  - Theme toggle with localStorage
  - Touch device detection and optimizations
*/

(() => {
  'use strict';

  // --------- Touch device detection ---------
  const isTouchDevice = () => {
    return (('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0) || 
            (navigator.msMaxTouchPoints > 0));
  };

  // --------- Custom Cursor (smooth) ---------
  const cursor = document.getElementById('cursor');
  let mouseX = 0, mouseY = 0, curX = 0, curY = 0;

  if (!isTouchDevice()) {
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, {passive:true});

    function moveCursor() {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
      cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
      requestAnimationFrame(moveCursor);
    }
    requestAnimationFrame(moveCursor);

    // enlarge cursor on interactive elements
    document.querySelectorAll('.hoverable, a, button').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('big'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('big'));
    });
  } else {
    if (cursor) cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
  }

  // --------- Reveal on scroll ---------
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if(e.isIntersecting) e.target.classList.add('in-view');
    });
  }, {threshold:0.12});
  reveals.forEach(r => io.observe(r));

  // --------- Header blur on scroll ---------
  const siteHeader = document.querySelector('.site-header');
  
  function updateHeaderBlur(){
    const scrollY = window.scrollY || window.pageYOffset;
    if (scrollY > 10) {  /* Add blur when scrolled more than 10px */
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  
  window.addEventListener('scroll', updateHeaderBlur, {passive:true});
  updateHeaderBlur();  /* Check on page load */

  // --------- Parallax / 3D scene updates ---------
  const scene = document.querySelectorAll('[data-3d]');
  function onScroll(){
    const sy = window.scrollY || window.pageYOffset;
    document.documentElement.style.setProperty('--scrollY', sy);
    // disable parallax on touch devices for performance
    if (isTouchDevice()) return;
    // small parallax translation based on position
    scene.forEach(el => {
      const rect = el.getBoundingClientRect();
      const rel = (rect.top + rect.height/2) - (window.innerHeight/2);
      const depth = Math.max(-80, Math.min(120, -rel * 0.05));
      el.style.transform = `translateZ(${depth}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  // --------- Tilt effect for elements with data-tilt ---------
  const tiltEls = document.querySelectorAll('[data-tilt]');
  if (!isTouchDevice()) {
    tiltEls.forEach(el=>{
      el.addEventListener('mousemove', (e)=>{
        const rect = el.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (py - 0.5) * 12; // rotateX
        const ry = (px - 0.5) * -12; // rotateY
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(20px)`;
      });
      el.addEventListener('mouseleave', ()=>{
        el.style.transform = '';
      });
    });
  } else {
    // Remove tilt effect on touch devices
    tiltEls.forEach(el => {
      el.style.transform = '';
    });
  }

  // --------- Mobile menu toggle ---------
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close menu when a link is clicked
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }

  // --------- Certificate Modal ---------
  const certModal = document.getElementById('cert-modal');
  const certModalImage = document.getElementById('cert-modal-image');
  const certModalClose = document.getElementById('cert-modal-close');
  const certCards = document.querySelectorAll('.cert-card');

  // Open modal when certificate is clicked
  certCards.forEach(card => {
    card.addEventListener('click', () => {
      const certPath = card.getAttribute('data-cert');
      if (certPath) {
        certModalImage.src = certPath;
        certModal.classList.add('active');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';  /* Prevent scrolling */
      }
    });
  });

  // Close modal when X button is clicked
  if (certModalClose) {
    certModalClose.addEventListener('click', () => {
      certModal.classList.remove('active');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';  /* Allow scrolling */
    });
  }

  // Close modal when clicking outside the image
  if (certModal) {
    certModal.addEventListener('click', (e) => {
      if (e.target === certModal) {  /* Only close if clicking the dark background */
        certModal.classList.remove('active');
        certModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      }
    });
  }

  // Close modal with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && certModal.classList.contains('active')) {
      certModal.classList.remove('active');
      certModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = 'auto';
    }
  });

  // --------- Theme toggle ---------
  const themeBtn = document.getElementById('theme-toggle');
  const root = document.documentElement;
  const saved = localStorage.getItem('site-theme');
  if(saved) root.setAttribute('data-theme', saved);
  if(themeBtn) {
    themeBtn.addEventListener('click', ()=>{
      const cur = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', cur === 'light' ? 'light' : '');
    localStorage.setItem('site-theme', cur === 'light' ? 'light' : 'dark');
    });
  }

  // --------- Button ripple effect (pure CSS, but ensure ripple elements exist)
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e)=>{
      const t = e.currentTarget.querySelector('.ripple');
      if(!t) return;
      t.classList.remove('animate');
      void t.offsetWidth; // reflow
      t.classList.add('animate');
    });
  });

})();
