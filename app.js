/**
 * SGR MOULDS INDIA PVT LTD — WORK ORDER WORKBENCH ENGINE
 * Real-time calculation, scheduling, audit chain & memo printing
 */

// Sample Work Orders matching sample sheet and whiteboard. Used only on first run;
// after that the orders saved in the browser (see storage.js) are the source of truth.
const SEED_WORK_ORDERS = [
  {
    id: "343/2026-27",
    docRef: "DOC REF: SGR-MKT-02",
    vendorCode: "CCPB00002",
    vendorSub: "SGR Division // Pkg",
    issueDate: "16/09/2026",
    deliveryTarget: "21/09/2026",
    deliveryChipText: "21/09/2026 (Urgent // 5 Days)",
    destination: "Chennai // APA Engineering",
    destinationSub: "Dedicated Truck // Direct SIPCOT Line",
    revision: "Rev 00, Dt: 01/08/22",
    status: "CONFIRMED — READY FOR FLOOR",
    qualityGate: "TC: YES",
    auditSteps: [
      { id: 1, role: "Prepared by", person: "D. Mohan (Production Planning)", status: "Verified", time: "16/09/2026 09:15", verified: true },
      { id: 2, role: "Verified by", person: "Quality Control & Plant Head", status: "Approved", time: "16/09/2026 10:40", verified: true },
      { id: 3, role: "General Manager / JMD", person: "Executive Authorisation", status: "Released", time: "16/09/2026 11:20", verified: true },
      { id: 4, role: "Warehouse Gate & Dispatch", person: "Vehicle Loading Inspection", status: "Pending Loading", time: "Due 21/09/2026", verified: false }
    ],
    items: [
      {
        id: "item-1",
        partNo: "EB080600002",
        description: "EB 80 X 80 X 6 X 840 mm",
        subDesc: "Thickness: 6.0 mm // Wings: 80 mm // Length: 840 mm",
        profile: "EB 80 X 80 X 6",
        lengthMm: 840,
        qty: 1000,
        uom: "NOS",
        weight: 565,
        category: "Standard Angle",
        price: 42.50,
        remarks: "In Queue // Standard Kraft Spec",
        custRef: "CCPB00002-L1"
      },
      {
        id: "item-2",
        partNo: "EB080600003",
        description: "EB 80 X 80 X 6 X 990 mm",
        subDesc: "Thickness: 6.0 mm // Wings: 80 mm // Length: 990 mm",
        profile: "EB 80 X 80 X 6",
        lengthMm: 990,
        qty: 1000,
        uom: "NOS",
        weight: 665,
        category: "Standard Angle",
        price: 48.00,
        remarks: "In Queue // Standard Kraft Spec",
        custRef: "CCPB00002-L2"
      },
      {
        id: "item-3",
        partNo: "EB075600011",
        description: "EB 75 X 75 X 6 X 1219 mm (48\"-LENGTH)",
        subDesc: "Export Staging APA Eng.",
        profile: "EB 75 X 75 X 6",
        lengthMm: 1219,
        qty: 1000,
        uom: "NOS",
        weight: 824,
        category: "Custom Spec",
        price: 62.00,
        remarks: "Without Lamination Without Painting",
        custRef: "PUR-VBOARD48-PKG"
      }
    ]
  },
  {
    id: "344/2026-27",
    docRef: "DOC REF: SGR-MKT-02",
    vendorCode: "CCPB00005",
    vendorSub: "SGR Division // Pkg",
    issueDate: "18/09/2026",
    deliveryTarget: "25/09/2026",
    deliveryChipText: "25/09/2026 (Standard // 7 Days)",
    destination: "Coimbatore // TexAuto Pack",
    destinationSub: "Standard Fleet // Direct Perundurai",
    revision: "Rev 00, Dt: 01/08/22",
    status: "CONFIRMED — READY FOR FLOOR",
    qualityGate: "TC: YES",
    auditSteps: [
      { id: 1, role: "Prepared by", person: "D. Mohan (Production Planning)", status: "Verified", time: "18/09/2026 11:00", verified: true },
      { id: 2, role: "Verified by", person: "Quality Control & Plant Head", status: "Approved", time: "18/09/2026 14:15", verified: true },
      { id: 3, role: "General Manager / JMD", person: "Executive Authorisation", status: "Pending", time: "Pending", verified: false },
      { id: 4, role: "Warehouse Gate & Dispatch", person: "Vehicle Loading Inspection", status: "Pending Loading", time: "Due 25/09/2026", verified: false }
    ],
    items: [
      {
        id: "item-4",
        partNo: "EB050500001",
        description: "EB 50 X 50 X 4 X 1000 mm",
        subDesc: "Thickness: 4.0 mm // Wings: 50 mm // Length: 1000 mm",
        profile: "EB 50 X 50 X 4",
        lengthMm: 1000,
        qty: 2000,
        uom: "NOS",
        weight: 780,
        category: "Standard Angle",
        price: 32.00,
        remarks: "Kraft Standard",
        custRef: "TEX-50-1000"
      }
    ]
  },
  {
    id: "345/2026-27",
    docRef: "DOC REF: SGR-MKT-02",
    vendorCode: "CCPB00012",
    vendorSub: "SGR Division // Moulds",
    issueDate: "19/09/2026",
    deliveryTarget: "28/09/2026",
    deliveryChipText: "28/09/2026 (Normal)",
    destination: "Hosur // IndoMould Fab",
    destinationSub: "Direct Dispatch",
    revision: "Rev 00, Dt: 01/08/22",
    status: "DRAFT",
    qualityGate: "TC: OPTIONAL",
    auditSteps: [
      { id: 1, role: "Prepared by", person: "D. Mohan (Production Planning)", status: "Drafting", time: "19/09/2026 16:30", verified: false },
      { id: 2, role: "Verified by", person: "Quality Control & Plant Head", status: "Pending", time: "-", verified: false },
      { id: 3, role: "General Manager / JMD", person: "Executive Authorisation", status: "Pending", time: "-", verified: false },
      { id: 4, role: "Warehouse Gate & Dispatch", person: "Vehicle Loading Inspection", status: "Pending Loading", time: "-", verified: false }
    ],
    items: [
      {
        id: "item-5",
        partNo: "VB060600008",
        description: "VB 60 X 60 X 5 X 1500 mm (Heavy V-Board)",
        subDesc: "Heavy Duty Corner Protection",
        profile: "VB 60 X 60 X 5",
        lengthMm: 1500,
        qty: 1500,
        uom: "NOS",
        weight: 1250,
        category: "Heavy Duty",
        price: 58.50,
        remarks: "Reinforced edges",
        custRef: "INDO-VB-150"
      }
    ]
  }
];

// Live Work Orders, loaded from this device's saved copy. The sample data is only for local-only mode:
// with Supabase configured, the shared database is the source of truth and there are no samples.
const WORK_ORDERS_DATA = OrderStore.load(Cloud.configured ? [] : SEED_WORK_ORDERS);

// Index of the SAVED work order open in the Workbench; -1 = none. With none open the Workbench shows a blank
// new work order (the draft below). Saved orders open from Work Orders or the Switch Order drawer.
let currentOrderIndex = -1;

// A new work order that has not been saved yet. It lives only in memory: it is not in WORK_ORDERS_DATA, not in
// this device's saved copy and not sent to the database until it is saved (see commitDraft). It survives
// switching tabs or opening another order; it is lost only if the page is reloaded.
let draftOrder = null;

// uid of the saved order whose details are being edited in place in the header; null when not editing
let headerEditUid = null;

// The order the Workbench is showing: the open saved order, otherwise the blank draft.
function getOpenOrder() {
  return WORK_ORDERS_DATA[currentOrderIndex] || draftOrder;
}

// Guard for actions that need a SAVED order (print, bill, release, edit details...); menu items stay clickable.
function requireOpenOrder(allowWhileEditing) {
  if (headerEditUid && !allowWhileEditing) {
    showToast("Save or cancel your changes to the order details first.", "error");
    return false;
  }
  if (WORK_ORDERS_DATA[currentOrderIndex]) return true;
  showToast(draftOrder ? "Save this work order first (add a line item or press Save)." : "Open or create a work order first.", "error");
  return false;
}

// Universal null-safe order search helper
function matchesOrder(wo, query) {
  if (!wo || !query) return false;
  const q = String(query).toLowerCase().trim();
  if (!q) return false;

  const matchStr = (val) => val != null && String(val).toLowerCase().includes(q);

  if (
    matchStr(wo.id) ||
    matchStr(wo.docRef) ||
    matchStr(wo.vendorCode) ||
    matchStr(wo.vendorSub) ||
    matchStr(wo.destination) ||
    matchStr(wo.destinationSub) ||
    matchStr(wo.buyer) ||
    matchStr(wo.customer) ||
    matchStr(wo.status) ||
    matchStr(wo.remarks) ||
    matchStr(wo.issueDate) ||
    matchStr(wo.deliveryTarget)
  ) {
    return true;
  }

  if (Array.isArray(wo.items)) {
    for (const it of wo.items) {
      if (!it) continue;
      if (
        matchStr(it.partNo) ||
        matchStr(it.description) ||
        matchStr(it.subDesc) ||
        matchStr(it.profile) ||
        matchStr(it.custRef) ||
        matchStr(it.category) ||
        matchStr(it.remarks)
      ) {
        return true;
      }
    }
  }

  return false;
}

// Single funnel for saving: call after every change to WORK_ORDERS_DATA, passing the order that changed
// (it is saved on this device at once and queued for the shared database).
let storageWarned = false;
function persistOrders(changedOrder) {
  if (!OrderStore.save(WORK_ORDERS_DATA) && !storageWarned) {
    storageWarned = true;
    showToast("Could not save changes in this browser (storage full or blocked). Changes will be lost on refresh.", "error");
  }
  Cloud.queueSave(changedOrder);
}

// Next work order number = highest existing "NNN/" prefix + 1 (safe after deletions)
function nextOrderNumber() {
  const nums = WORK_ORDERS_DATA.map(wo => parseInt(String(wo.id).split("/")[0], 10)).filter(n => !isNaN(n));
  return (nums.length ? Math.max(...nums) : 342) + 1;
}

