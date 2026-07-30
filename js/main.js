// 기존에 main.js 내용이 있다면 아래 코드를 파일 하단에 추가해 주세요.

document.addEventListener("DOMContentLoaded", () => {
  initIntroDoor();
  init3DBodyMap();
  initFastDiagnosis();
  initNonSurgicalSlider();
  initBrandTrustPartners();
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
      // [카메라 시점 설정]
      targetX: 0, // 카메라가 바라보는 3D 포커스 중심 X좌표 (음수: 오른쪽, 양수: 왼쪽)
      targetY: 1.2, // 카메라가 바라보는 3D 포커스 중심 Y좌표 (양수: 위, 음수: 아래)
      camX: 0, // 카메라의 3D 위치 X좌표 (targetX와 동일하게 설정 시 정면 바라봄)
      camY: 1.2, // 카메라의 3D 위치 Y좌표 (targetY와 동일하게 설정)
      camZ: -2.5, // 카메라 거리/줌 수치 (숫자가 클수록 멀어지고 작을수록 확대)

      // [홀로그램 이미지 파일 및 위치 미세조정]
      image: "./assets/neck.png",
      imageOffsetX: 0, // 일러스트 좌/우 미세 위치 조정 (양수: 오른쪽, 음수: 왼쪽)
      imageOffsetY: 0.1, // 일러스트 위/아래 미세 위치 조정 (양수: 위쪽, 음수: 아래쪽)
      normal: [0, 0, -1], // 이미지가 바라보는 방향 [X, Y, Z] ([0,0,1]: 앞면, [0,0,-1]: 뒷면)
      width: 0.2, // 일러스트 가로 표시 크기
      height: 0.2, // 일러스트 세로 표시 크기
      maskScale: [1.0, 1.0], // 가장자리 부드러운 투명 마스크 범위 [가로, 세로]
      zOffset: -0.2, // 3D 모델 몸체 표면으로부터 앞/뒤 튀어나오는 깊이 거리
    },

    shoulder: {
      title: "어깨",
      diseases: ["오십견", "회전근개파열", "석회성 건염", "견관절재발성 탈구"],

      /* [데스크톱/태블릿 기본 카메라 시점] */
      targetX: -0.42,
      targetY: 1.06,
      camX: -0.42,
      camY: 1.06,
      camZ: 2.0,

      /* [모바일 640px 이하 전용 카메라 줌아웃 & 시선 오프셋] */
      mobile: {
        targetX: -0.42, // 카메라가 바라보는 시선 중심점의 좌/우 위치 (음수: 오른쪽, 양수: 왼쪽)
        targetY: 0.8, // 카메라가 바라보는 시선 중심점의 상/하 높이 (양수: 위로 들어올림, 음수: 아래)
        camX: -0.42, // 3D 카메라 렌즈 본체의 좌/우 위치 (targetX와 동일 시 정면 바라봄)
        camY: 1.25, // 3D 카메라 렌즈 본체의 상/하 높이 (targetY와 동일 시 수평 높이)
        camZ: 3.2, // 3D 카메라와의 앞/뒤 거리 줌 수치 (절대값이 클수록 멀어지는 줌아웃)
      },

      image: "./assets/shoulder.png",
      imageOffsetX: 0.075,
      imageOffsetY: -0.15,
      zOffset: 0.05,

      normal: [0, 0, 1],
      width: 0.48,
      height: 0.48,
      maskScale: [1.0, 1.0],
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

      /* [데스크톱/태블릿 기본 카메라 시점] */
      targetX: -0.02,
      targetY: 0,
      camX: -0.02,
      camY: 0,
      camZ: -3.8,

      /* [모바일 640px 이하 전용 카메라 줌아웃 & 시선 오프셋] */
      mobile: {
        targetX: -0.02, // 모바일 카메라가 바라보는 시선 X축
        targetY: -0.2, // 모바일 카메라가 바라보는 시선 Y축 (위로 살짝 올림)
        camX: -0.02, // 모바일 3D 카메라 렌즈 위치 X축
        camY: 0.25, // 모바일 3D 카메라 렌즈 높이 Y축
        camZ: -4.8, // 모바일 줌아웃 거리 (더 멀어짐)
      },

      image: "./assets/waist.png",
      imageOffsetX: 0,
      imageOffsetY: -0.02,
      zOffset: -0.05,

      normal: [0, 0, -1],
      width: 0.7,
      height: 0.7,
      maskScale: [1.0, 1.0],
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

      /* [데스크톱/태블릿 기본 카메라 시점] */
      targetX: -1.1,
      targetY: -0.2,
      camX: -2.8,
      camY: -0.2,
      camZ: 0.0,

      /* [모바일 640px 이하 전용 카메라 줌아웃 & 시선 오프셋] */
      mobile: {
        targetX: -0.8, // 모바일 시선 중심점 X축 (손목 측면)
        targetY: -0.4, // 모바일 시선 중심점 Y축
        camX: -3.6, // 모바일 카메라 렌즈 X축 (더 멀리 줌아웃)
        camY: -0.1, // 모바일 카메라 렌즈 Y축
        camZ: 0.0, // 모바일 카메라 렌즈 Z축
      },

      image: "./assets/wrist.png",
      imageOffsetX: 0,
      imageOffsetY: 0.05,
      imageOffsetZ: -0.1,
      zOffset: 0.08,

      normal: [-1, 0, 0],
      width: 0.36,
      height: 0.73,
      maskScale: [1.0, 1.0],
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

      /* [데스크톱/태블릿 기본 카메라 시점] */
      targetY: -1.1,
      targetX: 0.3,
      camX: 0.3,
      camY: -1.1,
      camZ: 2.0,

      /* [모바일 640px 이하 전용 카메라 줌아웃 & 시선 오프셋] */
      mobile: {
        targetX: 0.3, // 모바일 시선 중심점 X축
        targetY: -1.2, // 모바일 시선 중심점 Y축 (상단으로 들어올림)
        camX: 0.3, // 모바일 카메라 렌즈 X축
        camY: -0.85, // 모바일 카메라 렌즈 Y축
        camZ: 3.2, // 모바일 전면 줌아웃 수치
      },

      image: "./assets/knee.png",
      imageOffsetX: 0.03,
      imageOffsetY: 0,
      zOffset: 0.05,

      normal: [0, 0, 1],
      width: 0.3,
      height: 0.65,
      maskScale: [1.0, 1.0],
    },

    foot: {
      title: "발/ 발목",
      diseases: ["발목염좌", "무지외반증", "발목 관절염", "족저근막염"],

      /* [데스크톱/태블릿 기본 카메라 시점] */
      targetX: 0.2,
      targetY: -2.1,
      camX: -2.2,
      camY: -2.1,
      camZ: 0.0,

      /* [모바일 640px 이하 전용 카메라 줌아웃 & 시선 오프셋] */
      mobile: {
        targetX: 0.2, // 모바일 시선 중심점 X축
        targetY: -2.4, // 모바일 시선 중심점 Y축 (상단으로 들어올림)
        camX: -3.4, // 모바일 카메라 렌즈 X축 (더 멀리 줌아웃)
        camY: -1.8, // 모바일 카메라 렌즈 Y축
        camZ: 0.0, // 모바일 카메라 렌즈 Z축
      },

      image: "./assets/foot.png",
      imageOffsetX: -0.5,
      imageOffsetY: -0.06,
      imageOffsetZ: 0.04,
      zOffset: 0.1,

      normal: [-1, 0, 0],
      width: 0.8,
      height: 0.44,
      maskScale: [0.8, 0.8],
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
      if (texColor.a < 0.02) discard;
      
      // 중심 (0.5, 0.5)으로부터의 거리 계산
      vec2 centerDist = vUv - vec2(0.5);
      centerDist *= uMaskScale;
      float dist = length(centerDist);
      
      // 원형 마스킹 (외곽 부드럽게 뭉개기)
      float mask = smoothstep(0.5, 0.35, dist);
      
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

  // [홀로그램 텍스처 로딩 - 비등방성 필터링 및 밉맵 비활성화로 2D 일러스트 선명도 극대화]
  const textureLoader = new THREE.TextureLoader();

  function loadSharpTexture(path) {
    const texture = textureLoader.load(path, (tex) => {
      // 그래픽 카드 지원 최대 배수 비등방성 필터링 적용 (사선 구도 뭉개짐 방지)
      const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.anisotropy = maxAnisotropy;

      // 밉맵(원거리 축소 시 블러링)을 끄고 항상 원본에 가까운 선명한 픽셀 보간을 하도록 지시
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      tex.needsUpdate = true;
    });
    return texture;
  }

  const illustrationTextures = {
    neck: loadSharpTexture("./assets/neck.png"),
    shoulder: loadSharpTexture("./assets/shoulder.png"),
    waist: loadSharpTexture("./assets/waist.png"),
    wrist: loadSharpTexture("./assets/wrist.png"),
    knee: loadSharpTexture("./assets/knee.png"),
    foot: loadSharpTexture("./assets/foot.png"),
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
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const jointPlane = new THREE.Mesh(jointPlaneGeo, jointMat);
  jointPlane.renderOrder = 1; // 반투명 유리 모델보다 먼저 렌더링하여 서리유리 굴절/블러 효과 유도
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
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowPlaneGeo, glowPlaneMat);
  glowPlane.renderOrder = 0; // 일러스트 배후 렌더링
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

  // 카메라 구면 보간(Spherical Interpolation) 애니메이션 함수 (갑작스러운 회전 및 모델 파고들기 방지)
  function animateCamera(targetCam, targetLook, duration = 1.5) {
    if (typeof gsap === "undefined") return;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);

    const startTarget = controls.target.clone();
    const endTarget = new THREE.Vector3(
      targetLook.x,
      targetLook.y,
      targetLook.z || 0,
    );

    const startRelativeCam = camera.position.clone().sub(startTarget);
    const endRelativeCam = new THREE.Vector3(
      targetCam.x,
      targetCam.y,
      targetCam.z,
    ).sub(endTarget);

    const startSpherical = new THREE.Spherical().setFromVector3(
      startRelativeCam,
    );
    const endSpherical = new THREE.Spherical().setFromVector3(endRelativeCam);

    // theta의 최단 경로 보정 (180도 이상 휙 돌지 않도록 방지)
    let diffTheta = endSpherical.theta - startSpherical.theta;
    diffTheta = Math.atan2(Math.sin(diffTheta), Math.cos(diffTheta));
    const endTheta = startSpherical.theta + diffTheta;

    const animObj = { progress: 0 };
    gsap.to(animObj, {
      progress: 1,
      duration: duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const t = animObj.progress;

        // 1. 시점 타겟 선형 보간
        const currTarget = new THREE.Vector3().lerpVectors(
          startTarget,
          endTarget,
          t,
        );
        controls.target.copy(currTarget);

        // 2. 구면 좌표계 보간
        const currRadius = THREE.MathUtils.lerp(
          startSpherical.radius,
          endSpherical.radius,
          t,
        );
        const currPhi = THREE.MathUtils.lerp(
          startSpherical.phi,
          endSpherical.phi,
          t,
        );
        const currTheta = THREE.MathUtils.lerp(
          startSpherical.theta,
          endTheta,
          t,
        );

        // 3. 최종 카메라 위치 대입
        const tempSph = new THREE.Spherical(currRadius, currPhi, currTheta);
        const relativeCam = new THREE.Vector3().setFromSpherical(tempSph);
        camera.position.copy(currTarget).add(relativeCam);
      },
    });
  }

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
    const handleSelect = () => {
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

        infoPanel.setAttribute("data-part", targetId);
        infoPanel.classList.remove("hero-3d__info-panel--hidden");

        // 통증 부위 선택 시 마우스 드래그/회전 조작으로 카메라 시점이 틀어지지 않도록 고정(잠금)
        controls.enabled = false;

        /* --- [모바일 640px 이하 전용 시점 감지 및 3D 카메라 이동] --- */
        const isMobile640 = window.innerWidth <= 640;
        const mob = isMobile640 && data.mobile ? data.mobile : null;

        // 모바일(640px 이하)이고 data.mobile이 존재하면 모바일 전용 시점 사용, 그 외(데스크톱/태블릿)는 원본 데이터 100% 사용
        const targetCamX =
          mob && mob.camX !== undefined
            ? mob.camX
            : data.camX !== undefined
              ? data.camX
              : 2.5;
        const targetCamY = mob && mob.camY !== undefined ? mob.camY : data.camY;
        const targetCamZ = mob && mob.camZ !== undefined ? mob.camZ : data.camZ;

        const targetLookX =
          mob && mob.targetX !== undefined
            ? mob.targetX
            : data.targetX !== undefined
              ? data.targetX
              : 0;
        const targetLookY =
          mob && mob.targetY !== undefined ? mob.targetY : data.targetY;

        animateCamera(
          { x: targetCamX, y: targetCamY, z: targetCamZ },
          { x: targetLookX, y: targetLookY, z: 0 },
          1.5, // 부드러운 전환을 위해 1.5초 설정
        );

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

          // 이미지 실제 가로세로 비율에 맞춰 높이(height)를 자동 조정 (찌그러짐 방지)
          const tex = illustrationTextures[targetId];
          if (tex && tex.image && tex.image.width && tex.image.height) {
            const imgAspect = tex.image.width / tex.image.height;
            activeHeight = activeWidth / imgAspect;
          }

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

          const imgOffsetX =
            data.imageOffsetX !== undefined ? data.imageOffsetX : 0.0;
          const imgOffsetY =
            data.imageOffsetY !== undefined ? data.imageOffsetY : 0.0;
          const imgOffsetZ =
            data.imageOffsetZ !== undefined ? data.imageOffsetZ : zOff;
          jointPlane.position.set(imgOffsetX, imgOffsetY, imgOffsetZ);
          glowPlane.position.set(imgOffsetX, imgOffsetY, imgOffsetZ - 0.02); // 글로우는 일러스트보다 살짝 안쪽(뒤쪽)에 배치

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
          markerMesh.visible = false;
          glowMesh.visible = false;
          jointPlane.visible = false;
          glowPlane.visible = false;
          activeNormal = null;
        }

        markerGroup.visible = true;
      }
    };

    item.addEventListener("click", handleSelect);
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleSelect();
      }
    });
  });

  // 닫기/뒤로가기 버튼 클릭 시 전체 화면으로 복귀
  closeBtn.addEventListener("click", () => {
    infoPanel.classList.add("hero-3d__info-panel--hidden");
    menuItems.forEach((li) =>
      li.classList.remove("hero-3d__pain-item--active"),
    );

    // 전체 인체 3D 화면으로 복귀할 때 마우스 드래그/회전 조작 잠금 해제
    controls.enabled = true;

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

      // 카메라 구면 보간 함수 호출하여 원래 위치로 부드럽게 복귀
      animateCamera(
        { x: defaultCamPos.x, y: defaultCamPos.y, z: defaultCamPos.z },
        { x: 0, y: 0, z: 0 },
        1.5,
      );

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
   02-1. 원스톱 진단 시스템 (One-Stop Diagnosis System) 스크롤 인터랙션
   ========================================================================== */
function initFastDiagnosis() {
  const section = document.querySelector(".fast-diagnosis");
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const steps = section.querySelectorAll(".fast-diagnosis__step");
          const stepsContainer = section.querySelector(
            ".fast-diagnosis__steps",
          );

          if (typeof gsap !== "undefined" && steps.length > 0) {
            const containerWidth = stepsContainer.offsetWidth;
            const stepWidth = steps[0].offsetWidth;
            const offset = (containerWidth - stepWidth) / 2;

            // 1. 초기 겹침 상태 설정 (중앙에 모이고 회전)
            steps.forEach((step, idx) => {
              gsap.set(step, {
                x: (1 - idx) * offset,
                rotation: (idx - 1) * 8,
                scale: 0.9,
                opacity: 0,
                transformOrigin: "bottom center",
                zIndex: 10 - idx,
              });
            });

            // 2. 타임라인 애니메이션 실행
            const tl = gsap.timeline();

            // 중앙 카드들 페이드인 등장
            tl.to(steps, {
              opacity: 1,
              scale: 0.95,
              duration: 0.6,
              stagger: 0.1,
              ease: "power2.out",
            });

            // 양옆으로 부드럽게 펴지는(팬아웃) 모션
            tl.to(
              steps,
              {
                x: 0,
                rotation: 0,
                scale: 1,
                duration: 1.0,
                stagger: 0.1,
                ease: "back.out(1.2)",
                onComplete: () => {
                  // 모션 완료 후 CSS 호버 트랜지션 활성화
                  steps.forEach((step) => step.classList.add("is-animated"));
                },
              },
              "-=0.2",
            );
          } else {
            // CSS 폴백 모션
            steps.forEach((step, idx) => {
              step.classList.add("is-fallback");
              setTimeout(() => {
                step.classList.add("is-visible");
                step.classList.add("is-animated");
              }, idx * 250);
            });
          }
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
    },
  );

  observer.observe(section);
}

