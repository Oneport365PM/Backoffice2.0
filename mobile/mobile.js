(function () {
  "use strict";

  // ---------- Reference data ----------
  var STAGES = [
    { id: "prospect", name: "Prospect", bar: "var(--op-cat-1)" },
    { id: "contacted", name: "Contacted", bar: "var(--op-cat-2)" },
    { id: "qualified", name: "Qualified", bar: "var(--op-cat-3)" },
    { id: "quote", name: "Quote issued", bar: "var(--op-cat-4)" },
    { id: "closed", name: "Closed", bar: "var(--op-cat-5)" }
  ];
  var TIERS = ["SME", "Growth", "Enterprise"];
  var PRODUCTS = ["FreightSaver", "Ocean freight", "Air freight", "Customs clearance", "Haulage"];
  var OWNERS = ["Aishat Jimoh", "Kayode Akintade", "Deborah Oje", "Adeshewa Adelowotan", "Gift Osaremen"];

  var ICON = {
    arrow: '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cross: '<svg viewBox="0 0 24 24" width="10" height="10"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" class="chev"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2" stroke="currentColor" stroke-width="2" fill="none" stroke-linejoin="round"/></svg>',
    mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 7l9 6 9-6" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
    building: '<svg viewBox="0 0 24 24" width="12" height="12"><path d="M3 21h18M5 21V6l7-3 7 3v15" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'
  };

  // ---------- Sample data ----------
  var state;
  var seq = 1000;
  function uid(p) { return p + (seq++); }

  function seed() {
    var co = [
      ["Sterling bank", "customercare@sterling.ng", "Banking", "SME", "Aishat Jimoh"],
      ["Kliqs consulting", "hello@kliqs.co", "Consulting", "Growth", "Aishat Jimoh"],
      ["Limeswood", "info@limeswood.com", "Manufacturing", "Enterprise", "Deborah Oje"],
      ["Micro press computers ltd", "info@micropressltd.com", "Technology", "SME", "Aishat Jimoh"],
      ["Agventure commodities limited", "trade@agventure.ng", "Agro commodities", "SME", "Kayode Akintade"],
      ["Cdk industries", "ops@cdkindustries.com", "Industrial", "SME", "Aishat Jimoh"],
      ["Autochek", "logistics@autochek.africa", "Automotive", "SME", "Aishat Jimoh"],
      ["Broadgrain africa", "info@broadgrain.africa", "Agro commodities", "Enterprise", "Kayode Akintade"],
      ["Silver star", "admin@silverstar.ng", "Retail", "SME", "Adeshewa Adelowotan"],
      ["Bejoice shipping", "ops@bejoiceshipping.com", "Shipping", "Growth", "Adeshewa Adelowotan"],
      ["Goshen agro", "goshenagro@gmail.com", "Agriculture", "SME", "Adeshewa Adelowotan"],
      ["Greenbles agtech", "greenblesagtech@gmail.com", "Agtech", "SME", "Gift Osaremen"]
    ];
    var companies = co.map(function (c) {
      return { id: uid("co"), name: c[0], email: c[1], address: "Lagos, Nigeria", industry: c[2], tier: c[3], owner: c[4] };
    });
    function coId(name) { return companies.filter(function (c) { return c.name === name; })[0].id; }

    var ct = [
      ["Olivia", "Sanjo", "Sterling bank", "Head of Trade Services", "803 377 5043", "olivia.sanjo@sterling.ng"],
      ["Tunde", "Bakare", "Kliqs consulting", "Operations Lead", "802 556 1180", "tunde@kliqs.co"],
      ["Ifeoma", "Nwosu", "Limeswood", "Procurement Manager", "805 210 7741", "ifeoma@limeswood.com"],
      ["Mr", "A", "Micro press computers ltd", "Director", "802 737 4120", "apressltd@yahoo.com"],
      ["Michael", "Akamo", "Agventure commodities limited", "Export Manager", "703 256 0912", "m.akamo@agventure.ng"],
      ["Francis", "Ifeajika", "Cdk industries", "Import & Export Manager", "806 423 3301", "francis.ifeajika@cdk.com"],
      ["Mr", "Christain", "Autochek", "Logistics Manager", "803 370 9915", "christain@autochek.africa"],
      ["Adebayo", "Samuel", "Broadgrain africa", "Procurement Manager", "803 055 1277", "s.adebayo@broadgrain.africa"],
      ["Kemi", "Lawal", "Silver star", "Supply Chain Lead", "809 114 6650", "kemi@silverstar.ng"],
      ["Chinedu", "Obi", "Bejoice shipping", "Commercial Manager", "813 772 0045", "chinedu@bejoiceshipping.com"],
      ["Goshen", "Agro", "Goshen agro", "Owner", "703 256 0001", "goshenagro@gmail.com"],
      ["Green", "Lab", "Greenbles agtech", "Founder", "807 562 4411", "greenblesagtech@gmail.com"]
    ];
    var contacts = ct.map(function (c) {
      return { id: uid("ct"), first: c[0], last: c[1], companyId: coId(c[2]), title: c[3], phone: c[4], email: c[5] };
    });
    function ctFor(companyId) { return contacts.filter(function (c) { return c.companyId === companyId; })[0].id; }

    var d = [
      ["Sterling bank", 0, "SME", "prospect", "30-10-2026"],
      ["Agventure commodities limited", 0, "SME", "prospect", "19-10-2026"],
      ["Broadgrain africa", 0, "Enterprise", "prospect", "13-10-2026"],
      ["Goshen agro", 1250, "SME", "prospect", "31-10-2026"],
      ["Kliqs consulting", 0, "SME", "contacted", "29-10-2026"],
      ["Kliqs consulting", 0, "SME", "contacted", "28-10-2026"],
      ["Kliqs consulting", 0, "Enterprise", "contacted", "27-10-2026"],
      ["Greenbles agtech", 2800, "SME", "contacted", "26-10-2026"],
      ["Limeswood", 4200, "Enterprise", "qualified", "22-10-2026"],
      ["Cdk industries", 3515, "SME", "qualified", "19-10-2026"],
      ["Silver star", 6350, "SME", "qualified", "14-10-2026"],
      ["Kliqs consulting", 19000, "Growth", "quote", "29-10-2026"],
      ["Kliqs consulting", 3165, "Enterprise", "quote", "27-10-2026"],
      ["Bejoice shipping", 7025, "Growth", "quote", "26-10-2026"],
      ["Micro press computers ltd", 1900, "SME", "closed", "23-10-2026", "won"],
      ["Autochek", 2550, "SME", "closed", "28-10-2026", "lost", "High rate and response time"],
      ["Autochek", 2150, "SME", "closed", "21-10-2026", "won"]
    ];
    var deals = d.map(function (x, i) {
      var cid = coId(x[0]);
      var company = companies.filter(function (c) { return c.id === cid; })[0];
      return {
        id: uid("dl"), companyId: cid, contactId: ctFor(cid), value: x[1], tier: x[2],
        product: PRODUCTS[i % PRODUCTS.length], owner: company.owner, stage: x[3], created: x[4],
        outcome: x[5] || null, note: x[6] || ""
      };
    });

    // Example comments left when deals were moved
    deals.forEach(function (d) { d.comments = []; });
    function addC(i, from, to, text, date, by, outcome) {
      deals[i].comments.push({ from: from, to: to, outcome: outcome || null, text: text, date: date, by: by });
    }
    addC(4, "prospect", "contacted", "Intro call done. They ship 6 containers a month from Apapa.", "30-10-2026", "Aishat Jimoh");
    addC(8, "contacted", "qualified", "Budget confirmed for Q4. Decision maker is the procurement manager.", "24-10-2026", "Deborah Oje");
    addC(8, "prospect", "contacted", "Sent company profile and rate card.", "23-10-2026", "Deborah Oje");
    addC(11, "qualified", "quote", "Quote sent for 40ft ocean freight, Lagos to Rotterdam.", "31-10-2026", "Aishat Jimoh");
    addC(15, "quote", "closed", "High rate and response time", "29-10-2026", "Aishat Jimoh", "lost");
    addC(14, "quote", "closed", "PO received. First shipment booked for next week.", "25-10-2026", "Aishat Jimoh", "won");

    // Example activities, each logged against the deal's stage at the time
    var activities = [];
    function addA(i, stage, type, date, time, duration, comment, by) {
      activities.push({ id: uid("ac"), dealId: deals[i].id, stage: stage, type: type, date: date, time: time, duration: duration, comment: comment, by: by });
    }
    addA(0, "prospect", "Call", "2026-11-06", "10:00", 30, "Discovery call to understand their import volumes.", "Aishat Jimoh");
    addA(4, "contacted", "Email", "2026-10-30", "14:30", 15, "Sent company profile and FreightSaver brochure.", "Aishat Jimoh");
    addA(8, "qualified", "In-person Meeting", "2026-10-24", "11:00", 60, "Site visit at their Ikeja warehouse. Confirmed Q4 budget.", "Deborah Oje");
    addA(8, "qualified", "Call", "2026-11-07", "09:30", 20, "Follow up on rate expectations before quoting.", "Deborah Oje");
    addA(11, "quote", "Call", "2026-11-03", "15:00", 30, "Walked through the ocean freight quote line by line.", "Aishat Jimoh");
    addA(13, "quote", "TBD", "2026-11-10", "12:00", 45, "Review revised quote with their logistics lead.", "Adeshewa Adelowotan");

    return { companies: companies, contacts: contacts, deals: deals, activities: activities, stage: "prospect", screen: "pipeline" };
  }

  // ---------- Helpers ----------
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
  }
  function initials(name) {
    var parts = String(name).trim().split(/\s+/);
    return ((parts[0] || "")[0] + ((parts[1] || "")[0] || (parts[0] || "")[1] || "")).toUpperCase();
  }
  // Deterministic 4-fill avatar cycle (design/DESIGN_SYSTEM.md §08)
  function avatarClass(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return "avatar-" + ((h % 4) + 1);
  }
  function avatar(name, size) {
    return '<span class="avatar ' + (size ? "avatar-" + size + " " : "") + avatarClass(name) + '">' + esc(initials(name)) + "</span>";
  }
  function today() {
    var d = new Date();
    return String(d.getDate()).padStart(2, "0") + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + d.getFullYear();
  }
  function isEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

  function company(id) { return state.companies.filter(function (c) { return c.id === id; })[0]; }
  function contact(id) { return state.contacts.filter(function (c) { return c.id === id; })[0]; }
  function deal(id) { return state.deals.filter(function (d) { return d.id === id; })[0]; }
  function contactName(c) { return c ? c.first + " " + c.last : "—"; }
  function stageIndex(id) { for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return i; return -1; }
  function stageById(id) { return STAGES[stageIndex(id)]; }
  function nextStage(id) { return STAGES[stageIndex(id) + 1] || null; }
  function tierChip(t) { return '<span class="chip chip-' + esc(t) + '">' + esc(t) + "</span>"; }
  function outcomeChip(d) {
    if (d.outcome === "won") return '<span class="chip chip-won">' + ICON.check.replace("<svg ", '<svg width="11" height="11" ') + " Won</span>";
    if (d.outcome === "lost") return '<span class="chip chip-lost">' + ICON.cross + " Lost</span>";
    return "";
  }

  // ---------- Toast ----------
  var toastTimer, undoFn;
  function toast(msg, undo) {
    $("toastMsg").innerHTML = msg;
    undoFn = undo || null;
    $("toastUndo").hidden = !undo;
    var t = $("toast");
    t.hidden = true; void t.offsetWidth; t.hidden = false;
    $("phone").classList.add("toast-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5000);
  }
  function hideToast() {
    $("toast").hidden = true;
    $("phone").classList.remove("toast-on");
    undoFn = null;
  }
  $("toastUndo").addEventListener("click", function () {
    if (undoFn) undoFn();
    hideToast();
  });

  // ---------- Screens ----------
  function setScreen(name) {
    state.screen = name;
    ["pipeline", "companies", "activity"].forEach(function (s) {
      $("screen-" + s).hidden = s !== name;
    });
    document.querySelectorAll(".nav-btn").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-screen") === name);
    });
    $("screenTitle").textContent = $("screen-" + name).getAttribute("data-title");
    $("fabLabel").textContent = { pipeline: "New deal", companies: "Add company", activity: "Add activity" }[name];
    $("screens").scrollTop = 0;
  }
  document.querySelectorAll(".nav-btn").forEach(function (b) {
    b.addEventListener("click", function () { setScreen(b.getAttribute("data-screen")); });
  });
  $("fab").addEventListener("click", function () {
    if (state.screen === "pipeline") openNewDeal();
    else if (state.screen === "companies") openAddCompany();
    else openActivity(null);
  });

  // ---------- Pipeline ----------


  function dealMatches(d, q) {
    if (!q) return true;
    var c = company(d.companyId);
    return (c.name + " " + d.owner + " " + d.product + " " + contactName(contact(d.contactId))).toLowerCase().indexOf(q) !== -1;
  }

  function renderStages() {
    var q = $("dealSearch").value.trim().toLowerCase();
    $("stageStrip").innerHTML = STAGES.map(function (s, i) {
      var n = state.deals.filter(function (d) { return d.stage === s.id && dealMatches(d, q); }).length;
      return '<button type="button" role="tab" class="stage-chip' + (state.stage === s.id ? " active" : "") +
        '" aria-selected="' + (state.stage === s.id) + '" data-stage="' + s.id + '" style="--bar:' + s.bar + '">' +
        '<span class="stage-num">' + (i + 1) + "</span>" + esc(s.name) + '<span class="stage-count">' + n + "</span></button>";
    }).join("");
  }

  function dealCard(d, freshId) {
    var c = company(d.companyId);
    var foot = d.stage === "closed"
      ? '<span class="stage-select is-final outcome-' + d.outcome + '">' + (d.outcome === "won" ? ICON.check + "Closed · Won" : ICON.cross + "Closed · Lost") + "</span>"
      : '<button type="button" class="stage-select" data-stage-menu="' + d.id + '" aria-haspopup="menu" aria-label="Change stage for ' + esc(c.name) + ', currently ' + esc(stageById(d.stage).name) + '">' +
      '<span class="stage-dot" style="background:' + stageById(d.stage).bar + '"></span>' + esc(stageById(d.stage).name) + ICON.chevron + "</button>";
    return '<article class="deal-card' + (d.id === freshId ? " fresh" : "") + '" data-deal="' + d.id + '" tabindex="0">' +
      '<div class="deal-top"><h3>' + esc(c.name) + '</h3><span class="deal-value">' + money(d.value) + "</span></div>" +
      '<div class="deal-meta"><span class="owner">' + avatar(d.owner, "xs") + "<span>" + esc(d.owner) + "</span></span>" + tierChip(d.tier) + "</div>" +
      (d.note ? '<p class="deal-note">' + esc(d.note) + "</p>" : "") +
      '<div class="deal-foot"><span class="muted">Created ' + esc(d.created) + "</span>" + foot + "</div></article>";
  }

  function renderDeals(freshId) {
    var q = $("dealSearch").value.trim().toLowerCase();
    var st = stageById(state.stage);
    var list = state.deals.filter(function (d) { return d.stage === state.stage && dealMatches(d, q); });
    var total = list.reduce(function (a, d) { return a + (Number(d.value) || 0); }, 0);
    var extra = "";
    if (state.stage === "closed") {
      var w = list.filter(function (d) { return d.outcome === "won"; }).length;
      extra = " · " + w + " won · " + (list.length - w) + " lost";
    }
    $("stageSummary").innerHTML = "<b>" + esc(st.name) + "</b> · " + list.length + " deal" + (list.length === 1 ? "" : "s") + " · " + money(total) + extra;
    $("dealList").innerHTML = list.length
      ? list.map(function (d) { return dealCard(d, freshId); }).join("")
      : '<div class="empty"><b>No deals in ' + esc(st.name) + "</b>" + (q ? "Try a different search." : "Move a deal here or create a new one.") + "</div>";
  }

  function renderPipeline(freshId) {
    renderStages(); renderDeals(freshId);
    var active = document.querySelector(".stage-chip.active");
    if (active) active.scrollIntoView({ block: "nearest", inline: "center" });
  }

  $("dealSearch").addEventListener("input", function () { renderStages(); renderDeals(); });
  $("stageStrip").addEventListener("click", function (e) {
    var b = e.target.closest("[data-stage]");
    if (!b) return;
    state.stage = b.getAttribute("data-stage");
    renderStages(); renderDeals();
    b.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  });
  $("dealList").addEventListener("click", function (e) {
    var mv = e.target.closest("[data-stage-menu]");
    if (mv) { e.stopPropagation(); openStageMenu(mv); return; }
    var card = e.target.closest("[data-deal]");
    if (card) openDeal(card.getAttribute("data-deal"));
  });
  $("dealList").addEventListener("keydown", function (e) {
    if (e.key !== "Enter" || e.target.closest("button")) return;
    var card = e.target.closest("[data-deal]");
    if (card) openDeal(card.getAttribute("data-deal"));
  });

  // Moving deals
  function moveTo(id, toStage, outcome, comment) {
    var d = deal(id);
    if (!d || d.stage === toStage && !outcome) return;
    if (stageIndex(toStage) < stageIndex(d.stage)) return; // deals only move forward
    if (toStage === "closed" && !outcome) { openMove(id, toStage); return; }
    var prev = { stage: d.stage, outcome: d.outcome, note: d.note };
    var entry = { from: d.stage, to: toStage, outcome: outcome || null, text: comment || "", date: today(), by: "Nkechi" };
    var card = document.querySelector('.deal-card[data-deal="' + id + '"]');
    var apply = function () {
      d.stage = toStage;
      d.outcome = toStage === "closed" ? outcome : null;
      d.note = toStage === "closed" && outcome === "lost" ? (comment || "") : "";
      d.comments = d.comments || [];
      d.comments.unshift(entry);
      renderPipeline();
      if ($("dealSheet").classList.contains("open")) renderDealSheet(id);
      var c = company(d.companyId);
      var label = toStage === "closed" ? "closed as " + (outcome === "won" ? "Won" : "Lost") : "moved to " + stageById(toStage).name;
      toast("<b>" + esc(c.name) + "</b> " + label, function () {
        d.stage = prev.stage; d.outcome = prev.outcome; d.note = prev.note;
        d.comments = d.comments.filter(function (x) { return x !== entry; });
        renderPipeline();
        if ($("dealSheet").classList.contains("open")) renderDealSheet(id);
      });
    };
    if (card && !$("dealSheet").classList.contains("open")) {
      card.classList.add("leaving");
      setTimeout(apply, 220);
    } else apply();
  }

  // ---------- Stage dropdown on deal cards ----------
  var menuDealId = null, menuBtn = null;
  function openStageMenu(btn) {
    var id = btn.getAttribute("data-stage-menu");
    if (menuDealId === id) { closeStageMenu(); return; }
    closeStageMenu();
    menuDealId = id; menuBtn = btn;
    var d = deal(id);
    var menu = $("stageMenu");
    menu.innerHTML = '<p class="stage-menu-head">Move deal to</p>' + STAGES.filter(function (s) { return s.id !== "closed"; }).map(function (s, i) {
      var cur = s.id === d.stage, past = i < stageIndex(d.stage);
      return '<button type="button" role="menuitemradio" aria-checked="' + cur + '" class="stage-opt' + (cur ? " current" : "") + (past ? " past" : "") + '"' +
        (past ? ' disabled aria-disabled="true"' : ' data-to="' + s.id + '"') + ">" +
        '<span class="stage-num">' + (i + 1) + "</span><span class=\"stage-opt-name\">" + esc(s.name) +
        (past ? "<small>Completed</small>" : "") + "</span>" +
        (cur ? '<span class="pick-check">' + ICON.check + "</span>" : "") + "</button>";
    }).join("") +
      '<p class="stage-menu-head">Close deal</p>' +
      '<button type="button" role="menuitem" class="stage-opt opt-won" data-to="closed" data-outcome="won"><span class="stage-num">' + ICON.check + '</span><span class="stage-opt-name">Closed · Won<small>Customer accepted</small></span></button>' +
      '<button type="button" role="menuitem" class="stage-opt opt-lost" data-to="closed" data-outcome="lost"><span class="stage-num">' + ICON.cross + '</span><span class="stage-opt-name">Closed · Lost<small>Add a reason</small></span></button>';
    menu.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    var phone = $("phone").getBoundingClientRect(), r = btn.getBoundingClientRect();
    var mh = menu.offsetHeight, mw = menu.offsetWidth;
    var top = r.bottom - phone.top + 6;
    if (r.bottom + mh + 90 > phone.bottom) top = r.top - phone.top - mh - 6; // open upward near the bottom
    menu.style.top = top + "px";
    menu.style.left = Math.max(12, r.right - phone.left - mw) + "px";
    var first = menu.querySelector(".stage-opt:not(.current)");
    if (first) first.focus({ preventScroll: true });
  }
  function closeStageMenu() {
    $("stageMenu").hidden = true;
    if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
    menuDealId = null; menuBtn = null;
  }
  $("stageMenu").addEventListener("click", function (e) {
    var o = e.target.closest("[data-to]");
    if (!o) return;
    var id = menuDealId, to = o.getAttribute("data-to"), outcome = o.getAttribute("data-outcome");
    closeStageMenu();
    if (deal(id).stage !== to || outcome) openMove(id, to, outcome);
  });
  document.addEventListener("click", function (e) {
    if (menuDealId && !e.target.closest("#stageMenu") && !e.target.closest("[data-stage-menu]")) closeStageMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menuDealId) { closeStageMenu(); e.stopImmediatePropagation(); }
  }, true);
  $("screens").addEventListener("scroll", closeStageMenu, { passive: true });

  // ---------- Sheet manager (stackable) ----------
  var stack = [];
  function openSheet(id) {
    var host = $(id);
    if (stack.indexOf(id) !== -1) return;
    stack.push(id);
    host.style.zIndex = 50 + stack.length * 2;
    host.hidden = false;
    void host.offsetWidth;
    host.classList.add("open");
    var focusable = host.querySelector(".sheet-body input:not([disabled]), .sheet-body button:not([disabled]), .sheet-body select");
    setTimeout(function () { if (focusable && id === "pickerSheet") focusable.focus(); }, 280);
  }
  function closeSheet(id) {
    var host = $(id);
    stack = stack.filter(function (s) { return s !== id; });
    host.classList.remove("open");
    setTimeout(function () { if (!host.classList.contains("open")) host.hidden = true; }, 280);
  }
  document.querySelectorAll(".sheet-host").forEach(function (host) {
    host.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) closeSheet(host.id);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && stack.length) closeSheet(stack[stack.length - 1]);
  });

  // ---------- Deal detail ----------
  var openDealId = null;
  function openDeal(id) {
    openDealId = id;
    renderDealSheet(id);
    openSheet("dealSheet");
  }
  function renderDealSheet(id) {
    var d = deal(id), c = company(d.companyId), ct = contact(d.contactId);
    var idx = stageIndex(d.stage);
    $("dealSheetTitle").textContent = c.name;
    $("dealSheetSub").textContent = d.product + " · Created " + d.created;

    $("dealSheetBody").innerHTML =
      '<div class="detail-hero"><div><span class="kpi-label">Deal value</span><span class="detail-value">' + money(d.value) + "</span></div>" +
      '<div>' + tierChip(d.tier) + " " + outcomeChip(d) + "</div></div>" +
      stageStatus(d, idx) +
      activitiesBlock(d) +
      commentsBlock(d) +
      '<p class="section-title">Contact</p>' +
      contactCard(ct) +
      '<p class="section-title">Details</p><dl class="info-card">' +
      '<div class="info-row"><dt>Owner</dt><dd><span class="owner">' + avatar(d.owner, "xs") + "<span>" + esc(d.owner) + "</span></span></dd></div>" +
      '<div class="info-row"><dt>Product</dt><dd><span class="chip chip-mode">' + esc(d.product) + "</span></dd></div>" +
      '<div class="info-row"><dt>Company email</dt><dd>' + esc(c.email || "—") + "</dd></div>" +
      '<div class="info-row"><dt>Industry</dt><dd>' + esc(c.industry || "—") + "</dd></div></dl>";

  }
  function stageStatus(d, idx) {
    var label = d.stage === "closed" ? "Closed · " + (d.outcome === "won" ? "Won" : "Lost") : stageById(d.stage).name;
    var cls = d.outcome === "won" ? " is-won" : d.outcome === "lost" ? " is-lost" : "";
    return '<div class="stage-status' + cls + '"><span class="kpi-label">Deal stage</span>' +
      '<div class="stage-status-row"><span class="stage-pill"><span class="stage-num">' + (idx + 1) + "</span>" + esc(label) + "</span>" +
      '<span class="muted">Stage ' + (idx + 1) + " of " + STAGES.length + "</span></div></div>";
  }
  function stageLabel(c) {
    return c.to === "closed" ? "Closed · " + (c.outcome === "won" ? "Won" : "Lost") : stageById(c.to).name;
  }
  function commentsBlock(d) {
    var list = d.comments || [];
    return '<p class="section-title">Comments · ' + list.length + "</p>" +
      (list.length ? '<ol class="comments">' + list.map(function (c) {
        return '<li class="comment"><div class="comment-head">' + avatar(c.by, "xs") + "<b>" + esc(c.by) + "</b>" +
          '<span class="muted">' + esc(c.date) + "</span></div>" +
          '<p class="comment-move">' + esc(stageById(c.from).name) + " → " + esc(stageLabel(c)) + "</p>" +
          (c.text ? '<p class="comment-text">' + esc(c.text) + "</p>" : '<p class="comment-text muted">No comment added</p>') + "</li>";
      }).join("") + "</ol>"
        : '<p class="muted comments-empty">No comments yet. Add one when you move this deal to a later stage.</p>');
  }
  function contactCard(ct) {
    if (!ct) return '<p class="muted">No contact linked.</p>';
    var row = function (icon, label, value) {
      return '<div class="contact-line"><span class="contact-ico">' + icon + '</span>' +
        '<span class="contact-val"><small>' + label + "</small><span>" + esc(value) + "</span></span></div>";
    };
    return '<div class="contact-card">' +
      '<div class="contact-head">' + avatar(contactName(ct), "sm") + "<div><b>" + esc(contactName(ct)) + "</b><small>" + esc(ct.title || "—") + "</small></div></div>" +
      row(ICON.phone, "Phone", "+234 " + ct.phone) +
      row(ICON.mail, "Email", ct.email) +
      "</div>";
  }

  // ---------- Close-out ----------
  // Every stage move goes through this sheet so the user can add a comment.
  var moveDealId = null, moveTarget = null;
  function openMove(id, to, outcome) {
    var d = deal(id);
    moveDealId = id; moveTarget = to;
    var closing = to === "closed";
    $("outcomeTitle").textContent = closing ? "Close deal" : "Move to " + stageById(to).name;
    $("outcomeSub").textContent = company(d.companyId).name + " · " + money(d.value);
    $("movePath").innerHTML = '<span class="chip chip-mode">' + esc(stageById(d.stage).name) + "</span>" + ICON.arrow +
      '<span class="chip chip-primary" id="moveTo">' + esc(closing ? "Closed" : stageById(to).name) + "</span>";
    $("outcomeOptions").hidden = !closing;
    document.querySelectorAll('input[name="outcome"]').forEach(function (r) { r.checked = r.value === outcome; });
    $("moveComment").value = "";
    syncMoveSheet();
    openSheet("outcomeSheet");
    setTimeout(function () { $("moveComment").focus(); }, 300);
  }
  function syncMoveSheet() {
    var sel = document.querySelector('input[name="outcome"]:checked');
    var closing = moveTarget === "closed";
    var lost = closing && sel && sel.value === "lost";
    $("moveCommentLabel").innerHTML = lost ? "Reason lost <em>optional</em>" : "Comment <em>optional</em>";
    $("moveComment").placeholder = lost ? "e.g. High rate and response time" : closing ? "e.g. PO received, shipment booked" : "e.g. Called the client, they want a quote by Friday";
    if (closing && sel) $("moveTo").textContent = "Closed · " + (sel.value === "won" ? "Won" : "Lost");
    $("outcomeConfirm").textContent = closing ? "Close deal" : "Move deal";
    $("outcomeConfirm").disabled = closing && !sel;
  }
  document.querySelectorAll('input[name="outcome"]').forEach(function (r) { r.addEventListener("change", syncMoveSheet); });
  $("outcomeConfirm").addEventListener("click", function () {
    var sel = document.querySelector('input[name="outcome"]:checked');
    if (moveTarget === "closed" && !sel) return;
    closeSheet("outcomeSheet");
    moveTo(moveDealId, moveTarget, moveTarget === "closed" ? sel.value : null, $("moveComment").value.trim());
  });

  // ---------- Picker ----------
  var picker = null;
  function openPicker(opts) {
    picker = opts;
    $("pickerTitle").textContent = opts.title;
    $("pickerSearch").value = "";
    $("pickerSearch").placeholder = opts.placeholder || "Search…";
    renderPicker();
    openSheet("pickerSheet");
  }
  function renderPicker() {
    var q = $("pickerSearch").value.trim();
    var ql = q.toLowerCase();
    var items = picker.items().filter(function (it) { return !ql || (it.label + " " + (it.sub || "")).toLowerCase().indexOf(ql) !== -1; });
    var html = "";
    if (picker.createLabel) {
      html += '<button type="button" class="pick pick-create" data-create><span class="plus">' + ICON.plus + '</span><span class="row-main"><span class="row-title">' +
        esc(picker.createLabel(q)) + '</span><span class="row-sub">' + esc(picker.createSub || "") + "</span></span></button>";
    }
    html += items.map(function (it) {
      return '<button type="button" class="pick" role="option" data-pick="' + it.id + '">' + avatar(it.label, "sm") +
        '<span class="row-main"><span class="row-title">' + esc(it.label) + '</span><span class="row-sub">' + esc(it.sub || "") + "</span></span>" +
        (picker.selected === it.id ? '<span class="pick-check">' + ICON.check + "</span>" : "") + "</button>";
    }).join("");
    if (!items.length && !(q && picker.createLabel)) html += '<p class="picker-empty">' + (q ? "No match for “" + esc(q) + "”." : "Nothing here yet.") + "</p>";
    $("pickerList").innerHTML = html;
  }
  $("pickerSearch").addEventListener("input", renderPicker);
  $("pickerList").addEventListener("click", function (e) {
    var cr = e.target.closest("[data-create]");
    var pk = e.target.closest("[data-pick]");
    if (!cr && !pk) return;
    var p = picker;
    var q = $("pickerSearch").value.trim();
    closeSheet("pickerSheet");
    if (cr) p.onCreate(q); else p.onPick(pk.getAttribute("data-pick"));
  });

  function setPickerBtn(btn, label, placeholder) {
    btn.classList.toggle("has-value", !!label);
    btn.querySelector("span").outerHTML = label
      ? '<span class="pv">' + avatar(label, "xs") + "<span>" + esc(label) + "</span></span>"
      : "<span>" + esc(placeholder) + "</span>";
  }

  function companyItems() {
    return state.companies.map(function (c) {
      return { id: c.id, label: c.name, sub: c.tier + " · " + c.industry };
    });
  }

  // ---------- Selects ----------
  function fillSelect(sel, values, placeholder) {
    sel.innerHTML = (placeholder ? '<option value="">' + esc(placeholder) + "</option>" : "") +
      values.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + "</option>"; }).join("");
  }
  function syncSelectPlaceholder(sel) { sel.classList.toggle("placeholder", !sel.value); }
  document.querySelectorAll(".field-select select").forEach(function (s) {
    s.addEventListener("change", function () { syncSelectPlaceholder(s); });
  });

  // ---------- New deal ----------
  var nd;
  function resetNewDeal(prefCompanyId) {
    nd = { companyId: null, newCompany: false, contactId: null, newContact: false };
    $("newDealForm").reset();
    ["ndCoName", "ndCoEmail", "ndCoIndustry", "ndCtFirst", "ndCtLast", "ndCtTitle", "ndCtPhone", "ndCtEmail", "ndValue"].forEach(function (id) { $(id).value = ""; });
    fillSelect($("ndClass"), TIERS, "Select class");
    fillSelect($("ndProduct"), PRODUCTS);
    $("ndProduct").value = "FreightSaver";
    fillSelect($("ndOwner"), OWNERS, "Select owner");
    clearErrors($("newDealForm"));
    if (prefCompanyId) selectNdCompany(prefCompanyId); else renderNd();
  }
  function selectNdCompany(id) {
    nd.companyId = id; nd.newCompany = false;
    nd.contactId = null; nd.newContact = false;
    var c = company(id);
    $("ndClass").value = c.tier;
    if (!$("ndOwner").value) $("ndOwner").value = c.owner;
    var cts = state.contacts.filter(function (x) { return x.companyId === id; });
    if (cts.length === 1) nd.contactId = cts[0].id;
    if (!cts.length) nd.newContact = true;
    renderNd();
  }
  function renderNd() {
    var coBtn = $("ndCompanyBtn"), ctBtn = $("ndContactBtn");
    setPickerBtn(coBtn, nd.companyId ? company(nd.companyId).name : "", "Search companies…");
    $("ndCoExisting").hidden = nd.newCompany;
    $("ndNewCompany").hidden = !nd.newCompany;

    // A brand-new company has no contacts yet, so its contact must be new too.
    if (nd.newCompany) nd.newContact = true;
    ctBtn.disabled = !nd.companyId;
    $("ndContactField").classList.toggle("is-disabled", ctBtn.disabled);
    $("ndContactField").hidden = nd.newContact;
    $("ndContactHint").hidden = !nd.newCompany;
    if (nd.contactId) setPickerBtn(ctBtn, contactName(contact(nd.contactId)), "");
    else setPickerBtn(ctBtn, "", nd.companyId ? "Select a contact" : "Select a company first");
    $("ndNewContact").hidden = !nd.newContact;

    document.querySelectorAll("#newDealForm [data-seg]").forEach(function (b) {
      var isNew = b.getAttribute("data-seg") === "company" ? nd.newCompany : nd.newContact;
      var on = (b.getAttribute("data-val") === "new") === isNew;
      b.classList.toggle("active", on);
      b.setAttribute("aria-checked", String(on));
      b.disabled = b.getAttribute("data-seg") === "contact" && b.getAttribute("data-val") === "existing" && nd.newCompany;
    });
    document.querySelectorAll("#newDealForm select").forEach(syncSelectPlaceholder);
    validateNd();
  }
  function ndValid() {
    var ok = true;
    if (nd.newCompany) ok = ok && $("ndCoName").value.trim() && $("ndCoIndustry").value.trim();
    else ok = ok && nd.companyId;
    if (nd.newContact) ok = ok && $("ndCtFirst").value.trim() && $("ndCtLast").value.trim() && $("ndCtPhone").value.trim() && $("ndCtEmail").value.trim();
    else ok = ok && nd.contactId;
    return !!(ok && $("ndClass").value && $("ndProduct").value && $("ndOwner").value);
  }
  function validateNd() { $("ndSubmit").disabled = !ndValid(); }

  function openNewDeal(prefCompanyId) {
    resetNewDeal(prefCompanyId);
    openSheet("newDealSheet");
  }

  $("ndCompanyBtn").addEventListener("click", function () {
    openPicker({
      title: "Company",
      placeholder: "Search companies…",
      items: companyItems,
      selected: nd.companyId,
      createLabel: function (q) { return q ? "Add “" + q + "” as a new company" : "Add a new company"; },
      createSub: "Enter its details and first contact in this deal",
      onPick: selectNdCompany,
      onCreate: function (q) {
        nd.companyId = null; nd.newCompany = true; nd.contactId = null; nd.newContact = true;
        $("ndCoName").value = q;
        renderNd();
        setTimeout(function () { (q ? $("ndCoIndustry") : $("ndCoName")).focus(); }, 300);
      }
    });
  });
  $("ndContactBtn").addEventListener("click", function () {
    if (!nd.companyId) return;
    var cid = nd.companyId;
    openPicker({
      title: "Contact at " + company(cid).name,
      placeholder: "Search contacts…",
      items: function () {
        return state.contacts.filter(function (c) { return c.companyId === cid; })
          .map(function (c) { return { id: c.id, label: contactName(c), sub: c.title }; });
      },
      selected: nd.contactId,
      createLabel: function (q) { return q ? "Add “" + q + "” as a new contact" : "Add a new contact"; },
      createSub: "Linked to " + company(cid).name,
      onPick: function (id) { nd.contactId = id; nd.newContact = false; renderNd(); },
      onCreate: function (q) {
        nd.contactId = null; nd.newContact = true;
        var parts = q.split(/\s+/);
        $("ndCtFirst").value = parts[0] || "";
        $("ndCtLast").value = parts.slice(1).join(" ");
        renderNd();
        setTimeout(function () { $("ndCtFirst").focus(); }, 300);
      }
    });
  });
  $("newDealForm").addEventListener("click", function (e) {
    var b = e.target.closest("[data-seg]");
    if (!b || b.disabled) return;
    var isNew = b.getAttribute("data-val") === "new";
    if (b.getAttribute("data-seg") === "company") {
      if (isNew === nd.newCompany) return;
      nd.newCompany = isNew;
      nd.companyId = null; nd.contactId = null;
      nd.newContact = isNew;
      renderNd();
      if (isNew) setTimeout(function () { $("ndCoName").focus(); }, 50);
    } else {
      nd.newContact = isNew;
      if (isNew) nd.contactId = null;
      renderNd();
      if (isNew) setTimeout(function () { $("ndCtFirst").focus(); }, 50);
    }
  });
  $("newDealForm").addEventListener("input", function (e) {
    validateNd();
    clearFieldError(e.target);
  });
  $("newDealForm").addEventListener("change", validateNd);

  $("newDealForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!ndValid()) return;
    var bad = false;
    if (nd.newCompany && $("ndCoEmail").value.trim() && !isEmail($("ndCoEmail").value.trim())) bad = fieldError($("ndCoEmail"), "Enter a valid email") || true;
    if (nd.newContact && !isEmail($("ndCtEmail").value.trim())) bad = fieldError($("ndCtEmail"), "Enter a valid email") || true;
    if (bad) return;

    var owner = $("ndOwner").value, tier = $("ndClass").value;
    var made = [];
    var coId = nd.companyId;
    if (nd.newCompany) {
      var co = { id: uid("co"), name: $("ndCoName").value.trim(), email: $("ndCoEmail").value.trim(), address: "", industry: $("ndCoIndustry").value.trim(), tier: tier, owner: owner };
      state.companies.unshift(co); coId = co.id; made.push("company");
    }
    var ctId = nd.contactId;
    if (nd.newContact) {
      var ct = { id: uid("ct"), first: $("ndCtFirst").value.trim(), last: $("ndCtLast").value.trim(), companyId: coId, title: $("ndCtTitle").value.trim(), phone: $("ndCtPhone").value.trim(), email: $("ndCtEmail").value.trim() };
      state.contacts.unshift(ct); ctId = ct.id; made.push("contact");
    }
    var d = { id: uid("dl"), companyId: coId, contactId: ctId, value: parseFloat($("ndValue").value.replace(/[^0-9.]/g, "")) || 0, tier: tier, product: $("ndProduct").value, owner: owner, stage: "prospect", created: today(), outcome: null, note: "" };
    state.deals.unshift(d);

    closeSheet("newDealSheet");
    closeSheet("companyDetailSheet");
    setScreen("pipeline");
    state.stage = "prospect";
    $("dealSearch").value = "";
    renderPipeline(d.id);
    renderCompanies(); renderActivity();
    toast("Deal created for <b>" + esc(company(coId).name) + "</b> in Prospect" + (made.length ? " · new " + made.join(" & ") + " added" : ""));
  });

  // ---------- Errors ----------
  function fieldError(input, msg) {
    var f = input.closest(".field");
    f.classList.add("has-error");
    var s = f.querySelector(".err");
    if (s) s.textContent = msg;
    input.focus();
  }
  function clearFieldError(input) {
    var f = input.closest && input.closest(".field");
    if (!f) return;
    f.classList.remove("has-error");
    var s = f.querySelector(".err");
    if (s) s.textContent = "";
  }
  function clearErrors(form) { form.querySelectorAll(".has-error").forEach(function (f) { f.classList.remove("has-error"); }); form.querySelectorAll(".err").forEach(function (s) { s.textContent = ""; }); }

  // ---------- Companies ----------
  var freshCompany = null;
  function renderCompanies() {
    var q = $("companySearch").value.trim().toLowerCase();
    var list = state.companies.filter(function (c) { return !q || (c.name + " " + c.email + " " + c.industry).toLowerCase().indexOf(q) !== -1; });
    $("companySummary").innerHTML = "<b>" + state.companies.length + "</b> companies registered";
    $("companyList").innerHTML = list.length ? list.map(function (c) {
      var n = state.deals.filter(function (d) { return d.companyId === c.id; }).length;
      return '<button type="button" class="row' + (c.id === freshCompany ? " fresh" : "") + '" data-company="' + c.id + '">' + avatar(c.name) +
        '<span class="row-main"><span class="row-title">' + esc(c.name) + '</span><span class="row-sub">' + esc(c.email || c.industry) + "</span></span>" +
        '<span class="row-side">' + tierChip(c.tier) + '<span class="muted">' + n + " deal" + (n === 1 ? "" : "s") + "</span></span></button>";
    }).join("") : '<div class="empty" style="border:0"><b>No companies found</b>Try a different search.</div>';
    freshCompany = null;
  }
  $("companySearch").addEventListener("input", renderCompanies);
  $("companyList").addEventListener("click", function (e) {
    var r = e.target.closest("[data-company]");
    if (r) openCompanyDetail(r.getAttribute("data-company"));
  });

  var detailCompanyId = null;
  function openCompanyDetail(id) {
    detailCompanyId = id;
    var c = company(id);
    $("cdHead").innerHTML = avatar(c.name, "lg") + '<div style="min-width:0"><h2 id="cdTitle">' + esc(c.name) + '</h2><p class="sheet-sub">' + esc(c.industry) + " · " + tierChip(c.tier) + "</p></div>";
    var cts = state.contacts.filter(function (x) { return x.companyId === id; });
    var dls = state.deals.filter(function (x) { return x.companyId === id; });
    $("cdBody").innerHTML =
      '<p class="section-title">Company details</p><dl class="info-card">' +
      '<div class="info-row"><dt>Company name</dt><dd>' + esc(c.name) + "</dd></div>" +
      '<div class="info-row"><dt>Class</dt><dd>' + tierChip(c.tier) + "</dd></div>" +
      '<div class="info-row"><dt>Deal owner</dt><dd><span class="owner">' + avatar(c.owner, "xs") + "<span>" + esc(c.owner) + "</span></span></dd></div>" +
      '<div class="info-row"><dt>Industry</dt><dd>' + esc(c.industry || "—") + "</dd></div>" +
      '<div class="info-row"><dt>Email</dt><dd>' + esc(c.email || "—") + "</dd></div>" +
      '<div class="info-row"><dt>Address</dt><dd>' + esc(c.address || "—") + "</dd></div></dl>" +
      '<p class="section-title">Contacts · ' + cts.length + "</p>" +
      (cts.length ? cts.map(function (x) { return contactCard(x); }).join("") : '<p class="muted" style="margin:0 0 18px">No contacts yet.</p>') +
      '<div class="deal-count"><span>Deals</span><b>' + dls.length + "</b><small>" + (dls.length === 1 ? "deal" : "deals") + " tied to this company</small></div>";
    openSheet("companyDetailSheet");
  }
  $("cdNewDeal").addEventListener("click", function () { openNewDeal(detailCompanyId); });

  function openAddCompany() {
    $("companyForm").reset();
    clearErrors($("companyForm"));
    fillSelect($("coTier"), TIERS);
    $("coTier").value = "SME";
    fillSelect($("coOwner"), OWNERS, "Select owner");
    syncSelectPlaceholder($("coOwner"));
    validateCo();
    openSheet("companySheet");
  }
  function validateCo() {
    $("coSubmit").disabled = !($("coName").value.trim() && $("coIndustry").value.trim() && $("coTier").value && $("coOwner").value);
  }
  $("companyForm").addEventListener("input", function (e) { validateCo(); clearFieldError(e.target); });
  $("companyForm").addEventListener("change", validateCo);
  $("companyForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var em = $("coEmail").value.trim();
    if (em && !isEmail(em)) { fieldError($("coEmail"), "Enter a valid email"); return; }
    var c = { id: uid("co"), name: $("coName").value.trim(), email: em, address: $("coAddress").value.trim(), industry: $("coIndustry").value.trim(), tier: $("coTier").value, owner: $("coOwner").value };
    state.companies.unshift(c);
    freshCompany = c.id;
    closeSheet("companySheet");
    setScreen("companies");
    $("companySearch").value = "";
    renderCompanies();
    toast("<b>" + esc(c.name) + "</b> added to companies");
  });

  // ---------- Contacts ----------
  // ---------- Activities ----------
  var TYPE_ICON = {
    "Call": ICON.phone,
    "Email": ICON.mail,
    "In-person Meeting": '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M3 20a6 6 0 0112 0M16 5.5a3 3 0 010 5.6M18 20a5 5 0 00-2.5-4.3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg>',
    "TBD": '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="15" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 10h16M9 3v4M15 3v4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  function activityWhen(a) { return new Date(a.date + "T" + (a.time || "00:00")); }
  function isUpcoming(a) { return activityWhen(a) > new Date(); }
  function fmtDate(iso) { var p = iso.split("-"); return p[2] + "-" + p[1] + "-" + p[0]; }
  function activityItem(a, showDeal) {
    var d = deal(a.dealId), up = isUpcoming(a);
    return '<li class="activity' + (showDeal ? " is-link" : "") + '"' + (showDeal ? ' data-activity-deal="' + a.dealId + '" tabindex="0"' : "") + ">" +
      '<span class="act-ico">' + (TYPE_ICON[a.type] || TYPE_ICON.TBD) + "</span>" +
      '<div class="act-main">' +
      '<div class="act-top"><b>' + esc(a.type) + (showDeal ? " · " + esc(company(d.companyId).name) : "") + "</b>" +
      '<span class="chip ' + (up ? "chip-upcoming" : "chip-done") + '">' + (up ? "Upcoming" : "Done") + "</span></div>" +
      '<div class="act-meta"><span>' + esc(fmtDate(a.date)) + " · " + esc(a.time) + " · " + esc(a.duration) + ' min</span><span class="chip chip-mode">' + esc(stageById(a.stage).name) + "</span></div>" +
      '<p class="act-comment">' + esc(a.comment) + "</p>" +
      '<small class="muted">Logged by ' + esc(a.by) + "</small></div></li>";
  }
  function sortActivities(list) {
    return list.slice().sort(function (x, y) { return activityWhen(y) - activityWhen(x); });
  }
  function activitiesBlock(d) {
    var list = sortActivities(state.activities.filter(function (a) { return a.dealId === d.id; }));
    var add = d.stage === "closed" ? "" : '<button type="button" class="btn-sm" data-add-activity>' + ICON.plus + "Add activity</button>";
    return '<div class="section-head"><p class="section-title">Activities · ' + list.length + "</p>" + add + "</div>" +
      (list.length ? '<ol class="activity-list">' + list.map(function (a) { return activityItem(a, false); }).join("") + "</ol>"
        : '<p class="muted comments-empty">No activities logged yet.</p>');
  }

  var activityFilter = "all";
  function setActivityFilter(f) {
    activityFilter = f;
    document.querySelectorAll("#activityFilter [data-filter]").forEach(function (b) {
      var on = b.getAttribute("data-filter") === f;
      b.classList.toggle("active", on); b.setAttribute("aria-checked", String(on));
    });
    renderActivity();
  }
  function renderActivity() {
    var all = state.activities;
    var up = all.filter(isUpcoming).length;
    $("activitySummary").innerHTML = "<b>" + all.length + "</b> activities · " + up + " upcoming";
    var list = sortActivities(all.filter(function (a) {
      return activityFilter === "all" || (activityFilter === "upcoming") === isUpcoming(a);
    }));
    $("activityList").innerHTML = list.length ? list.map(function (a) { return activityItem(a, true); }).join("")
      : '<li class="empty"><b>No activities here</b>Tap Add activity to log one against a deal.</li>';
  }
  $("activityFilter").addEventListener("click", function (e) {
    var b = e.target.closest("[data-filter]");
    if (b) setActivityFilter(b.getAttribute("data-filter"));
  });
  $("activityList").addEventListener("click", function (e) {
    var r = e.target.closest("[data-activity-deal]");
    if (r) openDeal(r.getAttribute("data-activity-deal"));
  });
  $("activityList").addEventListener("keydown", function (e) {
    var r = e.target.closest("[data-activity-deal]");
    if (r && e.key === "Enter") openDeal(r.getAttribute("data-activity-deal"));
  });
  $("dealSheetBody").addEventListener("click", function (e) {
    if (e.target.closest("[data-add-activity]")) openActivity(openDealId);
  });

  // Add activity sheet. From a deal the deal is fixed; from the Activity tab you pick one.
  var acDealId = null, acFixed = false;
  function openActivity(dealId) {
    $("activityForm").reset();
    clearErrors($("activityForm"));
    acDealId = dealId; acFixed = !!dealId;
    var t = new Date();
    $("acDate").value = t.getFullYear() + "-" + String(t.getMonth() + 1).padStart(2, "0") + "-" + String(t.getDate()).padStart(2, "0");
    $("acType").value = "Call";
    renderAcDeal();
    openSheet("activitySheet");
  }
  function renderAcDeal() {
    $("acDealField").hidden = acFixed;
    $("acDealFixed").hidden = !acFixed;
    var d = acDealId ? deal(acDealId) : null;
    if (acFixed) {
      $("acDealFixed").innerHTML = avatar(company(d.companyId).name, "sm") + '<div><b>' + esc(company(d.companyId).name) + "</b><small>" + esc(d.product) + " · " + money(d.value) + "</small></div>";
    } else setPickerBtn($("acDealBtn"), d ? company(d.companyId).name + " · " + d.product : "", "Search deals…");
    $("acStageHint").hidden = !d;
    if (d) $("acStageHint").innerHTML = "Logged to the <b>" + esc(stageById(d.stage).name) + "</b> stage";
    validateAc();
  }
  function validateAc() {
    $("acSubmit").disabled = !(acDealId && $("acType").value && $("acDate").value && $("acTime").value &&
      Number($("acDuration").value) > 0 && $("acComment").value.trim());
  }
  $("acDealBtn").addEventListener("click", function () {
    openPicker({
      title: "Deal",
      placeholder: "Search deals…",
      items: function () {
        return state.deals.filter(function (d) { return d.stage !== "closed"; }).map(function (d) {
          return { id: d.id, label: company(d.companyId).name, sub: d.product + " · " + stageById(d.stage).name + " · " + money(d.value) };
        });
      },
      selected: acDealId,
      onPick: function (id) { acDealId = id; renderAcDeal(); }
    });
  });
  $("activityForm").addEventListener("input", validateAc);
  $("activityForm").addEventListener("change", validateAc);
  $("activityForm").addEventListener("submit", function (e) {
    e.preventDefault();
    validateAc();
    if ($("acSubmit").disabled) return;
    var d = deal(acDealId);
    var a = { id: uid("ac"), dealId: d.id, stage: d.stage, type: $("acType").value, date: $("acDate").value, time: $("acTime").value,
      duration: Math.round(Number($("acDuration").value)), comment: $("acComment").value.trim(), by: "Nkechi" };
    state.activities.push(a);
    closeSheet("activitySheet");
    renderActivity();
    if ($("dealSheet").classList.contains("open") && openDealId === d.id) renderDealSheet(d.id);
    toast(esc(a.type) + " logged on <b>" + esc(company(d.companyId).name) + "</b> · " + esc(stageById(d.stage).name));
  });

  // ---------- Guided flows (desktop brief) ----------
  function closeAll() { stack.slice().forEach(closeSheet); }
  document.querySelectorAll("[data-flow]").forEach(function (b) {
    b.addEventListener("click", function () {
      closeAll();
      var f = b.getAttribute("data-flow");
      setTimeout(function () {
        if (f === "move") {
          setScreen("pipeline"); state.stage = "qualified"; renderPipeline();
          toast("Use the stage dropdown on a card to move it to a later stage");
        } else if (f === "deal") { setScreen("pipeline"); openNewDeal(); }
        else if (f === "company") { setScreen("companies"); openAddCompany(); }
        else { setScreen("activity"); openActivity(null); }
      }, 0);
    });
  });
  $("resetBtn").addEventListener("click", function () {
    closeAll();
    state = seed();
    $("dealSearch").value = ""; $("companySearch").value = ""; setActivityFilter("all");
    setScreen("pipeline");
    renderAll();
    toast("Sample data reset");
  });

  // ---------- Horizontal scrollers ----------
  function setupHScroll(wrap) {
    var track = wrap.querySelector(".stage-strip");
    var prev = wrap.querySelector(".hs-prev"), next = wrap.querySelector(".hs-next");
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      prev.classList.toggle("off", track.scrollLeft <= 4);
      next.classList.toggle("off", track.scrollLeft >= max - 4);
    }
    function step(dir) { track.scrollBy({ left: dir * track.clientWidth * 0.7, behavior: "smooth" }); }
    prev.addEventListener("click", function () { step(-1); });
    next.addEventListener("click", function () { step(1); });
    track.addEventListener("scroll", update, { passive: true });
    // Mouse wheel scrolls sideways
    track.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var max = track.scrollWidth - track.clientWidth;
      if ((e.deltaY < 0 && track.scrollLeft <= 0) || (e.deltaY > 0 && track.scrollLeft >= max)) return;
      e.preventDefault();
      track.scrollLeft += e.deltaY;
    }, { passive: false });
    // Click-and-drag with a mouse (touch already swipes natively)
    var startX = 0, startLeft = 0, down = false, moved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
    });
    window.addEventListener("pointermove", function (e) {
      if (!down) return;
      var dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 5) { moved = true; wrap.classList.add("dragging"); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener("pointerup", function () {
      if (!down) return;
      down = false;
      wrap.classList.remove("dragging");
    });
    // Swallow the click that ends a drag so it doesn't select a stage
    track.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
    new MutationObserver(update).observe(track, { childList: true });
    window.addEventListener("resize", update);
    update();
  }
  document.querySelectorAll(".hscroll").forEach(setupHScroll);

  function renderAll() { renderPipeline(); renderCompanies(); renderActivity(); }

  state = seed();
  renderAll();
  setScreen("pipeline");
})();
