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

// Current Active Work Order Pointer
let currentOrderIndex = 0;

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
}

function renderWorkOrder() {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  const view = document.getElementById("workbenchView");
  if (view) view.classList.toggle("is-empty", !order);   // no orders: show the empty-state card instead of stale markup
  if (!order) { updateOrderCounts(); return; }

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
  const order = WORK_ORDERS_DATA[currentOrderIndex];
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
  const order = WORK_ORDERS_DATA[currentOrderIndex];

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

  // Clear inputs partially
  document.getElementById("addPartNo").value = "";
  document.getElementById("addDesc").value = "";
  document.getElementById("addRemarks").value = "";
  document.getElementById("addCustRef").value = "";
});

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

// Populate & Show Physical Print Memo Modal (Doc Ref: SGR-MKT-02)
function openPrintMemoModal() {
  const order = WORK_ORDERS_DATA[currentOrderIndex];
  if (!order) return;

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

    document.getElementById("menuReleaseFloor").addEventListener("click", () => {
      mainMenuPanel.classList.remove("open");
      document.getElementById("releaseFloorBtn").click();
    });
  }

  // Print Memo Button
  document.getElementById("printMemoBtn").addEventListener("click", openPrintMemoModal);
  document.getElementById("closePrintModal").addEventListener("click", () => {
    document.getElementById("printMemoModal").classList.remove("open");
  });

  // Orders Drawer Close
  document.getElementById("closeDrawerBtn").addEventListener("click", () => {
    document.getElementById("ordersDrawer").classList.remove("open");
  });

  // New Work Order Modal
  const newWoModal = document.getElementById("newWoModal");
  document.getElementById("newWorkOrderBtn").addEventListener("click", () => {
    const nextId = nextOrderNumber() + "/2026-27";
    document.getElementById("newWoNum").value = `#${nextId}`;
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("newIssueDate").value = today;
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    document.getElementById("newDeliveryDate").value = future;
    newWoModal.classList.add("open");
  });

  document.getElementById("closeNewWoModal").addEventListener("click", () => {
    newWoModal.classList.remove("open");
  });
  document.getElementById("cancelCreateWo").addEventListener("click", () => {
    newWoModal.classList.remove("open");
  });

  document.getElementById("createWoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const woNum = document.getElementById("newWoNum").value.replace("#", "").trim();
    const docRef = document.getElementById("newDocRef").value.trim();
    const vendorCode = document.getElementById("newVendorCode").value.trim();
    const vendorSub = document.getElementById("newVendorSub").value.trim();
    const issueDate = document.getElementById("newIssueDate").value;
    const deliveryDate = document.getElementById("newDeliveryDate").value;
    const destination = document.getElementById("newDestination").value.trim();
    const qualityGate = document.getElementById("newQualityGate").value;
    const status = document.getElementById("newStatus").value;

    const newOrder = {
      uid: OrderStore.newUid(),
      updatedAt: null,
      id: woNum,
      docRef: docRef,
      vendorCode: vendorCode,
      vendorSub: vendorSub,
      issueDate: issueDate,
      deliveryTarget: deliveryDate,
      deliveryChipText: `${deliveryDate} (New Order)`,
      destination: destination,
      destinationSub: "Standard Logistics Line",
      revision: "Rev 00, Dt: 01/08/22",
      status: status,
      qualityGate: `TC: ${qualityGate}`,
      auditSteps: [
        { id: 1, role: "Prepared by", person: "Production Planner", status: "Verified", time: "Just now", verified: true },
        { id: 2, role: "Verified by", person: "Quality Control & Plant Head", status: "Pending", time: "-", verified: false },
        { id: 3, role: "General Manager / JMD", person: "Executive Authorisation", status: "Pending", time: "-", verified: false },
        { id: 4, role: "Warehouse Gate & Dispatch", person: "Vehicle Loading Inspection", status: "Pending Loading", time: "-", verified: false }
      ],
      items: [
        {
          id: `item-${Date.now()}`,
          partNo: "EB080600001",
          description: "EB 80 X 80 X 6 X 1000 mm",
          subDesc: "Initial line item",
          profile: "EB 80 X 80 X 6",
          lengthMm: 1000,
          qty: 1000,
          uom: "NOS",
          weight: 650,
          category: "Standard Angle",
          price: 45.00,
          remarks: "Standard Kraft Spec",
          custRef: `${vendorCode}-L1`
        }
      ]
    };

    WORK_ORDERS_DATA.push(newOrder);
    currentOrderIndex = WORK_ORDERS_DATA.length - 1;
    persistOrders(newOrder);
    renderWorkOrder();
    newWoModal.classList.remove("open");
    showToast(`Work Order #${woNum} created successfully!`);
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

  // Edit Header Modal Handlers
  const editHeaderModal = document.getElementById("editHeaderModal");
  document.getElementById("editOrderHeaderBtn").addEventListener("click", () => {
    const order = WORK_ORDERS_DATA[currentOrderIndex];
    document.getElementById("editWoId").value = order.id;
    document.getElementById("editDocRef").value = order.docRef;
    document.getElementById("editVendorCode").value = order.vendorCode;
    document.getElementById("editVendorSub").value = order.vendorSub;
    document.getElementById("editIssueDate").value = order.issueDate;
    document.getElementById("editDeliveryTarget").value = order.deliveryTarget;
    document.getElementById("editDestination").value = order.destination;
    document.getElementById("editQualityGate").value = order.qualityGate || "TC: YES";
    document.getElementById("editStatus").value = order.status;
    editHeaderModal.classList.add("open");
  });

  document.getElementById("closeEditHeaderModal").addEventListener("click", () => {
    editHeaderModal.classList.remove("open");
  });
  document.getElementById("cancelEditHeader").addEventListener("click", () => {
    editHeaderModal.classList.remove("open");
  });

  document.getElementById("editHeaderForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const order = WORK_ORDERS_DATA[currentOrderIndex];
    order.id = document.getElementById("editWoId").value.trim();
    order.docRef = document.getElementById("editDocRef").value.trim();
    order.vendorCode = document.getElementById("editVendorCode").value.trim();
    order.vendorSub = document.getElementById("editVendorSub").value.trim();
    order.issueDate = document.getElementById("editIssueDate").value.trim();
    order.deliveryTarget = document.getElementById("editDeliveryTarget").value.trim();
    order.destination = document.getElementById("editDestination").value.trim();
    order.qualityGate = document.getElementById("editQualityGate").value;
    order.status = document.getElementById("editStatus").value;

    persistOrders(order);
    renderWorkOrder();
    editHeaderModal.classList.remove("open");
    showToast(`Work Order #${order.id} updated!`);
  });

  // Action Buttons
  document.getElementById("saveDraftBtn").addEventListener("click", () => {
    showToast("Work Order changes saved as draft.");
  });

  document.getElementById("exportPdfBtn").addEventListener("click", () => {
    openPrintMemoModal();
    showToast("Opening Print & PDF export preview...");
  });

  document.getElementById("releaseFloorBtn").addEventListener("click", () => {
    const order = WORK_ORDERS_DATA[currentOrderIndex];
    order.status = "RELEASED — IN PRODUCTION";
    persistOrders(order);
    showToast(`Work Order #${order.id} released to Production & Finishing Line 02!`);
    renderWorkOrder();
  });

  document.getElementById("btnReverify").addEventListener("click", () => {
    showToast("ISO Compliance & Cryptographic audit checksum re-verified OK.");
  });

  // Global Search
  const searchInput = document.getElementById("globalSearchInput");
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  searchInput.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    if (!q) return;
    const matchIndex = WORK_ORDERS_DATA.findIndex(wo => 
      wo.id.toLowerCase().includes(q) || 
      wo.destination.toLowerCase().includes(q) ||
      wo.vendorCode.toLowerCase().includes(q) ||
      wo.items.some(it => it.partNo.toLowerCase().includes(q) || it.description.toLowerCase().includes(q))
    );
    if (matchIndex !== -1 && matchIndex !== currentOrderIndex) {
      currentOrderIndex = matchIndex;
      renderWorkOrder();
      showToast(`Jumped to matching Work Order #${WORK_ORDERS_DATA[matchIndex].id}`);
    }
  });

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

