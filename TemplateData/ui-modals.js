// TemplateData/ui-modals.js
window.TrisonetUI = (function() {
  function ShowCreateEventModal() {
     const modalId = "createEventModal";
    if (document.getElementById(modalId)) return;

    // Allow HTML inputs to receive focus (Unity WebGL)
    if (typeof unityInstance !== "undefined" && unityInstance.Module) {
      if (unityInstance.Module.canvas) {
        unityInstance.Module.canvas.tabIndex = 0;
        unityInstance.Module.canvas.blur();
      }
    } else {
      console.warn("unityInstance or unityInstance.Module is not defined, cannot set focus on canvas.");
    }

    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "ui-overlay";
    modal.innerHTML = `
      <div class="ui-modal" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title" tabindex="-1">
        <h2 id="${modalId}-title" class="ui-modal__title">Create Event</h2>

        <form class="ui-form" onsubmit="return false;">
          <div class="ui-field">
            <label class="ui-label" for="eventTitle">Title</label>
            <input id="eventTitle" class="ui-input" placeholder="Event title">
          </div>

          <div class="ui-field">
            <label class="ui-label" for="eventDesc">Description</label>
            <textarea id="eventDesc" class="ui-textarea" placeholder="Brief description"></textarea>
          </div>

          <div class="ui-field">
            <label class="ui-label" for="eventLocation">Location</label>
            <input id="eventLocation" class="ui-input" placeholder="Venue" value="Trisonet Event Center" disabled>
          </div>

          <div class="ui-row">
            <label class="ui-check">
              <input id="eventIsPaid" type="checkbox" />
              <span>Paid event</span>
            </label>
            <input id="eventAmount" class="ui-input ui-hidden" type="number" step="0.01" placeholder="Amount">
          </div>

          <div class="ui-field">
            <label class="ui-label" for="eventDate">Event Date</label>
            <input id="eventDate" class="ui-input" type="date">
          </div>

          <div class="ui-row">
            <div class="ui-field">
              <label class="ui-label" for="eventStartTime">Start Time</label>
              <input id="eventStartTime" class="ui-input" type="time">
            </div>
            <div class="ui-field">
              <label class="ui-label" for="eventEndTime">End Time</label>
              <input id="eventEndTime" class="ui-input" type="time">
            </div>
          </div>

          <div class="ui-field">
            <label class="ui-label" for="eventCapacity">Capacity</label>
            <input id="eventCapacity" class="ui-input" type="number" placeholder="e.g. 50">
          </div>
        </form>

        <div class="ui-actions">
          <button type="button" class="ui-btn ui-btn--ghost" data-modal-close>Cancel</button>
          <button type="button" class="ui-btn ui-btn--primary" id="btnCreateEvent">Create</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Behavior
    const paidCheckbox = modal.querySelector("#eventIsPaid");
    const amountInput  = modal.querySelector("#eventAmount");
    const shell        = modal.querySelector(".ui-modal");

    const closeModal = () => {
      modal.remove();
      if (unityInstance && unityInstance.Module && unityInstance.Module.canvas) {
        unityInstance.Module.canvas.focus();
      }
    };

    // show/hide amount
    paidCheckbox.addEventListener("change", function(){
      if (this.checked) {
        amountInput.classList.remove("ui-hidden");
        amountInput.focus();
      } else {
        amountInput.classList.add("ui-hidden");
        amountInput.value = "";
      }
    });

    // click outside to close
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });

    // Esc to close
    modal.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    // Cancel buttons
    modal.querySelectorAll("[data-modal-close]").forEach(btn => {
      btn.addEventListener("click", closeModal);
    });

    // Focus first input
    shell.focus();
    const first = modal.querySelector("#eventTitle");
    if (first) first.focus();

    // Create handler
    modal.querySelector("#btnCreateEvent").addEventListener("click", function(){
      const title = document.getElementById('eventTitle').value.trim();
      const description = document.getElementById('eventDesc').value.trim();
      const location = document.getElementById('eventLocation').value.trim();
      const isPaid = document.getElementById('eventIsPaid').checked;
      const amount = parseFloat(document.getElementById('eventAmount').value) || 0;
      const date = document.getElementById('eventDate').value;
      const start = document.getElementById('eventStartTime').value;
      const end = document.getElementById('eventEndTime').value;
      const capacity = parseInt(document.getElementById('eventCapacity').value) || 0;

      // Validation
      if (!title) { TrisonetNotify('Please enter a title', "warning"); return; }
      if (!description) { TrisonetNotify('Please enter a description', "warning"); return; }
      if (!location) { TrisonetNotify('Please enter a location', "warning"); return; }
      if (!date) { TrisonetNotify('Please select a date', "warning"); return; }
      if (!start) { TrisonetNotify('Please select a start time', "warning"); return; }
      if (!end) { TrisonetNotify('Please select an end time', "warning"); return; }
      if (isPaid && amount <= 0) { TrisonetNotify('Please enter a valid amount for a paid event', "warning"); return; }
      if (capacity <= 0) { TrisonetNotify('Please enter a valid capacity', "warning"); return; }

      const eventData = {
        title,
        description,
        location,
        amount: isPaid ? amount : 0,
        isPaid,
        startTime: `${date}T${start}:00`,
        endTime: `${date}T${end}:00`,
        capacity
      };

      unityInstance.SendMessage('NetworkManager', 'OnWebGLCreateEventSubmit', JSON.stringify(eventData));
      // TrisonetLoading.show("Creating event...");
    //   closeModal();
    });
  }

  function ShowEventRegistrationModal(eventId) {
    const modalId = "eventRegistrationModal";
    if (document.getElementById(modalId)) return;

    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "ui-overlay";
    modal.innerHTML = `
      <div class="ui-modal" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title" tabindex="-1">
        <h2 id="${modalId}-title" class="ui-modal__title">Register for Event</h2>
        <div class="ui-form">
          <div class="ui-field">
            <label class="ui-label" for="inviteCodeInput">Invitation Code</label>
            <input id="inviteCodeInput" class="ui-input" placeholder="Enter invite code">
          </div>
        </div>
        <div class="ui-actions">
          <button type="button" class="ui-btn ui-btn--ghost" data-modal-close>Cancel</button>
          <button type="button" class="ui-btn ui-btn--primary" id="btnRegisterEvent">Register</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const shell = modal.querySelector(".ui-modal");
    const closeModal = () => {
      modal.remove();
      unityInstance.SendMessage('NetworkManager', 'EnableCaptureAllKeyboardInput');
    };

    modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
    modal.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    modal.querySelectorAll("[data-modal-close]").forEach(btn => btn.addEventListener("click", closeModal));
    shell.focus();
    modal.querySelector("#inviteCodeInput").focus();

    modal.querySelector("#btnRegisterEvent").addEventListener("click", function(){
      const code = document.getElementById('inviteCodeInput').value;
      unityInstance.SendMessage('NetworkManager', 'OnWebGLRegisterEvent', code);
      // closeModal();
    });
  }

function ShowAllEventsModal(jsonEvents) {
      
    const events = JSON.parse(jsonEvents);
    console.log("ShowAllEventsModal", events);
    console.log(window.currentUser);

    const modalId = "allEventsModal";
    if (document.getElementById(modalId)) return;

    const modal = document.createElement("div");
    modal.id = modalId;
    modal.className = "ui-overlay";

    const now = new Date();

    const listHtml = (events.events || []).map(e => {
    const startTime = new Date(e.startDate);
    const isExpired = !isNaN(startTime) && startTime < now;
    const isCreator = e.user === window.currentUser._id;
    const isParticipant = (e.participant || []).some(p => p._id === window.currentUser._id);

    let actionHtml = "";

    if (isExpired) {
    actionHtml = `<div class="ui-tag ui-tag--error">Expired</div>`;
    } else if (isCreator) {
    actionHtml = `
        <button class="ui-btn ui-btn--ghost" data-copy="${e.invitationCode || e._id}">Copy Invite</button>
    `;
    } else if (isParticipant) {
    actionHtml = `
        <button class="ui-btn ui-btn--secondary" data-goto="${e._id}">Go To Venue</button>
        <span class="ui-tag ui-tag--success">(Attending)</span>
    `;
    } else {
    actionHtml = `
        <button class="ui-btn ui-btn--primary" data-join="${e._id}">Join</button>
    `;
    }

    return `
    <div class="ui-card">
        <div class="ui-stack">
          <div class="ui-card__title">${e.title}</div>
          <div class="ui-card__meta">Starts: ${startTime.toLocaleString()}</div>
          <div class="ui-card__meta">${e.description || ""}</div>
          <div class="ui-card__meta">Fee: ${e.amount === 0 ? "Free" : formatPrice(e.amount)}</div>
        </div>
        <div class="ui-stack-2">${actionHtml}</div>
    </div>
    `;
    }).join("");

    modal.innerHTML = `
        <div class="ui-modal" role="dialog" aria-modal="true" aria-labelledby="${modalId}-title" tabindex="-1">
        <h2 id="${modalId}-title" class="ui-modal__title">All Events</h2>
        <div class="ui-form">${listHtml || "<div class='ui-card'><div>No events found</div></div>"}</div>
        <div class="ui-actions">
            <button type="button" class="ui-btn ui-btn--ghost" data-modal-close>Close</button>
        </div>
        </div>
    `;
    document.body.appendChild(modal);

    const shell = modal.querySelector(".ui-modal");
    const closeModal = () => modal.remove();

    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal();

        const btn = e.target.closest("[data-join],[data-goto],[data-copy]");
        if (!btn) return;

        if (btn.hasAttribute("data-join")) {
        unityInstance.SendMessage("NetworkManager", "OnWebGLRegisterEvent", btn.getAttribute("data-join"));
        } else if (btn.hasAttribute("data-goto")) {
        unityInstance.SendMessage("NetworkManager", "OnWebGLGotoEventVenue", btn.getAttribute("data-goto"));
        } else if (btn.hasAttribute("data-copy")) {
        const code = btn.getAttribute("data-copy");
        navigator.clipboard.writeText(code).then(() => {
            TrisonetNotify("Invitation code copied!", "success");
        });
        }
    });

    modal.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
    modal.querySelectorAll("[data-modal-close]").forEach(btn => btn.addEventListener("click", closeModal));
    shell.focus();
}

