// =====================
// ANALYZE BUTTON LOGIC AND API RESPONSE
// =====================

let explanationGenerated = false;
analyzeBtn.addEventListener("click", async () => {
  const text = newsInput.value.trim();
  const model = modelSelect.value;

  // IF EXPLANATION IS CURRENTLY SHOWING, RESET EVERYTHING EXCEPT THE NEWS INPUT
  if (explanationGenerated) {
    resetUIExceptNewsInput();
    explanationGenerated = false;
  }

  // HANDLES EMPTY INPUT CASE
  if (!text) {
    updateResultText(`
      ${getAnimatedStatusIcon("warning")}
      <span class="warning-text">PLEASE ENTER SOME TEXT TO ANALYZE.</span>
    `);
    showResult();
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
    renderConfidenceBar(null, false);
    return;
  }

  try {
    // SHOWS LOADING STATE
    updateResultText(`
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
        ${getAnimatedStatusIcon("loading")}
        <span style="letter-spacing:1px;">ANALYZING...</span>
      </div>
    `);
    renderConfidenceBar(0, false, true);
    showResult();
    analyzeBtn.disabled = true;

    // RESETS EXPLANATION AREA
    if (explanationBox) {
      explanationBox.value = "";
      explanationBox.style.display = "none";
      explanationLoader.className = "explanation-loader gradient-animated";
      explanationLoader.innerHTML = ` 
        <div style="margin-top:10px;letter-spacing:1px;">
          <div class="loader" aria-label="GENERATING"></div>
        </div>
      `;
      explanationLoader.classList.remove("hidden");
      showResult();
    }

    // API REQUEST HANDLING
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
    });

    if (!response.ok) throw new Error(`API ERROR: ${response.status}`);
    const result = await response.json();

    // HANDLES VALID API RESPONSE
    if (result?.PREDICTION && typeof result.CONFIDENCE === "number") {
      updateResultText(`
        <strong>PREDICTION:</strong>
        <span style="color:${result.PREDICTION === "REAL" ? "lime" : "red"}; 
              font-weight:bold;">
          ${result.PREDICTION.toUpperCase()}
        </span><br>
        <strong>CONFIDENCE:</strong> ${(result.CONFIDENCE * 100).toFixed(2)}%
      `);

      renderConfidenceBar(result.CONFIDENCE, result.PREDICTION === "REAL");

      // UPDATES EXPLANATION AREA
      const explanation =
        result.EXPLANATION?.trim() || "NO EXPLANATION AVAILABLE.";
      explanationBox.value = explanation;
      explanationBox.style.display = "block";
      resizeExplanationBox();
      explanationBox.classList.add("filled");
      explanationBox.scrollIntoView({ behavior: "smooth", block: "center" });
      explanationBox.focus();
      explanationLoader.classList.remove("hidden");

      // SHOWS SUCCESS STATE AFTER DELAY
      setTimeout(() => {
        explanationLoader.className =
          "explanation-loader explanation-success-bg gradient-success";
        explanationLoader.innerHTML = `
          <span class="explanation-success">
            ${getAnimatedStatusIcon("success")}
          </span>
        `;
      }, 100);
      explanationGenerated = true;
    } else {
      // HANDLES INVALID RESPONSE FORMAT
      updateResultText(`
        ${getAnimatedStatusIcon("warning")}
        <span class="error-text">INVALID DATA RECEIVED FROM API.</span>
      `);
      if (explanationBox) {
        explanationBox.classList.remove("filled");
        explanationBox.value = "";
      }
      renderConfidenceBar(null, false);
    }
  } catch (err) {
    // HANDLES NETWORK/API ERRORS
    console.error("API ERROR:", err);
    updateResultText(`
      ${getAnimatedStatusIcon("error")}
      <span class="error-text">ERROR CONTACTING API. PLEASE TRY AGAIN.</span>
    `);
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
    renderConfidenceBar(null, false);
  } finally {
    // CLEANUP AND UI RESET
    newsInput.focus();
    analyzeBtn.disabled = false;
    animateResult();
  }
});
