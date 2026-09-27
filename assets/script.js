/* FOXEN ENGINEERING LTD — site scripts (no dependencies) */
(function () {
  var WA_NUMBER = "2348069193063";
  document.documentElement.classList.remove("no-js");

  // If the animation library is unavailable, never leave the page hidden
  window.addEventListener("load", function () {
    if (!window.gsap || !window.ScrollTrigger) {
      document.documentElement.classList.remove("js-anim", "has-preloader", "pt-in");
    }
  });

  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Mobile menu
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("navlinks");
  if (toggle && links) {
    var setOpen = function (open) {
      links.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    };
    toggle.addEventListener("click", function () { setOpen(toggle.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { setOpen(false); toggle.focus(); } });
    links.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  }

  // Process line draws once when it scrolls into view
  var proc = document.querySelector(".process");
  if (proc) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) { if (en.isIntersecting) { proc.classList.add("is-in"); obs.disconnect(); } });
      }, { threshold: 0.35 }).observe(proc);
    } else { proc.classList.add("is-in"); }
  }

  // Project filters
  var fbar = document.querySelector("[data-filters]");
  if (fbar) {
    var cards = Array.prototype.slice.call(document.querySelectorAll(".pcard[data-disc]"));
    var count = document.getElementById("pcount");
    fbar.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var f = btn.getAttribute("data-filter");
        fbar.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        var shown = 0;
        cards.forEach(function (c) {
          var ok = f === "all" || c.getAttribute("data-disc").split(" ").indexOf(f) > -1;
          c.hidden = !ok; if (ok) shown++;
        });
        document.dispatchEvent(new CustomEvent("foxen:filtered"));
        if (count) count.textContent = "Showing " + shown + (shown === 1 ? " project" : " projects");
      });
    });
  }

  // Quote form -> WhatsApp message
  var form = document.getElementById("quote-form");
  if (form) {
    var status = document.getElementById("form-status");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ""; };
      var services = Array.prototype.slice.call(form.querySelectorAll('input[name="services"]:checked')).map(function (i) { return i.value; });
      var lines = [
        "Hello FOXEN Engineering, I would like to request a quote.",
        "",
        "Name: " + v("name"),
        v("company") ? "Company: " + v("company") : null,
        "Phone: " + v("phone"),
        "Project type: " + v("type"),
        services.length ? "Services needed: " + services.join(", ") : null,
        "Project location: " + v("location"),
        v("start") ? "Expected start: " + v("start") : null,
        v("details") ? "" : null,
        v("details") ? "Project details: " + v("details") : null
      ].filter(function (l) { return l !== null; });
      var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      var w = window.open(url, "_blank", "noopener");
      if (status) {
        status.innerHTML = "";
        var a = document.createElement("a");
        a.href = url; a.target = "_blank"; a.rel = "noopener"; a.className = "textlink";
        a.textContent = "Open WhatsApp";
        status.appendChild(document.createTextNode(w ? "WhatsApp is opening with your enquiry. If nothing happens, " : "Your enquiry is ready. "));
        status.appendChild(a);
        status.appendChild(document.createTextNode("."));
      }
    });
  }
})();
