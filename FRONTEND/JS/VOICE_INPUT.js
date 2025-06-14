// =====================
// SPEECH RECOGNITION SETUP
// =====================
let recognition;
let speechResultCaptured = false;
let isRecording = false;
let finalTranscript = "";

if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.lang = "en-US";
  recognition.interimResults = true;

  recognition.onstart = () => {
    isRecording = true;
    speechResultCaptured = false;
    finalTranscript = newsInput.value;
    micBtn.innerHTML = `<i class="fas fa-wave-square"></i>`;
    resultText.innerHTML =
      getAnimatedStatusIcon("on") +
      `MICROPHONE ACTIVATED! PLEASE SPEAK CLEARLY AND CHECK YOUR MUTE SETTINGS IF YOU'RE NOT HEARD!`;
    showResult();
    renderConfidenceBar(null, false);
  };

  recognition.onend = () => {
    isRecording = false;
    micBtn.innerHTML = `<i class="fas fa-microphone"></i>`;

    if (!speechResultCaptured) {
      resultText.innerHTML =
        getAnimatedStatusIcon("warning") +
        `<span class="warning-text">NO SPEECH DETECTED. MICROPHONE TIMED OUT.</span>`;
      showResult();
      renderConfidenceBar(null, false);
    }
  };

  recognition.onerror = (event) => {
    isRecording = false;
    console.error("SPEECH RECOGNITION ERROR:", event.error);
    resultText.innerHTML =
      getAnimatedStatusIcon("wave") +
      '<span class="error-text">SPEECH RECOGNITION ERROR. PLEASE TRY AGAIN.</span>';
    showResult();
    newsInput.focus();
    renderConfidenceBar(null, false);
  };

  recognition.onresult = (event) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      let transcript = event.results[i][0].transcript;
      transcript = processTranscript(transcript);

      if (event.results[i].isFinal) {
        if (
          finalTranscript &&
          !finalTranscript.endsWith(" ") &&
          !/^[.,?!:;"')\]\}]/.test(transcript.trimStart())
        ) {
          finalTranscript += " ";
        }
        finalTranscript += transcript;
        finalTranscript = finalTranscript.replace(
          /\s+([.,?!:;"')\]\}])/g,
          "$1"
        );
        speechResultCaptured = true;
        isRecording = false;
      } else {
        interimTranscript += transcript;
      }
    }

    if (interimTranscript) {
      newsInput.value =
        finalTranscript +
        (finalTranscript &&
        !finalTranscript.endsWith(" ") &&
        interimTranscript &&
        !/^[.,?!:;"')\]\}]/.test(interimTranscript.trimStart())
          ? " "
          : "") +
        interimTranscript;
      newsInput.value = newsInput.value.replace(/\s+([.,?!:;"')\]\}])/g, "$1");
    } else {
      newsInput.value = finalTranscript;
    }

    newsInput.dispatchEvent(new Event("input", { bubbles: true }));
    resultText.innerHTML =
      getAnimatedStatusIcon("mic") +
      `INPUT CAPTURED: "<span style="text-transform:uppercase;">${newsInput.value}</span>"`;
    showResult();
    newsInput.focus();
    animateResult();
    renderConfidenceBar(null, false);
  };
} else {
  micBtn.style.display = "none";
  console.warn("SPEECH RECOGNITION NOT SUPPORTED IN THIS BROWSER.");
}

// =====================
// TOGGLE VOICE INPUT
// =====================
micBtn.addEventListener("click", () => {
  if (!recognition) return;
  if (isRecording) {
    recognition.stop();
  } else {
    recognition.start();
  }
});
