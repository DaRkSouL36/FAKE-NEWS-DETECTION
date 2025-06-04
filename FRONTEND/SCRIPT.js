// =====================
// GLOBAL ELEMENT HOOKS
// =====================
// SELECTS AND STORES REFERENCES TO ALL MAJOR DOM ELEMENTS FOR INTERACTION
const newsInput = document.getElementById("newsInput");
const resultEl = document.getElementById("resultContainer");
const micBtn = document.getElementById("micBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const modelSelect = document.getElementById("modelSelect");
const themeToggle = document.getElementById("themeToggle");
const feedbackToggle = document.getElementById("feedbackToggle");
const feedbackModal = document.getElementById("feedbackModal");
const closeModal = document.getElementById("closeModal");
const submitFeedback = document.getElementById("submitFeedback");
const navToggle = document.getElementById("navToggle");
const navControls = document.getElementById("navControls");
const explanationBox = document.getElementById("explanationBox");
const copyExplanationBtn = document.getElementById("copyExplanationBtn");
const clearNewsBtn = document.getElementById("clearNewsBtn");
const clearExplanationBtn = document.getElementById("clearExplanationBtn");
const toggleExplanationBtn = document.getElementById("toggleExplanationBtn");
const explanationBoxContainer = document.getElementById(
  "explanationBoxContainer"
);

// =====================
// CONFIGURABLE API ENDPOINT
// =====================
const API_BASE = "http://127.0.0.1:8000";
function getApiUrl() {
  return `${API_BASE}/api/PREDICT`;
}

// =====================
// AUTO-RESIZE EXPLANATION BOX ON INPUT OR VALUE CHANGE
// =====================
if (explanationBox) {
  explanationBox.addEventListener("input", () => {
    explanationBox.style.height = "auto";
    explanationBox.style.height = `${explanationBox.scrollHeight}px`;
  });
}

// =====================
// CLEAR NEWS INPUT FUNCTIONALITY
// =====================

if (clearNewsBtn && newsInput) {
  clearNewsBtn.addEventListener("click", () => {
    newsInput.value = "";
    newsInput.focus();
  });
}

// =====================
// CLEAR EXPLANATION BOX FUNCTIONALITY
// =====================

if (clearExplanationBtn && explanationBox) {
  clearExplanationBtn.addEventListener("click", () => {
    explanationBox.value = "";
    explanationBox.classList.remove("filled");
    explanationBox.style.height = "auto";
    explanationBox.focus();
  });
}

// =====================
// TOGGLE EXPLANATION BOX FUNCTIONALITY
// =====================

// TRACKS WHETHER THE EXPLANATION IS EXPANDED
let explanationExpanded = true;

if (toggleExplanationBtn && explanationBoxContainer) {
  toggleExplanationBtn.addEventListener("click", () => {
    explanationExpanded = !explanationExpanded;

    // TOGGLE A CLASS TO COLLAPSE/EXPAND THE CONTAINER
    explanationBoxContainer.classList.toggle("collapsed", !explanationExpanded);

    // UPDATE THE ICON DIRECTION
    toggleExplanationBtn.innerHTML = explanationExpanded
      ? '<i class="fas fa-chevron-up"></i>'
      : '<i class="fas fa-chevron-down"></i>';
    // ARIA-EXPANDED FOR ACCESSIBILITY
    toggleExplanationBtn.setAttribute("aria-expanded", explanationExpanded);
  });
}

// =====================
// ANALYZE BUTTON LOGIC
// =====================
analyzeBtn.addEventListener("click", async () => {
  const text = newsInput.value.trim();
  const model = modelSelect.value;

  // GUARD CLAUSE: IF INPUT IS EMPTY, SHOW WARNING AND EXIT
  if (!text) {
    resultEl.innerHTML =
      '<span class="warning-text">⚠️ PLEASE ENTER SOME TEXT TO ANALYZE.</span>';
    showResult();
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
    return;
  }

  try {
    // SHOW LOADER SPINNER AND "ANALYZING..." MESSAGE
    resultEl.innerHTML = `<div class="loader" aria-label="ANALYZING"></div><div style="margin-top:10px;letter-spacing:1px;">🔍 ANALYZING...</div>`;
    showResult();
    analyzeBtn.disabled = true;
    if (explanationBox) explanationBox.value = "";

    // SENDS POST REQUEST TO THE API WITH USER INPUT AND SELECTED MODEL
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
    });

    if (!response.ok) {
      throw new Error(`API RESPONDED WITH STATUS ${response.status}`);
    }

    const result = await response.json();

    // DEBUG LOGS FOR API RESPONSE
    console.log(
      "RAW EXPLANATION RECEIVED:",
      result.EXPLANATION || result.explanation
    );
    console.log("POPULATING explanationBox...");
    console.log("API RESPONSE:", result);

    // DISPLAY PREDICTION AND CONFIDENCE IF RESULT IS VALID
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

      // EXPLANATION HANDLING
      let explanation = result.EXPLANATION || result.explanation || "";
      if (typeof explanation === "string" && explanation.trim().length > 0) {
        explanationBox.value = explanation.trim();
        explanationBox.dispatchEvent(new Event("input"));
      } else {
        explanationBox.value = "NO EXPLANATION AVAILABLE.";
        explanationBox.dispatchEvent(new Event("input"));
      }
      explanationBox.style.display = "block";
      explanationBox.classList.add("filled");
      explanationBox.scrollIntoView({ behavior: "smooth", block: "center" });
      explanationBox.focus();
    } else {
      // INVALID RESULT HANDLING
      resultEl.innerHTML =
        '<span class="error-text">⚠️ INVALID DATA RECEIVED FROM API.</span>';
      if (explanationBox) {
        explanationBox.classList.remove("filled");
        explanationBox.value = "";
      }
    }
  } catch (err) {
    // ON ERROR, SHOW ERROR MESSAGE
    console.error("API ERROR:", err);
    resultEl.innerHTML =
      '<span class="error-text">❌ ERROR CONTACTING THE API. PLEASE TRY AGAIN LATER.</span>';
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
  } finally {
    newsInput.focus();
    analyzeBtn.disabled = false;
    animateResult();
  }
});

