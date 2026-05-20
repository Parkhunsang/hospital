// Paste this into a Figma MCP use_figma call for file:
// https://www.figma.com/design/NlXJEok8jKISrHPgRbTnw6
//
// It recreates the three provided visual slides as editable Figma layers.
// Photo areas are editable placeholders, because the current Figma MCP Starter
// plan call limit blocked direct image import/replacement during setup.

const created = [];
const mutated = [];

const styles = ["Regular", "Medium", "Semi Bold", "Bold"];
for (const style of styles) {
  await figma.loadFontAsync({ family: "Inter", style });
}

const page = figma.currentPage;
let maxX = 0;
for (const n of page.children) {
  if ("x" in n && "width" in n) maxX = Math.max(maxX, n.x + n.width);
}

const startX = maxX + 120;
const W = 1536;
const H = 352;
const blue = { r: 0.0196, g: 0.1882, b: 0.3922 };
const deep = { r: 0.0039, g: 0.1294, b: 0.2588 };
const mid = { r: 0.0196, g: 0.2941, b: 0.5451 };
const pale = { r: 0.92, g: 0.965, b: 1 };
const white = { r: 1, g: 1, b: 1 };
const lightText = { r: 0.72, g: 0.84, b: 1 };

function solid(color, opacity = 1) {
  return [{ type: "SOLID", color, opacity }];
}

function text(parent, name, chars, x, y, size, style, color, width, align = "LEFT") {
  const node = figma.createText();
  node.name = name;
  node.fontName = { family: "Inter", style };
  node.characters = chars;
  node.fontSize = size;
  node.lineHeight = { unit: "PIXELS", value: Math.round(size * 1.35) };
  node.letterSpacing = { unit: "PERCENT", value: 0 };
  node.fills = solid(color);
  node.textAlignHorizontal = align;
  node.x = x;
  node.y = y;
  node.resize(width, node.height);
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function rect(parent, name, x, y, width, height, color, radius = 0, opacity = 1) {
  const node = figma.createRectangle();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, height);
  node.fills = solid(color, opacity);
  node.cornerRadius = radius;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function line(parent, name, x, y, width, color, weight = 1, opacity = 1) {
  const node = figma.createLine();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(width, 0);
  node.strokes = solid(color, opacity);
  node.strokeWeight = weight;
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function ellipse(parent, name, x, y, size, color, opacity = 1) {
  const node = figma.createEllipse();
  node.name = name;
  node.x = x;
  node.y = y;
  node.resize(size, size);
  node.fills = solid(color, opacity);
  parent.appendChild(node);
  created.push(node.id);
  return node;
}

function slide(name, y, fill) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = startX;
  frame.y = y;
  frame.resize(W, H);
  frame.clipsContent = true;
  frame.fills = solid(fill);
  page.appendChild(frame);
  created.push(frame.id);
  mutated.push(frame.id);
  return frame;
}

function photo(parent, name, x, y, width, height, label) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.x = x;
  frame.y = y;
  frame.resize(width, height);
  frame.cornerRadius = 7;
  frame.clipsContent = true;
  frame.fills = solid({ r: 0.82, g: 0.9, b: 0.96 });
  parent.appendChild(frame);
  created.push(frame.id);
  rect(frame, "editable photo tint", 0, 0, width, height, { r: 0.65, g: 0.78, b: 0.88 }, 0, 0.35);
  text(frame, "photo label", label, 14, height - 32, 13, "Medium", blue, width - 28, "CENTER");
}

function iconText(parent, symbol, x, y, color) {
  text(parent, "editable icon", symbol, x, y, 34, "Regular", color, 42, "CENTER");
}

const s1 = slide("Editable visual slide 1", 0, { r: 0.97, g: 0.99, b: 1 });
rect(s1, "right image placeholder", 765, 0, 771, 352, { r: 0.82, g: 0.9, b: 0.95 });
rect(s1, "white overlay", 0, 0, 900, 352, white, 0, 0.9);
text(s1, "number", "01", 41, 48, 18, "Medium", mid, 46);
line(s1, "number line", 70, 59, 31, mid, 1, 0.65);
line(s1, "number underline", 42, 73, 29, mid, 2);
text(s1, "headline", "환자를 끝까지 생각하는 진료,\n신뢰로 이어지는 건강의 약속", 41, 103, 33, "Bold", blue, 620);
text(s1, "body", "정확한 진단과 꼭 필요한 치료만을 제공합니다.\n통증의 원인을 함께 찾고, 환자의 일상 회복을 끝까지 책임지겠습니다.", 42, 211, 16, "Regular", deep, 545);
[
  ["♙", "환자 중심 진료", "환자의 이야기에 귀 기울이고\n공감하는 진료"],
  ["◎", "정확한 진단", "정밀한 검사와 분석으로\n원인을 명확히 파악"],
  ["♡", "꼭 필요한 치료", "과잉진료 없이, 환자에게\n필요한 치료만 제안"],
].forEach((item, i) => {
  const x = 42 + i * 192;
  iconText(s1, item[0], x, 295, mid);
  text(s1, "feature title", item[1], x + 50, 294, 13, "Bold", blue, 110);
  text(s1, "feature copy", item[2], x + 50, 320, 11, "Regular", deep, 125);
});

