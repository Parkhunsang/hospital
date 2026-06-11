// 기존에 main.js 내용이 있다면 아래 코드를 파일 하단에 추가해 주세요.

document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  init3DBodyMap();
  initNonSurgicalSlider();
});

function init3DBodyMap() {
  const container = document.getElementById("canvas-container");
  if (!container) return;

  // 0. 메뉴 리스트 텍스트를 span으로 감싸기 (배경 확장 애니메이션을 위해 글자 레이어 분리)
  document.querySelectorAll(".menu-list li").forEach((li) => {
    const text = li.textContent;
    li.innerHTML = `<span>${text}</span>`;
  });

  // 1. 신체 부위별 데이터 (타겟(LookAt) 위치, 카메라(Zoom-in) 위치 설정)
  const bodyData = {
    neck: {
      title: "목",
      diseases: ["목디스크", "거북목 증후군"],
      targetX: 0,
      targetY: 1.6,
      camY: -3.5,
      camZ: -2.5,
    },
    shoulder: {
      title: "어깨",
      diseases: ["오십견", "회전근개파열", "석회성 건염", "견관절재발성 탈구"],
      targetY: 1.4,
      targetX: 0.3,
      camY: 1.4,
      camZ: 4.0,
    },
    waist: {
      title: "허리",
      diseases: [
        "허리디스크",
        "목 디스크",
        "척추협착증",
        "척추 전방 전위증",
        "척추 골절",
        "골다공증성 압박골절",
      ],
      targetY: 0.3,
      camY: -3.5,
      camZ: -5.5,
    },
    wrist: {
      title: "손목",
      diseases: [
        "손목터널증후군",
        "방아쇠손가락",
        "테니스엘보우",
        "골프엘보우",
        "팔꿈치터널증후군",
      ],
      targetX: 1.1, // 손목 위치에 맞게 시선(타겟)의 X 좌표를 오른쪽으로 이동
      targetY: 0.3,
      camX: 5.0, // 타겟이 우측으로 이동한 만큼 카메라도 우측으로 이동
      camY: 0.5,
      camZ: 3.5,
    },
    knee: {
      title: "무릎",
      diseases: [
        "회전형 인공관절 수술",
        "반관절 수술",
        "관절경 수술",
        "줄기세포 수술",
        "퇴행성 관절염",
      ],
      targetY: -0.8,
      targetX: 0.3,
      camY: 0,
      camZ: 2.0,
    },
    foot: {
      title: "발/ 발목",
      diseases: [
        "발목염좌/만성 불안정성",
        "무지외반증",
        "발목 관절염",
        "족저근막염 등 다양한 족부질환",
      ],
      targetY: -1.8,
      targetX: 0.4,
      camY: -3.8,
      camZ: -1.5,
    },
  };

  // 2. 기본 Scene, Camera, Renderer 초기화
  const scene = new THREE.Scene();
  // scene.background 코드를 지워서 CSS의 그라데이션 배경이 보이도록 투명하게 만듭니다.
  scene.fog = new THREE.Fog(0xc4d7eb, 10, 30); // 배경 그라데이션 톤에 맞춤

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  const defaultCamPos = { x: 0, y: 0, z: 9 };
  camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // 3. 조명 (빛) 세팅
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // 배경이 어두워졌으므로 환경광을 낮춰 대비를 높임
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  // 주 조명을 조금 더 밝게
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // 뒷면에서 비추는 보조광을 강한 블루 톤으로 주어 모델의 외곽선이 돋보이게 합니다.
  const backLight = new THREE.DirectionalLight(0xabcfff, 0.5);
  backLight.position.set(-5, 8, -7);
  scene.add(backLight);

  // 4. 실제 OBJ 인체 모델 로드
  const loader = new THREE.OBJLoader();
  loader.load(
    "./assets/human_body.obj",
    function (object) {
      const model = object;

      // 인체 모델을 푸른빛이 도는 메탈릭 톤으로 변경하여 어두운 배경과 대비시킵니다.
      const material = new THREE.MeshStandardMaterial({
        color: 0xe5e5e5, // 얕은 회색
        roughness: 0.4,
        metalness: 0.1,
      });

      // 그림자 생성 및 모든 메시(Mesh)에 재질 적용
      model.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          node.material = material;
        }
      });

      // 모델의 기본 크기나 위치 조절이 필요하다면 아래 주석을 풀고 수치를 변경하세요.
      model.scale.set(0.2, 0.2, 0.2);
      model.position.set(0, -2, 0);

      scene.add(model);
    },
    undefined,
    function (error) {
      console.error("3D 모델을 불러오는 중 오류가 발생했습니다:", error);
    },
  );

  // 5. 마우스 드래그 컨트롤 설정
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; // 부드러운 감속 효과
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2; // 바닥 아래로 카메라가 내려가지 않도록 제한
  controls.enableZoom = false; // 마우스 스크롤을 통한 줌인/줌아웃 비활성화
  controls.minDistance = 3;
  controls.maxDistance = 15;
  controls.target.set(0, 0, 0);

  // --------------------------------------------------------
  // [마커] 통증 부위 표시용 빛나는 포인터 생성
  const markerGroup = new THREE.Group();
  const markerGeo = new THREE.SphereGeometry(0.06, 32, 32);
  // depthTest: false를 주어 3D 모델 안쪽에 마커가 파묻혀도 항상 뚫고 보이도록 설정
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0xff3366,
    depthTest: false,
  });
  const markerMesh = new THREE.Mesh(markerGeo, markerMat);
  markerMesh.renderOrder = 999;
  markerGroup.add(markerMesh);

  const glowGeo = new THREE.SphereGeometry(0.12, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff3366,
    transparent: true,
    opacity: 0.4,
    depthTest: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.renderOrder = 998;
  markerGroup.add(glowMesh);

  markerGroup.visible = false; // 초기에는 마커를 숨김
  scene.add(markerGroup);

  let pulseTime = 0;
  // --------------------------------------------------------

  // 창 크기 대응
  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // 애니메이션 루프
  function animate() {
    requestAnimationFrame(animate);
    controls.update();

    // 마커 펄스 애니메이션 (숨쉬는 듯한 글로우 효과)
    if (markerGroup.visible) {
      pulseTime += 0.05;
      const scale = 1 + Math.sin(pulseTime) * 0.2; // 0.8 ~ 1.2 사이로 크기 변화
      glowMesh.scale.set(scale, scale, scale);
    }

    renderer.render(scene, camera);
  }
  animate();

  // 6. UI 메뉴 클릭과 3D 카메라 연동 로직
  const menuItems = document.querySelectorAll(".menu-list li");
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoDiseaseList = document.getElementById("info-disease-list");
  const closeBtn = document.getElementById("close-panel");

  // 6-1. 테마 색상 정의 (배경 및 인포패널 연동)
  const themeData = {
    default: {
      bgStart: "#f8fafd",
      bgEnd: "#eaf2ff",
      panelBg: "rgba(248, 250, 253, 0.85)",
      panelBorder: "rgba(234, 242, 255, 0.8)",
      panelText: "#1b2d5a"
    },
    active: {
      bgStart: "#f5f9ff",
      bgEnd: "#cbdfff",
      panelBg: "rgba(224, 237, 255, 0.85)",
      panelBorder: "rgba(47, 95, 167, 0.25)",
      panelText: "#1b2d5a"
    }
  };

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 기존 활성화 해제 및 현재 항목 활성화
      menuItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");

      const targetId = item.getAttribute("data-target");
      const data = bodyData[targetId];
      const theme = themeData.active;

      if (data && typeof gsap !== "undefined") {
        // 정보 패널 데이터 업데이트 및 보이기
        infoTitle.textContent = data.title;

        // 질환 리스트 동적 렌더링
        infoDiseaseList.innerHTML = "";
        if (data.diseases) {
          data.diseases.forEach((disease) => {
            const li = document.createElement("li");
            const a = document.createElement("a");
            a.href = "#"; // 추후 생성될 상세 페이지 URL로 교체
            a.target = "_blank"; // 새 창으로 열림
            a.textContent = disease;
            li.appendChild(a);
            infoDiseaseList.appendChild(li);
          });
        }

        infoPanel.classList.remove("hidden");

        // GSAP를 사용해 카메라를 해당 부위로 부드럽게 이동
        // x: 2.5를 주어 3D 모델이 화면 중앙에서 약간 좌측으로 치우쳐 패널과 안 겹치게 연출
        gsap.to(camera.position, {
          x: data.camX !== undefined ? data.camX : 2.5,
          y: data.camY,
          z: data.camZ,
          duration: 1.2,
          ease: "power3.inOut",
        });
        // 카메라 시선(LookAt)을 타겟 부위로 이동
        gsap.to(controls.target, {
          x: data.targetX !== undefined ? data.targetX : 0,
          y: data.targetY,
          z: 0,
          duration: 1.2,
          ease: "power3.inOut",
        });

        // 테마 색상 애니메이션 적용 (배경 그라데이션 및 정보 패널 색상 동시 전환)
        gsap.to("#hero-3d", {
          "--bg-start": theme.bgStart,
          "--bg-end": theme.bgEnd,
          duration: 1.2,
          ease: "power3.inOut",
        });
        gsap.to(infoPanel, {
          "--panel-bg": theme.panelBg,
          "--panel-border": theme.panelBorder,
          "--panel-text": theme.panelText,
          duration: 1.2,
          ease: "power3.inOut",
        });

        // 마커 위치 지정 및 보이기
        markerGroup.position.set(
          data.targetX !== undefined ? data.targetX : 0,
          data.targetY,
          0,
        );
        markerGroup.visible = true;
      }
    });
  });

  // 닫기/뒤로가기 버튼 클릭 시 전체 화면으로 복귀
  closeBtn.addEventListener("click", () => {
    infoPanel.classList.add("hidden");
    menuItems.forEach((li) => li.classList.remove("active"));

    if (typeof gsap !== "undefined") {
      gsap.to(camera.position, {
        x: defaultCamPos.x,
        y: defaultCamPos.y,
        z: defaultCamPos.z,
        duration: 1.2,
        ease: "power3.inOut",
      });
      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.2,
        ease: "power3.inOut",
      });

      // 기본 테마 색상으로 복구 애니메이션
      gsap.to("#hero-3d", {
        "--bg-start": themeData.default.bgStart,
        "--bg-end": themeData.default.bgEnd,
        duration: 1.2,
        ease: "power3.inOut",
      });
      gsap.to(infoPanel, {
        "--panel-bg": themeData.default.panelBg,
        "--panel-border": themeData.default.panelBorder,
        "--panel-text": themeData.default.panelText,
        duration: 1.2,
        ease: "power3.inOut",
      });
    }

    markerGroup.visible = false; // 메인 화면으로 돌아오면 마커 숨기기
  });
}

