# Paycheck Runway — local hackathon prototype

A browser-first cashflow planner. No bank connection and no login. **Not a financial audit/advisor.**

## Run
Requires Node 22+ (tested Node 24).

```sh
npm test
npm start
```
Open http://127.0.0.1:3000. No dependencies to install.

## Implemented
- Manual USD transactions, dates and balance; browser-local persistence.
- Fictional sample with an actual shortfall, computed in integer cents.
- 30-day end-of-day forecast and 0–14-day income-delay scenario.
- Draft-confirmation flow for AI extraction; never silently commits model output.
- Explicit start/stop browser SpeechRecognition with 60-second cap and typed fallback.
- Server-only Gemini REST adapter, response validation, timeout, limited input and simple per-IP rate limit.
- API errors shown honestly; no fake AI responses.

## AI setup still required
No live Gemini call has been made. User must select/approve their own eligible Gemini free-tier model and securely configure `GEMINI_API_KEY` and `GEMINI_MODEL` in the server environment. `.env.example` contains no secrets; never put a key in frontend code or Git. Do not enable billing or assume a model remains free. Check https://ai.google.dev/gemini-api/docs/pricing and quota before deployment.

**This free-tier AI demonstration accepts fictional data only.** Google unpaid-service terms restrict sensitive, confidential and personal information: https://ai.google.dev/gemini-api/terms . The checkbox is disclosure, not a substitute for production privacy controls. Do not deploy this as a real-person financial-data service without an appropriate provider arrangement and security/privacy review.

SpeechRecognition is browser-dependent and may send audio to the browser provider. This is disclosed before microphone use. Manual input remains available. Voice has not been tested with a live microphone.

## Calculation assumptions
Only dates within the displayed window are applied. Starting balance represents the balance at the start of the selected date. Past entries are not reapplied. End-of-day totals do not model intraday ordering. Recurrence, bank sync, automatic transfers, debts/interest, authentication, payments, tax/investment advice, production abuse protection and server storage are out of scope. Income is an expectation, not a guarantee.

## Verification
Five unit tests passed: shortfall, delayed income, cent arithmetic, date boundary and malformed parsed data. HTTP smoke and syntax checks performed. Browser appearance/live voice/live AI not yet verified.

## Before publication
This is local-only. Configure secure server secrets, production binding/proxy, HTTPS, provider cost limits, durable abuse protection, privacy disclosures and appropriate financial data handling. Do not promise production-ready security. Public repository must exclude all secrets. Prototype has no payment collection.
