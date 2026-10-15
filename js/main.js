document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  initBrandTrustPartners();
  initLocationSlider();
  initNewsTabs();
});
// 인트로 도어 로직
// 1. 애니메이션 전담 (CSS transitionend 실패 대비 2초 타임아웃 장착)
function playDoorOpenAnimation(elements, hasGsap, onComplete) {
  const { introDoor, introContent, doorLeft, doorRight } = elements;

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
  let hasFired = false; //

  const fire = (isKeyboard) => {
    if (hasFired) return;
    hasFired = true;

    // 즉시 센서 철거
    window.removeEventListener("wheel", handleWheel);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("keydown", handleKeydown);
    if (enterBtn) enterBtn.removeEventListener("click", handleBtnClick);

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
  if (enterBtn) enterBtn.addEventListener("click", handleBtnClick);
}

// 뒷정리 함수
function cleanupIntroDoor(introDoor, openedByKeyboard) {
  introDoor.style.display = "none";
  document.body.classList.remove("door-locked");

  document.querySelectorAll("header, main, footer").forEach((el) => {
    el.removeAttribute("inert");
  });

  window.dispatchEvent(new Event("resize"));
  if (typeof gsap !== "undefined") {
    gsap.set(".topbar", { clearProps: "all" });
  }

  if (openedByKeyboard) {
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

  bindDoorTriggers(enterBtn, (openedByKeyboard) => {
    playDoorOpenAnimation(
      {
        introDoor,
        introContent: introDoor.querySelector(".intro-door__content"),
        doorLeft: introDoor.querySelector(".intro-door__panel--left"),
        doorRight: introDoor.querySelector(".intro-door__panel--right"),
      },
      hasGsap,
      () => cleanupIntroDoor(introDoor, openedByKeyboard),
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
// 태그 오염 없이 트윈 인스턴스를 격리 관리하는 메모리 맵
const statTweens = new WeakMap();

function initBrandTrustPartners() {
  const section = document.querySelector(".brand-trust");
  if (!section) return;

  // 1. 이미 성공적으로 초기화된 경우만 차단
  if (section.dataset.initialized === "true") return;

  // 2. [필수 요소 검증] - 하나라도 없으면 '도장 찍지 않고' 안전 탈출 (재시도 가능)
  const swiperElement = section.querySelector(".brand-trust__swiper");
  if (!swiperElement) return;

  const slides = section.querySelectorAll(
    ".swiper-slide:not(.swiper-slide-duplicate)",
  );
  const totalSlidesCount = slides.length;
  if (totalSlidesCount === 0) return; // 슬라이드가 0개면 중단

  // 3. 🎯 모든 관문을 통과했으므로 비로소 '초기화 성공 도장'을 찍음 (원자성 확보)
  section.dataset.initialized = "true";

  const hasGsap = typeof gsap !== "undefined";
  const hasScrollTrigger = hasGsap && typeof ScrollTrigger !== "undefined";

  // =========================================================================
  // 통계 숫자 카운터 (WeakMap + innerHTML 최소화 적용)
  // =========================================================================
  function runStatsAnimation() {
    const valElements = section.querySelectorAll(".brand-trust__stat-val");

    valElements.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-target")) || 0;
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const suffix = el.getAttribute("data-suffix") || "";

      // innerHTML 파싱 낭비를 줄이고 textContent 위주로 렌더링
      const render = (val) => {
        const formatted =
          decimals > 0
            ? val.toFixed(decimals)
            : Math.floor(val).toLocaleString();
        el.innerHTML = `${formatted}<small>${suffix}</small>`;
      };

      if (!hasGsap) {
        render(target);
        return;
      }

      // WeakMap을 이용한 안전한 이전 트윈 캔슬
      const existingTween = statTweens.get(el);
      if (existingTween) existingTween.kill();

      const counterObj = { value: 0 };
      const newTween = gsap.to(counterObj, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => render(counterObj.value),
      });

      statTweens.set(el, newTween);
    });
  }

  // =========================================================================
  // Swiper 연동 (페이지네이션 및 컨트롤)
  // =========================================================================
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

  let isContentVisible = false;

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
        // 화면이 사용자에게 보이고 있는 상태에서만 1번 슬라이드 카운터 재실행
        if (this.realIndex === 0 && isContentVisible) {
          runStatsAnimation();
        }
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

  // =========================================================================
  // 커튼 및 ScrollTrigger 연동 (명시적 인라인 클린업)
  // =========================================================================
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
      isContentVisible = false;

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
            isContentVisible = true;
            if (!counterTriggered) {
              counterTriggered = true;
              runStatsAnimation();
            }
          } else if (progress < 0.2) {
            counterTriggered = false;
            isContentVisible = false;
          }
        },
      });

      return () => {
        setCoverWidth("");
        counterTriggered = false;
        isContentVisible = false;
      };
    });

    // 모바일 (768px 이하)
    mm.add("(max-width: 768px)", () => {
      isContentVisible = true;
      setCoverWidth("0px");
      runStatsAnimation();

      return () => {
        setCoverWidth("");
        isContentVisible = false;
      };
    });
  } else {
    // GSAP/ScrollTrigger 미지원 환경
    isContentVisible = true;
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
