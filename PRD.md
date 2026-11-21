# Baaki — PRD (single source of truth)

> **Baaki** (बाकी, "still owed"). *Who owes you, and will cash last till the 1st?*
> ACE Builders 2026 · Problem Statement 1 · The One-Person Back Office.

## 1. User (pick ONE, build only for her)
**Priya Sharma**, home maths tutor, Pune. She is a synthetic demo
persona standing for one specific user: a home tutor managing fees and
bills alone. Her workflow and bill dates are product requirements; never
imply they come from real customer interviews.
- 32 students, Class 8–10, 4 batches. Fees ₹1,500–2,500/month, due on the 5th.
- Parents pay by UPI or cash, late and in parts. She chases them on WhatsApp.
- Bills: rent ₹12,000 on the 1st, helper salary ₹6,000 on the 7th,
  printing ~₹1,500 on the 20th, phone/internet ₹800 on the 12th.
- Today she uses a notebook + WhatsApp. She cannot answer:
  "who owes me, how much, since when?" or "will I make rent?"

## 2. Judging map (every feature must earn points)
| Criterion | Weight | How Baaki scores |
|---|---|---|
| Working Product | 30 | One loop works end to end on the live link, zero dead buttons |
| Business Viability | 25 | /pricing page, ₹299/mo, "one recovered fee pays 5 months" |
| Problem & User Clarity | 20 | Built for Priya only; "bad day" demo |
| Build Quality & Codebenders | 15 | Tests, small files, docs/CODEBENDERS_LOG.md |
| Presentation | 10 | README, 2-min demo video, LinkedIn post |

## 3. Problem statement → feature map (README copies this table)
| PS1 requirement | Baaki feature | Screen |
|---|---|---|
| Invoice → payment tracking with assisted follow-ups | Raise month's fees in one tap, invoice timeline, AI reminder drafts | /students, /invoice/[id] |
| "Who owes me, how much, since when?" | Baaki board with ageing buckets | /owed |
| 30–90 day cash forecast from invoices + bills | Forecast chart, 3 bands, assumptions panel | /forecast |
| At least one "what if" | Scenario chips + custom scenario | /forecast |
| Alerts → clear next action | Today list: "Chase Rohan's mum today" | / (Today) |
| Q: bad day, 5 late at once | Chase queue ranked by priority score | / (Today) |
| Q: minimum data entry | Quick-add line: "Rohan paid 1500 cash" | header, everywhere |
| Q: who pays and why switch | Pricing page + ROI line | /pricing |

