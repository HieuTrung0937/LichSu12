// =====================================================
// HISTORY 12 - LEARNING MODULE
// Module: LEARNING
// [LR-001] Learning content display system
// Purpose: Show event details in Basic/Advanced modes and track progress
// =====================================================

import { loadJSON } from "./app.js";
import {
  getProgress,
  markEventViewed,
  updatePreference,
  getPreferences,
} from "./storage.js";

let learningData = null;
let currentEventId = null;
let currentMode = "basic";

/**
 * [LR-002] Initialize learning module
 * Input: None
 * Output: None
 */
export async function initializeLearning() {
  try {
    // Load events data (shared with timeline)
    learningData = await loadJSON("./data/events.json");

    if (!learningData || !learningData.events) {
      throw new Error("Invalid learning data");
    }

    // Restore last used mode from storage
    const prefs = getPreferences();
    currentMode = prefs.learningMode || "basic";

    renderLearningInterface();
    setupLearningListeners();
  } catch (error) {
    console.error("Learning init failed:", error);
    displayLearningError("Không thể tải nội dung học tập.");
  }
}

/**
 * [LR-003] Render learning interface placeholder or selected event
 * Input: None
 * Output: DOM updates
 */
function renderLearningInterface() {
  const container = document.getElementById("learning-container");
  if (!container) return;

  container.innerHTML = "";

  // Mode Toggle Buttons
  const modeToggle = document.createElement("div");
  modeToggle.className = "learning-modes";

  ["basic", "advanced"].forEach((mode) => {
    const btn = document.createElement("button");
    btn.className = `mode-btn ${currentMode === mode ? "active" : ""}`;
    btn.dataset.mode = mode;
    btn.textContent = mode === "basic" ? "Cơ bản" : "Chuyên sâu";
    modeToggle.appendChild(btn);
  });

  container.appendChild(modeToggle);

  // Content Area
  const contentArea = document.createElement("div");
  contentArea.id = "learning-content-area";
  contentArea.className = "learning-content-area";

  if (currentEventId) {
    renderEventContent(contentArea, currentEventId);
  } else {
    contentArea.innerHTML = `
      <div class="timeline-empty">
        <p>Hãy chọn một sự kiện từ Timeline để bắt đầu học.</p>
      </div>
    `;
  }

  container.appendChild(contentArea);
}

/**
 * [LR-004] Render specific event content based on mode
 * Input: container (DOM element), eventId (string)
 * Output: Filled content area
 */
function renderEventContent(container, eventId) {
  const event = learningData.events.find((e) => e.id === eventId);
  if (!event) return;

  // Mark as viewed in storage
  markEventViewed(eventId);

  let html = "";

  if (currentMode === "basic") {
    // BASIC MODE: Short bullet points for easy memorization
    html += `<h2 class="section-header-title">${event.title}</h2>`;
    html += `<div class="event-date-badge">${formatDate(event.date)}</div>`;

    if (event.basicPoints && event.basicPoints.length > 0) {
      html += '<ul class="basic-points-list">';
      event.basicPoints.forEach((point) => {
        html += `<li>${point}</li>`;
      });
      html += "</ul>";
    } else {
      html +=
        '<p class="text-muted">Chưa có nội dung cơ bản cho sự kiện này.</p>';
    }
  } else {
    // ADVANCED MODE: Deep analysis and context
    html += `<h2 class="section-header-title">${event.title}</h2>`;

    if (event.analysis) {
      html += '<div class="analysis-section">';
      if (event.analysis.nature) {
        html += `<div class="analysis-block"><strong>Bản chất:</strong> ${event.analysis.nature}</div>`;
      }
      if (event.analysis.significance) {
        html += `<div class="analysis-block"><strong>Ý nghĩa lịch sử:</strong> ${event.analysis.significance}</div>`;
      }
      if (event.analysis.connections) {
        html += `<div class="analysis-block"><strong>Mối liên hệ:</strong> ${event.analysis.connections}</div>`;
      }
      html += "</div>";
    }

    // Full details grid
    if (event.details) {
      html += '<div class="details-grid mt-md">';
      Object.entries(event.details).forEach(([key, val]) => {
        const label =
          key === "context"
            ? "Bối cảnh"
            : key === "causes"
              ? "Nguyên nhân"
              : key === "development"
                ? "Diễn biến"
                : "Hệ quả";

        const content = Array.isArray(val)
          ? `<ul>${val.map((v) => `<li>${v}</li>`).join("")}</ul>`
          : `<p>${val}</p>`;

        html += `<div class="detail-card"><h4>${label}</h4>${content}</div>`;
      });
      html += "</div>";
    }
  }

  container.innerHTML = html;
}

/**
 * [LR-005] Setup listeners for mode toggle
 * Input: None
 * Output: Event bindings
 */
function setupLearningListeners() {
  const container = document.getElementById("learning-container");
  if (!container) return;

  // Use delegation for mode buttons
  container.addEventListener("click", (e) => {
    const modeBtn = e.target.closest(".mode-btn");
    if (modeBtn) {
      const newMode = modeBtn.dataset.mode;
      if (newMode && newMode !== currentMode) {
        switchLearningMode(newMode);
      }
    }
  });
}

/**
 * [LR-006] Switch between Basic and Advanced modes
 * Input: mode ('basic' | 'advanced')
 * Output: UI update + Storage save
 */
function switchLearningMode(mode) {
  currentMode = mode;
  updatePreference("learningMode", mode);

  // Update button active states
  const buttons = document.querySelectorAll(".mode-btn");
  buttons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode);
  });

  // Re-render content if an event is selected
  if (currentEventId) {
    const contentArea = document.getElementById("learning-content-area");
    if (contentArea) {
      renderEventContent(contentArea, currentEventId);
    }
  }
}

/**
 * [LR-007] Public method to load event into Learning tab
 * Called by Timeline when user clicks an event card
 * Input: eventId (string)
 * Output: Updates learning view
 */
export function loadEventForLearning(eventId) {
  currentEventId = eventId;
  const contentArea = document.getElementById("learning-content-area");

  if (contentArea) {
    renderEventContent(contentArea, eventId);
  } else {
    // If learning tab isn't active yet, re-init interface
    renderLearningInterface();
  }
}

/**
 * [LR-008] Format date helper
 */
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * [LR-009] Display error state
 */
function displayLearningError(msg) {
  const container = document.getElementById("learning-container");
  if (container) {
    container.innerHTML = `<div class="timeline-error">${msg}</div>`;
  }
}
