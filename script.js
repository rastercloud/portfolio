/* ════════════════════════════════════════
   MAIN SITE INTERACTIONS
   (cursor, nav, ticker, reveal, parallax, sliders, etc.)
   ════════════════════════════════════════ */
    // CURSOR
    const cursor = document.getElementById('cursor');
    const ring   = document.getElementById('cursorRing');
    let mx=window.innerWidth/2, my=window.innerHeight/2, rx=mx, ry=my;
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      cursor.style.left=mx+'px'; cursor.style.top=my+'px';
    });
    (function anim(){
      rx+=(mx-rx)*.25; ry+=(my-ry)*.25;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(anim);
    })();
    document.querySelectorAll('a,button,.portfolio-card,.skill-chip').forEach(el=>{
      el.addEventListener('mouseenter',()=>{cursor.classList.add('big');ring.classList.add('big');});
      el.addEventListener('mouseleave',()=>{cursor.classList.remove('big');ring.classList.remove('big');});
    });

    // NAV — hide on scroll down, show on scroll up
    const nav=document.getElementById('mainNav');
    let lastY=0, ticking=false;
    let menuOpen=false; // declared here so onNavScroll can access it
    function onNavScroll(){
      const y=window.scrollY;
      nav.classList.toggle('scrolled', y>60);
      // hide on scroll down, show on scroll up — but not while menu is open
      if(!menuOpen){
        if(y>lastY && y>120){
          nav.classList.add('hidden');
        } else {
          nav.classList.remove('hidden');
        }
      }
      lastY=y;
      ticking=false;
    }
    window.addEventListener('scroll',()=>{ if(!ticking){ requestAnimationFrame(onNavScroll); ticking=true; } },{passive:true});

    // TICKER
    const words=['Content Editing','Webflow Development','CMS Strategy','WordPress','Drupal','Figma','Low-Code','UX Writing','SEO Content','HTML & CSS','JavaScript','Photoshop'];
    const track=document.getElementById('ticker');
    const html=words.map(w=>`<span class="ticker-item">${w}<span class="ticker-dot"></span></span>`).join('');
    track.innerHTML=html+html;

    // COUNTER
    function countUp(el,target,dur=1600){
      const suffix = el.dataset.suffix || '';
      let s=null;
      (function step(ts){
        if(!s)s=ts;
        const p=Math.min((ts-s)/dur,1);
        const e=1-Math.pow(1-p,3);
        el.textContent=Math.round(e*target)+suffix;
        if(p<1)requestAnimationFrame(step); else el.textContent=target+suffix;
      })(performance.now());
    }

    // REVEAL
    const allReveal=document.querySelectorAll('.reveal,.reveal-left,.reveal-right');
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('visible');
          const num=e.target.querySelector('[data-target]');
          if(num) countUp(num,+num.dataset.target);
          obs.unobserve(e.target);
        }
      });
    },{threshold:.13});
    allReveal.forEach(el=>obs.observe(el));

    // PARALLAX
    const pEls=document.querySelectorAll('.parallax-inner');
    function doParallax(){
      pEls.forEach(el=>{
        const wrap=el.closest('.split-media');
        if(!wrap)return;
        const r=wrap.getBoundingClientRect();
        const c=r.top+r.height/2-innerHeight/2;
        el.style.transform=`translateY(${c*.13}px)`;
      });
    }
    window.addEventListener('scroll',doParallax,{passive:true});
    doParallax();

    // HAMBURGER
    const burger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');
    let scrollYBeforeMenu = 0;

    function toggleMenu(force) {
      const open = force !== undefined ? force : !menuOpen;
      menuOpen = open;
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);

      if(open) {
        // iOS-safe scroll lock: freeze body at current position
        scrollYBeforeMenu = window.scrollY;
        document.body.style.position   = 'fixed';
        document.body.style.top        = `-${scrollYBeforeMenu}px`;
        document.body.style.left       = '0';
        document.body.style.right      = '0';
        document.body.style.overflow   = 'hidden';
        // keep nav visible while menu open
        nav.classList.remove('hidden');
      } else {
        // restore scroll position
        document.body.style.position   = '';
        document.body.style.top        = '';
        document.body.style.left       = '';
        document.body.style.right      = '';
        document.body.style.overflow   = '';
        window.scrollTo(0, scrollYBeforeMenu);
      }
    }
    burger.addEventListener('click', () => toggleMenu());
    document.querySelectorAll('.menu-link').forEach(a => {
      a.addEventListener('click', () => toggleMenu(false));
    });
    document.addEventListener('keydown', e => { if(e.key==='Escape') toggleMenu(false); });

    // SMOOTH SCROLL
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{
        const t=document.querySelector(a.getAttribute('href'));
        if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
      });
    });

    // ── REVEAL-LINE: also observe split-media elements ──
    const lineRevEls = document.querySelectorAll('.reveal-line');
    const lineObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){ e.target.classList.add('visible'); lineObs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    lineRevEls.forEach(el => lineObs.observe(el));

    // ── CHAR SPLIT ANIMATION on section headings ──
    function splitChars(el) {
      const text = el.textContent;
      el.innerHTML = text.split('').map((c, i) =>
        c === ' ' ? ' ' : `<span class="char-wrap"><span class="char" style="--i:${i}">${c}</span></span>`
      ).join('');
    }
    const charHeadings = document.querySelectorAll('.section-heading, .profile-heading');
    const charObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('char-anim');
          charObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    charHeadings.forEach(el => {
      // only animate the strong (bold) part
      const strong = el.querySelector('strong');
      if(strong){ splitChars(strong); charObs.observe(el); }
    });

    // ── SECTION ENTRANCE: count-up section numbers on scroll ──
    const secNums = document.querySelectorAll('.section-num');
    const secObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting) e.target.style.color = 'rgba(59,130,246,.14)';
        else e.target.style.color = '';
      });
    }, { threshold: 0.3 });
    secNums.forEach(el => secObs.observe(el));

    // ── VERTICAL SLIDER ──
    const vItems    = document.querySelectorAll('.vslider-item');
    const vSlides   = document.querySelectorAll('.vslider-slide');
    const vTrack    = document.getElementById('vsliderTrack');
    const vRight    = document.getElementById('vsliderRight');
    const vPipsWrap = document.getElementById('vsliderPips');
    let vActive = 0;
    let vAuto;

    // build progress pips
    vSlides.forEach((_, i) => {
      const pip = document.createElement('div');
      pip.className = 'vslider-pip' + (i === 0 ? ' active' : '');
      pip.addEventListener('click', () => goToSlide(i));
      vPipsWrap.appendChild(pip);
    });

    function goToSlide(idx) {
      vItems[vActive].classList.remove('active');
      vSlides[vActive].classList.remove('active');
      vPipsWrap.children[vActive].classList.remove('active');
      vActive = idx;
      vItems[vActive].classList.add('active');
      vSlides[vActive].classList.add('active');
      vPipsWrap.children[vActive].classList.add('active');
      // move track
      const slideH = vRight.clientHeight;
      vTrack.style.transform = `translateY(-${vActive * slideH}px)`;
    }

    vItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        clearInterval(vAuto);
        goToSlide(i);
        startAuto();
      });
    });

    function startAuto() {
      vAuto = setInterval(() => {
        goToSlide((vActive + 1) % vSlides.length);
      }, 4000);
    }
    startAuto();

    // recalc on resize
    window.addEventListener('resize', () => {
      const slideH = vRight.clientHeight;
      vTrack.style.transform = `translateY(-${vActive * slideH}px)`;
    });


    // ── HOVER PROJECT LIST ──
    const projItems   = document.querySelectorAll('.projlist-item');
    const projPreview = document.getElementById('projPreview');
    const projPreviewImg = document.getElementById('projPreviewImg');
    let previewX = 0, previewY = 0, targetX = 0, targetY = 0;
    let animFrame;

    function lerpPreview() {
      previewX += (targetX - previewX) * 0.1;
      previewY += (targetY - previewY) * 0.1;
      projPreview.style.left = previewX + 'px';
      projPreview.style.top  = previewY + 'px';
      animFrame = requestAnimationFrame(lerpPreview);
    }
    lerpPreview();

    document.addEventListener('mousemove', e => {
      targetX = e.clientX + 30;
      targetY = e.clientY - 100;
    });

    projItems.forEach(item => {
      const imgSrc = item.dataset.img;
      item.addEventListener('mouseenter', () => {
        projPreviewImg.src = imgSrc;
        projPreview.classList.add('visible');
      });
      item.addEventListener('mouseleave', () => {
        projPreview.classList.remove('visible');
      });
    });