/* ==========================================================================
   03. 비수술 치료 솔루션 (Non-Surgical Treatments) Slider Logic
   ========================================================================== */
function initNonSurgicalSlider() {
  const swiperContainer = document.querySelector(".non-surgical__swiper");
  if (!swiperContainer) return;

  // Swiper 초기화 (3D Coverflow Effect 적용 및 접근성 강화)
  const treatSwiper = new Swiper(".non-surgical__swiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    coverflowEffect: {
      rotate: 5,
      stretch: 30,
      depth: 100,
      modifier: 1.8,
      slideShadows: false,
    },
    pagination: {
      el: ".non-surgical__pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".non-surgical__swiper-btn--next",
      prevEl: ".non-surgical__swiper-btn--prev",
    },
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    a11y: {
      prevSlideMessage: "이전 비수술 치료법",
      nextSlideMessage: "다음 비수술 치료법",
      firstSlideMessage: "첫 번째 비수술 치료법입니다",
      lastSlideMessage: "마지막 비수술 치료법입니다",
    },
  });
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
        [".hero-3d__menu", ".hero-3d__tv-wrap", ".hero-3d__welcome"],
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

        const welcome = document.querySelector(".hero-3d__welcome");
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
   Brand Trust Scroll Curtain & Fullscreen Swiper Slider Logic
   ========================================================================== */
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

        // 1) Animate curtain widths (fully open by progress = 0.5)
        const leftCover = section.querySelector(".brand-trust__left-cover");
        const rightCover = section.querySelector(".brand-trust__right-cover");
        if (leftCover && rightCover) {
          const curtainProgress = Math.min(progress / 0.5, 1);
          const currentWidth = (1 - curtainProgress) * 50;
          leftCover.style.width =
            currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px";
          rightCover.style.width =
            currentWidth > 0 ? `calc(${currentWidth}% + 4px)` : "0px";
        }

        // 2) Ensure background images remain 100% full screen (scale 1.0)
        const bgImages = section.querySelectorAll(".brand-trust__bg-img");
        bgImages.forEach((img) => {
          img.style.transform = "scale(1)";
        });

        // 3) Ensure content remains fully visible
        const contents = section.querySelectorAll(".brand-trust__content");
        contents.forEach((content) => {
          content.style.opacity = "1";
          content.style.transform = "none";
        });

        // 4) Trigger stats counter count-up when curtain is fully open (>0.5)
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
    // Mobile/Tablet Fallback: Fully open curtains & scale bg to 1
    const leftCover = section.querySelector(".brand-trust__left-cover");
    const rightCover = section.querySelector(".brand-trust__right-cover");
    const bgImages = section.querySelectorAll(
      ".brand-trust__slide--stats .brand-trust__bg-img",
    );
    const contents = section.querySelectorAll(
      ".brand-trust__slide--stats .brand-trust__content",
    );

    if (leftCover) leftCover.style.width = "0";
    if (rightCover) rightCover.style.width = "0";

    bgImages.forEach((img) => {
      img.style.transform = "scale(1)";
    });

    contents.forEach((content) => {
      content.style.opacity = "1";
      content.style.transform = "none";
    });

    // Trigger stats counter immediately on mobile fallback
    runStatsAnimation();
  }
}

function initFastDiagnosis() {
  const section = document.querySelector(".fast-diagnosis");
  if (!section) return;

  const titleEl = section.querySelector(".fast-diagnosis__title");
  if (!titleEl) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    ScrollTrigger.matchMedia({
      "(min-width: 1024px)": function () {
        ScrollTrigger.create({
          trigger: ".fast-diagnosis__conwrap",
          start: "top 140px",
          end: "bottom bottom",
          pin: ".fast-diagnosis__title",
          pinSpacing: false,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        });
      },
    });
  }
}
