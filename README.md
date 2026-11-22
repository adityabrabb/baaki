# Baaki: who owes you, and will cash last till the 1st?

> **Baaki** (बाकी) means "still owed".
> ACE Builders Hackathon 2026 · **Problem Statement 1: The One-Person Back Office**

**Live:** https://codebent.vercel.app · **Repo:** https://github.com/adityabrabb/baaki · **Demo video:** _add link_

Baaki is the back office for one home tutor. It answers the two questions her notebook can't: **"Who owes me, how much, since when?"** and **"Will I make rent?"** It also drafts the awkward reminder message for her.

---

## 1. The user and the problem

**Priya Sharma**, a home maths tutor in Pune (a synthetic demo persona standing for a real kind of user).

| Fact | Detail |
|---|---|
| Students | 32 students from 28 families, Class 8–10, 4 batches |
| Fees | ₹1,500–2,500 a month, due on the 5th, paid by UPI or cash, often late and in parts |
| Bills | Rent ₹12,000 on the 1st · helper ₹6,000 on the 7th · phone ₹800 on the 12th · printing ₹1,500 on the 20th |
| Today | A paper notebook plus WhatsApp. She chases parents by hand and can't see if cash will last. |

**Her bad day:** rent is due in 9 days and 5 families are late at once. Baaki shows **who to chase first** and **what happens if they pay late**.

## 2. Problem statement → feature map

| PS1 requirement | Baaki feature | Screen |
|---|---|---|
| Invoice → payment tracking with assisted follow-ups | Raise next month's fees in one tap; record full, part or split payments; AI reminder drafts with a UPI pay link | /students, /invoice/[id], Chase |
| "Who owes me, how much, since when?" | Owed board with ageing buckets (0–7, 8–30, 30+ days) and "₹X of ₹Y received" | /owed |
| 30–90 day cash forecast from invoices + bills | Forecast chart with expected line, optimistic-to-pessimistic band, buffer line, bill markers, assumptions listed | /forecast |
| At least one "what if" | 5 scenarios (top 5 pay 15 days late, one family late, students leave, fees rise); dashed line plus "Rent on 1 Dec: ₹X instead of ₹Y" | /forecast |
| Alerts → clear next action | Up to 3 alerts within 30 days, nearest first, each with one action button ("Chase Shinde family") | / (Today) |
| Bad day: several clients late at once | Chase queue ranked by amount, days late and family reliability (Risky / Usually late / On time) | / (Today) |
| Minimum data entry | Quick-add line: "Shinde paid 1000 upi" → confirm → saved | / (Today) |
| Who pays and why switch | Pricing page with proposed tiers and an ROI line | /pricing |

## 3. Features

| Screen | What it does |
|---|---|
| **Today** | Cash in hand, next-bill stamp (COVERED / TIGHT / NOT COVERED), chase queue, alerts, quick-add |
| **Owed** | Every family that owes, ageing buckets, Chase on each card |
| **Chase** | Reminder in gentle / firm / final tone and English / Hinglish / Hindi, written by Gemini in Priya's own voice. Opens WhatsApp with the text, or copies it. Every reminder is logged. |
| **Students** | Students by batch, add and edit, raise next month's fees |
| **Invoice** | Payment timeline, record full or part payment (UPI or cash) |
| **Forecast** | 30 / 60 / 90 days, three bands, what-if scenarios, plain-English sentence, assumptions |
| **Bills** | Add, edit and delete recurring bills; set cash in hand and safety buffer. Forecast, Today and alerts update instantly. |
| **Settings** | Business name and UPI id (validated), Export CSV of all invoices, reset demo data |
| **Pricing** | Free / Pro / Centre tiers (proposed) |

The app works **without an AI key**: reminders and quick-add fall back to built-in templates and a rule-based parser.

## 4. Demo (2 minutes)

1. **Today:** rent ₹12,000 due in 9 days is TIGHT; 5 families are late.
2. **Chase** the top family → Hinglish, firm → WhatsApp opens with the message and UPI link.
3. **Quick-add** "Shinde paid 1000 upi" → confirm → owed and cash update.
4. **Forecast:** pick "Top 5 pay 15 days late" → dashed line drops, and the sentence names the bill that suffers most.
5. **Pricing:** ₹299 a month; one recovered ₹1,500 fee pays for 5 months.

## 5. Business viability

