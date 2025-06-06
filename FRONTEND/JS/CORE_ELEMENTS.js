// =====================
// GLOBAL ELEMENT HOOKS
// =====================
const newsInput = document.getElementById("newsInput");
const resultContainer = document.getElementById("resultContainer");
const resultText = document.getElementById("resultText");
const confidenceBarWrapper = document.getElementById("confidenceBarWrapper");

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
const explanationLoader = document.getElementById("explanationLoader");
const ratingInput = document.getElementById("rating");
const feedbackLikeInput = document.getElementById("feedbackLike");
const feedbackImproveInput = document.getElementById("feedbackImprove");

// =====================
// CONFIGURABLE API ENDPOINT
// =====================
const API_BASE = "http://127.0.0.1:8000";
function getApiUrl() {
  return `${API_BASE}/api/PREDICT`;
}

// =====================
// ANIMATED SVG ICONS FOR STATUS, MIC, LOADER, ETC.
// =====================
function getAnimatedStatusIcon(type) {
  switch (type) {
    case "success":
      // ANIMATED CHECKMARK (PULSE)
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <circle cx="18" cy="18" r="16" fill="#0ff" opacity="0.18">
          <animate attributeName="r" values="16;18;16" dur="0.8s" repeatCount="indefinite"/>
        </circle>
        <path d="M11 19l5 5 9-9" stroke="#0ff" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <animate attributeName="stroke-dasharray" from="0,24" to="24,0" dur="0.6s" fill="freeze"/>
        </path>
      </svg>`;
    case "error":
      // ANIMATED CROSS (SHAKE)
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <circle cx="18" cy="18" r="16" fill="#ff0066" opacity="0.15"/>
        <g>
          <path d="M13 13l10 10M23 13l-10 10" stroke="#ff0066" stroke-width="3" fill="none" stroke-linecap="round">
            <animateTransform attributeName="transform" type="translate" values="0 0;2 0;-2 0;0 0" dur="0.6s" repeatCount="2"/>
          </path>
        </g>
      </svg>`;
    case "warning":
      // ANIMATED WARNING (GLOW)
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <circle cx="18" cy="18" r="16" fill="#ffc107" opacity="0.18"/>
        <path d="M18 11v8M18 25h0" stroke="#ffc107" stroke-width="3" stroke-linecap="round">
          <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>`;
    case "mic":
      // ANIMATED MIC ICON
      return `<svg width="48" height="48" viewBox="0 0 48 48" style="vertical-align:middle;">
        <rect x="8" y="26" width="4" height="12" rx="2" fill="#2196f3">
          <animate attributeName="height" values="12;24;12" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="26;14;26" dur="1s" repeatCount="indefinite"/>
        </rect>
        <rect x="36" y="26" width="4" height="12" rx="2" fill="#2196f3">
          <animate attributeName="height" values="12;24;12" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="26;14;26" dur="1s" repeatCount="indefinite"/>
        </rect>
        <rect x="16" y="22" width="4" height="20" rx="2" fill="#64b5f6">
          <animate attributeName="height" values="20;8;20" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="22;34;22" dur="1s" repeatCount="indefinite"/>
        </rect>
        <rect x="28" y="22" width="4" height="20" rx="2" fill="#64b5f6">
          <animate attributeName="height" values="20;8;20" dur="1s" repeatCount="indefinite"/>
          <animate attributeName="y" values="22;34;22" dur="1s" repeatCount="indefinite"/>
        </rect>
        <rect x="20" y="10" width="8" height="20" rx="4" fill="#1976d2"/>
        <rect x="22" y="30" width="4" height="8" rx="2" fill="#1976d2"/>
        <path d="M16 38 Q24 44 32 38" stroke="#1976d2" stroke-width="2" fill="none"/>
      </svg>
      `;
    case "wave":
      // ANIMATED WAVEFORM (FOR RECORDING)
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <g>
          <rect x="10" y="18" width="2" height="6" fill="#0ff">
            <animate attributeName="height" values="6;16;6" dur="0.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="16" y="16" width="2" height="10" fill="#0ff">
            <animate attributeName="height" values="10;6;10" dur="0.8s" repeatCount="indefinite"/>
          </rect>
          <rect x="22" y="18" width="2" height="6" fill="#0ff">
            <animate attributeName="height" values="6;14;6" dur="0.8s" repeatCount="indefinite"/>
          </rect>
        </g>
      </svg>`;
    case "on":
      // ANIMATED MINIMALIST MIC ICON
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <circle cx="18" cy="18" r="16" fill="#0ff" opacity="0.10"/>
        <rect x="15" y="10" width="6" height="12" rx="3" fill="#0ff">
          <animate attributeName="height" values="12;16;12" dur="0.8s" repeatCount="indefinite"/>
        </rect>
        <rect x="17" y="22" width="2" height="4" rx="1" fill="#0ff"/>
      </svg>`;
    case "loading":
      // ANIMATED SPINNER
      return `<svg width="40" height="40" viewBox="0 0 40 40" style="vertical-align:middle;">
      <circle cx="18" cy="18" r="10" stroke="#0ff" stroke-width="3" fill="none">
        <animateTransform attributeName="transform" type="rotate"
          from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/>
      </circle>
      <rect x="27" y="27" width="8" height="3" rx="1.5" fill="#0ff" transform="rotate(45 27 27)">
        <animateTransform attributeName="transform" type="rotate"
          from="45 27 27" to="405 27 27" dur="1s" repeatCount="indefinite"/>
      </rect>
    </svg>`;
    case "feedload":
      // ANIMATED SPINNER
      return `<svg width="36" height="36" viewBox="0 0 36 36" style="vertical-align:middle;margin-right:8px;">
        <circle cx="18" cy="18" r="16" stroke="#0ff" stroke-width="4" fill="none" opacity="0.2"/>
        <circle cx="18" cy="18" r="16" stroke="#0ff" stroke-width="4" fill="none" stroke-dasharray="80" stroke-dashoffset="60">
          <animateTransform attributeName="transform" type="rotate" from="0 18 18" to="360 18 18" dur="1s" repeatCount="indefinite"/>
        </circle>
      </svg>`;
    default:
      return "";
  }
}

// =====================
// UTILITIES
// =====================
// UTILITY FUNCTION TO SHOW RESULT CONTAINER WITH ARIA ATTRIBUTES
function showResult() {
  resultContainer.classList.remove("hidden");
  resultContainer.setAttribute("aria-live", "polite");
  resultContainer.setAttribute("aria-atomic", "true");
}

// UTILITY FUNCTION TO ANIMATE RESULT CONTAINER (FADE IN)
function animateResult() {
  resultContainer.style.animation = "fadeInResult 0.5s";
  setTimeout(() => {
    resultContainer.style.animation = "";
  }, 500);
}
