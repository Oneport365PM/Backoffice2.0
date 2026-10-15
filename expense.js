(function () {
  "use strict";

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
    return name.split(/\s+/).map(function (p) { return p.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function naira(n) {
    return "₦" + Math.round(n).toLocaleString("en-NG");
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }

  function formatCommentTime(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) + ", " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }

  // The signed-in approving manager.
  var CURRENT_USER = { name: "Nkechi Mbah", role: "Approving Manager" };

  var shipment = {
    name: "African Circle",
    jobNumber: "ZIKAN26090011",
    budget: 10000000
  };

  // status: "awaiting" (in the approval queue) | "approved" | "rejected"
  var expenses = [
    {
      id: "EXP-26-09-031", po: "PO-26-09-009", vendor: "Lagos Haulage Co.", category: "Trucking",
      quantity: 2, unitAmount: 1800000, reason: "Container haulage from Apapa to warehouse",
      raisedBy: "Temitope Adebiyi", submitted: "2026-09-18", attachment: "haulage-invoice.pdf",
      status: "approved", comments: []
    },
    {
      id: "EXP-26-09-034", po: "PO-26-09-011", vendor: "NPA Terminal", category: "Storage",
      quantity: 1, unitAmount: 3600000, reason: "Demurrage for late container pickup",
      raisedBy: "Temitope Adebiyi", submitted: "2026-09-21", attachment: "npa-storage.pdf",
      status: "approved", comments: []
    },
    {
      id: "EXP-26-09-041", po: "PO-26-09-014", vendor: "Motorways PLC", category: "THC",
      quantity: 1, unitAmount: 4300000, reason: "Terminal handling charges at destination port",
      raisedBy: "Temitope Adebiyi", submitted: "2026-09-25", attachment: "file-sample_150kB.pdf",
      status: "awaiting",
      comments: [
        {
          author: "Temitope Adebiyi", role: "Operations",
          text: "Terminal raised THC rates this month. Motorways is the only approved handler at this terminal, so we can't switch vendors.",
          at: "2026-09-25T10:42:00"
        }
      ]
    },
    {
      id: "EXP-26-09-043", po: "PO-26-09-016", vendor: "Clearwise Agents", category: "Documentation",
      quantity: 1, unitAmount: 150000, reason: "Customs documentation and filing",
      raisedBy: "Ifeanyi Okoro", submitted: "2026-09-26", attachment: "docs-fee.pdf",
      status: "awaiting", comments: []
    }
  ];

  var activeTab = "queue";
  var openExpenseId = null;
  var state = { query: "" };

  // ---------- Budget maths ----------
  function amountOf(e) { return e.quantity * e.unitAmount; }

  function approvedSpend() {
    return expenses.reduce(function (sum, e) { return e.status === "approved" ? sum + amountOf(e) : sum; }, 0);
  }

  // An expense exceeds budget when approving it on top of what's already
  // approved would take the shipment past its budget.
  function overBudgetBy(e) {
    return Math.max(0, approvedSpend() + amountOf(e) - shipment.budget);
  }

  function isOverBudget(e) { return e.status === "awaiting" && overBudgetBy(e) > 0; }

  function managerHasCommented(e) {
    return e.comments.some(function (c) { return c.author === CURRENT_USER.name; });
  }

  // ---------- Elements ----------
  var $ = function (id) { return document.getElementById(id); };
  var listEl = $("expenseList");
  var sheet = $("sheet");
  var backdrop = $("sheetBackdrop");
  var commentInput = $("commentInput");

  // ---------- Header / budget card ----------
  function renderBudget() {
    var spent = approvedSpend();
    var over = spent > shipment.budget;
    var pill = $("budgetPill");
    pill.className = "budget-pill " + (over ? "is-over" : "is-within");
    pill.textContent = over ? "! Over Budget" : "✓ Within Budget";
    var pct = Math.min(100, (spent / shipment.budget) * 100);
    $("budgetMeterFill").style.width = pct + "%";
    $("budgetMeterFill").className = over ? "is-over" : "";
    $("budgetCaption").innerHTML =
      "<span>Approved spend <strong>" + naira(spent) + "</strong></span>" +
      "<span>Budget <strong>" + naira(shipment.budget) + "</strong></span>";
  }

  // ---------- List ----------
  function visibleExpenses() {
    var q = state.query.trim().toLowerCase();
    return expenses.filter(function (e) {
      var inTab = activeTab === "queue" ? e.status === "awaiting" : e.status !== "awaiting";
      if (!inTab) return false;
      if (!q) return true;
      return [e.vendor, e.po, e.id].some(function (v) { return v.toLowerCase().indexOf(q) !== -1; });
    });
  }

  var STATUS_CHIP = {
    awaiting: '<span class="chip chip-warning">Awaiting Approval</span>',
    approved: '<span class="chip chip-success">Approved</span>',
    rejected: '<span class="chip chip-error">Rejected</span>'
  };

  function renderList() {
    $("queueCount").textContent = expenses.filter(function (e) { return e.status === "awaiting"; }).length;
    $("expenseCount").textContent = expenses.filter(function (e) { return e.status !== "awaiting"; }).length;
    $("tabHint").textContent = activeTab === "queue"
      ? "Expense requests on this shipment awaiting your approval. Approving a request sends it straight to Propay as a payable."
      : "Expenses on this shipment that have been approved or rejected.";

    document.querySelectorAll(".tab").forEach(function (t) {
      var on = t.getAttribute("data-tab") === activeTab;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });

    var items = visibleExpenses();
    $("emptyState").hidden = items.length > 0;
    $("emptyText").textContent = state.query ? "No expenses match your search." :
      activeTab === "queue" ? "No expenses awaiting your approval." : "No approved or rejected expenses yet.";

    listEl.innerHTML = items.map(function (e) {
      var flags = "";
      if (isOverBudget(e)) flags += '<span class="chip chip-error">Exceeds budget</span>';
      if (e.comments.length) {
        flags += '<span class="comment-flag"><svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z" /></svg>' + e.comments.length + "</span>";
      }
      return (
        '<li><button class="expense-card" type="button" data-id="' + e.id + '">' +
          '<div class="expense-card-top"><span class="expense-po">' + escapeHtml(e.po) + "</span>" + STATUS_CHIP[e.status] + "</div>" +
          '<div class="expense-vendor">' + escapeHtml(e.vendor) + " · " + escapeHtml(e.category) + "</div>" +
          '<div class="expense-card-bottom"><span class="expense-amount">' + naira(amountOf(e)) + "</span>" +
          '<span class="expense-flags">' + flags + "</span></div>" +
        "</button></li>"
      );
    }).join("");
  }

  // ---------- Sheet ----------
  function findExpense(id) {
    for (var i = 0; i < expenses.length; i++) if (expenses[i].id === id) return expenses[i];
    return null;
  }

  function row(label, valueHtml) {
    return "<div><dt>" + label + "</dt><dd>" + valueHtml + "</dd></div>";
  }

  function renderSheet() {
    var e = findExpense(openExpenseId);
    if (!e) return;
    var over = isOverBudget(e);
    // Comments stay visible on decided expenses that already have a thread,
    // so the approval rationale is kept on record.
    var showComments = over || e.comments.length > 0;

    $("sheetTitle").textContent = e.po;
    $("sheetReason").textContent = e.reason;

    $("overBudget").hidden = !over;
    if (over) {
      var spent = approvedSpend();
      $("budgetGrid").innerHTML =
        row("Shipment budget", naira(shipment.budget)) +
        row("Approved to date", naira(spent)) +
        row("This expense", naira(amountOf(e))) +
        row("Over budget by", '<strong class="over-amount">' + naira(overBudgetBy(e)) + "</strong>");
    }

    $("detailRows").innerHTML =
      row("Vendor", escapeHtml(e.vendor)) +
      row("Category", escapeHtml(e.category)) +
      row("Quantity", e.quantity) +
      row("Unit Amount", naira(e.unitAmount)) +
      row("Amount", "<strong>" + naira(amountOf(e)) + "</strong>") +
      row("Status", STATUS_CHIP[e.status]) +
      row("Raised By", escapeHtml(e.raisedBy)) +
      row("Date Submitted", formatDate(e.submitted)) +
      row("Attachment", '<a class="attachment" href="#" onclick="return false"><svg viewBox="0 0 24 24"><path d="M20 11l-8 8a5 5 0 01-7-7l8-8a3.5 3.5 0 015 5l-8 8a2 2 0 01-3-3l7-7" /></svg><span>' + escapeHtml(e.attachment) + "</span></a>");

    $("comments").hidden = !showComments;
    $("commentForm").hidden = e.status !== "awaiting";
    document.querySelector(".comments-note").hidden = !over;
    renderComments(e);

    var awaiting = e.status === "awaiting";
    var needsComment = over && !managerHasCommented(e);
    $("sheetActions").hidden = !awaiting;
    $("actionHint").hidden = !needsComment;
    $("approveBtn").disabled = needsComment;
    $("rejectBtn").disabled = needsComment;
  }

  function renderComments(e) {
    $("commentCount").textContent = e.comments.length;
    $("commentEmpty").hidden = e.comments.length > 0;
    $("commentList").innerHTML = e.comments.map(function (c) {
      var fill = avatarFillForName(c.author);
      var mine = c.author === CURRENT_USER.name;
      return (
        '<li class="comment' + (mine ? " is-mine" : "") + '">' +
          '<span class="avatar" style="background:' + fill.bg + ";color:" + fill.text + '">' + initials(c.author) + "</span>" +
          '<div class="comment-main">' +
            '<div class="comment-meta"><strong>' + escapeHtml(c.author) + "</strong>" +
              '<span class="comment-role">' + escapeHtml(c.role) + "</span>" +
              '<time datetime="' + c.at + '">' + formatCommentTime(c.at) + "</time></div>" +
            '<p class="comment-text">' + escapeHtml(c.text) + "</p>" +
          "</div>" +
        "</li>"
      );
    }).join("");
  }

  function openSheet(id) {
    openExpenseId = id;
    commentInput.value = "";
    setCommentError("");
    renderSheet();
    backdrop.hidden = false;
    sheet.hidden = false;
    sheet.querySelector(".sheet-body").scrollTop = 0;
    requestAnimationFrame(function () { sheet.classList.add("open"); backdrop.classList.add("open"); });
    $("sheetTitle").setAttribute("tabindex", "-1");
    $("sheetTitle").focus();
  }

  function closeSheet() {
    sheet.classList.remove("open");
    backdrop.classList.remove("open");
    openExpenseId = null;
    setTimeout(function () { sheet.hidden = true; backdrop.hidden = true; }, 200);
  }

  function setCommentError(msg) {
    $("commentHelper").textContent = msg;
    $("commentWrap").classList.toggle("has-error", !!msg);
  }

  function addComment(evt) {
    evt.preventDefault();
    var e = findExpense(openExpenseId);
    var text = commentInput.value.trim();
    if (!text) {
      setCommentError("Write a comment before posting.");
      commentInput.focus();
      return;
    }
    e.comments.push({ author: CURRENT_USER.name, role: CURRENT_USER.role, text: text, at: new Date().toISOString() });
    commentInput.value = "";
    setCommentError("");
    renderSheet();
    renderList();
    var list = $("commentList");
    list.lastElementChild && list.lastElementChild.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function decide(status) {
    var e = findExpense(openExpenseId);
    if (!e || (isOverBudget(e) && !managerHasCommented(e))) return;
    e.status = status;
    closeSheet();
    renderBudget();
    renderList();
    showToast(status === "approved" ? e.po + " approved and sent to Propay." : e.po + " rejected.");
  }

  var toastTimer;
  function showToast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3000);
  }

  // ---------- Events ----------
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () { activeTab = t.getAttribute("data-tab"); renderList(); });
  });
  $("searchInput").addEventListener("input", function (ev) { state.query = ev.target.value; renderList(); });
  listEl.addEventListener("click", function (ev) {
    var card = ev.target.closest(".expense-card");
    if (card) openSheet(card.getAttribute("data-id"));
  });
  backdrop.addEventListener("click", closeSheet);
  document.addEventListener("keydown", function (ev) { if (ev.key === "Escape" && openExpenseId) closeSheet(); });
  $("commentForm").addEventListener("submit", addComment);
  commentInput.addEventListener("input", function () { if (commentInput.value.trim()) setCommentError(""); });
  $("approveBtn").addEventListener("click", function () { decide("approved"); });
  $("rejectBtn").addEventListener("click", function () { decide("rejected"); });

  renderBudget();
  renderList();
})();
