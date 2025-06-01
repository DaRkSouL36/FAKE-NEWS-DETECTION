// =====================
// GLOBAL ELEMENT HOOKS
// =====================
// SELECTS AND STORES REFERENCES TO ALL MAJOR DOM ELEMENTS FOR INTERACTION
const newsInput = document.getElementById("newsInput"); // TEXTAREA FOR NEWS ARTICLE INPUT
const resultEl = document.getElementById("resultContainer"); // CONTAINER TO DISPLAY ANALYSIS RESULT
const micBtn = document.getElementById("micBtn"); // MICROPHONE BUTTON FOR VOICE INPUT
const analyzeBtn = document.getElementById("analyzeBtn"); // BUTTON TO TRIGGER ANALYSIS
const modelSelect = document.getElementById("modelSelect"); // DROPDOWN TO SELECT ML MODEL
const themeToggle = document.getElementById("themeToggle"); // BUTTON TO TOGGLE THEME
const feedbackToggle = document.getElementById("feedbackToggle"); // BUTTON TO OPEN FEEDBACK MODAL
const feedbackModal = document.getElementById("feedbackModal"); // FEEDBACK MODAL DIALOG
const closeModal = document.getElementById("closeModal"); // BUTTON TO CLOSE FEEDBACK MODAL
const submitFeedback = document.getElementById("submitFeedback"); // BUTTON TO SUBMIT FEEDBACK
const navToggle = document.getElementById("navToggle"); // HAMBURGER MENU BUTTON FOR MOBILE NAV
const navControls = document.getElementById("navControls"); // NAVIGATION CONTROLS CONTAINER

// =====================
// CONFIGURABLE API ENDPOINT
// =====================
// DEFINES THE BASE URL FOR API REQUESTS (RELATIVE FOR DEPLOYMENT)
const API_BASE = window.location.origin; // USES CURRENT SITE ORIGIN

// FUNCTION TO CONSTRUCT THE API URL (NO LONGER NEEDS MODEL AS QUERY PARAM)
function getApiUrl() {
  return `${API_BASE}/api/PREDICT`;
}

// =====================
// 1. ANALYZE BUTTON LOGIC
// =====================
// HANDLES CLICK EVENT FOR ANALYZE BUTTON TO SUBMIT NEWS TEXT FOR ANALYSIS
analyzeBtn.addEventListener("click", async () => {
  const text = newsInput.value.trim(); // GETS USER INPUT
  const model = modelSelect.value; // GETS SELECTED MODEL

  // IF INPUT IS EMPTY, SHOW WARNING AND EXIT
  if (!text) {
    resultEl.innerHTML =
      '<span class="warning-text">⚠️ PLEASE ENTER SOME TEXT TO ANALYZE.</span>';
    showResult();
    return;
  }

  try {
    // SHOW LOADER SPINNER AND "ANALYZING..." MESSAGE
    resultEl.innerHTML = `<div class="loader" aria-label="ANALYZING"></div><div style="margin-top:10px;letter-spacing:1px;">🔍 ANALYZING...</div>`;
    showResult();
    analyzeBtn.disabled = true; // DISABLE BUTTON TO PREVENT MULTIPLE SUBMISSIONS

    // SENDS POST REQUEST TO THE API WITH USER INPUT AND SELECTED MODEL
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }), // SEND BOTH TEXT AND MODEL
    });

    // IF RESPONSE IS NOT OK, THROW ERROR
    if (!response.ok) {
      throw new Error(`API RESPONDED WITH STATUS ${response.status}`);
    }

    const result = await response.json(); // PARSE API RESPONSE

    // IF RESULT IS VALID, DISPLAY PREDICTION AND CONFIDENCE
    if (
      result &&
      typeof result.PREDICTION === "string" &&
      typeof result.CONFIDENCE === "number"
    ) {
      resultEl.innerHTML = `
        <strong>PREDICTION:</strong> <span style="color:${
          result.PREDICTION === "REAL" ? "lime" : "red"
        };font-weight:bold;">${result.PREDICTION.toUpperCase()}</span><br>
        <strong>CONFIDENCE:</strong> ${(result.CONFIDENCE * 100).toFixed(2)}%
      `;
    } else {
      // IF RESULT IS INVALID, SHOW ERROR
      resultEl.innerHTML =
        '<span class="error-text">⚠️ INVALID DATA RECEIVED FROM API.</span>';
    }
  } catch (err) {
    // ON ERROR, SHOW ERROR MESSAGE
    console.error("API ERROR:", err);
    resultEl.innerHTML =
      '<span class="error-text">❌ ERROR CONTACTING THE API. PLEASE TRY AGAIN LATER.</span>';
  } finally {
    newsInput.focus(); // RETURN FOCUS TO INPUT
    analyzeBtn.disabled = false; // RE-ENABLE ANALYZE BUTTON
    animateResult(); // ANIMATE RESULT CONTAINER
  }
});

