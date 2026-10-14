(function () {
  "use strict";

  // ProPay — centralised payment tracking. Lives in its own sidebar module
  // next to CRM. Routes are hash based so the clickthrough behaves like
  // real navigation (back button, shareable links):
  //   #crm                      CRM module (activity log prototype)
  //   #propay                   ProPay register
  //   #propay/shipment/<id>     Shipment detail page

  var STORAGE_KEY = "op365_propay_prototype_v1";

  var CURRENT_USER = { name: "Nkechi M.", initials: "NK", role: "Finance" };

  var STATUSES = ["Awaiting approval", "Approved", "Part paid", "Paid", "Rejected"];
  var STATUS_CLASS = {
    "Awaiting approval": "pp-st-awaiting",
    "Approved": "pp-st-approved",
    "Part paid": "pp-st-part",
    "Paid": "pp-st-paid",
    "Rejected": "pp-st-rejected"
  };

  var SHIPMENTS = {
    "ZIL0312": { id: "ZIL0312", customer: "Dangote Industries", mode: "Ocean Freight", route: "Shanghai → Apapa, Lagos", container: "2 × 40ft HC", eta: "2026-10-22", quoteRef: "QT-26-0918", stage: "In transit" },
    "ZIL0298": { id: "ZIL0298", customer: "Flour Mills of Nigeria", mode: "Ocean Freight", route: "Antwerp → Tin Can, Lagos", container: "1 × 20ft", eta: "2026-10-09", quoteRef: "QT-26-0874", stage: "Clearing" },
    "ZIL0305": { id: "ZIL0305", customer: "Honeywell Group", mode: "Air Freight", route: "Dubai → Lagos (LOS)", container: "1,240 kg", eta: "2026-10-12", quoteRef: "QT-26-0901", stage: "Delivered" },
    "ZIL0321": { id: "ZIL0321", customer: "MTN Nigeria", mode: "Ocean Freight", route: "Mersin → Onne, Rivers", container: "3 × 40ft", eta: "2026-11-02", quoteRef: "QT-26-0933", stage: "Booked" }
  };

  function seedData() {
    return [
      { id: "PO-26-10-045", type: "payable", party: "Olgai Health Care", category: "Terminal charges", shipmentId: "ZIL0312", actual: 1450000, budget: 1200000, sell: 1680000, status: "Awaiting approval", attachment: "terminal-invoice-045.pdf",
        comments: [{ author: "Tunde Bello", role: "Operations", text: "Terminal raised storage after vessel delay — 4 extra days.", at: "2026-10-10T09:12" }], payments: [] },
      { id: "PO-26-10-047", type: "payable", party: "BOD Oneport", category: "THC", shipmentId: "ZIL0312", actual: 3000, budget: 3200, sell: 4500, status: "Approved", attachment: "thc-bod-047.pdf", comments: [], payments: [] },
      { id: "PO-26-10-041", type: "payable", party: "Bindle by Desmit", category: "Haulage", shipmentId: "ZIL0298", actual: 820000, budget: 900000, sell: 1150000, status: "Approved", attachment: null, comments: [], payments: [] },
      { id: "PO-26-10-040", type: "payable", party: "Bob's Burger Joint", category: "Clearance", shipmentId: "ZIL0298", actual: 495000, budget: 500000, sell: 640000, status: "Part paid", attachment: "clearance-040.pdf", comments: [],
        payments: [{ amount: 250000, kind: "Partial", at: "2026-10-08", by: "Nkechi M." }] },
      { id: "PO-26-10-053", type: "payable", party: "Maersk Nigeria Ltd", category: "Shipping line", shipmentId: "ZIL0305", actual: 4800000, budget: 4200000, sell: 5600000, status: "Approved", attachment: "maersk-do-053.pdf",
        comments: [{ author: "Ada Okoro", role: "Operations", text: "Demurrage applied — consignee docs arrived late.", at: "2026-10-11T15:40" }], payments: [] },
      { id: "PO-26-10-052", type: "payable", party: "Mainstream Haulage", category: "Haulage", shipmentId: "ZIL0305", actual: 610000, budget: 650000, sell: 780000, status: "Paid", attachment: "haulage-052.pdf", comments: [],
        payments: [{ amount: 610000, kind: "Full", at: "2026-10-13", by: "Nkechi M." }] },
      { id: "PO-26-10-058", type: "payable", party: "Nigeria Customs Service", category: "Customs duty", shipmentId: "ZIL0321", actual: 2350000, budget: 2350000, sell: 2350000, status: "Awaiting approval", attachment: null, comments: [], payments: [] },
      { id: "INV-26-10-118", type: "receivable", party: "Dangote Industries", category: "Freight invoice", shipmentId: "ZIL0312", actual: 7900000, budget: null, sell: 7900000, status: "Approved", attachment: "inv-118.pdf", comments: [], payments: [] },
      { id: "INV-26-10-112", type: "receivable", party: "Honeywell Group", category: "Freight invoice", shipmentId: "ZIL0305", actual: 6380000, budget: null, sell: 6380000, status: "Part paid", attachment: "inv-112.pdf", comments: [],
        payments: [{ amount: 3000000, kind: "Partial", at: "2026-10-12", by: "Nkechi M." }] }
    ];
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : null;
      if (Array.isArray(parsed) && parsed.length) return parsed;
    } catch (e) { /* fall through to seed */ }
    return seedData();
  }

  function save() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); } catch (e) { /* in-memory only */ }
  }

  var records = load();

  var state = {
    type: "all",        // all | payable | receivable
    status: "all",
    search: "",
    filterOpen: false,
    drawerId: null,
    commentsId: null,
    replyTo: null
  };

  // ---------- Helpers ----------
  var naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });
  function money(n) { return n == null ? "—" : naira.format(n); }

  function esc(str) {
    var div = document.createElement("div");
    div.textContent = String(str == null ? "" : str);
    return div.innerHTML;
  }

  function byId(id) {
    for (var i = 0; i < records.length; i++) if (records[i].id === id) return records[i];
    return null;
  }

  function paidTotal(r) {
    return r.payments.reduce(function (s, p) { return s + p.amount; }, 0);
  }

  function outstanding(r) { return Math.max(0, r.actual - paidTotal(r)); }

  function overBudget(r) {
    return r.type === "payable" && r.budget != null && r.actual > r.budget;
  }

  function budgetCheckHtml(r) {
    if (r.type !== "payable" || r.budget == null) return '<span class="pp-muted">—</span>';
    if (overBudget(r)) return '<span class="pp-chip pp-chip-error">▲ Exceeds by ' + money(r.actual - r.budget) + "</span>";
    return '<span class="pp-chip pp-chip-success">✓ Within budget</span>';
  }

  function statusHtml(status) {
    return '<span class="status-badge ' + STATUS_CLASS[status] + '">' + esc(status) + "</span>";
  }

  function formatDate(iso) {
    var d = new Date(iso.length > 10 ? iso : iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function formatDateTime(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " +
      d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }

  function partyLabel() {
    if (state.type === "payable") return "Vendor";
    if (state.type === "receivable") return "Customer";
    return "Vendor / Customer";
  }

  function toast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(function () { el.hidden = true; }, 2200);
  }

  // ---------- Module routing ----------
  var moduleEls = {
    crm: document.getElementById("module-crm"),
    propay: document.getElementById("module-propay")
  };
  var root = moduleEls.propay;
  var topbarTitle = document.getElementById("topbarTitle");

  function route() {
    var hash = location.hash.replace(/^#/, "");
    var parts = hash.split("/");
    var mod = parts[0] === "propay" ? "propay" : "crm";

    Object.keys(moduleEls).forEach(function (k) { moduleEls[k].classList.toggle("active", k === mod); });
    document.querySelectorAll(".sidebar-icon[data-module]").forEach(function (a) {
      var on = a.dataset.module === mod;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    topbarTitle.textContent = mod === "propay" ? "ProPay" : "CRM";

    if (mod !== "propay") return;
    if (parts[1] === "shipment" && SHIPMENTS[parts[2]]) renderShipment(parts[2]);
    else renderRegister();
    window.scrollTo(0, 0);
  }

  // ---------- Register (main ProPay page) ----------
  function filtered() {
    var q = state.search.trim().toLowerCase();
    return records.filter(function (r) {
      if (state.type !== "all" && r.type !== state.type) return false;
      if (state.status !== "all" && r.status !== state.status) return false;
      if (q) {
        var hay = [r.id, r.party, r.category, r.shipmentId].join(" ").toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function statsHtml() {
    var payables = records.filter(function (r) { return r.type === "payable" && r.status !== "Rejected"; });
    var receivables = records.filter(function (r) { return r.type === "receivable"; });
    var payOut = payables.reduce(function (s, r) { return s + outstanding(r); }, 0);
    var recOut = receivables.reduce(function (s, r) { return s + outstanding(r); }, 0);
    var over = payables.filter(overBudget);
    var awaiting = records.filter(function (r) { return r.status === "Awaiting approval"; }).length;
    return '<div class="stat-cards pp-stats">' +
      '<div class="stat-card highlight"><div class="stat-label">Payables outstanding</div><div class="stat-value">' + money(payOut) + '</div><div class="stat-sub">' + payables.filter(function (r) { return outstanding(r) > 0; }).length + " open payables</div></div>" +
      '<div class="stat-card"><div class="stat-label">Receivables outstanding</div><div class="stat-value gold">' + money(recOut) + '</div><div class="stat-sub">' + receivables.filter(function (r) { return outstanding(r) > 0; }).length + " open invoices</div></div>" +
      '<div class="stat-card"><div class="stat-label">Over budget</div><div class="stat-value">' + over.length + '</div><div class="stat-sub">' + awaiting + " awaiting approval</div></div>" +
      "</div>";
  }

  function renderRegister() {
    var list = filtered();
    var typeChips = [["all", "All"], ["payable", "Payables"], ["receivable", "Receivables"]].map(function (t) {
      return '<button type="button" class="pp-seg' + (state.type === t[0] ? " active" : "") + '" data-type="' + t[0] + '" aria-pressed="' + (state.type === t[0]) + '">' + t[1] + "</button>";
    }).join("");

    var statusOptions = ["all"].concat(STATUSES).map(function (s) {
      var label = s === "all" ? "All statuses" : s;
      return '<button type="button" class="pp-filter-opt' + (state.status === s ? " active" : "") + '" data-status="' + esc(s) + '">' + esc(label) + "</button>";
    }).join("");

    var rows = list.map(function (r) {
      var ship = SHIPMENTS[r.shipmentId];
      var commentCount = r.comments.length;
      var needsNote = overBudget(r) && r.status !== "Awaiting approval" && r.status !== "Rejected" && !r.comments.some(function (c) { return c.role === "Finance"; });
      return "<tr>" +
        '<td class="pp-po">' + esc(r.id) + "</td>" +
        '<td class="customer-name">' + esc(r.party) + "</td>" +
        '<td><span class="meeting-badge">' + esc(r.category) + "</span></td>" +
        '<td><a class="pp-link" href="#propay/shipment/' + encodeURIComponent(r.shipmentId) + '" title="Open shipment ' + esc(r.shipmentId) + (ship ? " — " + esc(ship.customer) : "") + '">' + esc(r.shipmentId) + "</a></td>" +
        '<td class="pp-num"><div class="pp-amount">' + money(r.actual) + "</div>" +
          (r.type === "payable" ? '<div class="pp-sub">Budget ' + money(r.budget) + "</div>" : '<div class="pp-sub">Invoice</div>') + "</td>" +
        "<td>" + budgetCheckHtml(r) + "</td>" +
        '<td class="pp-num">' + money(r.sell) + "</td>" +
        "<td>" + statusHtml(r.status) + "</td>" +
        '<td class="pp-icons">' +
          '<button type="button" class="pp-icon-btn' + (needsNote ? " attention" : "") + '" data-comments="' + esc(r.id) + '" aria-label="Comments on ' + esc(r.id) + " (" + commentCount + ')" title="' + (needsNote ? "Over budget — add a finance note" : "Add or view comments") + '">' +
            '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4V5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>' +
            (commentCount ? '<span class="pp-count">' + commentCount + "</span>" : "") +
          "</button>" +
          (r.attachment ? '<span class="pp-clip" title="' + esc(r.attachment) + '" aria-label="Attachment: ' + esc(r.attachment) + '"><svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.3 3.3 0 014.7 4.7L9.7 17.2a1.7 1.7 0 01-2.4-2.4L15 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></span>' : "") +
        "</td>" +
        '<td class="action-col"><button type="button" class="view-btn" data-more="' + esc(r.id) + '">View more</button></td>' +
        "</tr>";
    }).join("");

    root.innerHTML =
      '<div class="activity-header">' +
        "<div><p class=\"pp-eyebrow\">Centralised payment tracking</p><h2>ProPay</h2>" +
        '<p class="muted">Showing ' + list.length + " of " + records.length + " records</p></div>" +
      "</div>" +
      statsHtml() +
      '<div class="activity-toolbar">' +
        '<input type="search" id="ppSearch" class="search-input" placeholder="Search PO #, vendor, category or shipment #..." value="' + esc(state.search) + '" />' +
        '<div class="pp-segmented" role="group" aria-label="Record type">' + typeChips + "</div>" +
        '<div class="pp-filter">' +
          '<button type="button" class="pp-filter-btn' + (state.status !== "all" ? " is-on" : "") + '" id="ppFilterBtn" aria-expanded="' + state.filterOpen + '" aria-label="Filter by status">' +
            '<svg viewBox="0 0 24 24"><path d="M4 5h16l-6 8v5l-4 2v-7L4 5z" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>' +
            "<span>" + (state.status === "all" ? "Status" : esc(state.status)) + "</span>" +
          "</button>" +
          '<div class="pp-filter-pop" ' + (state.filterOpen ? "" : "hidden") + '><p class="pp-pop-label">Filter by status</p>' + statusOptions + "</div>" +
        "</div>" +
      "</div>" +
      '<div class="table-wrap"><table class="activity-table pp-table">' +
        "<thead><tr><th>PO #</th><th>" + partyLabel() + "</th><th>Category</th><th>Shipment #</th><th>Amount</th><th>Budget check</th><th>Sell price</th><th>Status</th><th><span class=\"sr-only\">Comments and attachments</span></th><th class=\"action-col\">Action</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table>" +
        (list.length ? "" : '<div class="table-empty">No records match your search or filters.</div>') +
      "</div>";

    var search = document.getElementById("ppSearch");
    search.addEventListener("input", function () {
      state.search = search.value;
      var pos = search.selectionStart;
      renderRegister();
      var again = document.getElementById("ppSearch");
      again.focus();
      again.setSelectionRange(pos, pos);
    });
  }

  // ---------- Shipment detail page ----------
  function renderShipment(id) {
    var s = SHIPMENTS[id];
    var lines = records.filter(function (r) { return r.shipmentId === id; });
    var payables = lines.filter(function (r) { return r.type === "payable"; });
    var budget = payables.reduce(function (t, r) { return t + (r.budget || 0); }, 0);
    var actual = payables.reduce(function (t, r) { return t + r.actual; }, 0);
    var sell = payables.reduce(function (t, r) { return t + (r.sell || 0); }, 0);
    var margin = sell - actual;

    var rows = lines.map(function (r) {
      return "<tr>" +
        '<td class="pp-po">' + esc(r.id) + "</td>" +
        '<td class="customer-name">' + esc(r.party) + "</td>" +
        '<td><span class="meeting-badge">' + esc(r.category) + "</span></td>" +
        '<td class="pp-num">' + money(r.actual) + "</td>" +
        "<td>" + budgetCheckHtml(r) + "</td>" +
        '<td class="pp-num">' + money(r.sell) + "</td>" +
        "<td>" + statusHtml(r.status) + "</td>" +
        '<td class="action-col"><button type="button" class="view-btn" data-more="' + esc(r.id) + '">View more</button></td>' +
        "</tr>";
    }).join("");

    root.innerHTML =
      '<nav class="pp-crumbs" aria-label="Breadcrumb"><a class="pp-link" href="#propay">ProPay</a><span aria-hidden="true">/</span><span>Shipment ' + esc(s.id) + "</span></nav>" +
      '<div class="activity-header"><div><p class="pp-eyebrow">Shipment detail</p><h2>' + esc(s.id) + '</h2><p class="muted">' + esc(s.customer) + " · " + esc(s.route) + "</p></div>" +
        '<a class="btn btn-outline pp-back" href="#propay">← Back to ProPay</a></div>' +
      '<div class="pp-ship-grid">' +
        '<section class="pp-card"><p class="pp-eyebrow">Shipment</p><dl class="pp-dl">' +
          "<dt>Customer</dt><dd>" + esc(s.customer) + "</dd>" +
          '<dt>Mode</dt><dd><span class="meeting-badge">' + esc(s.mode) + "</span></dd>" +
          "<dt>Route</dt><dd>" + esc(s.route) + "</dd>" +
          "<dt>Load</dt><dd>" + esc(s.container) + "</dd>" +
          "<dt>ETA</dt><dd>" + formatDate(s.eta) + "</dd>" +
          "<dt>Quote ref</dt><dd>" + esc(s.quoteRef) + "</dd>" +
          '<dt>Stage</dt><dd><span class="status-badge pp-st-approved">' + esc(s.stage) + "</span></dd>" +
        "</dl></section>" +
        '<section class="pp-card"><p class="pp-eyebrow">Cost vs. sell (payables)</p>' + compareChart(sell, budget, actual) +
          '<p class="pp-margin">Margin <strong class="' + (margin < 0 ? "pp-neg" : "") + '">' + money(margin) + "</strong>" +
          (sell ? ' <span class="pp-muted">(' + Math.round(margin / sell * 100) + "% of sell)</span>" : "") + "</p></section>" +
      "</div>" +
      '<h3 class="pp-h3">Payment lines on this shipment</h3>' +
      '<div class="table-wrap"><table class="activity-table pp-table">' +
        "<thead><tr><th>PO #</th><th>Vendor / Customer</th><th>Category</th><th>Amount</th><th>Budget check</th><th>Sell price</th><th>Status</th><th class=\"action-col\">Action</th></tr></thead>" +
        "<tbody>" + rows + "</tbody></table></div>";
  }

  // Horizontal bars: sell price (markup to customer), budgeted cost (from
  // quote), actual cost spent. Colours come from the categorical series;
  // actual cost turns error-red only when it is over budget.
  function compareChart(sell, budget, actual) {
    var bars = [
      { label: "Sell price", value: sell, color: "var(--op-cat-1)" },
      { label: "Budgeted cost", value: budget, color: "var(--op-cat-3)" },
      { label: "Actual cost", value: actual, color: budget != null && actual > budget ? "var(--op-error)" : "var(--op-cat-5)" }
    ];
    var max = Math.max.apply(null, bars.map(function (b) { return b.value || 0; })) || 1;
    return '<div class="pp-chart" role="img" aria-label="' + bars.map(function (b) { return b.label + " " + money(b.value); }).join(", ") + '">' +
      bars.map(function (b) {
        var pct = b.value == null ? 0 : Math.max(2, b.value / max * 100);
        return '<div class="pp-bar-row"><div class="pp-bar-meta"><span class="pp-bar-label">' + b.label + '</span><span class="pp-bar-value">' + money(b.value) + "</span></div>" +
          '<div class="pp-bar-track"><div class="pp-bar" style="width:' + pct + "%;background:" + b.color + '"></div></div></div>';
      }).join("") + "</div>";
  }

  // ---------- View more drawer ----------
  var drawerOverlay = document.getElementById("ppDrawerOverlay");
  var drawer = document.getElementById("ppDrawer");

  function openDrawer(id) {
    state.drawerId = id;
    renderDrawer();
    drawerOverlay.hidden = false;
    var close = drawer.querySelector(".modal-close");
    if (close) close.focus();
  }

  function closeDrawer() {
    drawerOverlay.hidden = true;
    state.drawerId = null;
  }

  function renderDrawer() {
    var r = byId(state.drawerId);
    if (!r) return;
    var ship = SHIPMENTS[r.shipmentId];
    var paid = paidTotal(r);
    var due = outstanding(r);
    var canPay = (r.status === "Approved" || r.status === "Part paid") && due > 0;
    var isPayable = r.type === "payable";
    var noteNeeded = overBudget(r) && (r.status === "Approved" || r.status === "Part paid" || r.status === "Paid");

    var clip = '<svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.3 3.3 0 014.7 4.7L9.7 17.2a1.7 1.7 0 01-2.4-2.4L15 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
    var facts = [
      [isPayable ? "Vendor" : "Customer", esc(r.party)],
      ["Category", esc(r.category)],
      ["Shipment #", '<a class="pp-link" href="#propay/shipment/' + encodeURIComponent(r.shipmentId) + '">' + esc(r.shipmentId) + "</a>"],
      ["Sell price", money(r.sell)],
      ["Attachment", r.attachment ? '<span class="pp-file">' + clip + esc(r.attachment) + "</span>" : '<span class="pp-muted">None</span>', "wide"]
    ].map(function (d) {
      return '<div class="pp-fact' + (d[2] ? " pp-fact-wide" : "") + '"><dt>' + d[0] + "</dt><dd>" + d[1] + "</dd></div>";
    }).join("");

    var details =
      '<div class="pp-summary">' +
        '<div><span class="pp-summary-label">Amount</span><span class="pp-summary-amount">' + money(r.actual) + "</span></div>" +
        statusHtml(r.status) +
      "</div>" +
      (isPayable && r.budget != null
        ? '<div class="pp-budget-line">' + budgetCheckHtml(r) + '<span class="pp-muted">Budget ' + money(r.budget) + "</span></div>"
        : "") +
      '<dl class="pp-facts">' + facts + "</dl>";

    var history = r.payments.length
      ? '<ul class="pp-history">' + r.payments.map(function (p) {
          return "<li><span><strong>" + money(p.amount) + "</strong> · " + esc(p.kind) + " payment</span><span class=\"pp-muted\">" + formatDate(p.at) + " · " + esc(p.by) + "</span></li>";
        }).join("") + "</ul>"
      : '<p class="pp-muted pp-empty-note">No payments recorded yet.</p>';

    var payForm = canPay
      ? '<form class="pp-pay-form" id="ppPayForm">' +
          '<div class="pp-radio-row" role="radiogroup" aria-label="Payment type">' +
            '<label class="pp-radio"><input type="radio" name="ppKind" value="Full" checked /> <span>Full payment</span></label>' +
            '<label class="pp-radio"><input type="radio" name="ppKind" value="Partial" /> <span>Partial payment</span></label>' +
          "</div>" +
          '<div class="field"><label class="op-input-wrap" for="ppAmount"><span class="op-notch">Amount paid (₦) <span class="req">*</span></span>' +
            '<input type="number" id="ppAmount" min="1" max="' + due + '" step="1" value="' + due + '" readonly required /></label>' +
            '<p class="pp-help" id="ppAmountHelp">Clears the full outstanding balance.</p></div>' +
          '<div class="field"><label class="op-input-wrap" for="ppDate"><span class="op-notch">Payment date <span class="req">*</span></span>' +
            '<input type="date" id="ppDate" required value="' + new Date().toISOString().slice(0, 10) + '" /></label></div>' +
          '<button type="submit" class="btn btn-primary pp-block">' + (isPayable ? "Record payment" : "Record receipt") + "</button>" +
        "</form>"
      : '<p class="pp-muted pp-empty-note">' + (due === 0 ? "Fully settled." : r.status === "Rejected" ? "Rejected — no payment can be recorded." : "Payments can be recorded once approved.") + "</p>";

    drawer.innerHTML =
      '<div class="modal-head"><div><p class="pp-eyebrow">' + (isPayable ? "Payable" : "Receivable") + '</p><h3 id="ppDrawerTitle">' + esc(r.id) + '</h3></div>' +
        '<button type="button" class="modal-close" data-close-drawer aria-label="Close">&times;</button></div>' +
      '<section class="pp-details-block">' + details + "</section>" +
      '<section class="pp-section"><p class="pp-eyebrow">Sell vs. budget vs. actual</p>' + compareChart(r.sell, isPayable ? r.budget : null, r.actual) + "</section>" +
      '<section class="pp-section"><div class="pp-section-head"><p class="pp-eyebrow">Payments</p><span class="pp-muted">Paid ' + money(paid) + " · Outstanding <strong class=\"pp-due\">" + money(due) + "</strong></span></div>" +
        '<div class="pp-progress" aria-hidden="true"><div style="width:' + (r.actual ? Math.min(100, paid / r.actual * 100) : 0) + '%"></div></div>' +
        history + payForm + "</section>" +
      '<section class="pp-section"><div class="pp-section-head"><p class="pp-eyebrow">Comments (' + r.comments.length + ')</p>' +
        '<button type="button" class="btn-ghost" data-comments="' + esc(r.id) + '">Open thread</button></div>' +
        (noteNeeded ? '<div class="pp-callout">Approved above budget by ' + money(r.actual - r.budget) + ". Add a comment to update the record with the reason.</div>" : "") +
        commentsListHtml(r, 2) +
        '<form class="pp-comment-form" data-comment-form="' + esc(r.id) + '"><div class="field"><label class="op-input-wrap"><span class="op-notch">Add a comment</span><textarea rows="2" required placeholder="' + (noteNeeded ? "Why was this approved above budget?" : "Write a comment…") + '"></textarea></label></div>' +
        '<button type="submit" class="btn btn-outline pp-sm">Post comment</button></form>' +
      "</section>";
  }

  function commentsListHtml(r, limit) {
    if (!r.comments.length) return '<p class="pp-muted pp-empty-note">No comments yet.</p>';
    var list = limit ? r.comments.slice(-limit) : r.comments;
    return '<ul class="pp-comments">' + list.map(function (c) {
      var idx = r.comments.indexOf(c);
      return '<li class="pp-comment' + (c.replyTo != null ? " is-reply" : "") + '">' +
        '<div class="pp-comment-head"><span class="owner-avatar pp-av" style="' + avatarStyle(c.author) + '">' + initials(c.author) + "</span>" +
        "<strong>" + esc(c.author) + '</strong><span class="pp-role">' + esc(c.role) + '</span><span class="pp-muted">' + formatDateTime(c.at) + "</span></div>" +
        (c.replyTo != null && r.comments[c.replyTo] ? '<p class="pp-quote">↳ ' + esc(r.comments[c.replyTo].author) + ": " + esc(r.comments[c.replyTo].text.slice(0, 60)) + (r.comments[c.replyTo].text.length > 60 ? "…" : "") + "</p>" : "") +
        "<p>" + esc(c.text) + "</p>" +
        (limit ? "" : '<button type="button" class="btn-ghost pp-reply" data-reply="' + idx + '">Reply</button>') +
        "</li>";
    }).join("") + "</ul>";
  }

  function initials(name) {
    return name.split(/\s+/).map(function (p) { return p.charAt(0); }).join("").slice(0, 2).toUpperCase();
  }

  function avatarStyle(name) {
    var fills = [["--op-avatar-1-bg", "--op-avatar-1-text"], ["--op-avatar-2-bg", "--op-avatar-2-text"], ["--op-avatar-3-bg", "--op-avatar-3-text"], ["--op-avatar-4-bg", "--op-avatar-4-text"]];
    var hash = 0;
    for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
    var f = fills[hash % 4];
    return "background:var(" + f[0] + ");color:var(" + f[1] + ")";
  }

  function addComment(id, text, replyTo) {
    var r = byId(id);
    if (!r || !text.trim()) return;
    var c = { author: CURRENT_USER.name, role: CURRENT_USER.role, text: text.trim(), at: new Date().toISOString().slice(0, 16) };
    if (replyTo != null) c.replyTo = replyTo;
    r.comments.push(c);
    save();
    toast(replyTo != null ? "Reply posted" : "Comment added");
  }

  // ---------- Comments modal ----------
  var commentsOverlay = document.getElementById("ppCommentsOverlay");
  var commentsModal = document.getElementById("ppCommentsModal");

  function openComments(id) {
    state.commentsId = id;
    state.replyTo = null;
    renderComments();
    commentsOverlay.hidden = false;
    var ta = commentsModal.querySelector("textarea");
    if (ta) ta.focus();
  }

  function closeComments() {
    commentsOverlay.hidden = true;
    state.commentsId = null;
    state.replyTo = null;
  }

  function renderComments() {
    var r = byId(state.commentsId);
    if (!r) return;
    var replying = state.replyTo != null ? r.comments[state.replyTo] : null;
    commentsModal.innerHTML =
      '<div class="modal-head"><div><h3 id="ppCommentsTitle">Comments · ' + esc(r.id) + '</h3><p class="muted">' + esc(r.party) + " · " + statusHtml(r.status) + "</p></div>" +
        '<button type="button" class="modal-close" data-close-comments aria-label="Close">&times;</button></div>' +
      (overBudget(r) ? '<div class="pp-callout">Exceeds budget by ' + money(r.actual - r.budget) + ". Finance can respond here even after approval.</div>" : "") +
      commentsListHtml(r, 0) +
      '<form class="pp-comment-form" data-comment-form="' + esc(r.id) + '">' +
        (replying ? '<p class="pp-replying">Replying to <strong>' + esc(replying.author) + '</strong> <button type="button" class="btn-ghost" data-cancel-reply>Cancel</button></p>' : "") +
        '<div class="field"><label class="op-input-wrap"><span class="op-notch">' + (replying ? "Your reply" : "Add a comment") + '</span><textarea rows="3" required placeholder="Write a comment…"></textarea></label></div>' +
        '<div class="modal-actions"><div class="modal-actions-right"><button type="button" class="btn btn-outline" data-close-comments>Close</button><button type="submit" class="btn btn-primary">' + (replying ? "Post reply" : "Post comment") + "</button></div></div>" +
      "</form>";
  }

  // ---------- Events (delegated) ----------
  document.addEventListener("click", function (e) {
    var t = e.target;

    var seg = t.closest(".pp-seg");
    if (seg) { state.type = seg.dataset.type; renderRegister(); return; }

    if (t.closest("#ppFilterBtn")) { state.filterOpen = !state.filterOpen; renderRegister(); return; }

    var opt = t.closest(".pp-filter-opt");
    if (opt) { state.status = opt.dataset.status; state.filterOpen = false; renderRegister(); return; }

    if (state.filterOpen && !t.closest(".pp-filter") && root.contains(document.querySelector(".pp-filter"))) {
      state.filterOpen = false; renderRegister();
    }

    var more = t.closest("[data-more]");
    if (more) { openDrawer(more.dataset.more); return; }

    var cm = t.closest("[data-comments]");
    if (cm) { openComments(cm.dataset.comments); return; }

    if (t.closest("[data-close-drawer]") || t === drawerOverlay) { closeDrawer(); return; }
    if (t.closest("[data-close-comments]") || t === commentsOverlay) { closeComments(); return; }

    // Following a link from inside the drawer navigates; close the drawer.
    if (t.closest(".drawer a[href^='#propay']")) { closeDrawer(); return; }

    var reply = t.closest("[data-reply]");
    if (reply) {
      state.replyTo = parseInt(reply.dataset.reply, 10);
      renderComments();
      commentsModal.querySelector("textarea").focus();
      return;
    }
    if (t.closest("[data-cancel-reply]")) { state.replyTo = null; renderComments(); return; }
  });

  document.addEventListener("change", function (e) {
    if (e.target.name !== "ppKind") return;
    var r = byId(state.drawerId);
    var amount = document.getElementById("ppAmount");
    var help = document.getElementById("ppAmountHelp");
    var due = outstanding(r);
    if (e.target.value === "Full") {
      amount.value = due;
      amount.readOnly = true;
      help.textContent = "Clears the full outstanding balance.";
    } else {
      amount.value = "";
      amount.readOnly = false;
      amount.max = due - 1;
      help.textContent = "Enter the amount paid — up to " + money(due - 1) + ".";
      amount.focus();
    }
  });

  document.addEventListener("submit", function (e) {
    var form = e.target;

    if (form.id === "ppPayForm") {
      e.preventDefault();
      var r = byId(state.drawerId);
      var kind = form.querySelector("input[name=ppKind]:checked").value;
      var amount = parseInt(document.getElementById("ppAmount").value, 10);
      var due = outstanding(r);
      if (!amount || amount <= 0 || amount > due) {
        document.getElementById("ppAmount").closest(".op-input-wrap").classList.add("has-error");
        document.getElementById("ppAmountHelp").textContent = "Enter an amount between ₦1 and " + money(due) + ".";
        document.getElementById("ppAmountHelp").classList.add("is-error");
        return;
      }
      r.payments.push({ amount: amount, kind: amount >= due ? "Full" : kind, at: document.getElementById("ppDate").value, by: CURRENT_USER.name });
      r.status = outstanding(r) === 0 ? "Paid" : "Part paid";
      save();
      renderDrawer();
      refreshPage();
      toast((r.type === "payable" ? "Payment" : "Receipt") + " of " + money(amount) + " recorded");
      return;
    }

    var cf = form.getAttribute("data-comment-form");
    if (cf) {
      e.preventDefault();
      var text = form.querySelector("textarea").value;
      var inModal = commentsModal.contains(form);
      addComment(cf, text, inModal ? state.replyTo : null);
      state.replyTo = null;
      if (inModal) renderComments();
      if (state.drawerId) renderDrawer();
      refreshPage();
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!commentsOverlay.hidden) closeComments();
    else if (!drawerOverlay.hidden) closeDrawer();
    else if (state.filterOpen) { state.filterOpen = false; renderRegister(); }
  });

  function refreshPage() {
    if (!moduleEls.propay.classList.contains("active")) return;
    var parts = location.hash.replace(/^#/, "").split("/");
    if (parts[1] === "shipment" && SHIPMENTS[parts[2]]) renderShipment(parts[2]);
    else renderRegister();
  }

  window.addEventListener("hashchange", function () {
    closeDrawer();
    closeComments();
    route();
  });
  route();
})();
