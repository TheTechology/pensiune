const roomPrices = { family: 420, twin: 300, dubla: 320, tripla: 380 };

function nightsBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return ms > 0 ? Math.ceil(ms / 86400000) : 0;
}

function estimateText(checkIn, checkOut, guests, roomType, mealRate) {
  const nights = nightsBetween(checkIn, checkOut);
  if (!nights) return "Estimare: selecteaza corect datele de check-in/check-out.";
  const base = roomPrices[roomType] * nights;
  const meal = Number(mealRate || 0) * Number(guests || 1) * nights;
  const total = base + meal;
  return `Estimare: ${nights} nopti | ${total.toLocaleString('ro-RO')} RON`;
}

function buildBookingMailto(payload) {
  const subject = payload._subject || "Cerere rezervare website - Pensiunea Ovidiu Adjud";
  const lines = [
    "Cerere noua de rezervare",
    "",
    `Nume: ${payload.nume || "-"}`,
    `Email: ${payload.email || "-"}`,
    `Telefon: ${payload.telefon || "-"}`,
    `Check-in: ${payload.check_in || "-"}`,
    `Check-out: ${payload.check_out || "-"}`,
    `Adulti: ${payload.adulti || "-"}`,
    `Copii: ${payload.copii || "-"}`,
    `Tip camera: ${payload.tip_camera || "-"}`,
    `Plan masa: ${payload.plan_masa || "-"}`,
    `Estimare: ${payload.estimare || "-"}`,
    `Observatii: ${payload.observatii || "-"}`,
  ];
  const body = lines.join("\n");
  return `mailto:office@pensiuneaovidiuadjud.ro?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;
  themeToggle.classList.add("theme-toggle");

  function renderThemeButton() {
    const isDark = document.body.classList.contains("dark");
    themeToggle.innerHTML = isDark
      ? '<span class="theme-emoji" aria-hidden="true">☀️</span><span class="theme-text">Light</span>'
      : '<span class="theme-emoji" aria-hidden="true">🌙</span><span class="theme-text">Dark</span>';
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Comuta pe tema deschisa" : "Comuta pe tema inchisa"
    );
  }

  const savedTheme = localStorage.getItem("po_theme");
  if (savedTheme === "dark") document.body.classList.add("dark");
  renderThemeButton();
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("po_theme", document.body.classList.contains("dark") ? "dark" : "light");
    renderThemeButton();
  });
}

function initMobileMenu() {
  const body = document.body;
  const menu = document.querySelector(".menu");
  const toggle = document.querySelector(".menu-toggle");
  if (!menu || !toggle) return;

  const emoji = toggle.querySelector(".menu-emoji");
  const label = toggle.querySelector(".menu-label");

  function setState(open) {
    body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (emoji) emoji.textContent = open ? "✕" : "☰";
    if (label) label.textContent = open ? "Inchide" : "Meniu";
    toggle.setAttribute("aria-label", open ? "Inchide meniul" : "Deschide meniul");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setState(!body.classList.contains("menu-open"));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setState(false));
  });

  document.addEventListener("click", (e) => {
    if (!body.classList.contains("menu-open")) return;
    if (!menu.contains(e.target) && !toggle.contains(e.target)) setState(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) setState(false);
  });
}

function initCookieBanner() {
  const cookieBanner = document.getElementById("cookieBanner");
  if (!cookieBanner) return;
  const cookieState = localStorage.getItem("po_cookie");
  if (!cookieState) cookieBanner.classList.add("show");
  document.getElementById("cookieAccept")?.addEventListener("click", () => {
    localStorage.setItem("po_cookie", "accepted");
    cookieBanner.classList.remove("show");
  });
  document.getElementById("cookieDecline")?.addEventListener("click", () => {
    localStorage.setItem("po_cookie", "declined");
    cookieBanner.classList.remove("show");
  });
}

function initRevealOnScroll() {
  const items = document.querySelectorAll("[data-reveal]");
  if (!items.length) return;

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    items.forEach((el) => observer.observe(el));
    return;
  }

  items.forEach((el) => el.classList.add("is-visible"));
}

function initFAQ() {
  document.querySelectorAll(".faq-item .faq-q").forEach((q) => {
    q.addEventListener("click", () => q.parentElement.classList.toggle("open"));
  });
}

function initGalleryLightbox() {
  const lb = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImage");
  const close = document.getElementById("lbClose");
  const items = document.querySelectorAll(".gallery-item");
  if (!lb || !lbImg || !close || !items.length) return;

  items.forEach((it) => {
    it.addEventListener("click", () => {
      const img = it.querySelector("img");
      if (!img) return;
      lbImg.src = img.src;
      lb.classList.add("open");
      lb.setAttribute("aria-hidden", "false");
    });
  });

  close.addEventListener("click", () => {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
  });

  lb.addEventListener("click", (e) => {
    if (e.target === lb) {
      lb.classList.remove("open");
      lb.setAttribute("aria-hidden", "true");
    }
  });
}

function initQuickCheck() {
  const quickForm = document.getElementById("quickCheck");
  const quickResult = document.getElementById("quickResult");
  if (!quickForm || !quickResult) return;

  quickForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const inDate = document.getElementById("qIn")?.value;
    const outDate = document.getElementById("qOut")?.value;
    const guests = document.getElementById("qGuests")?.value;
    const room = document.getElementById("qRoom")?.value;
    quickResult.textContent = estimateText(inDate, outDate, guests, room, 0);
  });
}

function initBookingForm() {
  const bookingForm = document.getElementById("bookingForm");
  const estimate = document.getElementById("bookingEstimate");
  const status = document.getElementById("bookingStatus");
  if (!bookingForm || !estimate) return;

  const calcFields = ["checkIn", "checkOut", "adults", "roomType", "meal"];
  function recalc() {
    const inDate = document.getElementById("checkIn")?.value;
    const outDate = document.getElementById("checkOut")?.value;
    const adults = document.getElementById("adults")?.value;
    const room = document.getElementById("roomType")?.value;
    const meal = document.getElementById("meal")?.value;
    estimate.textContent = estimateText(inDate, outDate, adults, room, meal);
  }

  calcFields.forEach((id) => document.getElementById(id)?.addEventListener("change", recalc));
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    recalc();

    const nights = nightsBetween(
      document.getElementById("checkIn")?.value,
      document.getElementById("checkOut")?.value
    );
    if (!nights) {
      if (status) {
        status.style.display = "block";
        status.style.background = "#f6e9ec";
        status.style.color = "#7a1f2f";
        status.textContent = "Selecteaza corect check-in/check-out inainte de trimitere.";
      }
      return;
    }

    const submitBtn = bookingForm.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Se trimite...";
    }

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());
    payload.estimare = estimate.textContent || "";

    try {
      const response = await fetch("/.netlify/functions/send-booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });
      let result = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (response.ok && result.success) {
        if (status) {
          status.style.display = "block";
          status.style.background = "#e8f6ed";
          status.style.color = "#1f6f3a";
          status.textContent = "Cererea a fost trimisa. Vei primi confirmare pe email/telefon.";
        }
        bookingForm.reset();
        estimate.textContent = "Estimare: completeaza datele pentru calcul.";
      } else {
        throw new Error(result.message || `Eroare la trimitere (HTTP ${response.status}).`);
      }
    } catch (error) {
      if (status) {
        status.style.display = "block";
        status.style.background = "#f6e9ec";
        status.style.color = "#7a1f2f";
        const details = error && error.message ? ` (${error.message})` : "";
        const mailtoUrl = buildBookingMailto(payload);
        status.innerHTML = `Trimiterea a esuat${details}. <a href="${mailtoUrl}" style="font-weight:700;color:#7a1f2f;text-decoration:underline;">Trimite pe email acum</a> sau suna la +40 749 346 253 pentru confirmare rapida.`;
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Trimite cererea";
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileMenu();
  initCookieBanner();
  initRevealOnScroll();
  initFAQ();
  initGalleryLightbox();
  initQuickCheck();
  initBookingForm();
});