/* ════════════════════════════════════════
   PROFILE SECTION — Three.js wireframe sphere
   (requires three.min.js loaded via CDN in HTML)
   ════════════════════════════════════════ */
  (function() {
    const container = document.getElementById('profileCanvas');
    if (!container) return;

    // ── SCENE SETUP ──
    const scene    = new THREE.Scene();
    const W = container.clientWidth  || 480;
    const H = container.clientHeight || 480;
    const camera   = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // ── LIGHTS ──
    const ambient = new THREE.AmbientLight(0x1a2a5e, 1.2);
    scene.add(ambient);

    const pointA = new THREE.PointLight(0x3b82f6, 6, 20);
    pointA.position.set(4, 4, 4);
    scene.add(pointA);

    const pointB = new THREE.PointLight(0x60a5fa, 3, 15);
    pointB.position.set(-4, -2, 2);
    scene.add(pointB);

    const pointC = new THREE.PointLight(0x1d4ed8, 4, 18);
    pointC.position.set(0, -4, -3);
    scene.add(pointC);



    // ── WIREFRAME ICOSAHEDRON ──
    const icoGeo  = new THREE.IcosahedronGeometry(1.55, 1);
    const icoMat  = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      wireframe: true,
      transparent: true,
      opacity: 0.18,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    scene.add(ico);



    // ── ORBITING PARTICLES ──
    const particleCount = 320;
    const pPositions    = new Float32Array(particleCount * 3);
    const pSizes        = new Float32Array(particleCount);
    const pAngles       = new Float32Array(particleCount);
    const pRadii        = new Float32Array(particleCount);
    const pSpeeds       = new Float32Array(particleCount);
    const pTilts        = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      pAngles[i] = Math.random() * Math.PI * 2;
      pRadii[i]  = 1.6 + Math.random() * 1.4;
      pSpeeds[i] = (0.12 + Math.random() * 0.22) * (Math.random() > 0.5 ? 1 : -1);
      pTilts[i]  = (Math.random() - 0.5) * Math.PI;
      pSizes[i]  = Math.random() * 2.8 + 0.8;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('size',     new THREE.BufferAttribute(pSizes,     1));

    const pMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.035,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.75,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── MOUSE TRACKING ──
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', e => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── RESIZE ──
    const resizeObserver = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    resizeObserver.observe(container);

    // ── INTERSECTION OBSERVER (pause when off-screen) ──
    let visible = false;
    const ioObs = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    ioObs.observe(container);

    // ── ANIMATE ──
    let t = 0;
    function animate() {
      requestAnimationFrame(animate);
      if (!visible) return;
      t += 0.012;

      // smooth mouse follow
      targetX += (mouseX - targetX) * 0.04;
      targetY += (mouseY - targetY) * 0.04;

      // orbit wireframe
      ico.rotation.y += 0.006;
      ico.rotation.x += 0.003;
      ico.rotation.z  = targetX * 0.12;

      // point light orbit
      pointA.position.x = Math.sin(t * 0.7) * 5 + targetX * 1.5;
      pointA.position.y = Math.cos(t * 0.5) * 4 + targetY * 1.5;
      pointB.position.x = Math.cos(t * 0.6) * -4;
      pointB.position.y = Math.sin(t * 0.8) * 3;

      // update particles
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        pAngles[i] += pSpeeds[i] * 0.003;
        const r  = pRadii[i];
        const a  = pAngles[i];
        const tl = pTilts[i] + t * 0.015;
        pos[i*3]   = r * Math.cos(a) * Math.cos(tl);
        pos[i*3+1] = r * Math.sin(a);
        pos[i*3+2] = r * Math.cos(a) * Math.sin(tl);
      }
      pGeo.attributes.position.needsUpdate = true;

      // subtle camera sway
      camera.position.x = targetX * 0.3;
      camera.position.y = -targetY * 0.3;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    }
    animate();
  })();

