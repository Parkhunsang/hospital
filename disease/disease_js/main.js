document.addEventListener("DOMContentLoaded", () => {
  initDiseaseNav();
});

function initDiseaseNav() {
  const nav = document.querySelector(".disease-nav");
  if (!nav) return;
  nav.addEventListener("click", (e) => {
    const item = e.target.closest(".disease-nav__item");
    if (!item) return;
    nav
      .querySelector(".disease-nav__item--active")
      ?.classList.remove("disease-nav__item--active");
    item.classList.add("disease-nav__item--active");
  });
}
