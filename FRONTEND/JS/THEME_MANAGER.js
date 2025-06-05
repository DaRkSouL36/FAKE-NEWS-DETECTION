// =====================
// THEME MANAGEMENT
// =====================
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-mode", isLight);
  themeToggle.innerHTML = `<i class="fas fa-${isLight ? "sun" : "moon"}"></i>`;
  localStorage.setItem("theme", theme);
}

// =====================
// INITIALIZE THEME
// =====================
const storedTheme = localStorage.getItem("theme") || "dark";
applyTheme(storedTheme);

// =====================
// THEME TOGGLE HANDLER
// =====================
themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  applyTheme(isLight ? "dark" : "light");
});
