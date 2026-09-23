# Agent prompts and review notes

The work was completed in seven reviewable slices. The prompts used for the
slices were:

1. Build the server-only auth foundation with an HttpOnly session cookie.
2. Add a server-rendered auth-aware header and logout behavior.
3. Add email-code sign-in with safe internal redirects.
4. Add idempotent onboarding through the Appwrite Function.
5. Add `/profile` view and edit behavior through the Function.
6. Harden session and Function error handling.
7. Verify the build and write the required submission documentation.

## Three agent mistakes caught

1. The first test command targeted the `tests` directory, which Node did not
   discover in this setup. It was corrected to use the explicit `*.test.ts`
   pattern before the auth foundation was committed in
   [f9cc8e7](https://github.com/mrGafurov/hauz-frontend-task/commit/f9cc8e7).
2. The first profile mutation used `PATCH` as the TanStack server-function
   method. TanStack's RPC method type rejected it; the outer server function
   was changed to `POST` while the internal Appwrite execution remains
   `PATCH` in [a522761](https://github.com/mrGafurov/hauz-frontend-task/commit/a522761).
3. The first personal-account wrapper treated a normal `404` (no account yet)
   as an error before onboarding could handle it. The wrapper now returns
   `null` for `404` in [97fcfd9](https://github.com/mrGafurov/hauz-frontend-task/commit/97fcfd9).
