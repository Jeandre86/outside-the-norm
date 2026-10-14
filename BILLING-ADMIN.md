# Studio billing

The owner-only admin now has Dashboard, Clients, Invoices, Service presets and Settings alongside the existing content sections. No welcome documents or questionnaires are included.

## Start using it

1. In Settings, enter the studio address and banking details, set payment terms and confirm the invoice prefix/next number. Sender and reply-to default to swemmerx@gmail.com and remain editable. Tax defaults to zero; a registration number is required when issuing invoices that charge tax.
2. Add a client. Create a draft invoice, add line items or presets, preview its PDF, then issue it. The server assigns the number and snapshots the studio/client details. Issued invoice financial details cannot be edited or deleted; duplicate to create a replacement and cancel the original when appropriate.
3. Download the PDF or review its email. For now use Compose in Gmail, attach the downloaded PDF yourself and mark sent manually.
4. Record received payments. Partial payments retain the balance; full settlement produces the PAID stamp. Reversals require a reason and retain history. Cancellation requires reversing any payments and resolving pending email sends first.

Invoice totals use integer minor units, line-level rounding, a per-line discount and tax on the discounted subtotal. Overdue is derived using Africa/Johannesburg dates. Dashboard totals are separated by currency. Preset rates are entered numerically, not currency conversions.

## Direct email setup — not connected yet

Production currently has no mail credentials. Direct sending is intentionally disabled until configured. No live email has been sent or tested.

Gmail: configure secure hosting variables GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN and GMAIL_SENDER_EMAIL. The OAuth client must have Gmail API enabled and obtain offline consent with https://www.googleapis.com/auth/gmail.send for the intended account. GMAIL_SENDER_EMAIL must match that account; the editable sender is checked against it before sending. Obtain credentials through Google's authorised setup, not through this chat or source control. An OAuth app kept in testing may require renewal of its refresh token; choose the appropriate production setup.

Later, a domain sender can use Resend: configure RESEND_API_KEY securely, verify the domain in Resend, select Resend under Settings and set the verified sender address. Registration of outsidethenorm.co.za alone does not establish mail sending or verification. Gmail addresses cannot be verified as a domain in Resend.

Credentials belong in Sites runtime secrets, never the database, client code or source. No mail endpoint accepts a destination service URL or arbitrary provider credentials from the browser.

Each send requires an explicit owner submission, same-origin check, invoice revision and unique attempt ID. A persisted sending lock precedes the provider call. Accepted means accepted by the provider, not confirmed delivery. Uncertain outcomes are retained and block retries until the owner checks the mailbox/provider and reconciles the attempt. There are no automatic reminders, retries, webhook delivery receipts or payment-gateway integrations.

## Storage and checks

Billing uses the existing D1 content table under the billing key with optimistic revision checks. The other content keys are unchanged. Issued records, payments and activity logs are retained. Owner-only JSON export is available on Dashboard. No real client data or invoice fixtures are seeded.

Run `node tests/run-billing-tests.mjs` for calculation/lifecycle/PDF and mocked API tests. It tests authorization, cross-origin protection, conflicts, idempotency and mail error paths without sending external messages. The one-page sample PDF was visually reviewed and the long fixture spans multiple pages. TypeScript and the production build are also checked. No browser responsiveness testing was performed.
