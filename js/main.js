document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  initBrandTrustPartners();
  initLocationSlider();
  initNewsTabs();
});

function initIntroDoor() {
  const introDoor = document.querySelector(".intro-door");
  if (!introDoor) return;

  const enterBtn = introDoor.querySelector("#enter-clinic-btn");
  const doorLeft = introDoor.querySelector(".intro-door__panel--left");
  const doorRight = introDoor.querySelector(".intro-door__panel--right");
  const introContent = introDoor.querySelector(".intro-door__content");
  const hasGsap = typeof gsap !== "undefined";
  document.body.classList.add("door-locked");

  // 메인 콘텐츠 요소 초기 상태 설정 (GSAP 있을 때만 숨김 처리)
  if (hasGsap) {
    gsap.set(".topbar", { opacity: 0, y: -80 });
    gsap.set(".hero-3d__menu", { opacity: 0, x: -50 });
    gsap.set(".hero-3d__welcome", { opacity: 0, y: -50 });
  }

  let hasOpened = false;
  let openedByKeyboard = false; // 키보드 조작 여부 판별 플래그

  // GSAP이든 Fallback이든 문 열림이 끝나면 단 한 번만 실행
  function finishIntroDoor() {
    introDoor.style.display = "none";
    document.body.classList.remove("door-locked");

    document.querySelectorAll("header, main, footer").forEach((element) => {
      element.removeAttribute("inert");
    });
    // Three.js 캔버스 렌더링 영역 화면 맞춤
    window.dispatchEvent(new Event("resize"));
    // GSAP 인라인 스타일 초기화 (헤더 스크롤 CSS 제어 복원)
    if (hasGsap) {
      gsap.set(".topbar", { clearProps: "all" });
    }
    // 키보드로 문을 연 사용자에게만 상단 로고로 안전하게 초점 이동
    if (openedByKeyboard) {
      const brandLink = document.querySelector(".topbar__brand");
      if (brandLink) {
        brandLink.focus();
      }
    }
  }

  function openDoors() {
    if (hasOpened) return;
    hasOpened = true;

    // 이벤트 리스너 제거 (센서 철거)
    if (enterBtn) {
      enterBtn.removeEventListener("click", onEnterBtnClick);
    }
    window.removeEventListener("wheel", handleScrollTrigger);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchTrigger);
    window.removeEventListener("keydown", handleKeydownTrigger);

    if (hasGsap) {
      const tl = gsap.timeline({
        onComplete: finishIntroDoor,
      });
      tl.to(introContent, {
        opacity: 0,
        y: -40,
        duration: 0.6,
        ease: "power2.in",
      });
      tl.to(
        doorLeft,
        {
          xPercent: -100,
          duration: 1.5,
          ease: "power3.inOut",
        },
        "-=0.2",
      );
      tl.to(
        doorRight,
        {
          xPercent: 100,
          duration: 1.5,
          ease: "power3.inOut",
        },
        "-=1.5",
      );
      tl.to(
        ".topbar",
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        },
        "-=0.9",
      );
      tl.to(
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
    } else {
      introDoor.classList.add("intro-door--opened");
      doorLeft.addEventListener("transitionend", finishIntroDoor, {
        once: true,
      });
    }
  }

  // 스크롤 휠 감지 (마우스 휠)
  function handleScrollTrigger(e) {
    if (e.deltaY > 0) {
      openDoors();
    }
  }

  // 모바일 터치 드래그 감지
  let touchStartY = 0;
  function handleTouchStart(e) {
    touchStartY = e.touches[0].clientY;
  }

  function handleTouchTrigger(e) {
    const touchEndY = e.touches[0].clientY;
    if (touchStartY - touchEndY > 30) {
      openDoors();
    }
  }

  // 키보드 조작 감지 (방향키, Enter, Space 등)
  function handleKeydownTrigger(e) {
    const triggerKeys = ["ArrowDown", "PageDown", " ", "Enter"];
    if (triggerKeys.includes(e.key)) {
      openedByKeyboard = true;
      openDoors();
    }
  }

  // 입장 버튼 클릭 핸들러 (마우스 클릭 vs 키보드 엔터 구분)
  function onEnterBtnClick(e) {
    // 키보드로 엔터/스페이스를 쳐서 발생한 클릭은 e.detail이 0
    if (e.detail === 0) {
      openedByKeyboard = true;
    }
    openDoors();
  }

  // html 리딩 후에 첫 번째 요소에 포커스가 갈 수 있도록 조정(requestAnimationFrame를 통해)
  if (enterBtn) {
    enterBtn.addEventListener("click", onEnterBtnClick);
    requestAnimationFrame(() => {
      enterBtn.focus();
    });
  }
  // passive를 통해 브라우저에서 자동으로 e.preventDefault를 호출 안하겠다고 미리 선언, keydown은 3개의 이벤트와 달리 딜레이를 피할 수 있음
  window.addEventListener("wheel", handleScrollTrigger, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchTrigger, { passive: true });
  window.addEventListener("keydown", handleKeydownTrigger);
}