/* ==========================================================================
   03. 비수술 치료 솔루션 (Non-Surgical Treatments) Slider Logic
   ========================================================================== */
function initNonSurgicalSlider() {
  const swiperContainer = document.querySelector(".treat-swiper");
  if (!swiperContainer) return;

  // Swiper 초기화 (썸네일 목록 슬라이더 - navigation 옵션 제거)
  const treatSwiper = new Swiper(".treat-swiper", {
    slidesPerView: 1.2,
    spaceBetween: 16,
    watchSlidesProgress: true,
    breakpoints: {
      480: {
        slidesPerView: 2,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2.2,
        spaceBetween: 20,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 20,
      }
    }
  });

  const detailCards = document.querySelectorAll(".treat-detail-card");
  const paginationDots = document.querySelectorAll(".treat-detail-pagination .dot");
  const slides = document.querySelectorAll(".treat-swiper .swiper-slide");
  const btnPrev = document.querySelector(".swiper-btn-prev-custom");
  const btnNext = document.querySelector(".swiper-btn-next-custom");

  let currentIdx = 0;
  const totalSlides = slides.length;

  // 활성화 상태 업데이트 함수
  function updateActiveTreatment(activeIndex) {
    currentIdx = activeIndex;

    // 1. 상세 카드 토글 (Fade-in 효과를 위해 active 클래스 제어)
    detailCards.forEach((card) => {
      const cardIndex = parseInt(card.getAttribute("data-index"), 10);
      if (cardIndex === activeIndex) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });

    // 2. 인디케이터 도트 활성화 상태 연동
    paginationDots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute("data-index"), 10);
      if (dotIndex === activeIndex) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });

    // 3. 우측 썸네일 active 클래스 적용
    slides.forEach((slide) => {
      const slideIndex = parseInt(slide.getAttribute("data-slide-index"), 10);
      if (slideIndex === activeIndex) {
        slide.classList.add("swiper-slide-thumb-active");
      } else {
        slide.classList.remove("swiper-slide-thumb-active");
      }
    });

    // 4. Custom Navigation 버튼 상태 업데이트
    if (btnPrev && btnNext) {
      if (currentIdx === 0) {
        btnPrev.classList.add("swiper-button-disabled");
        btnPrev.setAttribute("disabled", "true");
      } else {
        btnPrev.classList.remove("swiper-button-disabled");
        btnPrev.removeAttribute("disabled");
      }

      if (currentIdx === totalSlides - 1) {
        btnNext.classList.add("swiper-button-disabled");
        btnNext.setAttribute("disabled", "true");
      } else {
        btnNext.classList.remove("swiper-button-disabled");
        btnNext.removeAttribute("disabled");
      }
    }
  }

  // 슬라이드 클릭 시 해당 아이템 활성화 및 Swiper 이동
  slides.forEach((slide) => {
    slide.addEventListener("click", () => {
      const index = parseInt(slide.getAttribute("data-slide-index"), 10);
      treatSwiper.slideTo(index);
      updateActiveTreatment(index);
    });
  });

  // 페이지네이션 도트 클릭 시 이동
  paginationDots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const index = parseInt(dot.getAttribute("data-index"), 10);
      treatSwiper.slideTo(index);
      updateActiveTreatment(index);
    });
  });

  // Custom 버튼 클릭 이벤트 등록
  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentIdx > 0) {
        const targetIdx = currentIdx - 1;
        treatSwiper.slideTo(targetIdx);
        updateActiveTreatment(targetIdx);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (currentIdx < totalSlides - 1) {
        const targetIdx = currentIdx + 1;
        treatSwiper.slideTo(targetIdx);
        updateActiveTreatment(targetIdx);
      }
    });
  }

  // Swiper 슬라이드 전환 시 동기화 (터치 스와이프 대응)
  treatSwiper.on("slideChange", () => {
    const swiperActiveIdx = treatSwiper.activeIndex;
    if (currentIdx !== swiperActiveIdx) {
      updateActiveTreatment(swiperActiveIdx);
    }
  });

  // 초기 로드 시 0번 아이템 활성화 상태 주입
  updateActiveTreatment(0);
}

