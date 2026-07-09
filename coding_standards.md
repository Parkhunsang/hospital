# [Docs-01] PixelPerfect & A11y Studio 코딩 표준 가이드라인

본 문서는 네이버(NHN) 마크업 컨벤션, 카카오 CSS 가이드라인, Google HTML/CSS Style Guide를 기반으로 수립된 사내 코딩 표준입니다. 박훈상 사원님이 작성하시는 모든 코드와 프로젝트는 이 표준을 반드시 준수해야 하며, 코드 리뷰 및 QA 단계에서 최우선 검수 기준이 됩니다.

---

## 1. HTML 마크업 규칙 (HTML Conventions)

### 1.1. 문서 기본 규칙
* **소문자 사용**: 모든 HTML 요소(Tag)와 속성(Attribute) 이름은 소문자로만 작성합니다.
  ```html
  <!-- Good -->
  <div class="main-content"></div>
  
  <!-- Bad -->
  <DIV CLASS="Main-Content"></DIV>
  ```
* **따옴표 사용**: 속성 값은 반드시 **큰따옴표(`"`)**로 감쌉니다. 작은따옴표나 생략은 금지합니다.
  ```html
  <input type="text" name="username">
  ```
* **시맨틱 요소의 올바른 사용 (중요)**:
  * 레이아웃만을 목적으로 무분별하게 `<div>`를 중첩하는 것을 지양합니다.
  * 페이지의 대구조는 `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` 등을 사용하여 브라우저와 보조 기기가 웹페이지의 뼈대를 즉시 파악할 수 있도록 합니다.

### 1.2. 웹 접근성(A11y) 기본 규칙
* **이미지 `alt` 속성 의무화**: 모든 `<img>` 태그에는 `alt` 속성을 생략할 수 없습니다.
  * 의미가 있는 이미지: 정확한 대체 텍스트 기입.
  * 장식용 이미지: `alt=""`로 빈 값을 주어 화면 낭독기(스크린 리더)가 건너뛰도록 처리.
  ```html
  <img src="logo.png" alt="PixelPerfect Studio 로고">
  <img src="decoration-line.png" alt="">
  ```
* **아이콘 버튼 `aria-label` 기입**: 텍스트 없이 아이콘(예: 돋보기 아이콘, 닫기 X 아이콘)만 들어있는 버튼에는 반드시 `aria-label` 속성을 통해 버튼의 역할을 텍스트로 설명해 주어야 합니다.
  ```html
  <button type="button" aria-label="검색하기">
    <i class="icon-search"></i>
  </button>
  ```

---

## 2. CSS 작성 규칙 (CSS Conventions)

### 2.1. 클래스 네이밍 규칙: BEM (Block, Element, Modifier)
우리 에이전시는 코드의 확장성과 재사용성을 위해 **BEM 규칙**을 엄격히 적용합니다.

* **구조**: `block-name__element-name--modifier-name`
  * **Block (블록)**: 재사용 가능한 독립적인 컴포넌트 (예: `.card`, `.button`, `.nav`)
  * **Element (요소)**: 블록 내부를 구성하는 종속적인 요소 (예: `.card__title`, `.card__image`) - 언더바 2개(`__`) 사용.
  * **Modifier (수정자)**: 블록이나 요소의 형태, 상태, 테마 등을 정의 (예: `.card--featured`, `.button--large`, `.button--disabled`) - 하이픈 2개(`--`) 사용.
  ```css
  /* Good BEM */
  .card {}
  .card__title {}
  .card__description {}
  .card--dark {}
  ```
* **금지 사항**: 스타일링 목적으로 `#id` 선택자를 절대 사용하지 마십시오. ID 선택자는 구체성 점수(Specificity)가 너무 높아 유지보수를 어렵게 만듭니다. 스타일링은 항상 `.class`로 지정합니다.

### 2.2. CSS 속성 선언 순서 (NHN / Kakao 표준)
CSS 속성은 무작위로 적지 않고, 아래의 우선순위 그룹 순서대로 선언하여 가독성을 높입니다.

1. **위치 및 배치 (Layout/Positioning)**: `position`, `top`, `right`, `bottom`, `left`, `z-index`, `float`, `clear`
2. **표시 및 정렬 (Display/Flex)**: `display`, `visibility`, `overflow`, `flex-direction`, `justify-content`, `align-items`
3. **상자 모델 (Box Model)**: `width`, `height`, `margin`, `padding`, `box-sizing`
4. **테두리 및 배경 (Border/Background)**: `border`, `background`, `box-shadow`
5. **텍스트 스타일 (Typography)**: `font-size`, `font-family`, `font-weight`, `line-height`, `color`, `text-align`, `text-decoration`
6. **기타 효과 (Others)**: `opacity`, `transition`, `animation`, `cursor`

```css
/* 작성 예시 */
.card__button {
  /* 1. Positioning */
  position: relative;
  
  /* 2. Display */
  display: inline-flex;
  align-items: center;
  
  /* 3. Box Model */
  width: 120px;
  padding: 10px 20px;
  
  /* 4. Border/Background */
  border: 1px solid #ccc;
  background-color: var(--color-primary);
  
  /* 5. Typography */
  font-size: 14px;
  color: #fff;
  
  /* 6. Others */
  transition: background-color 0.3s ease;
}
```

---

## 3. 웹 표준 및 호환성 (Compatibility)

* **크로스 브라우징**: Chrome, Edge, Safari, Firefox의 최신 버전에서 깨짐 없이 동일하게 렌더링되어야 합니다.
* **Reset CSS 사용**: 브라우저 기본 스타일로 인한 렌더링 편차를 막기 위해 회사에서 공통 제공하는 `reset.css`를 우선적으로 로드해야 합니다.
* **단위 사용 규칙**: 폰트 크기에는 고정 단위를 피하고 사용자 환경 설정에 유연하게 대응하는 `rem` 단위를 권장하며, 미디어 쿼리(Media Query)에도 `em` 혹은 `rem` 단위를 적극 활용합니다.

이 규정을 철저히 숙지하여 실무 마크업 개발을 준비해 주시기 바랍니다.

---
**PixelPerfect & A11y Studio**  
**퍼블리싱 팀장 김도훈**
