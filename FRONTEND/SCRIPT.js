// HANDLE API CALL ON BUTTON CLICK
document.getElementById("analyzeBtn").addEventListener("click", async () => {
  const text = document.getElementById("newsInput").value;
  const resultEl = document.getElementById("resultContainer");

  // VALIDATION
  if (!text.trim()) {
    resultEl.innerHTML = "⚠️ PLEASE ENTER SOME TEXT.";
    resultEl.classList.remove("hidden");
    return;
  }

  try {
    resultEl.innerHTML = "🔍 ANALYZING...";
    resultEl.classList.remove("hidden");

    // SEND TO BACKEND API
    const response = await fetch("http://127.0.0.1:8000/api/PREDICT", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const result = await response.json();

    // SHOW RESULT
    resultEl.innerHTML = `
      PREDICTION: <strong style="color:${
        result.PREDICTION === "REAL" ? "lime" : "red"
      }">
      ${result.PREDICTION}</strong><br>
      CONFIDENCE: ${(result.CONFIDENCE * 100).toFixed(2)}%
    `;
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = "❌ ERROR CONNECTING TO API.";
  }
});