// =====================
// 2. VOICE INPUT (SPEECH-TO-TEXT)
// =====================
// ENABLES VOICE INPUT USING WEBKIT SPEECH RECOGNITION IF SUPPORTED
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false; // SINGLE PHRASE RECOGNITION
  recognition.lang = "en-US"; // LANGUAGE SET TO ENGLISH
  recognition.interimResults = false; // ONLY FINAL RESULTS

  // WHEN RECOGNITION STARTS, CHANGE MIC ICON AND DISABLE BUTTON
  recognition.onstart = () => {
    micBtn.innerHTML = `<i class="fas fa-wave-square"></i>`;
    micBtn.disabled = true;
  };

  // WHEN RECOGNITION ENDS, RESTORE MIC ICON AND ENABLE BUTTON
  recognition.onend = () => {
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    micBtn.disabled = false;
  };

  // ON ERROR, SHOW ERROR MESSAGE AND ENABLE BUTTON
  recognition.onerror = (event) => {
    console.error("SPEECH RECOGNITION ERROR:", event.error);
    resultEl.innerHTML =
      '<span class="error-text">🎤 SPEECH RECOGNITION ERROR. PLEASE TRY AGAIN.</span>';
    showResult();
    micBtn.disabled = false;
  };

  // ON SUCCESSFUL RESULT, POPULATE TEXTAREA AND SHOW CAPTURED INPUT
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    newsInput.value = transcript;
    resultEl.innerHTML = `🎤 INPUT CAPTURED: "<span style="text-transform:uppercase;">${transcript.toUpperCase()}</span>"`;
    showResult();
    newsInput.focus();
    animateResult();
  };
} else {
  // IF NOT SUPPORTED, HIDE MIC BUTTON
  micBtn.style.display = "none";
  console.warn("SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER.");
}

// STARTS VOICE RECOGNITION ON MIC BUTTON CLICK
micBtn.addEventListener("click", () => {
  if (recognition) recognition.start();
});

// =====================
// 3. DARK / LIGHT MODE TOGGLE
// =====================
// HANDLES THEME SWITCHING BETWEEN DARK AND LIGHT MODES
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-mode", isLight); // TOGGLES LIGHT MODE CLASS
  themeToggle.innerHTML = `<i class="fas fa-${isLight ? "sun" : "moon"}"></i>`; // UPDATES ICON
  localStorage.setItem("theme", theme); // STORES USER PREFERENCE
}

// INITIALIZE THEME FROM LOCAL STORAGE OR DEFAULT TO DARK
const storedTheme = localStorage.getItem("theme") || "dark";
applyTheme(storedTheme);

// ON THEME TOGGLE BUTTON CLICK, SWITCH THEME
themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  applyTheme(isLight ? "dark" : "light");
});

// =====================
// 4. FEEDBACK FORM MODAL WITH ACCESSIBILITY
// =====================
// HANDLES OPENING, CLOSING, AND ACCESSIBILITY FOR THE FEEDBACK MODAL
let lastActiveElement = null; // STORES LAST FOCUSED ELEMENT BEFORE MODAL OPENS

// FUNCTION TO OPEN MODAL AND TRAP FOCUS
function openModal() {
  feedbackModal.classList.remove("hidden");
  feedbackModal.setAttribute("aria-modal", "true");
  feedbackModal.setAttribute("role", "dialog");
  lastActiveElement = document.activeElement;
  setTimeout(() => {
    document.getElementById("rating").focus();
  }, 100);
  trapFocus(feedbackModal);
}

