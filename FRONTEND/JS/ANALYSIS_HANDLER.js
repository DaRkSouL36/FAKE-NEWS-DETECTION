// =====================
// ANALYZE BUTTON LOGIC
// =====================
analyzeBtn.addEventListener("click", async () => {
  const text = newsInput.value.trim();
  const model = modelSelect.value;

  // GUARD: EMPTY INPUT
  if (!text) {
    resultEl.innerHTML = `
      ${getAnimatedStatusIcon("warning")}
      <span class="warning-text">PLEASE ENTER SOME TEXT TO ANALYZE.</span>
    `;
    showResult();
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
    return;
  }

  try {
    // SHOW LOADING STATE
    resultEl.innerHTML = `
      <div class="loader" aria-label="ANALYZING"></div>
      <div style="margin-top:10px;letter-spacing:1px;">🔍 ANALYZING...</div>
    `;
    showResult();
    analyzeBtn.disabled = true;
    if (explanationBox) explanationBox.value = "";

    // SEND API REQUEST
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
    });

    if (!response.ok)
      throw new Error(`API RESPONDED WITH STATUS ${response.status}`);
    const result = await response.json();

    // DEBUG LOGS
    console.log(
      "RAW EXPLANATION RECEIVED:",
      result.EXPLANATION || result.explanation
    );
    console.log("POPULATING explanationBox...");
    console.log("API RESPONSE:", result);

    // HANDLE VALID RESPONSE
    if (
      result &&
      typeof result.PREDICTION === "string" &&
      typeof result.CONFIDENCE === "number"
    ) {
      resultEl.innerHTML = `
        <strong>PREDICTION:</strong>
        <span style="color:${
          result.PREDICTION === "REAL" ? "lime" : "red"
        }; font-weight:bold;">
          ${result.PREDICTION.toUpperCase()}
        </span><br>
        <strong>CONFIDENCE:</strong> ${(result.CONFIDENCE * 100).toFixed(2)}%
      `;

      // HANDLE EXPLANATION
      const explanation = result.EXPLANATION || result.explanation || "";
      explanationBox.value = explanation.trim() || "NO EXPLANATION AVAILABLE.";
      explanationBox.dispatchEvent(new Event("input"));
      explanationBox.style.display = "block";
      explanationBox.classList.add("filled");
      explanationBox.scrollIntoView({ behavior: "smooth", block: "center" });
      explanationBox.focus();
    } else {
      // INVALID RESPONSE FORMAT
      resultEl.innerHTML = `
        ${getAnimatedStatusIcon("warning")}
        <span class="error-text">INVALID DATA RECEIVED FROM API.</span>
      `;
      if (explanationBox) {
        explanationBox.classList.remove("filled");
        explanationBox.value = "";
      }
    }
  } catch (err) {
    // HANDLE API ERROR
    console.error("API ERROR:", err);
    resultEl.innerHTML = `
      ${getAnimatedStatusIcon("error")}
      <span class="error-text">ERROR CONTACTING THE API. PLEASE TRY AGAIN LATER.</span>
    `;
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
  } finally {
    // RESET UI STATE
    newsInput.focus();
    analyzeBtn.disabled = false;
    animateResult();
  }
});