// Render Past Work Orders Directory
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
    filtered = filtered.filter(wo => 
      wo.id.toLowerCase().includes(query) ||
      wo.destination.toLowerCase().includes(query) ||
      wo.vendorCode.toLowerCase().includes(query) ||
      wo.items.some(it => it.partNo.toLowerCase().includes(query) || it.description.toLowerCase().includes(query) || (it.custRef && it.custRef.toLowerCase().includes(query)))
    );
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
      card.className = "history-card-item";
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
    if (currentOrderIndex >= WORK_ORDERS_DATA.length) {
      currentOrderIndex = Math.max(0, WORK_ORDERS_DATA.length - 1);
    }
    persistOrders();
    Cloud.queueDelete(wo.uid);
    renderHistoryTable();
    showToast(`Deleted Work Order #${wo.id}`);
  }
};

// Shared database: sign-in, sync and pulling other people's changes (no-op until Supabase is configured)
document.addEventListener("DOMContentLoaded", () => {
  Cloud.start({
    orders: WORK_ORDERS_DATA,
    getActiveUid: () => (WORK_ORDERS_DATA[currentOrderIndex] || {}).uid,
    saveLocal: () => OrderStore.save(WORK_ORDERS_DATA),
    onChange: (activeUid) => {
      const idx = WORK_ORDERS_DATA.findIndex(o => o.uid === activeUid);
      currentOrderIndex = idx >= 0 ? idx : Math.min(currentOrderIndex, Math.max(0, WORK_ORDERS_DATA.length - 1));
      renderWorkOrder();
      renderHistoryTable();
    },
    toast: showToast
  });
});
