/**
 * SGR MOULDS INDIA PVT LTD — EXCEL & CSV IMPORT/EXPORT ENGINE
 * Seamless bulk import of purchase orders / BOMs, live preview mapping,
 * and high-precision export of schedules, delivery challans, and registers.
 */

(function (window) {
  "use strict";

  // Standard Profile Density/Weight Factors (Kg per 1000m running length) for fallback weight estimation
  const PROFILE_FACTORS = {
    "EB 80 X 80 X 6": 0.565, // ~565g per meter
    "EB 75 X 75 X 6": 0.676,
    "EB 50 X 50 X 4": 0.390,
    "EB 50 X 50 X 5": 0.480,
    "EB 40 X 40 X 4": 0.310,
    "VB 60 X 60 X 5": 0.833,
    "VB 50 X 50 X 4": 0.420,
    "VB 75 X 75 X 6": 0.720,
  };

  // Standard SGR Field Schema
  const SGR_FIELDS = [
    { key: "partNo", label: "Part Number", aliases: ["part #", "part no", "partno", "item code", "item no", "sku", "code"], required: false },
    { key: "description", label: "Description / Size", aliases: ["description", "item description", "desc", "size", "specification", "spec", "product description", "particulars"], required: true },
    { key: "profile", label: "Profile", aliases: ["profile", "type", "section", "profile type", "edgeboard profile"], required: false },
    { key: "lengthMm", label: "Length (mm)", aliases: ["length mm", "length(mm)", "length", "len", "cut length", "size mm"], required: false, isNumeric: true },
    { key: "qty", label: "Quantity", aliases: ["qty", "quantity", "nos", "pieces", "order qty", "count"], required: true, isNumeric: true },
    { key: "uom", label: "UOM", aliases: ["uom", "unit", "unit of measure", "u.o.m"], defaultVal: "NOS" },
    { key: "price", label: "Unit Price (₹)", aliases: ["price", "rate", "unit price", "price (₹)", "rate (₹)", "unit rate", "cost"], isNumeric: true, defaultVal: 0 },
    { key: "weight", label: "Weight (Kg)", aliases: ["weight", "wt", "weight (kg)", "net weight", "order weight", "kgs"], isNumeric: true },
    { key: "category", label: "Category", aliases: ["category", "type", "spec category", "spec", "board type"], defaultVal: "Standard Angle" },
    { key: "remarks", label: "Remarks / Spec", aliases: ["remarks", "notes", "specification notes", "packing remarks", "special instruction"], defaultVal: "Standard Kraft Spec" },
    { key: "custRef", label: "Customer Ref / PO Line", aliases: ["cust ref", "customer ref", "po ref", "po line", "client ref", "reference"], defaultVal: "" },
  ];

  // State
  let importParsedData = null; // { rawHeaders, rawRows, mappedColumns, mappedItems }
  let currentImportFile = null;

  // ---------------------------------------------------------------- Parse Helpers
  function cleanNumber(val) {
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const cleaned = String(val).replace(/[^0-9.-]/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }

  function extractProfileAndLength(desc) {
    let profile = "";
    let lengthMm = 0;
    if (!desc) return { profile: "EB 80 X 80 X 6", lengthMm: 1000 };

    const str = String(desc).trim();

    // Match profile like EB 80 X 80 X 6 or VB 60 X 60 X 5
    const profMatch = str.match(/\b(EB|VB)\s*(\d+)\s*[xX*]\s*(\d+)\s*[xX*]\s*(\d+(?:\.\d+)?)\b/i);
    if (profMatch) {
      profile = `${profMatch[1].toUpperCase()} ${profMatch[2]} X ${profMatch[3]} X ${profMatch[4]}`;
    }

    // Match length in mm e.g. "840 mm", "1219mm", "1000 MM" or "X 1200"
    const lenMatch = str.match(/(?:[xX*]\s*(\d{3,4})\s*(?:mm)?\b)|(?:(\d{3,4})\s*mm\b)/i);
    if (lenMatch) {
      lengthMm = parseInt(lenMatch[1] || lenMatch[2], 10);
    } else {
      // Check inches e.g. 48" or 48 inch
      const inchMatch = str.match(/(\d+(?:\.\d+)?)\s*(?:"|inch|inches)/i);
      if (inchMatch) {
        lengthMm = Math.round(parseFloat(inchMatch[1]) * 25.4);
      }
    }

    if (!profile) profile = "EB 80 X 80 X 6";
    if (!lengthMm || lengthMm <= 0) lengthMm = 1000;

    return { profile, lengthMm };
  }

  function generateAutoPartNo(profile, lengthMm, index = 1) {
    const p = (profile || "EB0806").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const lenStr = String(lengthMm || 1000).padStart(4, "0");
    return `${p.substring(0, 6)}${lenStr.substring(0, 3)}${String(index).padStart(2, "0")}`;
  }

  function estimateWeight(profile, lengthMm, qty) {
    const factor = PROFILE_FACTORS[profile] || 0.565;
    const runMtr = (qty * (lengthMm || 1000)) / 1000;
    return Math.round(runMtr * factor);
  }

  // ---------------------------------------------------------------- Column Auto-Detector
  function detectColumnMapping(headers) {
    const mapping = {}; // fieldKey -> headerIndex (-1 if not mapped)

    SGR_FIELDS.forEach((field) => {
      let matchedIndex = -1;
      const fKey = field.key.toLowerCase();

      // Step 1: exact match with aliases
      for (let i = 0; i < headers.length; i++) {
        const h = String(headers[i] || "").trim().toLowerCase();
        if (field.aliases.includes(h) || h === fKey) {
          matchedIndex = i;
          break;
        }
      }

      // Step 2: fuzzy contains match if not found
      if (matchedIndex === -1) {
        for (let i = 0; i < headers.length; i++) {
          const h = String(headers[i] || "").trim().toLowerCase();
          for (const alias of field.aliases) {
            if (h.includes(alias) || alias.includes(h)) {
              matchedIndex = i;
              break;
            }
          }
          if (matchedIndex !== -1) break;
        }
      }

      mapping[field.key] = matchedIndex;
    });

    return mapping;
  }

  // ---------------------------------------------------------------- CSV Parser (Fallback if SheetJS is loading or offline)
  function parseCSVText(csvText) {
    const lines = csvText.split(/\r\n|\n|\r/).filter((line) => line.trim().length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    function parseLine(line) {
      const result = [];
      let cur = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          if (inQuotes && line[i + 1] === char) {
            cur += char;
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(cur.trim());
          cur = "";
        } else {
          cur += char;
        }
      }
      result.push(cur.trim());
      return result;
    }

    const headers = parseLine(lines[0]);
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseLine(lines[i]);
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row);
      }
    }

    return { headers, rows };
  }

  // ---------------------------------------------------------------- Parse File (.xlsx, .xls, .csv)
  async function parseSpreadsheetFile(file) {
    return new Promise((resolve, reject) => {
      const fileName = file.name.toLowerCase();
      const reader = new FileReader();

      if (fileName.endsWith(".csv") && !window.XLSX) {
        // Simple CSV read
        reader.onload = (e) => {
          try {
            const { headers, rows } = parseCSVText(e.target.result);
            resolve(processParsedRows(headers, rows, file.name));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read CSV file"));
        reader.readAsText(file);
        return;
      }

      // SheetJS for XLSX, XLS, and robust CSV
      reader.onload = (e) => {
        try {
          if (!window.XLSX) {
            // If XLSX CDN failed to load, fallback to text if CSV
            if (fileName.endsWith(".csv")) {
              const text = new TextDecoder("utf-8").decode(e.target.result);
              const { headers, rows } = parseCSVText(text);
              resolve(processParsedRows(headers, rows, file.name));
              return;
            }
            throw new Error("Spreadsheet engine (SheetJS) is loading. Please check network or try again.");
          }

          const data = new Uint8Array(e.target.result);
          const workbook = window.XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawMatrix = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

          if (!rawMatrix || rawMatrix.length === 0) {
            throw new Error("Uploaded spreadsheet is empty");
          }

          // Find header row: first row that has at least 2 non-empty string cells
          let headerRowIdx = 0;
          for (let i = 0; i < Math.min(rawMatrix.length, 10); i++) {
            const row = rawMatrix[i];
            const nonEmpty = row.filter((c) => String(c).trim().length > 0);
            if (nonEmpty.length >= 2) {
              headerRowIdx = i;
              break;
            }
          }

          const headers = (rawMatrix[headerRowIdx] || []).map((h) => String(h).trim());
          const rows = rawMatrix.slice(headerRowIdx + 1).filter((r) => r.some((c) => String(c).trim().length > 0));

          resolve(processParsedRows(headers, rows, file.name));
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsArrayBuffer(file);
    });
  }

  function processParsedRows(headers, rows, fileName) {
    const columnMapping = detectColumnMapping(headers);
    const items = [];

    rows.forEach((row, rowIdx) => {
      const getVal = (key) => {
        const idx = columnMapping[key];
        return idx !== undefined && idx >= 0 ? row[idx] : undefined;
      };

      const rawDesc = String(getVal("description") || "").trim();
      const rawQty = cleanNumber(getVal("qty"));

      // Skip row if completely empty or no description and qty is 0
      if (!rawDesc && rawQty === 0) return;

      const extracted = extractProfileAndLength(rawDesc);
      const profile = String(getVal("profile") || extracted.profile).trim() || extracted.profile;
      const lengthMm = cleanNumber(getVal("lengthMm")) || extracted.lengthMm;
      const qty = rawQty > 0 ? rawQty : 1000;
      const uom = String(getVal("uom") || "NOS").trim().toUpperCase();
      const price = cleanNumber(getVal("price"));
      let weight = cleanNumber(getVal("weight"));
      if (weight <= 0) {
        weight = estimateWeight(profile, lengthMm, qty);
      }

      const category = String(getVal("category") || (rawDesc.toLowerCase().includes("custom") ? "Custom Spec" : "Standard Angle")).trim();
      const remarks = String(getVal("remarks") || "Standard Kraft Spec").trim();
      const custRef = String(getVal("custRef") || `PO-LINE-${rowIdx + 1}`).trim();
      const partNo = String(getVal("partNo") || generateAutoPartNo(profile, lengthMm, rowIdx + 1)).trim();

      const subDesc = `Thickness: ${profile.split("X")[2]?.trim() || "6"}mm // Length: ${lengthMm} mm`;

      items.push({
        id: `item-import-${Date.now()}-${rowIdx}-${Math.floor(Math.random() * 1000)}`,
        partNo,
        description: rawDesc || `${profile} X ${lengthMm} mm`,
        subDesc,
        profile,
        lengthMm,
        qty,
        uom,
        weight,
        category,
        price: price > 0 ? price : 42.50,
        remarks,
        custRef,
      });
    });

    return {
      fileName,
      rawHeaders: headers,
      rawRows: rows,
      columnMapping,
      items,
    };
  }

  // ---------------------------------------------------------------- Template Download
  function downloadImportTemplate(format = "xlsx") {
    const headers = [
      "Part Number",
      "Description",
      "Profile",
      "Length (mm)",
      "Quantity",
      "UOM",
      "Unit Price (INR)",
      "Weight (Kg)",
      "Category",
      "Remarks",
      "Customer Ref / PO Line",
    ];

    const sampleRows = [
      [
        "EB080600002",
        "EB 80 X 80 X 6 X 840 mm",
        "EB 80 X 80 X 6",
        840,
        1000,
        "NOS",
        42.50,
        565,
        "Standard Angle",
        "In Queue // Standard Kraft Spec",
        "CCPB00002-L1",
      ],
      [
        "EB080600003",
        "EB 80 X 80 X 6 X 990 mm",
        "EB 80 X 80 X 6",
        990,
        1000,
        "NOS",
        48.00,
        665,
        "Standard Angle",
        "In Queue // Standard Kraft Spec",
        "CCPB00002-L2",
      ],
      [
        "EB075600011",
        "EB 75 X 75 X 6 X 1219 mm (48\"-LENGTH)",
        "EB 75 X 75 X 6",
        1219,
        1000,
        "NOS",
        62.00,
        824,
        "Custom Spec",
        "Without Lamination Without Painting",
        "PUR-VBOARD48-PKG",
      ],
      [
        "VB060600008",
        "VB 60 X 60 X 5 X 1500 mm (Heavy V-Board)",
        "VB 60 X 60 X 5",
        1500,
        1500,
        "NOS",
        58.50,
        1250,
        "Heavy Duty",
        "Reinforced edges for pallet strapping",
        "INDO-VB-150",
      ],
    ];

    if (format === "csv" || !window.XLSX) {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [headers.join(","), ...sampleRows.map((e) => e.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "SGR_WorkOrder_Import_Template.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }

    const wsData = [headers, ...sampleRows];
    const ws = window.XLSX.utils.aoa_to_sheet(wsData);

    // Styling column widths
    ws["!cols"] = [
      { wch: 16 }, // Part Number
      { wch: 38 }, // Description
      { wch: 18 }, // Profile
      { wch: 14 }, // Length
      { wch: 12 }, // Qty
      { wch: 8 },  // UOM
      { wch: 16 }, // Price
      { wch: 14 }, // Weight
      { wch: 18 }, // Category
      { wch: 35 }, // Remarks
      { wch: 20 }, // Cust Ref
    ];

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "SGR_Import_Template");
    window.XLSX.writeFile(wb, "SGR_WorkOrder_Import_Template.xlsx");
  }

  // ---------------------------------------------------------------- Export Work Order Schedule (.xlsx / .csv)
  function exportWorkOrderSchedule(order, format = "xlsx") {
    if (!order) {
      if (typeof window.showToast === "function") window.showToast("No active Work Order to export.", "error");
      return;
    }

    const orderId = order.id || "DRAFT";
    const items = order.items || [];

    // Calculate totals
    const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const totalRunMtr = items.reduce((sum, it) => sum + Math.round(((Number(it.qty) || 0) * (Number(it.lengthMm) || 0)) / 1000), 0);
    const totalWeight = items.reduce((sum, it) => sum + (Number(it.weight) || 0), 0);
    const grandTotal = items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

    // Profile summary
    const profileMap = {};
    items.forEach((it) => {
      const p = it.profile || "STANDARD";
      const rm = Math.round(((Number(it.qty) || 0) * (Number(it.lengthMm) || 0)) / 1000);
      const wt = Number(it.weight) || 0;
      if (!profileMap[p]) profileMap[p] = { runMtr: 0, weight: 0, count: 0 };
      profileMap[p].runMtr += rm;
      profileMap[p].weight += wt;
      profileMap[p].count += 1;
    });

    const headers = [
      "PART #",
      "DESCRIPTION",
      "PROFILE",
      "LENGTH (MM)",
      "QTY",
      "UOM",
      "RUN MTR",
      "WEIGHT (KG)",
      "CATEGORY",
      "PRICE (INR)",
      "TOTAL (INR)",
      "REMARKS",
      "CUST REF",
    ];

    const dataRows = items.map((it) => {
      const rm = Math.round(((Number(it.qty) || 0) * (Number(it.lengthMm) || 0)) / 1000);
      const tot = (Number(it.qty) || 0) * (Number(it.price) || 0);
      return [
        it.partNo || "-",
        it.description || "-",
        it.profile || "-",
        Number(it.lengthMm) || 0,
        Number(it.qty) || 0,
        it.uom || "NOS",
        rm,
        Number(it.weight) || 0,
        it.category || "Standard Angle",
        Number(it.price) || 0,
        tot,
        it.remarks || "-",
        it.custRef || "-",
      ];
    });

    // Totals row
    const totalsRow = [
      "GRAND TOTALS",
      `Total Line Items: ${items.length}`,
      "",
      "",
      totalQty,
      "NOS",
      totalRunMtr,
      totalWeight,
      "",
      "",
      grandTotal,
      "",
      "",
    ];

    const fileName = `SGR_WO_${orderId.replace(/[^a-zA-Z0-9_-]/g, "_")}_Schedule`;

    if (format === "csv" || !window.XLSX) {
      const metaBlock = [
        `"SGR MOULDS INDIA PVT LTD — WORK ORDER MANUFACTURE SCHEDULE"`,
        `"Work Order No:","${orderId}","Issue Date:","${order.issueDate || ""}","Target Date:","${order.deliveryTarget || ""}"`,
        `"Vendor Code:","${order.vendorCode || ""}","Destination:","${order.destination || ""}","Status:","${order.status || ""}"`,
        `""`,
      ];

      const csvLines = [
        ...metaBlock,
        headers.join(","),
        ...dataRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
        totalsRow.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
      ];

      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
      if (typeof window.showToast === "function") window.showToast(`Exported Schedule CSV for WO #${orderId}`);
      return;
    }

    // XLSX Generation
    const sheetData = [
      ["SGR MOULDS INDIA PVT LTD — WORK ORDER MANUFACTURE SCHEDULE"],
      ["Plant: SIPCOT Perundurai, Tamil Nadu // SOP: SGR-MKT-02"],
      [],
      ["Work Order No:", orderId, "Doc Ref:", order.docRef || "DOC REF: SGR-MKT-02"],
      ["Vendor Code:", order.vendorCode || "-", "Sub Division:", order.vendorSub || "-"],
      ["Destination:", order.destination || "-", "Dispatch Line:", order.destinationSub || "-"],
      ["Issue Date:", order.issueDate || "-", "Delivery Target:", order.deliveryTarget || "-"],
      ["Status:", order.status || "CONFIRMED", "Quality Gate:", order.qualityGate || "TC: YES"],
      [],
      headers,
      ...dataRows,
      totalsRow,
      [],
      ["PROFILE AGGREGATION SUMMARY"],
      ["Profile Type", "Line Items", "Total Running Meters (Mtr)", "Total Weight (Kg)"],
      ...Object.keys(profileMap).map((p) => [p, profileMap[p].count, profileMap[p].runMtr, profileMap[p].weight]),
      [],
      ["AUDIT SIGN-OFF CHAIN"],
      ["Stage", "Role", "Signatory Person", "Status", "Sign Time / Digital Stamp"],
      ...(order.auditSteps || []).map((s) => [s.id, s.role, s.person, s.verified ? "VERIFIED / SIGNED" : "PENDING", s.time || "-"]),
    ];

    const ws = window.XLSX.utils.aoa_to_sheet(sheetData);

    ws["!cols"] = [
      { wch: 16 }, // PART #
      { wch: 38 }, // DESCRIPTION
      { wch: 18 }, // PROFILE
      { wch: 14 }, // LENGTH
      { wch: 12 }, // QTY
      { wch: 8 },  // UOM
      { wch: 12 }, // RUN MTR
      { wch: 14 }, // WEIGHT
      { wch: 16 }, // CATEGORY
      { wch: 14 }, // PRICE
      { wch: 16 }, // TOTAL
      { wch: 30 }, // REMARKS
      { wch: 20 }, // CUST REF
    ];

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Manufacture_Schedule");
    window.XLSX.writeFile(wb, `${fileName}.xlsx`);

    if (typeof window.showToast === "function") {
      window.showToast(`Exported Excel Schedule for WO #${orderId}`);
    }
  }

  // ---------------------------------------------------------------- Export Dispatch Delivery Challan (.xlsx / .csv)
  function exportDispatchChallan(order, format = "xlsx") {
    if (!order) {
      if (typeof window.showToast === "function") window.showToast("No active Work Order to export.", "error");
      return;
    }

    const orderId = order.id || "DRAFT";
    const items = order.items || [];
    const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
    const totalWeight = items.reduce((sum, it) => sum + (Number(it.weight) || 0), 0);
    const totalBundles = Math.ceil(totalQty / 50);

    const headers = [
      "ITEM #",
      "PART NUMBER",
      "PRODUCT SPECIFICATION",
      "PROFILE",
      "DISPATCH QTY",
      "UOM",
      "EST. BUNDLES (50/Bndl)",
      "NET WT (KG)",
      "CUST REF / PO NO",
      "PACKAGING CONDITION",
    ];

    const dataRows = items.map((it, idx) => [
      idx + 1,
      it.partNo || "-",
      it.description || "-",
      it.profile || "-",
      Number(it.qty) || 0,
      it.uom || "NOS",
      Math.ceil((Number(it.qty) || 0) / 50),
      Number(it.weight) || 0,
      it.custRef || "-",
      "Wrapped & Corner Protected",
    ]);

    const fileName = `SGR_Delivery_Challan_WO_${orderId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

    if (format === "csv" || !window.XLSX) {
      const csvLines = [
        `"SGR MOULDS INDIA PVT LTD — DISPATCH DELIVERY CHALLAN & GATE PASS"`,
        `"Challan No:","DC-${orderId.replace(/\//g, "-")}","Date:","${new Date().toLocaleDateString("en-IN")}"`,
        `"Work Order Ref:","${orderId}","Vendor Code:","${order.vendorCode || ""}"`,
        `"Consignee / Destination:","${order.destination || ""}","Transport Mode:","${order.destinationSub || "Dedicated Fleet"}"`,
        `""`,
        headers.join(","),
        ...dataRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
        `"TOTALS","","","","${totalQty}","NOS","${totalBundles} Bundles","${totalWeight} Kg","",""`,
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
      if (typeof window.showToast === "function") window.showToast(`Exported Dispatch Challan CSV for WO #${orderId}`);
      return;
    }

    const sheetData = [
      ["SGR MOULDS INDIA PVT LTD — DISPATCH DELIVERY CHALLAN & GATE PASS"],
      ["Factory: SF No. 120/1, SIPCOT Industrial Growth Centre, Perundurai - 638052"],
      ["GSTIN: 33AAACS1234F1Z5 // Contact: +91 94432 00000"],
      [],
      ["Delivery Challan No:", `DC-${orderId.replace(/\//g, "-")}`, "Date of Dispatch:", new Date().toLocaleDateString("en-IN")],
      ["Work Order No:", orderId, "Customer PO Ref:", items[0]?.custRef || "PO-DIRECT"],
      ["Consignee / Customer:", order.destination || "Direct Client", "Vendor Account:", order.vendorCode || "-"],
      ["Vehicle / Transport Line:", order.destinationSub || "Dedicated Fleet", "Delivery Target:", order.deliveryTarget || "-"],
      [],
      headers,
      ...dataRows,
      ["TOTAL DISPATCH", "", "", "", totalQty, "NOS", `${totalBundles} Bundles`, totalWeight, "", ""],
      [],
      ["DISPATCH & SECURITY CLEARANCE"],
      ["Prepared By (Dispatch Lead):", "Checked By (Quality Lead):", "Plant Manager Authorisation:", "Receiver / Driver Acknowledgement:"],
      ["[ Verified & Released ]", "[ Test Cert Attached ]", "[ Approved for Gate Pass ]", "[ Signature & Vehicle No ]"],
    ];

    const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 8 },  // ITEM #
      { wch: 16 }, // PART #
      { wch: 38 }, // PRODUCT SPEC
      { wch: 18 }, // PROFILE
      { wch: 14 }, // DISPATCH QTY
      { wch: 8 },  // UOM
      { wch: 22 }, // BUNDLES
      { wch: 14 }, // NET WT
      { wch: 20 }, // CUST REF
      { wch: 26 }, // PACKAGING
    ];

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Delivery_Challan");
    window.XLSX.writeFile(wb, `${fileName}.xlsx`);

    if (typeof window.showToast === "function") {
      window.showToast(`Exported Delivery Challan for WO #${orderId}`);
    }
  }

  // ---------------------------------------------------------------- Export All Orders Register (.xlsx)
  function exportAllOrdersRegister(orders = [], format = "xlsx") {
    if (!orders || orders.length === 0) {
      if (typeof window.showToast === "function") window.showToast("No Work Orders found to export.", "error");
      return;
    }

    const headers = [
      "WO NUMBER",
      "STATUS",
      "VENDOR CODE",
      "DESTINATION / CUSTOMER",
      "ISSUE DATE",
      "DELIVERY TARGET",
      "LINE ITEMS",
      "TOTAL PIECES",
      "TOTAL RUN MTR",
      "NET WEIGHT (KG)",
      "TOTAL VALUE (INR)",
      "QUALITY GATE",
      "PREPARED BY",
      "QA VERIFIED",
      "GM APPROVED",
      "DISPATCH STATUS",
    ];

    const dataRows = orders.map((o) => {
      const items = o.items || [];
      const totalPieces = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
      const totalRunMtr = items.reduce((s, it) => s + Math.round(((Number(it.qty) || 0) * (Number(it.lengthMm) || 0)) / 1000), 0);
      const totalWeight = items.reduce((s, it) => s + (Number(it.weight) || 0), 0);
      const totalValue = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

      const s1 = o.auditSteps?.find((s) => s.id === 1)?.verified ? "YES" : "NO";
      const s2 = o.auditSteps?.find((s) => s.id === 2)?.verified ? "YES" : "NO";
      const s3 = o.auditSteps?.find((s) => s.id === 3)?.verified ? "YES" : "NO";
      const s4 = o.auditSteps?.find((s) => s.id === 4)?.verified ? "RELEASED" : "PENDING";

      return [
        o.id || "DRAFT",
        o.status || "DRAFT",
        o.vendorCode || "-",
        o.destination || "-",
        o.issueDate || "-",
        o.deliveryTarget || "-",
        items.length,
        totalPieces,
        totalRunMtr,
        totalWeight,
        totalValue,
        o.qualityGate || "TC: YES",
        s1,
        s2,
        s3,
        s4,
      ];
    });

    const fileName = `SGR_Master_Work_Orders_Register_${new Date().toISOString().split("T")[0]}`;

    if (format === "csv" || !window.XLSX) {
      const csvLines = [
        `"SGR MOULDS INDIA PVT LTD — EXECUTIVE MASTER WORK ORDERS REGISTER"`,
        `"Generated At:","${new Date().toLocaleString("en-IN")}","Total Active Orders:","${orders.length}"`,
        `""`,
        headers.join(","),
        ...dataRows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")),
      ];
      const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${fileName}.csv`;
      link.click();
      if (typeof window.showToast === "function") window.showToast(`Exported ${orders.length} orders register to CSV`);
      return;
    }

    const sheetData = [
      ["SGR MOULDS INDIA PVT LTD — EXECUTIVE MASTER WORK ORDERS REGISTER"],
      ["Plant: SIPCOT Perundurai // Comprehensive Operations & Production Summary"],
      ["Generated on:", new Date().toLocaleString("en-IN"), "Total Orders:", orders.length],
      [],
      headers,
      ...dataRows,
    ];

    const ws = window.XLSX.utils.aoa_to_sheet(sheetData);
    ws["!cols"] = [
      { wch: 16 }, // WO NUMBER
      { wch: 22 }, // STATUS
      { wch: 14 }, // VENDOR
      { wch: 28 }, // DESTINATION
      { wch: 14 }, // ISSUE DATE
      { wch: 14 }, // DELIVERY TARGET
      { wch: 12 }, // LINE ITEMS
      { wch: 14 }, // TOTAL PIECES
      { wch: 16 }, // RUN MTR
      { wch: 16 }, // NET WEIGHT
      { wch: 18 }, // TOTAL VALUE
      { wch: 14 }, // QUALITY GATE
      { wch: 14 }, // PREPARED
      { wch: 14 }, // QA
      { wch: 14 }, // GM
      { wch: 16 }, // DISPATCH
    ];

    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, "Master_Register");
    window.XLSX.writeFile(wb, `${fileName}.xlsx`);

    if (typeof window.showToast === "function") {
      window.showToast(`Exported Master Register (${orders.length} orders) to Excel`);
    }
  }

  // ---------------------------------------------------------------- UI Modal Handlers
  function openImportModal() {
    const modal = document.getElementById("importExcelModal");
    if (!modal) return;

    // Reset UI state
    importParsedData = null;
    currentImportFile = null;

    const fileInput = document.getElementById("importFileInput");
    if (fileInput) fileInput.value = "";

    const dropZone = document.getElementById("importDropZone");
    if (dropZone) {
      dropZone.style.display = "flex";
      dropZone.classList.remove("has-file");
    }

    const previewSection = document.getElementById("importPreviewSection");
    if (previewSection) previewSection.style.display = "none";

    const errorBox = document.getElementById("importErrorBox");
    if (errorBox) errorBox.style.display = "none";

    const btnApply = document.getElementById("btnApplyImport");
    if (btnApply) btnApply.disabled = true;

    modal.classList.add("active");
  }

  function closeImportModal() {
    const modal = document.getElementById("importExcelModal");
    if (modal) modal.classList.remove("active");
  }

  function openExportModal() {
    const modal = document.getElementById("exportDataModal");
    if (!modal) return;
    modal.classList.add("active");
  }

  function closeExportModal() {
    const modal = document.getElementById("exportDataModal");
    if (modal) modal.classList.remove("active");
  }

  async function handleFileSelected(file) {
    if (!file) return;
    currentImportFile = file;

    const errorBox = document.getElementById("importErrorBox");
    const errorText = document.getElementById("importErrorText");
    const previewSection = document.getElementById("importPreviewSection");
    const btnApply = document.getElementById("btnApplyImport");
    const dropZone = document.getElementById("importDropZone");

    try {
      if (errorBox) errorBox.style.display = "none";
      const result = await parseSpreadsheetFile(file);
      importParsedData = result;

      if (!result.items || result.items.length === 0) {
        throw new Error("No valid item rows could be extracted from this file. Please check column headers.");
      }

      if (dropZone) {
        dropZone.style.display = "none";
      }

      if (previewSection) {
        previewSection.style.display = "block";
        renderImportPreview(result);
      }

      if (btnApply) btnApply.disabled = false;
    } catch (err) {
      console.error("Import error:", err);
      if (errorBox && errorText) {
        errorText.textContent = err.message || "Failed to parse file.";
        errorBox.style.display = "flex";
      }
      if (btnApply) btnApply.disabled = true;
    }
  }

  function renderImportPreview(parsedData) {
    const container = document.getElementById("importPreviewTableBody");
    const statsEl = document.getElementById("importStatsBadge");
    const fileLabelEl = document.getElementById("importFileNameLabel");

    if (fileLabelEl) fileLabelEl.textContent = parsedData.fileName || "Uploaded File";

    const items = parsedData.items || [];
    const totalQty = items.reduce((s, it) => s + (Number(it.qty) || 0), 0);
    const totalWeight = items.reduce((s, it) => s + (Number(it.weight) || 0), 0);
    const totalRunMtr = items.reduce((s, it) => s + Math.round(((Number(it.qty) || 0) * (Number(it.lengthMm) || 0)) / 1000), 0);
    const estVal = items.reduce((s, it) => s + (Number(it.qty) || 0) * (Number(it.price) || 0), 0);

    if (statsEl) {
      statsEl.innerHTML = `
        <span class="preview-stat-chip"><strong>${items.length}</strong> Line Items</span>
        <span class="preview-stat-chip"><strong>${Number(totalQty).toLocaleString("en-IN")}</strong> Pcs</span>
        <span class="preview-stat-chip"><strong>${Number(totalRunMtr).toLocaleString("en-IN")}</strong> Mtr Run</span>
        <span class="preview-stat-chip"><strong>${Number(totalWeight).toLocaleString("en-IN")}</strong> Kg</span>
        <span class="preview-stat-chip text-green"><strong>₹${Number(estVal).toLocaleString("en-IN")}</strong> Est. Total</span>
      `;
    }

    if (!container) return;
    container.innerHTML = "";

    items.slice(0, 50).forEach((item, idx) => {
      const tr = document.createElement("tr");
      const rm = Math.round(((Number(item.qty) || 0) * (Number(item.lengthMm) || 0)) / 1000);
      const total = (Number(item.qty) || 0) * (Number(item.price) || 0);

      tr.innerHTML = `
        <td class="font-mono text-muted">${idx + 1}</td>
        <td><strong class="font-mono">${escapeHtml(item.partNo)}</strong></td>
        <td>
          <div class="desc-main">${escapeHtml(item.description)}</div>
          <div class="desc-sub muted">${escapeHtml(item.profile)} // ${item.lengthMm}mm</div>
        </td>
        <td class="text-center"><strong>${Number(item.qty).toLocaleString("en-IN")}</strong> ${escapeHtml(item.uom)}</td>
        <td class="text-right font-mono">${Number(rm).toLocaleString("en-IN")} Mtr</td>
        <td class="text-right font-mono">${Number(item.weight).toLocaleString("en-IN")} Kg</td>
        <td class="text-right font-mono">₹${Number(item.price).toFixed(2)}</td>
        <td class="text-right font-mono font-bold">₹${Number(total).toLocaleString("en-IN")}</td>
        <td class="text-muted"><small>${escapeHtml(item.remarks || "-")}</small></td>
      `;
      container.appendChild(tr);
    });

    if (items.length > 50) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="9" class="text-center text-muted py-2">... and ${items.length - 50} more items ...</td>`;
      container.appendChild(tr);
    }
  }

  function applyImportToWorkOrder() {
    if (!importParsedData || !importParsedData.items || importParsedData.items.length === 0) {
      if (typeof window.showToast === "function") window.showToast("No items to import.", "error");
      return;
    }

    const mode = document.querySelector('input[name="importMode"]:checked')?.value || "append";
    const importedItems = importParsedData.items;

    // Check if in draft view or open order
    if (typeof window.WORK_ORDERS_DATA === "undefined") {
      console.error("WORK_ORDERS_DATA not available");
      return;
    }

    if (mode === "new") {
      // Create fresh work order from file
      const newOrder = window.newDraftOrder ? window.newDraftOrder() : { items: [] };
      newOrder.items = importedItems;
      newOrder.id = (window.nextOrderNumber ? window.nextOrderNumber() : Date.now()) + "/2026-27";
      newOrder.status = "DRAFT";
      newOrder.vendorCode = "CCPB00002";
      newOrder.destination = "Imported Customer PO";
      newOrder.deliveryChipText = `${newOrder.deliveryTarget} (Imported)`;

      window.WORK_ORDERS_DATA.push(newOrder);
      window.currentOrderIndex = window.WORK_ORDERS_DATA.length - 1;
      window.draftOrder = null;

      if (typeof window.persistOrders === "function") window.persistOrders(newOrder);
      if (typeof window.renderWorkOrder === "function") window.renderWorkOrder();
      if (typeof window.renderOrderCards === "function") window.renderOrderCards();
      if (typeof window.updateOrderCounts === "function") window.updateOrderCounts();

      closeImportModal();
      if (typeof window.showToast === "function") {
        window.showToast(`Created Work Order #${newOrder.id} with ${importedItems.length} imported lines!`);
      }
      return;
    }

    // Append or Replace in current order
    let targetOrder = null;
    if (window.currentOrderIndex >= 0 && window.WORK_ORDERS_DATA[window.currentOrderIndex]) {
      targetOrder = window.WORK_ORDERS_DATA[window.currentOrderIndex];
    } else if (window.draftOrder) {
      targetOrder = window.draftOrder;
    } else {
      if (typeof window.ensureDraft === "function") {
        targetOrder = window.ensureDraft();
      }
    }

    if (!targetOrder) {
      if (typeof window.showToast === "function") window.showToast("Unable to find active work order.", "error");
      return;
    }

    if (!targetOrder.items) targetOrder.items = [];

    if (mode === "replace") {
      targetOrder.items = [...importedItems];
    } else {
      // Append
      targetOrder.items.push(...importedItems);
    }

    if (typeof window.persistOrders === "function" && targetOrder.id) {
      window.persistOrders(targetOrder);
    }

    if (typeof window.renderWorkOrder === "function") window.renderWorkOrder();
    if (typeof window.renderOrderCards === "function") window.renderOrderCards();
    if (typeof window.updateOrderCounts === "function") window.updateOrderCounts();

    closeImportModal();
    if (typeof window.showToast === "function") {
      window.showToast(
        mode === "replace"
          ? `Replaced schedule with ${importedItems.length} imported lines.`
          : `Added ${importedItems.length} imported lines to Work Order #${targetOrder.id || "DRAFT"}.`
      );
    }
  }

  function escapeHtml(str) {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // ---------------------------------------------------------------- Initialization & Event Binding
  function initExcelService() {
    // Top burger menu items
    const menuImport = document.getElementById("menuImportExcel");
    if (menuImport) menuImport.addEventListener("click", openImportModal);

    const menuExportSchedule = document.getElementById("menuExportSchedule");
    if (menuExportSchedule) {
      menuExportSchedule.addEventListener("click", () => {
        const order = getCurrentOrder();
        exportWorkOrderSchedule(order, "xlsx");
      });
    }

    const menuExportChallan = document.getElementById("menuExportChallan");
    if (menuExportChallan) {
      menuExportChallan.addEventListener("click", () => {
        const order = getCurrentOrder();
        exportDispatchChallan(order, "xlsx");
      });
    }

    const menuExportAll = document.getElementById("menuExportAll");
    if (menuExportAll) {
      menuExportAll.addEventListener("click", () => {
        exportAllOrdersRegister(window.WORK_ORDERS_DATA || [], "xlsx");
      });
    }

    const menuTemplate = document.getElementById("menuDownloadTemplate");
    if (menuTemplate) {
      menuTemplate.addEventListener("click", () => downloadImportTemplate("xlsx"));
    }

    // Schedule header buttons
    const btnHeaderImport = document.getElementById("btnHeaderImport");
    if (btnHeaderImport) btnHeaderImport.addEventListener("click", openImportModal);

    const btnHeaderExport = document.getElementById("btnHeaderExport");
    if (btnHeaderExport) btnHeaderExport.addEventListener("click", openExportModal);

    // Workbench action buttons
    const exportPdfBtn = document.getElementById("exportPdfBtn");
    // Also attach quick export modal triggers
    const btnQuickExportXlsx = document.getElementById("btnQuickExportXlsx");
    if (btnQuickExportXlsx) {
      btnQuickExportXlsx.addEventListener("click", () => {
        const order = getCurrentOrder();
        exportWorkOrderSchedule(order, "xlsx");
      });
    }

    // Import Modal Bindings
    const closeImportBtn = document.getElementById("closeImportModal");
    if (closeImportBtn) closeImportBtn.addEventListener("click", closeImportModal);

    const cancelImportBtn = document.getElementById("cancelImportBtn");
    if (cancelImportBtn) cancelImportBtn.addEventListener("click", closeImportModal);

    const btnApplyImport = document.getElementById("btnApplyImport");
    if (btnApplyImport) btnApplyImport.addEventListener("click", applyImportToWorkOrder);

    const btnDownloadTplXlsx = document.getElementById("btnDownloadTplXlsx");
    if (btnDownloadTplXlsx) btnDownloadTplXlsx.addEventListener("click", () => downloadImportTemplate("xlsx"));

    const btnDownloadTplCsv = document.getElementById("btnDownloadTplCsv");
    if (btnDownloadTplCsv) btnDownloadTplCsv.addEventListener("click", () => downloadImportTemplate("csv"));

    const btnResetImport = document.getElementById("btnResetImport");
    if (btnResetImport) {
      btnResetImport.addEventListener("click", () => {
        openImportModal();
      });
    }

    // File Drop Zone
    const dropZone = document.getElementById("importDropZone");
    const fileInput = document.getElementById("importFileInput");

    if (dropZone && fileInput) {
      dropZone.addEventListener("click", () => fileInput.click());

      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("drag-over");
      });

      dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("drag-over");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("drag-over");
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFileSelected(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
          handleFileSelected(e.target.files[0]);
        }
      });
    }

    // Export Modal Bindings
    const closeExportBtn = document.getElementById("closeExportModal");
    if (closeExportBtn) closeExportBtn.addEventListener("click", closeExportModal);

    const cancelExportBtn = document.getElementById("cancelExportModal");
    if (cancelExportBtn) cancelExportBtn.addEventListener("click", closeExportModal);

    // Export Action Cards in Export Modal
    document.querySelectorAll(".btn-trigger-export").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const type = btn.dataset.type;
        const format = document.querySelector('input[name="exportFormat"]:checked')?.value || "xlsx";
        const order = getCurrentOrder();

        if (type === "schedule") {
          exportWorkOrderSchedule(order, format);
        } else if (type === "challan") {
          exportDispatchChallan(order, format);
        } else if (type === "register") {
          exportAllOrdersRegister(window.WORK_ORDERS_DATA || [], format);
        }
        closeExportModal();
      });
    });
  }

  function getCurrentOrder() {
    if (window.currentOrderIndex >= 0 && window.WORK_ORDERS_DATA && window.WORK_ORDERS_DATA[window.currentOrderIndex]) {
      return window.WORK_ORDERS_DATA[window.currentOrderIndex];
    }
    return window.draftOrder || (window.WORK_ORDERS_DATA && window.WORK_ORDERS_DATA[0]);
  }

  // Expose API globally
  window.ExcelService = {
    init: initExcelService,
    downloadImportTemplate,
    parseSpreadsheetFile,
    exportWorkOrderSchedule,
    exportDispatchChallan,
    exportAllOrdersRegister,
    openImportModal,
    closeImportModal,
    openExportModal,
    closeExportModal,
  };

  // Auto-init when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExcelService);
  } else {
    initExcelService();
  }
})(window);
