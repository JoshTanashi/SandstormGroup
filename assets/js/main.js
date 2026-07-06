/* Sandstorm Group — main.js */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";

  /* ---------------- Header: fixed pill on scroll ---------------- */
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero, .page-hero");

  if (header && hero) {
    var threshold = function () { return hero.offsetHeight * 0.75; };
    var fixed = false;

    var onScroll = function () {
      var y = window.scrollY;
      if (y > threshold() && !fixed) {
        fixed = true;
        header.classList.add("is-fixed");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () { header.classList.add("is-shown"); });
        });
      } else if (y <= threshold() * 0.6 && fixed) {
        fixed = false;
        header.classList.remove("is-shown");
        window.setTimeout(function () {
          if (!fixed) header.classList.remove("is-fixed");
        }, 480);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------- Mobile menu ---------------- */
  var toggle = document.querySelector(".menu-toggle");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (toggle && mobileMenu) {
    var setMenu = function (open) {
      document.body.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    };
    toggle.addEventListener("click", function () {
      setMenu(!document.body.classList.contains("menu-open"));
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
        setMenu(false);
        toggle.focus();
      }
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
  }

  /* ---------------- Hero video: fade in + viewport gating ---------------- */
  var heroVideo = document.querySelector(".hero-media video");
  if (heroVideo) {
    if (reduceMotion) {
      heroVideo.removeAttribute("autoplay");
      heroVideo.pause();
    } else {
      var markReady = function () { heroVideo.classList.add("is-ready"); };
      if (heroVideo.readyState >= 2) markReady();
      else heroVideo.addEventListener("loadeddata", markReady, { once: true });

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var p = heroVideo.play();
              if (p && p.catch) p.catch(function () {});
            } else {
              heroVideo.pause();
            }
          });
        }, { threshold: 0.1 }).observe(heroVideo);
      }
    }
  }

  /* ---------------- Scroll reveals ---------------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  // stagger children inside groups
  document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      if (!child.hasAttribute("data-reveal")) child.setAttribute("data-reveal", "");
      child.style.setProperty("--reveal-delay", (i * 0.09).toFixed(2) + "s");
      revealEls.push(child);
    });
  });

  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add("is-inview"); });
  } else if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-inview");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-inview"); });
  }

  /* ---------------- GSAP: hero entrance + gentle parallax ---------------- */
  if (hasGSAP && !reduceMotion) {
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    var heroInner = document.querySelector(".hero .hero-inner");
    if (heroInner) {
      var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".hero-eyebrow", { y: 18, autoAlpha: 0, duration: 0.7 }, 0.15)
        .from(".hero h1 .line > span", { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.25)
        .from(".hero-sub", { y: 20, autoAlpha: 0, duration: 0.8 }, 0.7)
        .from(".hero-ctas .btn", { y: 18, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.85)
        .from(".hero-chip", { y: 26, autoAlpha: 0, duration: 0.8, stagger: 0.15 }, 1.0)
        .from(".scroll-cue", { autoAlpha: 0, duration: 0.6 }, 1.2);

      // floating chips: slow drift
      gsap.to(".hero-chip--left", { y: -14, duration: 3.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      gsap.to(".hero-chip--right", { y: 12, duration: 4.1, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 });

      // parallax: media moves slower than card while scrolling away
      if (window.ScrollTrigger && window.matchMedia("(min-width: 62rem)").matches) {
        gsap.to(".hero-media", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
        });
        gsap.to(".hero-inner", {
          yPercent: -8,
          autoAlpha: 0.35,
          ease: "none",
          scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom 25%", scrub: true }
        });
      }
    }

    var pageHero = document.querySelector(".page-hero .hero-inner");
    if (pageHero) {
      gsap.from(pageHero.children, {
        y: 26, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out", delay: 0.2
      });
    }
  }

  /* ---------------- Counters ---------------- */
  var counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    var animateCount = function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      var dur = 1600;
      var t0 = null;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach(function (el) {
        el.textContent = el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
      });
    } else {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { cio.observe(el); });
    }
  }

  /* ---------------- Magnetic buttons (desktop, subtle) ---------------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".btn--gold").forEach(function (btn) {
      var strength = 7;
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var x = ((e.clientX - r.left) / r.width - 0.5) * strength;
        var y = ((e.clientY - r.top) / r.height - 0.5) * strength;
        btn.style.transform = "translate(" + x.toFixed(1) + "px," + (y - 2).toFixed(1) + "px)";
      });
      btn.addEventListener("mouseleave", function () {
        btn.style.transform = "";
      });
    });
  }

  /* ---------------- Forms → WhatsApp / mailto ---------------- */
  var WA_NUMBER = "27629943927";
  var SALES_EMAIL = "sales@sandstormgroup.co.za";

  document.querySelectorAll("form[data-wa-form]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var kind = form.getAttribute("data-wa-form");
      var lines = ["*" + kind + " — sandstormgroup.co.za*", ""];
      form.querySelectorAll("input, textarea, select").forEach(function (field) {
        if (!field.name || !String(field.value).trim()) return;
        var label = form.querySelector('label[for="' + field.id + '"]');
        var name = label ? label.textContent.trim() : field.name;
        lines.push("*" + name + ":* " + String(field.value).trim());
      });
      var msg = lines.join("\n");

      var wa = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(msg);
      window.open(wa, "_blank", "noopener");

      var success = form.parentElement.querySelector(".form-success");
      if (success) {
        var mailto = "mailto:" + SALES_EMAIL +
          "?subject=" + encodeURIComponent(kind + " — Sandstorm Group website") +
          "&body=" + encodeURIComponent(msg.replace(/\*/g, ""));
        var link = success.querySelector("a[data-mailto]");
        if (link) link.href = mailto;
        success.classList.add("is-visible");
      }
      form.reset();
    });
  });

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
