# Notes

## Main decisions

- Appwrite API calls run in TanStack Start server functions. The API key and
  Appwrite session secret are never sent to browser JavaScript.
- The Appwrite session secret is stored in an HttpOnly, SameSite cookie. When
  the session cannot be loaded, the cookie is cleared and the app treats the
  visitor as signed out.
- Personal Account data goes only through the deployed Appwrite Function. The
  Function uses Appwrite's authenticated execution user ID, and the unique
  database index makes onboarding safe when two requests arrive together.
- The profile form does not send a user ID from the browser. The brief
  suggests doing this, but a client-supplied ID is not a safe identity source.
  The Function already receives the authenticated user ID from Appwrite, so it
  is the correct source of truth.
- Redirect values are restricted to same-origin paths. External URLs and
  protocol-relative URLs fall back to `/`.

## What I would do next for production

- Add CSRF protection and rate limiting to sign-in and mutation endpoints.
- Use a `__Host-` cookie in HTTPS production and add automated browser tests
  for the complete email-code flow.
- Add structured authentication logs and monitoring for failed Appwrite
  executions.
