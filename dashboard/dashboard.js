(function () {
  "use strict";

  // ---------- Pipeline definition ----------
  // Each phase and its steps, with the number of live shipments sitting in each step.
  var ICONS = {
    inbox: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/>',
    calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h2M12 12h2M16 12v5M8 16h2M12 16h2"/>',
    doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h5"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
    percent: '<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    check: '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h4"/>',
    folder: '<path d="M3 6h6l2 2h10v11H3z"/><path d="M12 11v5M9.5 13.5h5"/>',
    calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>',
    ship: '<path d="M3 16l2 4h14l2-4zM6 16V9h12v7M12 9V4M9 6h6"/>',
    customs: '<path d="M7 21v-6M17 21v-6M4 15h16M6 15V9h12v6M9 9V5h6v4"/>',
    scale: '<path d="M12 4v16M6 20h12M5 8h14M5 8l-2.5 6h5zM19 8l-2.5 6h5z"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6M9 16h3"/>',
    truck: '<path d="M3 6h11v10H3zM14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8 6.6 19.7l1.1-6.1L3.2 9.4l6.1-.8z"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5zM3 8l9 5 9-5M12 13v8"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + ICONS[name] + "</svg>";
  }
  var CHECK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CROSS = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';

  var PHASES = [
    { id: "deal", name: "Deal", bar: "var(--op-cat-2)", steps: [
      ["RFQ", 25, "inbox"], ["Rate request", 5, "calc"], ["Quote issued", 5, "doc"],
      ["Qualification & credit", 11, "shield"], ["Margin gate", 7, "percent"], ["Customer acceptance", 5, "check"]] },
    { id: "pre", name: "Pre-Booking", bar: "var(--op-cat-3)", steps: [
      ["Credit & payment terms", 14, "card"], ["Job opened", 15, "folder"]] },
    { id: "booking", name: "Booking", bar: "var(--op-cat-4)", steps: [
      ["Booking", 7, "calendar"], ["Origin & sailing", 11, "ship"], ["Pre-arrival & clearing", 9, "customs"]] },
    { id: "post", name: "Post Booking", bar: "var(--op-cat-5)", steps: [
      ["Cost-to-bill check", 7, "scale"], ["Invoicing & collection", 5, "receipt"], ["Delivery & documents", 5, "truck"], ["Job close & review", 9, "star"]] }
  ];
  // Flat list of steps in pipeline order
  var STEPS = [];
  PHASES.forEach(function (p, pi) {
    p.steps.forEach(function (s) { STEPS.push({ name: s[0], count: s[1], icon: s[2], phase: pi }); });
  });
  function stepIndex(name) { for (var i = 0; i < STEPS.length; i++) if (STEPS[i].name === name) return i; return -1; }

  var ALERTS = [
    { id: "delayed", n: 4, label: "delayed", sev: "error", steps: ["Origin & sailing", "Pre-arrival & clearing"],
      detail: "Vessel departure slipped by 3 days. Customer has not been updated on the new ETA." },
    { id: "quotes", n: 2, label: "quotes awaiting reply", one: "quote awaiting reply", sev: "warning", steps: ["Quote issued"],
      detail: "Quote sent 4 days ago with no reply from the customer." },
    { id: "hold", n: 1, label: "hold expiring", sev: "warning", steps: ["Booking"],
      detail: "Space hold with the carrier expires today at 17:00." },
    { id: "carrier", n: 2, label: "awaiting carrier", sev: "warning", steps: ["Booking"],
      detail: "Booking request sent; waiting for the carrier to confirm space." },
    { id: "overdue", n: 3, label: "invoices overdue", one: "invoice overdue", sev: "error", steps: ["Invoicing & collection"],
      detail: "Invoice is 9 days past its due date." }
  ];
  function alertById(id) { return ALERTS.filter(function (a) { return a.id === id; })[0]; }
  var LOST_COUNT = 11;

  // ---------- Sample shipments ----------
  var CUSTOMERS = ["Sterling bank", "Kliqs consulting", "Limeswood", "Micro press computers ltd", "Agventure commodities limited",
    "Cdk industries", "Autochek", "Broadgrain africa", "Silver star", "Bejoice shipping", "Goshen agro", "Greenbles agtech",
    "Premium agro commodities export", "Sinopec oilfield equipment", "Gz industries ltd", "Flavors & fragrance"];
  var OWNERS = ["Aishat Jimoh", "Kayode Akintade", "Deborah Oje", "Adeshewa Adelowotan", "Gift Osaremen"];
  var ROUTES = [["Shanghai", "Apapa"], ["Ningbo", "Tin Can"], ["Antwerp", "Apapa"], ["Lagos", "Rotterdam"], ["Dubai (Jebel Ali)", "Onne"],
    ["Mumbai (Nhava Sheva)", "Apapa"], ["Lagos (LOS)", "London (LHR)"], ["Guangzhou", "Lekki Deep Sea"]];
  var LOST_REASONS = ["Customer chose a cheaper forwarder", "Rate not competitive", "Shipment cancelled by customer", "No response after follow-ups", "Credit check failed"];

  var seed = 26111;
  function rand() { // deterministic, so every viewer sees the same sample data
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

  function buildShipments() {
    var remaining = STEPS.map(function (s) { return s.count; });
    var lostLeft = LOST_COUNT;
    // A hand-picked first page so the opening view shows each state
    var first = [["Credit & payment terms"], ["Origin & sailing", "delayed"], ["RFQ"], ["Rate request"],
      ["Invoicing & collection", "overdue"], ["Quote issued", "quotes"], ["Margin gate"], ["Booking", "hold"], ["LOST"], ["Customer acceptance"]];
    var plan = first.map(function (f) {
      if (f[0] === "LOST") { lostLeft--; return { lost: true }; }
      var i = stepIndex(f[0]); remaining[i]--;
      return { step: i, alert: f[1] || null };
    });
    var pool = [];
    remaining.forEach(function (n, i) { for (var k = 0; k < n; k++) pool.push({ step: i, alert: null }); });
    for (var k = 0; k < lostLeft; k++) pool.push({ lost: true });
    for (var i = pool.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    plan = plan.concat(pool);

    // Spread the remaining alerts over eligible shipments
    ALERTS.forEach(function (a) {
      var have = plan.filter(function (p) { return p.alert === a.id; }).length;
      var eligible = plan.filter(function (p) { return !p.lost && !p.alert && a.steps.indexOf(STEPS[p.step].name) !== -1; });
      while (have < a.n && eligible.length) {
        var e = eligible.splice(Math.floor(rand() * eligible.length), 1)[0];
        e.alert = a.id; have++;
      }
    });

    return plan.map(function (p, i) {
      var route = pick(ROUTES);
      var day = 1 + Math.floor(rand() * 9);
      return {
        id: "OP-26-11-" + String(i + 1).padStart(3, "0"),
        customer: CUSTOMERS[(i * 7 + 3) % CUSTOMERS.length],
        owner: OWNERS[(i * 3 + 1) % OWNERS.length],
        value: Math.round((800 + rand() * 18000) / 5) * 5,
        mode: route[1].indexOf("(") !== -1 ? "Air freight" : "Ocean freight",
        route: route[0] + " → " + route[1],
        created: String(day).padStart(2, "0") + "/11/2026",
        lost: !!p.lost,
        lostStep: p.lost ? Math.floor(rand() * 6) : null,
        lostReason: p.lost ? pick(LOST_REASONS) : null,
        step: p.lost ? null : p.step,
        phase: p.lost ? 0 : STEPS[p.step].phase,
        alert: p.alert || null
      };
    });
  }
  var SHIPMENTS = buildShipments();

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) { return "$" + Number(n).toLocaleString("en-US"); }

  // ---------- Greeting ----------
  var now = new Date();
  var h = now.getHours();
  $("greeting").textContent = (h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening") + ", John";
  $("todayDate").textContent = now.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  // ---------- State ----------
  var state = { filter: { kind: "all" }, page: 1, perPage: 10, q: "" };
  function sameFilter(a, b) { return a.kind === b.kind && a.value === b.value; }
  function setFilter(f) {
    state.filter = sameFilter(state.filter, f) ? { kind: "all" } : f; // clicking the active filter clears it
    state.page = 1;
    render();
  }
  function matchesFilter(s) {
    var f = state.filter;
    if (f.kind === "all") return true;
    if (f.kind === "active") return !s.lost;
    if (f.kind === "lost") return s.lost;
    if (f.kind === "phase") return !s.lost && s.phase === f.value;
    if (f.kind === "step") return !s.lost && s.step === f.value;
    if (f.kind === "alert") return s.alert === f.value;
    return true;
  }
  function filterLabel() {
    var f = state.filter;
    if (f.kind === "active") return "Active shipments";
    if (f.kind === "lost") return "Lost deals";
    if (f.kind === "phase") return PHASES[f.value].name;
    if (f.kind === "step") return PHASES[STEPS[f.value].phase].name + " · " + STEPS[f.value].name;
    if (f.kind === "alert") { var a = alertById(f.value); return a.label.charAt(0).toUpperCase() + a.label.slice(1); }
    return "";
  }

  // ---------- Summary ----------
  function renderSummary() {
    var live = SHIPMENTS.filter(function (s) { return !s.lost; });
    var f = state.filter;
    var on = function (kind, value) { return f.kind === kind && f.value === value ? " on" : ""; };

    var html = '<div class="col col-active">' +
      '<button type="button" class="col-head" data-filter="active" aria-label="Show active shipments"><span class="col-name">Active</span></button>' +
      '<span class="big">' + live.length + "</span>" +
      '<ul class="alerts">' + ALERTS.map(function (a) {
        var n = SHIPMENTS.filter(function (s) { return s.alert === a.id; }).length;
        return '<li><button type="button" class="alert' + on("alert", a.id) + '" data-filter="alert" data-value="' + a.id + '">' +
          '<span class="dot dot-' + a.sev + '"></span><span><b>' + n + "</b> " + esc(n === 1 && a.one ? a.one : a.label) + "</span></button></li>";
      }).join("") + "</ul>" +
      '<button type="button" class="lost-link' + on("lost", undefined) + '" data-filter="lost">' + icon("box") +
      SHIPMENTS.filter(function (s) { return s.lost; }).length + " lost deals</button></div>";

    html += PHASES.map(function (p, pi) {
      var n = live.filter(function (s) { return s.phase === pi; }).length;
      var steps = STEPS.map(function (s, si) { return { s: s, si: si }; }).filter(function (x) { return x.s.phase === pi; });
      return '<div class="col col-' + p.id + '" style="--bar:' + p.bar + '">' +
        '<button type="button" class="col-head" data-filter="phase" data-value="' + pi + '" aria-label="Show ' + esc(p.name) + ' shipments">' +
        '<span class="col-name">' + esc(p.name) + '</span><span class="col-bar"></span></button>' +
        '<span class="big">' + n + "</span>" +
        '<ul class="subs' + (steps.length > 4 ? " subs-2" : "") + '">' + steps.map(function (x) {
          var c = live.filter(function (s) { return s.step === x.si; }).length;
          return '<li><button type="button" class="sub' + on("step", x.si) + '" data-filter="step" data-value="' + x.si + '">' +
            icon(x.s.icon) + '<span class="lbl">' + esc(x.s.name) + '</span><span class="n">' + c + "</span></button></li>";
        }).join("") + "</ul></div>";
    }).join("");
    $("summary").innerHTML = html;
  }
  $("summary").addEventListener("click", function (e) {
    var b = e.target.closest("[data-filter]");
    if (!b) return;
    var v = b.getAttribute("data-value");
    var kind = b.getAttribute("data-filter");
    setFilter({ kind: kind, value: kind === "alert" ? v : v == null ? undefined : Number(v) });
  });

  // ---------- Tracker ----------
  $("phaseHeaders").innerHTML = PHASES.map(function (p) { return "<span>" + esc(p.name) + "</span>"; }).join("");

  function barHtml(s) {
    if (s.lost) {
      return '<div class="bar lost"><span class="seg"><span class="lost-tag">' + CROSS + "Lost</span></span><span class=\"seg\"></span><span class=\"seg\"></span><span class=\"seg\"></span></div>";
    }
    return '<div class="bar">' + PHASES.map(function (p, pi) {
      if (pi < s.phase) return '<span class="seg seg-done"></span>';
      if (pi === s.phase) return '<span class="seg seg-current"><span class="seg-label">' + esc(STEPS[s.step].name) + "</span></span>";
      return '<span class="seg"></span>';
    }).join("") + "</div>";
  }
  function statusText(s) {
    return s.lost ? "Lost at " + STEPS[s.lostStep].name : PHASES[s.phase].name + ", " + STEPS[s.step].name;
  }

  function filtered() {
    var q = state.q.toLowerCase();
    return SHIPMENTS.filter(function (s) {
      return matchesFilter(s) && (!q || (s.id + " " + s.customer).toLowerCase().indexOf(q) !== -1);
    });
  }

  function renderTracker() {
    var list = filtered();
    var pages = Math.max(1, Math.ceil(list.length / state.perPage));
    if (state.page > pages) state.page = pages;
    var start = (state.page - 1) * state.perPage;
    var shown = list.slice(start, start + state.perPage);

    $("rows").innerHTML = shown.length ? shown.map(function (s) {
      var a = s.alert ? alertById(s.alert) : null;
      return '<button type="button" class="ship" data-ship="' + s.id + '" aria-label="' + esc(s.id + ", " + s.customer + ", " + statusText(s) + (a ? ", " + a.label : "")) + '">' +
        '<span class="ship-id"><b>' + esc(s.id) + (a ? '<span class="dot dot-' + a.sev + '" title="' + esc(a.label) + '"></span>' : "") + "</b>" +
        "<small>" + esc(s.customer) + "</small></span>" + barHtml(s) + "</button>";
    }).join("") : '<div class="empty"><b>No shipments match</b>Try another search or clear the filter.</div>';

    $("showing").innerHTML = list.length
      ? "Showing <b>" + (start + 1) + "–" + (start + shown.length) + "</b> of " + list.length
      : "Showing 0 of 0";

    // Prev 1 2 … 16 Next
    var nums = [];
    for (var p = 1; p <= pages; p++) {
      if (p === 1 || p === pages || Math.abs(p - state.page) <= 1 || (state.page <= 2 && p <= 3) || (state.page >= pages - 1 && p >= pages - 2)) nums.push(p);
      else if (nums[nums.length - 1] !== "…") nums.push("…");
    }
    $("pages").innerHTML =
      '<button type="button" class="pg" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? " disabled" : "") + ">‹ Prev</button>" +
      nums.map(function (n) {
        return n === "…" ? '<span class="gap">…</span>'
          : '<button type="button" class="pg' + (n === state.page ? " on" : "") + '" data-page="' + n + '"' + (n === state.page ? ' aria-current="page"' : "") + ">" + n + "</button>";
      }).join("") +
      '<button type="button" class="pg" data-page="' + (state.page + 1) + '"' + (state.page === pages ? " disabled" : "") + ">Next ›</button>";

    $("filterChip").hidden = state.filter.kind === "all";
    $("filterLabel").textContent = filterLabel() + " · " + list.length;
  }

  $("pages").addEventListener("click", function (e) {
    var b = e.target.closest("[data-page]");
    if (!b || b.disabled) return;
    state.page = Number(b.getAttribute("data-page"));
    renderTracker();
  });
  $("perPage").addEventListener("change", function () { state.perPage = Number(this.value); state.page = 1; renderTracker(); });
  $("search").addEventListener("input", function () { state.q = this.value.trim(); state.page = 1; renderTracker(); });
  $("clearFilter").addEventListener("click", function () { state.filter = { kind: "all" }; state.page = 1; render(); });
  $("rows").addEventListener("click", function (e) {
    var b = e.target.closest("[data-ship]");
    if (b) openDrawer(b.getAttribute("data-ship"));
  });

  // ---------- Detail drawer ----------
  var lastFocus = null;
  function openDrawer(id) {
    var s = SHIPMENTS.filter(function (x) { return x.id === id; })[0];
    if (!s) return;
    lastFocus = document.activeElement;
    var a = s.alert ? alertById(s.alert) : null;
    $("drawerTitle").textContent = s.id;
    $("drawerSub").textContent = s.customer;

    var status = s.lost
      ? '<span class="chip chip-error">' + CROSS.replace("<svg ", '<svg width="10" height="10" ') + " Lost</span>"
      : '<span class="chip chip-primary">' + esc(PHASES[s.phase].name) + " · " + esc(STEPS[s.step].name) + "</span>";
    var notice = a ? '<div class="notice notice-' + a.sev + '"><span class="dot dot-' + a.sev + '"></span><div><b>' +
      esc(a.label.charAt(0).toUpperCase() + a.label.slice(1)) + "</b><br>" + esc(a.detail) + "</div></div>" : "";
    if (s.lost) notice = '<div class="notice notice-error"><span class="dot dot-error"></span><div><b>Lost at ' + esc(STEPS[s.lostStep].name) +
      "</b><br>" + esc(s.lostReason) + "</div></div>";

    var current = s.lost ? s.lostStep : s.step;
    var steps = PHASES.map(function (p, pi) {
      return '<li class="step-phase">' + esc(p.name) + "</li>" + STEPS.map(function (st, si) {
        if (st.phase !== pi) return "";
        var cls = si < current ? "done" : si === current ? (s.lost ? "lost" : "current") : "";
        var mark = si < current ? CHECK : si === current && s.lost ? CROSS : "";
        return '<li class="step ' + cls + '"><i>' + mark + "</i>" + esc(st.name) + "</li>";
      }).join("");
    }).join("");

    $("drawerBody").innerHTML =
      '<p style="margin:0 0 16px">' + status + ' <span class="chip chip-mode">' + esc(s.mode) + "</span></p>" + notice +
      '<dl class="facts">' +
      "<div><dt>Customer</dt><dd>" + esc(s.customer) + "</dd></div>" +
      "<div><dt>Deal owner</dt><dd>" + esc(s.owner) + "</dd></div>" +
      "<div><dt>Route</dt><dd>" + esc(s.route) + "</dd></div>" +
      '<div><dt>Deal value</dt><dd class="money">' + money(s.value) + "</dd></div>" +
      "<div><dt>Created</dt><dd>" + esc(s.created) + "</dd></div>" +
      "<div><dt>Status</dt><dd>" + esc(statusText(s)) + "</dd></div></dl>" +
      '<p class="eyebrow">Progress</p><ul class="steps">' + steps + "</ul>";

    var host = $("drawer");
    host.hidden = false;
    void host.offsetWidth;
    host.classList.add("open");
    host.querySelector(".icon-btn").focus();
  }
  function closeDrawer() {
    var host = $("drawer");
    host.classList.remove("open");
    setTimeout(function () { if (!host.classList.contains("open")) host.hidden = true; }, 250);
    if (lastFocus) lastFocus.focus();
  }
  $("drawer").addEventListener("click", function (e) { if (e.target.closest("[data-close]")) closeDrawer(); });

  // ---------- Notifications ----------
  var NOTES = ["overdue", "hold", "quotes"].map(function (id) {
    var s = SHIPMENTS.filter(function (x) { return x.alert === id; })[0];
    var a = alertById(id);
    var text = { overdue: "Invoice overdue on " + s.id, hold: "Carrier hold expires today on " + s.id, quotes: "Quote awaiting reply on " + s.id }[id];
    return { ship: s.id, sev: a.sev, text: text, sub: s.customer + " · " + a.detail, read: false };
  });
  function renderNotes() {
    var unread = NOTES.filter(function (n) { return !n.read; }).length;
    $("bellBadge").hidden = !unread;
    $("bellBadge").textContent = unread;
    $("bellBtn").setAttribute("aria-label", "Notifications, " + unread + " unread");
    $("notifList").innerHTML = NOTES.map(function (n, i) {
      return '<li><button type="button" class="' + (n.read ? "read" : "") + '" data-note="' + i + '"><span class="dot dot-' + n.sev + '"></span>' +
        "<span><b>" + esc(n.text) + "</b><small>" + esc(n.sub) + "</small></span></button></li>";
    }).join("");
  }
  function togglePop(show) {
    $("notifPop").hidden = !show;
    $("bellBtn").setAttribute("aria-expanded", String(show));
  }
  $("bellBtn").addEventListener("click", function (e) { e.stopPropagation(); togglePop($("notifPop").hidden); });
  $("markRead").addEventListener("click", function () { NOTES.forEach(function (n) { n.read = true; }); renderNotes(); });
  $("notifList").addEventListener("click", function (e) {
    var b = e.target.closest("[data-note]");
    if (!b) return;
    var n = NOTES[Number(b.getAttribute("data-note"))];
    n.read = true; renderNotes(); togglePop(false);
    openDrawer(n.ship);
  });
  document.addEventListener("click", function (e) {
    if (!$("notifPop").hidden && !e.target.closest(".notif-wrap")) togglePop(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (!$("drawer").hidden) closeDrawer();
    else if (!$("notifPop").hidden) { togglePop(false); $("bellBtn").focus(); }
  });

  function render() { renderSummary(); renderTracker(); }
  renderNotes();
  render();
})();