const s2 = slide("Editable visual slide 2", 392, pale);
text(s2, "number", "02", 40, 34, 17, "Medium", mid, 46);
line(s2, "number line", 69, 43, 31, mid, 1, 0.65);
text(s2, "headline", "정형외과·신경외과·영상의학과\n전문 협진 시스템", 40, 80, 30, "Bold", blue, 355);
text(s2, "body", "정확한 진단부터 맞춤 치료까지,\n각 분야 전문의의 긴밀한 협진으로\n최적의 치료 계획을 수립합니다.", 40, 173, 16, "Regular", deep, 330);
rect(s2, "cta button", 40, 258, 183, 35, mid, 17);
text(s2, "cta label", "협진 시스템 자세히 보기  ›", 57, 266, 13, "Bold", white, 145);
[
  ["정밀 진단", "대학병원급 MRI·CT 등\n첨단 장비로 정확하게 진단", "MRI CT 진단 이미지", "◉"],
  ["영상 판독", "영상의학과 전문의의\n정밀 판독과 분석", "영상 판독 이미지", "▣"],
  ["전문의 협진", "정형외과·신경외과·마취통증의학과\n전문의의 다각적 협진", "전문의 회의 이미지", "♙"],
  ["맞춤 치료", "환자의 상태에 맞춘 비수술·수술 치료 및\n재활까지 통합 관리", "맞춤 치료 이미지", "♡"],
].forEach((item, i) => {
  const x = 459 + i * 267;
  photo(s2, `photo ${i + 1}`, x, 35, 226, 141, item[2]);
  ellipse(s2, "blue icon circle", x + 88, 159, 50, mid);
  iconText(s2, item[3], x + 92, 162, white);
  text(s2, "step title", item[0], x, 221, 17, "Bold", blue, 226, "CENTER");
  text(s2, "step copy", item[1], x - 21, 254, 13, "Regular", deep, 268, "CENTER");
  if (i < 3) text(s2, "arrow", "→", x + 247, 194, 31, "Regular", mid, 40, "CENTER");
});

const s3 = slide("Editable visual slide 3", 784, { r: 0.005, g: 0.115, b: 0.22 });
rect(s3, "building image placeholder", 1312, 0, 224, 352, { r: 0.08, g: 0.18, b: 0.28 }, 0, 0.8);
text(s3, "logo text", "COREUP\nSPINE & PAIN CENTER", 1415, 103, 20, "Bold", white, 110, "CENTER");
text(s3, "number", "03", 38, 36, 17, "Regular", white, 46);
line(s3, "number line", 68, 46, 31, white, 1, 0.65);
text(s3, "headline", "신뢰가 쌓아온 결과,\n더 나은 내일을 위한 성장", 38, 74, 31, "Bold", white, 360);
text(s3, "body", "풍부한 경험과 체계적인 진료 시스템으로\n환자분들의 건강한 일상을 함께 만들어갑니다.", 38, 177, 16, "Regular", white, 355);
text(s3, "footnote", "* 2023년 기준 / 본원 진료 데이터", 38, 256, 11, "Regular", { r: 0.72, g: 0.82, b: 0.92 }, 250);
[
  ["비수술 치료 경험", "12,000+", "건 이상", "♙"],
  ["MRI/초음파 정밀 진단", "18,000+", "건 이상", "◉"],
  ["재진 환자 비율", "82%", "이상", "♙"],
  ["지역 주민 신뢰도", "9.3/10", "(자체 조사 기준)", "♡"],
].forEach((item, i) => {
  const x = 433 + i * 215;
  rect(s3, `metric card ${i + 1}`, x, 49, 201, 208, { r: 0.01, g: 0.16, b: 0.31 }, 7, 0.45);
  iconText(s3, item[3], x + 80, 69, white);
  text(s3, "metric title", item[0], x + 20, 139, 15, "Bold", white, 161, "CENTER");
  text(s3, "metric number", item[1], x + 20, 176, 43, "Bold", lightText, 161, "CENTER");
  text(s3, "metric suffix", item[2], x + 20, 229, 16, "Regular", white, 161, "CENTER");
});

return {
  createdNodeIds: created,
  mutatedNodeIds: mutated,
  frames: [s1.id, s2.id, s3.id],
};
