# Turning on the shared database (Supabase)

Until step 5 is done the app keeps working exactly as before: orders saved in each browser only.
Do the steps **in this order**.

1. **Create the tables.** Supabase dashboard -> *SQL Editor* -> *New query* -> paste all of
   [`schema.sql`](schema.sql) -> *Run*. It is safe to run again later.

2. **Switch off public sign-ups (important).** Dashboard -> *Authentication* -> *Sign In / Providers*
   (older dashboards: *Settings*) -> turn **off** "Allow new users to sign up".
   Every signed-in user has full access, so if sign-ups stay on, anyone who finds the site can
   create an account and read every order.

3. **Create the logins.** *Authentication* -> *Users* -> *Add user* -> *Create new user*: enter the
   person's email and a password, and tick **Auto Confirm User**. Repeat for each person.

4. **Copy the public key.** *Project Settings* -> *API Keys* -> copy the **anon / publishable**
   key. Never use the `service_role` / secret key.

5. **Paste it and publish.** Put the key in [`../supabase-config.js`](../supabase-config.js)
   (`anonKey`), then commit and push. The site now asks for a login.

On the first sign-in from a browser that already holds orders, those orders are uploaded once.
After that the database is the shared copy.

## Good to know

- **Free plan pauses** a project after about a week without use; the first visit afterwards is slow.
  The paid plan avoids this. Check Supabase's current pricing.
- **Adding, removing or renaming a field:** see the header of [`../storage.js`](../storage.js).
  New fields are stored automatically; no database change is needed.
- **Two people editing the same order:** the second save is refused and that person is shown the
  latest version, so nobody's work is overwritten silently.
- **Sign-off record:** who pressed *sign* and when is stamped by the server in
  `audit_steps.signed_by` / `signed_at`; it can't be set from the browser.
- **Limits today:** everyone signed in can do everything (roles are not enforced yet), order numbers
  are not forced to be unique, and the app loads up to 1000 orders at once.
