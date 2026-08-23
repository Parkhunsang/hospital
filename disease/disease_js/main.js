/* ==========================================
   목 디스크(경추 추간판 탈출증) 상세 페이지 스크립트
   원인 캐러셀 슬라이더 및 치료법 타임라인 인터랙션 구현
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  initCausesCarousel();
  initTreatmentTimeline();
});

/**
 * 1. 발생 원인 캐러셀 슬라이더 로직
 */
function initCausesCarousel() {
  const track = document.querySelector(".neck-causes__track");
  const viewport = document.querySelector(".neck-causes__viewport");
  const cards = Array.from(document.querySelectorAll(".neck-causes__card"));
  const prevBtn = document.querySelector(".neck-causes__nav-btn[data-direction='prev']") || document.querySelector(".neck-causes__nav-btn--prev");
  const nextBtn = document.querySelector(".neck-causes__nav-btn[data-direction='next']") || document.querySelector(".neck-causes__nav-btn--next");
  const indicatorWrap = document.querySelector(".neck-causes__indicator-wrap");

  if (!track || !viewport || cards.length === 0) return;

  let currentIndex = 0;
  let cardsToShow = getCardsToShowCount();
  const maxIndex = cards.length - cardsToShow;

  // 인디케이터 도트 동적 생성
  indicatorWrap.innerHTML = "";
  const dotCount = cards.length - cardsToShow + 1;
  for (let i = 0; i < dotCount; i++) {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `neck-causes__dot ${i === 0 ? "neck-causes__dot--active" : ""}`;
    if (i === 0) dot.setAttribute("data-active", "true");
    dot.setAttribute("aria-label", `${i + 1}번째 원인 슬라이드로 이동`);
    dot.dataset.index = i;
    indicatorWrap.appendChild(dot);
  }

  const dots = Array.from(document.querySelectorAll(".neck-causes__dot"));

  // 슬라이드 이동 함수
  function moveSlider(index) {
    if (index < 0) index = 0;
    if (index > maxIndex) index = maxIndex;

    currentIndex = index;

    const cardWidth = cards[0].getBoundingClientRect().width;
    const gap = 20; // CSS의 gap 값과 일치해야 함
    const moveX = (cardWidth + gap) * currentIndex;

    track.style.transform = `translateX(-${moveX}px)`;

    // 도트 업데이트
    dots.forEach((dot, idx) => {
      if (idx === currentIndex) {
        dot.classList.add("neck-causes__dot--active");
        dot.setAttribute("data-active", "true");
      } else {
        dot.classList.remove("neck-causes__dot--active");
        dot.removeAttribute("data-active");
      }
    });

    // 버튼 활성/비활성 처리
    if (prevBtn) {
      prevBtn.disabled = currentIndex === 0;
      prevBtn.style.opacity = currentIndex === 0 ? "0.4" : "1";
    }
    if (nextBtn) {
      nextBtn.disabled = currentIndex === maxIndex;
      nextBtn.style.opacity = currentIndex === maxIndex ? "0.4" : "1";
    }
  }

  // 화면 너비에 따른 카드 표시 개수 반환
  function getCardsToShowCount() {
    const width = window.innerWidth;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
  }

  // 다음 버튼
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      if (currentIndex < maxIndex) {
        moveSlider(currentIndex + 1);
      }
    });
  }

  // 이전 버튼
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      if (currentIndex > 0) {
        moveSlider(currentIndex - 1);
      }
    });
  }

  // 도트 클릭 이동
  dots.forEach(dot => {
    dot.addEventListener("click", (e) => {
      const targetIndex = parseInt(e.target.dataset.index, 10);
      moveSlider(targetIndex);
    });
  });

  // 화면 리사이즈 시 재정렬
  window.addEventListener("resize", () => {
    const newCardsToShow = getCardsToShowCount();
    if (newCardsToShow !== cardsToShow) {
      cardsToShow = newCardsToShow;
      moveSlider(0); // 첫 슬라이드로 초기화 후 재생성
    } else {
      moveSlider(currentIndex); // 현재 인덱스 가로길이 다시 계산
    }
  });

  // 초기 실행
  moveSlider(0);
}

/**
 * 2. 단계별 치료 로드맵 타임라인 인터랙션
 */
function initTreatmentTimeline() {
  const steps = document.querySelectorAll(".neck-timeline__step");
  if (steps.length === 0) return;

  // 스크롤 시 화면 중앙에 오는 타임라인 활성화
  window.addEventListener("scroll", () => {
    const triggerHeight = window.innerHeight * 0.6; // 화면 60% 높이선 기준

    steps.forEach(step => {
      const rect = step.getBoundingClientRect();
      if (rect.top < triggerHeight && rect.bottom > 200) {
        steps.forEach(s => {
          s.classList.remove("neck-timeline__step--active");
          s.removeAttribute("data-active");
        });
        step.classList.add("neck-timeline__step--active");
        step.setAttribute("data-active", "true");
      }
    });
  });

  // 클릭하여 강제 활성화도 가능하도록 함
  steps.forEach(step => {
    step.addEventListener("click", () => {
      steps.forEach(s => {
        s.classList.remove("neck-timeline__step--active");
        s.removeAttribute("data-active");
      });
      step.classList.add("neck-timeline__step--active");
      step.setAttribute("data-active", "true");
    });
  });
}