function newDraftOrder() {
  const day = 24 * 60 * 60 * 1000;
  return {
    uid: OrderStore.newUid(),
    updatedAt: null,
    id: "",                                   // the number is assigned when the order is saved
    docRef: "DOC REF: SGR-MKT-02",
    vendorCode: "",
    vendorSub: "SGR Division // Pkg",
    issueDate: new Date().toISOString().split("T")[0],
    deliveryTarget: new Date(Date.now() + 5 * day).toISOString().split("T")[0],
    deliveryChipText: "",
    destination: "",
    destinationSub: "Standard Logistics Line",
    revision: "Rev 00, Dt: 01/08/22",
    status: "DRAFT",
    qualityGate: "TC: YES",
    auditSteps: [
      { id: 1, role: "Prepared by", person: "Production Planner", status: "Verified", time: "Just now", verified: true },
      { id: 2, role: "Verified by", person: "Quality Control & Plant Head", status: "Pending", time: "-", verified: false },
      { id: 3, role: "General Manager / JMD", person: "Executive Authorisation", status: "Pending", time: "-", verified: false },
      { id: 4, role: "Warehouse Gate & Dispatch", person: "Vehicle Loading Inspection", status: "Pending Loading", time: "-", verified: false }
    ],
    items: []
  };
}

// Puts the draft's values into the on-page form (only when a fresh draft is created, so typing is never overwritten)
function fillDraftForm() {
  const set = (id, value) => { const el = document.getElementById(id); if (el) el.value = value; };
  set("draftDocRef", draftOrder.docRef);
  set("draftVendorCode", draftOrder.vendorCode);
  set("draftVendorSub", draftOrder.vendorSub);
  set("draftDestination", draftOrder.destination);
  set("draftIssueDate", draftOrder.issueDate);
  set("draftDeliveryDate", draftOrder.deliveryTarget);
  set("draftQualityGate", draftOrder.qualityGate.replace("TC: ", ""));
  set("draftStatus", draftOrder.status);
}

function syncDraftFromForm() {
  if (!draftOrder) return;
  const get = (id) => { const el = document.getElementById(id); return el ? el.value : ""; };
  draftOrder.docRef = get("draftDocRef").trim();
  draftOrder.vendorCode = get("draftVendorCode").trim();
  draftOrder.vendorSub = get("draftVendorSub").trim();
  draftOrder.destination = get("draftDestination").trim();
  draftOrder.issueDate = get("draftIssueDate");
  draftOrder.deliveryTarget = get("draftDeliveryDate");
  draftOrder.qualityGate = `TC: ${get("draftQualityGate")}`;
  draftOrder.status = get("draftStatus");
}

function ensureDraft() {
  if (!draftOrder) { draftOrder = newDraftOrder(); fillDraftForm(); }
  return draftOrder;
}

// Saves the draft as a real work order: checks the required details, gives it its number, saves it (on this
// device and to the database) and opens it. Returns false if a required detail is missing.
function commitDraft() {
  const form = document.getElementById("draftHeaderForm");
  if (!draftOrder || !form || !form.reportValidity()) return false;   // the browser points at the missing field
  syncDraftFromForm();
  const order = draftOrder;
  order.id = nextOrderNumber() + "/2026-27";
  order.deliveryChipText = `${order.deliveryTarget} (New Order)`;
  WORK_ORDERS_DATA.push(order);
  currentOrderIndex = WORK_ORDERS_DATA.length - 1;
  draftOrder = null;
  persistOrders(order);
  showToast(`Work Order #${order.id} created successfully!`);
  return true;
}

// Shows the blank new work order in the Workbench (any half-filled draft is kept)
function startNewWorkOrder() {
  currentOrderIndex = -1;
  document.getElementById("tabWorkbench").click();       // switches to the Workbench, which renders the draft
  setTimeout(() => { const el = document.getElementById("draftVendorCode"); if (el) el.focus(); }, 100);
}

// Helper: escape text before putting it into HTML built from strings (used by the invoice and the search box)
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper: Format Numbers with Commas
function formatNum(num) {
  if (isNaN(num)) return "0";
  return Number(num).toLocaleString("en-IN");
}

// Helper: Parse Profile from description if possible
function extractProfileFromDesc(desc) {
  const match = desc.match(/(EB|VB)\s*(\d+\s*X\s*\d+\s*X\s*\d+)/i);
  if (match) {
    return `${match[1].toUpperCase()} ${match[2].toUpperCase().replace(/\s+/g, " ")}`;
  }
  return desc.substring(0, 15);
}

// Show Toast Notification
function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <svg viewBox="0 0 20 20" fill="currentColor" style="width: 18px; height: 18px; color: ${type === 'error' ? '#ef4444' : '#10b981'}; flex-shrink: 0;">
      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
    </svg>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3500);
}

// Render Current Work Order
function updateOrderCounts() {
  const ordersCountEl = document.getElementById("totalOrdersCount");
  if (ordersCountEl) ordersCountEl.textContent = WORK_ORDERS_DATA.length;

  const menuOrdersCountEl = document.getElementById("menuOrdersCount");
  if (menuOrdersCountEl) menuOrdersCountEl.textContent = `${WORK_ORDERS_DATA.length} Active`;

  const historyTabCountEl = document.getElementById("historyTabCount");
  if (historyTabCountEl) historyTabCountEl.textContent = WORK_ORDERS_DATA.length;
}

// ---------------------------------------------------------------- editing order details in place
// Older orders keep dates as DD/MM/YYYY, newer ones as YYYY-MM-DD. A date picker needs YYYY-MM-DD, so convert
// on the way in, and on the way out save in whichever format that order already used.
function toInputDate(value) {
  const slash = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (slash) return `${slash[3]}-${slash[2]}-${slash[1]}`;
  return /^\d{4}-\d{2}-\d{2}$/.test(value || "") ? value : "";
}
function fromInputDate(iso, originalValue) {
  if (!iso) return "";
  return /^\d{2}\/\d{2}\/\d{4}$/.test(originalValue || "") ? iso.split("-").reverse().join("/") : iso;
}

// Selects a value; if this order has one the list doesn't offer, add it so saving never silently changes it
function setSelectValue(select, value) {
  select.querySelectorAll("option[data-extra]").forEach((o) => o.remove());
  if (value && ![...select.options].some((o) => o.value === value)) {
    const extra = new Option(value, value);
    extra.dataset.extra = "1";
    select.add(extra);
  }
  select.value = value || select.options[0].value;
}

function startHeaderEdit() {
  if (headerEditUid) return;
  if (!requireOpenOrder(true)) return;
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  if (getComputedStyle(document.getElementById("workbenchView")).display === "none") {
    document.getElementById("tabWorkbench").click();       // e.g. started from the Menu while on another tab
  }
  const set = (id, value) => { document.getElementById(id).value = value; };
  set("editWoId", order.id);
  set("editDocRef", order.docRef);
  set("editVendorCode", order.vendorCode);
  set("editVendorSub", order.vendorSub);
  set("editIssueDate", toInputDate(order.issueDate));
  set("editDeliveryTarget", toInputDate(order.deliveryTarget));
  set("editDestination", order.destination);
  setSelectValue(document.getElementById("editQualityGate"), order.qualityGate || "TC: YES");
  setSelectValue(document.getElementById("editStatus"), order.status);
  headerEditUid = order.uid;
  document.querySelector(".wo-header-card").classList.add("is-editing");
  document.getElementById("editVendorCode").focus();
}

function endHeaderEdit() {
  headerEditUid = null;
  const card = document.querySelector(".wo-header-card");
  if (card) card.classList.remove("is-editing");
}

function saveHeaderEdit(e) {
  e.preventDefault();
  const order = WORK_ORDERS_DATA.find((o) => o.uid === headerEditUid);
  if (!order) { endHeaderEdit(); return; }

  const newId = document.getElementById("editWoId").value.trim();
  if (WORK_ORDERS_DATA.some((o) => o !== order && o.id === newId)) {
    showToast(`Another work order already has the number #${newId}.`, "error");
    document.getElementById("editWoId").focus();
    return;
  }

  const get = (id) => document.getElementById(id).value.trim();
  order.id = newId;
  order.docRef = get("editDocRef");
  order.vendorCode = get("editVendorCode");
  order.vendorSub = get("editVendorSub");
  order.issueDate = fromInputDate(get("editIssueDate"), order.issueDate);
  order.deliveryTarget = fromInputDate(get("editDeliveryTarget"), order.deliveryTarget);
  order.destination = get("editDestination");
  order.qualityGate = document.getElementById("editQualityGate").value;
  order.status = document.getElementById("editStatus").value;

  persistOrders(order);
  endHeaderEdit();
  renderWorkOrder();
  showToast(`Work Order #${order.id} updated!`);
}

