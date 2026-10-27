function init3DBodyMap() {
  const container = document.getElementById("canvas-container");
  if (!container || typeof gsap === "undefined") return;

  // =========================================================================
  // [단락 1] 신체 부위별 데이터 정의 (카메라 시점, 질환 목록, 홀로그램 설정)
  // =========================================================================
  // - targetX / targetY: 카메라가 바라보는 3D 포커스 중심 좌표
  // - camX / camY / camZ: 카메라 렌즈 본체의 3D 위치 및 거리(줌) 수치
  // - mobile: 640px 이하 모바일 전용 카메라 줌아웃 및 시선 오프셋 (생략 시 기본값 사용)
  // - normal: 홀로그램 평면이 바라보는 방향 벡터 ([0,0,1]: 정면, [0,0,-1]: 후면, [-1,0,0]: 측면)
  // - width: 홀로그램 가로 크기 (세로 크기는 원본 이미지 비율에 맞춰 자동 계산)
  // - imageOffsetX / Y / Z, zOffset: 홀로그램 미세 위치 및 깊이 오프셋 (기본값: 0, zOffset: 0.05)
  // - maskScale: 가장자리 투명 마스크 범위 (기본값: [1.0, 1.0])
  const bodyData = {
    neck: {
      title: "목",
      diseases: ["목디스크", "거북목 증후군"],
      targetX: 0,
      targetY: 1.2,
      camX: 0,
      camY: 1.2,
      camZ: -2.5,
      image: "./assets/neck.png",
      normal: [0, 0, -1],
      width: 0.2,
      imageOffsetY: 0.1,
      zOffset: -0.2,
    },

    shoulder: {
      title: "어깨",
      diseases: ["오십견", "회전근개파열", "석회성 건염", "견관절재발성 탈구"],
      targetX: -0.42,
      targetY: 1.06,
      camX: -0.42,
      camY: 1.06,
      camZ: 2.0,
      mobile: {
        targetX: -0.42,
        targetY: 0.8,
        camX: -0.42,
        camY: 1.25,
        camZ: 3.2,
      },
      image: "./assets/shoulder.png",
      normal: [0, 0, 1],
      width: 0.48,
      imageOffsetX: 0.075,
      imageOffsetY: -0.15,
    },

    waist: {
      title: "허리",
      diseases: [
        "허리디스크",
        "척추협착증",
        "척추 전방 전위증",
        "척추 골절",
        "골다공증성 압박골절",
      ],
      targetX: -0.02,
      targetY: 0,
      camX: -0.02,
      camY: 0,
      camZ: -3.8,
      mobile: {
        targetX: -0.02,
        targetY: -0.2,
        camX: -0.02,
        camY: 0.25,
        camZ: -4.8,
      },
      image: "./assets/waist.png",
      normal: [0, 0, -1],
      width: 0.7,
      imageOffsetY: -0.02,
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
      targetX: -1.1,
      targetY: -0.2,
      camX: -2.8,
      camY: -0.2,
      camZ: 0.0,
      mobile: {
        targetX: -0.8,
        targetY: -0.4,
        camX: -3.6,
        camY: -0.1,
        camZ: 0.0,
      },
      image: "./assets/wrist.png",
      normal: [-1, 0, 0],
      width: 0.36,
      imageOffsetY: 0.05,
      imageOffsetZ: -0.1,
      zOffset: 0.08,
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
      targetX: 0.3,
      targetY: -1.1,
      camX: 0.3,
      camY: -1.1,
      camZ: 2.0,
      mobile: {
        targetX: 0.3,
        targetY: -1.2,
        camX: 0.3,
        camY: -0.85,
        camZ: 3.2,
      },
      image: "./assets/knee.png",
      normal: [0, 0, 1],
      width: 0.3,
      imageOffsetX: 0.03,
    },

    foot: {
      title: "발/ 발목",
      diseases: ["발목염좌", "무지외반증", "발목 관절염", "족저근막염"],
      targetX: 0.2,
      targetY: -2.1,
      camX: -2.2,
      camY: -2.1,
      camZ: 0.0,
      mobile: {
        targetX: 0.2,
        targetY: -2.4,
        camX: -3.4,
        camY: -1.8,
        camZ: 0.0,
      },
      image: "./assets/foot.png",
      normal: [-1, 0, 0],
      width: 0.8,
      imageOffsetX: -0.5,
      imageOffsetY: -0.06,
      imageOffsetZ: 0.04,
      zOffset: 0.1,
      maskScale: [0.8, 0.8],
    },
  };

  // =========================================================================
  // [단락 2] 3D 무대(Scene, Camera, Renderer, Light) 및 인체 모델 세팅
  // =========================================================================
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xc4d7eb, 10, 30);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  );
  const defaultCamPos = { x: 0, y: 0, z: 9 };
  const lookAtTarget = new THREE.Vector3(0, 0, 0);
  camera.position.set(defaultCamPos.x, defaultCamPos.y, defaultCamPos.z);
  camera.lookAt(lookAtTarget);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);

  const renderScene = () => renderer.render(scene, camera);

  // 조명 (은은한 환경광 + 정측면 주광 + 좌우 파란 역광)
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  [-6, 6].forEach((xPos) => {
    const rimLight = new THREE.DirectionalLight(0x2f5fa7, 4.0);
    rimLight.position.set(xPos, 3, -10);
    scene.add(rimLight);
  });

  // 실제 OBJ 인체 모델 로드 (반투명 화이트/그레이 서리 유리 질감)
  const loader = new THREE.OBJLoader();
  loader.load(
    "./assets/human_body.obj",
    (model) => {
      const bodyMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf3f6fb,
        transmission: 0.35,
        transparent: true,
        roughness: 0.25,
        ior: 1.45,
        clearcoat: 0.3,
        clearcoatRoughness: 0.1,
        thickness: 1.2,
        attenuationColor: new THREE.Color(0xffffff),
        attenuationDistance: 0.8,
      });

      model.traverse((node) => {
        if (node.isMesh) {
          node.material = bodyMaterial;
        }
      });

      model.scale.set(0.2, 0.2, 0.2);
      model.position.set(0, -2.3, 0);
      scene.add(model);
      renderScene();
    },
    undefined,
    (error) => {
      console.error("3D 모델을 불러오는 중 오류가 발생했습니다:", error);
    },
  );

  // =========================================================================
  // [단락 3] 홀로그램 유리판(마커) 셰이더, 텍스처 및 메시 생성
  // =========================================================================
  const sharedVertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const jointFragmentShader = `
    uniform sampler2D tDiffuse;
    uniform float uOpacity;
    uniform vec2 uMaskScale;
    varying vec2 vUv;
    
    void main() {
      vec4 texColor = texture2D(tDiffuse, vUv);
      if (texColor.a < 0.02) discard;
      
      vec2 centerDist = (vUv - vec2(0.5)) * uMaskScale;
      float mask = smoothstep(0.5, 0.35, length(centerDist));
      
      gl_FragColor = vec4(texColor.rgb, texColor.a * mask * uOpacity);
    }
  `;

  const glowFragmentShader = `
    uniform vec3 uGlowColor;
    uniform float uOpacity;
    varying vec2 vUv;
    
    void main() {
      float dist = length(vUv - vec2(0.5));
      float intensity = pow(smoothstep(0.5, 0.0, dist), 2.0);
      
      gl_FragColor = vec4(uGlowColor, intensity * uOpacity);
    }
  `;

  const textureLoader = new THREE.TextureLoader();
  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

  function loadSharpTexture(path) {
    return textureLoader.load(path, (tex) => {
      tex.anisotropy = maxAnisotropy;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
      renderScene();
    });
  }

  const illustrationTextures = {};
  Object.entries(bodyData).forEach(([key, item]) => {
    if (item.image) {
      illustrationTextures[key] = loadSharpTexture(item.image);
    }
  });

  const markerGroup = new THREE.Group();
  const sharedPlaneGeo = new THREE.PlaneGeometry(1, 1);
  const sharedPlaneMatOpts = {
    vertexShader: sharedVertexShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  };

  // 1) 앞장: 관절 일러스트 평면
  const jointMat = new THREE.ShaderMaterial({
    ...sharedPlaneMatOpts,
    fragmentShader: jointFragmentShader,
    uniforms: {
      tDiffuse: { value: null },
      uOpacity: { value: 0.0 },
      uMaskScale: { value: new THREE.Vector2(1.0, 1.0) },
    },
  });
  const jointPlane = new THREE.Mesh(sharedPlaneGeo, jointMat);
  jointPlane.renderOrder = 1;
  jointPlane.visible = false;
  markerGroup.add(jointPlane);

  // 2) 뒷장: 포커스 후광 평면 (단순 표시/숨김 토글)
  const glowPlaneMat = new THREE.ShaderMaterial({
    ...sharedPlaneMatOpts,
    fragmentShader: glowFragmentShader,
    uniforms: {
      uGlowColor: { value: new THREE.Color(0x3a86ff) },
      uOpacity: { value: 0.45 },
    },
  });
  const glowPlane = new THREE.Mesh(sharedPlaneGeo, glowPlaneMat);
  glowPlane.renderOrder = 0;
  glowPlane.visible = false;
  markerGroup.add(glowPlane);

  markerGroup.visible = false;
  scene.add(markerGroup);

  // =========================================================================
  // [단락 4] 반응형 창 크기 대응 및 온디맨드 초기 렌더링
  // =========================================================================
  let resizeRafId = null;
  window.addEventListener("resize", () => {
    if (resizeRafId) cancelAnimationFrame(resizeRafId);
    resizeRafId = requestAnimationFrame(() => {
      if (!container.clientHeight) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderScene();
    });
  });

  renderScene();

  // =========================================================================
  // [단락 5] 카메라 구면 보간(Spherical Interpolation) 이동 함수
  // =========================================================================
  const startTarget = new THREE.Vector3();
  const endTarget = new THREE.Vector3();
  const relativeCam = new THREE.Vector3();
  const startSpherical = new THREE.Spherical();
  const endSpherical = new THREE.Spherical();
  const tempSph = new THREE.Spherical();
  const camAnimState = { progress: 0 };

  function animateCamera(targetCam, targetLook, duration = 1.5) {
    gsap.killTweensOf(camAnimState);

    startTarget.copy(lookAtTarget);
    endTarget.set(targetLook.x, targetLook.y, targetLook.z ?? 0);

    startSpherical.setFromVector3(
      relativeCam.copy(camera.position).sub(startTarget),
    );
    endSpherical.setFromVector3(
      relativeCam.set(targetCam.x, targetCam.y, targetCam.z).sub(endTarget),
    );

    // theta의 최단 경로 보정 (180도 이상 휙 돌지 않도록 방지)
    let diffTheta = endSpherical.theta - startSpherical.theta;
    diffTheta = Math.atan2(Math.sin(diffTheta), Math.cos(diffTheta));
    const endTheta = startSpherical.theta + diffTheta;

    camAnimState.progress = 0;
    gsap.to(camAnimState, {
      progress: 1,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = camAnimState.progress;

        // 1. 시점 타겟 선형 보간
        lookAtTarget.lerpVectors(startTarget, endTarget, t);

        // 2. 구면 좌표계 보간 및 최종 카메라 위치/시선 대입
        tempSph.set(
          THREE.MathUtils.lerp(startSpherical.radius, endSpherical.radius, t),
          THREE.MathUtils.lerp(startSpherical.phi, endSpherical.phi, t),
          THREE.MathUtils.lerp(startSpherical.theta, endTheta, t),
        );
        camera.position
          .copy(lookAtTarget)
          .add(relativeCam.setFromSpherical(tempSph));
        camera.lookAt(lookAtTarget);
        renderScene();
      },
    });
  }

  // =========================================================================
  // [단락 6] UI 메뉴 이벤트 및 3D 카메라·홀로그램 연동
  // =========================================================================
  const heroSection = document.querySelector(".hero-3d");
  const menuItems = document.querySelectorAll(".hero-3d__pain-item");
  const infoPanel = document.getElementById("info-panel");
  const infoTitle = document.getElementById("info-title");
  const infoDiseaseList = document.getElementById("info-disease-list");
  const closeBtn = document.getElementById("close-panel");
  const welcomeMessage = document.querySelector(".hero-3d__welcome");

  // 평면 회전 계산용 재사용 수학 객체
  const baseForwardVec = new THREE.Vector3(0, 0, 1);
  const sharedNormalVec = new THREE.Vector3();
  const sharedQuaternion = new THREE.Quaternion();

  // [6-1] 상단 웰컴 메시지 표시/숨김 전환
  function toggleWelcomeMessage(isVisible) {
    if (!welcomeMessage) return;
    gsap.to(welcomeMessage, {
      y: isVisible ? 0 : -80,
      opacity: isVisible ? 1 : 0,
      duration: isVisible ? 0.8 : 0.6,
      ease: isVisible ? "power2.out" : "power2.inOut",
      pointerEvents: isVisible ? "auto" : "none",
    });
  }

  // [6-2] 2D 하단 질환 정보 패널 업데이트 및 열기
  function openInfoPanel(targetId, data) {
    infoTitle.textContent = data.title;
    infoDiseaseList.innerHTML = "";

    data.diseases?.forEach((disease) => {
      const li = document.createElement("li");
      li.className = "hero-3d__disease-item";

      const a = document.createElement("a");
      a.className = "hero-3d__disease-link";
      a.href = disease === "목디스크" ? "./disease/neck.html" : "#";
      a.target = "_blank";
      a.textContent = disease;

      li.appendChild(a);
      infoDiseaseList.appendChild(li);
    });

    infoPanel.setAttribute("data-part", targetId);
    infoPanel.classList.remove("hero-3d__info-panel--hidden");

    // 접근성(A11y): 첫 번째 질환 링크로 포커스 자동 이동
    infoDiseaseList.querySelector(".hero-3d__disease-link")?.focus();
  }

  // [6-3] 3D 홀로그램 일러스트 및 후광 평면 표시
  function showHologramMarker(targetId, data) {
    markerGroup.position.set(data.targetX ?? 0, data.targetY, 0);
    markerGroup.visible = true;

    const tex = illustrationTextures[targetId];
    if (!data.image || !tex) {
      jointPlane.visible = false;
      glowPlane.visible = false;
      return;
    }

    const activeWidth = data.width ?? 0.8;
    const imgAspect =
      tex.image?.width && tex.image?.height
        ? tex.image.width / tex.image.height
        : 1;
    const activeHeight = activeWidth / imgAspect;

    const zOff = data.zOffset ?? 0.05;
    const maskS = data.maskScale ?? [1.0, 1.0];

    jointMat.uniforms.tDiffuse.value = tex;
    jointMat.uniforms.uMaskScale.value.set(maskS[0], maskS[1]);

    sharedNormalVec.set(data.normal[0], data.normal[1], data.normal[2]);
    sharedQuaternion.setFromUnitVectors(baseForwardVec, sharedNormalVec);
    jointPlane.quaternion.copy(sharedQuaternion);
    glowPlane.quaternion.copy(sharedQuaternion);

    const imgOffsetX = data.imageOffsetX ?? 0.0;
    const imgOffsetY = data.imageOffsetY ?? 0.0;
    const imgOffsetZ = data.imageOffsetZ ?? zOff;

    jointPlane.position.set(imgOffsetX, imgOffsetY, imgOffsetZ);
    glowPlane.position.set(imgOffsetX, imgOffsetY, imgOffsetZ - 0.02);

    jointPlane.scale.set(activeWidth, activeHeight, 1.0);
    glowPlane.scale.set(activeWidth * 1.6, activeHeight * 1.6, 1.0);

    // 카메라 회전 이동 중 반대편에서 미리 보이지 않도록 숨긴 뒤 도착 시점(0.65초 뒤)에 표시
    jointPlane.visible = true;
    glowPlane.visible = false;

    gsap.killTweensOf(jointMat.uniforms.uOpacity);
    jointMat.uniforms.uOpacity.value = 0;
    gsap.to(jointMat.uniforms.uOpacity, {
      value: 1.0,
      duration: 0.6,
      delay: 0.65,
      ease: "power2.out",
      onStart: () => {
        glowPlane.visible = true;
      },
      onUpdate: renderScene,
    });
  }

  // [6-4] 통증 부위 메뉴 선택 총괄 핸들러
  function selectBodyPart(item) {
    const targetId = item.getAttribute("data-target");
    const data = bodyData[targetId];
    if (!data) return;

    menuItems.forEach((li) =>
      li.classList.remove("hero-3d__pain-item--active"),
    );
    item.classList.add("hero-3d__pain-item--active");

    toggleWelcomeMessage(false);
    openInfoPanel(targetId, data);

    const mob = window.innerWidth <= 640 ? data.mobile : null;
    animateCamera(
      {
        x: mob?.camX ?? data.camX ?? 2.5,
        y: mob?.camY ?? data.camY,
        z: mob?.camZ ?? data.camZ,
      },
      {
        x: mob?.targetX ?? data.targetX ?? 0,
        y: mob?.targetY ?? data.targetY,
        z: 0,
      },
      1.5,
    );

    heroSection?.classList.add("hero-3d--active");
    showHologramMarker(targetId, data);
  }

  // [6-5] 닫기/뒤로가기 클릭 시 초기 전신 화면으로 복귀
  function resetBodyMap() {
    infoPanel.classList.add("hero-3d__info-panel--hidden");

    // 접근성(A11y): 원래 열었던 통증 부위 메뉴 아이템으로 초점 복귀 후 활성화 해제
    document.querySelector(".hero-3d__pain-item--active")?.focus();
    menuItems.forEach((li) =>
      li.classList.remove("hero-3d__pain-item--active"),
    );

    heroSection?.classList.remove("hero-3d--active");
    glowPlane.visible = false;

    toggleWelcomeMessage(true);
    animateCamera(defaultCamPos, { x: 0, y: 0, z: 0 }, 1.5);

    if (jointPlane.visible) {
      gsap.killTweensOf(jointMat.uniforms.uOpacity);
      gsap.to(jointMat.uniforms.uOpacity, {
        value: 0,
        duration: 0.5,
        ease: "power2.inOut",
        onUpdate: renderScene,
        onComplete: () => {
          jointPlane.visible = false;
          markerGroup.visible = false;
          renderScene();
        },
      });
    } else {
      markerGroup.visible = false;
      renderScene();
    }
  }

  // 이벤트 리스너 등록
  menuItems.forEach((item) => {
    item.addEventListener("click", () => selectBodyPart(item));
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectBodyPart(item);
      }
    });
  });

  closeBtn.addEventListener("click", resetBodyMap);
}
document.addEventListener("DOMContentLoaded", init3DBodyMap);
