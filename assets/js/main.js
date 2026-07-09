/* Sandstorm Group — main.js */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGSAP = typeof window.gsap !== "undefined";
  if (reduceMotion) document.documentElement.classList.add("rm");

  /* ---------------- Load curtain (once per session) ---------------- */
  var curtain = document.querySelector(".curtain");
  if (curtain) {
    try {
      if (sessionStorage.getItem("ssg-curtain")) {
        curtain.remove();
      } else {
        sessionStorage.setItem("ssg-curtain", "1");
        document.body.classList.add("is-loaded");
        window.setTimeout(function () { curtain.remove(); }, 1600);
      }
    } catch (e) {
      curtain.remove();
    }
  }

  /* ---------------- Scroll progress hairline ---------------- */
  var progress = document.querySelector(".scroll-progress");
  if (progress && !reduceMotion) {
    var ticking = false;
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateProgress); }
    }, { passive: true });
    updateProgress();
  }

  /* ---------------- Page transition fade ---------------- */
  if (!reduceMotion) {
    document.addEventListener("click", function (e) {
      var a = e.target.closest ? e.target.closest("a") : null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var href = a.getAttribute("href") || "";
      if (!/\.html$/.test(href.split("#")[0]) || href.indexOf("#") === 0) return;
      if (a.origin && a.origin !== location.origin) return;
      e.preventDefault();
      document.body.classList.add("page-exit");
      window.setTimeout(function () { location.href = href; }, 190);
    });
    window.addEventListener("pageshow", function () {
      document.body.classList.remove("page-exit");
    });
  }

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

  /* ---------------- Category / story videos: lazy, in-view only ---------------- */
  var lazyVideos = document.querySelectorAll("video[data-autoplay]");
  if (lazyVideos.length && !reduceMotion && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && p.then) p.then(function () { v.classList.add("is-playing"); }).catch(function () {});
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    lazyVideos.forEach(function (v) {
      v.addEventListener("playing", function () { v.classList.add("is-playing"); });
      vio.observe(v);
    });
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

  /* ---------------- Pinned manifesto ---------------- */
  var manifesto = document.querySelector(".manifesto");
  if (manifesto && hasGSAP && window.ScrollTrigger && !reduceMotion) {
    manifesto.classList.add("is-pinned");
    var phrases = manifesto.querySelectorAll(".mani-phrase");
    var ticks = manifesto.querySelectorAll(".mani-progress i");
    var setTick = function (n) {
      ticks.forEach(function (t, i) { t.classList.toggle("on", i <= n); });
    };
    var mtl = gsap.timeline({
      scrollTrigger: {
        trigger: manifesto,
        start: "top top",
        end: "+=" + phrases.length * 85 + "%",
        pin: true,
        scrub: 0.6,
        onUpdate: function (st) {
          setTick(Math.min(phrases.length - 1, Math.floor(st.progress * phrases.length)));
        }
      }
    });
    phrases.forEach(function (ph, i) {
      mtl.fromTo(ph, { autoAlpha: 0, y: 44, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 1, ease: "power2.out" }, i * 2);
      if (i < phrases.length - 1) {
        mtl.to(ph, { autoAlpha: 0, y: -44, duration: 1, ease: "power2.in" }, i * 2 + 1.35);
      }
    });
  }

  /* ---------------- Scrubbed word reveal ---------------- */
  document.querySelectorAll("[data-words]").forEach(function (el) {
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
      gsap.to(el.querySelectorAll(".w"), {
        opacity: 1,
        stagger: 0.06,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top 82%", end: "top 38%", scrub: 0.4 }
      });
    }
  });

  /* ---------------- Image zoom on scroll ---------------- */
  if (hasGSAP && window.ScrollTrigger && !reduceMotion) {
    document.querySelectorAll("[data-zoom] img").forEach(function (img) {
      gsap.fromTo(img, { scale: 1.14 }, {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: img.closest("[data-zoom]"), start: "top 95%", end: "bottom 20%", scrub: 0.5 }
      });
    });

    /* sand band parallax */
    document.querySelectorAll(".sand-band img").forEach(function (img) {
      gsap.fromTo(img, { yPercent: -9 }, {
        yPercent: 9,
        ease: "none",
        scrollTrigger: { trigger: img.closest(".sand-band"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
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
