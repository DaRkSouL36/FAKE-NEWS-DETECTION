// =====================
// THEME MANAGEMENT
// =====================

// APPLIES THE SELECTED THEME TO THE DOCUMENT
// - ADDS OR REMOVES 'light-mode' CLASS BASED ON THEME
// - CHANGES THE THEME TOGGLE ICON (SUN FOR LIGHT, MOON FOR DARK)
// - STORES THE CURRENT THEME IN LOCAL STORAGE FOR PERSISTENCE
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-mode", isLight);
  themeToggle.innerHTML = `<i class="fas fa-${isLight ? "sun" : "moon"}"></i>`;
  localStorage.setItem("theme", theme);

  // =====================
  // UPDATE BACKGROUND VIDEO BASED ON THEME
  // =====================
  const videoElement = document.getElementById("background-video");
  const sourceElement = document.getElementById("video-source");

  if (videoElement && sourceElement) {
    const newSrc = isLight
      ? "BACKGROUND/DaRkSouL[W].mp4"
      : "BACKGROUND/DaRkSouL[D].mp4";

    if (sourceElement.getAttribute("src") !== newSrc) {
      sourceElement.setAttribute("src", newSrc);
      videoElement.load();
    }
  }
}

// =====================
// INITIALIZE THEME
// =====================

// CHECKS LOCAL STORAGE FOR SAVED THEME (DEFAULT: DARK)
// APPLIES THE STORED THEME ON PAGE LOAD
const storedTheme = localStorage.getItem("theme") || "dark";
applyTheme(storedTheme);

// =====================
// THEME TOGGLE HANDLER
// =====================

// HANDLES USER CLICK ON THE THEME TOGGLE BUTTON
// - SWITCHES BETWEEN LIGHT AND DARK THEMES
// - UPDATES THE UI AND STORED PREFERENCE
themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  applyTheme(isLight ? "dark" : "light");
});
