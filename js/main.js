document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  initBrandTrustPartners();
  initLocationSlider();
  initNewsTabs();
});
// 인트로 도어 로직
// 1. 애니메이션 전담 (CSS transitionend 실패 대비 2초 타임아웃 장착)
function playDoorOpenAnimation(
  { introDoor, introContent, doorLeft, doorRight },
  hasGsap,
  onComplete,
) {
  // 1. [GSAP 없을 때: 순수 CSS 트랜지션 Fallback] //
  if (!hasGsap) {
    introDoor.classList.add("intro-door--opened");

    let isCompleted = false;
    let fallbackTimer = null;

    // 안전한 종료 통합 함수
    const safeComplete = () => {
      if (isCompleted) return;
      isCompleted = true;

      // 리소스 완전 회수:
      if (fallbackTimer) clearTimeout(fallbackTimer);
      doorLeft.removeEventListener("transitionend", handleTransitionEnd);

      onComplete();
    };

    const handleTransitionEnd = (event) => {
      if (event.target !== doorLeft) return;
      if (event.propertyName !== "transform") return;

      safeComplete();
    };

    doorLeft.addEventListener("transitionend", handleTransitionEnd);

    fallbackTimer = setTimeout(safeComplete, 1800);
    return;
  }

  // 2. [GSAP 타임라인 애니메이션] //
  gsap
    .timeline({ onComplete })
    .to(introContent, { opacity: 0, y: -40, duration: 0.6, ease: "power2.in" })
    .to(
      doorLeft,
      { xPercent: -100, duration: 1.5, ease: "power3.inOut" },
      "-=0.2",
    )
    .to(
      doorRight,
      { xPercent: 100, duration: 1.5, ease: "power3.inOut" },
      "-=1.5",
    )
    .to(
      ".topbar",
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.9",
    )
    .to(
      [".hero-3d__menu", ".hero-3d__welcome"],
      {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: "power3.out",
      },
      "-=0.5",
    );
}

