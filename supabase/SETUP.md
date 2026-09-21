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

## Roles and the Users tab (MD only)

The MD gets a **Users** tab to add people, change their role or password, and delete them.
Creating logins needs Supabase's admin key, which must never be put in a website, so the tab calls a
small function that runs inside Supabase. Set it up once:

6. **Re-run the schema.** Paste the latest [`schema.sql`](schema.sql) into the SQL Editor and *Run*
   again (safe to repeat). It adds the `profiles` table that stores each person's role.

7. **Give the MD their role.** In the SQL Editor run this once, using the emails you created
   (an MD is the only role that can manage users; add more rows for other people if you like):

   ```sql
   update public.profiles set role = 'md',   full_name = 'MD'         where email = 'md@sgr.com';
   update public.profiles set role = 'prod', full_name = 'Production' where email = 'prod@sgr.com';
   update public.profiles set role = 'qa',   full_name = 'QA'         where email = 'qa@sgr.com';
   ```

   It should say "Success. 1 row" for each. If it says 0 rows, that email doesn't exist yet
   (create the login first, step 3).

8. **Deploy the function.** Dashboard -> *Edge Functions* -> *Deploy a new function* -> *Via Editor*.
   Name it exactly `manage-users`, replace the sample code with the contents of
   [`functions/manage-users/index.ts`](functions/manage-users/index.ts), and click *Deploy function*
   (takes 10-30 seconds). You do not enter any keys: Supabase supplies the admin key to the function itself.

   **Updating it later:** *Edge Functions* -> `manage-users` -> open the code, paste the new version, *Deploy*.

   **Note on "Verify JWT":** Supabase's built-in login check only understands its older signing keys and
   rejects logins on newer projects ("UNAUTHORIZED_LEGACY_JWT / Invalid JWT") before our code runs. The
   app therefore sends the public key in the normal header and the person's login separately
   (`x-user-token`), and the function verifies it itself. You don't need to change any Verify JWT setting.

Sign in as the MD: a **Users** tab appears next to Past Work Orders. Everyone else never sees it, and
the function refuses them even if they call it directly.

Rules built in: you can't delete your own login, and there must always be at least one MD.
Deleting a person removes their login; sign-offs they already made stay on record with their email.

## Good to know

- **Free plan pauses** a project after about a week without use; the first visit afterwards is slow.
  The paid plan avoids this. Check Supabase's current pricing.
- **Adding, removing or renaming a field:** see the header of [`../storage.js`](../storage.js).
  New fields are stored automatically; no database change is needed.
- **Two people editing the same order:** the second save is refused and that person is shown the
  latest version, so nobody's work is overwritten silently.
- **Sign-off record:** who pressed *sign* and when is stamped by the server in
  `audit_steps.signed_by`, `signed_by_email` and `signed_at`; it can't be set from the browser.
- **Limits today:** roles are only used to decide who sees the Users tab. Everyone signed in can still
  read and edit all orders. Order numbers are not forced to be unique, and the app loads up to 1000 orders at once.
