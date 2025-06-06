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

// FUNCTION TO RENDER CONFIDENCE BAR
function renderConfidenceBar(confidence, isReal) {
  if (!confidenceBarWrapper) {
    console.error("CONFIDENCE BAR WRAPPER NOT FOUND IN DOM");
    return;
  }
  const percent = Math.round(confidence * 100);
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
  // CLEAR THE RESULT TEXT
  updateResultText("");

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
    explanationLoader.className = "explanation-loader hidden";
    explanationLoader.innerHTML = "";
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
