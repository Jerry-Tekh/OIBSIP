# Backend

Express modular monolith API. JavaScript, MongoDB/Mongoose, Socket.IO, payment integration and background jobs. Implement module-by-module; never trust client pricing or payment state.

## Transactional email — Brevo HTTP API

The application sends transactional messages through Brevo's HTTPS API rather than SMTP/Nodemailer. The shared sender is `src/config/mailer.js`; auth-specific templates and link construction remain in `src/modules/auth/auth.email.service.js`. Registration verification, verification resend, and password reset therefore use the same provider abstraction.

### Configuration

Set these backend environment variables locally and in Render (never commit real credentials):

- `BREVO_API_KEY`: Brevo transactional API key.
- `EMAIL_FROM_EMAIL`: Email address of a sender verified in Brevo.
- `EMAIL_FROM_NAME`: Sender display name (defaults to Pizza Delivery).

Email delivery is optional at API boot. If email is attempted without configuration, the API returns a service-unavailable error.

### Delivery flow

1. The auth email service builds the verification or reset URL and message content.
2. It calls the shared `sendEmail` function.
3. The mailer posts JSON to `https://api.brevo.com/v3/smtp/email` with the API-key header.
4. A successful provider HTTP response returns a message identifier; network and provider failures are translated into safe API errors (no provider credentials or response body leaked).

The provider call has a 15-second timeout. API delivery confirms acceptance by the provider, not inbox delivery.

### Local setup

After pulling this branch, run `npm install` in the backend directory to synchronize dependencies. Add the Brevo variables to your backend `.env`. Verify that the sender address is validated in Brevo and test the verification/reset flows.
