/**
 * SGR MOULDS INDIA PVT LTD — WORK ORDER STORAGE
 *
 * This is the on-device copy of the work orders (browser localStorage): instant loading,
 * works offline. The shared copy lives in Supabase and is synced by db.js, which reads and
 * writes through this store. Schema rules below apply to both copies.
 *
 * CHANGING FIELDS (read this before editing the order / item shape)
 *   Add a field     -> add it to the matching *_DEFAULTS below. Records saved earlier
 *                      get the default on load. No version bump needed.
 *   Remove a field  -> remove it from *_DEFAULTS, bump SCHEMA_VERSION, and add a
 *                      MIGRATIONS entry that deletes it (otherwise the default refills it).
 *   Rename / reshape-> update *_DEFAULTS to the new name, bump SCHEMA_VERSION, and add a
 *                      MIGRATIONS entry that converts the old field.
 *   Fields not listed in the defaults are kept as-is, never silently dropped.
 */
const OrderStore = (() => {
  // GitHub Pages serves every smkrmuthu.github.io/* project from ONE origin, so the
  // key is namespaced to keep this app apart from other apps' localStorage entries.
  const STORAGE_KEY = "sgrApp:workOrders";
  const SCHEMA_VERSION = 2;

  // Random id for a new order. Falls back when crypto.randomUUID is unavailable (non-secure context).
  function newUid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = Array.from(b, x => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
  }

  // The 3 sample orders get fixed ids so every browser (and the database) agrees they are the same orders.
  const SEED_UIDS = {
    "343/2026-27": "5eed0000-0000-4000-8000-000000000343",
    "344/2026-27": "5eed0000-0000-4000-8000-000000000344",
    "345/2026-27": "5eed0000-0000-4000-8000-000000000345"
  };

  const ORDER_DEFAULTS = () => ({
    uid: newUid(),          // stable identity; the database key. Never edit.
    updatedAt: null,        // last server save we know of (used to detect edit conflicts)
    id: "",
    docRef: "",
    vendorCode: "",
    vendorSub: "",
    issueDate: "",
    deliveryTarget: "",
    deliveryChipText: "",
    destination: "",
    destinationSub: "",
    revision: "",
    status: "DRAFT",
    qualityGate: "TC: YES",
    auditSteps: [],
    items: []
  });

  const ITEM_DEFAULTS = () => ({
    id: "",
    partNo: "",
    description: "",
    subDesc: "",
    profile: "",
    lengthMm: 0,
    qty: 0,
    uom: "NOS",
    weight: 0,
    category: "Standard Angle",
    price: 0,
    remarks: "",
    custRef: ""
  });

  const AUDIT_STEP_DEFAULTS = () => ({
    id: 0,
    role: "",
    person: "",
    status: "Pending",
    time: "-",
    verified: false
  });

  // MIGRATIONS[n] upgrades the orders array from schema n to schema n + 1.
  // Example for the day a field is renamed (then bump SCHEMA_VERSION):
  //   2: (orders) => orders.map(o => { o.vendor = o.vendorCode; delete o.vendorCode; return o; }),
  const MIGRATIONS = {
    // v1 -> v2: orders get a permanent uid (needed to sync with the database)
    1: (orders) => orders.map(o => ({ ...o, uid: o.uid || SEED_UIDS[o.id] || newUid(), updatedAt: o.updatedAt || null }))
  };

  // Fills any missing (undefined / null) field from the defaults; keeps everything else.
  function fill(record, defaults) {
    const out = { ...record };
    const base = defaults();
    for (const key of Object.keys(base)) {
      if (out[key] === undefined || out[key] === null) out[key] = base[key];
    }
    return out;
  }

  function normalizeOrder(order) {
    const o = fill(order, ORDER_DEFAULTS);
    o.items = (Array.isArray(o.items) ? o.items : []).map(it => fill(it, ITEM_DEFAULTS));
    o.auditSteps = (Array.isArray(o.auditSteps) ? o.auditSteps : []).map((step, i) => {
      const s = fill(step, AUDIT_STEP_DEFAULTS);
      if (!s.id) s.id = i + 1;
      return s;
    });
    return o;
  }

  function readRaw() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }

  function writeRaw(text) {
    try { localStorage.setItem(STORAGE_KEY, text); return true; } catch (e) { return false; }
  }

  // Keeps an untouched copy of data we cannot use, so nothing is lost silently.
  function stashBackup(suffix, text) {
    try { localStorage.setItem(`${STORAGE_KEY}:${suffix}`, text); } catch (e) { /* storage full */ }
  }

  function save(orders) {
    const envelope = { schemaVersion: SCHEMA_VERSION, savedAt: new Date().toISOString(), orders };
    return writeRaw(JSON.stringify(envelope));
  }

  // Returns the saved orders; on first run (nothing saved yet) returns a copy of `seedOrders`.
  function load(seedOrders) {
    const firstRun = () => {
      const seeded = seedOrders.map(o => normalizeOrder({ uid: SEED_UIDS[o.id], ...JSON.parse(JSON.stringify(o)) }));
      save(seeded);
      return seeded;
    };

    const raw = readRaw();
    if (raw === null) return firstRun();

    let envelope;
    try {
      envelope = JSON.parse(raw);
      if (!envelope || !Array.isArray(envelope.orders)) throw new Error("bad shape");
    } catch (e) {
      stashBackup(`corrupt:${Date.now()}`, raw);
      console.warn("[OrderStore] Saved orders were unreadable; kept a backup and restored sample data.");
      return firstRun();
    }

    let version = Number(envelope.schemaVersion) || 1;
    if (version > SCHEMA_VERSION) {
      // Saved by a newer build than this one (e.g. after a rollback). Keep a copy before we overwrite.
      stashBackup(`backup-v${version}`, raw);
      version = SCHEMA_VERSION;
    }

    let orders = envelope.orders;
    let changed = version !== envelope.schemaVersion;
    for (; version < SCHEMA_VERSION; version++) {
      if (MIGRATIONS[version]) orders = MIGRATIONS[version](orders);
      changed = true;
    }

    orders = orders.map(normalizeOrder);
    if (changed) save(orders);
    return orders;
  }

  // Wipes saved orders (console use: OrderStore.reset()); next load starts from the sample data.
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  return { load, save, reset, normalizeOrder, newUid, SCHEMA_VERSION };
})();
