document.addEventListener("DOMContentLoaded", () => {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  const headerWrap = topbar.querySelector(".topbar_nav_wrap");
  const mainMenu = topbar.querySelectorAll(".gnb__item > .gnb__link");
  const hamburger = topbar.querySelector(".topbar__hamburger");
  const drawer = document.querySelector(".drawer");

  let isDrawerOpen = false;
  let lastScrollY = window.scrollY;

  // 1. PC 데스크탑 드롭다운 메뉴 (80px <-> 300px) //
  function openMenu() {
    if (window.innerWidth <= 960) return;
    if (headerWrap) headerWrap.classList.add("is-open");
    mainMenu.forEach((link) => link.setAttribute("aria-expanded", "true"));
  }

  function closeMenu() {
    if (headerWrap) headerWrap.classList.remove("is-open");
    mainMenu.forEach((link) => link.setAttribute("aria-expanded", "false"));
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
  // 2. 스크롤 감지 (Scroll Up/Down 헤더 숨김 & 노출) //
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

    // 마우스 드롭다운 메뉴가 열려있을 때 숨김 방지
    if (headerWrap && headerWrap.classList.contains("is-open")) {
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
  // 3. 모바일 햄버거 버튼 & 드로어 (Drawer) 토글 //
  function openDrawer() {
    isDrawerOpen = true;
    hamburger.classList.add("topbar__hamburger--active");
    drawer.classList.add("drawer--active");

    hamburger.setAttribute("aria-expanded", "true");
    hamburger.setAttribute("aria-label", "메뉴 닫기");
    drawer.setAttribute("aria-hidden", "false");
  }

  function closeDrawer() {
    isDrawerOpen = false;
    hamburger.classList.remove("topbar__hamburger--active");
    drawer.classList.remove("drawer--active");

    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "메뉴 열기");
    drawer.setAttribute("aria-hidden", "true");
  }

  hamburger.addEventListener("click", () => {
    if (isDrawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });
  // 모바일 아코디언 서브메뉴 토글
  const drawerItems = document.querySelectorAll(".drawer__item");
  drawerItems.forEach((item) => {
    const toggleBtn = item.querySelector(".drawer__toggle");
    const subList = item.querySelector(".drawer__sub-list");

    toggleBtn.addEventListener("click", () => {
      // 1. 내가 아닌 다른 메뉴들은 무조건 닫기
      drawerItems.forEach((otherItem) => {
        if (otherItem !== item) {
          otherItem
            .querySelector(".drawer__sub-list")
            .classList.remove("drawer__sub-list--active");
          otherItem
            .querySelector(".drawer__toggle")
            .classList.remove("drawer__toggle--active");
          otherItem
            .querySelector(".drawer__toggle")
            .setAttribute("aria-expanded", "false");
        }
      });

      // 2. 내 메뉴만 스위치(toggle) 켜고 끄기
      const isOpen = subList.classList.toggle("drawer__sub-list--active");
      toggleBtn.classList.toggle("drawer__toggle--active");
      toggleBtn.setAttribute("aria-expanded", isOpen);
    });
  });

  // 앵커 링크 클릭 시 드로어 자동 닫기
  drawer.addEventListener("click", (e) => {
    if (e.target.closest("a")) closeDrawer();
  });

  // 960px 초과 시 드로어 자동 닫기
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960 && isDrawerOpen) {
      closeDrawer();
    }
  });

  // ESC 키로 모바일 드로어 닫기 for 저시력자 or 모바일 사용자가 아닌 유저 or 키보드 사용자
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isDrawerOpen) {
      closeDrawer();
      if (hamburger) hamburger.focus();
    }
  });

  // 4. 서브페이지 LNB 드롭다운 토글 //
  const lnbItems = document.querySelectorAll(".lnb__item");

  if (lnbItems.length) {
    lnbItems.forEach((item) => {
      const btn = item.querySelector(".lnb__button");
      if (!btn) return;

      btn.addEventListener("click", (e) => {
        e.stopPropagation();

        // 1) 내가 아닌 다른 열린 LNB 메뉴는 모두 닫기
        lnbItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove("lnb__item--open");
            const otherBtn = otherItem.querySelector(".lnb__button");
            if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          }
        });

        // 2) 현재 클릭한 메뉴 열기/닫기 스위치(toggle)
        const isOpen = item.classList.toggle("lnb__item--open");
        btn.setAttribute("aria-expanded", isOpen);
      });
    });

    // 3) LNB 바깥(본문 빈 곳) 클릭 시 열린 드롭다운 모두 닫기
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".lnb")) {
        lnbItems.forEach((item) => {
          item.classList.remove("lnb__item--open");
          const btn = item.querySelector(".lnb__button");
          if (btn) btn.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  // 이벤트 리스너 최적화(공부필요)
  // let scrollTicking = false;
  // window.addEventListener(
  //   "scroll",
  //   () => {
  //     if (!scrollTicking) {
  //       requestAnimationFrame(() => {
  //         handleScroll();
  //         scrollTicking = false;
  //       });
  //       scrollTicking = true;
  //     }
  //   },
  //   { passive: true },
  // );
});
