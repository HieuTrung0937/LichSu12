// =====================================================
// HISTORY 12 - TIMELINE MODULE
// Module: TIMELINE
// [TL-001] Vertical timeline for educational use
// Purpose: Load and display historical events in vertical layout
// =====================================================

import { loadJSON } from "./app.js";
import { loadEventForLearning } from "./learning.js";
// Module state
let timelineData = null;
let currentFilter = "all";
let listenersAttached = false;

/**
 * [TL-002] Initialize timeline module
 * Input: None
 * Output: None (renders timeline to DOM)
 */
export async function initializeTimeline() {
  try {
    timelineData = await loadJSON("./data/events.json");

    if (!timelineData || !timelineData.events) {
      throw new Error("Invalid events data structure");
    }

    renderTimeline();

    if (!listenersAttached) {
      setupTimelineListeners();
      createModalStructure();
      setupModalListeners();
      listenersAttached = true;
    }
  } catch (error) {
    console.error("Timeline initialization failed:", error);
    displayError("Không thể tải dữ liệu timeline. Vui lòng thử lại sau.");
  }
}

/**
 * [TL-003] Create Modal Structure in DOM
 * Input: None
 * Output: Appends modal HTML to body
 */
function createModalStructure() {
  if (document.getElementById("event-detail-modal")) return;

  const modalHTML = `
    <div id="event-detail-modal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h2 id="modal-title" class="modal-title"></h2>
          <button class="modal-close-btn" aria-label="Đóng">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-mode-toggle">
            <button class="mode-toggle-btn active" data-mode="basic">Cơ bản</button>
            <button class="mode-toggle-btn" data-mode="advanced">Chuyên sâu</button>
          </div>
          <div id="modal-basic-content" class="detail-section">
            <h3>Ý chính cần nhớ</h3>
            <ul id="modal-basic-points" class="basic-points-list"></ul>
          </div>
          <div id="modal-advanced-content" class="detail-section hidden">
            <h3>Phân tích chuyên sâu</h3>
            <div id="modal-analysis" class="analysis-box"></div>
          </div>
          <div class="detail-section">
            <h3>Bối cảnh & Diễn biến</h3>
            <div id="modal-details" class="details-grid"></div>
          </div>
          <div id="modal-visuals" class="detail-section"></div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", modalHTML);
}

/**
 * [TL-004] Render vertical timeline to DOM
 * Input: timelineData (from module state)
 * Output: Timeline HTML elements
 */
function renderTimeline() {
  const container = document.getElementById("timeline-container");

  if (!container) {
    console.error("Timeline container not found");
    return;
  }

  container.innerHTML = "";

  // Demo banner
  const demoBanner = createDemoBanner();
  container.appendChild(demoBanner);

  // Filter controls
  const controls = createFilterControls();
  container.appendChild(controls);

  // Get filtered events
  const filteredEvents = getFilteredEvents();

  if (filteredEvents.length === 0) {
    displayEmpty();
    return;
  }

  // Create vertical timeline wrapper
  const timelineVertical = document.createElement("div");
  timelineVertical.className = "timeline-vertical";

  // Vertical axis (line)
  const axis = document.createElement("div");
  axis.className = "timeline-axis";
  timelineVertical.appendChild(axis);

  // Sort events by date
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  // Render each event
  sortedEvents.forEach((event) => {
    const eventElement = createEventCard(event);
    timelineVertical.appendChild(eventElement);
  });

  container.appendChild(timelineVertical);
}

/**
 * [TL-005] Create demo banner
 * Input: None
 * Output: Banner HTML element
 */
function createDemoBanner() {
  const banner = document.createElement("div");
  banner.className = "timeline-demo-banner";
  banner.textContent = "NỘI DUNG THỬ NGHIỆM - CHƯA KIỂM DUYỆT";
  return banner;
}

/**
 * [TL-006] Create filter controls
 * Input: None
 * Output: Filter controls HTML element
 */
function createFilterControls() {
  const controls = document.createElement("div");
  controls.className = "timeline-controls";

  const filters = [
    { value: "all", label: "Tất cả" },
    { value: "world", label: "Thế giới" },
    { value: "vietnam", label: "Việt Nam" },
  ];

  filters.forEach((filter) => {
    const btn = document.createElement("button");
    btn.className = "timeline-filter-btn";
    btn.dataset.filter = filter.value;
    btn.textContent = filter.label;

    if (filter.value === currentFilter) {
      btn.classList.add("active");
    }

    controls.appendChild(btn);
  });

  return controls;
}

/**
 * [TL-007] Create event card with dot and connector
 * Input: event (object)
 * Output: Event item HTML element
 */
function createEventCard(event) {
  const item = document.createElement("div");
  item.className = "timeline-event";
  item.dataset.eventId = event.id;

  if (event.publicationStatus === "draft") {
    item.classList.add("draft");
  }

  // Dot on axis
  const dot = document.createElement("div");
  dot.className = "event-dot";
  item.appendChild(dot);

  // Connector from dot to card
  const connector = document.createElement("div");
  connector.className = "event-connector";
  item.appendChild(connector);

  // Event card content
  const card = document.createElement("div");
  card.className = "event-card";

  // Date
  const dateEl = document.createElement("div");
  dateEl.className = "event-date";
  dateEl.textContent = formatDate(event.date, event.endDate);
  card.appendChild(dateEl);

  // Title
  const titleEl = document.createElement("div");
  titleEl.className = "event-title";
  titleEl.textContent = event.title;
  card.appendChild(titleEl);

  // Summary
  const summaryEl = document.createElement("div");
  summaryEl.className = "event-summary";
  summaryEl.textContent = event.summary;
  card.appendChild(summaryEl);

  // Location
  if (event.location) {
    const locationEl = document.createElement("div");
    locationEl.className = "event-location";
    locationEl.textContent = event.location;
    card.appendChild(locationEl);
  }

  // Tags
  if (event.tags && event.tags.length > 0) {
    const tagsEl = document.createElement("div");
    tagsEl.className = "event-tags";

    event.tags.forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.className = "event-tag";
      tagEl.textContent = tag;
      tagsEl.appendChild(tagEl);
    });

    card.appendChild(tagsEl);
  }

  item.appendChild(card);

  return item;
}

/**
 * [TL-008] Format date range
 * Input: startDate (string), endDate (string|null)
 * Output: Formatted date string
 */
function formatDate(startDate, endDate) {
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (!endDate) {
    return startStr;
  }

  const end = new Date(endDate);
  const endStr = end.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * [TL-009] Get filtered events
 * Input: currentFilter (from module state)
 * Output: Filtered events array
 */
function getFilteredEvents() {
  if (!timelineData || !timelineData.events) {
    return [];
  }

  if (currentFilter === "all") {
    return timelineData.events;
  }

  return timelineData.events.filter((event) => event.lane === currentFilter);
}

/**
 * [TL-010] Setup timeline event listeners using EVENT DELEGATION
 * Input: None
 * Output: None (attaches event listeners to container)
 */
function setupTimelineListeners() {
  const container = document.getElementById("timeline-container");

  if (!container) {
    console.error("Timeline container not found for event listeners");
    return;
  }

  container.addEventListener("click", (e) => {
    // Handle filter button clicks
    const filterBtn = e.target.closest(".timeline-filter-btn");
    if (filterBtn) {
      const filter = filterBtn.dataset.filter;
      if (filter && filter !== currentFilter) {
        currentFilter = filter;
        renderTimeline();
      }
      return;
    }

    // Handle event card clicks -> Open Modal
    const eventItem = e.target.closest(".timeline-event");
    if (eventItem) {
      const eventId = eventItem.dataset.eventId;
      openEventModal(eventId);
    }
  });
}

/**
 * [TL-011] Setup modal event listeners
 * Input: None
 * Output: None (attaches event listeners to modal)
 */
function setupModalListeners() {
  const modal = document.getElementById("event-detail-modal");
  if (!modal) return;

  // Close button
  const closeBtn = modal.querySelector(".modal-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });
  }

  // Click outside to close
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Mode toggle inside modal
  const modeBtns = modal.querySelectorAll(".mode-toggle-btn");
  modeBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const mode = e.target.dataset.mode;
      switchModalMode(mode);

      modeBtns.forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
    });
  });

  // ESC key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
}

/**
 * [TL-012] Open Event Modal
 * Input: eventId (string)
 * Output: Renders content into modal and shows it
 */
function openEventModal(eventId) {
  const event = timelineData.events.find((e) => e.id === eventId);
  if (!event) return;

  // Fill basic info
  document.getElementById("modal-title").textContent = event.title;

  // Fill Basic Points
  const basicList = document.getElementById("modal-basic-points");
  basicList.innerHTML = "";
  if (event.basicPoints && event.basicPoints.length > 0) {
    event.basicPoints.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      basicList.appendChild(li);
    });
  } else {
    basicList.innerHTML = "<li>Chưa có thông tin cơ bản.</li>";
  }

  // Fill Analysis
  const analysisBox = document.getElementById("modal-analysis");
  analysisBox.innerHTML = "";
  if (event.analysis) {
    if (event.analysis.nature) {
      analysisBox.innerHTML += `<div class="analysis-item"><span class="analysis-label">Bản chất:</span> ${event.analysis.nature}</div>`;
    }
    if (event.analysis.significance) {
      analysisBox.innerHTML += `<div class="analysis-item"><span class="analysis-label">Ý nghĩa lịch sử:</span> ${event.analysis.significance}</div>`;
    }
    if (event.analysis.connections) {
      analysisBox.innerHTML += `<div class="analysis-item"><span class="analysis-label">Liên hệ/Mối liên kết:</span> ${event.analysis.connections}</div>`;
    }
  } else {
    analysisBox.textContent = "Chưa có phân tích chuyên sâu.";
  }

  // Fill Details
  const detailsGrid = document.getElementById("modal-details");
  detailsGrid.innerHTML = "";

  const detailsMap = [
    { key: "context", label: "Bối cảnh" },
    { key: "causes", label: "Nguyên nhân" },
    { key: "development", label: "Diễn biến" },
    { key: "consequences", label: "Hệ quả" },
  ];

  detailsMap.forEach((item) => {
    const value = event.details ? event.details[item.key] : null;
    if (value) {
      const card = document.createElement("div");
      card.className = "detail-card";

      let content = "";
      if (Array.isArray(value)) {
        content = `<ul>${value.map((v) => `<li>${v}</li>`).join("")}</ul>`;
      } else {
        content = `<p>${value}</p>`;
      }

      card.innerHTML = `<h4>${item.label}</h4>${content}`;
      detailsGrid.appendChild(card);
    }
  });

  // Fill Visuals
  const visualsDiv = document.getElementById("modal-visuals");
  visualsDiv.innerHTML = "";
  if (event.images && event.images.length > 0) {
    event.images.forEach((img) => {
      if (img.isVisualAnchor) {
        const imgEl = document.createElement("img");
        imgEl.src = `./assets/images/${img.filename}`;
        imgEl.alt = img.alt || img.caption;
        imgEl.className = "visual-anchor-img";
        imgEl.onerror = function () {
          this.style.display = "none";
        };

        const caption = document.createElement("p");
        caption.className = "img-caption";
        caption.textContent = img.caption;

        visualsDiv.appendChild(imgEl);
        visualsDiv.appendChild(caption);
      }
    });
  }

  // Reset mode to Basic
  switchModalMode("basic");
  const modeBtns = document.querySelectorAll(".mode-toggle-btn");
  modeBtns.forEach((b) => b.classList.remove("active"));
  modeBtns[0].classList.add("active");

  // Show Modal
  const modal = document.getElementById("event-detail-modal");
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
  loadEventForLearning(eventId);
}

/**
 * [TL-013] Close Modal
 * Input: None
 * Output: Hides modal
 */
function closeModal() {
  const modal = document.getElementById("event-detail-modal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

/**
 * [TL-014] Switch Modal Mode (Basic/Advanced)
 * Input: mode ('basic' or 'advanced')
 * Output: Toggles visibility of content sections
 */
function switchModalMode(mode) {
  const basicContent = document.getElementById("modal-basic-content");
  const advancedContent = document.getElementById("modal-advanced-content");

  if (mode === "basic") {
    basicContent.classList.remove("hidden");
    advancedContent.classList.add("hidden");
  } else {
    basicContent.classList.add("hidden");
    advancedContent.classList.remove("hidden");
  }
}

/**
 * [TL-015] Display empty state
 * Input: None
 * Output: Empty state HTML
 */
function displayEmpty() {
  const container = document.getElementById("timeline-container");
  const emptyMsg = document.createElement("div");
  emptyMsg.className = "timeline-empty";
  emptyMsg.textContent = "Không có sự kiện nào để hiển thị.";
  container.appendChild(emptyMsg);
}

/**
 * [TL-016] Display error state
 * Input: message (string)
 * Output: Error HTML
 */
function displayError(message) {
  const container = document.getElementById("timeline-container");
  if (!container) return;

  container.innerHTML = "";
  const errorMsg = document.createElement("div");
  errorMsg.className = "timeline-error";
  errorMsg.textContent = message;
  container.appendChild(errorMsg);
}