## 4. Core loop (MUST work flawlessly — build this first)
1. **Raise fees**: "Raise November fees" creates one invoice per active
   student (amount from student's fee, due on the 5th).
2. **Owed**: overdue invoices show on the Baaki board and Today list.
3. **Chase**: tap Chase → AI drafts reminder (tone + language) → opens
   WhatsApp click-to-chat with the text, or copy. Logs a Reminder.
4. **Pay**: record full or partial payment (UPI/cash) or quick-add line.
5. **Forecast updates**: balance line, alerts and Today list react at once.

## 5. Screens
| Route | Purpose | Must show |
|---|---|---|
| `/` Today | What to do now | Cash status sentence, next bill + "covered?" badge, ranked chase queue (top 5), quick-add |
| `/owed` Baaki board | Who owes what | Total owed, buckets 0–7 / 8–30 / 30+ days, list per family: amount, days, reliability badge, Chase button |
| `/students` | Roster + invoicing | Students grouped by batch, fee, family, "Raise <month> fees" button, add/edit student |
| `/invoice/[id]` | One invoice | Timeline (raised → reminders → part-paid → paid), record payment, Chase |
| `/forecast` | Cash next 30/60/90 | Line chart (expected) + band (on-time ↔ late), bill markers, red zone under buffer, assumptions panel, what-if |
| `/bills` | Outgoing money | Recurring bills, add/edit, opening balance, buffer |
| `/pricing` | Business case | Plans, ROI line, who pays, why switch from notebook |
| `/settings` | Demo controls | UPI id, business name, Reset demo data, Export CSV |

## 6. Domain logic (pure functions in `src/lib/`, fully unit-tested)
- **Reliability** per family from last 6 months: on-time %, average delay
  days. Badge: Reliable (avg delay ≤3), Usually late (≤15), Risky (>15).
- **Expected pay date** of an open invoice = due date + family avg delay.
- **Forecast** (daily, 90 days): opening balance + expected inflows −
  bills on their days. Three series:
  - optimistic: everyone pays on due date;
  - expected: due + family avg delay;
  - pessimistic: due + avg delay + 15 days, Risky families never pay.
- **Alert** when expected balance < buffer (default ₹5,000) before a bill,
  or a bill is not covered. Alert text always names an action.
- **Chase priority** = amount × days overdue × (1 + risk weight), minus
  reminders sent in last 3 days. Ties → older invoice first.
- **What-if scenarios** (apply on top of expected, never mutate data):
  - one chosen family pays N days late (default 15);
  - top 5 families by amount pay 15 days late;
  - lose K students from next month;
  - raise fees by X%.
- **Quick-add parser**: "Rohan paid 1500 cash", "Ananya 2000 upi
  yesterday", "rent paid". Deterministic regex parser first; AI only
  if regex fails. Always show a confirm chip before saving.
- Money is integer rupees. Dates via date-fns, timezone Asia/Kolkata.

## 7. AI (Gemini via server route; app MUST work with no key)
| Endpoint | Input | Output | Fallback without key |
|---|---|---|---|
| `POST /api/ai/reminder` | family, child, amount, days late, reminders sent, tone, language | ≤ 400 chars, polite, includes amount + UPI link | Template per tone × language |
| `POST /api/ai/parse` | one line of text | `{type, student, amount, method, date}` JSON | regex parser result or "couldn't read" |
| `POST /api/ai/explain` | forecast summary numbers | 2-sentence plain explanation + one action | Template sentence |
- Tones: Gentle / Firm / Final. Languages: English / Hinglish / Hindi.
- Validate all AI JSON with zod; never trust it blindly.
- Never send real personal data; data is synthetic.

## 8. Seed data (synthetic, relative to today)
- Business "Priya's Maths Classes", opening balance ₹18,000, buffer ₹5,000.
- 32 students, 28 families (some siblings), 4 batches.
- 6 months of invoice + payment history giving a mix: ~60% reliable,
  ~30% usually late, ~10% risky. Current month: 8–10 overdue.
- Phone numbers fake, format +91 90000 0XXXX. UPI id `priya.tutor@upi`.
- Must produce a "bad day": rent due in ≤10 days and expected balance
  dips under buffer unless 3+ families pay.
- "Reset demo data" restores this exact seed (deterministic, seeded RNG).
- The seed takes `today` as input and GUARANTEES the demo conditions
  for any date. Tests pass a fixed date. UI copy derives every
  "N days" from the same `today`; never hard-code "9 days".

## 9. Storage
- `src/lib/store/` repository interface; implementation = localStorage.
- Versioned schema key `baaki:v1`. Corrupt data → reset to seed, no crash.

## 10. Business model (/pricing)
| Plan | Price | For |
|---|---|---|
| Free | ₹0 | Up to 10 students, manual reminders |
| Pro | ₹299/month | Unlimited students, AI reminders, forecast, what-if |
| Centre | ₹799/month | Coaching centres, 3 staff logins, batch reports |
- ROI line: one recovered ₹1,500 fee pays for 5 months of Pro.
- Go-to-market: tutor WhatsApp/Telegram groups, coaching associations,
  referral = 1 free month. Expansion: salons, freelancers, clinics (same
  engine, new presets).
- Pricing, ROI and any market number are labelled "proposed" or
  "assumption". Never claim customers, validation or results we lack.
- Why she switches from the notebook: it answers "who owes me" and
  "will I make rent" in 5 seconds, and drafts the awkward message.

## 11. Non-goals (do NOT build)
Real payment collection, WhatsApp Business API, login/multi-user sync,
GST invoices, SMS, native app.

## 12. Demo script (2 minutes, video + live)
1. Today: "Rent due in 9 days, not covered." 5 families late. (bad day)
2. Tap top chase → Hinglish Firm reminder → WhatsApp opens. (AI)
3. Quick-add "Rohan paid 1500 upi" → confirm → owed drops. (low effort)
4. Forecast: drag what-if "top 5 pay 15 days late" → line goes red,
   alert "Chase 2 more families or move printing to the 25th".
5. Pricing: ₹299/mo, one recovered fee pays 5 months.

## 13. Definition of done (whole product)
- The demo path (codebenders.md) and demo script (§12) work end to end
  on the deployed URL, after a refresh, and after "Reset demo data".
- Every screen reachable; every visible control works or is visibly
  disabled with a reason. No console errors.
- `npm run check` green (lint, typecheck, tests). `npm run build` green.
- Works on 360px phone width and desktop. Keyboard + screen-reader basics.
- Deployed on Vercel; live link works in incognito with no key AND with key.
