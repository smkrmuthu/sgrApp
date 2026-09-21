/**
 * SGR MOULDS INDIA PVT LTD — USERS TAB (MD only)
 *
 * The tab is shown only to a login whose profile role is "md". Everything here goes through
 * Cloud.manageUsers(), which calls the `manage-users` Edge Function; that function re-checks on the
 * server that the caller is an MD, so hiding the tab is a convenience, not the protection.
 *
 * Names and emails are inserted as plain text (textContent), never as HTML.
 */
const UsersAdmin = (() => {
  const ROLE_LABELS = { md: "MD", prod: "Production", qa: "QA", staff: "Staff" };
  const PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";   // no look-alikes (0/O, 1/l/I)

  let users = [];
  let editing = null;                    // the user being edited; null while adding a new one
  const $ = (id) => document.getElementById(id);

  // The top-right badge shows who is signed in. Without a profile (local-only mode) it keeps its default text.
  function showCurrentUser(profile) {
    if (!profile) return;
    const name = profile.full_name || (profile.email || "").split("@")[0] || "User";
    const initials = profile.full_name
      ? profile.full_name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("")
      : name.slice(0, 2);
    const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };
    set("userAvatar", initials.toUpperCase());
    set("userNameText", name);
    set("userRoleText", `ROLE: ${(ROLE_LABELS[profile.role] || profile.role || "Staff").toUpperCase()}`);
    const badge = $("userBadge");
    if (badge && profile.email) badge.title = profile.email;

    // Synchronize header role view switcher
    const roleSelect = $("roleViewSelect");
    if (roleSelect && profile.role) {
      const roleMap = {
        prod: "planner",
        planner: "planner",
        md: "gm",
        gm: "gm",
        qa: "qa",
        staff: "dispatch",
        dispatch: "dispatch"
      };
      if (roleMap[profile.role]) {
        roleSelect.value = roleMap[profile.role];
      }
    }
  }

  function setProfile(profile) {
    showCurrentUser(profile);
    const isMd = !!(profile && profile.role === "md");
    const tab = $("tabUsers");
    if (tab) tab.style.display = isMd ? "" : "none";
    const view = $("usersView");
    if (!isMd && view && view.style.display === "flex") switchMainView("workbench");
  }

  function setMessage(text, isError) {
    const el = $("usersMessage");
    if (!el) return;
    el.textContent = text || "";
    el.classList.toggle("is-error", !!isError);
  }

  function cell(text) {
    const td = document.createElement("td");
    td.textContent = text;
    return td;
  }

  function lastSeen(iso) {
    if (!iso) return "Never";
    const d = new Date(iso);
    return isNaN(d) ? "—" : d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function button(label, className, onClick, title) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `action-btn users-action-btn ${className || ""}`.trim();
    b.textContent = label;
    if (title) b.title = title;
    b.addEventListener("click", onClick);
    return b;
  }

  function render() {
    const body = $("usersTableBody");
    if (!body) return;
    body.replaceChildren();
    const me = Cloud.getUserId();
    users.forEach((u) => {
      const tr = document.createElement("tr");
      const role = cell("");
      const chip = document.createElement("span");
      chip.className = `role-chip role-${u.role}`;
      chip.textContent = ROLE_LABELS[u.role] || u.role;
      role.append(chip);

      const actions = cell("");
      actions.className = "users-actions-cell";
      actions.append(button("Edit", "", () => openModal(u)));
      const del = button("Delete", "users-delete-btn", () => remove(u),
        u.id === me ? "You can't delete your own login" : "Delete this user");
      if (u.id === me) del.disabled = true;
      actions.append(del);

      const email = cell(u.email + (u.id === me ? "  (you)" : ""));
      tr.append(email, cell(u.full_name || "—"), role, cell(lastSeen(u.last_sign_in_at)), actions);
      body.append(tr);
    });
    const count = $("usersCount");
    if (count) count.textContent = users.length;
  }

  async function refresh() {
    setMessage("Loading users…");
    const { data, error } = await Cloud.manageUsers({ action: "list" });
    if (error) { setMessage(error, true); return; }
    users = data.users || [];
    setMessage(users.length ? "" : "No users yet.");
    render();
  }

  function showFormError(text) {
    const el = $("userFormError");
    if (el) el.textContent = text || "";
  }

  function closeModal() {
    $("userModal").classList.remove("open");
    $("userPassword").type = "password";
  }

  function openModal(user) {
    editing = user || null;
    showFormError("");
    $("userModalTitle").textContent = editing ? "Edit User" : "Add User";
    $("userSubmit").textContent = editing ? "Save Changes" : "Create User";
    $("userEmail").value = editing ? editing.email : "";
    $("userName").value = editing ? (editing.full_name || "") : "";
    $("userRole").value = editing ? editing.role : "staff";
    $("userPassword").value = "";
    $("userPassword").type = "password";
    $("userPassword").required = !editing;
    $("userPasswordHint").textContent = editing
      ? "Leave blank to keep the current password. Enter a new one to reset it."
      : "At least 8 characters. Tell the person their password yourself; it cannot be shown again.";
    $("userModal").classList.add("open");
    $("userEmail").focus();
  }

  function generatePassword() {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    const pw = Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
    const field = $("userPassword");
    field.value = pw;
    field.type = "text";                 // show it so the MD can copy it
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const submit = $("userSubmit");
    submit.disabled = true;
    showFormError("");

    const payload = {
      email: $("userEmail").value.trim(),
      full_name: $("userName").value.trim(),
      role: $("userRole").value
    };
    const password = $("userPassword").value;

    if (editing) {
      payload.action = "update";
      payload.id = editing.id;
      if (payload.email.toLowerCase() === editing.email.toLowerCase()) delete payload.email;   // unchanged
      if (password) payload.password = password;
    } else {
      payload.action = "create";
      payload.password = password;
    }

    const { error } = await Cloud.manageUsers(payload);
    submit.disabled = false;
    if (error) { showFormError(error); return; }

    closeModal();
    showToast(editing ? "User updated." : `User ${payload.email.toLowerCase()} created.`);
    refresh();
  }

  async function remove(user) {
    const ok = confirm(`Delete ${user.email}?\n\nThey will no longer be able to sign in. Sign-offs they already made stay on record. This cannot be undone.`);
    if (!ok) return;
    const { error } = await Cloud.manageUsers({ action: "delete", id: user.id });
    if (error) { showToast(error, "error"); return; }
    showToast(`Deleted ${user.email}.`);
    refresh();
  }

  function init() {
    if (!$("userForm")) return;
    $("btnAddUser").addEventListener("click", () => openModal(null));
    $("userForm").addEventListener("submit", onSubmit);
    $("userGenPassword").addEventListener("click", generatePassword);
    $("closeUserModal").addEventListener("click", closeModal);
    $("cancelUserModal").addEventListener("click", closeModal);
  }
  init();

  return { setProfile, refresh };
})();