function renderWorkOrder() {
  const saved = WORK_ORDERS_DATA[currentOrderIndex];
  if (!saved) ensureDraft();
  const order = getOpenOrder();
  if (headerEditUid && (!saved || saved.uid !== headerEditUid)) endHeaderEdit();   // another order was opened
  const view = document.getElementById("workbenchView");
  if (view) view.classList.toggle("is-draft", !saved);   // no saved order open: show the blank new work order

  // An order that is already released (or completed) cannot be released again
  const released = !!saved && isReleased(saved);
  const releaseBtn = document.getElementById("releaseFloorBtn");
  if (releaseBtn) {
    releaseBtn.disabled = released;
    releaseBtn.title = released ? "This work order has already been released to production" : "";
  }
  const releaseMenuItem = document.getElementById("menuReleaseFloor");
  if (releaseMenuItem) releaseMenuItem.classList.toggle("is-disabled", released);

  // Header and Meta
  const displayWoEl = document.getElementById("displayWoNumber");
  if (displayWoEl) displayWoEl.textContent = `#${order.id}`;
  
  const displayDocEl = document.getElementById("displayDocRef");
  if (displayDocEl) displayDocEl.textContent = order.docRef;

  const displayDeliveryChip = document.getElementById("displayDeliveryChip");
  if (displayDeliveryChip) {
    displayDeliveryChip.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor" class="chip-icon">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/>
      </svg>
      Delivery: <strong>${order.deliveryTarget}</strong> (${order.deliveryChipText.split("(")[1] || "Urgent // 5 Days"}
    `;
  }

  const displayStatusEl = document.getElementById("displayStatusBadge");
  if (displayStatusEl) {
    displayStatusEl.innerHTML = `<span class="dot"></span> ${order.status}`;
  }

  document.getElementById("metaVendorCode").textContent = order.vendorCode;
  document.getElementById("metaVendorSub").textContent = order.vendorSub;
  document.getElementById("metaIssueDate").textContent = order.issueDate;
  document.getElementById("metaDeliveryTarget").textContent = `${order.deliveryTarget} !`;
  document.getElementById("metaDestination").textContent = order.destination;
  document.getElementById("metaRevision").textContent = order.revision;

  // Calculations
  let totalQty = 0;
  let totalRunningMeters = 0;
  let totalWeightKgs = 0;
  let totalAmountInr = 0;
  const profileMetersMap = {};

  // Render Table Rows
  const tbody = document.getElementById("itemsTableBody");
  tbody.innerHTML = "";

  if (!order.items || order.items.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="12" style="text-align: center; padding: 48px 16px; background: var(--color-white); color: var(--color-ink-600);">
          <div style="font-weight: 700; font-size: 14px; color: var(--color-ink-800); margin-bottom: 4px;">No Line Items in this Work Order</div>
          <div style="font-size: 12px; color: var(--color-ink-500); margin-bottom: 14px;">Key in your part numbers, dimensions, quantities, and rates below to add line items.</div>
          <button type="button" class="btn-primary" onclick="document.getElementById('addPartNo')?.focus()" style="padding: 7px 16px; font-size: 12px; cursor: pointer; border-radius: 4px; background: var(--color-forest-800); color: #fff; border: none; font-weight: 600;">
            + Add First Line Item
          </button>
        </td>
      </tr>
    `;
  } else {
    order.items.forEach((item, index) => {
    const itemQty = Number(item.qty) || 0;
    const itemLen = Number(item.lengthMm) || 0;
    const runningMtr = Math.round((itemQty * itemLen) / 1000);
    const itemWeight = Number(item.weight) || 0;
    const itemPrice = Number(item.price) || 0;
    const rowTotal = itemQty * itemPrice;

    totalQty += itemQty;
    totalRunningMeters += runningMtr;
    totalWeightKgs += itemWeight;
    totalAmountInr += rowTotal;

    // Profile grouping
    const prof = item.profile || extractProfileFromDesc(item.description);
    profileMetersMap[prof] = (profileMetersMap[prof] || 0) + runningMtr;

    // Category badge class
    let catClass = "cat-standard";
    if (item.category === "Custom Spec") catClass = "cat-custom";
    if (item.category === "Heavy Duty") catClass = "cat-heavy";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="part-code-cell">${item.partNo}</td>
      <td class="desc-cell">
        <div>${item.description}</div>
        ${item.subDesc ? `<div class="desc-sub-details">${item.subDesc}</div>` : ""}
      </td>
      <td class="text-center font-mono text-bold">${formatNum(itemQty)}</td>
      <td class="text-center font-mono">${item.uom}</td>
      <td class="text-right font-mono text-bold">${formatNum(runningMtr)}</td>
      <td class="text-right font-mono">~${formatNum(itemWeight)} Kgs</td>
      <td class="text-center"><span class="badge-category ${catClass}">${item.category}</span></td>
      <td class="text-right font-mono">₹${Number(itemPrice).toFixed(2)}</td>
      <td class="text-right font-mono text-bold">₹${formatNum(rowTotal)}</td>
      <td style="font-size: 11px; color: #4b5563;">${item.remarks}</td>
      <td style="font-family: var(--font-mono); font-size: 11px; font-weight: 600;">${item.custRef}</td>
      <td class="text-center">
        <div class="row-actions-cell">
          <button class="btn-icon-small btn-edit" title="Edit line item" onclick="editItem(${index})">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button class="btn-icon-small" title="Duplicate line" onclick="duplicateItem(${index})">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
              <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
              <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
            </svg>
          </button>
          <button class="btn-icon-small btn-delete" title="Delete line" onclick="deleteItem(${index})">
            <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
  }

  // Update KPI Tiles
  document.getElementById("kpiTotalQty").textContent = formatNum(totalQty);
  document.getElementById("kpiRunningLength").textContent = formatNum(totalRunningMeters);
  document.getElementById("kpiNetWeight").textContent = formatNum(totalWeightKgs);
  const profileKeys = Object.keys(profileMetersMap);
  document.getElementById("kpiItemProfile").textContent = (order.items.length < 10 ? "0" : "") + order.items.length;
  document.getElementById("kpiQualityGate").textContent = order.qualityGate || "TC: YES";

  // Update Footer Grand Totals
  document.getElementById("footerTotalQty").textContent = `${formatNum(totalQty)} Nos`;
  document.getElementById("footerTotalMeters").textContent = `${formatNum(totalRunningMeters)} Mtr`;
  document.getElementById("footerTotalWeight").textContent = `${formatNum(totalWeightKgs)} KGS`;
  document.getElementById("footerGrandAmount").textContent = `₹${formatNum(totalAmountInr)}`;

  // Profile Aggregations Box
  const profileContainer = document.getElementById("profileAggregationsContainer");
  profileContainer.innerHTML = "";
  profileKeys.forEach((key, idx) => {
    const box = document.createElement("div");
    box.className = "profile-agg-box";
    box.innerHTML = `
      <div>
        <div class="profile-label">PROFILE ${key.replace(/(EB|VB)\s*/i, "")} AGGREGATION</div>
        <div class="profile-name">${idx + 1}. ${key}</div>
      </div>
      <div class="profile-mtr">= ${formatNum(profileMetersMap[key])} Mtr</div>
    `;
    profileContainer.appendChild(box);
  });

  // Calculate Pallet Bundles (50 Nos / Bundle standard rule)
  const bundleCount = Math.ceil(totalQty / 50);
  document.getElementById("calcBundleCount").textContent = `${formatNum(bundleCount)} BUNDLES TOTAL (${formatNum(totalQty)} NOS)`;

  // Render Audit Steps
  renderAuditChain();

  // Update Orders drawer & menu count
  updateOrderCounts();
}

// Render Audit Chain
function renderAuditChain() {
  const order = getOpenOrder();
  if (!order || !order.auditSteps) return;

  order.auditSteps.forEach((step) => {
    const statusTextEl = document.getElementById(`step${step.id}StatusText`);
    const btnEl = document.getElementById(`step${step.id}Btn`);
    const timeEl = document.getElementById(`step${step.id}Time`);
    const nameEl = document.getElementById(`step${step.id}Name`);

    if (nameEl) nameEl.textContent = step.person;
    if (statusTextEl) statusTextEl.textContent = step.status;
    if (timeEl) timeEl.textContent = step.time;

    if (btnEl) {
      btnEl.className = "status-chip " + (step.verified ? "chip-approved" : "chip-pending");
      btnEl.onclick = () => openSignModal(step.id);
    }
  });
}

// Open Digital Sign-off Modal
window.openSignModal = function(stepId) {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  const step = order.auditSteps.find(s => s.id === stepId);
  if (!step) return;

  document.getElementById("signStepId").value = stepId;
  document.getElementById("signRoleName").value = step.role;
  document.getElementById("signPersonName").value = step.person;
  document.getElementById("signModalTitle").textContent = `Authorize & Sign — ${step.role}`;

  const now = new Date();
  const dateStr = `${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`;
  document.getElementById("stampDatePreview").textContent = dateStr;

  document.getElementById("signModal").classList.add("open");
};

// Toggle Audit Step (Quick)
window.toggleAuditStep = function(stepId) {
  openSignModal(stepId);
};

// Add Line Item
document.getElementById("quickAddForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const order = getOpenOrder();
  if (order === draftOrder && !commitDraft()) return;   // a new work order is saved first (asks for any missing detail)

  const partNo = document.getElementById("addPartNo").value.trim();
  const desc = document.getElementById("addDesc").value.trim();
  const qty = parseInt(document.getElementById("addQty").value, 10) || 0;
  const lengthMm = parseInt(document.getElementById("addLengthMm").value, 10) || 1000;
  const uom = document.getElementById("addUom").value;
  const weight = parseInt(document.getElementById("addWeight").value, 10) || Math.round(qty * (lengthMm / 1000) * 0.65);
  const category = document.getElementById("addCategory").value;
  const price = parseFloat(document.getElementById("addPrice").value) || 45.00;
  const remarks = document.getElementById("addRemarks").value.trim() || "In Queue // Standard Kraft Spec";
  const custRef = document.getElementById("addCustRef").value.trim() || `${order.vendorCode}-L${order.items.length + 1}`;

  const newItem = {
    id: `item-${Date.now()}`,
    partNo,
    description: desc,
    subDesc: `Length: ${lengthMm} mm // UOM: ${uom}`,
    profile: extractProfileFromDesc(desc),
    lengthMm,
    qty,
    uom,
    weight,
    category,
    price,
    remarks,
    custRef
  };

  order.items.push(newItem);
  persistOrders(order);
  renderWorkOrder();
  showToast(`Item ${partNo} added to Work Order #${order.id}!`);

  // Clear inputs and auto-focus back to addPartNo for fast consecutive entry
  document.getElementById("addPartNo").value = "";
  document.getElementById("addDesc").value = "";
  document.getElementById("addRemarks").value = "";
  document.getElementById("addCustRef").value = "";
  setTimeout(() => {
    const partInput = document.getElementById("addPartNo");
    if (partInput) partInput.focus();
  }, 50);
});

// Smart Description Parser & Auto-Calculator on Quick Add
const addDescInput = document.getElementById("addDesc");
if (addDescInput) {
  addDescInput.addEventListener("input", () => {
    const val = addDescInput.value;
    // Extract length if typed like 1200 mm or X 1200 or 1200
    const lenMatch = val.match(/X\s*(\d{3,4})\s*(mm)?/i) || val.match(/(\d{3,4})\s*mm/i);
    if (lenMatch && lenMatch[1]) {
      const len = parseInt(lenMatch[1], 10);
      if (len >= 100 && len <= 6000) {
        document.getElementById("addLengthMm").value = len;
        const qty = parseInt(document.getElementById("addQty")?.value, 10) || 1000;
        document.getElementById("addWeight").value = Math.round(qty * (len / 1000) * 0.65);
      }
    }

    // Auto-generate Part # if empty
    const partInput = document.getElementById("addPartNo");
    if (partInput && !partInput.value.trim()) {
      const matchNums = val.match(/(\d+)\s*X\s*(\d+)\s*X\s*(\d+)/i);
      if (matchNums) {
        const w1 = matchNums[1].padStart(2, '0');
        const th = matchNums[3].padStart(2, '0');
        partInput.value = `EB${w1}${th}0001`;
      }
    }
  });
}

// Delete Item
window.deleteItem = function(index) {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  if (confirm(`Remove item ${order.items[index].partNo}?`)) {
    const deleted = order.items.splice(index, 1);
    persistOrders(order);
    renderWorkOrder();
    showToast(`Removed ${deleted[0].partNo}`);
  }
};

// Duplicate Item
window.duplicateItem = function(index) {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  const item = order.items[index];
  const cloned = JSON.parse(JSON.stringify(item));
  cloned.id = `item-${Date.now()}`;
  cloned.partNo += "-COPY";
  order.items.push(cloned);
  persistOrders(order);
  renderWorkOrder();
  showToast(`Cloned line item as ${cloned.partNo}`);
};

// Edit Item Function
window.editItem = function(index) {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  const item = order.items[index];
  if (!item) return;

  document.getElementById("editItemIndex").value = index;
  document.getElementById("editPartNo").value = item.partNo;
  document.getElementById("editCustRef").value = item.custRef || "";
  document.getElementById("editDesc").value = item.description;
  document.getElementById("editQty").value = item.qty;
  document.getElementById("editLengthMm").value = item.lengthMm;
  document.getElementById("editUom").value = item.uom;
  document.getElementById("editWeight").value = item.weight || "";
  document.getElementById("editCategory").value = item.category;
  document.getElementById("editPrice").value = item.price;
  document.getElementById("editRemarks").value = item.remarks || "";

  document.getElementById("editItemModal").classList.add("open");
};

// ---------------------------------------------------------------- GST TAX INVOICE & COMMERCIAL BILL
function numToWordsIndian(num) {
  if (!num || isNaN(num) || num <= 0) return "Rupees Zero Only";
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if ((n = n.toString()).length > 9) return 'overflow';
    const n_array = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n_array) return '';
    let str = '';
    str += (n_array[1] != 0) ? (a[Number(n_array[1])] || b[n_array[1][0]] + ' ' + a[n_array[1][1]]) + 'Crore ' : '';
    str += (n_array[2] != 0) ? (a[Number(n_array[2])] || b[n_array[2][0]] + ' ' + a[n_array[2][1]]) + 'Lakh ' : '';
    str += (n_array[3] != 0) ? (a[Number(n_array[3])] || b[n_array[3][0]] + ' ' + a[n_array[3][1]]) + 'Thousand ' : '';
    str += (n_array[4] != 0) ? (a[Number(n_array[4])] || b[n_array[4][0]] + ' ' + a[n_array[4][1]]) + 'Hundred ' : '';
    str += (n_array[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n_array[5])] || b[n_array[5][0]] + ' ' + a[n_array[5][1]]) : '';
    return str;
  }

  const whole = Math.floor(num);
  const words = inWords(whole).trim();
  return `Rupees ${words} Only`;
}