// 2. 센서 전담
function bindDoorTriggers(enterBtn, onTrigger) {
  let touchStartY = 0;
  let hasFired = false;

  const fire = (isKeyboard) => {
    if (hasFired) return;
    hasFired = true;

    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("keydown", handleKeydown);
    enterBtn?.removeEventListener("click", handleBtnClick);

    onTrigger(isKeyboard);
  };

  const handleWheel = (e) => e.deltaY > 0 && fire(false);
  const handleTouchStart = (e) => (touchStartY = e.touches[0].clientY);
  const handleTouchMove = (e) =>
    touchStartY - e.touches[0].clientY > 30 && fire(false);
  const handleKeydown = (e) =>
    ["ArrowDown", "PageDown", " ", "Enter"].includes(e.key) && fire(true);
  const handleBtnClick = (e) => fire(e.detail === 0);

  window.addEventListener("wheel", handleWheel, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("keydown", handleKeydown);
  enterBtn?.addEventListener("click", handleBtnClick);
}

// 뒷정리 함수
function cleanupIntroDoor(introDoor, isKeyboard, hasGsap) {
  introDoor.style.display = "none";
  document.body.classList.remove("door-locked");

  document.querySelectorAll("header, main, footer").forEach((element) => {
    element.removeAttribute("inert");
  });

  window.dispatchEvent(new Event("resize"));
  if (hasGsap) {
    gsap.set(".topbar", { clearProps: "all" });
  }

  if (isKeyboard) {
    document.querySelector(".topbar__brand")?.focus();
  }
}

// 3. 최종 실행
function initIntroDoor() {
  const introDoor = document.querySelector(".intro-door");
  if (!introDoor) return;

  const hasGsap = typeof gsap !== "undefined";
  const enterBtn = introDoor.querySelector("#enter-clinic-btn");
  document.body.classList.add("door-locked");

  if (hasGsap) {
    gsap.set(".topbar", { opacity: 0, y: -80 });
    gsap.set(".hero-3d__menu", { opacity: 0, x: -50 });
    gsap.set(".hero-3d__welcome", { opacity: 0, y: -50 });
  }

  bindDoorTriggers(enterBtn, (isKeyboard) => {
    playDoorOpenAnimation(
      {
        introDoor,
        introContent: introDoor.querySelector(".intro-door__content"),
        doorLeft: introDoor.querySelector(".intro-door__panel--left"),
        doorRight: introDoor.querySelector(".intro-door__panel--right"),
      },
      hasGsap,
      () => cleanupIntroDoor(introDoor, isKeyboard, hasGsap),
    );
  });
  enterBtn?.focus();
}

// function initBrandTrustPartners() {
//   const section = document.querySelector(".brand-trust");
//   if (!section) return;

//   let counterTriggered = false;

//   // 페이지네이션 내에 숫자 갱신과 진행바 관련 로직
//   function updateBTControls(swiper) {
//     const current = section.querySelector(".brand-trust__current-index");
//     const total = section.querySelector(".brand-trust__total-index");
//     const progressFill = section.querySelector(".brand-trust__progress-fill");

//     if (!current || !total) return;

//     const realIndex = swiper.realIndex + 1;
//     const totalSlides = 3; // stats, training, philosophy

//     current.textContent = String(realIndex).padStart(2, "0");
//     total.textContent = String(totalSlides).padStart(2, "0");

//     if (progressFill) {
//       progressFill.style.width = `${(realIndex / totalSlides) * 100}%`;
//     }
//   }

//   // 숫자 카운터 애니메이션 로직
//   function runStatsAnimation() {
//     const valElements = section.querySelectorAll(".brand-trust__stat-val");
//     valElements.forEach((el) => {
//       const target = parseFloat(el.getAttribute("data-target"));
//       const decimals = parseInt(el.getAttribute("data-decimals") || "0");
//       const suffix = el.getAttribute("data-suffix") || "";

//       const counterObj = { value: 0 };
//       gsap.killTweensOf(counterObj);

//       gsap.to(counterObj, {
//         value: target,
//         duration: 1.8,
//         ease: "power2.out",
//         onUpdate: () => {
//           let formattedVal = "";
//           if (decimals > 0) {
//             formattedVal = counterObj.value.toFixed(decimals);
//           } else {
//             formattedVal = Math.floor(counterObj.value).toLocaleString();
//           }
//           el.innerHTML = `${formattedVal}<small>${suffix}</small>`;
//         },
//       });
//     });
//   }

//   // 1. Initialize Swiper
//   const btSwiper = new Swiper(".brand-trust__swiper", {
//     effect: "slide",
//     speed: 800,
//     loop: true,
//     autoplay: {
//       delay: 5000,
//       disableOnInteraction: false,
//     },
//     navigation: {
//       nextEl: ".brand-trust__btn--next",
//       prevEl: ".brand-trust__btn--prev",
//     },
//     on: {
//       init: function () {
//         updateBTControls(this);
//       },
//       slideChange: function () {
//         updateBTControls(this);

//         const isDesktop = window.matchMedia("(min-width: 769px)");
//         if (this.realIndex === 0 && (!isDesktop.matches || counterTriggered)) {
//           runStatsAnimation();
//         }
//       },
//     },
//   });

//   // 슬라이드 재생/멈춤 버튼 로직
//   const playPauseBtn = section.querySelector(".brand-trust__btn--play-pause");
//   if (playPauseBtn) {
//     const iconPause = playPauseBtn.querySelector(".brand-trust__icon-pause");
//     const iconPlay = playPauseBtn.querySelector(".brand-trust__icon-play");

//     playPauseBtn.addEventListener("click", () => {
//       if (btSwiper.autoplay.running) {
//         btSwiper.autoplay.stop();
//         iconPause.classList.add("hidden");
//         iconPlay.classList.remove("hidden");
//       } else {
//         btSwiper.autoplay.start();
//         iconPause.classList.remove("hidden");
//         iconPlay.classList.add("hidden");
//       }
//     });
//   }

//   // 실제 스크롤과 연동되는 앞/뒤 커튼 (width > 768px)
//   const isDesktop = window.matchMedia("(min-width: 769px)");
//   const leftCover = section.querySelector(".brand-trust__left-cover");
//   const rightCover = section.querySelector(".brand-trust__right-cover");

//   if (
//     typeof gsap !== "undefined" &&
//     typeof ScrollTrigger !== "undefined" &&
//     isDesktop.matches
//   ) {
//     gsap.registerPlugin(ScrollTrigger);

//     ScrollTrigger.create({
//       trigger: ".brand-trust",
//       start: "top top",
//       end: "bottom bottom",
//       scrub: true, // 스크롤 휠을 통한 커튼 제어
//       pin: false,
//       onUpdate: (self) => {
//         const progress = self.progress;

//         if (leftCover && rightCover) {
//           const curtainProgress = Math.min(progress / 0.5, 1);
//           const currentWidth = (1 - curtainProgress) * 50;
//           leftCover.style.width =
//             currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px"; // 여유있게 앞섶 느낌으로 4px 더하기
//           rightCover.style.width =
//             currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px";
//         }

//         // 반 정도(다 열렸을 때) counterTriggered 값을 바꿔서 숫자 카운트 애니메이션 열리게 하기
//         if (progress > 0.5) {
//           if (!counterTriggered) {
//             counterTriggered = true;
//             runStatsAnimation();
//           }
//         } else if (progress < 0.2) {
//           counterTriggered = false; // 아직 덜 열렸다면 숫자 카운트 애니메이션은 안보이게 하기
//         }
//       },
//     });
//   } else {
//     // 모바일/태블릿에선 커튼 효과 제거
//     if (leftCover) leftCover.style.width = "0";
//     if (rightCover) rightCover.style.width = "0";

//     // 모바일/태블릿에선 숫자 카운터 애니메이션을 즉시 실행
//     runStatsAnimation();
//   }
// }
function initBrandTrustPartners() {
  const section = document.querySelector(".brand-trust");
  if (!section) return;
  if (section.dataset.initialized === "true") return;

  const swiperElement = section.querySelector(".brand-trust__swiper");
  if (!swiperElement) return;

  const slides = section.querySelectorAll(
    ".swiper-slide:not(.swiper-slide-duplicate)",
  );
  const totalSlidesCount = slides.length;
  if (totalSlidesCount === 0) return;

  section.dataset.initialized = "true";

  const hasGsap = typeof gsap !== "undefined";
  const hasScrollTrigger = hasGsap && typeof ScrollTrigger !== "undefined";

  function runStatsAnimation() {
    const numElements = section.querySelectorAll(".brand-trust__stat-num");

    numElements.forEach((element) => {
      const target = parseFloat(element.getAttribute("data-target"));
      const decimals = parseInt(element.getAttribute("data-decimals"), 10);

      const render = (val) => {
        element.textContent =
          decimals > 0
            ? val.toFixed(decimals)
            : Math.floor(val).toLocaleString();
      };

      if (!hasGsap) {
        render(target);
        return;
      }

      const counterObj = { value: 0 };
      gsap.to(counterObj, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => render(counterObj.value),
      });
    });
  }

  // Swiper 연동 (페이지네이션 및 컨트롤) //
  function updateControls(swiper) {
    const current = section.querySelector(".brand-trust__current-index");
    const total = section.querySelector(".brand-trust__total-index");
    const progressFill = section.querySelector(".brand-trust__progress-fill");

    if (!current || !total) return;

    const realIndex = swiper.realIndex + 1;
    current.textContent = String(realIndex).padStart(2, "0");
    total.textContent = String(totalSlidesCount).padStart(2, "0");

    if (progressFill) {
      progressFill.style.width = `${(realIndex / totalSlidesCount) * 100}%`;
    }
  }

  const btSwiper = new Swiper(swiperElement, {
    effect: "slide",
    speed: 800,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: section.querySelector(".brand-trust__btn--next"),
      prevEl: section.querySelector(".brand-trust__btn--prev"),
    },
    on: {
      init: function () {
        updateControls(this);
      },
      slideChange: function () {
        updateControls(this);
      },
    },
  });

  // 재생/일시정지 버튼 연동
  const playPauseBtn = section.querySelector(".brand-trust__btn--play-pause");
  if (playPauseBtn) {
    const iconPause = playPauseBtn.querySelector(".brand-trust__icon-pause");
    const iconPlay = playPauseBtn.querySelector(".brand-trust__icon-play");

    const syncButtonUI = (isRunning) => {
      iconPause?.classList.toggle("hidden", !isRunning);
      iconPlay?.classList.toggle("hidden", isRunning);
    };

    syncButtonUI(btSwiper.autoplay.running);

    playPauseBtn.addEventListener("click", () => {
      if (btSwiper.autoplay.running) {
        btSwiper.autoplay.stop();
        syncButtonUI(false);
      } else {
        btSwiper.autoplay.start();
        syncButtonUI(true);
      }
    });
  }

  // 커튼 및 ScrollTrigger 연동 (명시적 인라인 클린업)
  const leftCover = section.querySelector(".brand-trust__left-cover");
  const rightCover = section.querySelector(".brand-trust__right-cover");

  const setCoverWidth = (widthStr) => {
    if (leftCover) leftCover.style.width = widthStr;
    if (rightCover) rightCover.style.width = widthStr;
  };

  if (hasScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const mm = gsap.matchMedia();

    // 데스크톱 (769px 이상)
    mm.add("(min-width: 769px)", () => {
      let counterTriggered = false;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const progress = self.progress;
          const curtainProgress = Math.min(progress / 0.5, 1);
          const currentWidth = (1 - curtainProgress) * 50;
          setCoverWidth(
            currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px",
          );

          if (progress > 0.5) {
            if (!counterTriggered) {
              counterTriggered = true;
              runStatsAnimation();
            }
          } else if (progress < 0.2) {
            counterTriggered = false;
          }
        },
      });

      return () => {
        setCoverWidth("");
        counterTriggered = false;
      };
    });

    // 모바일 (768px 이하)
    mm.add("(max-width: 768px)", () => {
      setCoverWidth("0px");
      runStatsAnimation();

      return () => {
        setCoverWidth("");
      };
    });
  } else {
    // GSAP/ScrollTrigger 미지원 환경
    setCoverWidth("0px");
    runStatsAnimation();
  }
}