// FUNCTION TO CLOSE MODAL AND RESTORE FOCUS
function closeModalFunc() {
  feedbackModal.classList.add("hidden");
  feedbackModal.removeAttribute("aria-modal");
  feedbackModal.removeAttribute("role");
  if (lastActiveElement) lastActiveElement.focus();
}

// OPEN MODAL ON FEEDBACK BUTTON CLICK
feedbackToggle.addEventListener("click", openModal);
// CLOSE MODAL ON CANCEL BUTTON CLICK
closeModal.addEventListener("click", closeModalFunc);

// CLOSE MODAL WITH ESC KEY
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !feedbackModal.classList.contains("hidden")) {
    closeModalFunc();
  }
});

// TRAP FOCUS INSIDE MODAL FOR ACCESSIBILITY
function trapFocus(modal) {
  const focusableEls = modal.querySelectorAll(
    'input, textarea, button, [tabindex]:not([tabindex="-1"])'
  );
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  function handleTab(e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }

  modal.addEventListener("keydown", handleTab);
  // REMOVE FOCUS TRAP LISTENER ON MODAL CLOSE
  closeModal.addEventListener("click", () => {
    modal.removeEventListener("keydown", handleTab);
  });
}

// HANDLES FEEDBACK FORM SUBMISSION
submitFeedback.addEventListener("click", async () => {
  const rating = document.getElementById("rating").value.trim();
  const like = document.getElementById("feedbackLike").value.trim();
  const improve = document.getElementById("feedbackImprove").value.trim();

  // IF ANY FIELD IS EMPTY, SHOW ERROR TOAST
  if (!rating || !like || !improve) {
    showToast("⚠️ PLEASE COMPLETE ALL FEEDBACK FIELDS.", "error");
    return;
  }

  // SIMULATE SENDING FEEDBACK TO BACKEND (REPLACE WITH REAL API CALL IF NEEDED)
  try {
    await new Promise((res) => setTimeout(res, 500)); // SIMULATED DELAY
    showToast("✅ THANK YOU FOR YOUR FEEDBACK!", "success");
    closeModalFunc();
  } catch (err) {
    showToast("❌ ERROR SUBMITTING FEEDBACK.", "error");
  }
});

// SHOWS A TOAST MESSAGE FOR FEEDBACK/SUCCESS/ERROR
function showToast(msg, type = "info") {
  let toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.position = "fixed";
  toast.style.bottom = "50px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background =
    type === "success" ? "#0ff" : type === "error" ? "#f44" : "#333";
  toast.style.color = "#111";
  toast.style.padding = "16px 28px";
  toast.style.borderRadius = "24px";
  toast.style.fontWeight = "bold";
  toast.style.fontSize = "1rem";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 2px 12px #0006";
  toast.style.letterSpacing = "1px";
  toast.innerText = msg.toUpperCase();
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 400);
  }, 1700);
}

// =====================
// 5. MOBILE NAV TOGGLE
// =====================
// HANDLES SHOW/HIDE OF NAVIGATION CONTROLS ON MOBILE VIA HAMBURGER BUTTON
if (navToggle && navControls) {
  navToggle.addEventListener("click", () => {
    const navbar = navToggle.closest(".navbar");
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", !expanded); // TOGGLE ARIA ATTRIBUTE
    navbar.classList.toggle("open"); // TOGGLE MENU VISIBILITY
    // FOCUS FIRST NAV CONTROL ON OPEN FOR ACCESSIBILITY
    if (!expanded) {
      setTimeout(() => {
        const firstNav = navControls.querySelector("select,button");
        if (firstNav) firstNav.focus();
      }, 100);
    }
  });
}

// =====================
// 6. UTILITIES
// =====================
// UTILITY FUNCTION TO SHOW RESULT CONTAINER WITH ARIA ATTRIBUTES
function showResult() {
  resultEl.classList.remove("hidden");
  resultEl.setAttribute("aria-live", "polite");
  resultEl.setAttribute("aria-atomic", "true");
}

// UTILITY FUNCTION TO ANIMATE RESULT CONTAINER (FADE IN)
function animateResult() {
  resultEl.style.animation = "fadeInResult 0.5s";
  setTimeout(() => {
    resultEl.style.animation = "";
  }, 500);
}
