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
// COPY EXPLANATION BUTTON LOGIC
// =====================
if (copyExplanationBtn && explanationBox) {
  copyExplanationBtn.addEventListener("click", async () => {
    explanationBox.select();
    explanationBox.setSelectionRange(0, 99999); 

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
