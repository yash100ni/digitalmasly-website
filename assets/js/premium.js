/* =========================================================
   DIGITAL MASLY — PREMIUM REDESIGN
   Vanilla JS + GSAP + Lenis (all loaded via CDN in index.html)
   Every effect degrades gracefully if a library fails to load.
   ========================================================= */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ---------------------------------------------------
     LENIS SMOOTH SCROLL
  --------------------------------------------------- */
  var lenis = null;
  if (!reduceMotion && typeof window.Lenis !== "undefined") {
    lenis = new Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.update();
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  window.__lenis = lenis;

  /* ---------------------------------------------------
     PRELOADER
  --------------------------------------------------- */
  var preloader = document.querySelector(".preloader");
  var pct = document.querySelector(".preloader-pct");
  var bar = document.querySelector(".preloader-bar");
  var markSpans = document.querySelectorAll(".preloader-mark span");

  function finishPreload() {
    if (!preloader) { document.body.classList.add("is-ready"); startHero(); return; }
    var tl = hasGSAP ? gsap.timeline() : null;
    if (tl) {
      tl.to(preloader, { autoAlpha: 0, duration: 0.7, ease: "power2.inOut" })
        .set(preloader, { display: "none" })
        .call(function () { document.body.classList.add("is-ready"); startHero(); });
    } else {
      preloader.style.display = "none";
      document.body.classList.add("is-ready");
      startHero();
    }
  }

  (function runPreloader() {
    if (!preloader) { startHero(); return; }
    if (hasGSAP) {
      gsap.set(markSpans, { y: 14, opacity: 0 });
      gsap.to(markSpans, { y: 0, opacity: 1, duration: 0.6, stagger: 0.03, ease: "power3.out" });
    } else {
      markSpans.forEach(function (s) { s.style.opacity = 1; });
    }
    var p = 0;
    var timer = setInterval(function () {
      p += Math.random() * 18 + 8;
      if (p >= 100) { p = 100; clearInterval(timer); setTimeout(finishPreload, 260); }
      if (pct) pct.textContent = Math.floor(p) + "%";
      if (bar) bar.style.setProperty("--w", p + "%");
      if (bar) bar.querySelector(".preloader-bar") ;
      var afterEl = bar;
      if (afterEl) afterEl.style.setProperty("--progress", p);
      if (bar) bar.style.background = "linear-gradient(90deg, var(--violet) " + p + "%, var(--line-strong) " + p + "%)";
    }, 220);
  })();

  /* ---------------------------------------------------
     CUSTOM CURSOR
  --------------------------------------------------- */
  if (!isTouch && !reduceMotion) {
    var dot = document.querySelector(".cursor-dot");
    var ring = document.querySelector(".cursor-ring");
    var label = ring ? ring.querySelector(".cursor-label") : null;
    if (dot && ring) {
      document.body.classList.add("cursor-ready");
      var mx = 0, my = 0, rx = 0, ry = 0;
      window.addEventListener("mousemove", function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      });
      (function loop() {
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
        requestAnimationFrame(loop);
      })();
      document.addEventListener("mousedown", function () { ring.classList.add("is-down"); });
      document.addEventListener("mouseup", function () { ring.classList.remove("is-down"); });

      document.querySelectorAll("[data-cursor]").forEach(function (el) {
        el.addEventListener("mouseenter", function () {
          ring.classList.add("is-active");
          if (label) label.textContent = el.getAttribute("data-cursor");
        });
        el.addEventListener("mouseleave", function () {
          ring.classList.remove("is-active");
        });
      });
    }
  }

  /* ---------------------------------------------------
     NAV: scroll state + mobile menu
  --------------------------------------------------- */
  var nav = document.querySelector(".nav");
  function onScrollNav() {
    if (!nav) return;
    if (window.scrollY > 30) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  var toggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  var menuLinks = document.querySelectorAll(".mobile-menu-links a");
  var menuFoot = document.querySelector(".mobile-menu-foot");
  if (toggle && mobileMenu) {
    toggle.addEventListener("click", function () {
      var opening = !document.body.classList.contains("menu-open");
      document.body.classList.toggle("menu-open");
      if (opening) {
        if (lenis) lenis.stop();
        if (hasGSAP) {
          gsap.fromTo(menuLinks, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.06, delay: 0.15, ease: "power3.out" });
          if (menuFoot) gsap.fromTo(menuFoot, { opacity: 0 }, { opacity: 1, duration: 0.6, delay: 0.4 });
        } else {
          menuLinks.forEach(function (l) { l.style.opacity = 1; l.style.transform = "none"; });
          if (menuFoot) menuFoot.style.opacity = 1;
        }
      } else {
        if (lenis) lenis.start();
      }
    });
    menuLinks.forEach(function (l) {
      l.addEventListener("click", function () { document.body.classList.remove("menu-open"); if (lenis) lenis.start(); });
    });
  }

  /* ---------------------------------------------------
     ANCHOR SCROLLING + ACTIVE LINK
  --------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.2 });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  var sections = document.querySelectorAll("main > section[id]");
  var navA = document.querySelectorAll(".nav-links a[href^='#']");
  if (sections.length && navA.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          navA.forEach(function (a) { a.classList.remove("is-active"); });
          var match = document.querySelector('.nav-links a[href="#' + entry.target.id + '"]');
          if (match) match.classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ---------------------------------------------------
     GENERIC SCROLL REVEALS
  --------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealIO.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    reveals.forEach(function (el) { revealIO.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------------------------------------------------
     HERO ENTRANCE + WORD REVEAL
  --------------------------------------------------- */
  function startHero() {
    var lines = document.querySelectorAll(".hero h1 .line span");
    if (hasGSAP && lines.length) {
      gsap.set(lines, { yPercent: 110 });
      gsap.to(lines, { yPercent: 0, duration: 1.1, stagger: 0.1, ease: "power4.out", delay: 0.15 });
      gsap.fromTo(".hero-kicker", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.05 });
      gsap.fromTo(".hero-sub, .hero-actions", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, delay: 0.5 });
      gsap.fromTo(".hero-scroll-cue", { opacity: 0 }, { opacity: 1, duration: 0.8, delay: 1 });
    } else {
      document.querySelectorAll(".hero h1 span, .hero-kicker, .hero-sub, .hero-actions, .hero-scroll-cue")
        .forEach(function (el) { el.style.opacity = 1; el.style.transform = "none"; });
    }
  }

  /* ---------------------------------------------------
     HERO BACKGROUND — lightweight canvas particle field
     (kept intentionally simple / GPU-cheap instead of Three.js)
  --------------------------------------------------- */
  (function heroCanvas() {
    var canvas = document.querySelector(".hero-bg canvas");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    var w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var particles = [];
    var mouse = { x: 0, y: 0, active: false };
    var COUNT = isTouch ? 34 : 70;

    function resize() {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      particles = [];
      for (var i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.6,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          a: Math.random() * 0.5 + 0.15
        });
      }
    }
    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (mouse.active) {
          var dx = p.x - mouse.x, dy = p.y - mouse.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            p.x += (dx / dist) * 0.6;
            p.y += (dy / dist) * 0.6;
          }
        }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(199,197,214," + p.a + ")";
        ctx.fill();
      }
      requestAnimationFrame(tick);
    }
    resize(); seed(); tick();
    window.addEventListener("resize", function () { resize(); seed(); });
    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left; mouse.y = e.clientY - rect.top; mouse.active = true;
    });
  })();

  /* ---------------------------------------------------
     STATEMENT — word-by-word scroll reveal
  --------------------------------------------------- */
  (function statementReveal() {
    var el = document.querySelector(".statement-text");
    if (!el) return;
    var text = el.textContent.trim();
    var words = text.split(/\s+/);
    el.innerHTML = words.map(function (w) { return '<span class="w">' + w + " </span>"; }).join("");
    var spans = el.querySelectorAll(".w");
    if (hasGSAP && window.ScrollTrigger) {
      gsap.to(spans, {
        color: "var(--ink)",
        stagger: 0.06,
        scrollTrigger: {
          trigger: el, start: "top 78%", end: "bottom 55%", scrub: 0.6
        }
      });
    } else if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) el.classList.add("is-in"); });
      }, { threshold: 0.4 });
      obs.observe(el);
      spans.forEach(function (s) { s.classList.add("is-in"); });
    }
  })();

  /* ---------------------------------------------------
     SERVICES SCROLL-STORY
  --------------------------------------------------- */
  (function servicesStory() {
    var rows = document.querySelectorAll(".service-row");
    var imgs = document.querySelectorAll(".services-panel img");
    var copy = document.querySelector(".services-panel-copy p");
    if (!rows.length) return;

    function activate(index) {
      rows.forEach(function (r, i) { r.classList.toggle("is-active", i === index); });
      imgs.forEach(function (im, i) { im.classList.toggle("is-active", i === index); });
      if (copy) copy.textContent = rows[index].getAttribute("data-blurb") || "";
    }
    activate(0);

    rows.forEach(function (row, i) {
      row.addEventListener("click", function () { activate(i); });
      row.addEventListener("mouseenter", function () { activate(i); });
    });

    if (hasGSAP && window.ScrollTrigger && window.innerWidth > 860) {
      rows.forEach(function (row, i) {
        ScrollTrigger.create({
          trigger: row,
          start: "top center",
          end: "bottom center",
          onEnter: function () { activate(i); },
          onEnterBack: function () { activate(i); }
        });
      });
    }
  })();

  /* ---------------------------------------------------
     MAGNETIC BUTTONS
  --------------------------------------------------- */
  if (!isTouch && !reduceMotion && hasGSAP) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var rect = el.getBoundingClientRect();
        var relX = e.clientX - rect.left - rect.width / 2;
        var relY = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: relX * 0.25, y: relY * 0.5, duration: 0.4, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1,0.4)" });
      });
    });
  }

  /* ---------------------------------------------------
     PORTFOLIO MODAL
  --------------------------------------------------- */
  (function portfolioModal() {
    var cards = document.querySelectorAll(".portfolio-card");
    var modal = document.querySelector(".modal");
    if (!cards.length || !modal) return;
    var img = modal.querySelector(".modal-img img");
    var idx = modal.querySelector(".idx");
    var title = modal.querySelector("h3");
    var desc = modal.querySelector("p");
    var link = modal.querySelector(".modal-card .btn");
    var closeBtn = modal.querySelector(".modal-close");

    function open(card) {
      img.src = card.querySelector("img").src;
      idx.textContent = card.getAttribute("data-index");
      title.textContent = card.getAttribute("data-title");
      desc.textContent = card.getAttribute("data-desc");
      link.href = card.getAttribute("data-link");
      modal.classList.add("is-open");
      document.body.classList.add("no-scroll");
      if (lenis) lenis.stop();
    }
    function close() {
      modal.classList.remove("is-open");
      document.body.classList.remove("no-scroll");
      if (lenis) lenis.start();
    }
    cards.forEach(function (c) {
      c.addEventListener("click", function () { open(c); });
    });
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  })();

  /* ---------------------------------------------------
     SOUND TOGGLE (no audio file bundled — structure only)
  --------------------------------------------------- */
  (function sound() {
    var btn = document.querySelector(".sound-toggle");
    if (!btn) return;
    var audio = document.getElementById("ambient-audio");
    var on = false;
    btn.addEventListener("click", function () {
      on = !on;
      btn.classList.toggle("is-on", on);
      btn.querySelector(".sound-toggle-label").textContent = on ? "Sound on" : "Sound off";
      if (!audio) return;
      if (on) {
        audio.volume = 0;
        audio.play().catch(function () { /* file not present yet */ });
        gsapFade(audio, 0.35, 800);
      } else {
        gsapFade(audio, 0, 500, function () { audio.pause(); });
      }
    });
    function gsapFade(el, to, ms, cb) {
      if (hasGSAP) { gsap.to(el, { volume: to, duration: ms / 1000, onComplete: cb }); }
      else { el.volume = to; if (cb) cb(); }
    }
  })();

  /* ---------------------------------------------------
     FOOTER YEAR
  --------------------------------------------------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