| Plan | Price (proposed) | For |
|---|---|---|
| Free | ₹0 | Up to 10 students, manual reminders |
| **Pro** | **₹299/month** | Unlimited students, AI reminders, forecast, what-if |
| Centre | ₹799/month | Coaching centres, 3 staff logins, batch reports |

- **Who pays:** the tutor, for her own plan. Parents keep paying fees by UPI or cash as before.
- **ROI:** one recovered ₹1,500 fee pays for 5 months of Pro.
- **Go-to-market:** tutor WhatsApp and Telegram groups, coaching associations, a referral gives 1 free month.
- **Expansion:** the same engine with new presets suits salons, freelancers and small clinics.
- Prices and ROI are assumptions, not customer results. Baaki never collects money; it only builds UPI links.

## 6. How it works

| Layer | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript strict |
| UI | Tailwind 4, Recharts 3, a "khata" notebook design (ruled paper, red margin, rubber-stamp statuses) |
| Logic | Pure domain functions in `src/lib/domain/` (forecast, what-if, alerts, chase priority, next bill, quick-add parsing) |
| Data | Seeded synthetic data relative to today, saved in localStorage (`baaki:v1`, versioned; corrupt data resets to seed) |
| AI | Gemini through server routes `/api/ai/reminder` and `/api/ai/parse`, zod-validated in and out, with a timeout and template fallback |
| Validation | zod on every form (bills, students, business name, UPI id) |
| Hosting | Vercel |

**Forecast rules:** cash on hand = opening balance + recorded payments. Expected: overdue fees count 0 until paid; not-yet-due fees arrive at the due date plus that family's average delay; future months are projected for active students. Optimistic: everything arrives on time. Pessimistic: an extra 15 days late, and Risky families never pay. What-if never changes recorded data.

## 7. Build quality

- **191 unit tests in 26 files** (Vitest) covering forecast, what-if, alerts, chase priority, payments, quick-add, bills, CSV and AI fallbacks
- `npm run check` = ESLint + `tsc --noEmit` + Vitest, run before every commit
- Small files with one job each; dates are `YYYY-MM-DD` strings; money is integer rupees
- Accessibility: labelled inputs, visible focus ring, status shown by word as well as colour, `prefers-reduced-motion` respected

## 8. Run it locally

```bash
git clone https://github.com/adityabrabb/baaki.git
cd baaki
npm install
cp .env.example .env.local   # optional: add GEMINI_API_KEY and GEMINI_MODEL
npm run dev                  # http://localhost:3000
npm run check                # lint + typecheck + tests
```

## 9. Built with Codebenders

All code was generated in the **Codebenders IDE** by the Nexen agent. Before the build window I wrote the plan, the PRD and agent instructions (`PRD.md`, `codebenders.md`, `.codebenders/agents/`): a builder, a reviewer and a QA agent. During the build I sent one prompt per slice: one editor spawn, one tester spawn for `npm run check`, then commit and push. Each push was checked on the live site before the next prompt.

| # | Slice (commit) | What Nexen built |
|---|---|---|
| 1 | `630abe4` → `7524923` | Next.js scaffold, Vitest, Prettier, check script, env example |
| 2 | `e54bad2` | Types, seeded data, localStorage repository, pure domain functions, first tests |
| 3 | `5216156` | "Bad day" seed: opening balance derived from today, alerts nearest first |
| 4 | `91e8654`, `50551e7` | Khata design system, store provider, navigation; fix for the Vercel font build error |
| 5 | `410d154`, `5c09b45` | Students, invoice payments, owed board, Today page |
| 6 | `463582a` → `3261477` | Gemini reminders and quick-add parsing with fallbacks, chase sheet, surname matching |
| 7 | `0582ed4` → `55b127b` | Forecast chart, what-if scenarios, projected future fees, pricing, settings |
| 8 | `da23657` | Bill add/edit/delete, business name and UPI, CSV export |
| 9 | `6833aa9` | Scenario sentence per bill, Priya's first-person voice in reminders |
| 10 | `04dec3f`, `2e516d3` | Visual pass: desktop grid, colour stamps, buttons, mobile chart; cash-in-hand field |

More detail: [`docs/CODEBENDERS_LOG.md`](docs/CODEBENDERS_LOG.md).

## 10. Limits and next steps

- Single user, data stays in one browser (no login or sync yet)
- No real payment collection or WhatsApp Business API; Baaki builds the message and UPI link, Priya sends them
- Demo data is synthetic
- Next: multi-device sync, payment confirmation from UPI SMS, presets for other one-person businesses
