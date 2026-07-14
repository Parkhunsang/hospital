# 프로젝트 코딩 표준 준수 규칙 (Workspace Customization Rules)

본 작업 공간에서 코드(HTML, CSS, JS)를 수정하거나 추가할 때는 항상 아래 가이드를 최우선으로 따릅니다.

## 1. 코딩 표준 문서 준수
- 코드를 편집하기 전, 반드시 작업 공간 내 [coding_standards.md](file:///c:/Users/bjjhp/Desktop/hospital/hospital/coding_standards.md) 파일을 파싱하고 이해해야 합니다.
- NHN 마크업 컨벤션, 카카오 CSS 가이드라인, Google HTML/CSS Style Guide 규칙을 완벽하게 적용합니다.

## 2. HTML 마크업 핵심 제약 조건
- 태그명과 속성명은 항상 **소문자**로 작성하며, 모든 속성값은 **큰따옴표(`"`)**로 감쌉니다.
- 의미 있는 이미지에는 구체적인 `alt` 텍스트를 기입하고, 장식용 이미지는 `alt=""`를 강제 적용합니다.
- 텍스트가 없는 아이콘 버튼에는 스크린 리더용 `aria-label`을 필수 기입합니다.

## 3. CSS 규칙 및 속성 선언 순서
- 스타일링 목적의 `#id` 선택자 사용은 절대 금지하며, 항상 BEM 규칙(`.block__element--modifier`)에 따라 클래스명을 설계합니다.
- CSS 속성은 무작위로 선언하지 않으며, 아래의 우선순위 그룹 순서를 철저히 준수합니다:
  1. **위치 및 배치 (Positioning)**: `position`, `top`, `right`, `bottom`, `left`, `z-index`, `float`, `clear`
  2. **표시 및 정렬 (Display/Flex)**: `display`, `visibility`, `overflow`, `flex-direction`, `justify-content`, `align-items`
  3. **상자 모델 (Box Model)**: `width`, `height`, `margin`, `padding`, `box-sizing`
  4. **테두리 및 배경 (Border/Background)**: `border`, `background`, `box-shadow`
  5. **텍스트 스타일 (Typography)**: `font-size`, `font-family`, `font-weight`, `line-height`, `color`, `text-align`, `text-decoration`
  6. **기타 효과 (Others)**: `opacity`, `transition`, `animation`, `cursor`
