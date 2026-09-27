/* FOXEN ENGINEERING LTD — motion layer (GSAP + ScrollTrigger, loaded locally) */
(function () {
  var html = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function bail() { html.classList.remove("js-anim", "has-preloader", "pt-in"); }
  if (!window.gsap || !window.ScrollTrigger || reduce) { bail(); return; }
  gsap.registerPlugin(ScrollTrigger);
  var R = gsap.utils.random;
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var pt = document.querySelector(".pt");
  var introDone = false, scrollReady = false;

  /* ---------- text splitting ---------- */
  function walkText(el, fn) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) fn(n);
        else if (n.nodeType === 1 && n.tagName !== "BR" && n.tagName !== "svg" && n.tagName !== "SVG") walk(n);
      });
    })(el);
  }
  function splitChars(el) {
    var out = [];
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walkText(el, function (n) {
      var frag = document.createElement("span"); frag.className = "tw";
      n.textContent.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
        var w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
        tok.split("").forEach(function (ch) {
          var c = document.createElement("span"); c.className = "c"; c.textContent = ch; w.appendChild(c); out.push(c);
        });
        frag.appendChild(w);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return out;
  }
  function splitWords(el) {
    var out = [];
    el.setAttribute("aria-label", el.textContent.replace(/\s+/g, " ").trim());
    walkText(el, function (n) {
      var frag = document.createElement("span"); frag.className = "tw";
      n.textContent.split(/(\s+)/).forEach(function (tok) {
        if (!tok) return;
        if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(" ")); return; }
        var m = document.createElement("span"); m.className = "wm"; m.setAttribute("aria-hidden", "true");
        var i = document.createElement("span"); i.className = "wi"; i.textContent = tok; m.appendChild(i); out.push(i);
        frag.appendChild(m);
      });
      n.parentNode.replaceChild(frag, n);
    });
    return out;
  }

  /* ---------- prepare hero / page-hero (scattered letters) ---------- */
  var heroH1 = document.querySelector(".hero h1, .phero h1");
  var chars = [];
  if (heroH1) {
    chars = splitChars(heroH1);
    gsap.set(chars, {
      x: function () { return R(-460, 460); }, y: function () { return R(-300, 300); },
      rotation: function () { return R(-140, 140); }, scale: function () { return R(0.2, 2.6); }, opacity: 0
    });
  }
  var heroBits = $(".hero__kicker, .hero__lede, .hero .btnrow, .phero .lede, .crumbs");
  gsap.set(heroBits, { opacity: 0, y: 26 });
  var tb = document.querySelector(".titleblock");
  if (tb) gsap.set(tb, { opacity: 0, x: 70 });
  var tbRows = tb ? $(".row", tb) : [];
  gsap.set(tbRows, { opacity: 0, x: 24 });
  var emblem = $(".hero__emblem .em");
  emblem.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
  html.classList.remove("js-anim");

  /* ---------- intro ---------- */
  function intro() {
    if (introDone) return; introDone = true;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    if (chars.length) {
      tl.to(chars, {
        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 1.9, ease: "expo.out",
        stagger: { each: 0.03, from: "random" }
      }, 0);
    }
    tl.to(heroBits, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.7);
    if (tb) {
      tl.to(tb, { opacity: 1, x: 0, duration: 1 }, 1.0);
      tl.to(tbRows, { opacity: 1, x: 0, duration: 0.6, stagger: 0.08 }, 1.25);
    }
    if (emblem.length) tl.to(emblem, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", stagger: 0.25 }, 0.3);
    if (document.querySelector(".hero__img")) tl.fromTo(".hero__img", { scale: 1.2 }, { scale: 1, duration: 2.8, ease: "power3.out" }, 0);
    if (document.querySelector(".hero__emblem")) gsap.to(".hero__emblem", { y: "-=18", duration: 4, ease: "sine.inOut", yoyo: true, repeat: -1 });
    initScroll();
  }

  /* ---------- preloader / page-transition entry ---------- */
  var pre = document.querySelector(".preloader");
  if (pre && html.classList.contains("has-preloader")) {
    var paths = $(".dr", pre);
    paths.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
    var nose = pre.querySelector(".pl__nose");
    gsap.set(nose, { opacity: 0, scale: 0.3, transformOrigin: "50% 62%" });
    gsap.set([".pl__brand", ".pl__sub"], { opacity: 0, y: 24 });
    var cnt = pre.querySelector(".pl__count span"), bar = pre.querySelector(".pl__bar i");
    var o = { v: 0 };
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      var out = gsap.timeline({ onComplete: function () { html.classList.remove("has-preloader"); gsap.set(pre, { display: "none" }); ScrollTrigger.refresh(); } });
      out.to(".pl__in", { opacity: 0, y: -30, duration: 0.5, ease: "power2.in" });
      out.to(".pl__p", { yPercent: -101, duration: 0.95, ease: "power4.inOut", stagger: 0.09 }, 0.3);
      out.add(intro, 0.75);
    };
    var tl = gsap.timeline({ onComplete: finish });
    tl.to(paths, { strokeDashoffset: 0, duration: 1.3, ease: "power2.inOut", stagger: 0.18 }, 0)
      .to(nose, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)" }, 1.1)
      .to([".pl__brand", ".pl__sub"], { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }, 0.7)
      .to(o, { v: 100, duration: 1.9, ease: "power1.inOut", onUpdate: function () { cnt.textContent = Math.round(o.v); } }, 0)
      .to(bar, { scaleX: 1, duration: 1.9, ease: "power1.inOut" }, 0);
    setTimeout(finish, 7000); // failsafe
  } else if (html.classList.contains("pt-in")) {
    gsap.set(pt, { yPercent: 0 });
    html.classList.remove("pt-in");
    gsap.set(pt, { visibility: "visible" });
    gsap.to(pt, { yPercent: -100, duration: 0.85, ease: "power4.inOut", delay: 0.12, onStart: intro, onComplete: function () { gsap.set(pt, { visibility: "hidden" }); } });
    setTimeout(intro, 1500);
  } else {
    intro();
  }

  /* ---------- page transitions (leaving) ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if ((a.target && a.target !== "_self") || a.hasAttribute("download")) return;
    var u; try { u = new URL(a.href, location.href); } catch (er) { return; }
    if (u.protocol !== location.protocol || u.host !== location.host) return;
    if (!/(\.html?|\/)$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && (u.hash || u.search === location.search)) return;
    e.preventDefault();
    var go = function () { try { sessionStorage.setItem("fx", "1"); } catch (er) {} location.href = a.href; };
    gsap.set(pt, { visibility: "visible", yPercent: 100 });
    gsap.to(pt, { yPercent: 0, duration: 0.6, ease: "power4.inOut", onComplete: go });
    setTimeout(go, 1600);
  });
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { gsap.set(pt, { visibility: "hidden", yPercent: 100 }); }
  });

  /* ---------- scroll-driven motion ---------- */
  function batchIn(sel, from, extra) {
    var els = $(sel); if (!els.length) return;
    gsap.set(els, from);
    ScrollTrigger.batch(els, {
      start: "top 90%", once: true,
      onEnter: function (b) {
        gsap.to(b, Object.assign({ opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.9, ease: "power3.out", stagger: 0.11, overwrite: true }, extra || {}));
      }
    });
  }
  function initScroll() {
    if (scrollReady) return; scrollReady = true;

    // progress bar
    gsap.to(".progress", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    // header: hide on scroll down, show on scroll up
    var hdr = document.querySelector(".site-header");
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (s) {
        var y = s.scroll(); hdr.classList.toggle("is-scrolled", y > 20);
        var menuOpen = document.querySelector(".nav__links.is-open");
        if (y > 160 && s.direction === 1 && !menuOpen) gsap.to(hdr, { yPercent: -100, duration: 0.35, ease: "power2.out", overwrite: true });
        else if (s.direction === -1 || y <= 160) gsap.to(hdr, { yPercent: 0, duration: 0.35, ease: "power2.out", overwrite: true });
      }
    });

    // hero parallax
    if (document.querySelector(".hero__img")) {
      gsap.to(".hero__img", { yPercent: 14, ease: "none", scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } });
      gsap.to(".hero__copy", { yPercent: -8, opacity: 0.2, ease: "none", scrollTrigger: { trigger: ".hero", start: "20% top", end: "bottom top", scrub: true } });
    }

    // marquee reacts to scroll speed
    var track = document.querySelector(".marq__track");
    if (track) {
      var tw = gsap.to(track, { xPercent: -50, duration: 28, ease: "none", repeat: -1 });
      ScrollTrigger.create({
        onUpdate: function (s) {
          var v = Math.min(Math.abs(s.getVelocity()) / 220, 8);
          tw.timeScale((s.direction < 0 ? -1 : 1) * (1 + v));
          gsap.to(tw, { timeScale: 1, duration: 1.2, overwrite: true, ease: "power2.out" });
        }
      });
    }

    // headings: words rise from masks
    $("main h2").forEach(function (h) {
      if (h.closest(".nf")) return;
      var w = splitWords(h);
      gsap.set(w, { yPercent: 118, rotation: 6, transformOrigin: "0 100%" });
      ScrollTrigger.create({ trigger: h, start: "top 90%", once: true, onEnter: function () {
        gsap.to(w, { yPercent: 0, rotation: 0, duration: 1, ease: "power4.out", stagger: 0.07 });
      } });
    });

    // stat counters
    $(".stats .num").forEach(function (el) {
      var txt = el.textContent.trim(), pct = txt.indexOf("%") > -1, target = parseInt(txt, 10), pad = !pct && txt.length > 1;
      var fmt = function (n) { n = Math.round(n); return pad ? String(n).padStart(2, "0") : n + (pct ? "%" : ""); };
      var o = { v: 0 }; el.textContent = fmt(0);
      ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: function () {
        gsap.to(o, { v: target, duration: target > 10 ? 2.2 : 1.2, ease: "power2.out", onUpdate: function () { el.textContent = fmt(o.v); } });
      } });
    });
    batchIn(".stats li", { opacity: 0, y: 40 });

    // generic staggered groups
    batchIn(".sec .lede, .sec .prose > p, .sec .note, .sec .hub", { opacity: 0, y: 30 }, { stagger: 0.08 });
    batchIn(".svc__list li", { opacity: 0, x: 70 });
    batchIn(".why > div", { opacity: 0, y: 60, scale: 0.96 });
    batchIn(".process li", { opacity: 0, y: 44 });
    batchIn(".ind a", { opacity: 0, y: 40, scale: 0.94 }, { stagger: 0.07 });
    batchIn(".trust__list li", { opacity: 0, y: 40 });
    batchIn(".hub__row a", { opacity: 0, y: 30 });
    batchIn(".ticks li", { opacity: 0, x: -24 }, { stagger: 0.05, duration: 0.6 });
    batchIn(".timeline li", { opacity: 0, x: -40 }, { stagger: 0.18 });
    batchIn(".hse-list > div", { opacity: 0, y: 40 });
    batchIn(".job", { opacity: 0, y: 36 }, { stagger: 0.1 });
    batchIn(".pcard", { opacity: 0, y: 60, scale: 0.96 });
    batchIn(".form .field, .form .btn", { opacity: 0, y: 24 }, { stagger: 0.06, duration: 0.6 });
    batchIn(".contact-card li, .faq details", { opacity: 0, y: 24 }, { stagger: 0.08, duration: 0.7 });
    batchIn(".cta .btnrow, .cta p", { opacity: 0, y: 30 });
    batchIn(".fgrid > div", { opacity: 0, y: 30 }, { stagger: 0.1 });
    batchIn(".facts div", { opacity: 0, x: 24 }, { stagger: 0.07, duration: 0.6 });
    batchIn(".seal, .founder .role", { opacity: 0, y: 20 });

    // process number pop + connector
    $(".process .n").forEach(function (n, i) {
      gsap.from(n, { scale: 0.4, rotation: -30, duration: 0.7, ease: "back.out(2.4)", delay: i * 0.12, scrollTrigger: { trigger: ".process", start: "top 82%", once: true } });
    });

    // images: clip-path reveal + gentle parallax
    $(".media img, .feature img, .gal img, .cred img").forEach(function (im) {
      gsap.fromTo(im, { clipPath: "inset(0 0 100% 0)", scale: 1.25 }, {
        clipPath: "inset(0 0 0% 0)", scale: 1, duration: 1.4, ease: "power4.out",
        scrollTrigger: { trigger: im, start: "top 88%", once: true }
      });
    });
    $(".media").forEach(function (m) {
      gsap.fromTo(m, { y: 34 }, { y: -34, ease: "none", scrollTrigger: { trigger: m, start: "top bottom", end: "bottom top", scrub: true } });
    });
    batchIn(".feature__body > *", { opacity: 0, y: 30 }, { stagger: 0.1 });

    // magnetic buttons (pointer devices only)
    if (window.matchMedia("(hover:hover) and (pointer:fine)").matches) {
      $(".hero .btn, .cta .btn, .contact-card .btn, .feature .btn").forEach(function (b) {
        var xt = gsap.quickTo(b, "x", { duration: 0.5, ease: "power3" }), yt = gsap.quickTo(b, "y", { duration: 0.5, ease: "power3" });
        b.addEventListener("mousemove", function (e) {
          var r = b.getBoundingClientRect();
          xt((e.clientX - r.left - r.width / 2) * 0.28); yt((e.clientY - r.top - r.height / 2) * 0.28);
        });
        b.addEventListener("mouseleave", function () { xt(0); yt(0); });
      });
    }

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
  }

  // filtered project cards re-enter
  document.addEventListener("foxen:filtered", function () {
    var vis = $(".pcard").filter(function (c) { return !c.hidden; });
    gsap.fromTo(vis, { opacity: 0, y: 34, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.07, ease: "power3.out", overwrite: true });
    setTimeout(function () { ScrollTrigger.refresh(); }, 700);
  });
})();
