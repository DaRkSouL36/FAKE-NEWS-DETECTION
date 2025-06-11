// SPEECH SYNTHESIS STATE
let isSpeaking = false;
let utterance = null;

// INITIALIZE ICON
if (speakExplanationBtn)
  speakExplanationBtn.innerHTML = getAnimatedStatusIcon("speaker-idle");

// TOGGLE SPEECH SYNTHESIS
function toggleSpeechSynthesis() {
  if (!explanationBox || !explanationBox.value.trim()) return; // USE .value FOR TEXTAREA
  isSpeaking ? stopSpeechSynthesis() : startSpeechSynthesis();
}

// START SPEAKING
function startSpeechSynthesis() {
  if (!explanationBox || !explanationBox.value.trim()) return; // USE .value FOR TEXTAREA
  window.speechSynthesis.cancel();

  utterance = new SpeechSynthesisUtterance(explanationBox.value); // USE .value FOR TEXTAREA
  utterance.rate = parseFloat(voiceSpeedSlider?.value) || 1;
  utterance.pitch = parseFloat(voicePitchSlider?.value) || 1;
  utterance.onend = utterance.onerror = () => {
    isSpeaking = false;
    updateSpeakerIcon("speaker-idle");
  };

  isSpeaking = true;
  updateSpeakerIcon("speaker-speaking");
  window.speechSynthesis.speak(utterance);
}

// STOP SPEAKING
function stopSpeechSynthesis() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
  updateSpeakerIcon("speaker-muted");
  setTimeout(() => updateSpeakerIcon("speaker-idle"), 900);
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