// =====================
// COPY EXPLANATION BUTTON LOGIC
// =====================
if (copyExplanationBtn && explanationBox) {
  copyExplanationBtn.addEventListener("click", async () => {
    explanationBox.select();
    explanationBox.setSelectionRange(0, 99999); // FOR MOBILE DEVICES

    try {
      await navigator.clipboard.writeText(explanationBox.value);
      showToast("EXPLANATION COPIED!", "success");
    } catch (err) {
      try {
        document.execCommand("copy");
        showToast("EXPLANATION COPIED!", "success");
      } catch (err2) {
        showToast("FAILED TO COPY EXPLANATION.", "error");
      }
    }
    explanationBox.setSelectionRange(0, 0);
    explanationBox.blur();
  });
}

// =====================
// VOICE INPUT (SPEECH-TO-TEXT)
// =====================
let recognition;
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    micBtn.innerHTML = `<i class="fas fa-wave-square"></i>`;
    micBtn.disabled = true;
  };

  recognition.onend = () => {
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    micBtn.disabled = false;
  };

  recognition.onerror = (event) => {
    console.error("SPEECH RECOGNITION ERROR:", event.error);
    resultEl.innerHTML =
      '<span class="error-text">🎤 SPEECH RECOGNITION ERROR. PLEASE TRY AGAIN.</span>';
    showResult();
    micBtn.disabled = false;
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    newsInput.value = transcript;
    resultEl.innerHTML = `🎤 INPUT CAPTURED: "<span style="text-transform:uppercase;">${transcript.toUpperCase()}</span>"`;
    showResult();
    newsInput.focus();
    animateResult();
  };
} else {
  micBtn.style.display = "none";
  console.warn("SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER.");
}

// STARTS VOICE RECOGNITION ON MIC BUTTON CLICK
micBtn.addEventListener("click", () => {
  if (recognition) recognition.start();
});

// =====================
// DARK / LIGHT MODE TOGGLE
// =====================
function applyTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-mode", isLight);
  themeToggle.innerHTML = `<i class="fas fa-${isLight ? "sun" : "moon"}"></i>`;
  localStorage.setItem("theme", theme);
}

// INITIALIZE THEME FROM LOCAL STORAGE OR DEFAULT TO DARK
const storedTheme = localStorage.getItem("theme") || "dark";
applyTheme(storedTheme);

themeToggle.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light-mode");
  applyTheme(isLight ? "dark" : "light");
});

// =====================
// FEEDBACK FORM MODAL WITH ACCESSIBILITY
// =====================
let lastActiveElement = null;

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
  closeModal.addEventListener("click", () => {
    modal.removeEventListener("keydown", handleTab);
  });
}

// HANDLES FEEDBACK FORM SUBMISSION
submitFeedback.addEventListener("click", async () => {
  const rating = document.getElementById("rating").value.trim();
  const like = document.getElementById("feedbackLike").value.trim();
  const improve = document.getElementById("feedbackImprove").value.trim();

  if (!rating || !like || !improve) {
    showToast("⚠️ PLEASE COMPLETE ALL FEEDBACK FIELDS.", "error");
    return;
  }

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

// =====================
// UTILITIES
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
