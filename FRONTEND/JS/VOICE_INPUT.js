// =====================
// SPEECH RECOGNITION SETUP
// =====================
let recognition;

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = false;

  recognition.onstart = () => {
    micBtn.innerHTML = `<i class="fas fa-wave-square"></i>`;
    resultContainer.innerHTML =
      getAnimatedStatusIcon("on") +
      `MICROPHONE ACTIVATED! PLEASE SPEAK CLEARLY AND CHECK YOUR MUTE SETTINGS IF YOU'RE NOT HEARD!`;
    showResult();
    micBtn.disabled = true;
  };

  recognition.onend = () => {
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;
    micBtn.disabled = false;
  };

  recognition.onerror = (event) => {
    console.error("SPEECH RECOGNITION ERROR:", event.error);
    resultContainer.innerHTML =
      getAnimatedStatusIcon("wave") +
      '<span class="error-text">SPEECH RECOGNITION ERROR. PLEASE TRY AGAIN.</span>';
    showResult();
    micBtn.disabled = false;
    newsInput.focus();
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    newsInput.value = transcript;
    resultContainer.innerHTML =
      getAnimatedStatusIcon("mic") +
      `INPUT CAPTURED: "<span style="text-transform:uppercase;">${transcript}</span>"`;
    showResult();
    micBtn.disabled = false;
    newsInput.focus();
    animateResult();
  };
} else {
  micBtn.style.display = "none";
  console.warn("SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER.");
}

// =====================
// INITIALIZE VOICE INPUT
// =====================
micBtn.addEventListener("click", () => {
  if (recognition) recognition.start();
});
