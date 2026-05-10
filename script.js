(function () {
  // Color stops for the overlay (semi-transparent for contrast)
  const colorStops = [
    { pos: 0, color: "rgba(0, 0, 0, 0.85)" }, // dark overlay
    { pos: 0.33, color: "rgba(40, 40, 50, 0.8)" }, // charcoal
    { pos: 0.66, color: "rgba(80, 80, 90, 0.75)" }, // gray
    { pos: 1, color: "rgba(160, 200, 230, 0.7)" }, // light blue
  ];

  // Text color (solid, no transparency)
  const textStart = "#f5f5f5";
  const textEnd = "#1e1b18";

  function interpolateRGBA(c1, c2, t) {
    const rgba1 = c1.match(/[\d\.]+/g).map(Number);
    const rgba2 = c2.match(/[\d\.]+/g).map(Number);
    const r = Math.round(rgba1[0] + (rgba2[0] - rgba1[0]) * t);
    const g = Math.round(rgba1[1] + (rgba2[1] - rgba1[1]) * t);
    const b = Math.round(rgba1[2] + (rgba2[2] - rgba1[2]) * t);
    const a = rgba1[3] + (rgba2[3] - rgba1[3]) * t;
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  function hexToRgb(hex) {
    return [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];
  }

  function interpolateTextColor(p) {
    const t = Math.min(1, Math.max(0, p));
    const rgb1 = hexToRgb(textStart);
    const rgb2 = hexToRgb(textEnd);
    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function getOverlayColor(progress) {
    if (progress <= 0) return colorStops[0].color;
    if (progress >= 1) return colorStops[colorStops.length - 1].color;
    let idx = 0;
    for (let i = 0; i < colorStops.length - 1; i++) {
      if (progress >= colorStops[i].pos && progress <= colorStops[i + 1].pos) {
        idx = i;
        break;
      }
    }
    const start = colorStops[idx];
    const end = colorStops[idx + 1];
    const t = (progress - start.pos) / (end.pos - start.pos);
    return interpolateRGBA(start.color, end.color, t);
  }

  function updateOverlayAndText() {
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    let progress = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;
    progress = Math.min(1, Math.max(0, progress));

    // Update overlay background color
    const overlay = document.getElementById("colorOverlay");
    if (overlay) overlay.style.backgroundColor = getOverlayColor(progress);

    // Update body text color
    document.body.style.color = interpolateTextColor(progress);

    // Update border colors for visual feedback
    const navbar = document.querySelector(".navbar");
    const sections = document.querySelectorAll("section");
    const footer = document.querySelector(".footer");
    if (navbar)
      navbar.style.borderBottomColor = `rgba(255,255,255,${0.1 + progress * 0.1})`;
    sections.forEach(
      (sec) =>
        (sec.style.borderBottomColor = `rgba(255,255,255,${0.06 + progress * 0.05})`),
    );
    if (footer)
      footer.style.borderTopColor = `rgba(255,255,255,${0.06 + progress * 0.05})`;

    // Update background image opacities
    const topImg = document.querySelector(".top-img");
    const middleImg = document.querySelector(".middle-img");
    const bottomImg = document.querySelector(".bottom-img");
    if (topImg && middleImg && bottomImg) {
      if (progress <= 0.33) {
        const t = progress / 0.33;
        topImg.style.opacity = 1 - t;
        middleImg.style.opacity = t;
        bottomImg.style.opacity = 0;
      } else if (progress <= 0.66) {
        const t = (progress - 0.33) / 0.33;
        topImg.style.opacity = 0;
        middleImg.style.opacity = 1 - t;
        bottomImg.style.opacity = t;
      } else {
        const t = (progress - 0.66) / 0.34;
        topImg.style.opacity = 0;
        middleImg.style.opacity = 0;
        bottomImg.style.opacity = 1;
      }
    }
  }

  window.addEventListener("scroll", () =>
    requestAnimationFrame(updateOverlayAndText),
  );
  window.addEventListener("resize", () =>
    requestAnimationFrame(updateOverlayAndText),
  );
  updateOverlayAndText();

  // SCROLL REVEAL
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.2, rootMargin: "0px 0px -20px 0px" },
  );

  document
    .querySelectorAll(".fade-up, .gallery-card")
    .forEach((el) => observer.observe(el));
  document
    .querySelectorAll(".about-card, .style-card, .center-figures")
    .forEach((el) => {
      if (!el.classList.contains("fade-up")) el.classList.add("fade-up");
      observer.observe(el);
    });

  setTimeout(() => {
    document.querySelectorAll(".fade-up, .gallery-card").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight - 70) {
        el.classList.add("visible");
        observer.unobserve(el);
      }
    });
  }, 100);
  window.addEventListener("load", () => {
    updateOverlayAndText();
    document.querySelectorAll(".fade-up:not(.visible)").forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight - 50)
        el.classList.add("visible");
    });
  });

  // Smooth scroll
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const id = this.getAttribute("href").substring(1);
      if (id === "home") window.scrollTo({ top: 0, behavior: "smooth" });
      else {
        const target = document.getElementById(id);
        if (target) {
          const offset = 80;
          window.scrollTo({
            top: target.getBoundingClientRect().top + window.scrollY - offset,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Lightbox
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImage");
  const caption = document.getElementById("modalCaption");
  const closeModal = document.querySelector(".modal-close");
  const clickableImgs = document.querySelectorAll(".clickable-img");

  clickableImgs.forEach((img) => {
    img.addEventListener("click", (e) => {
      e.stopPropagation();
      modal.style.display = "flex";
      modalImg.src = img.src;
      let text = img.alt || "Full view";
      const parent = img.closest(".about-card, .style-card, .gallery-card");
      if (parent) {
        const title = parent.querySelector("h3");
        if (title) text = title.innerText;
      }
      caption.innerText = text;
      document.body.style.overflow = "hidden";
    });
  });

  function closeModalFunc() {
    modal.style.display = "none";
    document.body.style.overflow = "";
  }
  closeModal.addEventListener("click", closeModalFunc);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModalFunc();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModalFunc();
  });
})();
