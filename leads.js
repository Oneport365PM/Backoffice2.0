(function () {
  "use strict";

  var STORAGE_KEY = "op365_lead_assignments_v1";

  // Same deterministic 4-fill avatar cycle as app.js
  // (design/DESIGN_SYSTEM.md, "Avatars & owner chips").
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

  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] + ((parts[1] || "")[0] || "")).toUpperCase();
  }

  // The sales team a lead can be assigned to.
  var SALES_TEAM = ["Tobi", "Shewa", "Grace", "Blessing", "Kayode"];

  var LEADS = [
    { id: "lead_01", fullName: "Adaeze Okonkwo", company: "Okonkwo Agro Exports Ltd", address: "14 Creek Road, Apapa, Lagos", phone: "+234 803 412 7781", email: "adaeze@okonkwoagro.ng", country: "Nigeria", shipmentMode: "Ocean Freight", queryType: "Export", shipmentVolume: "2 x 40ft containers", item: "Sesame seeds", heardFrom: "LinkedIn", createdAt: "2026-10-05" },
    { id: "lead_02", fullName: "Tunde Bakare", company: "Bakare Pharma Distributors", address: "Plot 22, Oregun Industrial Estate, Ikeja, Lagos", phone: "+234 806 220 1934", email: "t.bakare@bakarepharma.com", country: "Nigeria", shipmentMode: "Air Freight", queryType: "Import", shipmentVolume: "850 kg", item: "Pharmaceutical supplies", heardFrom: "Google search", createdAt: "2026-10-05" },
    { id: "lead_03", fullName: "Kwame Mensah", company: "Mensah Cocoa Traders", address: "5 Harbour Road, Tema", phone: "+233 24 551 8820", email: "kwame@mensahcocoa.com.gh", country: "Ghana", shipmentMode: "Ocean Freight", queryType: "Export", shipmentVolume: "4 x 20ft containers", item: "Cocoa beans", heardFrom: "Referral", createdAt: "2026-10-04" },
    { id: "lead_04", fullName: "Halima Yusuf", company: "Northern Grains Co.", address: "18 Zoo Road, Kano", phone: "+234 809 773 0452", email: "halima@northerngrains.ng", country: "Nigeria", shipmentMode: "Haulage", queryType: "Import", shipmentVolume: "3 trucks (30 tonnes)", item: "Fertiliser", heardFrom: "Trade event", createdAt: "2026-10-04", assignedTo: "Kayode" },
    { id: "lead_05", fullName: "Chinedu Eze", company: "Ezenwa Auto Parts", address: "Block C, Ladipo Market, Mushin, Lagos", phone: "+234 802 118 6630", email: "chinedu@ezenwaauto.com", country: "Nigeria", shipmentMode: "Ocean Freight", queryType: "Import", shipmentVolume: "1 x 40ft container", item: "Used auto parts", heardFrom: "Instagram", createdAt: "2026-10-03" },
    { id: "lead_06", fullName: "Amara Nwosu", company: "Amara Fashion House", address: "3 Admiralty Way, Lekki Phase 1, Lagos", phone: "+234 816 904 2277", email: "hello@amarafashion.co", country: "Nigeria", shipmentMode: "Air Freight", queryType: "Export", shipmentVolume: "120 kg", item: "Ready-made garments", heardFrom: "Instagram", createdAt: "2026-10-02", assignedTo: "Grace" },
    { id: "lead_07", fullName: "Peter Kamau", company: "Rift Valley Coffee Ltd", address: "Mombasa Road, Nairobi", phone: "+254 722 410 993", email: "peter@riftvalleycoffee.co.ke", country: "Kenya", shipmentMode: "Ocean Freight", queryType: "Export", shipmentVolume: "1 x 20ft container", item: "Green coffee", heardFrom: "Google search", createdAt: "2026-10-01" },
    { id: "lead_08", fullName: "Ifeoma Obi", company: "Obi Solar Solutions", address: "27 Aba Road, Port Harcourt", phone: "+234 805 667 3109", email: "ifeoma@obisolar.ng", country: "Nigeria", shipmentMode: "Ocean Freight", queryType: "Import", shipmentVolume: "2 x 40ft containers", item: "Solar panels & inverters", heardFrom: "Referral", createdAt: "2026-09-30", assignedTo: "Tobi" }
  ];

  // Assignments made in the prototype survive a reload; lead data itself is static.
  function loadAssignments() {
    try {
      var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function saveAssignments() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
    } catch (e) { /* storage unavailable, prototype still works in-memory */ }
  }

  var assignments = loadAssignments();
  var currentLeadId = null;

  function assigneeOf(lead) {
    return assignments[lead.id] || lead.assignedTo || null;
  }

  function leadById(id) {
    for (var i = 0; i < LEADS.length; i++) if (LEADS[i].id === id) return LEADS[i];
    return null;
  }

  // ---------- DOM refs ----------
  var listView = document.getElementById("leadListView");
  var detailView = document.getElementById("leadDetailView");
  var tableBody = document.getElementById("leadTableBody");
  var emptyState = document.getElementById("leadEmptyState");
  var countLabel = document.getElementById("leadCountLabel");
  var searchInput = document.getElementById("leadSearch");
  var assigneeFilter = document.getElementById("leadAssigneeFilter");


  var backBtn = document.getElementById("leadBackBtn");
  var detailAvatar = document.getElementById("leadDetailAvatar");
  var detailName = document.getElementById("leadDetailName");
  var detailCompany = document.getElementById("leadDetailCompany");
  var detailChips = document.getElementById("leadDetailChips");
  var detailList = document.getElementById("leadDetailList");
  var assignCurrent = document.getElementById("leadAssignCurrent");
  var assignSelect = document.getElementById("leadAssignSelect");
  var assignError = document.getElementById("leadAssignError");
  var assignBtn = document.getElementById("leadAssignBtn");
  var toast = document.getElementById("toast");
  var toastTimer = null;

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function avatarHtml(name, extraClass) {
    var fill = avatarFillForName(name);
    return '<span class="owner-avatar' + (extraClass ? " " + extraClass : "") + '" style="background:' + fill.bg + ";color:" + fill.text + '">' + escapeHtml(initials(name)) + "</span>";
  }

  function statusChip(assignee) {
    return assignee
      ? '<span class="status-badge status-Assigned">Assigned</span>'
      : '<span class="status-badge status-Unassigned">Unassigned</span>';
  }

  // ---------- Populate selects ----------
  SALES_TEAM.forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    assigneeFilter.appendChild(opt.cloneNode(true));
    assignSelect.appendChild(opt);
  });

  // ---------- List ----------
  function getFilteredLeads() {
    var q = searchInput.value.trim().toLowerCase();
    var who = assigneeFilter.value;

    return LEADS.filter(function (lead) {
      var assignee = assigneeOf(lead);
      if (who === "unassigned" && assignee) return false;
      if (who !== "all" && who !== "unassigned" && assignee !== who) return false;
      if (q) {
        var haystack = [lead.fullName, lead.company, lead.email, lead.phone, lead.country].join(" ").toLowerCase();
        if (haystack.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderList() {
    var list = getFilteredLeads();
    tableBody.innerHTML = "";
    emptyState.hidden = list.length > 0;

    list.forEach(function (lead) {
      var assignee = assigneeOf(lead);
      var tr = document.createElement("tr");
      tr.dataset.id = lead.id;
      tr.innerHTML =
        '<td class="customer-name">' + escapeHtml(lead.fullName) + "</td>" +
        "<td>" + escapeHtml(lead.company) + "</td>" +
        '<td class="wrap-cell">' + escapeHtml(lead.address) + "</td>" +
        "<td>" + escapeHtml(lead.phone) + "</td>" +
        '<td class="lead-email">' + escapeHtml(lead.email) + "</td>" +
        "<td>" + escapeHtml(lead.country) + "</td>" +
        '<td><span class="meeting-badge">' + escapeHtml(lead.shipmentMode) + "</span></td>" +
        "<td>" + (assignee
          ? '<span class="assignee-chip">' + avatarHtml(assignee) + escapeHtml(assignee) + "</span>"
          : statusChip(null)) + "</td>" +
        '<td class="action-col"><button class="view-btn" data-id="' + lead.id + '">View</button></td>';
      tableBody.appendChild(tr);
    });

    countLabel.innerHTML = "Showing <strong>" + list.length + "</strong> of " + LEADS.length + " leads";
  }

  // ---------- View page ----------
  function detailItem(label, value, full) {
    return '<div class="detail-item' + (full ? " full" : "") + '"><dt>' + label + "</dt><dd>" + value + "</dd></div>";
  }

  function renderAssignPanel(lead) {
    var assignee = assigneeOf(lead);
    if (assignee) {
      assignCurrent.className = "assign-current";
      assignCurrent.innerHTML = avatarHtml(assignee) +
        '<div><div class="assign-current-name">' + escapeHtml(assignee) + '</div><div class="assign-current-role">Sales team · current owner</div></div>';
      assignBtn.textContent = "Reassign lead";
    } else {
      assignCurrent.className = "assign-current is-empty";
      assignCurrent.innerHTML = '<span class="owner-avatar">?</span>' +
        '<div><div class="assign-current-name">Unassigned</div><div class="assign-current-role">No sales team member yet</div></div>';
      assignBtn.textContent = "Assign lead";
    }
    assignSelect.value = assignee || "";
    setAssignError(false);
  }

  function openLead(id) {
    var lead = leadById(id);
    if (!lead) return;
    currentLeadId = id;

    var fill = avatarFillForName(lead.fullName);
    detailAvatar.style.background = fill.bg;
    detailAvatar.style.color = fill.text;
    // A dark-green avatar would vanish on the dark hero; use lime-on-green inverse there.
    if (fill.bg === AVATAR_FILLS[0].bg) {
      detailAvatar.style.background = AVATAR_FILLS[1].bg;
      detailAvatar.style.color = AVATAR_FILLS[1].text;
    }
    detailAvatar.textContent = initials(lead.fullName);
    detailName.textContent = lead.fullName;
    detailCompany.textContent = lead.company + " · Lead received " + formatDate(lead.createdAt);
    detailChips.innerHTML = '<span class="meeting-badge">' + escapeHtml(lead.shipmentMode) + "</span>" + statusChip(assigneeOf(lead));

    detailList.innerHTML =
      detailItem("Customer full name", escapeHtml(lead.fullName)) +
      detailItem("Company name", escapeHtml(lead.company)) +
      detailItem("Company address", escapeHtml(lead.address), true) +
      detailItem("Phone number", '<a href="tel:' + escapeHtml(lead.phone.replace(/\s+/g, "")) + '">' + escapeHtml(lead.phone) + "</a>") +
      detailItem("Email", '<a href="mailto:' + escapeHtml(lead.email) + '">' + escapeHtml(lead.email) + "</a>") +
      detailItem("Country", escapeHtml(lead.country)) +
      detailItem("Shipment mode", escapeHtml(lead.shipmentMode)) +
      detailItem("Query type", escapeHtml(lead.queryType)) +
      detailItem("Shipment volume", escapeHtml(lead.shipmentVolume)) +
      detailItem("Import / exporting item", escapeHtml(lead.item)) +
      detailItem("Heard about us from", escapeHtml(lead.heardFrom));

    renderAssignPanel(lead);
    listView.hidden = true;
    detailView.hidden = false;
    window.scrollTo(0, 0);
  }

  function closeLead() {
    currentLeadId = null;
    detailView.hidden = true;
    listView.hidden = false;
    renderList();
  }

  function setAssignError(on) {
    assignError.hidden = !on;
    assignSelect.closest(".op-input-wrap").classList.toggle("has-error", on);
  }

  function formatDate(iso) {
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }

  // ---------- Events ----------
  tableBody.addEventListener("click", function (e) {
    var row = e.target.closest("tr[data-id]");
    if (row) openLead(row.dataset.id);
  });

  backBtn.addEventListener("click", closeLead);

  assignSelect.addEventListener("change", function () {
    if (assignSelect.value) setAssignError(false);
  });

  assignBtn.addEventListener("click", function () {
    var lead = leadById(currentLeadId);
    if (!lead) return;
    var who = assignSelect.value;
    if (!who) {
      setAssignError(true);
      assignSelect.focus();
      return;
    }
    if (who === assigneeOf(lead)) {
      showToast("Lead is already assigned to " + who);
      return;
    }
    assignments[lead.id] = who;
    saveAssignments();
    openLead(lead.id);
    showToast("Lead assigned to " + who);
  });

  // Clicking the Lead tab always returns to the lead list.
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.dataset.tab === "lead" && currentLeadId) closeLead();
    });
  });

  searchInput.addEventListener("input", renderList);
  assigneeFilter.addEventListener("change", renderList);

  renderList();
})();