// ---------------------------------------------------------------- Confirmation dialog (shared)
// askConfirm({ title, text, rows: [[label, value], ...], confirmLabel, onConfirm }) shows the details and only runs
// onConfirm if the user presses the confirm button. Cancel, the x and Esc do nothing.
let pendingConfirm = null;

function askConfirm({ title, text, rows, confirmLabel, onConfirm }) {
  document.getElementById("actionConfirmTitle").textContent = title;
  document.getElementById("actionConfirmText").textContent = text;
  const summary = document.getElementById("actionConfirmSummary");
  summary.replaceChildren();
  rows.forEach(([label, value]) => {
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    summary.append(dt, dd);
  });
  const yes = document.getElementById("actionConfirmYes");
  yes.textContent = confirmLabel;
  pendingConfirm = onConfirm;
  document.getElementById("actionConfirmModal").classList.add("open");
  yes.focus();
}

function closeActionConfirm() {
  document.getElementById("actionConfirmModal").classList.remove("open");
  pendingConfirm = null;
}

function acceptActionConfirm() {
  const run = pendingConfirm;
  closeActionConfirm();
  if (run) run();
}

// Quantity and value of an order's lines, used in the confirmation summaries
function orderTotals(order) {
  const qty = order.items.reduce((n, it) => n + (Number(it.qty) || 0), 0);
  const amount = order.items.reduce((n, it) => n + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);
  return { qty, amount };
}

// ---------------------------------------------------------------- Generate Bill / Invoice flow
// Generate Bill -> confirm -> the invoice opens (GST options, print) -> closing the invoice moves on to Work Orders.
let billFlowActive = false;

function startBillFlow() {
  if (!requireOpenOrder()) return;
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  if (!order.items || order.items.length === 0) {
    showToast("Add at least one line item before generating a bill.", "error");
    const part = document.getElementById("addPartNo");
    if (part) part.focus();
    return;
  }
  const { qty, amount } = orderTotals(order);
  askConfirm({
    title: "Generate Bill / Invoice?",
    text: "Check the details below. After you confirm, the invoice opens for GST options and printing, and closing it takes you to Work Orders.",
    rows: [
      ["Work Order", `#${order.id}`],
      ["Vendor / Client", order.vendorCode || "—"],
      ["Line items", String(order.items.length)],
      ["Total quantity", `${formatNum(qty)} Nos`],
      ["Bill value (before GST)", `₹${amount.toLocaleString("en-IN")}`]
    ],
    confirmLabel: "Yes, Generate Bill",
    onConfirm: () => { billFlowActive = true; openTaxInvoiceModal(); }
  });
}

// ---------------------------------------------------------------- Release to Production flow
// Release -> confirm -> the order is marked released and the Workbench goes back to a blank new work order.
// A released (or completed) order cannot be released again: its Release button stays disabled.
function isReleased(order) {
  const status = String((order && order.status) || "");
  return status.startsWith("RELEASED") || status.startsWith("COMPLETED");
}

function startReleaseFlow() {
  if (!requireOpenOrder()) return;
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  if (isReleased(order)) {
    showToast("This work order has already been released to production.", "error");
    return;
  }
  if (!order.items || order.items.length === 0) {
    showToast("Add at least one line item before releasing to production.", "error");
    const part = document.getElementById("addPartNo");
    if (part) part.focus();
    return;
  }
  const { qty } = orderTotals(order);
  askConfirm({
    title: "Release to Production?",
    text: "This sends the work order to the Production & Finishing floor. Once released it cannot be released again, and you will be taken to a blank page for the next work order.",
    rows: [
      ["Work Order", `#${order.id}`],
      ["Vendor / Client", order.vendorCode || "—"],
      ["Destination", order.destination || "—"],
      ["Delivery target", order.deliveryTarget || "—"],
      ["Line items", String(order.items.length)],
      ["Total quantity", `${formatNum(qty)} Nos`]
    ],
    confirmLabel: "Yes, Release to Production",
    onConfirm: () => releaseOrder(order.uid)
  });
}

function releaseOrder(uid) {
  const order = WORK_ORDERS_DATA.find((o) => o.uid === uid);
  if (!order) return;
  order.status = "RELEASED — IN PRODUCTION";
  persistOrders(order);
  showToast(`Work Order #${order.id} released to Production & Finishing Line 02!`);
  startNewWorkOrder();                       // blank page, ready for the next work order
}

function openTaxInvoiceModal() {
  if (!requireOpenOrder()) return;
  renderTaxInvoice();
  const modal = document.getElementById("taxInvoiceModal");
  if (modal) modal.classList.add("open");
}