function initBrandTrustPartners() {
  const section = document.querySelector(".brand-trust");
  if (!section) return;

  let counterTriggered = false;

  // Helper function to update custom Swiper pagination and progress bar
  function updateBTControls(swiper) {
    const current = section.querySelector(".brand-trust__current-index");
    const total = section.querySelector(".brand-trust__total-index");
    const progressFill = section.querySelector(".brand-trust__progress-fill");

    if (!current || !total) return;

    const realIndex = swiper.realIndex + 1;
    const totalSlides = 3; // stats, training, philosophy

    current.textContent = String(realIndex).padStart(2, "0");
    total.textContent = String(totalSlides).padStart(2, "0");
    if (progressFill) {
      progressFill.style.width = `${(realIndex / totalSlides) * 100}%`;
    }
  }

  // Helper function to animate Slide 1 counter numbers (including clones)
  function runStatsAnimation() {
    const valElements = section.querySelectorAll(".brand-trust__stat-val");
    valElements.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-target"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0");
      const suffix = el.getAttribute("data-suffix") || "";

      const counterObj = { value: 0 };
      gsap.killTweensOf(counterObj);

      gsap.to(counterObj, {
        value: target,
        duration: 1.8,
        ease: "power2.out",
        onUpdate: () => {
          let formattedVal = "";
          if (decimals > 0) {
            formattedVal = counterObj.value.toFixed(decimals);
          } else {
            formattedVal = Math.floor(counterObj.value).toLocaleString();
          }
          el.innerHTML = `${formattedVal}<small>${suffix}</small>`;
        },
      });
    });
  }

  // 1. Initialize Swiper
  const btSwiper = new Swiper(".brand-trust__swiper", {
    effect: "slide",
    speed: 800,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".brand-trust__btn--next",
      prevEl: ".brand-trust__btn--prev",
    },
    on: {
      init: function () {
        updateBTControls(this);
      },
      slideChange: function () {
        updateBTControls(this);
        // Play counter-up animation when user slides back to Slide 1
        const isDesktop = window.matchMedia("(min-width: 769px)");
        if (this.realIndex === 0 && (!isDesktop.matches || counterTriggered)) {
          runStatsAnimation();
        }
      },
    },
  });

  // Play/Pause button click handler
  const playPauseBtn = section.querySelector(".brand-trust__btn--play-pause");
  if (playPauseBtn) {
    const iconPause = playPauseBtn.querySelector(".brand-trust__icon-pause");
    const iconPlay = playPauseBtn.querySelector(".brand-trust__icon-play");

    playPauseBtn.addEventListener("click", () => {
      if (btSwiper.autoplay.running) {
        btSwiper.autoplay.stop();
        iconPause.classList.add("hidden");
        iconPlay.classList.remove("hidden");
      } else {
        btSwiper.autoplay.start();
        iconPause.classList.remove("hidden");
        iconPlay.classList.add("hidden");
      }
    });
  }

  // 2. GSAP ScrollTrigger timelines for Desktop (width > 768px)
  const isDesktop = window.matchMedia("(min-width: 769px)");
  const leftCover = section.querySelector(".brand-trust__left-cover");
  const rightCover = section.querySelector(".brand-trust__right-cover");

  if (
    typeof gsap !== "undefined" &&
    typeof ScrollTrigger !== "undefined" &&
    isDesktop.matches
  ) {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.create({
      trigger: ".brand-trust",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      pin: false,
      onUpdate: (self) => {
        const progress = self.progress;

        // 1) Animate curtain widths (fully open by progress = 0.5) - 캐싱된 요소 재사용
        if (leftCover && rightCover) {
          const curtainProgress = Math.min(progress / 0.5, 1);
          const currentWidth = (1 - curtainProgress) * 50;
          leftCover.style.width =
            currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px";
          rightCover.style.width =
            currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px";
        }

        // 2) Trigger stats counter count-up when curtain is fully open (>0.5)
        if (progress > 0.5) {
          if (!counterTriggered) {
            counterTriggered = true;
            runStatsAnimation();
          }
        } else if (progress < 0.2) {
          counterTriggered = false; // Reset trigger so it can re-animate when scrolling down again
        }
      },
    });
  } else {
    // Mobile/Tablet Fallback: Fully open curtains (캐싱된 요소 사용)
    if (leftCover) leftCover.style.width = "0";
    if (rightCover) rightCover.style.width = "0";

    // Trigger stats counter immediately on mobile fallback
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
  const tabList = document.querySelector('.news__tab-bar[role="tablist"]');
  if (!tabList) return;

  const tabs = Array.from(
    tabList.querySelectorAll('.news__tab-button[role="tab"]'),
  );
  const panels = Array.from(
    document.querySelectorAll('.news__content[role="tabpanel"]'),
  );

  function activateTab(targetTab) {
    tabs.forEach((tab) => {
      const isSelected = tab === targetTab;
      tab.setAttribute("aria-selected", isSelected ? "true" : "false");
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    const targetPanelId = targetTab.getAttribute("aria-controls");
    panels.forEach((panel) => {
      const isActive = panel.id === targetPanelId;
      panel.classList.toggle("is-active", isActive);
      if (isActive) {
        panel.removeAttribute("hidden");
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activateTab(tab));

    // WAI-ARIA 키보드 내비게이션 (좌/우 방향키 및 Home/End)
    tab.addEventListener("keydown", (e) => {
      let targetIndex = index;

      if (e.key === "ArrowRight") {
        targetIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        targetIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        targetIndex = 0;
      } else if (e.key === "End") {
        targetIndex = tabs.length - 1;
      } else {
        return;
      }

      e.preventDefault();
      tabs[targetIndex].focus();
      activateTab(tabs[targetIndex]);
    });
  });
}
