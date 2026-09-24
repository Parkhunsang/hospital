/**
 * 공통 컴포넌트: 쇼케이스 슬라이더 (Showcase Slider)
 * index.html(비수술 치료) 및 서브 질환 페이지(관련 시술) 공통 적용
 */
function initShowcaseSlider() {
  const sliderEl = document.querySelector(".showcase-slider__swiper");
  // 해당 요소가 없거나 Swiper 라이브러리가 로드되지 않은 경우 안전하게 중단
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
