# Outside the Norm migration

Status: database schema applied and verified in existing Supabase project otn
(lvwscpmmeixydytbpobp), organisation Outside the norm, region eu-west-1.
No production data has been moved. Vercel connection is still pending.

## Confirmed choices

- Repository: Jeandre86/outside-the-norm.
- New personal Vercel project, named Outside the Norm.
- Reuse the empty Supabase project otn after the free-project limit blocked creation; user approved this change.
- Admin: email and password; owner swemmerx@gmail.com.
- Retain all projects, layouts, blog settings/posts, enquiries, clients, invoices,
  numbering, payments, histories and uploaded images. Do not delete invoices.
- Keep the current Sites deployment running until the replacement is verified.

## Implementation sequence

1. Connect personal Vercel and Supabase accounts; select organisation, region and
   plan before provisioning. Confirm any charge before accepting a paid plan.
2. Convert the Cloudflare/Vinext runtime to standard Next.js for Vercel.
3. Replace ChatGPT login with Supabase cookie-based Auth. Verify users server-side,
   restrict Admin to the owner's verified identity, disable public signups and
   provide sign-in, sign-out and password reset. Owner sets their own password.
4. Apply the Supabase schema. Keep the current content documents intact for the
   initial migration so invoice relationships and revision numbers are preserved.
   Route public content through filtered server endpoints; never expose the raw
   billing or draft documents. Keep the service-role key server-only.
5. Export all source content and enquiries plus a complete uploaded-object list.
   Keep exports and secrets out of Git. Copy images with their existing object keys
   so /api/images URLs can continue working. Preserve bundled public images.
6. Import into the empty destination, compare document and object hashes, record
   counts, invoice numbers, next number, balances and histories. Verify hidden blog
   settings and drafts remain hidden. Do not substitute sample/default data when an
   export is unavailable. Verify all records, not just paginated Admin results.
7. Configure Vercel environment values and Supabase redirect URLs. Keep preview
   deployments separate from production billing data. Transfer email credentials
   only through secure settings if they are configured on the source.
8. Test owner/non-owner access, payment and invoice idempotency, concurrent edits,
   PDF generation, uploads, enquiry submission and content ordering. No viewport,
   device-emulation, resizing or responsive browser tests.
9. Pause edits briefly for final export/import, verify the final destination, then
   switch the public domain. Retain the original source and exports for rollback;
   avoid writes to both systems after cutover.

## Still to decide

- Supabase organisation, region and plan; Vercel team and appropriate plan.
- Initial Vercel URL and eventual custom domain.
- Auth email delivery setup and existing live-data export access.

## Prepared database migration

supabase/migrations/20261019073129_studio_storage.sql creates server-only document
and enquiry tables plus an atomic revision-checked save function. It has been applied to otn. Transactional checks confirmed initial saves, updates
and stale-revision rejection; test data was rolled back. Grants and RLS checks
confirmed anon/authenticated cannot read/write these tables or execute the save
function. Security advisors report only informational RLS-without-policy notices,
intentional for server-only access. Application adapters are implemented. Storage bucket creation, live-data import and owner account setup remain pending.

## Vercel build configuration

The migration branch uses standard Next.js, with `npm run build` invoking
`next build --webpack` and output directory `.next`. `vercel.json` sets the
framework and build settings. The previous Vinext build produced Cloudflare
output, which cannot satisfy Vercel's Next.js routes-manifest requirement.

Vercel must deploy `migrate/vercel-supabase` to use this configuration until the
migration is ready to merge. Repository root contains package.json, so leave
Root Directory at the repository root. Set the values from `.env.example` in
Vercel's environment settings; the Supabase secret must never have a
NEXT_PUBLIC prefix. Redeploy after changing environment settings.

Do not switch the live site to this deployment until the data import and owner
login are verified. Build success does not establish that data or images have
been migrated.