function formatPrice(amount) {
    return "$" + amount.toFixed(2); // adjust to match AppConfig.Instance.FormatPrice
}

function ShowCopyInvitationModal(code) {
  navigator.clipboard.writeText(code).then(() => {
    TrisonetNotify(`Invitation code copied: ${code}`);
  }).catch(err => {
    console.error('Clipboard copy failed', err);
  });
}

function ShowLoadingModal(message) {
  TrisonetLoading.show("Loading, please wait...");
}

  function CompleteEventRegistration(responseString) {
    const response = JSON.parse(responseString);
    console.log("CompleteEventRegistration called with status:", response);

    const modalId = "createEventModal";
    const existingModal = document.getElementById(modalId);
    TrisonetLoading.hide();
    
    if(response.status == false) {
        TrisonetNotify(response.message, "error");
        return;
    }

    if (existingModal) { 
      console.log("closing existing modal");
      existingModal.remove();
      TrisonetNotify(response.message, "success");
      unityInstance.SendMessage('NetworkManager', 'EnableCaptureAllKeyboardInput');
    }
  }

  // expose public API
  return {
    ShowCreateEventModal,
    ShowEventRegistrationModal,
    ShowAllEventsModal,
    ShowCopyInvitationModal,
    CompleteEventRegistration,
    ShowLoadingModal
  };
})();





