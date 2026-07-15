document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. CUSTOM INTERACTIVE CURSOR (Global) ───
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursorRing');

  if (cursor && ring) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;

    // Śledzenie ruchu myszy
    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
    });

    // Płynna animacja zewnętrznego pierścienia (Lerp)
    (function animCursor() {
      rx += (mx - rx) * 0.20; // 0.20 dla idealnego balansu opóźnienia i płynności
      ry += (my - ry) * 0.20;
      ring.style.left = rx + 'px';
      ring.style.top = ry + 'px';
      requestAnimationFrame(animCursor);
    })();

    // Zbiorcza interakcja powiększania dla elementów z obu podstron
    const cursorTargets = 'a, button, .portfolio-card, .skill-chip, .slider-btn, .stack-chip, .projlist-item';
    document.addEventListener('mouseover', e => {
      const target = e.target.closest(cursorTargets);
      if (target) {
        cursor.classList.add('big');
        ring.classList.add('big');
      }
    });

    document.addEventListener('mouseout', e => {
      const target = e.target.closest(cursorTargets);
      if (target) {
        cursor.classList.remove('big');
        ring.classList.remove('big');
      }
    });
  }

  // ─── 2. NAVIGATION (Hide on Scroll Down, Show on Scroll Up) ───
  const nav = document.getElementById('mainNav');
  let lastY = 0;
  let ticking = false;
  let menuOpen = false; // Dostępne dla nawigacji oraz menu mobilnego

  function onNavScroll() {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 60);

    // Chowanie nawigacji przy scrollowaniu w dół, pokazywanie w górę (wyłączone przy otwartym menu)
    if (!menuOpen) {
      if (y > lastY && y > 120) {
        nav.classList.add('hidden');
      } else {
        nav.classList.remove('hidden');
      }
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onNavScroll);
      ticking = true;
    }
  }, { passive: true });

  // ─── 3. HAMBURGER & MOBILE MENU SCROLL LOCK (Global) ───
  const burger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let scrollYBeforeMenu = 0;

  function preventTouchMove(e) {
    e.preventDefault();
  }

  function toggleMenu(force) {
    const open = force !== undefined ? force : !menuOpen;
    menuOpen = open;

    if (burger) burger.classList.toggle('open', open);
    if (mobileMenu) mobileMenu.classList.toggle('open', open);
    if (burger) burger.setAttribute('aria-expanded', open);

    if (open) {
      scrollYBeforeMenu = window.scrollY;

      // Blokada scrolla na HTML/BODY
      document.documentElement.classList.add('menu-open');
      document.body.classList.add('menu-open');

      // Blokada gestu ciągnięcia na urządzeniach mobilnych
      document.addEventListener('touchmove', preventTouchMove, { passive: false });
      if (mobileMenu) {
        mobileMenu.addEventListener('touchmove', preventTouchMove, { passive: false });
      }

      if (nav) nav.classList.remove('hidden');
    } else {
      // Odblokowanie scrolla
      document.documentElement.classList.remove('menu-open');
      document.body.classList.remove('menu-open');

      document.removeEventListener('touchmove', preventTouchMove);
      if (mobileMenu) {
        mobileMenu.removeEventListener('touchmove', preventTouchMove);
      }

      // Powrót do poprzedniej pozycji scrolla (zapobiega skokom)
      window.scrollTo(0, scrollYBeforeMenu);
    }
  }

  if (burger) {
    burger.addEventListener('click', () => toggleMenu());
  }

  document.querySelectorAll('.menu-link').forEach(a => {
    a.addEventListener('click', () => toggleMenu(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });

  // ─── 4. SMART NAV LOGO COLLAPSE (Global) ───
  const logoCollapsible = document.querySelector('.logo-collapsible');

  function handleLogoCollapse() {
    if (!logoCollapsible) return;

    const scrollY = window.scrollY;
    const maxScroll = 120; // Dystans zwijania w px

    const progress = Math.min(scrollY / maxScroll, 1);
    const inverseProgress = 1 - progress;

    logoCollapsible.style.maxWidth = `${inverseProgress * 130}px`;
    logoCollapsible.style.opacity = inverseProgress;
  }

  window.addEventListener('scroll', handleLogoCollapse, { passive: true });
  handleLogoCollapse(); // Wywołanie startowe

  // ─── 5. SMOOTH SCROLL (Dla kotwic w obrębie tej samej strony) ───
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ─── 6. TICKER MARQUEE (Strona Główna) ───
  const tickerTrack = document.getElementById('ticker');
  if (tickerTrack) {
    const words = ['Adobe Experience Manager', 'Drupal', 'WordPress', 'Content Editing', 'CMS Strategy', 'Low-Code', 'Webflow Development', 'SEO', 'HTML', 'CSS', 'JavaScript', 'Photoshop'];
    const htmlContent = words.map(w => `<span class="ticker-item">${w}<span class="ticker-dot"></span></span>`).join('');
    tickerTrack.innerHTML = htmlContent + htmlContent;
  }

  // ─── 7. ANIMOWANY LICZNIK STATYSTYK (Strona Główna) ───
  function countUp(el, target, dur = 1600) {
    const suffix = el.dataset.suffix || '';
    let startTimestamp = null;
    (function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / dur, 1);
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(easeOutCubic * target) + suffix;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target + suffix;
      }
    })(performance.now());
  }

  // ─── 8. REVEAL & STATS COUNTER ON SCROLL (Global) ───
  const allReveal = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (allReveal.length > 0) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          const num = e.target.querySelector('[data-target]');
          if (num) countUp(num, +num.dataset.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.13 });
    allReveal.forEach(el => obs.observe(el));
  }

  // ─── 9. REVEAL-LINE (Wydzielone sekcje - Strona Główna) ───
  const lineRevEls = document.querySelectorAll('.reveal-line');
  if (lineRevEls.length > 0) {
    const lineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          lineObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    lineRevEls.forEach(el => lineObs.observe(el));
  }

  // ─── 10. PARALLAX EFFECT (Sekcje Split - Strona Główna) ───
  const pEls = document.querySelectorAll('.parallax-inner');
  function doParallax() {
    pEls.forEach(el => {
      const wrap = el.closest('.split-media');
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const c = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = `translateY(${c * 0.13}px)`;
    });
  }
  if (pEls.length > 0) {
    window.addEventListener('scroll', doParallax, { passive: true });
    doParallax();
  }

  // ─── 11. CHAR SPLIT ANIMATION (Typografia - Strona Główna) ───
  function splitChars(el) {
    const text = el.textContent.trim();
    const wordsArray = text.split(/\s+/);
    let globalCharIndex = 0;

    el.innerHTML = wordsArray.map(word => {
      const charsHTML = word.split('').map(c => {
        const html = `<span class="char-wrap"><span class="char" style="--i:${globalCharIndex}">${c}</span></span>`;
        globalCharIndex++;
        return html;
      }).join('');
      return `<span class="word">${charsHTML}</span>`;
    }).join(' ');
  }

  const charHeadings = document.querySelectorAll('.section-heading, .profile-heading');
  if (charHeadings.length > 0) {
    const charObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('char-anim');
          charObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });

    charHeadings.forEach(el => {
      const strong = el.querySelector('strong');
      if (strong) {
        splitChars(strong);
        charObs.observe(el);
      }
    });
  }

  // ─── 12. SECTION NUMBERS ANIMATION (Strona Główna) ───
  const secNums = document.querySelectorAll('.section-num');
  if (secNums.length > 0) {
    const secObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.color = 'rgba(59,130,246,.14)';
        } else {
          e.target.style.color = '';
        }
      });
    }, { threshold: 0.3 });
    secNums.forEach(el => secObs.observe(el));
  }

  // ─── 13. VERTICAL SLIDER (Strona Główna) ───
  const vItems = document.querySelectorAll('.vslider-item');
  const vSlides = document.querySelectorAll('.vslider-slide');
  const vTrack = document.getElementById('vsliderTrack');
  const vRight = document.getElementById('vsliderRight');
  const vPipsWrap = document.getElementById('vsliderPips');
  let vActive = 0;
  let vAuto;

  if (vSlides.length > 0 && vPipsWrap) {
    vSlides.forEach((_, i) => {
      const pip = document.createElement('div');
      pip.className = 'vslider-pip' + (i === 0 ? ' active' : '');
      pip.addEventListener('click', () => goToVSlide(i));
      vPipsWrap.appendChild(pip);
    });
  }

  function goToVSlide(idx) {
    if (!vItems.length || !vSlides.length || !vPipsWrap || !vRight || !vTrack) return;
    vItems[vActive].classList.remove('active');
    vSlides[vActive].classList.remove('active');
    vPipsWrap.children[vActive].classList.remove('active');
    vActive = idx;
    vItems[vActive].classList.add('active');
    vSlides[vActive].classList.add('active');
    vPipsWrap.children[vActive].classList.add('active');

    const slideH = vRight.clientHeight;
    vTrack.style.transform = `translateY(-${vActive * slideH}px)`;
  }

  if (vItems.length > 0) {
    vItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        clearInterval(vAuto);
        goToVSlide(i);
        startVAuto();
      });
    });
  }

  function startVAuto() {
    if (!vSlides.length) return;
    vAuto = setInterval(() => {
      goToVSlide((vActive + 1) % vSlides.length);
    }, 4000);
  }

  if (vSlides.length > 0) {
    startVAuto();
    window.addEventListener('resize', () => {
      if (vRight && vTrack) {
        const slideH = vRight.clientHeight;
        vTrack.style.transform = `translateY(-${vActive * slideH}px)`;
      }
    });
  }

  // ─── 14. HOVER PROJECT PREVIEW FOLLOW (Strona Główna) ───
  const projItems = document.querySelectorAll('.projlist-item');
  const projPreview = document.getElementById('projPreview');
  const projPreviewImg = document.getElementById('projPreviewImg');

  if (projPreview && projItems.length > 0) {
    let previewX = 0, previewY = 0, targetX = 0, targetY = 0;

    (function lerpPreview() {
      previewX += (targetX - previewX) * 0.1;
      previewY += (targetY - previewY) * 0.1;
      projPreview.style.left = previewX + 'px';
      projPreview.style.top = previewY + 'px';
      requestAnimationFrame(lerpPreview);
    })();

    document.addEventListener('mousemove', e => {
      targetX = e.clientX + 30;
      targetY = e.clientY - 100;
    });

    projItems.forEach(item => {
      const imgSrc = item.dataset.img;
      item.addEventListener('mouseenter', () => {
        if (projPreviewImg) {
          projPreviewImg.src = imgSrc;
          projPreview.classList.add('visible');
        }
      });
      item.addEventListener('mouseleave', () => {
        projPreview.classList.remove('visible');
      });
    });
  }

  // ─── 15. THREE.JS WIREFRAME SPHERE (Strona Główna - O nas) ───
  (function initThreeSphere() {
    const container = document.getElementById('profileCanvas');
    if (!container || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    const W = container.clientWidth || 480;
    const H = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0x1a2a5e, 1.2));

    const pointA = new THREE.PointLight(0x3b82f6, 6, 20);
    pointA.position.set(4, 4, 4);
    scene.add(pointA);

    const pointB = new THREE.PointLight(0x60a5fa, 3, 15);
    pointB.position.set(-4, -2, 2);
    scene.add(pointB);

    const pointC = new THREE.PointLight(0x1d4ed8, 4, 18);
    pointC.position.set(0, -4, -3);
    scene.add(pointC);

    const icoGeo = new THREE.IcosahedronGeometry(1.55, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);

    const particleCount = 320;
    const pPositions = new Float32Array(particleCount * 3);
    const pSizes = new Float32Array(particleCount);
    const pAngles = new Float32Array(particleCount);
    const pRadii = new Float32Array(particleCount);
    const pSpeeds = new Float32Array(particleCount);
    const pTilts = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pAngles[i] = Math.random() * Math.PI * 2;
      pRadii[i] = 1.6 + Math.random() * 1.4;
      pSpeeds[i] = (0.12 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1);
      pTilts[i] = (Math.random() - 0.5) * Math.PI;
      pSizes[i] = Math.random() * 2.8 + 0.8;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    let visible = false;
    const ioObs = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    ioObs.observe(container);

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      t += 0.012;

      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      ico.rotation.y += 0.006;
      ico.rotation.x += 0.003;
      ico.rotation.z = targetX * 0.12;

      pointA.position.x = Math.sin(t * 0.7) * 5 + targetX * 1.5;
      pointA.position.y = Math.cos(t * 0.5) * 4 + targetY * 1.5;
      pointB.position.x = Math.cos(t * 0.6) * -4;
      pointB.position.y = Math.sin(t * 0.8) * 3;

      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pAngles[i] += pSpeeds[i] * 0.003;
        const r = pRadii[i];
        const a = pAngles[i];
        const tl = pTilts[i] + t * 0.015;
        pos[i * 3] = r * Math.cos(a) * Math.cos(tl);
        pos[i * 3 + 1] = r * Math.sin(a);
        pos[i * 3 + 2] = r * Math.cos(a) * Math.sin(tl);
      }
      pGeo.attributes.position.needsUpdate = true;

      camera.position.x = targetX * 0.3;
      camera.position.y = -targetY * 0.3;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();
  })();

  // ─── 16. THREE.JS WIREFRAME TORUS (Strona Główna - Kontakt) ───
  (function initThreeTorus() {
    const container = document.getElementById('contactCanvas');
    if (!container || typeof THREE === 'undefined') return;

    const W = () => container.offsetWidth;
    const H = () => container.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, W() / H(), 0.1, 200);
    camera.position.set(0, 0, 7);

    scene.add(new THREE.AmbientLight(0x1a2a5e, 1.0));
    const pl1 = new THREE.PointLight(0x3b82f6, 5, 30);
    pl1.position.set(5, 5, 8);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x60a5fa, 2.5, 20);
    pl2.position.set(-6, -3, 4);
    scene.add(pl2);

    const torusGeo = new THREE.TorusGeometry(2.6, 0.95, 32, 120);
    const torusMesh = new THREE.Mesh(torusGeo, new THREE.MeshBasicMaterial({
      color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.16
    }));
    const torusEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(torusGeo, 1),
      new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.4 })
    );
    const torusGroup = new THREE.Group();
    torusGroup.add(torusMesh, torusEdge);
    scene.add(torusGroup);

    const outerGeo = new THREE.TorusGeometry(2.9, 1.05, 16, 80);
    const outerMesh = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({
      color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.05
    }));
    scene.add(outerMesh);

    const pCount = 220;
    const pPos = new Float32Array(pCount * 3);
    const pVel = [];
    for (let i = 0; i < pCount; i++) {
      const u = Math.random() * Math.PI * 2;
      const v = Math.random() * Math.PI * 2;
      const R = 2.6, r = 0.95 + Math.random() * 0.9;
      pPos[i * 3] = (R + r * Math.cos(v)) * Math.cos(u);
      pPos[i * 3 + 1] = (R + r * Math.cos(v)) * Math.sin(u);
      pPos[i * 3 + 2] = r * Math.sin(v);
      pVel.push({ x: (Math.random() - .5) * .008, y: (Math.random() - .5) * .008, z: (Math.random() - .5) * .008 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pointsMesh = new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x93c5fd, size: 0.045, transparent: true, opacity: 0.6, sizeAttenuation: true
    }));
    scene.add(pointsMesh);

    let mx = 0, my = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX / window.innerWidth - .5) * 2;
      my = (e.clientY / window.innerHeight - .5) * 2;
    });

    function applyResponsiveScale() {
      const w = W(), h = H();
      if (!w || !h) return;
      const refH = 900, refW = 1100;
      const scaleFromHeight = h / refH;
      const scaleFromWidth = w / refW;
      const s = Math.min(scaleFromHeight, scaleFromWidth, 1.15);
      const finalScale = Math.max(0.42, Math.min(s, 1.15));
      torusGroup.scale.setScalar(finalScale);
      outerMesh.scale.setScalar(finalScale);
      pointsMesh.scale.setScalar(finalScale);
    }

    new ResizeObserver(() => {
      renderer.setSize(W(), H());
      camera.aspect = W() / H();
      camera.updateProjectionMatrix();
      applyResponsiveScale();
    }).observe(container);
    applyResponsiveScale();

    let vis = false;
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }, { threshold: .05 }).observe(container);

    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      if (!vis) return;
      t += 0.006;
      tx += (mx - tx) * 0.03;
      ty += (my - ty) * 0.03;

      torusGroup.rotation.x = 0.5 + t * 0.18 - ty * 0.15;
      torusGroup.rotation.y = t * 0.26 + tx * 0.15;
      outerMesh.rotation.x = torusGroup.rotation.x * 0.7;
      outerMesh.rotation.y = -t * 0.12;

      pl1.position.x = Math.sin(t * 0.6) * 8 + tx * 3;
      pl1.position.y = Math.cos(t * 0.4) * 6 + ty * 3;

      for (let i = 0; i < pCount; i++) {
        pPos[i * 3] += pVel[i].x;
        pPos[i * 3 + 1] += pVel[i].y;
        pPos[i * 3 + 2] += pVel[i].z;
        const d = Math.sqrt(pPos[i * 3] ** 2 + pPos[i * 3 + 1] ** 2 + pPos[i * 3 + 2] ** 2);
        if (d > 4.2 || d < 1.2) { pVel[i].x *= -1; pVel[i].y *= -1; pVel[i].z *= -1; }
      }
      pGeo.attributes.position.needsUpdate = true;

      camera.position.x = tx * 0.4;
      camera.position.y = -ty * 0.3;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();
  })();

  // ─── 17. GALLERY SLIDER (Podstrona Projektu) ───
  const sliderTrack = document.getElementById('sliderTrack');
  const slides = Array.from(sliderTrack ? sliderTrack.children : []);
  const sliderNextBtn = document.getElementById('sliderNext');
  const sliderPrevBtn = document.getElementById('sliderPrev');
  const dotsContainer = document.getElementById('sliderDots');
  const slideCounter = document.getElementById('slideCounter');

  if (sliderTrack && slides.length > 0) {
    let currentSlideIndex = 0;

    // Tworzenie kropek nawigacyjnych
    if (dotsContainer) {
      slides.forEach((_, idx) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (idx === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToProjectSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer ? Array.from(dotsContainer.children) : [];

    // Przesunięcie procentowe — niezależne od pomiarów offsetWidth,
    // eliminuje narastający gap przy kolejnych slajdach.
    function updateProjectSlider() {
      sliderTrack.style.transform = `translateX(-${currentSlideIndex * 100}%)`;

      // Aktualizacja aktywnych kropek
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentSlideIndex);
      });

      // Aktualizacja licznika slajdów
      if (slideCounter) {
        slideCounter.textContent = `${currentSlideIndex + 1} / ${slides.length}`;
      }
    }

    function goToProjectSlide(index) {
      currentSlideIndex = index;
      updateProjectSlider();
    }

    if (sliderNextBtn) {
      sliderNextBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        updateProjectSlider();
      });
    }

    if (sliderPrevBtn) {
      sliderPrevBtn.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateProjectSlider();
      });
    }

    updateProjectSlider(); // Ustawienie stanu startowego
  }

});