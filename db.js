/**
 * SGR MOULDS INDIA PVT LTD — CLOUD SYNC (Supabase)
 *
 * Flow: the app always reads and writes the on-device copy (storage.js) so it is instant and works
 * offline. Every change is also queued here and pushed to Supabase; other people's changes are
 * pulled in when you sign in, come back to the tab, or regain connection.
 *
 * Off switch: with no anon key in supabase-config.js, none of this runs and the app is local-only.
 *
 * Field mapping: each order is split into a few "core" columns plus a `data` JSON blob. Any field
 * not listed in the *_CORE lists below travels in `data`, so new fields sync with no change here.
 */
const Cloud = (() => {
  const cfg = window.SGR_SUPABASE || {};
  const configured = !!(cfg.url && cfg.anonKey);

  const PENDING_KEY = "sgrApp:pending";        // changes not yet confirmed by the server
  const SYNCED_KEY = "sgrApp:syncedOnce";      // this device has completed its first sync
  const FLUSH_DELAY_MS = 500;
  const PULL_MIN_GAP_MS = 15000;
  const SELECT = "*, work_order_items(*), audit_steps(*)";

  // ------------------------------------------------------------ field mapping (pure functions)
  const HEADER_CORE = ["uid", "id", "status", "vendorCode", "issueDate", "deliveryTarget", "items", "auditSteps", "updatedAt"];
  const ITEM_CORE = ["id", "partNo", "qty", "lengthMm", "weight", "price"];
  const STEP_CORE = ["id", "role", "person", "status", "verified", "time"];

  const rest = (obj, coreKeys) => {
    const out = {};
    for (const k of Object.keys(obj)) if (!coreKeys.includes(k)) out[k] = obj[k];
    return out;
  };
  const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

  function toPayload(order) {
    const seen = new Set();
    return {
      uid: order.uid,
      order_no: String(order.id ?? ""),
      status: order.status,
      vendor_code: order.vendorCode,
      issue_date: order.issueDate,
      delivery_target: order.deliveryTarget,
      data: rest(order, HEADER_CORE),
      expected_updated_at: order.updatedAt || null,
      items: (order.items || []).map((it, i) => {
        let id = String(it.id || `item-${i + 1}`);
        while (seen.has(id)) id += `-${i}`;             // ids must be unique within an order
        seen.add(id);
        return { item_id: id, part_no: it.partNo, qty: num(it.qty), length_mm: num(it.lengthMm),
                 weight: num(it.weight), price: num(it.price), data: rest(it, ITEM_CORE) };
      }),
      audit_steps: (order.auditSteps || []).map((s, i) => ({
        step_id: s.id || i + 1, role: s.role, person: s.person, status: s.status,
        verified: !!s.verified, time: s.time, data: rest(s, STEP_CORE)
      }))
    };
  }

  function fromRow(r) {
    return OrderStore.normalizeOrder({
      ...r.data,
      uid: r.uid, id: r.order_no, status: r.status, vendorCode: r.vendor_code,
      issueDate: r.issue_date, deliveryTarget: r.delivery_target, updatedAt: r.updated_at,
      items: (r.work_order_items || []).slice().sort((a, b) => a.position - b.position).map(i => ({
        ...i.data, id: i.item_id, partNo: i.part_no, qty: num(i.qty), lengthMm: num(i.length_mm),
        weight: num(i.weight), price: num(i.price)
      })),
      auditSteps: (r.audit_steps || []).slice().sort((a, b) => a.step_id - b.step_id).map(s => ({
        ...s.data, id: s.step_id, role: s.role, person: s.person, status: s.status,
        verified: s.verified, time: s.time
      }))
    });
  }

  // ------------------------------------------------------------ state
  let client = null;
  let session = null;
  let profile = null;                   // this login's role, from the profiles table
  let env = null;                       // callbacks and the live orders array, supplied by app.js
  let flushing = false;
  let flushTimer = null;
  let lastPull = 0;
  let lastSyncAt = null;
  let lastError = false;
  let failToasted = false;
  let listenersBound = false;
  let seq = 0;

  // pending.upserts[uid] / pending.deletes[uid] = change number; survives a page reload
  let pending = { upserts: {}, deletes: {} };
  try {
    const saved = JSON.parse(localStorage.getItem(PENDING_KEY));
    if (saved) pending = { upserts: saved.upserts || {}, deletes: saved.deletes || {} };
  } catch (e) { /* start empty */ }

  const savePending = () => { try { localStorage.setItem(PENDING_KEY, JSON.stringify(pending)); } catch (e) { /* ignore */ } };
  const pendingCount = () => Object.keys(pending.upserts).length + Object.keys(pending.deletes).length;
  const active = () => !!(client && session);
  const isConflict = (e) => !!e && /CONFLICT/.test(e.message || "");

  // ------------------------------------------------------------ queueing (called by app.js)
  function queueSave(order) {
    if (!configured || !order || !order.uid) return;
    delete pending.deletes[order.uid];
    pending.upserts[order.uid] = ++seq;
    savePending(); setStatus(); scheduleFlush();
  }

  function queueDelete(uid) {
    if (!configured || !uid) return;
    delete pending.upserts[uid];
    pending.deletes[uid] = ++seq;
    savePending(); setStatus(); scheduleFlush();
  }

  function scheduleFlush() {
    clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
  }

  function fail(error) {
    console.warn("[Cloud] sync failed:", error);
    lastError = true;
    if (!failToasted) {
      failToasted = true;
      env.toast("Couldn't reach the server. Your changes are kept on this device and will sync automatically.", "error");
    }
    return true;
  }

  // ------------------------------------------------------------ push
  async function flush() {
    if (!active() || flushing) return;
    flushing = true; setStatus();
    let failed = false;
    try {
      for (let round = 0; round < 5 && pendingCount() && !failed; round++) {
        for (const uid of Object.keys(pending.deletes)) {
          const stamp = pending.deletes[uid];
          const { error } = await client.from("work_orders").delete().eq("uid", uid);
          if (error) { failed = fail(error); break; }
          if (pending.deletes[uid] === stamp) delete pending.deletes[uid];
        }
        if (failed) break;

        for (const uid of Object.keys(pending.upserts)) {
          const stamp = pending.upserts[uid];
          const order = env.orders.find(o => o.uid === uid);
          if (!order) { delete pending.upserts[uid]; continue; }
          const { data, error } = await client.rpc("save_work_order", { p: toPayload(order) });
          if (error) {
            if (isConflict(error)) { await adoptRemote(uid); continue; }
            failed = fail(error); break;
          }
          order.updatedAt = data;                       // the server's new timestamp for this order
          if (pending.upserts[uid] === stamp) delete pending.upserts[uid];   // keep it if edited mid-save
          env.saveLocal();
        }
        savePending();
      }
      if (!failed) { lastError = false; failToasted = false; lastSyncAt = new Date(); }
    } finally {
      flushing = false; savePending(); setStatus();
      if (!failed && active() && pendingCount()) scheduleFlush();
    }
  }

  // Someone else saved this order first: show their version instead of overwriting it.
  async function adoptRemote(uid) {
    delete pending.upserts[uid];
    const { data, error } = await client.from("work_orders").select(SELECT).eq("uid", uid).maybeSingle();
    if (error || !data) return;
    const fresh = fromRow(data);
    const activeUid = env.getActiveUid();
    const i = env.orders.findIndex(o => o.uid === uid);
    if (i >= 0) env.orders[i] = fresh; else env.orders.push(fresh);
    env.saveLocal(); env.onChange(activeUid);
    env.toast(`Work Order #${fresh.id} was changed by someone else. Their latest version is now shown. Please redo your edit.`, "error");
  }

  // ------------------------------------------------------------ pull
  async function pull({ force = false } = {}) {
    if (!active()) return;
    if (document.querySelector(".modal-backdrop.open:not(#loginGate)")) return;   // don't shift data under an open form
    const now = Date.now();
    if (!force && now - lastPull < PULL_MIN_GAP_MS) return;
    lastPull = now;

    await flush();                       // send our own changes first
    const { data, error } = await client.from("work_orders").select(SELECT).order("created_at", { ascending: true });
    if (error) { fail(error); setStatus(); return; }

    const remote = data.map(fromRow).filter(r => !pending.deletes[r.uid]);
    const remoteUids = new Set(remote.map(r => r.uid));
    const firstSync = localStorage.getItem(SYNCED_KEY) !== "1";
    const activeUid = env.getActiveUid();
    const merged = [];

    for (const r of remote) {
      const local = env.orders.find(o => o.uid === r.uid);
      merged.push(local && pending.upserts[r.uid] ? local : r);      // unsent local edits win until sent
    }
    for (const l of env.orders) {
      if (remoteUids.has(l.uid)) continue;
      if (pending.upserts[l.uid]) merged.push(l);                    // new here, still to be sent
      else if (firstSync) { pending.upserts[l.uid] = ++seq; merged.push(l); }   // pre-cloud order: import once
      // else: deleted by someone else, drop it
    }

    env.orders.splice(0, env.orders.length, ...merged);
    savePending(); env.saveLocal();
    try { localStorage.setItem(SYNCED_KEY, "1"); } catch (e) { /* ignore */ }
    lastError = false; failToasted = false; lastSyncAt = new Date();
    env.onChange(activeUid);
    setStatus();
    if (pendingCount()) scheduleFlush();
  }

  // ------------------------------------------------------------ sign-in gate and menu
  const $ = (id) => document.getElementById(id);

  function lock(message) {
    document.documentElement.classList.add("auth-locked");
    const gate = $("loginGate");
    if (gate) gate.classList.add("open");
    if (message) showLoginError(message);
  }

  function unlock() {
    document.documentElement.classList.remove("auth-locked");
    const gate = $("loginGate");
    if (gate) gate.classList.remove("open");
  }

  function showLoginError(text) {
    const el = $("loginError");
    if (el) el.textContent = text || "";
  }

  async function onLoginSubmit(ev) {
    ev.preventDefault();
    if (!client) return;
    const btn = $("loginSubmit");
    btn.disabled = true; showLoginError("");
    const { data, error } = await client.auth.signInWithPassword({
      email: $("loginEmail").value.trim(), password: $("loginPassword").value
    });
    btn.disabled = false;
    if (error || !data.session) {
      showLoginError(error && /invalid|credentials/i.test(error.message)
        ? "Incorrect email or password."
        : "Couldn't sign in. Check your internet connection and try again.");
      return;
    }
    $("loginPassword").value = "";
    session = data.session;
    unlock(); afterSignIn();
  }

  async function signOut() {
    await flush();
    if (pendingCount() && !confirm("Some changes haven't reached the server yet and will be lost if you sign out now. Sign out anyway?")) return;
    await client.auth.signOut();
    for (const key of ["sgrApp:workOrders", PENDING_KEY, SYNCED_KEY]) {
      try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
    location.reload();                   // clears the in-memory data too; comes back to the sign-in screen
  }

  function setStatus() {
    const el = $("syncStatus"), out = $("menuSignOut");
    if (!configured || !el) return;
    const on = active();
    const n = pendingCount();
    const s = n === 1 ? "1 change" : `${n} changes`;
    let text = "Connected";
    if (flushing) text = "Syncing…";
    else if (lastError) text = n ? `Offline — ${s} saved on this device` : "Offline";
    else if (n) text = `${s} waiting to sync`;
    else if (lastSyncAt) text = `Synced ${lastSyncAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
    el.textContent = `${on && session.user && session.user.email ? session.user.email + " · " : ""}${text}`;
    el.style.display = on ? "" : "none";
    if (out) out.style.display = on ? "" : "none";
  }

  // Who am I (role)? Used to show the Users tab to an MD. The server re-checks the role on every request.
  async function loadProfile() {
    profile = null;
    try {
      const { data } = await client.from("profiles").select("role, full_name, email").eq("id", session.user.id).maybeSingle();
      profile = data || null;
    } catch (e) {
      console.warn("Could not fetch profile record:", e);
    }
    if (!profile && session && session.user) {
      const email = (session.user.email || "").toLowerCase();
      let defaultRole = "staff";
      if (email.includes("md") || email.includes("gm") || email.includes("admin")) defaultRole = "md";
      else if (email.includes("prod") || email.includes("plan")) defaultRole = "prod";
      else if (email.includes("qa") || email.includes("qc")) defaultRole = "qa";
      profile = {
        role: (session.user.user_metadata && session.user.user_metadata.role) || defaultRole,
        full_name: (session.user.user_metadata && session.user.user_metadata.full_name) || email.split("@")[0],
        email: session.user.email
      };
    }
    if (env.onProfile) env.onProfile(profile);
  }

  // Calls the manage-users function (MD only). Resolves to { data } or { error: "readable message" }.
  // The project's public key goes in Authorization (the platform accepts it) and the person's login in
  // x-user-token, which the function verifies itself. See the note at the top of the function.
  async function manageUsers(body) {
    if (!active()) return { error: "Not signed in." };
    const { data: current } = await client.auth.getSession();       // fresh token (refreshed if needed)
    const token = current && current.session ? current.session.access_token : "";
    const { data, error } = await client.functions.invoke("manage-users", {
      body,
      headers: { Authorization: `Bearer ${cfg.anonKey}`, "x-user-token": token }
    });
    if (!error) return data && data.error ? { error: data.error } : { data };

    const response = error.context && typeof error.context.json === "function" ? error.context : null;
    if (!response) {
      // No answer at all: offline, or the browser blocked the call (this page's address isn't allowed)
      return { error: "Couldn't reach the user service. Check your internet connection, and open the app from the live site." };
    }
    if (response.status === 404) return { error: "The user service isn't set up yet (see supabase/SETUP.md, step 8)." };
    try {
      const j = await response.json();
      const text = j && (j.error || j.message || j.msg);
      if (text) return { error: response.status === 401 && !j.error ? `The user service refused the login (${text}).` : text };
    } catch (e) { /* not JSON */ }
    return { error: `The user service returned an error (HTTP ${response.status}).` };
  }

  function afterSignIn() {
    setStatus();
    loadProfile();
    if (!listenersBound) {
      listenersBound = true;
      window.addEventListener("online", () => { flush().then(() => pull({ force: true })); });
      document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") pull(); });
      const out = $("menuSignOut");
      if (out) out.addEventListener("click", signOut);
    }
    pull({ force: true });
  }

  // env = { orders, getActiveUid(), saveLocal(), onChange(activeUid), toast(msg, type), onProfile(profile) }
  async function start(e) {
    env = e;
    if (!configured) return;             // local-only mode
    const form = $("loginForm");
    if (form) form.addEventListener("submit", onLoginSubmit);

    if (!window.supabase || !window.supabase.createClient) {
      lock("Can't reach the sign-in service. Check your internet connection and reload the page.");
      if ($("loginSubmit")) $("loginSubmit").disabled = true;
      return;
    }
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    client.auth.onAuthStateChange((event, s) => {      // note: no awaits in here (supabase-js requirement)
      session = s;
      if (event === "SIGNED_OUT") { profile = null; if (env.onProfile) env.onProfile(null); lock(); }
    });
    const { data } = await client.auth.getSession();
    session = data.session;
    if (!session) { lock(); return; }
    unlock(); afterSignIn();
  }

  return {
    configured, start, queueSave, queueDelete, pull, flush, toPayload, fromRow, manageUsers,
    getUserId: () => (session && session.user ? session.user.id : null),
    getProfile: () => profile
  };
})();
