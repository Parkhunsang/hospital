document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;

  const headerWrap = topbar.querySelector(".topbar_nav_wrap");
  const mainMenu = topbar.querySelectorAll(".topbar__links > li > a");
  const topbarNav = topbar.querySelector(".topbar__nav");
  const hamburger = topbar.querySelector(".topbar__hamburger");
  const drawer = document.querySelector(".topbar__drawer");

  let isDrawerOpen = false;
  let lastScrollY = window.scrollY;

  // ==========================================
  // 1. PC 데스크탑 드롭다운 메뉴 (80px <-> 300px)
  // ==========================================
  function openMenu() {
    if (window.innerWidth <= 960) return;
    if (headerWrap) headerWrap.classList.add("is-open");
  }

  function closeMenu() {
    if (headerWrap) headerWrap.classList.remove("is-open");
  }

  if (mainMenu.length) {
    mainMenu.forEach((item) => {
      item.addEventListener("mouseenter", openMenu);
      item.addEventListener("focus", openMenu);
    });
  }

  if (headerWrap) {
    headerWrap.addEventListener("mouseleave", closeMenu);
    headerWrap.addEventListener("focusout", (e) => {
      if (!headerWrap.contains(e.relatedTarget)) {
        closeMenu();
      }
    });
  }

  // ==========================================
  // 2. 스크롤 감지 (Scroll Up/Down 헤더 숨김 & 노출)
  // ==========================================
  function handleScroll() {
    if (isDrawerOpen) return;

    const currentScrollY = window.scrollY;

    // 최상단 근처 (10px 이하)
    if (currentScrollY <= 10) {
      topbar.classList.add("topbar--top");
      topbar.classList.remove("topbar--up", "topbar--down");
      lastScrollY = currentScrollY;
      return;
    }

    // 마우스 드롭다운 메뉴가 열려있거나 포커스가 내부에 있을 때 숨김 방지
    if ((headerWrap && headerWrap.classList.contains("is-open")) || topbar.contains(document.activeElement)) {
      topbar.classList.add("topbar--up");
      topbar.classList.remove("topbar--down", "topbar--top");
      lastScrollY = currentScrollY;
      return;
    }

    const scrollDiff = currentScrollY - lastScrollY;

    if (Math.abs(scrollDiff) > 5) {
      if (scrollDiff > 0) {
        // 아래로 스크롤 시 -> 위로 감춤 (topbar--down)
        topbar.classList.add("topbar--down");
        topbar.classList.remove("topbar--up", "topbar--top");
      } else {
        // 위로 스크롤 시 -> 상단에 고정 노출 (topbar--up)
        topbar.classList.add("topbar--up");
        topbar.classList.remove("topbar--down", "topbar--top");
      }
      lastScrollY = currentScrollY;
    }
  }

  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  // ==========================================
  // 3. 모바일 햄버거 버튼 & 드로어 (Drawer) 토글
  // ==========================================
  function openDrawer() {
    if (!drawer || !hamburger) return;
    isDrawerOpen = true;
    if (topbarNav) topbarNav.classList.add("topbar__nav--open");
    hamburger.classList.add("topbar__hamburger--active");
    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "메뉴 닫기");
    drawer.classList.add("topbar__drawer--active");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    if (!drawer || !hamburger) return;
    isDrawerOpen = false;
    if (topbarNav) topbarNav.classList.remove("topbar__nav--open");
    hamburger.classList.remove("topbar__hamburger--active");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "메뉴 열기");
    drawer.classList.remove("topbar__drawer--active");
    drawer.setAttribute("aria-hidden", "true");
  }

  function toggleDrawer() {
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  if (hamburger) {
    hamburger.addEventListener("click", toggleDrawer);
  }

  // ESC 키로 모바일 드로어 닫기
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawerOpen) {
      closeDrawer();
      if (hamburger) hamburger.focus();
    }
  });

  // 모바일 아코디언 서브메뉴 토글
  const drawerItems = document.querySelectorAll(".topbar__drawer-item");
  drawerItems.forEach((item) => {
    const toggleBtn = item.querySelector(".topbar__drawer-toggle");
    const subList = item.querySelector(".topbar__drawer-sub-list");

    if (!toggleBtn || !subList) return;

    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = toggleBtn.getAttribute("aria-expanded") === "true";

      drawerItems.forEach((otherItem) => {
        const otherToggle = otherItem.querySelector(".topbar__drawer-toggle");
        const otherSubList = otherItem.querySelector(
          ".topbar__drawer-sub-list",
        );
        if (otherToggle && otherSubList && otherItem !== item) {
          otherItem.classList.remove("topbar__drawer-item--active");
          otherToggle.classList.remove("topbar__drawer-toggle--active");
          otherToggle.setAttribute("aria-expanded", "false");
          otherSubList.classList.remove("topbar__drawer-sub-list--active");
        }
      });

      if (isExpanded) {
        item.classList.remove("topbar__drawer-item--active");
        toggleBtn.classList.remove("topbar__drawer-toggle--active");
        toggleBtn.setAttribute("aria-expanded", "false");
        subList.classList.remove("topbar__drawer-sub-list--active");
      } else {
        item.classList.add("topbar__drawer-item--active");
        toggleBtn.classList.add("topbar__drawer-toggle--active");
        toggleBtn.setAttribute("aria-expanded", "true");
        subList.classList.add("topbar__drawer-sub-list--active");
      }
    });
  });

  // 앵커 링크 클릭 시 드로어 자동 닫기
  const drawerLinks = document.querySelectorAll(
    ".topbar__drawer-link, .topbar__drawer-sub-link, .topbar__drawer-btn",
  );
  drawerLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeDrawer();
    });
  });

  // 960px 초과 시 드로어 자동 닫기
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && isDrawerOpen) {
      closeDrawer();
    }
  });

  // WAI-ARIA 접근성 aria-expanded 동적 처리
  const items = topbar.querySelectorAll(".topbar__item");
  items.forEach((item) => {
    function setExpanded(expanded) {
      item.setAttribute("aria-expanded", expanded ? "true" : "false");
    }

    item.addEventListener("mouseenter", () => setExpanded(true));
    item.addEventListener("mouseleave", () => setExpanded(false));

    item.addEventListener("focusin", () => setExpanded(true));
    item.addEventListener("focusout", (e) => {
      if (!item.contains(e.relatedTarget)) {
        setExpanded(false);
      }
    });
  });

  // ==========================================
  // 4. GNB - 3D Body Map (통증 부위) 연동 인터랙션
  // ==========================================
  const painTargetLinks = document.querySelectorAll("[data-pain-target]");
  painTargetLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("data-pain-target");
      const targetSection = document.querySelector("#hero-3d");

      if (targetSection) {
        // 3D 바디 맵 영역으로 부드럽게 스크롤
        targetSection.scrollIntoView({ behavior: "smooth", block: "start" });

        // 스크롤 완료 후(600ms 딜레이) 3D 모델의 해당 통증 부위를 클릭 시뮬레이션
        setTimeout(() => {
          const painItem = document.querySelector(
            `.hero-3d__pain-item[data-target="${targetId}"]`
          );
          if (painItem) {
            painItem.click();
          }
        }, 600);
      }
    });
  });
});
