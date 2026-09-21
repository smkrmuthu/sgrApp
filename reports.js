/**
 * SGR MOULDS INDIA PVT LTD — MONTHLY REPORT (MD only)
 *
 * Orders and value by month, worked out from the work orders this browser already holds (the shared
 * database copy, kept in step by db.js). Shown only to a login whose profile role is "md".
 *
 * Month  = the order's issue date (older orders store DD/MM/YYYY, newer ones YYYY-MM-DD; both are read).
 * Value  = quantity x price of every line, before GST (the same figure the Work Orders page shows).
 * Period = Indian financial year, April to March (order numbers already carry it, e.g. 343/2026-27).
 *
 * Note: hiding the tab is a convenience. Every signed-in user can already read all orders, so this report
 * adds no new data; it only decides who is shown the summary.
 */
const MonthlyReport = (() => {
  const GROUPS = [["draft", "Draft"], ["confirmed", "Confirmed"], ["released", "Released"], ["completed", "Completed"], ["other", "Other"]];
  const FY_MONTHS = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3];   // April .. March

  let isMd = false;
  const $ = (id) => document.getElementById(id);

  // ------------------------------------------------------------ figures (pure)
  function orderMonth(order) {
    const v = String(order.issueDate || "").trim();
    let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
    if (m) return { y: Number(m[1]), mo: Number(m[2]) };
    m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
    return m ? { y: Number(m[3]), mo: Number(m[2]) } : null;
  }

  const fyOf = ({ y, mo }) => (mo >= 4 ? y : y - 1);                       // the year a financial year starts in
  const fyLabel = (fy) => `FY ${fy}-${String((fy + 1) % 100).padStart(2, "0")}`;
  const monthName = (y, mo) => new Date(y, mo - 1, 1).toLocaleString("en-GB", { month: "long", year: "numeric" });

  function statusGroup(status) {
    const s = String(status || "");
    if (s === "DRAFT") return "draft";
    if (s.startsWith("CONFIRMED")) return "confirmed";
    if (s.startsWith("RELEASED")) return "released";
    if (s.startsWith("COMPLETED")) return "completed";
    return "other";
  }

  const orderValue = (order) => (order.items || []).reduce((n, it) => n + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

  function collect(includeDrafts) {
    return WORK_ORDERS_DATA
      .map((order) => ({ ym: orderMonth(order), group: statusGroup(order.status), value: orderValue(order) }))
      .filter((r) => includeDrafts || r.group !== "draft");
  }

  // One bucket per month. A financial year always lists all twelve months; "all" lists only months that have orders.
  function buildBuckets(rows, period) {
    const map = new Map();
    const bucket = (key, label, sort) => {
      if (!map.has(key)) map.set(key, { label, sort, orders: 0, value: 0, groups: {} });
      return map.get(key);
    };
    if (period !== "all") {
      const fy = Number(period);
      FY_MONTHS.forEach((mo) => { const y = mo >= 4 ? fy : fy + 1; bucket(`${y}-${mo}`, monthName(y, mo), y * 12 + mo); });
    }
    let undated = 0;
    rows.forEach((r) => {
      let b;
      if (!r.ym) {
        undated++;
        if (period !== "all") return;
        b = bucket("none", "No valid date", Infinity);
      } else if (period === "all") {
        b = bucket(`${r.ym.y}-${r.ym.mo}`, monthName(r.ym.y, r.ym.mo), r.ym.y * 12 + r.ym.mo);
      } else {
        if (fyOf(r.ym) !== Number(period)) return;
        b = map.get(`${r.ym.y}-${r.ym.mo}`);
      }
      b.orders++;
      b.value += r.value;
      b.groups[r.group] = (b.groups[r.group] || 0) + 1;
    });
    return { buckets: [...map.values()].sort((a, b) => a.sort - b.sort), undated };
  }

  // ------------------------------------------------------------ screen
  const money = (n) => `₹${formatNum(Math.round(n))}`;

  function fillPeriodOptions(rows) {
    const select = $("reportPeriod");
    const previous = select.value;
    const years = [...new Set(rows.filter((r) => r.ym).map((r) => fyOf(r.ym)))].sort((a, b) => b - a);
    const values = [...years.map(String), "all"];
    select.replaceChildren();
    years.forEach((fy) => select.add(new Option(fyLabel(fy), String(fy))));
    select.add(new Option("All months", "all"));
    select.value = values.includes(previous) ? previous : values[0];      // default: the latest financial year
  }

  function cell(text, className) {
    const td = document.createElement("td");
    td.textContent = text;
    if (className) td.className = className;
    return td;
  }

  function render() {
    const includeDrafts = $("reportIncludeDrafts").checked;
    const rows = collect(includeDrafts);
    fillPeriodOptions(rows);
    const { buckets, undated } = buildBuckets(rows, $("reportPeriod").value);

    const total = { orders: 0, value: 0, groups: {} };
    buckets.forEach((b) => {
      total.orders += b.orders;
      total.value += b.value;
      Object.entries(b.groups).forEach(([g, n]) => { total.groups[g] = (total.groups[g] || 0) + n; });
    });

    // summary cards
    $("reportKpiOrders").textContent = formatNum(total.orders);
    $("reportKpiValue").textContent = money(total.value);
    $("reportKpiAverage").textContent = money(total.orders ? total.value / total.orders : 0);

    // which status columns to show: draft only when drafts are included; "other" only when there is one
    const shown = GROUPS.filter(([g]) => (g === "draft" ? includeDrafts : g === "other" ? total.groups.other : true));

    const head = $("reportHead");
    head.replaceChildren();
    const headRow = document.createElement("tr");
    const th = (text, cls) => { const e = document.createElement("th"); e.textContent = text; if (cls) e.className = cls; return e; };
    headRow.append(th("MONTH"), th("ORDERS", "text-right"));
    shown.forEach(([, label]) => headRow.append(th(label.toUpperCase(), "text-right")));
    headRow.append(th("VALUE (₹)", "text-right"), th("SHARE OF PERIOD"));
    head.append(headRow);

    const maxValue = Math.max(0, ...buckets.map((b) => b.value));
    const body = $("reportBody");
    body.replaceChildren();
    buckets.forEach((b) => {
      const tr = document.createElement("tr");
      if (!b.orders) tr.className = "report-zero-row";
      tr.append(cell(b.label), cell(b.orders ? formatNum(b.orders) : "—", "text-right font-mono"));
      shown.forEach(([g]) => tr.append(cell(b.groups[g] ? formatNum(b.groups[g]) : "—", "text-right font-mono")));
      tr.append(cell(b.orders ? money(b.value) : "—", "text-right font-mono text-bold"));
      const bar = document.createElement("td");
      const track = document.createElement("span");
      track.className = "report-bar";
      const fill = document.createElement("span");
      fill.style.width = maxValue ? `${Math.round((b.value / maxValue) * 100)}%` : "0%";
      track.append(fill);
      bar.append(track);
      tr.append(bar);
      body.append(tr);
    });

    const foot = $("reportFoot");
    foot.replaceChildren();
    if (buckets.length) {
      const tr = document.createElement("tr");
      tr.className = "report-total-row";
      tr.append(cell("TOTAL"), cell(formatNum(total.orders), "text-right font-mono"));
      shown.forEach(([g]) => tr.append(cell(total.groups[g] ? formatNum(total.groups[g]) : "—", "text-right font-mono")));
      tr.append(cell(money(total.value), "text-right font-mono"), cell(""));
      foot.append(tr);
    }

    let message = "";
    if (!WORK_ORDERS_DATA.length) message = "There are no work orders yet.";
    else if (!total.orders) message = "No orders in this period.";
    else if (undated) message = `${undated} order${undated === 1 ? "" : "s"} without a valid issue date ${undated === 1 ? "is" : "are"} only counted under "All months".`;
    setMessage(message);
  }

  function setMessage(text) {
    const el = $("reportMessage");
    if (el) el.textContent = text || "";
  }

  // ------------------------------------------------------------ public
  function refresh() {
    if (!isMd) {                                         // the tab is hidden for others; this covers a forced call
      $("reportBody").replaceChildren();
      $("reportFoot").replaceChildren();
      setMessage("Only the MD can view this report.");
      return;
    }
    render();
  }

  function refreshIfVisible() {
    const view = $("reportsView");
    if (isMd && view && view.style.display === "flex") render();
  }

  function setProfile(profile) {
    isMd = !!(profile && profile.role === "md");
    const tab = $("tabReports");
    if (tab) tab.style.display = isMd ? "" : "none";
    const view = $("reportsView");
    if (!isMd && view && view.style.display === "flex") switchMainView("workbench");
  }

  function init() {
    if (!$("reportPeriod")) return;
    $("reportPeriod").addEventListener("change", render);
    $("reportIncludeDrafts").addEventListener("change", render);
  }
  init();

  return { setProfile, refresh, refreshIfVisible, orderMonth, orderValue, statusGroup };
})();
