// =====================
// ANALYZE BUTTON LOGIC
// =====================
analyzeBtn.addEventListener("click", async () => {
  const text = newsInput.value.trim();
  const model = modelSelect.value;

  // CHECKS IF USER INPUT IS EMPTY AND SHOWS A WARNING IF SO
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
    // CLEARS THE CONFIDENCE BAR ON EMPTY INPUT
    renderConfidenceBar(0, false);
    return;
  }

  try {
    // DISPLAYS ANIMATED LOADING ICON AND "ANALYZING..." TEXT DURING API REQUEST
    document.getElementById("resultText").innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;">
        ${getAnimatedStatusIcon("loading")}
        <span style="letter-spacing:1px;">ANALYZING...</span>
      </div>
    `;
    showResult();
    analyzeBtn.disabled = true;
    if (explanationBox) {
      explanationBox.value = "";
      explanationLoader.classList.remove("hidden");
      explanationLoader.classList.add("filled");
      explanationLoader.innerHTML = ` 
        <div style="margin-top:10px;letter-spacing:1px;"> <div class="loader" aria-label="GENERATING"></div></div>
      `;
      explanationBox.style.display = "none";
      showResult();
    }
    // SENDS A POST REQUEST TO THE PREDICTION API WITH USER INPUT AND SELECTED MODEL
    const response = await fetch(getApiUrl(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
    });

    if (!response.ok)
      throw new Error(`API RESPONDED WITH STATUS ${response.status}`);
    const result = await response.json();

    // LOGS THE RAW API RESPONSE FOR DEBUGGING PURPOSES
    console.log(
      "RAW EXPLANATION RECEIVED:",
      result.EXPLANATION || result.explanation
    );
    console.log("POPULATING explanationBox...");
    console.log("API RESPONSE:", result);

    // HANDLES A VALID API RESPONSE BY DISPLAYING PREDICTION AND CONFIDENCE
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

      // RENDERS THE CONFIDENCE BAR WITH ANIMATED ICON AND ENHANCED VISUALS
      renderConfidenceBar(result.CONFIDENCE, result.PREDICTION === "REAL");

      // FILLS THE EXPLANATION BOX WITH THE API'S EXPLANATION OR A DEFAULT MESSAGE
      const explanation = result.EXPLANATION || result.explanation || "";
      explanationBox.value = explanation.trim() || "NO EXPLANATION AVAILABLE.";
      explanationBox.dispatchEvent(new Event("input"));
      explanationBox.style.display = "block";
      explanationBox.classList.add("filled");
      explanationBox.scrollIntoView({ behavior: "smooth", block: "center" });
      explanationBox.focus();
    } else {
      // HANDLES INVALID API RESPONSE FORMAT
      resultEl.innerHTML = `
        ${getAnimatedStatusIcon("warning")}
        <span class="error-text">INVALID DATA RECEIVED FROM API.</span>
      `;
      if (explanationBox) {
        explanationBox.classList.remove("filled");
        explanationBox.value = "";
      }
      // CLEARS THE CONFIDENCE BAR IF RESPONSE IS INVALID
      renderConfidenceBar(0, false);
    }
  } catch (err) {
    // HANDLES API OR NETWORK ERRORS AND SHOWS AN ERROR MESSAGE
    console.error("API ERROR:", err);
    resultEl.innerHTML = `
      ${getAnimatedStatusIcon("error")}
      <span class="error-text">ERROR CONTACTING THE API. PLEASE TRY AGAIN LATER.</span>
    `;
    if (explanationBox) {
      explanationBox.classList.remove("filled");
      explanationBox.value = "";
    }
    // CLEARS THE CONFIDENCE BAR ON ERROR
    renderConfidenceBar(0, false);
  } finally {
    // RESTORES BUTTON STATE AND ANIMATES THE RESULT CONTAINER
    newsInput.focus();
    analyzeBtn.disabled = false;
    animateResult();
  }
});

// =====================
// RENDERS THE MODEL CONFIDENCE BAR WITH ANIMATED ICON, COLOR, AND TRANSITION
// =====================
function renderConfidenceBar(confidence, isReal) {
  const barWrapper = document.getElementById("confidenceBarWrapper");
  if (!barWrapper) return;
  const percent = Math.round(confidence * 100);

  // GETS ANIMATED ICON BASED ON PREDICTION TYPE USING getAnimation()
  const iconSVG = isReal ? getAnimation("real") : getAnimation("fake");

  // BUILDS THE CONFIDENCE BAR WITH ANIMATED ICON AT THE END
  barWrapper.innerHTML = `
    <div class="confidence-bar ${
      isReal ? "green" : "red"
    }" style="width: ${percent}%;">
      <span class="confidence-bar-animated-icon">${iconSVG}</span>
    </div>
  `;
}
