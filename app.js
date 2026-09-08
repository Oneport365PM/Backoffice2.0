(function () {
  "use strict";

  var STORAGE_KEY = "op365_activity_log_prototype_v1";

  // Avatar fills cycle deterministically through the 4 OnePort 365 brand
  // fills (design/DESIGN_SYSTEM.md, "Avatars & owner chips") — never a
  // random or per-developer color.
  var AVATAR_FILLS = [
    { bg: "var(--op-avatar-1-bg)", text: "var(--op-avatar-1-text)" },
    { bg: "var(--op-avatar-2-bg)", text: "var(--op-avatar-2-text)" },
    { bg: "var(--op-avatar-3-bg)", text: "var(--op-avatar-3-text)" },
    { bg: "var(--op-avatar-4-bg)", text: "var(--op-avatar-4-text)" }
  ];

  function avatarFillForName(name) {
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_FILLS[hash % AVATAR_FILLS.length];
  }

  var REPS = [
    { id: "michael", name: "Michael Adeyemi", initials: "MI" },
    { id: "sarah", name: "Sarah Adamu", initials: "SA" },
    { id: "james", name: "James Okafor", initials: "JA" },
    { id: "kayode", name: "Kayode Akintade", initials: "KA" },
    { id: "deborah", name: "Deborah Oje", initials: "DO" }
  ];

  var COMPANIES = [
    "Dangote Industries", "Flour Mills of Nigeria", "Honeywell Group", "MTN Nigeria",
    "Srtc exim ltd", "Tamrose limited", "Quest hill", "Bioscape commodities afri...",
    "Autochek", "Alliance chemicals", "Powerpro"
  ];

  var MEETING_TYPE_LABELS = {
    "Call": "Call Purpose",
    "Email": "Email Subject",
    "In-Person Meeting": "Meeting Purpose",
    "TBD": "Purpose"
  };

  var MEETING_TYPE_PLACEHOLDERS = {
    "Call": "What is this call about",
    "Email": "What is this email about",
    "In-Person Meeting": "What is this meeting about",
    "TBD": "What is this activity about"
  };

  function repById(id) {
    for (var i = 0; i < REPS.length; i++) if (REPS[i].id === id) return REPS[i];
    return null;
  }

  function seedData() {
    return [
      { id: uid(), customer: "Dangote Industries", date: "2026-07-28", time: "10:00", ownerId: "michael", meetingType: "Call", purpose: "Contract Review", duration: 30, notes: "Walk through renewal terms before signature.", status: "Scheduled" },
      { id: uid(), customer: "Flour Mills of Nigeria", date: "2026-07-29", time: "14:30", ownerId: "sarah", meetingType: "Call", purpose: "Discovery Call", duration: 20, notes: "First call to understand procurement needs.", status: "Scheduled" },
      { id: uid(), customer: "Honeywell Group", date: "2026-07-22", time: "11:00", ownerId: "james", meetingType: "In-Person Meeting", purpose: "Onboarding", duration: 60, notes: "Kickoff and onboarding walkthrough on-site.", status: "Completed" },
      { id: uid(), customer: "MTN Nigeria", date: "2026-07-18", time: "09:00", ownerId: "james", meetingType: "In-Person Meeting", purpose: "Site Visit", duration: 45, notes: "Site visit rescheduled by client, then cancelled.", status: "Cancelled" }
    ];
  }

  function uid() {
    return "act_" + Math.random().toString(36).slice(2, 10);
  }

  function loadActivities() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return seedData();
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || !parsed.length) return seedData();
      return parsed;
    } catch (e) {
      return seedData();
    }
  }

  function saveActivities() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
    } catch (e) { /* storage unavailable, prototype still works in-memory */ }
  }

  var activities = loadActivities();
  var editingId = null;

  // ---------- DOM refs ----------
  var tabButtons = document.querySelectorAll(".tab-btn");
  var tabPanels = document.querySelectorAll(".tab-panel");

  var tableBody = document.getElementById("activityTableBody");
  var emptyState = document.getElementById("tableEmptyState");
  var countLabel = document.getElementById("activityCountLabel");
  var searchInput = document.getElementById("activitySearch");
  var repFilter = document.getElementById("repFilter");
  var statusFilter = document.getElementById("statusFilter");
  var resetDataBtn = document.getElementById("resetDataBtn");

  var overlay = document.getElementById("activityModalOverlay");
  var form = document.getElementById("activityForm");
  var modalTitle = document.getElementById("modalTitle");
  var modalSubtitle = document.getElementById("modalSubtitle");
  var openAddBtn = document.getElementById("openAddActivity");
  var closeModalBtn = document.getElementById("closeModalBtn");
  var cancelModalBtn = document.getElementById("cancelModalBtn");
  var deleteBtn = document.getElementById("deleteActivityBtn");
  var statusFieldWrap = document.getElementById("statusFieldWrap");

  var fCustomer = document.getElementById("fCustomer");
  var companyList = document.getElementById("companyList");
  var fMeetingType = document.getElementById("fMeetingType");
  var fPurposeLabel = document.getElementById("fPurposeLabel");
  var fPurpose = document.getElementById("fPurpose");
  var fDate = document.getElementById("fDate");
  var fTime = document.getElementById("fTime");
  var fDuration = document.getElementById("fDuration");
  var fOwner = document.getElementById("fOwner");
  var fStatus = document.getElementById("fStatus");
  var fNotes = document.getElementById("fNotes");

  var toast = document.getElementById("toast");
  var toastTimer = null;

  // ---------- Tabs ----------
  tabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      tabButtons.forEach(function (b) { b.classList.remove("active"); });
      tabPanels.forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("panel-" + btn.dataset.tab).classList.add("active");
    });
  });

  // ---------- Populate static selects ----------
  function populateReps() {
    REPS.forEach(function (rep) {
      var opt = document.createElement("option");
      opt.value = rep.id;
      opt.textContent = rep.name;
      repFilter.appendChild(opt.cloneNode(true));
      fOwner.appendChild(opt);
    });
  }

  function populateCompanies() {
    COMPANIES.forEach(function (name) {
      var opt = document.createElement("option");
      opt.value = name;
      companyList.appendChild(opt);
    });
  }

  // ---------- Rendering ----------
  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatTime(t) {
    var parts = t.split(":");
    var h = parseInt(parts[0], 10);
    var m = parts[1];
    var suffix = h >= 12 ? "PM" : "AM";
    var h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ":" + m + " " + suffix;
  }

  function getFilteredActivities() {
    var q = searchInput.value.trim().toLowerCase();
    var rep = repFilter.value;
    var status = statusFilter.value;

    return activities.filter(function (a) {
      if (rep !== "all" && a.ownerId !== rep) return false;
      if (status !== "all" && a.status !== status) return false;
      if (q) {
        var owner = repById(a.ownerId);
        var haystack = [a.customer, owner ? owner.name : "", a.meetingType, a.purpose].join(" ").toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) {
      return (b.date + b.time).localeCompare(a.date + a.time);
    });
  }

  function render() {
    var list = getFilteredActivities();
    tableBody.innerHTML = "";

    if (!list.length) {
      emptyState.hidden = false;
      emptyState.textContent = activities.length
        ? "No activity matches your search or filters."
        : "No activity logged yet — click “Add activity” to log the first one.";
    } else {
      emptyState.hidden = true;
    }

    list.forEach(function (a) {
      var owner = repById(a.ownerId);
      var fill = avatarFillForName(owner ? owner.name : "Unassigned");
      var tr = document.createElement("tr");

      tr.innerHTML =
        '<td class="customer-name">' + escapeHtml(a.customer) + "</td>" +
        "<td>" + formatDate(a.date) + "</td>" +
        "<td>" + formatTime(a.time) + "</td>" +
        '<td><div class="owner-cell"><span class="owner-avatar" style="background:' + fill.bg + ";color:" + fill.text + '">' + (owner ? owner.initials : "?") + "</span>" + (owner ? owner.name : "Unassigned") + "</div></td>" +
        '<td><span class="meeting-badge">' + escapeHtml(a.meetingType) + (a.purpose ? " · " + escapeHtml(a.purpose) : "") + "</span></td>" +
        '<td><span class="status-badge status-' + a.status + '">' + a.status + "</span></td>" +
        '<td class="action-col"><button class="view-edit-btn" data-id="' + a.id + '">View / Edit</button></td>';

      tableBody.appendChild(tr);
    });

    var total = activities.length;
    var shown = list.length;
    countLabel.textContent = repFilter.value === "all"
      ? "Showing " + shown + " of " + total + " activities"
      : "Showing " + shown + " of " + total + " activities for " + (repById(repFilter.value) || {}).name;
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  // ---------- Modal ----------
  function openModal(mode, activity) {
    form.reset();
    editingId = null;

    if (mode === "add") {
      modalTitle.textContent = "Add Activity";
      modalSubtitle.textContent = "Enter the details below to add a new activity";
      statusFieldWrap.hidden = true;
      deleteBtn.hidden = true;
      fMeetingType.value = "Call";
      fOwner.value = REPS[0].id;
      updatePurposeLabel();
      var today = new Date();
      fDate.value = today.toISOString().slice(0, 10);
    } else {
      editingId = activity.id;
      modalTitle.textContent = "View / Edit Activity";
      modalSubtitle.textContent = "Update the details or change the status of this activity";
      statusFieldWrap.hidden = false;
      deleteBtn.hidden = false;

      fCustomer.value = activity.customer;
      fMeetingType.value = activity.meetingType;
      updatePurposeLabel();
      fPurpose.value = activity.purpose || "";
      fDate.value = activity.date;
      fTime.value = activity.time;
      fDuration.value = activity.duration || "";
      fOwner.value = activity.ownerId;
      fStatus.value = activity.status;
      fNotes.value = activity.notes || "";
    }

    overlay.hidden = false;
  }

  function closeModal() {
    overlay.hidden = true;
    editingId = null;
  }

  function updatePurposeLabel() {
    var type = fMeetingType.value;
    var label = MEETING_TYPE_LABELS[type] || "Purpose";
    fPurposeLabel.innerHTML = label + ' <span class="req">*</span>';
    fPurpose.placeholder = MEETING_TYPE_PLACEHOLDERS[type] || "What is this about";
  }

  fMeetingType.addEventListener("change", updatePurposeLabel);

  openAddBtn.addEventListener("click", function () { openModal("add"); });
  closeModalBtn.addEventListener("click", closeModal);
  cancelModalBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !overlay.hidden) closeModal();
  });

  tableBody.addEventListener("click", function (e) {
    var btn = e.target.closest(".view-edit-btn");
    if (!btn) return;
    var activity = activities.find(function (a) { return a.id === btn.dataset.id; });
    if (activity) openModal("edit", activity);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var payload = {
      customer: fCustomer.value.trim(),
      meetingType: fMeetingType.value,
      purpose: fPurpose.value.trim(),
      date: fDate.value,
      time: fTime.value,
      duration: fDuration.value ? parseInt(fDuration.value, 10) : null,
      ownerId: fOwner.value,
      notes: fNotes.value.trim(),
      status: editingId ? fStatus.value : "Scheduled"
    };

    if (editingId) {
      var idx = activities.findIndex(function (a) { return a.id === editingId; });
      if (idx !== -1) activities[idx] = Object.assign({}, activities[idx], payload);
      showToast("Activity updated");
    } else {
      payload.id = uid();
      activities.push(payload);
      showToast("Activity logged");
    }

    saveActivities();
    render();
    closeModal();
  });

  deleteBtn.addEventListener("click", function () {
    if (!editingId) return;
    activities = activities.filter(function (a) { return a.id !== editingId; });
    saveActivities();
    render();
    closeModal();
    showToast("Activity removed");
  });

  // ---------- Toolbar ----------
  searchInput.addEventListener("input", render);
  repFilter.addEventListener("change", render);
  statusFilter.addEventListener("change", render);

  resetDataBtn.addEventListener("click", function () {
    activities = seedData();
    saveActivities();
    searchInput.value = "";
    repFilter.value = "all";
    statusFilter.value = "all";
    render();
    showToast("Demo data reset");
  });

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }

  // ---------- Init ----------
  populateReps();
  populateCompanies();
  render();
})();