// --- Notification Manager ---
(function() {
  // Ensure container exists once
  let container = document.getElementById("ui-toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "ui-toast-container";
    container.style.position = "fixed";
    // container.style.top = "1rem";
    // container.style.right = "1rem";
    container.style.width = "100%";
    container.style.display = "block";
    container.style.margin = "auto";
    container.style.zIndex = 999999999;
    container.style.display = "flex";
    container.style.flexDirection = "column";
    container.style.gap = "0.5rem";
    document.body.appendChild(container);
  }

  window.TrisonetNotify = function(message, type = "info", timeout = 3000) {
    const toast = document.createElement("div");
    toast.className = `ui-toast ui-toast--${type}`;
    toast.innerHTML = `
      <div class="ui-toast__content">${message}</div>
    `;

    // Style (basic, can be replaced with your CSS system)
    toast.style.padding = "0.75rem 1rem";
    toast.style.borderRadius = "0.5rem";
    toast.style.color = "#fff";
    toast.style.fontSize = "0.9rem";
    toast.style.boxShadow = "0 4px 10px rgba(0,0,0,0.15)";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-10px)";
    toast.style.transition = "all 0.3s ease";
    toast.style.zIndex = 9999;

    // Color variants
    const colors = {
      info: "#3b82f6",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b"
    };
    toast.style.background = colors[type] || colors.info;

    // Add + animate in
    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    });

    // Auto-remove after timeout
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-10px)";
      setTimeout(() => toast.remove(), 300);
    }, timeout);
  };
})();

(function() {
  let loadingOverlay = null;

  window.TrisonetLoading = {
    show(message = "Loading...") {
      if (loadingOverlay) return; // prevent duplicates

      loadingOverlay = document.createElement("div");
      loadingOverlay.id = "ui-loading-overlay";
      loadingOverlay.style.position = "fixed";
      loadingOverlay.style.top = "0";
      loadingOverlay.style.left = "0";
      loadingOverlay.style.width = "100%";
      loadingOverlay.style.height = "100%";
      loadingOverlay.style.background = "rgba(0,0,0,0.8)";
      loadingOverlay.style.display = "flex";
      loadingOverlay.style.flexDirection = "column";
      loadingOverlay.style.alignItems = "center";
      loadingOverlay.style.justifyContent = "center";
      loadingOverlay.style.zIndex = "2147483647"; // 🚀 above everything

      // Spinner
      const spinner = document.createElement("div");
      spinner.className = "ui-spinner";
      spinner.style.width = "48px";
      spinner.style.height = "48px";
      spinner.style.border = "4px solid rgba(255,255,255,0.3)";
      spinner.style.borderTop = "4px solid white";
      spinner.style.borderRadius = "50%";
      spinner.style.animation = "spin 1s linear infinite";

      // Label
      const label = document.createElement("div");
      label.textContent = message;
      label.style.color = "white";
      label.style.marginTop = "1rem";
      label.style.fontSize = "1rem";
      label.style.fontWeight = "500";

      loadingOverlay.appendChild(spinner);
      loadingOverlay.appendChild(label);
      document.body.appendChild(loadingOverlay);

      // Inject spin animation (only once)
      if (!document.getElementById("ui-spinner-style")) {
        const style = document.createElement("style");
        style.id = "ui-spinner-style";
        style.textContent = `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }
    },

    hide() {
      if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
      }
    }
  };
})();
