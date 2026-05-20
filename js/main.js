const currentEl = document.querySelector(".visual-current");
const totalEl = document.querySelector(".visual-total");
const progressEl = document.querySelector(".visual-progress span");
const toggleBtn = document.querySelector(".visual-toggle");
const totalSlides = document.querySelectorAll("#visual_slide > .swiper-slide").length;

const formatSlideNumber = (number) => String(number).padStart(2, "0");

totalEl.textContent = formatSlideNumber(totalSlides);

const swiper = new Swiper(".visual-swiper", {
  loop: true,
  speed: 800,
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
  navigation: {
    nextEl: ".visual-next",
    prevEl: ".visual-prev",
  },
  on: {
    init(swiper) {
      currentEl.textContent = formatSlideNumber(swiper.realIndex + 1);
    },
    slideChange(swiper) {
      currentEl.textContent = formatSlideNumber(swiper.realIndex + 1);
    },
    autoplayTimeLeft(swiper, time, progress) {
      progressEl.style.width = `${(1 - progress) * 100}%`;
    },
  },
});

toggleBtn.addEventListener("click", () => {
  const isPaused = toggleBtn.classList.toggle("is-paused");

  if (isPaused) {
    swiper.autoplay.stop();
    progressEl.style.width = "0";
    toggleBtn.setAttribute("aria-label", "Play slide");
    return;
  }

  swiper.autoplay.start();
  toggleBtn.setAttribute("aria-label", "Pause slide");
});