function initLocationSlider() {
  const container = document.querySelector(".location__swiper");
  if (!container) return;

  const locationSwiper = new Swiper(".location__swiper", {
    slidesPerView: 1.15,
    spaceBetween: 20,
    grabCursor: true,
    speed: 400,
    navigation: {
      nextEl: ".location__controls .slider-nav__btn--next",
      prevEl: ".location__controls .slider-nav__btn--prev",
    },
    breakpoints: {
      640: {
        slidesPerView: 1.8,
        spaceBetween: 24,
      },
      960: {
        slidesPerView: 2.3,
        spaceBetween: 28,
      },
      1200: {
        slidesPerView: 2.6,
        spaceBetween: 32,
      },
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    a11y: {
      prevSlideMessage: "이전 장소 및 시설 보기",
      nextSlideMessage: "다음 장소 및 시설 보기",
      firstSlideMessage: "첫 번째 장소입니다",
      lastSlideMessage: "마지막 장소입니다",
    },
  });
}

function initNewsTabs() {
  const tabs = document.querySelectorAll(".news__tab-button");
  const panels = document.querySelectorAll(".news__content");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", "false"));
      panels.forEach((p) => (p.hidden = true));

      tab.setAttribute("aria-selected", "true");
      panels[index].hidden = false;
    });
  });
}
