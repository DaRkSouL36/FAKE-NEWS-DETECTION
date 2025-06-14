// SPEECH SYNTHESIS STATE
let isSpeaking = false;
let utterance = null;
let wasManuallyStopped = false;

// INITIALIZE ICON
if (speakExplanationBtn)
  speakExplanationBtn.innerHTML = getAnimatedStatusIcon("speaker-idle");

function toggleSpeechSynthesis() {
  if (!explanationBox || !explanationBox.value.trim()) {
    showToast("NO EXPLANATION TO SPEAK.", "error");
    return;
  }
  isSpeaking ? stopSpeechSynthesis() : startSpeechSynthesis();
}

// START SPEAKING
function startSpeechSynthesis() {
  if (!explanationBox || !explanationBox.value.trim()) return;
  window.speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(explanationBox.value);
  utterance.rate = parseFloat(voiceSpeedSlider?.value) || 1;
  utterance.pitch = parseFloat(voicePitchSlider?.value) || 1;
  utterance.onend = utterance.onerror = () => {
    isSpeaking = false;
    if (!wasManuallyStopped) {
      updateSpeakerIcon("speaker-idle");
    }
  };

  isSpeaking = true;
  wasManuallyStopped = false;
  updateSpeakerIcon("speaker-speaking");
  window.speechSynthesis.speak(utterance);
}

// STOP SPEAKING
function stopSpeechSynthesis() {
  wasManuallyStopped = true;
  window.speechSynthesis.cancel();
  isSpeaking = false;
  updateSpeakerIcon("speaker-muted");
  setTimeout(() => {
    updateSpeakerIcon("speaker-idle");
    wasManuallyStopped = false;
  }, 3000);
}

// UPDATE ICON
function updateSpeakerIcon(state) {
  if (speakExplanationBtn)
    speakExplanationBtn.innerHTML = getAnimatedStatusIcon(state);
}

// EVENT LISTENERS
if (speakExplanationBtn)
  speakExplanationBtn.addEventListener("click", toggleSpeechSynthesis);

[voiceSpeedSlider, voicePitchSlider].forEach((slider) => {
  if (slider) {
    slider.addEventListener("input", () => {
      if (isSpeaking) stopSpeechSynthesis();
    });
  }
});