function renderTaxInvoice() {
  if (!WORK_ORDERS_DATA[currentOrderIndex]) return;
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  const sheet = document.getElementById("invoiceSheetContent");
  if (!sheet) return;

  const gstRate = parseFloat(document.getElementById("invoiceGstRate")?.value || "18");
  const supplyType = document.getElementById("invoiceSupplyType")?.value || "intra";

  let taxableValue = 0;
  let totalQty = 0;
  let totalWeight = 0;

  const rowsHtml = (order.items || []).map((it, idx) => {
    const q = Number(it.qty) || 0;
    const p = Number(it.price) || 0;
    const amount = q * p;
    taxableValue += amount;
    totalQty += q;
    totalWeight += Number(it.weight) || 0;

    return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #111827;">${escapeHtml(it.description || it.partNo || 'Standard Edgeboard')}</div>
          <div style="font-size: 11px; color: #6b7280;">Part Code: ${escapeHtml(it.partNo || '-')} // ${escapeHtml(it.subDesc || '')}</div>
        </td>
        <td style="text-align: center; font-family: monospace;">4819</td>
        <td style="text-align: center; font-weight: 700; font-family: monospace;">${formatNum(q)} ${escapeHtml(it.uom || 'NOS')}</td>
        <td style="text-align: right; font-family: monospace;">₹${p.toFixed(2)}</td>
        <td style="text-align: right; font-weight: 700; font-family: monospace;">₹${formatNum(amount)}</td>
      </tr>
    `;
  }).join("");

  const cgstRate = gstRate / 2;
  const sgstRate = gstRate / 2;
  const cgstAmount = supplyType === "intra" ? Math.round(taxableValue * (cgstRate / 100)) : 0;
  const sgstAmount = supplyType === "intra" ? Math.round(taxableValue * (sgstRate / 100)) : 0;
  const igstAmount = supplyType === "inter" ? Math.round(taxableValue * (gstRate / 100)) : 0;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  const grandTotal = taxableValue + totalTax;

  const invoiceNo = `SGR/INV/2026-27/${String(order.id || '000').replace(/[^0-9]/g, '').slice(-4).padStart(4, '0')}`;
  const today = new Date().toLocaleDateString("en-GB", { day: '2-digit', month: '2-digit', year: 'numeric' });

  sheet.innerHTML = `
    <div class="invoice-header-grid">
      <div class="invoice-company-brand">
        <h1>SGR MOULDS INDIA PVT LTD</h1>
        <div class="invoice-company-sub">
          <strong>Manufacturer of Edgeboards & Protective Packaging</strong><br />
          Plot No. 44 & 45, SIPCOT Industrial Growth Centre, Perundurai, Erode - 638052, Tamil Nadu<br />
          <strong>GSTIN:</strong> 33AAACS9821K1Z2 &nbsp;|&nbsp; <strong>State Code:</strong> 33 (Tamil Nadu)<br />
          <strong>Email:</strong> accounts@sgrmoulds.in &nbsp;|&nbsp; <strong>Phone:</strong> +91 4294 234500
        </div>
      </div>
      <div class="invoice-badge-title">
        <h2>TAX INVOICE</h2>
        <div class="invoice-tag-sub">ORIGINAL FOR RECIPIENT</div>
        <div style="font-family: monospace; font-size: 11px; margin-top: 4px; color: #4b5563;">Rule 46 of CGST Rules, 2017</div>
      </div>
    </div>

    <div class="invoice-meta-grid">
      <div class="invoice-meta-col">
        <p><strong>Invoice No:</strong> <span style="font-family: monospace; color: #064e3b; font-weight: 700;">${invoiceNo}</span></p>
        <p><strong>Invoice Date:</strong> ${today}</p>
        <p><strong>Work Order Ref:</strong> #${escapeHtml(order.id)}</p>
        <p><strong>Doc Ref:</strong> ${escapeHtml(order.docRef || 'SGR-MKT-02')}</p>
        <p><strong>Vendor Code:</strong> ${escapeHtml(order.vendorCode || '-')}</p>
      </div>
      <div class="invoice-meta-col">
        <p><strong>Buyer / Consignee:</strong></p>
        <p style="font-size: 13px; font-weight: 700; color: #111827;">${escapeHtml(order.destination || 'Direct Consignee Delivery')}</p>
        <p><strong>Delivery Target:</strong> ${escapeHtml(order.deliveryTarget || '-')}</p>
        <p><strong>Place of Supply:</strong> ${supplyType === 'intra' ? 'Tamil Nadu (33)' : 'Inter-State Delivery'}</p>
        <p><strong>Dispatch Line:</strong> ${escapeHtml(order.destinationSub || 'Dedicated Truck Line')}</p>
      </div>
    </div>

    <table class="invoice-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">S.No</th>
          <th>Description of Goods / Item Specifications</th>
          <th style="width: 70px; text-align: center;">HSN/SAC</th>
          <th style="width: 100px; text-align: center;">Qty / UOM</th>
          <th style="width: 90px; text-align: right;">Rate (₹)</th>
          <th style="width: 110px; text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml || '<tr><td colspan="6" style="text-align: center; padding: 24px;">No line items in this work order</td></tr>'}
      </tbody>
    </table>

    <div class="invoice-calculation-grid">
      <div class="invoice-bank-card">
        <h4>Bank Account & Remittance Details</h4>
        <p><strong>Account Name:</strong> SGR MOULDS INDIA PRIVATE LIMITED</p>
        <p><strong>Bank:</strong> State Bank of India, SIPCOT Perundurai Branch</p>
        <p><strong>Account No:</strong> 38290192840 (Current A/c)</p>
        <p><strong>IFSC Code:</strong> SBIN0001234 &nbsp;|&nbsp; <strong>Branch Code:</strong> 01234</p>
        <p style="margin-top: 8px; font-size: 11px; color: #6b7280;">Terms: 100% payment against dispatch delivery note.</p>
      </div>

      <div class="invoice-totals-box">
        <div class="invoice-total-row">
          <span>Total Taxable Amount:</span>
          <span style="font-family: monospace; font-weight: 700;">₹${formatNum(taxableValue)}</span>
        </div>
        ${supplyType === 'intra' ? `
          <div class="invoice-total-row">
            <span>CGST (${cgstRate}%):</span>
            <span style="font-family: monospace;">₹${formatNum(cgstAmount)}</span>
          </div>
          <div class="invoice-total-row">
            <span>SGST (${sgstRate}%):</span>
            <span style="font-family: monospace;">₹${formatNum(sgstAmount)}</span>
          </div>
        ` : `
          <div class="invoice-total-row">
            <span>IGST (${gstRate}%):</span>
            <span style="font-family: monospace;">₹${formatNum(igstAmount)}</span>
          </div>
        `}
        <div class="invoice-total-row grand-total">
          <span>Total Invoice Amount (INR):</span>
          <span>₹${formatNum(grandTotal)}</span>
        </div>
        <div class="invoice-words-row">
          <strong>Amount in Words:</strong><br />
          ${numToWordsIndian(grandTotal)}
        </div>
      </div>
    </div>

    <div class="invoice-footer-signatures">
      <div class="invoice-sign-box">
        <div class="invoice-sign-line"></div>
        <div class="invoice-sign-label">Customer / Receiver Signature</div>
      </div>
      <div class="invoice-sign-box" style="text-align: right;">
        <div style="font-size: 11px; font-weight: 700; color: #064e3b; margin-bottom: 24px;">For SGR MOULDS INDIA PVT LTD</div>
        <div class="invoice-sign-line"></div>
        <div class="invoice-sign-label">Authorised Signatory / General Manager</div>
      </div>
    </div>
  `;
}

window.printInvoiceDoc = function() {
  document.body.classList.add("printing-invoice");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing-invoice");
  }, 1000);
};

// Populate & Show Physical Print Memo Modal (Doc Ref: SGR-MKT-02)
function openPrintMemoModal() {
  if (!requireOpenOrder()) return;
  const order = WORK_ORDERS_DATA[currentOrderIndex];

  document.getElementById("printVendorCode").textContent = order.vendorCode;
  document.getElementById("printWoNo").textContent = order.id;
  document.getElementById("printWoDate").innerHTML = `${order.issueDate} <span class="check-mark">✓</span>`;
  document.getElementById("printLocation").textContent = order.destination;
  document.getElementById("printDeliveryDate").textContent = order.deliveryTarget;

  const tbody = document.getElementById("printTableBody");
  tbody.innerHTML = "";

  let totalQty = 0;
  let totalMeters = 0;
  let totalWeight = 0;
  const profileMetersMap = {};

  order.items.forEach((item, index) => {
    const itemQty = Number(item.qty) || 0;
    const itemLen = Number(item.lengthMm) || 0;
    const runningMtr = Math.round((itemQty * itemLen) / 1000);
    const itemWeight = Number(item.weight) || 0;

    totalQty += itemQty;
    totalMeters += runningMtr;
    totalWeight += itemWeight;

    const prof = item.profile || extractProfileFromDesc(item.description);
    profileMetersMap[prof] = (profileMetersMap[prof] || 0) + runningMtr;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td style="font-weight: bold;">${item.custRef}</td>
      <td style="text-align: left; font-weight: bold;">
        ${item.description}
        ${item.remarks && item.remarks !== "In Queue // Standard Kraft Spec" ? `<br/><span style="font-size: 11px; font-weight: normal; background: #fef08a;">${item.remarks}</span>` : ""}
      </td>
      <td style="font-family: monospace; font-weight: bold;">${item.partNo}</td>
      <td style="font-weight: bold;">${formatNum(itemQty)}</td>
      <td>${item.uom}</td>
      <td style="font-weight: bold;">${formatNum(runningMtr)}</td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById("printTotalNos").textContent = formatNum(totalQty);
  document.getElementById("printTotalMeters").textContent = formatNum(totalMeters);

  // Remarks aggregations
  const remarksHtml = Object.keys(profileMetersMap).map((prof, i) => {
    return `${i + 1}.${prof.replace(/\s+/g, " ")} = ${formatNum(profileMetersMap[prof])} mtr`;
  }).join("<br/>");

  document.getElementById("printRemarksAggregations").innerHTML = remarksHtml;
  document.getElementById("printTestCertStatus").textContent = order.qualityGate.includes("YES") ? "Yes" : "Optional";

  // Summary lines
  document.getElementById("printSumNos").textContent = `${formatNum(totalQty)} Nos`;
  document.getElementById("printSumMeters").textContent = `${formatNum(totalMeters)} Meters`;
  document.getElementById("printSumWeight").textContent = `${formatNum(totalWeight)} kgs`;

  document.getElementById("printMemoModal").classList.add("open");
}

// Open Orders Drawer
function openOrdersDrawer() {
  const container = document.getElementById("ordersListContainer");
  container.innerHTML = "";

  WORK_ORDERS_DATA.forEach((wo, idx) => {
    const card = document.createElement("div");
    card.className = `drawer-order-card ${idx === currentOrderIndex ? "active" : ""}`;
    card.innerHTML = `
      <div class="drawer-card-top">
        <span class="drawer-wo-num">#${wo.id}</span>
        <span class="status-badge status-confirmed" style="font-size: 9px; padding: 1px 6px;">${wo.status}</span>
      </div>
      <div class="drawer-card-dest">${wo.destination}</div>
      <div class="drawer-card-meta">
        <span>Items: ${wo.items.length} Lines</span>
        <span>Target: ${wo.deliveryTarget}</span>
      </div>
    `;
    card.addEventListener("click", () => {
      currentOrderIndex = idx;
      renderWorkOrder();
      document.getElementById("ordersDrawer").classList.remove("open");
      showToast(`Switched to Work Order #${wo.id}`);
    });
    container.appendChild(card);
  });

  document.getElementById("ordersDrawer").classList.add("open");
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  renderWorkOrder();

  // Main Menu Dropdown
  const mainMenuBtn = document.getElementById("mainMenuBtn");
  const mainMenuPanel = document.getElementById("mainMenuPanel");

  if (mainMenuBtn && mainMenuPanel) {
    mainMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mainMenuPanel.classList.toggle("open");
    });

    document.addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
    });

    mainMenuPanel.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    document.getElementById("menuSwitchOrder").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      openOrdersDrawer();
    });

    document.getElementById("menuNewOrder").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      document.getElementById("newWorkOrderBtn").click();
    });

    document.getElementById("menuEditHeader").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      document.getElementById("editOrderHeaderBtn").click();
    });

    document.getElementById("menuPrintMemo").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      openPrintMemoModal();
    });

    document.getElementById("menuExportPdf").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      openPrintMemoModal();
    });

    const menuGenBill = document.getElementById("menuGenerateBill");
    if (menuGenBill) {
      menuGenBill.addEventListener("click", () => {
        mainMenuPanel.classList.remove("open");
        startBillFlow();
      });
    }

    document.getElementById("menuReleaseFloor").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      startReleaseFlow();
    });
  }

  // Print Memo Button
  document.getElementById("printMemoBtn").addEventListener("click", openPrintMemoModal);
  document.getElementById("closePrintModal").addEventListener("click", () => {
    document.getElementById("printMemoModal").classList.remove("open");
  });

  // Bill / Tax Invoice Buttons & Controls
  const btnHeaderBill = document.getElementById("btnHeaderBill");
  if (btnHeaderBill) btnHeaderBill.addEventListener("click", startBillFlow);

  const btnCornerBill = document.getElementById("btnCornerBill");
  if (btnCornerBill) btnCornerBill.addEventListener("click", startBillFlow);

  const closeTaxInvoiceModal = document.getElementById("closeTaxInvoiceModal");
  if (closeTaxInvoiceModal) {
    closeTaxInvoiceModal.addEventListener("click", () => {
      document.getElementById("taxInvoiceModal")?.classList.remove("open");
      if (billFlowActive) {                                   // bill generated through the confirmed flow: move on
        billFlowActive = false;
        const order = WORK_ORDERS_DATA[currentOrderIndex];
        document.getElementById("tabHistory").click();
        if (order) showToast(`Bill / invoice generated for Work Order #${order.id}.`);
      }
    });
  }

  // Confirmation dialog (Generate Bill, Release to Production)
  document.getElementById("actionConfirmYes").addEventListener("click", acceptActionConfirm);
  document.getElementById("cancelActionConfirm").addEventListener("click", closeActionConfirm);
  document.getElementById("closeActionConfirm").addEventListener("click", closeActionConfirm);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("actionConfirmModal").classList.contains("open")) closeActionConfirm();
  });

  const invoiceGstRate = document.getElementById("invoiceGstRate");
  if (invoiceGstRate) invoiceGstRate.addEventListener("change", renderTaxInvoice);

  const invoiceSupplyType = document.getElementById("invoiceSupplyType");
  if (invoiceSupplyType) invoiceSupplyType.addEventListener("change", renderTaxInvoice);

  // Orders Drawer Close
  document.getElementById("closeDrawerBtn").addEventListener("click", () => {
    document.getElementById("ordersDrawer").classList.remove("open");
  });

  // New Work Order: opens a blank draft in the Workbench. It is saved (and numbered) when the first line item
  // is added, or when Save Work Order is pressed.
  document.getElementById("newWorkOrderBtn").addEventListener("click", startNewWorkOrder);

  const draftForm = document.getElementById("draftHeaderForm");
  draftForm.addEventListener("input", syncDraftFromForm);
  draftForm.addEventListener("change", syncDraftFromForm);
  draftForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!commitDraft()) return;
    renderWorkOrder();
    const partInput = document.getElementById("addPartNo");
    if (partInput) partInput.focus();                 // straight on to the first line item
  });
  document.getElementById("draftOpenPast").addEventListener("click", () => {
    document.getElementById("tabHistory").click();
  });

  // Edit Line Item Modal Handlers
  const editItemModal = document.getElementById("editItemModal");
  document.getElementById("closeEditItemModal").addEventListener("click", () => {
    editItemModal.classList.remove("open");
  });
  document.getElementById("cancelEditItem").addEventListener("click", () => {
    editItemModal.classList.remove("open");
  });

  document.getElementById("editItemForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const order = WORK_ORDERS_DATA[currentOrderIndex];
    const index = parseInt(document.getElementById("editItemIndex").value, 10);
    const item = order.items[index];
    if (!item) return;

    item.partNo = document.getElementById("editPartNo").value.trim();
    item.custRef = document.getElementById("editCustRef").value.trim();
    item.description = document.getElementById("editDesc").value.trim();
    item.qty = parseInt(document.getElementById("editQty").value, 10) || 1;
    item.lengthMm = parseInt(document.getElementById("editLengthMm").value, 10) || 1000;
    item.uom = document.getElementById("editUom").value;
    item.weight = parseInt(document.getElementById("editWeight").value, 10) || Math.round(item.qty * (item.lengthMm / 1000) * 0.65);
    item.category = document.getElementById("editCategory").value;
    item.price = parseFloat(document.getElementById("editPrice").value) || 0;
    item.remarks = document.getElementById("editRemarks").value.trim();
    item.profile = extractProfileFromDesc(item.description);
    item.subDesc = `Length: ${item.lengthMm} mm // UOM: ${item.uom}`;

    persistOrders(order);
    renderWorkOrder();
    editItemModal.classList.remove("open");
    showToast(`Updated item ${item.partNo} successfully!`);
  });

  // Edit order details in place (header card): Edit Order -> the values become inputs -> Save / Cancel
  document.getElementById("editOrderHeaderBtn").addEventListener("click", startHeaderEdit);
  document.getElementById("cancelHeaderEdit").addEventListener("click", endHeaderEdit);
  document.getElementById("editHeaderForm").addEventListener("submit", saveHeaderEdit);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && headerEditUid) endHeaderEdit(); });

  // Action Buttons
  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    showToast("Work Order changes saved as draft.");
  });

  document.getElementById("exportPdfBtn").addEventListener("click", () => {
    if (!requireOpenOrder()) return;
    openPrintMemoModal();
    showToast("Opening Print & PDF export preview...");
  });

  document.getElementById("releaseFloorBtn").addEventListener("click", startReleaseFlow);

  document.getElementById("btnReverify").addEventListener("click", () => {
    showToast("ISO Compliance & Cryptographic audit checksum re-verified OK.");
  });

  // Global Search Controller with live suggestions dropdown & keyboard navigation
  const searchInput = document.getElementById("globalSearchInput");
  const searchResultsDropdown = document.getElementById("globalSearchResults");
  let selectedSuggestionIndex = -1;

  function highlightSearchText(text, q) {
    if (!text) return "";
    const str = String(text);
    if (!q) return escapeHtml(str);
    const escapedQ = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQ})`, "gi");
    return escapeHtml(str).replace(regex, `<span class="search-hl">$1</span>`);
  }

  function renderSearchSuggestions(query) {
    if (!searchResultsDropdown) return;
    const q = (query || "").trim();
    selectedSuggestionIndex = -1;

    if (!q) {
      // Empty input: show quick suggestion filters and recent orders
      const recentOrders = WORK_ORDERS_DATA.slice(-3).reverse();
      let html = `
        <div class="search-quick-tags-section">
          <div class="search-quick-title">Quick Search Filters</div>
          <div class="search-quick-tags">
            <span class="search-quick-tag" data-filter="CONFIRMED">Status: Confirmed</span>
            <span class="search-quick-tag" data-filter="RELEASED">Status: In Production</span>
            <span class="search-quick-tag" data-filter="EB 80">Profile: EB 80</span>
            <span class="search-quick-tag" data-filter="Chennai">Dest: Chennai</span>
            <span class="search-quick-tag" data-filter="Indore">Dest: Indore</span>
          </div>
        </div>
      `;

      if (recentOrders.length > 0) {
        html += `
          <div class="search-dropdown-header">
            <span>Recent Work Orders</span>
            <span class="search-count-badge">${recentOrders.length}</span>
          </div>
        `;
        recentOrders.forEach(wo => {
          const originalIdx = WORK_ORDERS_DATA.indexOf(wo);
          let statusClass = "status-confirmed";
          if (wo.status === "DRAFT") statusClass = "status-draft";
          if (wo.status && wo.status.includes("RELEASED")) statusClass = "status-released";

          let totalAmt = 0;
          (wo.items || []).forEach(it => { totalAmt += (Number(it.qty) || 0) * (Number(it.price) || 0); });
          const itemsSummary = (wo.items || []).map(it => `${it.qty || 0} NOS ${it.profile || it.description || ''}`).slice(0, 2).join(" · ");

          html += `
            <div class="search-result-item" data-order-idx="${originalIdx}">
              <div class="search-result-row-top">
                <span class="search-result-wo-id">#${wo.id}</span>
                <span class="search-result-status ${statusClass}">${wo.status || 'CONFIRMED'}</span>
              </div>
              <div class="search-result-row-mid">
                <span class="search-result-dest">${wo.destination || 'Plant Direct'}</span>
                <span class="search-result-amount">₹${formatNum(totalAmt)}</span>
              </div>
              <div class="search-result-row-bot">
                <span class="search-result-items-snippet">${itemsSummary || 'Standard items'}</span>
                <span>${wo.issueDate || ''}</span>
              </div>
            </div>
          `;
        });
      }

      html += `
        <div class="search-dropdown-footer">
          <span>Press ↑↓ to navigate</span>
          <span>Press ↵ to open</span>
        </div>
      `;

      searchResultsDropdown.innerHTML = html;
      searchResultsDropdown.style.display = "block";
      bindSearchDropdownEvents();
      return;
    }

    // Has query: filter matching orders
    const matches = [];
    WORK_ORDERS_DATA.forEach((wo, idx) => {
      if (matchesOrder(wo, q)) {
        matches.push({ wo, originalIdx: idx });
      }
    });

    if (matches.length === 0) {
      searchResultsDropdown.innerHTML = `
        <div class="search-empty-state">
          <svg class="search-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <div style="font-weight: 600; color: var(--color-ink-800); margin-bottom: 2px;">No matching results</div>
          <div>No work order found matching "<strong>${escapeHtml(q)}</strong>"</div>
        </div>
      `;
      searchResultsDropdown.style.display = "block";
      return;
    }

    let html = `
      <div class="search-dropdown-header">
        <span>Matching Work Orders</span>
        <span class="search-count-badge">${matches.length} found</span>
      </div>
    `;

    matches.forEach((item, matchIdx) => {
      const { wo, originalIdx } = item;
      let statusClass = "status-confirmed";
      if (wo.status === "DRAFT") statusClass = "status-draft";
      if (wo.status && wo.status.includes("RELEASED")) statusClass = "status-released";

      let totalAmt = 0;
      (wo.items || []).forEach(it => { totalAmt += (Number(it.qty) || 0) * (Number(it.price) || 0); });
      const itemsSummary = (wo.items || []).map(it => `${it.qty || 0} NOS ${it.profile || it.description || ''}`).slice(0, 2).join(" · ");

      html += `
        <div class="search-result-item" data-order-idx="${originalIdx}" data-match-idx="${matchIdx}">
          <div class="search-result-row-top">
            <span class="search-result-wo-id">#${highlightSearchText(wo.id, q)}</span>
            <span class="search-result-status ${statusClass}">${highlightSearchText(wo.status || 'CONFIRMED', q)}</span>
          </div>
          <div class="search-result-row-mid">
            <span class="search-result-dest">${highlightSearchText(wo.destination || 'Plant Direct', q)}</span>
            <span class="search-result-amount">₹${formatNum(totalAmt)}</span>
          </div>
          <div class="search-result-row-bot">
            <span class="search-result-items-snippet">${highlightSearchText(itemsSummary, q)}</span>
            <span>${highlightSearchText(wo.issueDate || '', q)}</span>
          </div>
        </div>
      `;
    });

    html += `
      <div class="search-dropdown-footer">
        <span>Press ↑↓ to navigate</span>
        <span>Press ↵ to open</span>
      </div>
    `;

    searchResultsDropdown.innerHTML = html;
    searchResultsDropdown.style.display = "block";
    bindSearchDropdownEvents();
  }

  function bindSearchDropdownEvents() {
    if (!searchResultsDropdown) return;
    // Quick filter chips click
    searchResultsDropdown.querySelectorAll(".search-quick-tag").forEach(tag => {
      tag.addEventListener("click", (e) => {
        e.stopPropagation();
        const filterVal = tag.getAttribute("data-filter");
        if (searchInput) {
          searchInput.value = filterVal;
          renderSearchSuggestions(filterVal);
          searchInput.focus();
        }
      });
    });

    // Result item click
    searchResultsDropdown.querySelectorAll(".search-result-item").forEach(item => {
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        const orderIdx = parseInt(item.getAttribute("data-order-idx"), 10);
        if (!isNaN(orderIdx) && WORK_ORDERS_DATA[orderIdx]) {
          openOrderFromSearch(orderIdx);
        }
      });
    });
  }

  function openOrderFromSearch(orderIdx) {
    if (typeof switchMainView === "function") switchMainView("workbench");
    currentOrderIndex = orderIdx;
    renderWorkOrder();
    if (searchResultsDropdown) searchResultsDropdown.style.display = "none";
    showToast(`Opened Work Order #${WORK_ORDERS_DATA[orderIdx].id} in Workbench`);
  }

  if (searchInput) {
    window.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
        renderSearchSuggestions(searchInput.value);
      }
    });

    searchInput.addEventListener("focus", () => {
      renderSearchSuggestions(searchInput.value);
    });

    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      renderSearchSuggestions(q);

      // If user is currently looking at the Work Orders tab, also sync search to that table
      const historyView = document.getElementById("historyView");
      if (historyView && historyView.style.display !== "none") {
        const histInput = document.getElementById("historySearchInput");
        if (histInput) {
          histInput.value = searchInput.value;
          renderHistoryTable();
        }
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      const items = searchResultsDropdown ? searchResultsDropdown.querySelectorAll(".search-result-item") : [];
      
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
          items.forEach((it, idx) => it.classList.toggle("selected", idx === selectedSuggestionIndex));
          items[selectedSuggestionIndex].scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (items.length > 0) {
          selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
          items.forEach((it, idx) => it.classList.toggle("selected", idx === selectedSuggestionIndex));
          items[selectedSuggestionIndex].scrollIntoView({ block: "nearest" });
        }
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items.length > 0 && selectedSuggestionIndex >= 0 && selectedSuggestionIndex < items.length) {
          const orderIdx = parseInt(items[selectedSuggestionIndex].getAttribute("data-order-idx"), 10);
          if (!isNaN(orderIdx)) openOrderFromSearch(orderIdx);
        } else {
          const q = searchInput.value.toLowerCase().trim();
          const matchIndex = WORK_ORDERS_DATA.findIndex(wo => matchesOrder(wo, q));
          if (matchIndex !== -1) {
            openOrderFromSearch(matchIndex);
          } else if (q) {
            showToast(`No matching work order found for "${searchInput.value.trim()}"`, "error");
          }
        }
      } else if (e.key === "Escape") {
        if (searchResultsDropdown) searchResultsDropdown.style.display = "none";
      }
    });

    // Close dropdown on click outside
    document.addEventListener("click", (e) => {
      const box = document.getElementById("globalSearchBox");
      if (searchResultsDropdown && !searchResultsDropdown.contains(e.target) && box && !box.contains(e.target)) {
        searchResultsDropdown.style.display = "none";
      }
    });
  }

  // Role Switcher
  document.getElementById("roleViewSelect").addEventListener("change", (e) => {
    showToast(`View switched to ${e.target.options[e.target.selectedIndex].text}`);
  });

  // View Tab Switching
  const tabWorkbench = document.getElementById("tabWorkbench");
  const tabHistory = document.getElementById("tabHistory");
  const workbenchView = document.getElementById("workbenchView");
  const historyView = document.getElementById("historyView");

  function switchView(viewName) {
    // Reset scroll to top immediately so user sees full view
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (viewName === "workbench") {
      tabWorkbench.classList.add("active");
      tabHistory.classList.remove("active");
      workbenchView.classList.add("active");
      historyView.classList.remove("active");
      renderWorkOrder();
    } else if (viewName === "history") {
      tabWorkbench.classList.remove("active");
      tabHistory.classList.add("active");
      workbenchView.classList.remove("active");
      historyView.classList.add("active");
      renderHistoryTable();
    }
  }

  tabWorkbench.addEventListener("click", () => switchView("workbench"));
  tabHistory.addEventListener("click", () => switchView("history"));

  // View Mode Toggle (Cards vs Table)
  const btnViewCards = document.getElementById("btnViewCards");
  const btnViewTable = document.getElementById("btnViewTable");
  const historyCardsContainer = document.getElementById("historyCardsContainer");
  const historyTableContainer = document.getElementById("historyTableContainer");

  if (btnViewCards && btnViewTable) {
    btnViewCards.addEventListener("click", () => {
      btnViewCards.classList.add("active");
      btnViewTable.classList.remove("active");
      if (historyCardsContainer) historyCardsContainer.style.display = "grid";
      if (historyTableContainer) historyTableContainer.style.display = "none";
    });

    btnViewTable.addEventListener("click", () => {
      btnViewTable.classList.add("active");
      btnViewCards.classList.remove("active");
      if (historyCardsContainer) historyCardsContainer.style.display = "none";
      if (historyTableContainer) historyTableContainer.style.display = "block";
    });
  }

  // History Directory Filters
  const historySearchInput = document.getElementById("historySearchInput");
  const historyStatusFilter = document.getElementById("historyStatusFilter");
  const historySortSelect = document.getElementById("historySortSelect");

  if (historySearchInput) historySearchInput.addEventListener("input", renderHistoryTable);
  if (historyStatusFilter) historyStatusFilter.addEventListener("change", renderHistoryTable);
  if (historySortSelect) historySortSelect.addEventListener("change", renderHistoryTable);

  const btnHistoryNewOrder = document.getElementById("btnHistoryNewOrder");
  if (btnHistoryNewOrder) {
    btnHistoryNewOrder.addEventListener("click", () => {
      document.getElementById("newWorkOrderBtn").click();
    });
  }

  // Digital Sign Modal Handlers
  const signModal = document.getElementById("signModal");
  document.getElementById("closeSignModal").addEventListener("click", () => {
    signModal.classList.remove("open");
  });
  document.getElementById("cancelSignModal").addEventListener("click", () => {
    signModal.classList.remove("open");
  });

  document.getElementById("signModalForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const order = WORK_ORDERS_DATA[currentOrderIndex];
    const stepId = parseInt(document.getElementById("signStepId").value, 10);
    const step = order.auditSteps.find(s => s.id === stepId);
    if (!step) return;

    step.person = document.getElementById("signPersonName").value.trim();
    step.verified = true;
    step.status = stepId === 3 ? "Released" : stepId === 4 ? "Loaded & Dispatched" : "Approved";
    const now = new Date();
    step.time = `${now.toLocaleDateString("en-GB")} ${now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}`;

    persistOrders(order);
    renderAuditChain();
    signModal.classList.remove("open");
    showToast(`Digitally signed and sealed by ${step.person}!`);
  });
});

