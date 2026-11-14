# Paycheck Runway

**A payday stress test, not another spending dashboard.** A browser-first USD cash-flow planner for people whose income dates can change. See when scheduled bills could take the projected balance below zero, then test an income delay without changing the underlying plan.

- [Open the live demo](https://paycheck-runway.onrender.com/)
- [Judge walkthrough](docs/JUDGE_GUIDE.md)
- No account or bank connection is required.

> **Hackathon prototype, not a financial audit or financial adviser.** Forecasts depend entirely on the amounts and dates entered. Expected income is not guaranteed. The optional free-tier AI and voice demonstration is for **fictional data only**. Do not enter bank credentials, account numbers, private financial records or other personal/sensitive information.

## Try it in two minutes

1. Open the demo and choose **Try an example**. This uses clearly fictional transactions and real calculations, not a pre-recorded result. If a plan already exists, replacing it requires confirmation.
2. Inspect the projected low balance and the dated list of income and bills.
3. Change the delay scenario and compare the outcome. The scenario does not move real money or amend a bill with its provider.
4. Add or remove a fictional transaction and confirm that the result changes.
5. Optionally expand voice/text input, read the data notice and confirm fictional-only use. Try: `Rent is 800 dollars on November 20, 2026. Insurance is 150 dollars, sorry, I mean 650 dollars, on November 22, 2026.` Review every extracted item before adding it.

## What is implemented

- USD amounts calculated in integer cents, with a 30-day date-based forecast. New users must enter an opening balance (including an explicit zero) before a forecast is shown.
- Manual transaction entry, browser-local plan persistence, and explicit deletion.
- Once, weekly, every-two-week and monthly entries. Monthly schedules keep their original day-of-month anchor and clamp to the last day of shorter months (Jan 31 → Feb 28 → Mar 31 in a non-leap year). Every two weeks means 14 days, not twice a month.
- An income-delay scenario for all expected income or one selected payment occurrence. Delaying one occurrence does not move later recurring payments. Expenses remain unchanged; an income shifted beyond the 30-day window is excluded from that forecast. Baseline and delayed lowest balances are shown for comparison.
- Gemini-assisted extraction into **editable drafts**, not automatic financial actions. Missing or conflicting amounts/dates must be resolved before confirmation; unwanted drafts can be removed.
- Browser speech recognition with an explicit start/stop action, a 60-second recording cap and a typed-input fallback. Intermediate speech results replace earlier intermediate text rather than being appended repeatedly.
- Clear US-readable result dates such as `Nov 14, 2026`. Native calendar controls follow the device/browser locale; the selected date is also shown in words.
- Server-side provider credentials; the browser never receives the Gemini API key.

## Run locally

Use Node.js 22.9+ (development checks have used Node 24). There are no npm dependencies to install.

```sh
npm test
npm start
```

Open `http://127.0.0.1:3000`. Manual input and the fictional example work without an AI credential.

### Optional Gemini configuration

Copy `.env.example` to an ignored local `.env`, or use your hosting provider's secret/environment settings. Configure `GEMINI_API_KEY` and a model available to your account in `GEMINI_MODEL`. Never put a real credential in source files, browser code, screenshots or the public repository.

The hosted demonstration has been configured and tested with fictional inputs. Availability still depends on provider quota and uptime; `GET /api/status` reports configuration presence, **not** a guarantee that a subsequent model call will succeed. On errors or exhausted quota, use manual entry.

Check the current [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing), [rate limits](https://ai.google.dev/gemini-api/docs/rate-limits) and [terms](https://ai.google.dev/gemini-api/terms). A free model or quota today is not a promise of unlimited or permanently free service. No billing account is required for this demo's currently configured free tier.

## Data and privacy boundaries

- The manual plan is stored in this browser's `localStorage`, not in an application database. It does not sync between devices. Clearing site data, using a different browser or private mode can remove or isolate it; do not treat it as a backup service.
- Unreadable stored plans are protected from being silently overwritten. The UI reports storage failures; explicit Clear discards the stored plan.
- Clicking AI extraction sends the transcript and the selected reference date to this app's server and then Gemini. The free-tier notice is deliberate: do not use this path for actual personal financial information. A checkbox alone is not a production privacy/security control.
- Browser speech recognition may send audio to the browser's speech provider. Support differs by browser and device. Audio capture is not constantly running in the background.
- This prototype does not connect to banks, transfer funds, submit payments or contact bill providers.

## Calculation assumptions

The opening balance is the balance at the **start of the selected day**, before that day's listed transactions. Forecast values are **end-of-day** values and do not model intraday ordering. Include all relevant cash flows; omitted expenses or unrealized income can make the forecast misleading. Past one-off entries are not reapplied. Recurring entries need their first occurrence date; the app expands their dates through the forecast window. Monthly clamping is a calendar assumption, not confirmation of a creditor's or employer's actual policy. Amounts are USD only; currency conversion, interest, tax, investment returns and banking settlement rules are not modeled.

## Deployment

The public demo is on a free Render Node web service. A cold start may delay the first request after inactivity. Configure `HOST=0.0.0.0`; Render supplies `PORT`. Build command: `npm test`. Start command: `npm start`. Health endpoint: `/api/status`.

**This service currently uses manual deployment.** Pushing a commit to GitHub does not by itself prove the public site has updated. Deploy the intended latest commit through Render and verify the live revision and core flow afterward. Do not enable paid resources or billing merely to run the demo.

## Demo API safeguards

The anonymous AI endpoint has a shared, in-memory budget: 10 requests/minute, 400/day (UTC), and at most 2 concurrent requests. The upstream call times out after 20 seconds. Requests must be JSON; body size is capped at 8 KB and transcript text at 4,000 characters. Cross-site browser requests are rejected using Origin/fetch-metadata checks; requests without an Origin remain possible for non-browser clients. These are shared demo limits, not independent per-user quotas. Counters reset when the process restarts or redeploys and do not provide durable abuse prevention. Provider/project limits still apply and can be exhausted separately.

Before handling real financial information or launching a paid service, arrange appropriate provider data handling, a privacy/security review and durable controls. Do not describe this prototype as hardened production infrastructure.

## Verification and limitations

Run `npm test` against the exact revision you intend to publish. At the combined implementation revision checked for this documentation, 37 tests passed. Re-run them after further changes. Tests cover arithmetic, recurrence/date behavior, validation, speech-event reconciliation, browser storage recovery, provider diagnostic sanitization and serving the browser modules. Tests are not a guarantee of bug-free software.

Live checks have included manual input/removal, recalculation, persistence after reload and fictional Gemini extraction/review. Browser/device microphone permission, accuracy and compatibility still require testing on the devices used for the presentation. There is no claim of a complete Safari/Android/iOS/accessibility matrix, a security certification or production readiness.

No payment checkout, paid subscribers, measured retention, customer savings or willingness-to-pay validation is claimed. Similar products already offer forecasting and scenarios; our intended focus is a quick, understandable payday stress test. This distinction is a product hypothesis, not proof of uniqueness.
