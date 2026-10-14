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
    "ZIL0312": { id: "ZIL0312", status: "Active", customer: "Dangote Industries", mode: "Ocean Freight", pol: "CNSHA", pod: "NGAPP", origin: "Shanghai, China (CNSHA)", destination: "Apapa, Lagos (NGAPP)",
      bookingContact: "Fidelia Aluku", quoteRef: "QT-26-0918", bl: "MAEU264418230", shipmentType: "Import", serviceType: "FCL", incoterm: "FOB", load: "2 × 40ft HC", eta: "2026-10-22",
      team: [{ name: "Kimeen Ugwu", role: "Operations Manager" }, { name: "Manuel Akin", role: "Operations Officer" }, { name: "Nkechi M.", role: "Finance" }],
      progress: [["Booking confirmed", "2026-09-18"], ["Cargo received at origin", "2026-09-24"], ["Departed port of loading", "2026-09-29"], ["Arrived port of discharge", null], ["Customs cleared", null], ["Delivered", null]], step: 3,
      documents: [["Bill of lading", "MAEU264418230.pdf", "2026-09-29"], ["Commercial invoice", "dangote-ci-0912.pdf", "2026-09-20"], ["Packing list", "dangote-pl-0912.pdf", "2026-09-20"]] },
    "ZIL0298": { id: "ZIL0298", status: "Active", customer: "Flour Mills of Nigeria", mode: "Ocean Freight", pol: "BEANR", pod: "NGTIN", origin: "Antwerp, Belgium (BEANR)", destination: "Tin Can, Lagos (NGTIN)",
      bookingContact: "Tobi Adewale", quoteRef: "QT-26-0874", bl: "CMDU883120447", shipmentType: "Import", serviceType: "FCL", incoterm: "CIF", load: "1 × 20ft", eta: "2026-10-09",
      team: [{ name: "Kimeen Ugwu", role: "Operations Manager" }, { name: "Ugwu Neny", role: "Operations Officer" }],
      progress: [["Booking confirmed", "2026-09-02"], ["Cargo received at origin", "2026-09-06"], ["Departed port of loading", "2026-09-10"], ["Arrived port of discharge", "2026-10-09"], ["Customs cleared", null], ["Delivered", null]], step: 4,
      documents: [["Bill of lading", "CMDU883120447.pdf", "2026-09-10"], ["Form M", "formm-fmn-2209.pdf", "2026-08-30"]] },
    "ZIL0305": { id: "ZIL0305", status: "Completed", customer: "Honeywell Group", mode: "Air Freight", pol: "AEDXB", pod: "NGLOS", origin: "Dubai, UAE (AEDXB)", destination: "Lagos, Nigeria (NGLOS)",
      bookingContact: "Ifeoma Obi", quoteRef: "QT-26-0901", bl: "176-55320914 (AWB)", shipmentType: "Import", serviceType: "Air consolidation", incoterm: "EXW", load: "1,240 kg", eta: "2026-10-12",
      team: [{ name: "Manuel Akin", role: "Operations Officer" }, { name: "Ada Okoro", role: "Operations Officer" }],
      progress: [["Booking confirmed", "2026-10-02"], ["Cargo received at origin", "2026-10-05"], ["Departed port of loading", "2026-10-07"], ["Arrived port of discharge", "2026-10-08"], ["Customs cleared", "2026-10-10"], ["Delivered", "2026-10-12"]], step: 6,
      documents: [["Air waybill", "awb-176-55320914.pdf", "2026-10-07"], ["Delivery note", "honeywell-dn-1012.pdf", "2026-10-12"]] },
    "ZIL0321": { id: "ZIL0321", status: "Active", customer: "MTN Nigeria", mode: "Ocean Freight", pol: "TRMER", pod: "NGONN", origin: "Mersin, Turkey (TRMER)", destination: "Onne, Rivers (NGONN)",
      bookingContact: "Chidi Nwosu", quoteRef: "QT-26-0933", bl: "Pending", shipmentType: "Import", serviceType: "FCL", incoterm: "FOB", load: "3 × 40ft", eta: "2026-11-02",
      team: [{ name: "Kimeen Ugwu", role: "Operations Manager" }, { name: "Ugwu Neny", role: "Operations Officer" }],
      progress: [["Booking confirmed", "2026-10-11"], ["Cargo received at origin", null], ["Departed port of loading", null], ["Arrived port of discharge", null], ["Customs cleared", null], ["Delivered", null]], step: 1,
      documents: [] }
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
    if (parts[1] === "shipment" && SHIPMENTS[parts[2]]) renderShipment(parts[2], parts[3]);
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

  function renderRegister() {
    var list = filtered();
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
      '<div class="activity-toolbar">' +
        '<input type="search" id="ppSearch" class="search-input" placeholder="Search PO #, vendor, category or shipment #..." value="' + esc(state.search) + '" />' +
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
  // Mirrors the Shipments module's detail layout: header card with key
  // facts, then tabs. Arriving from ProPay lands on the Propay tab.
  var SHIP_TABS = [["overview", "Overview"], ["progress", "Progress"], ["documents", "Documents"], ["propay", "Propay"]];

  function renderShipment(id, tab) {
    var s = SHIPMENTS[id];
    tab = tab || "propay";
    var lines = records.filter(function (r) { return r.shipmentId === id; });
    var clip = '<svg viewBox="0 0 24 24"><path d="M20 11.5l-8 8a5 5 0 01-7-7l8.5-8.5a3.3 3.3 0 014.7 4.7L9.7 17.2a1.7 1.7 0 01-2.4-2.4L15 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';

    var head =
      '<a class="sd-back" href="#propay"><svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>Back to ProPay</a>' +
      '<section class="sd-card sd-hero">' +
        '<div class="sd-hero-top">' +
          '<div class="sd-hero-title"><h2>' + esc(s.id) + '</h2><span class="sd-pill ' + (s.status === "Active" ? "is-active" : "is-done") + '">' + esc(s.status) + "</span></div>" +
          '<div class="sd-actions">' +
            '<button type="button" class="btn btn-primary sd-actions-btn" id="sdActionsBtn" aria-expanded="false">Actions <svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>' +
            '<div class="sd-menu" id="sdMenu" hidden>' +
              '<button type="button" data-sd-action="Status update sent to customer">Send status update</button>' +
              '<button type="button" data-sd-action="Document request sent">Request documents</button>' +
              '<button type="button" data-sd-action="Shipment link copied">Copy shipment link</button>' +
            "</div>" +
          "</div>" +
        "</div>" +
        '<dl class="sd-facts">' +
          "<div><dt>Customer</dt><dd>" + esc(s.customer) + "</dd></div>" +
          "<div><dt>Transport mode</dt><dd>" + esc(s.mode) + "</dd></div>" +
          "<div><dt>Port of loading</dt><dd>" + esc(s.pol) + "</dd></div>" +
          "<div><dt>Port of discharge</dt><dd>" + esc(s.pod) + "</dd></div>" +
        "</dl>" +
      "</section>" +
      '<nav class="sd-card sd-tabs" aria-label="Shipment sections">' +
        SHIP_TABS.map(function (t) {
          return '<a href="#propay/shipment/' + encodeURIComponent(id) + "/" + t[0] + '" class="sd-tab' + (t[0] === tab ? " active" : "") + '"' + (t[0] === tab ? ' aria-current="page"' : "") + ">" + t[1] + "</a>";
        }).join("") +
      "</nav>";

    var body = "";

    if (tab === "overview") {
      var detail = [
        ["Customer", '<span class="sd-link">' + esc(s.customer) + "</span>"],
        ["Booking contact", esc(s.bookingContact)],
        ["Quote reference", '<span class="sd-link">' + esc(s.quoteRef) + "</span>"],
        [s.mode === "Air Freight" ? "Air waybill" : "Bill of lading", esc(s.bl)],
        ["Shipment type", esc(s.shipmentType)],
        ["Transport mode", esc(s.mode)],
        ["Service type", esc(s.serviceType)],
        ["Incoterm", esc(s.incoterm)],
        ["Origin", esc(s.origin)],
        ["Destination", esc(s.destination)],
        ["Load", esc(s.load)],
        ["ETA", formatDate(s.eta)]
      ].map(function (d) { return "<div><dt>" + d[0] + "</dt><dd>" + d[1] + "</dd></div>"; }).join("");

      body =
        '<div class="sd-split">' +
          '<section class="sd-card"><div class="sd-card-head"><h3>Shipment Details</h3><p>Core reference data for this job.</p></div>' +
            '<dl class="sd-grid">' + detail + "</dl></section>" +
          '<section class="sd-card"><div class="sd-card-head"><h3>Shipment Team</h3><p>Who’s assigned to this shipment.</p></div>' +
            '<ul class="sd-team">' + s.team.map(function (m, i) {
              // Cycle the brand fills down the list so neighbours never match.
              var fill = ["1", "3", "4", "2"][i % 4];
              return '<li><span class="sd-avatar" style="background:var(--op-avatar-' + fill + '-bg);color:var(--op-avatar-' + fill + '-text)">' + initials(m.name) + '</span><div><strong>' + esc(m.name) + "</strong><span>" + esc(m.role) + "</span></div></li>";
            }).join("") + "</ul></section>" +
        "</div>";
    } else if (tab === "progress") {
      body =
        '<section class="sd-card"><div class="sd-card-head"><h3>Progress</h3><p>Milestones from booking to delivery.</p></div>' +
          '<ol class="sd-timeline">' + s.progress.map(function (m, i) {
            var state = i < s.step ? "done" : i === s.step ? "current" : "todo";
            return '<li class="is-' + state + '"><span class="sd-dot" aria-hidden="true"></span><div><strong>' + esc(m[0]) + "</strong><span>" +
              (m[1] ? formatDate(m[1]) : state === "current" ? "In progress" : "Pending") + "</span></div></li>";
          }).join("") + "</ol></section>";
    } else if (tab === "documents") {
      var docs = s.documents.map(function (d) { return { type: d[0], file: d[1], at: d[2] }; })
        .concat(lines.filter(function (r) { return r.attachment; }).map(function (r) { return { type: r.category + " · " + r.id, file: r.attachment, at: null }; }));
      body =
        '<section class="sd-card"><div class="sd-card-head"><h3>Documents</h3><p>Shipping documents and payment attachments.</p></div>' +
          (docs.length
            ? '<ul class="sd-docs">' + docs.map(function (d) {
                return '<li><span class="sd-doc-icon">' + clip + '</span><div><strong>' + esc(d.file) + "</strong><span>" + esc(d.type) + "</span></div>" +
                  '<span class="pp-muted">' + (d.at ? formatDate(d.at) : "From ProPay") + "</span></li>";
              }).join("") + "</ul>"
            : '<p class="sd-empty">No documents uploaded yet.</p>') +
        "</section>";
    } else {
      var payables = lines.filter(function (r) { return r.type === "payable"; });
      var budget = payables.reduce(function (t, r) { return t + (r.budget || 0); }, 0);
      var actual = payables.reduce(function (t, r) { return t + r.actual; }, 0);
      var sell = payables.reduce(function (t, r) { return t + (r.sell || 0); }, 0);
      var rows = lines.map(function (r) {
        return "<tr>" +
          '<td class="pp-po">' + esc(r.id) + "</td>" +
          '<td class="customer-name">' + esc(r.party) + "</td>" +
          '<td><span class="meeting-badge">' + esc(r.category) + "</span></td>" +
          '<td class="pp-num">' + money(r.actual) + "</td>" +
          "<td>" + budgetCheckHtml(r) + "</td>" +
          "<td>" + statusHtml(r.status) + "</td>" +
          '<td class="action-col"><button type="button" class="view-btn" data-more="' + esc(r.id) + '">View more</button></td>' +
          "</tr>";
      }).join("");
      body =
        '<section class="sd-card"><div class="sd-card-head"><h3>Cost overview</h3><p>Payables on this shipment against the quote.</p></div>' +
          '<div class="sd-card-body">' + compareChart(sell, budget, actual) + "</div></section>" +
        '<section class="sd-card"><div class="sd-card-head"><h3>Payment lines</h3><p>Payables and receivables raised on this shipment.</p></div>' +
          '<div class="sd-table"><table class="activity-table pp-table sd-pp-table">' +
            "<thead><tr><th>PO #</th><th>Vendor / Customer</th><th>Category</th><th>Amount</th><th>Budget check</th><th>Status</th><th class=\"action-col\">Action</th></tr></thead>" +
            "<tbody>" + rows + "</tbody></table></div></section>";
    }

    root.innerHTML = '<div class="sd">' + head + body + "</div>";
  }

  // Stacked horizontal bars, drawn to one scale: sell price, budgeted
  // cost (from the quote) and actual cost. Hovering or focusing the chart
  // reveals two dimension arrows, as in the ProPay sketch:
  //   Margin   = sell price − budgeted cost, on the budget row
  //   Variance = actual cost − budgeted cost, in a lane under actual cost
  // Without a budget (receivables) only the bars are drawn.
  function compareChart(sell, budget, actual) {
    var hasBudget = budget != null;
    var over = hasBudget && actual > budget;
    var max = Math.max(sell || 0, budget || 0, actual || 0) || 1;
    function pos(v) { return Math.round(v / max * 1000) / 10; }
    function pct(n, d) { return d ? Math.round(n / d * 100) : 0; }

    function bar(cls, label, value) {
      return '<div class="pc-row"><div class="pc-bar ' + cls + '" style="width:' + Math.max(2, pos(value)) + '%">' +
        '<span class="pc-label">' + label + '</span><span class="pc-value">' + money(value) + "</span></div>";
    }

    if (!hasBudget) {
      return '<div class="pc">' + bar("pc-sell", "Sell price", sell) + "</div>" + bar("pc-actual", "Actual cost", actual) + "</div></div>";
    }

    var margin = sell - budget;
    var marginPct = pct(margin, sell);
    var variance = actual - budget;
    var variancePct = pct(variance, budget);
    var sign = variance > 0 ? "+" : variance < 0 ? "−" : "";
    var lo = Math.min(budget, sell), hi = Math.max(budget, sell);
    var vlo = Math.min(budget, actual), vhi = Math.max(budget, actual);

    var marginAnn =
      '<div class="pc-ann pc-ann-margin ' + (margin < 0 ? "is-neg" : "is-pos") + '" style="left:' + pos(lo) + "%;width:" + (pos(hi) - pos(lo)) + '%">' +
        '<span class="pc-ann-text" title="' + money(margin) + '">Margin ' + marginPct + "%</span><i class=\"pc-arrow\"></i></div>";
    var varianceAnn =
      '<div class="pc-ann pc-ann-var ' + (over ? "is-neg" : "is-pos") + '" style="left:' + pos(vlo) + "%;width:" + (pos(vhi) - pos(vlo)) + '%">' +
        '<i class="pc-arrow"></i><span class="pc-ann-text" title="' + sign + money(Math.abs(variance)) + '">Variance ' + sign + Math.abs(variancePct) + "%</span></div>";

    var aria = "Sell price " + money(sell) + ", budgeted cost " + money(budget) + ", actual cost " + money(actual) +
      ". Margin " + marginPct + "%, " + money(margin) + ". Variance " + sign + Math.abs(variancePct) + "%, " + (over ? "over" : "under") + " budget by " + money(Math.abs(variance)) + ".";

    return '<div class="pc pc-annotated" tabindex="0" role="img" aria-label="' + aria + '">' +
      '<i class="pc-guide" style="left:' + pos(sell) + '%;top:0;height:var(--pc-guide-sell)"></i>' +
      '<i class="pc-guide" style="left:' + pos(budget) + '%;top:var(--pc-row-2);bottom:0"></i>' +
      '<i class="pc-guide" style="left:' + pos(actual) + '%;top:var(--pc-row-3);bottom:0"></i>' +
      bar("pc-sell", "Sell price", sell) + "</div>" +
      bar("pc-budget", "Budgeted cost", budget) + marginAnn + "</div>" +
      bar("pc-actual" + (over ? " is-over" : ""), "Actual cost", actual) + "</div>" +
      '<div class="pc-lane">' + varianceAnn + "</div>" +
      "</div>";
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

    // Vendor, status and PO live in the header and the money lives in the
    // chart, so the detail rows only carry what isn't shown elsewhere.
    var rows = [
      ["Shipment #", '<a class="pp-link" href="#propay/shipment/' + encodeURIComponent(r.shipmentId) + '">' + esc(r.shipmentId) + "</a>" + (ship ? '<span class="pp-muted">' + esc(ship.customer) + "</span>" : "")],
      ["Category", esc(r.category)],
      ["Budget check", isPayable ? budgetCheckHtml(r) : '<span class="pp-muted">Not applicable</span>'],
      ["Attachment", r.attachment ? '<span class="pp-file">' + clip + esc(r.attachment) + "</span>" : '<span class="pp-muted">None</span>']
    ].map(function (d) {
      return '<div class="pd-row"><dt>' + d[0] + "</dt><dd>" + d[1] + "</dd></div>";
    }).join("");

    var history = r.payments.length
      ? '<ul class="pd-history">' + r.payments.map(function (p) {
          return '<li><span class="pd-history-amt">' + money(p.amount) + '</span><span class="pp-muted">' + esc(p.kind) + " · " + formatDate(p.at) + " · " + esc(p.by) + "</span></li>";
        }).join("") + "</ul>"
      : "";

    var payForm = canPay
      ? '<form class="pd-pay" id="ppPayForm">' +
          '<div class="pd-toggle" role="radiogroup" aria-label="Payment type">' +
            '<label><input type="radio" name="ppKind" value="Full" checked /><span>Full payment</span></label>' +
            '<label><input type="radio" name="ppKind" value="Partial" /><span>Partial payment</span></label>' +
          "</div>" +
          '<div class="field-row">' +
            '<div class="field"><label class="op-input-wrap" for="ppAmount"><span class="op-notch">Amount (₦) <span class="req">*</span></span>' +
              '<input type="number" id="ppAmount" min="1" max="' + due + '" step="1" value="' + due + '" readonly required /></label></div>' +
            '<div class="field"><label class="op-input-wrap" for="ppDate"><span class="op-notch">Date <span class="req">*</span></span>' +
              '<input type="date" id="ppDate" required value="' + new Date().toISOString().slice(0, 10) + '" /></label></div>' +
          "</div>" +
          '<p class="pp-help" id="ppAmountHelp">Clears the full outstanding balance.</p>' +
          '<button type="submit" class="btn btn-primary pp-block">' + (isPayable ? "Record payment" : "Record receipt") + "</button>" +
        "</form>"
      : '<p class="pd-note">' + (due === 0 ? "Fully settled." : r.status === "Rejected" ? "Rejected. No payment can be recorded." : "Payments can be recorded once approved.") + "</p>";

    drawer.innerHTML =
      '<header class="pd-head">' +
        "<div>" +
          '<p class="pp-eyebrow">' + (isPayable ? "Payable" : "Receivable") + "</p>" +
          '<div class="pd-title"><h3 id="ppDrawerTitle">' + esc(r.id) + "</h3>" + statusHtml(r.status) + "</div>" +
          '<p class="pd-sub">' + esc(r.party) + "</p>" +
        "</div>" +
        '<button type="button" class="modal-close" data-close-drawer aria-label="Close">&times;</button>' +
      "</header>" +

      '<section class="pd-section">' + compareChart(r.sell, isPayable ? r.budget : null, r.actual) + "</section>" +

      '<section class="pd-section"><h4 class="pd-h">Details</h4><dl class="pd-rows">' + rows + "</dl></section>" +

      '<section class="pd-section">' +
        '<div class="pd-h-row"><h4 class="pd-h">Payments</h4><span class="pp-muted"><strong class="pp-due">' + money(paid) + "</strong> of " + money(r.actual) + " paid</span></div>" +
        '<div class="pp-progress" aria-hidden="true"><div style="width:' + (r.actual ? Math.min(100, paid / r.actual * 100) : 0) + '%"></div></div>' +
        (due > 0 && paid > 0 ? '<p class="pd-note">' + money(due) + " outstanding</p>" : "") +
        history + payForm +
      "</section>" +

      '<section class="pd-section">' +
        '<div class="pd-h-row"><h4 class="pd-h">Comments</h4>' +
          (r.comments.length > 2 ? '<button type="button" class="btn-ghost" data-comments="' + esc(r.id) + '">View all ' + r.comments.length + "</button>" : '<button type="button" class="btn-ghost" data-comments="' + esc(r.id) + '">Open thread</button>') +
        "</div>" +
        (noteNeeded ? '<div class="pp-callout">Approved ' + money(r.actual - r.budget) + " over budget. Add a comment with the reason.</div>" : "") +
        (r.comments.length ? commentsListHtml(r, 2) : "") +
        '<form class="pd-composer" data-comment-form="' + esc(r.id) + '">' +
          '<textarea rows="2" required aria-label="Add a comment" placeholder="' + (noteNeeded ? "Why was this approved above budget?" : "Add a comment…") + '"></textarea>' +
          '<button type="submit" class="btn btn-outline pp-sm">Post</button>' +
        "</form>" +
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

    var menu = document.getElementById("sdMenu");
    if (t.closest("#sdActionsBtn")) {
      menu.hidden = !menu.hidden;
      t.closest("#sdActionsBtn").setAttribute("aria-expanded", String(!menu.hidden));
      return;
    }
    var act = t.closest("[data-sd-action]");
    if (act) { menu.hidden = true; toast(act.dataset.sdAction); return; }
    if (menu && !menu.hidden) { menu.hidden = true; document.getElementById("sdActionsBtn").setAttribute("aria-expanded", "false"); }

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
    if (parts[1] === "shipment" && SHIPMENTS[parts[2]]) renderShipment(parts[2], parts[3]);
    else renderRegister();
  }

  window.addEventListener("hashchange", function () {
    closeDrawer();
    closeComments();
    route();
  });
  route();
})();