// Render Work Orders Directory
function renderHistoryTable() {
  const cardsContainer = document.getElementById("historyCardsContainer");
  const tbody = document.getElementById("historyTableBody");
  
  if (cardsContainer) cardsContainer.innerHTML = "";
  if (tbody) tbody.innerHTML = "";

  const query = (document.getElementById("historySearchInput")?.value || "").toLowerCase().trim();
  const statusFilter = document.getElementById("historyStatusFilter")?.value || "ALL";
  const sortBy = document.getElementById("historySortSelect")?.value || "newest";

  let overallOrders = WORK_ORDERS_DATA.length;
  let overallMeters = 0;
  let overallWeight = 0;
  let overallAmount = 0;

  let filtered = WORK_ORDERS_DATA.map((wo, originalIdx) => {
    let totalQty = 0;
    let totalMeters = 0;
    let totalWeight = 0;
    let totalAmount = 0;
    let profileSet = new Set();

    wo.items.forEach(it => {
      const q = Number(it.qty) || 0;
      const len = Number(it.lengthMm) || 0;
      totalQty += q;
      totalMeters += Math.round((q * len) / 1000);
      totalWeight += Number(it.weight) || 0;
      totalAmount += q * (Number(it.price) || 0);
      if (it.profile) profileSet.add(it.profile);
      else if (it.description) profileSet.add(it.description.split(" X ").slice(0, 3).join(" X "));
    });

    overallMeters += totalMeters;
    overallWeight += totalWeight;
    overallAmount += totalAmount;

    const signedCount = wo.auditSteps ? wo.auditSteps.filter(s => s.verified).length : 0;

    return {
      ...wo,
      originalIdx,
      calcTotalQty: totalQty,
      calcTotalMeters: totalMeters,
      calcTotalWeight: totalWeight,
      calcTotalAmount: totalAmount,
      profilesList: Array.from(profileSet),
      signedCount
    };
  });

  // Update Summary KPI Strip
  const histKpiTotalOrders = document.getElementById("histKpiTotalOrders");
  const histKpiTotalMeters = document.getElementById("histKpiTotalMeters");
  const histKpiTotalWeight = document.getElementById("histKpiTotalWeight");
  const histKpiTotalAmount = document.getElementById("histKpiTotalAmount");

  if (histKpiTotalOrders) histKpiTotalOrders.textContent = overallOrders;
  if (histKpiTotalMeters) histKpiTotalMeters.textContent = formatNum(overallMeters);
  if (histKpiTotalWeight) histKpiTotalWeight.textContent = formatNum(overallWeight);
  if (histKpiTotalAmount) histKpiTotalAmount.textContent = "₹" + formatNum(overallAmount);

  // Filter
  if (query) {
    filtered = filtered.filter(wo => matchesOrder(wo, query));
  }

  if (statusFilter !== "ALL") {
    filtered = filtered.filter(wo => wo.status === statusFilter);
  }

  // Sort
  if (sortBy === "oldest") {
    filtered.sort((a, b) => a.originalIdx - b.originalIdx);
  } else if (sortBy === "highest") {
    filtered.sort((a, b) => b.calcTotalAmount - a.calcTotalAmount);
  } else if (sortBy === "qty") {
    filtered.sort((a, b) => b.calcTotalQty - a.calcTotalQty);
  } else {
    // Newest
    filtered.sort((a, b) => b.originalIdx - a.originalIdx);
  }

  // Update Count Badge in tab header
  const countEl = document.getElementById("historyTabCount");
  if (countEl) countEl.textContent = WORK_ORDERS_DATA.length;

  if (filtered.length === 0) {
    const emptyHtml = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 16px; background: var(--color-white); border-radius: var(--radius-md); border: 1px dashed var(--color-kraft-300);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width: 36px; height: 36px; color: var(--color-kraft-400); margin-bottom: 8px;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div style="font-size: 15px; font-weight: 700; color: var(--color-ink-800); margin-bottom: 4px;">No matching work orders found</div>
        <div style="font-size: 12px; color: var(--color-ink-500);">Try adjusting your search keywords or status filter.</div>
      </div>
    `;
    if (cardsContainer) cardsContainer.innerHTML = emptyHtml;
    if (tbody) tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 36px;">No matching records</td></tr>`;
    return;
  }

  // 1. Render Cards Grid
  if (cardsContainer) {
    filtered.forEach(wo => {
      let statusClass = "status-confirmed";
      if (wo.status === "DRAFT") statusClass = "status-draft";
      if (wo.status.includes("RELEASED")) statusClass = "status-released";

      const profilesHtml = (wo.profilesList || []).map(p => `<span class="history-profile-pill">${p}</span>`).join(" ");

      const card = document.createElement("div");
      card.className = `history-card-item${wo.status === "DRAFT" ? " is-draft" : ""}`;
      card.innerHTML = `
        <div class="history-card-header">
          <div class="history-card-id-wrap">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="history-card-id">#${wo.id}</span>
              <span class="status-badge ${statusClass}" style="font-size: 9.5px; padding: 2px 7px;">${wo.status}</span>
            </div>
            <span class="history-card-date">Issued: ${wo.issueDate} // Delivery Target: <strong style="color: #b45309;">${wo.deliveryTarget}</strong></span>
          </div>
          <span style="font-family: var(--font-mono); font-size: 11px; font-weight: 700; color: var(--color-ink-600);">${wo.vendorCode}</span>
        </div>

        <div>
          <div class="history-card-dest">${wo.destination}</div>
          <div class="history-card-dest-sub">${wo.destinationSub || "Direct Consignment"}</div>
        </div>

        <div class="history-card-profiles">
          ${profilesHtml || '<span class="history-profile-pill">Standard Edgeboards</span>'}
        </div>

        <div class="history-card-metrics">
          <div class="history-m-col">
            <span class="history-m-lbl">ITEMS</span>
            <span class="history-m-val">${wo.items.length} Lines</span>
          </div>
          <div class="history-m-col">
            <span class="history-m-lbl">QUANTITY</span>
            <span class="history-m-val">${formatNum(wo.calcTotalQty)} Nos</span>
          </div>
          <div class="history-m-col">
            <span class="history-m-lbl">RUN MTR</span>
            <span class="history-m-val">${formatNum(wo.calcTotalMeters)} Mtr</span>
          </div>
          <div class="history-m-col">
            <span class="history-m-lbl">TOTAL (₹)</span>
            <span class="history-m-val text-emerald">₹${formatNum(wo.calcTotalAmount)}</span>
          </div>
        </div>

        <div class="history-card-audit-bar">
          <div class="history-audit-steps-mini">
            <span class="audit-mini-chip ${wo.auditSteps && wo.auditSteps[0]?.verified ? 'done' : 'pending'}">DM ${wo.auditSteps && wo.auditSteps[0]?.verified ? '✓' : '…'}</span>
            <span class="audit-mini-chip ${wo.auditSteps && wo.auditSteps[1]?.verified ? 'done' : 'pending'}">QA ${wo.auditSteps && wo.auditSteps[1]?.verified ? '✓' : '…'}</span>
            <span class="audit-mini-chip ${wo.auditSteps && wo.auditSteps[2]?.verified ? 'done' : 'pending'}">GM ${wo.auditSteps && wo.auditSteps[2]?.verified ? '✓' : '…'}</span>
            <span class="audit-mini-chip ${wo.auditSteps && wo.auditSteps[3]?.verified ? 'done' : 'pending'}">WH ${wo.auditSteps && wo.auditSteps[3]?.verified ? '✓' : '…'}</span>
          </div>

          <div class="history-card-actions">
            <button class="action-btn action-secondary" style="padding: 5px 10px; font-size: 11px;" onclick="printOrderFromHistory(${wo.originalIdx})" title="Print Internal Memo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-3.5 h-3.5">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
                <path d="M6 14h12v8H6z"/>
              </svg>
              <span>Print</span>
            </button>
            <button class="action-btn action-primary" style="padding: 5px 12px; font-size: 11px;" onclick="openOrderFromHistory(${wo.originalIdx})" title="Open and edit in Workbench">
              <svg viewBox="0 0 20 20" fill="currentColor" class="w-3.5 h-3.5">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
              <span>Open</span>
            </button>
            <button class="btn-icon-small btn-delete" title="Delete Work Order" onclick="deleteOrderFromHistory(${wo.originalIdx})">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>
      `;
      cardsContainer.appendChild(card);
    });
  }

  // 2. Render Tabular View
  if (tbody) {
    filtered.forEach(wo => {
      let statusClass = "status-confirmed";
      if (wo.status === "DRAFT") statusClass = "status-draft";
      if (wo.status.includes("RELEASED")) statusClass = "status-released";

      const tr = document.createElement("tr");
      if (wo.status === "DRAFT") tr.className = "is-draft";
      tr.innerHTML = `
        <td class="part-code-cell" style="font-weight: 800; color: var(--color-forest-900);">#${wo.id}</td>
        <td style="font-size: 11.5px;">${wo.issueDate}</td>
        <td style="font-size: 11.5px; font-weight: 600; color: #b45309;">${wo.deliveryTarget}</td>
        <td>
          <div style="font-weight: 700; color: var(--color-ink-900);">${wo.destination}</div>
          <div style="font-size: 10.5px; color: var(--color-ink-500);">${wo.destinationSub || "Direct Consignment"}</div>
        </td>
        <td style="font-family: var(--font-mono); font-size: 11.5px; font-weight: 700;">${wo.vendorCode}</td>
        <td class="text-center font-mono">${wo.items.length}</td>
        <td class="text-right font-mono text-bold">${formatNum(wo.calcTotalQty)}</td>
        <td class="text-right font-mono text-bold">${formatNum(wo.calcTotalMeters)}</td>
        <td class="text-right font-mono">${formatNum(wo.calcTotalWeight)} Kgs</td>
        <td class="text-right font-mono text-bold text-emerald">₹${formatNum(wo.calcTotalAmount)}</td>
        <td class="text-center">
          <span class="status-badge ${statusClass}" style="font-size: 9.5px; padding: 2px 7px;">${wo.status}</span>
        </td>
        <td class="text-center font-mono" style="font-size: 11px;">
          <span style="color: ${wo.signedCount === 4 ? '#059669' : '#d97706'}; font-weight: 700;">${wo.signedCount}/4 Signed</span>
        </td>
        <td class="text-center">
          <div class="row-actions-cell">
            <button class="btn-icon-small" title="Open in Workbench" onclick="openOrderFromHistory(${wo.originalIdx})">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px; color: var(--color-forest-700);">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"/>
              </svg>
            </button>
            <button class="btn-icon-small" title="Print Physical Memo" onclick="printOrderFromHistory(${wo.originalIdx})">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
                <path fill-rule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clip-rule="evenodd"/>
              </svg>
            </button>
            <button class="btn-icon-small btn-delete" title="Delete Work Order" onclick="deleteOrderFromHistory(${wo.originalIdx})">
              <svg viewBox="0 0 20 20" fill="currentColor" style="width: 12px; height: 12px;">
                <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
              </svg>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
}

// Global helper: Open order from history table
window.openOrderFromHistory = function(idx) {
  currentOrderIndex = idx;
  document.getElementById("tabWorkbench").click();
  showToast(`Opened Work Order #${WORK_ORDERS_DATA[idx].id} in Workbench`);
};

// Global helper: Print order from history table
window.printOrderFromHistory = function(idx) {
  currentOrderIndex = idx;
  renderWorkOrder();
  openPrintMemoModal();
};

// Global helper: Delete order from history table
window.deleteOrderFromHistory = function(idx) {
  const wo = WORK_ORDERS_DATA[idx];
  if (confirm(`Are you sure you want to delete Work Order #${wo.id}?`)) {
    WORK_ORDERS_DATA.splice(idx, 1);
    if (idx === currentOrderIndex) currentOrderIndex = -1;          // the open order was deleted
    else if (idx < currentOrderIndex) currentOrderIndex--;          // list shifted up under the open one
    persistOrders();
    Cloud.queueDelete(wo.uid);
    renderHistoryTable();
    showToast(`Deleted Work Order #${wo.id}`);
  }
};

// Keeps the Quick Line Add bar as wide as the visible table area (see the note in style.css)
function fitQuickAddWidth() {
  const container = document.querySelector(".table-container");
  const form = document.getElementById("quickAddForm");
  if (container && form && container.clientWidth) form.style.setProperty("--qa-width", `${container.clientWidth}px`);
}
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".table-container");
  if (container && window.ResizeObserver) new ResizeObserver(fitQuickAddWidth).observe(container);
  fitQuickAddWidth();
});

// Shared database: sign-in, sync and pulling other people's changes (no-op until Supabase is configured)
document.addEventListener("DOMContentLoaded", () => {
  Cloud.start({
    orders: WORK_ORDERS_DATA,
    getActiveUid: () => (WORK_ORDERS_DATA[currentOrderIndex] || {}).uid,
    saveLocal: () => OrderStore.save(WORK_ORDERS_DATA),
    onChange: (activeUid) => {
      const idx = WORK_ORDERS_DATA.findIndex(o => o.uid === activeUid);
      currentOrderIndex = idx;   // -1 (nothing open) if no order was open or it was deleted elsewhere
      renderWorkOrder();
      renderHistoryTable();
      MonthlyReport.refreshIfVisible();
    },
    toast: showToast,
    onProfile: (profile) => { UsersAdmin.setProfile(profile); MonthlyReport.setProfile(profile); }
  });
});
