// =====================
// MOBILE NAV TOGGLE
// =====================
if (navToggle && navControls) {
  navToggle.addEventListener("click", () => {
    const navbar = navToggle.closest(".navbar");
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !expanded);
    navbar.classList.toggle("open");
    if (!expanded) {
      setTimeout(() => {
        const firstNav = navControls.querySelector("select,button");
        if (firstNav) firstNav.focus();
      }, 100);
    }
  });
}
