# GenManagement Reference — For GLR CRM Development

## Auth Pattern (copy this exactly)
- Admin: tiny dot bottom of page → modal → check email === ADMIN_EMAIL constant → window.location.replace
- Broker: form → signInWithPassword → check email === BROKER_EMAIL → 1000ms delay → window.location.replace
- Agent: form → signInWithPassword → check agents table `active` column → if false signOut + "Pending approval" → else 800ms → /agent-dashboard
- NO middleware complexity — simple, direct, works every time

## Supabase
- URL: https://mmpvnlccjadpiexbixjk.supabase.co
- Service role key prefix: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1tcHZubGNjamFkcGlleGJpeGprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSJ

## Credentials
- broker@glrealty.com / 123456789 → /dashboard
- admin@glrealty.com / 123456789 → /glradmin
- Agents sign up → pending → broker or admin approves → /agent-dashboard

## Agent Approval
- `agents.active = false` means pending, `true` means approved
- No separate `approved` column — `active` boolean serves both purposes
- Approve: UPDATE agents SET active=true, access_leads=true, access_msgs=true
- Reject: DELETE auth user via /api/admin/users/[id], then DELETE agents row

## Brand
- Green: #8DC63F, Gray: #58595B, Dark: #2d2e30, Card: #1a1b1d
- Fonts: Barlow Condensed (font-heading), Montserrat (body)
- No emojis anywhere. No white cards. Professional and clean.
- SVG icons only — never emoji icons

## Key Files
- `src/proxy.ts` — middleware (NOT middleware.ts), exports `proxy()` function
- `src/app/page.tsx` — login page (broker, agent, admin)
- `src/app/(crm)/` — broker portal route group
- `src/app/glradmin/` — admin portal (layout.tsx + dashboard/users/agents/settings)
- `src/components/AdminSidebar.tsx` — dark sidebar for admin portal
- `src/components/Sidebar.tsx` — sidebar for broker portal
- `src/lib/supabase.ts` — browser client (createBrowserClient)
- `src/lib/supabase-server.ts` — server client (createServerClient with getAll/setAll)
- `src/types/index.ts` — Agent, Lead, Message, Document types
- `src/app/api/admin/users/route.ts` — GET list users, POST create user
- `src/app/api/admin/users/[id]/route.ts` — DELETE user, PUT reset password

## Supabase SSR Rule
- ALWAYS use `getAll` / `setAll` cookie pattern
- NEVER use `get` / `set` / `remove` — causes silent auth failures in Next.js 16

## Redirect Timing
- Broker login: 1000ms delay before window.location.replace('/dashboard')
- Admin login: 1000ms delay before window.location.replace('/glradmin')
- Agent login: 800ms delay before window.location.replace('/agent-dashboard')
- Reason: session cookie must settle before middleware reads it

## Deploy
- git add . && git commit -m "description" && git push → auto deploys to Vercel
- Live: https://greenlightrealtycrm.vercel.app
- GitHub: https://github.com/BeShay-Bef/greenlightrealtycrm
