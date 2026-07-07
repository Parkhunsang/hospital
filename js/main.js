// 기존에 main.js 내용이 있다면 아래 코드를 파일 하단에 추가해 주세요.

document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  init3DBodyMap();
  initNonSurgicalSlider();
  initBrandTrustSlider();
});

function init3DBodyMap() {
  const container = document.getElementById("canvas-container");
  if (!container) return;

  // 0. 메뉴 리스트 텍스트를 span으로 감싸기 (배경 확장 애니메이션을 위해 글자 레이어 분리)
  document.querySelectorAll(".hero-3d__pain-item").forEach((li) => {
    const text = li.textContent;
    li.innerHTML = `<span>${text}</span>`;
  });

  // 1. 신체 부위별 데이터 (타겟(LookAt) 위치, 카메라(Zoom-in) 위치 설정, 및 일러스트 연동)
  const bodyData = {
    neck: {
      title: "목",
      diseases: ["목디스크", "거북목 증후군"],
      targetX: 0,
      targetY: 1.3,
      camY: -3.5,
      camZ: -2.5,
      image: "",
    },
    shoulder: {
      title: "어깨",
      diseases: ["오십견", "회전근개파열", "석회성 건염", "견관절재발성 탈구"],
      targetY: 1.1,
      targetX: 0.4,
      camY: 1.4,
      camZ: 4.0,
      image: "./assets/shoulder_joint_illustration.png",
      normal: [0, 0, 1],
      width: 0.8,
      height: 0.8,
      maskScale: [1.0, 1.0],
      zOffset: 0.05,
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
      targetX: -0.1,
      targetY: 0,
      camY: -3.5,
      camZ: -5.5,
      image: "./assets/vertebrae_illustration.png",
      normal: [0, 0, -1],
      width: 0.65,
      height: 1.2,
      maskScale: [1.2, 0.7],
      zOffset: -0.05,
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
      targetY: 0,
      camX: 5.0, // 타겟이 우측으로 이동한 만큼 카메라도 우측으로 이동
      camY: 0.5,
      camZ: 3.5,
      image: "",
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
      targetY: -1.1,
      targetX: 0.3,
      camY: 0,
      camZ: 2.0,
      image: "./assets/knee_joint_illustration.png",
      normal: [0, 0, 1],
      width: 0.75,
      height: 0.75,
      maskScale: [1.0, 1.0],
      zOffset: 0.05,
    },
    foot: {
      title: "발/ 발목",
      diseases: [
        "발목염좌/만성 불안정성",
        "무지외반증",
        "발목 관절염",
        "족저근막염 등 다양한 족부질환",
      ],
      targetY: -2.1,
      targetX: 0.4,
      camY: -3.8,
      camZ: -1.5,
      image: "",
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
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  // 3. 조명 (빛) 세팅
  // 환경광(AmbientLight)을 부드럽게 설정하여 유리 내부 투명성 확보
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  // 주 방향광 (정측면)
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Rim Light (역광) - 밝은 배경 위에서 파란색 크리스탈 외곽선의 굴절/반사를 살리는 용도
  const rimLightLeft = new THREE.DirectionalLight(0x2f5fa7, 4.0);
  rimLightLeft.position.set(-6, 3, -10);
  scene.add(rimLightLeft);

  const rimLightRight = new THREE.DirectionalLight(0x2f5fa7, 4.0);
  rimLightRight.position.set(6, 3, -10);
  scene.add(rimLightRight);

  // 4. 실제 OBJ 인체 모델 로드
  const loader = new THREE.OBJLoader();
  loader.load(
    "./assets/human_body.obj",
    function (object) {
      const model = object;

      // 반투명 화이트/그레이 서리 유리(translucent frosted glass) 질감의 Physical Material 적용 (투명도를 약간 낮춰 두께감 표현)
      const material = new THREE.MeshPhysicalMaterial({
        color: 0xf3f6fb, // 반투명 화이트/그레이톤
        transmission: 0.35, // 껍데기가 겹쳐 보여 유령처럼 흐려지는 현상을 막기 위해 투명도 하향
        opacity: 1.0,
        transparent: true,
        roughness: 0.25, // frosted 유리의 뽀얀 무광 질감
        ior: 1.45, // 유리의 실제 굴절률
        clearcoat: 0.3, // 매끄러운 표면 반사광 하이라이트 생성
        clearcoatRoughness: 0.1,
      });
      material.thickness = 1.2; // 유리의 입체감을 살리는 두께감
      material.attenuationColor = new THREE.Color(0xffffff);
      material.attenuationDistance = 0.8;
      material.emissive = new THREE.Color(0x000000);

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
      model.position.set(0, -2.3, 0);

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
  // [커스텀 셰이더 정의]
  const jointVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const jointFragmentShader = `
    uniform sampler2D tDiffuse;
    uniform float uOpacity;
    uniform float uAngleOpacity;
    uniform vec2 uMaskScale;
    varying vec2 vUv;
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      
      // 중심 (0.5, 0.5)으로부터의 거리 계산
      vec2 centerDist = vUv - vec2(0.5);
      centerDist *= uMaskScale;
      float dist = length(centerDist);
      
      // 원형 그라데이션 마스크 적용 (중심부는 1.0, 가장자리로 갈수록 0.0)
      float mask = smoothstep(0.5, 0.15, dist);
      
      gl_FragColor = vec4(texColor.rgb, texColor.a * mask * uOpacity * uAngleOpacity);
    }
  `;

  const glowVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const glowFragmentShader = `
    uniform vec3 uGlowColor;
    uniform float uOpacity;
    uniform float uAngleOpacity;
    varying vec2 vUv;
    
    void main() {
      float dist = length(vUv - vec2(0.5));
      // 부드러운 원형 글로우
      float intensity = smoothstep(0.5, 0.0, dist);
      intensity = pow(intensity, 2.0); // 중앙 집중 발광 효과
      
      gl_FragColor = vec4(uGlowColor, intensity * uOpacity * uAngleOpacity);
    }
  `;

  // [홀로그램 텍스처 로딩]
  const textureLoader = new THREE.TextureLoader();
  const illustrationTextures = {
    shoulder: textureLoader.load("./assets/shoulder_joint_illustration.png"),
    waist: textureLoader.load("./assets/vertebrae_illustration.png"),
    knee: textureLoader.load("./assets/knee_joint_illustration.png"),
  };

  // [마커] 통증 부위 표시용 빛나는 포인터 및 3D 홀로그램 평면/글로우 생성
  const markerGroup = new THREE.Group();

  // 1) 기본 구체 마커 (고광택 딥 로열 블루) - 일러스트 준비 중인 부위에 표시
  const markerGeo = new THREE.SphereGeometry(0.06, 32, 32);
  const markerMat = new THREE.MeshStandardMaterial({
    color: 0x2f5fa7,
    roughness: 0.05,
    metalness: 0.9,
    depthTest: false,
  });
  const markerMesh = new THREE.Mesh(markerGeo, markerMat);
  markerMesh.renderOrder = 999;
  markerGroup.add(markerMesh);

  const glowGeo = new THREE.SphereGeometry(0.12, 32, 32);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x2f5fa7,
    transparent: true,
    opacity: 0.45,
    depthTest: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.renderOrder = 998;
  markerGroup.add(glowMesh);

  // 2) 3D 평면 융화 재질 & 메시 (스프라이트 대체)
  const jointPlaneGeo = new THREE.PlaneGeometry(1, 1);
  const jointMat = new THREE.ShaderMaterial({
    vertexShader: jointVertexShader,
    fragmentShader: jointFragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      uOpacity: { value: 0.0 },
      uAngleOpacity: { value: 1.0 },
      uMaskScale: { value: new THREE.Vector2(1.0, 1.0) },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const jointPlane = new THREE.Mesh(jointPlaneGeo, jointMat);
  jointPlane.renderOrder = -1; // 반투명 유리 모델보다 먼저 렌더링하여 서리유리 굴절/블러 효과 유도
  jointPlane.visible = false;
  markerGroup.add(jointPlane);

  // 3) 3D 포커스 글로우 평면 메시
  const glowPlaneGeo = new THREE.PlaneGeometry(1, 1);
  const glowPlaneMat = new THREE.ShaderMaterial({
    vertexShader: glowVertexShader,
    fragmentShader: glowFragmentShader,
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x3a86ff) },
      uOpacity: { value: 0.0 },
      uAngleOpacity: { value: 1.0 },
    },
    transparent: true,
    depthTest: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowPlaneGeo, glowPlaneMat);
  glowPlane.renderOrder = -2; // 일러스트 배후 렌더링
  glowPlane.visible = false;
  markerGroup.add(glowPlane);

  markerGroup.visible = false; // 초기에는 마커를 숨김
  scene.add(markerGroup);

  let pulseTime = 0;
  let activeNormal = null;
  let activeWidth = 1.0;
  let activeHeight = 1.0;
  let glowBaseOpacity = 0.0;
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

    if (markerGroup.visible) {
      pulseTime += 0.05;

      // 1) 구체 마커용 펄스 (일러스트 비활성화된 부위용)
      if (glowMesh.visible) {
        const scale = 1 + Math.sin(pulseTime) * 0.2;
        glowMesh.scale.set(scale, scale, scale);
      }

      // 2) 3D 평면 일러스트 및 글로우용 펄스 애니메이션
      if (jointPlane.visible) {
        // 카메라 시선 각도와 법선 벡터 간의 내적 계산
        if (activeNormal) {
          const toCamera = new THREE.Vector3();
          toCamera.copy(camera.position).sub(markerGroup.position).normalize();

          const dot = toCamera.dot(activeNormal);
          // dot이 0.5 이상이면 1.0, 0.1 이하면 0.0으로 부드럽게 보간
          const angleOpacity = THREE.MathUtils.clamp(
            (dot - 0.1) / 0.4,
            0.0,
            1.0,
          );

          jointMat.uniforms.uAngleOpacity.value = angleOpacity;
          glowPlaneMat.uniforms.uAngleOpacity.value = angleOpacity;
        }

        // 글로우의 맥동 효과 (크기와 투명도가 호흡하듯 변화)
        if (glowPlane.visible) {
          const scalePulse = 1.0 + Math.sin(pulseTime * 2.0) * 0.08; // 0.92 ~ 1.08
          glowPlane.scale.set(
            activeWidth * 1.6 * scalePulse,
            activeHeight * 1.6 * scalePulse,
            1.0,
          );

          const opacityPulse = 0.4 + Math.sin(pulseTime * 2.0) * 0.15; // 0.25 ~ 0.55
          glowPlaneMat.uniforms.uOpacity.value = opacityPulse * glowBaseOpacity;
        }
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  // 6. UI 메뉴 클릭과 3D 카메라 연동 로직
  const menuItems = document.querySelectorAll(".hero-3d__pain-item");
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoDiseaseList = document.getElementById("info-disease-list");
  const closeBtn = document.getElementById("close-panel");
  const welcomeMessage = document.querySelector(".hero-3d__welcome");
  const infoVisualImg = document.getElementById("info-visual-img");
  const infoVisualPlaceholder = document.getElementById(
    "info-visual-placeholder",
  );

  // 6-1. 테마 색상 정의 (배경 및 인포패널 연동)
  const themeData = {
    default: {
      bgStart: "#f8fafd",
      bgEnd: "#eaf2ff",
      panelBg: "rgba(248, 250, 253, 0.25)",
      panelBorder: "rgba(234, 242, 255, 0.8)",
      panelText: "#1b2d5a",
    },
    active: {
      bgStart: "#f5f9ff",
      bgEnd: "#cbdfff",
      panelBg: "rgba(224, 237, 255, 0.25)",
      panelBorder: "rgba(47, 95, 167, 0.25)",
      panelText: "#1b2d5a",
    },
  };

  menuItems.forEach((item) => {
    item.addEventListener("click", () => {
      // 기존 활성화 해제 및 현재 항목 활성화
      menuItems.forEach((li) =>
        li.classList.remove("hero-3d__pain-item--active"),
      );
      item.classList.add("hero-3d__pain-item--active");

      const targetId = item.getAttribute("data-target");
      const data = bodyData[targetId];
      const theme = themeData.active;

      if (data && typeof gsap !== "undefined") {
        // 정보 패널 데이터 업데이트 및 보이기
        infoTitle.textContent = data.title;

        // 웰컴 메시지 위로 올리며 페이드 아웃
        if (welcomeMessage) {
          gsap.to(welcomeMessage, {
            y: -80,
            opacity: 0,
            duration: 0.6,
            ease: "power2.inOut",
            pointerEvents: "none",
          });
        }

        // 이미지 및 플레이스홀더 연동 및 애니메이션
        if (infoVisualImg && infoVisualPlaceholder) {
          if (data.image) {
            infoVisualImg.src = data.image;
            infoVisualImg.classList.remove("hidden");
            infoVisualPlaceholder.classList.add("hidden");
            gsap.fromTo(
              infoVisualImg,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
            );
          } else {
            infoVisualImg.classList.add("hidden");
            infoVisualPlaceholder.classList.remove("hidden");
            gsap.fromTo(
              infoVisualPlaceholder,
              { opacity: 0, scale: 0.95 },
              { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" },
            );
          }
        }

        // 질환 리스트 동적 렌더링
        infoDiseaseList.innerHTML = "";
        if (data.diseases) {
          data.diseases.forEach((disease) => {
            const li = document.createElement("li");
            li.classList.add("hero-3d__disease-item");
            const a = document.createElement("a");
            a.classList.add("hero-3d__disease-link");
            a.href = "#"; // 추후 생성될 상세 페이지 URL로 교체
            a.target = "_blank"; // 새 창으로 열림
            a.textContent = disease;
            li.appendChild(a);
            infoDiseaseList.appendChild(li);
          });
        }

        infoPanel.classList.remove("hero-3d__info-panel--hidden");

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
        gsap.to(".hero-3d", {
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
        // 마커 위치 지정 및 보이기
        markerGroup.position.set(
          data.targetX !== undefined ? data.targetX : 0,
          data.targetY,
          0,
        );

        // 부위별 3D 평면 융화 일러스트 렌더링 또는 기본 구체 마커 스위칭
        if (data.image && illustrationTextures[targetId]) {
          markerMesh.visible = false;
          glowMesh.visible = false;

          // 데이터 기반 파라미터 적용
          activeWidth = data.width || 0.8;
          activeHeight = data.height || 0.8;
          const zOff = data.zOffset || 0.05;
          const maskS = data.maskScale || [1.0, 1.0];

          // 텍스처 및 균일 변수(Uniform) 업데이트
          jointMat.uniforms.tDiffuse.value = illustrationTextures[targetId];
          jointMat.uniforms.uMaskScale.value.set(maskS[0], maskS[1]);

          // 평면 메시 방향 및 오프셋 적용
          const normalVec = new THREE.Vector3(
            data.normal[0],
            data.normal[1],
            data.normal[2],
          );
          const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, 1),
            normalVec,
          );

          jointPlane.quaternion.copy(quaternion);
          glowPlane.quaternion.copy(quaternion);

          jointPlane.position.set(0, 0, zOff);
          glowPlane.position.set(0, 0, zOff - 0.02); // 글로우는 일러스트보다 살짝 안쪽(뒤쪽)에 배치

          jointPlane.scale.set(activeWidth, activeHeight, 1.0);
          glowPlane.scale.set(activeWidth * 1.6, activeHeight * 1.6, 1.0);

          activeNormal = normalVec;

          jointPlane.visible = true;
          glowPlane.visible = true;

          // GSAP를 통한 페이드인 효과
          gsap.killTweensOf([
            jointMat.uniforms.uOpacity,
            glowPlaneMat.uniforms.uOpacity,
          ]);

          gsap.fromTo(
            jointMat.uniforms.uOpacity,
            { value: 0 },
            { value: 1.0, duration: 0.6, ease: "power2.out" },
          );

          glowBaseOpacity = 1.0;
          gsap.fromTo(
            glowPlaneMat.uniforms.uOpacity,
            { value: 0 },
            { value: 0.5, duration: 0.6, ease: "power2.out" },
          );
        } else {
          markerMesh.visible = true;
          glowMesh.visible = true;
          jointPlane.visible = false;
          glowPlane.visible = false;
          activeNormal = null;
        }

        markerGroup.visible = true;
      }
    });
  });

  // 닫기/뒤로가기 버튼 클릭 시 전체 화면으로 복귀
  closeBtn.addEventListener("click", () => {
    infoPanel.classList.add("hero-3d__info-panel--hidden");
    menuItems.forEach((li) =>
      li.classList.remove("hero-3d__pain-item--active"),
    );

    if (typeof gsap !== "undefined") {
      // 웰컴 메시지 위에서 아래로 복귀하며 페이드 인
      if (welcomeMessage) {
        gsap.fromTo(
          welcomeMessage,
          { y: -80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            pointerEvents: "auto",
          },
        );
      }

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
      gsap.to(".hero-3d", {
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

      // 스프라이트 마커 페이드아웃 후 숨기기
      // 3D 융화 마커 페이드아웃 후 숨기기
      if (jointPlane.visible) {
        gsap.killTweensOf([
          jointMat.uniforms.uOpacity,
          glowPlaneMat.uniforms.uOpacity,
        ]);

        gsap.to(jointMat.uniforms.uOpacity, {
          value: 0,
          duration: 0.5,
          ease: "power2.inOut",
        });

        glowBaseOpacity = 0.0;
        gsap.to(glowPlaneMat.uniforms.uOpacity, {
          value: 0,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: () => {
            jointPlane.visible = false;
            glowPlane.visible = false;
            markerGroup.visible = false;
            activeNormal = null;
          },
        });
      } else {
        markerGroup.visible = false;
        activeNormal = null;
      }
    } else {
      markerGroup.visible = false;
    }
  });
}

/* ==========================================================================
   03. 비수술 치료 솔루션 (Non-Surgical Treatments) Slider Logic
   ========================================================================== */
function initNonSurgicalSlider() {
  const swiperContainer = document.querySelector(".non-surgical__swiper");
  if (!swiperContainer) return;

  // Swiper 초기화 (썸네일 목록 슬라이더 - navigation 옵션 제거)
  const treatSwiper = new Swiper(".non-surgical__swiper", {
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
      },
    },
  });

  const detailCards = document.querySelectorAll(".non-surgical__detail-card");
  const paginationDots = document.querySelectorAll(
    ".non-surgical__pagination .non-surgical__dot",
  );
  const slides = document.querySelectorAll(
    ".non-surgical__swiper .swiper-slide",
  );
  const btnPrev = document.querySelector(".non-surgical__swiper-btn--prev");
  const btnNext = document.querySelector(".non-surgical__swiper-btn--next");

  let currentIdx = 0;
  const totalSlides = slides.length;

  // 활성화 상태 업데이트 함수
  function updateActiveTreatment(activeIndex) {
    currentIdx = activeIndex;

    // 1. 상세 카드 토글 (Fade-in 효과를 위해 active 클래스 제어)
    detailCards.forEach((card) => {
      const cardIndex = parseInt(card.getAttribute("data-index"), 10);
      if (cardIndex === activeIndex) {
        card.classList.add("non-surgical__detail-card--active");
      } else {
        card.classList.remove("non-surgical__detail-card--active");
      }
    });

    // 2. 인디케이터 도트 활성화 상태 연동
    paginationDots.forEach((dot) => {
      const dotIndex = parseInt(dot.getAttribute("data-index"), 10);
      if (dotIndex === activeIndex) {
        dot.classList.add("non-surgical__dot--active");
      } else {
        dot.classList.remove("non-surgical__dot--active");
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
  const introDoor = document.querySelector(".intro-door");
  if (!introDoor) return;

  const enterBtn = document.getElementById("enter-clinic-btn");
  const doorLeft = introDoor.querySelector(".intro-door__panel--left");
  const doorRight = introDoor.querySelector(".intro-door__panel--right");
  const introContent = introDoor.querySelector(".intro-door__content");

  // 스크롤 및 바디 조작 제한을 위한 클래스 추가
  document.body.classList.add("door-locked");

  // 메인 콘텐츠 요소 초기 상태 설정 (깜빡임 현상 방지)
  if (typeof gsap !== "undefined") {
    gsap.set(".topbar", { opacity: 0, y: -80 });
    gsap.set(".hero-welcome-message", { opacity: 0, y: -30 });
    gsap.set(".hero-3d__menu", { opacity: 0, x: -50 });
    gsap.set(".hero-3d__tv-wrap", { opacity: 0, y: 50 });
    gsap.set(".hero-3d__welcome", { opacity: 0, y: -50 });
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
        },
      });

      // 1. 중앙 웰컴 박스 카드 페이드아웃
      tl.to(introContent, {
        opacity: 0,
        y: -40,
        duration: 0.6,
        ease: "power2.in",
      });

      // 2. 좌우 문 슬라이드 아웃
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

      // 3. 헤더 네비바 등장
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

      // 4. 메인 Welcome 텍스트 및 인체 맵 UI 등장
      tl.to(
        ".hero-welcome-message",
        {
          opacity: 1,
          y: 0,
          duration: 1.0,
          ease: "power3.out",
        },
        "-=0.7",
      );

      tl.to(
        [".hero-3d__menu", ".hero-3d__tv-wrap", ".hero-3d__welcome"],
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 1.0,
          stagger: 0.15,
          ease: "power3.out",
        },
        "-=0.8",
      );
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

/* ==========================================================================
   Brand Trust Slider (Branding & Stats Swiper) Logic
   ========================================================================== */
function initBrandTrustSlider() {
  const swiperContainer = document.querySelector(".brand-trust__swiper");
  if (!swiperContainer) return;

  // Swiper 초기화
  const brandSwiper = new Swiper(".brand-trust__swiper", {
    loop: true,
    speed: 800,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
  });

  const btnPrev = document.querySelector(".brand-trust__btn--prev");
  const btnNext = document.querySelector(".brand-trust__btn--next");
  const btnPlayPause = document.querySelector(".brand-trust__btn--play-pause");
  const currIndexEl = document.querySelector(".brand-trust__current-index");
  const progressBarFillEl = document.querySelector(
    ".brand-trust__progress-fill",
  );
  const iconPause = document.querySelector(".brand-trust__icon-pause");
  const iconPlay = document.querySelector(".brand-trust__icon-play");

  const totalSlides = 3;

  function updateSliderControls(realIndex) {
    if (currIndexEl) {
      currIndexEl.textContent = String(realIndex + 1).padStart(2, "0");
    }

    if (progressBarFillEl) {
      const fillPercentage = ((realIndex + 1) / totalSlides) * 100;
      progressBarFillEl.style.width = `${fillPercentage}%`;
    }

    if (realIndex === 2) {
      swiperContainer.classList.add("brand-trust__swiper--dark-theme");
    } else {
      swiperContainer.classList.remove("brand-trust__swiper--dark-theme");
    }
  }

  brandSwiper.on("slideChange", () => {
    updateSliderControls(brandSwiper.realIndex);
  });

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      brandSwiper.slidePrev();
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      brandSwiper.slideNext();
    });
  }

  let isPlaying = true;
  if (btnPlayPause) {
    btnPlayPause.addEventListener("click", () => {
      if (isPlaying) {
        brandSwiper.autoplay.stop();
        isPlaying = false;

        if (iconPause) iconPause.classList.add("hidden");
        if (iconPlay) iconPlay.classList.remove("hidden");
        btnPlayPause.setAttribute("aria-label", "자동 재생 시작");
      } else {
        brandSwiper.autoplay.start();
        isPlaying = true;

        if (iconPause) iconPause.classList.remove("hidden");
        if (iconPlay) iconPlay.classList.add("hidden");
        btnPlayPause.setAttribute("aria-label", "자동 재생 정지");
      }
    });
  }

  updateSliderControls(0);
}
