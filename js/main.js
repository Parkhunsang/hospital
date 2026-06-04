// 기존에 main.js 내용이 있다면 아래 코드를 파일 하단에 추가해 주세요.

document.addEventListener("DOMContentLoaded", () => {
  init3DBodyMap();
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

  // // 바닥 그림자판
  // const plane = new THREE.Mesh(
  //   new THREE.PlaneGeometry(30, 30),
  //   new THREE.ShadowMaterial({ opacity: 0.15 }), // 투명하게 만들고 그림자만 남김
  // );
  // plane.rotation.x = -Math.PI / 2;
  // plane.position.y = -2.5;
  // plane.receiveShadow = true;
  // scene.add(plane);

  // // [디버깅] 각 부위별 위치를 시각적으로 확인하기 위한 헬퍼 추가
  // Object.keys(bodyData).forEach((key) => {
  //   const data = bodyData[key];

  //   const targetX = data.targetX !== undefined ? data.targetX : 0; // targetX가 없으면 기본값 0
  //   const camX = data.camX !== undefined ? data.camX : 2.5; // camX가 없으면 기본값 2.5

  //   // 타겟(바라보는 곳) 위치 표시 (빨간 점)
  //   const targetGeo = new THREE.SphereGeometry(0.08, 16, 16);
  //   const targetMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  //   const targetMesh = new THREE.Mesh(targetGeo, targetMat);
  //   targetMesh.position.set(targetX, data.targetY, 0);
  //   scene.add(targetMesh);

  //   // 카메라(Zoom-in) 위치 표시 (파란 점)
  //   const camGeo = new THREE.SphereGeometry(0.08, 16, 16);
  //   const camMat = new THREE.MeshBasicMaterial({ color: 0x00aaff });
  //   const camMesh = new THREE.Mesh(camGeo, camMat);
  //   camMesh.position.set(camX, data.camY, data.camZ);
  //   scene.add(camMesh);

  //   // 타겟과 카메라를 잇는 시선 방향 표시 (초록색 선)
  //   const lineMat = new THREE.LineBasicMaterial({
  //     color: 0x00ff00,
  //     transparent: true,
  //     opacity: 0.5,
  //   });
  //   const points = [];
  //   points.push(new THREE.Vector3(targetX, data.targetY, 0));
  //   points.push(new THREE.Vector3(camX, data.camY, data.camZ));
  //   const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  //   const line = new THREE.Line(lineGeo, lineMat);
  //   scene.add(line);
  // });

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
    neck: {
      bgStart: "#f5f9ff",
      bgEnd: "#cbdfff",
      panelBg: "rgba(224, 237, 255, 0.85)",
      panelBorder: "rgba(47, 95, 167, 0.25)",
      panelText: "#1b2d5a"
    },
    shoulder: {
      bgStart: "#f2faf9",
      bgEnd: "#c0e6e2",
      panelBg: "rgba(215, 242, 239, 0.85)",
      panelBorder: "rgba(36, 150, 137, 0.25)",
      panelText: "#124741"
    },
    waist: {
      bgStart: "#f4f7fa",
      bgEnd: "#bacfdf",
      panelBg: "rgba(220, 235, 248, 0.85)",
      panelBorder: "rgba(47, 95, 167, 0.25)",
      panelText: "#1b2d5a"
    },
    wrist: {
      bgStart: "#faf7fd",
      bgEnd: "#dccef2",
      panelBg: "rgba(238, 226, 252, 0.85)",
      panelBorder: "rgba(110, 68, 168, 0.25)",
      panelText: "#3d1a63"
    },
    knee: {
      bgStart: "#fbfaf6",
      bgEnd: "#e6dfcd",
      panelBg: "rgba(247, 243, 230, 0.85)",
      panelBorder: "rgba(168, 142, 68, 0.25)",
      panelText: "#4a3b12"
    },
    foot: {
      bgStart: "#f5f6f7",
      bgEnd: "#c5ccd1",
      panelBg: "rgba(225, 230, 235, 0.85)",
      panelBorder: "rgba(74, 85, 96, 0.25)",
      panelText: "#243041"
    }
  };

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 기존 활성화 해제 및 현재 항목 활성화
      menuItems.forEach((li) => li.classList.remove("active"));
      item.classList.add("active");

      const targetId = item.getAttribute("data-target");
      const data = bodyData[targetId];
      const theme = themeData[targetId] || themeData.default;

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
