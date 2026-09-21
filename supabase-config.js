// Connection settings for the shared database (Supabase).
// Both values are PUBLIC by design: the anon key can only do what the database's access rules allow,
// and those rules (supabase/schema.sql) let nobody read or write anything without signing in.
// NEVER put the "service_role" key here.
//
// While anonKey is empty the app runs local-only (orders saved in this browser, no sign-in screen).
window.SGR_SUPABASE = {
  url: "https://zuvmolgdmhbgqonzpjcg.supabase.co",
  anonKey: "sb_publishable_ClscppU0a-LutkRhS13oWw_6IWqkGjk"   // publishable (public) key. Never put the secret key here.
};
