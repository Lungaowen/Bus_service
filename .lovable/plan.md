## Tshwane Bus Services — Frontend (Mock Data)

Build the full UI matching the screenshots, using mock data. No backend calls yet — a thin `mockApi` layer will simulate AuthService + CardService so we can swap in real URLs later.

### Design system

- Brand green (primary): deep green `#0F7A3D` with lighter tints for accents/backgrounds.
- Accent yellow (sun/logo): `#F5C518`.
- Neutrals: white surface, light gray `#F3F4F6` page background, dark sidebar `#0B0F14`.
- Fonts: Inter for body, DM Sans for headings (clean, matches screenshots).
- Tokens defined in `src/styles.css` (oklch); shadcn components pick them up.

### Routes

```text
/                     → redirects to /login (or /dashboard if "logged in")
/login                → login screen (left hero image + right form)
/register             → matching split layout, username/email/password
/dashboard            → authenticated shell (sidebar + topbar)
/payment-history      → payment history page inside same shell
```

- `_authenticated.tsx` layout wraps dashboard + payment history, renders sidebar/topbar, and redirects to `/login` if no mock session.
- Every route sets its own `head()` (title, description, og).

### Screens

1. **Login** — split screen. Left: bus photo (uploaded via lovable-assets) with gradient overlay, headline "Moving Tshwane forward, together.", info card. Right: Tshwane logo, user avatar circle, Username + Password fields (underlined style), "Create an Account" link → `/register`, green "Sign in" button. Submitting stores a mock user in `localStorage` and routes to `/dashboard`.
2. **Register** — same split layout, fields: Username, Email, Password, Confirm Password; "Create account" button; link back to `/login`.
3. **Dashboard** — sidebar (Dashboard active, Payment History), topbar (logo, profile icon, bell with badge "3", Logout). Content:
   - Welcome heading with user's name.
   - Balance card (light-green gradient) with R amount + "View Card" button → opens View Card modal (masked number, holder, expiry, CVV hidden by default).
   - Card Management card: Create / Top Up / Delete rows opening respective modals.
   - Information Cards row: Recent Payment (opens Recent Payment modal) and Active Cards (count).
4. **Modals** (shadcn Dialog):
   - Create Card: holder name, card type select, isDefault switch.
   - Top Up: card select, amount input, quick-pick chips R25/R50/R100/R200, Cancel / Top Up.
   - Delete: confirm closing selected card.
   - View Card: shows generated masked number + details.
   - Recent Payment: table of last transactions (Date, Description, Amount, Status badge).
5. **Payment History** — full page with searchable/sortable transaction table and status badges.

### Mock data & state

- `src/lib/mock-api.ts` — in-memory store seeded with the user "Mpho", one active Visa card (balance R2,500), two top-up transactions (matching screenshots). Exposes async functions shaped like the real APIs: `login`, `register`, `getCards`, `createCard`, `topUpCard`, `closeCard`, `setDefaultCard`, `getTransactions`. Each returns the documented `{ success, message, data }` envelope with a small delay.
- `src/lib/auth-store.ts` — tiny wrapper around `localStorage` for the mock JWT + user; `useAuth()` hook.
- TanStack Query for reads/mutations against `mockApi` so swapping to real endpoints later is a one-file change.

### Later swap to real APIs

Replace `mockApi` functions with `fetch` calls to the AuthService/CardService base URLs (provided later); keep the same function signatures so components don't change. Base URLs will live in `src/lib/api-config.ts`.

### Out of scope for this step

Real authentication, real network calls, notifications feed, profile page — placeholders only.