/* ==========================================================================
   04. 인트로 도어 열림 애니메이션 (Intro Split Door) Logic
   ========================================================================== */
function initIntroDoor() {
  const introDoor = document.getElementById("intro-door");
  if (!introDoor) return;

  const enterBtn = document.getElementById("enter-clinic-btn");
  const doorLeft = introDoor.querySelector(".door-left");
  const doorRight = introDoor.querySelector(".door-right");
  const introContent = introDoor.querySelector(".intro-content");

  // 스크롤 및 바디 조작 제한을 위한 클래스 추가
  document.body.classList.add("door-locked");

  // 메인 콘텐츠 요소 초기 상태 설정 (깜빡임 현상 방지)
  if (typeof gsap !== "undefined") {
    gsap.set(".topbar", { opacity: 0, y: -80 });
    gsap.set(".hero-welcome-message", { opacity: 0, y: -30 });
    gsap.set(".menu-list", { opacity: 0, x: -50 });
    gsap.set(".tv_wrap", { opacity: 0, y: 50 });
  }

  let hasOpened = false;

  function openDoors() {
    if (hasOpened) return;
    hasOpened = true;

    // 이벤트 리스너 제거
    window.removeEventListener("wheel", handleScrollTrigger);
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchTrigger);
    window.removeEventListener("keydown", handleKeydownTrigger);

    if (typeof gsap !== "undefined") {
      const tl = gsap.timeline({
        onComplete: () => {
          introDoor.style.display = "none";
          document.body.classList.remove("door-locked");
          
          // Three.js 캔버스 렌더링 영역 강제 리사이즈로 화면 맞춤
          window.dispatchEvent(new Event("resize"));
        }
      });

      // 1. 중앙 웰컴 박스 카드 페이드아웃
      tl.to(introContent, {
        opacity: 0,
        y: -40,
        duration: 0.6,
        ease: "power2.in"
      });

      // 2. 좌우 문 슬라이드 아웃
      tl.to(doorLeft, {
        xPercent: -100,
        duration: 1.5,
        ease: "power3.inOut"
      }, "-=0.2");

      tl.to(doorRight, {
        xPercent: 100,
        duration: 1.5,
        ease: "power3.inOut"
      }, "-=1.5");

      // 3. 헤더 네비바 등장
      tl.to(".topbar", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }, "-=0.9");

      // 4. 메인 Welcome 텍스트 및 인체 맵 UI 등장
      tl.to(".hero-welcome-message", {
        opacity: 1,
        y: 0,
        duration: 1.0,
        ease: "power3.out"
      }, "-=0.7");

      tl.to([".menu-list", ".tv_wrap"], {
        opacity: 1,
        x: 0,
        y: 0,
        duration: 1.0,
        stagger: 0.15,
        ease: "power3.out"
      }, "-=0.8");

    } else {
      // GSAP 비활성화 시 Fallback (기본 브라우저 css 전환)
      doorLeft.style.transform = "translateX(-100%)";
      doorRight.style.transform = "translateX(100%)";
      introContent.style.opacity = "0";
      setTimeout(() => {
        introDoor.style.display = "none";
        document.body.classList.remove("door-locked");
        
        const topbar = document.querySelector(".topbar");
        if (topbar) {
          topbar.style.opacity = "1";
          topbar.style.transform = "none";
        }
        
        const welcome = document.querySelector(".hero-welcome-message");
        if (welcome) {
          welcome.style.opacity = "1";
          welcome.style.transform = "none";
        }
      }, 1500);
    }
  }

  // 스크롤 휠 감지 (아래 방향 스크롤)
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
    // 위로 스와이프 (아래로 스크롤하려는 행동) 감지 시 문 열림
    if (touchStartY - touchEndY > 30) {
      openDoors();
    }
  }

  // 키보드 키 감지
  function handleKeydownTrigger(e) {
    const triggerKeys = ["ArrowDown", "PageDown", " ", "Enter"];
    if (triggerKeys.includes(e.key)) {
      openDoors();
    }
  }

  // 이벤트 핸들러 바인딩
  if (enterBtn) {
    enterBtn.addEventListener("click", openDoors);
  }
  
  window.addEventListener("wheel", handleScrollTrigger, { passive: true });
  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchTrigger, { passive: true });
  window.addEventListener("keydown", handleKeydownTrigger);
}
