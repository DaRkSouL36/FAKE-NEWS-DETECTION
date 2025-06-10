// =====================
// FEEDBACK FORM MODAL WITH ACCESSIBILITY
// =====================
let lastActiveElement = null;

// FUNCTION TO OPEN MODAL AND TRAP FOCUS
function openModal() {
  feedbackModal.classList.remove("hidden");
  feedbackModal.setAttribute("aria-modal", "true");
  feedbackModal.setAttribute("role", "dialog");
  lastActiveElement = document.activeElement;
  setTimeout(() => {
    if (ratingInput) ratingInput.focus();
  }, 100);
  trapFocus(feedbackModal);
}

// FUNCTION TO CLOSE MODAL AND RESTORE FOCUS
function closeModalFunc() {
  feedbackModal.classList.add("hidden");
  feedbackModal.removeAttribute("aria-modal");
  feedbackModal.removeAttribute("role");
  if (lastActiveElement) lastActiveElement.focus();
}

// OPEN MODAL ON FEEDBACK BUTTON CLICK
feedbackToggle.addEventListener("click", openModal);
// CLOSE MODAL ON CANCEL BUTTON CLICK
closeModal.addEventListener("click", closeModalFunc);

// CLOSE MODAL WITH ESC KEY
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !feedbackModal.classList.contains("hidden")) {
    closeModalFunc();
  }
});

// TRAP FOCUS INSIDE MODAL FOR ACCESSIBILITY
function trapFocus(modal) {
  const focusableEls = modal.querySelectorAll(
    'input, textarea, button, [tabindex]:not([tabindex="-1"])'
  );
  const firstEl = focusableEls[0];
  const lastEl = focusableEls[focusableEls.length - 1];

  function handleTab(e) {
    if (e.key === "Tab") {
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    }
  }

  modal.addEventListener("keydown", handleTab);
  closeModal.addEventListener("click", () => {
    modal.removeEventListener("keydown", handleTab);
  });
}

// HANDLES FEEDBACK FORM SUBMISSION
submitFeedback.addEventListener("click", async () => {
  const rating = ratingInput.value.trim();
  const like = feedbackLikeInput.value.trim();
  const improve = feedbackImproveInput.value.trim();

  if (!rating || !like || !improve) {
    showToast("PLEASE COMPLETE ALL FEEDBACK FIELDS.", "feedload");
    return;
  }

  try {
    // SEND FEEDBACK TO BACKEND API
    const BACKEND_URL = "http://localhost:8000";

    const res = await fetch(`${BACKEND_URL}/api/feedback/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rating: parseInt(rating, 10),
        liked_feedback: like,
        improvement_feedback: improve,
      }),
    });

    if (!res.ok) {
      throw new Error("SERVER ERROR!");
    }

    showToast("THANK YOU FOR YOUR FEEDBACK!", "success");

    // CLEAR THE FEEDBACK FORM FIELDS
    ratingInput.value = "";
    feedbackLikeInput.value = "";
    feedbackImproveInput.value = "";
    closeModalFunc();
  } catch (err) {
    showToast("ERROR SUBMITTING FEEDBACK.", "error");
  }
});

// SHOWS A TOAST MESSAGE FOR FEEDBACK/SUCCESS/ERROR
function showToast(msg, type = "info") {
  const icon = getAnimatedStatusIcon(type) || getAnimatedStatusIcon("info");
  let toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.style.position = "fixed";
  toast.style.bottom = "50px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background =
    type === "success"
      ? "linear-gradient(90deg, #073042 0%, #0ff 100%)"
      : type === "error"
      ? "linear-gradient(90deg, #ffffff 0%, #ffb3b3 100%)"
      : "linear-gradient(90deg, #555555 0%, #333333 100%)";
  toast.style.color = "#111";
  toast.style.padding = "16px 28px";
  toast.style.borderRadius = "24px";
  toast.style.fontWeight = "bold";
  toast.style.fontSize = "1rem";
  toast.style.zIndex = "9999";
  toast.style.boxShadow = "0 2px 12px #0006";
  toast.style.letterSpacing = "1px";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.innerHTML = `${icon}<span>${msg.toUpperCase()}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 400);
  }, 1700);
}
