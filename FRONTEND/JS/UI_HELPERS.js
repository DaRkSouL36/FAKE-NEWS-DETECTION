// =====================
// UI UPDATE AND RESET FUNCTIONS
// =====================

// FUNCTION TO UPDATE RESULT TEXT AREA
function updateResultText(html) {
  if (resultText) {
    resultText.innerHTML = html;
  } else {
    console.error("RESULT TEXT ELEMENT NOT FOUND IN DOM");
  }
}

// FUNCTION TO CONVERT SPOKEN PUNCTUATION/COMMANDS TO SYMBOLS/FORMATTING
function processTranscript(transcript) {
  return transcript
    .replace(/\bcomma\b/gi, ",")
    .replace(/\bperiod\b/gi, ".")
    .replace(/\bfull stop\b/gi, ".")
    .replace(/\bquestion mark\b/gi, "?")
    .replace(/\bexclamation mark\b/gi, "!")
    .replace(/\bcolon\b/gi, ":")
    .replace(/\bsemicolon\b/gi, ";")
    .replace(/\bdash\b/gi, "-")
    .replace(/\bopen quote\b/gi, '"')
    .replace(/\bclose quote\b/gi, '"')
    .replace(/\bnew line\b/gi, "\n")
    .replace(/\bnew paragraph\b/gi, "\n\n");
}

// FUNCTION TO RENDER CONFIDENCE BAR
function renderConfidenceBar(confidence, isReal, isLoading = false) {
  if (!confidenceBarWrapper) {
    console.error("CONFIDENCE BAR WRAPPER NOT FOUND IN DOM");
    return;
  }

  if (confidence === null || confidence === undefined) {
    confidenceBarWrapper.innerHTML = "";
    confidenceBarWrapper.style.display = "none";
    return;
  }

  confidenceBarWrapper.style.display = "block";
  const percent = isLoading ? 0 : Math.round(confidence * 100);
  const iconSVG = "";
  confidenceBarWrapper.innerHTML = `
    <div class="confidence-bar ${isReal ? "green" : "red"}" 
         style="width: ${percent}%;">
      <span class="confidence-bar-animated-icon">${iconSVG}</span>
    </div>
  `;
}

// FUNCTION TO RESET UI EXCEPT NEWS INPUT
function resetUIExceptNewsInput() {
  // RESET RESULT CONTAINER TO ANALYZING STATE WITH SPINNER
  updateResultText(`
    <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
      ${getAnimatedStatusIcon("loading")}
      <span style="letter-spacing:1px;">ANALYZING...</span>
    </div>
  `);
  showResult();

  // CLEAR THE CONFIDENCE BAR
  renderConfidenceBar(0, false);

  // RESET EXPLANATION BOX
  if (explanationBox) {
    explanationBox.classList.remove("filled");
    explanationBox.value = "";
    explanationBox.style.display = "none";
    explanationBox.blur();
  }

  // RESET EXPLANATION LOADER
  if (explanationLoader) {
    explanationLoader.className = "explanation-loader gradient-animated";
    explanationLoader.innerHTML = ` 
    <div style="margin-top:10px;letter-spacing:1px;">
      <div class="loader" aria-label="GENERATING"></div>
    </div>
  `;
    explanationLoader.classList.remove("hidden");
  }

  // RESET COPY AND CLEAR BUTTONS FOR EXPLANATION
  if (copyExplanationBtn) {
    copyExplanationBtn.disabled = false;
    copyExplanationBtn.classList.remove("active", "success", "error");
  }
  if (clearExplanationBtn) {
    clearExplanationBtn.disabled = false;
    clearExplanationBtn.classList.remove("active", "success", "error");
  }

  // RESET TOGGLE EXPLANATION BUTTON STATE
  if (toggleExplanationBtn) {
    toggleExplanationBtn.disabled = false;
    toggleExplanationBtn.setAttribute("aria-expanded", "true");
    toggleExplanationBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    if (explanationBoxContainer) {
      explanationBoxContainer.classList.remove("collapsed");
    }
  }

  // ENSURE CONTROLS ROW AND SPEAKER BUTTON ARE VISIBLE AFTER RESET
  const controlsRow = document.querySelector(".explanation-controls-row");
  const speakBtn = document.querySelector(".speak-explanation-btn-wide");
  if (controlsRow) controlsRow.classList.remove("collapsed");
  if (speakBtn) speakBtn.classList.remove("collapsed");
  // Also reset the expanded state flag if you use it
  if (typeof explanationExpanded !== "undefined") explanationExpanded = true;

  // RESET LOADING/ANIMATION CLASSES ON RESULT CONTAINER
  if (resultContainer) {
    resultContainer.classList.remove("loading", "error", "success", "hidden");
    resultContainer.style.opacity = "";
    resultContainer.style.pointerEvents = "";
    resultContainer.style.animation = "";
  }

  // RESET FEEDBACK MODAL/TOGGLE IF PRESENT
  if (feedbackModal) {
    feedbackModal.classList.add("hidden");
    feedbackModal.classList.remove("open", "active", "show");
  }
  if (feedbackToggle) {
    feedbackToggle.classList.remove("active", "toggled");
  }
  if (closeModal) {
    closeModal.blur();
  }

  // RESET ALL BUTTONS TO DEFAULT STATE
  document.querySelectorAll("button").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("active", "loading", "success", "error", "toggled");
  });

  // REMOVE ALL ERROR/SUCCESS/WARNING CLASSES FROM INPUTS AND TEXTAREAS
  document
    .querySelectorAll("input, textarea")
    .forEach((input) => input.classList.remove("error", "success", "warning"));

  // RESET ARIA ATTRIBUTES FOR ACCESSIBILITY
  if (resultContainer) {
    resultContainer.setAttribute("aria-live", "polite");
    resultContainer.setAttribute("aria-atomic", "true");
  }
  if (toggleExplanationBtn) {
    toggleExplanationBtn.setAttribute("aria-expanded", "true");
  }

  // REMOVE FOCUS FROM ALL ELEMENTS EXCEPT NEWS INPUT
  if (document.activeElement && document.activeElement !== newsInput) {
    document.activeElement.blur();
  }
}