/* ════════════════════════════════════════
   CONTACT SECTION — Three.js wireframe sphere + particles
   (requires three.min.js loaded via CDN in HTML)
   ════════════════════════════════════════ */
  /* ══════════════════════════════════════════════════
     CONTACT — 3D wireframe sphere (same style as profile)
     Full-background, transparent canvas, cream bg shows
  ══════════════════════════════════════════════════ */
  (function(){
    const container = document.getElementById('contactCanvas');
    if(!container || typeof THREE === 'undefined') return;

    const W = () => container.offsetWidth;
    const H = () => container.offsetHeight;

    const renderer = new THREE.WebGLRenderer({ canvas: container, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, W()/H(), 0.1, 200);
    camera.position.set(0, 0, 6.5);

    /* LIGHTS */
    scene.add(new THREE.AmbientLight(0x1a2a5e, 1.0));
    const pl1 = new THREE.PointLight(0x3b82f6, 5, 30);
    pl1.position.set(5, 5, 8);
    scene.add(pl1);
    const pl2 = new THREE.PointLight(0x60a5fa, 2.5, 20);
    pl2.position.set(-6, -3, 4);
    scene.add(pl2);

    /* MAIN: large wireframe icosahedron sphere */
    const icoGeo  = new THREE.IcosahedronGeometry(2.3, 2);
    const icoMesh = new THREE.Mesh(icoGeo, new THREE.MeshBasicMaterial({
      color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.14
    }));
    const icoEdge = new THREE.LineSegments(
      new THREE.EdgesGeometry(icoGeo),
      new THREE.LineBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.38 })
    );
    const icoGroup = new THREE.Group();
    icoGroup.add(icoMesh, icoEdge);
    scene.add(icoGroup);

    /* OUTER glow sphere */
    const outerGeo = new THREE.IcosahedronGeometry(2.6, 1);
    const outerMesh = new THREE.Mesh(outerGeo, new THREE.MeshBasicMaterial({
      color: 0x3b82f6, wireframe: true, transparent: true, opacity: 0.05
    }));
    scene.add(outerMesh);

    /* PARTICLES */
    const pCount = 220;
    const pPos   = new Float32Array(pCount * 3);
    const pVel   = [];
    for(let i = 0; i < pCount; i++){
      const r = 2.0 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pPos[i*3+2] = r * Math.cos(phi);
      pVel.push({ x: (Math.random()-.5)*.008, y: (Math.random()-.5)*.008, z: (Math.random()-.5)*.006 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({
      color: 0x93c5fd, size: 0.04, transparent: true, opacity: 0.6, sizeAttenuation: true
    })));

    /* MOUSE */
    let mx=0, my=0, tx=0, ty=0;
    document.addEventListener('mousemove', e => {
      mx = (e.clientX/innerWidth  - .5) * 2;
      my = (e.clientY/innerHeight - .5) * 2;
    });

    /* RESIZE */
    new ResizeObserver(() => {
      renderer.setSize(W(), H());
      camera.aspect = W()/H();
      camera.updateProjectionMatrix();
    }).observe(container);

    /* VISIBILITY */
    let vis = false;
    new IntersectionObserver(e => { vis = e[0].isIntersecting; }, {threshold:.05}).observe(container);

    let t = 0;
    function animate(){
      requestAnimationFrame(animate);
      if(!vis) return;
      t += 0.007;
      tx += (mx - tx) * 0.03;
      ty += (my - ty) * 0.03;

      icoGroup.rotation.y = t * 0.3;
      icoGroup.rotation.x = t * 0.12 - ty * 0.12;
      icoGroup.rotation.z = tx * 0.08;
      outerMesh.rotation.y = -t * 0.15;
      outerMesh.rotation.x =  t * 0.08;

      pl1.position.x = Math.sin(t * 0.6) * 8 + tx * 3;
      pl1.position.y = Math.cos(t * 0.4) * 6 + ty * 3;

      for(let i = 0; i < pCount; i++){
        pPos[i*3]   += pVel[i].x;
        pPos[i*3+1] += pVel[i].y;
        pPos[i*3+2] += pVel[i].z;
        const d = Math.sqrt(pPos[i*3]**2 + pPos[i*3+1]**2 + pPos[i*3+2]**2);
        if(d > 4 || d < 1.5){ pVel[i].x*=-1; pVel[i].y*=-1; pVel[i].z*=-1; }
      }
      pGeo.attributes.position.needsUpdate = true;

      camera.position.x = tx * 0.4;
      camera.position.y = -ty * 0.3;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    }
    animate();
  })();
