document.addEventListener("DOMContentLoaded", () => {
  const filterButtons = document.querySelectorAll("#gallery-filters button");
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((filterButton) => {
        filterButton.className =
          "px-5 py-2 rounded-full bg-surface-container border border-outline-variant/30 text-on-surface text-label-caps font-label-caps uppercase hover:bg-surface-container-high transition-colors";
      });
      button.className =
        "px-5 py-2 rounded-full bg-inverse-surface text-surface text-label-caps font-label-caps uppercase transition-colors";
    });
  });

  const carousel = document.querySelector("#men-bead-designs");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const previousButton = carousel.querySelector("[data-carousel-previous]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const toggleIcon = toggleButton.querySelector("[data-carousel-icon]");
  const counter = carousel.querySelector("[data-carousel-counter]");
  const cards = Array.from(track.children);
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );
  let autoplayTimer;
  let isPaused = reducedMotion.matches;
  let isVisible = !("IntersectionObserver" in window);

  const getStep = () => {
    const gap = parseFloat(window.getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };

  const updateCounter = () => {
    const step = getStep();
    if (!step) return;
    const maxIndex = Math.round(
      (track.scrollWidth - track.clientWidth) / step,
    );
    const currentIndex = Math.min(
      maxIndex,
      Math.round(track.scrollLeft / step),
    );
    counter.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")}`;
  };

  const updateToggleButton = () => {
    toggleButton.disabled = reducedMotion.matches;
    toggleButton.setAttribute("aria-pressed", String(isPaused));
    toggleButton.setAttribute(
      "aria-label",
      reducedMotion.matches
        ? "Automatic carousel disabled by reduced motion setting"
        : isPaused
          ? "Play automatic carousel"
          : "Pause automatic carousel",
    );
    toggleIcon.textContent = isPaused ? "play_arrow" : "pause";
  };

  const moveCarousel = (direction) => {
    const step = getStep();
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (!step || maxScroll <= 0) return;

    const target = track.scrollLeft + step * direction;
    let left = target;
    if (direction > 0 && target >= maxScroll - 1) {
      left = 0;
    } else if (direction < 0 && target <= 1) {
      left = maxScroll;
    } else {
      left = Math.max(0, Math.min(maxScroll, target));
    }

    track.scrollTo({
      left,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  };

  const stopAutoplay = () => window.clearInterval(autoplayTimer);
  const startAutoplay = () => {
    stopAutoplay();
    if (
      isPaused ||
      reducedMotion.matches ||
      !isVisible ||
      document.hidden
    ) {
      return;
    }
    autoplayTimer = window.setInterval(() => moveCarousel(1), 4500);
  };

  previousButton.addEventListener("click", () => moveCarousel(-1));
  nextButton.addEventListener("click", () => moveCarousel(1));
  toggleButton.addEventListener("click", () => {
    isPaused = !isPaused;
    updateToggleButton();
    if (isPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });
  track.addEventListener("scroll", updateCounter, { passive: true });
  document.addEventListener("visibilitychange", startAutoplay);
  window.addEventListener("resize", updateCounter);
  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      isPaused = true;
      stopAutoplay();
    }
    updateToggleButton();
    startAutoplay();
  });

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          startAutoplay();
        } else {
          stopAutoplay();
        }
      },
      { threshold: 0.1 },
    );
    visibilityObserver.observe(carousel);
  }

  updateToggleButton();
  updateCounter();
  startAutoplay();
});
