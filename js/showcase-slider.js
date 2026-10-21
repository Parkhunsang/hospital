function initShowcaseSlider() {
  const sliderEl = document.querySelector(".showcase-slider__swiper");
  if (!sliderEl || typeof Swiper === "undefined") return;

  new Swiper(sliderEl, {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 5,
      stretch: 30,
      depth: 100,
      modifier: 1.8,
      slideShadows: false,
    },
    pagination: {
      el: ".showcase-slider__pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".showcase-slider .slider-nav__btn--next",
      prevEl: ".showcase-slider .slider-nav__btn--prev",
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    a11y: {
      prevSlideMessage: "이전 슬라이드",
      nextSlideMessage: "다음 슬라이드",
      firstSlideMessage: "첫 번째 슬라이드입니다",
      lastSlideMessage: "마지막 슬라이드입니다",
    },
  });
}
document.addEventListener("DOMContentLoaded", initShowcaseSlider);
