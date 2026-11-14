# Judge walkthrough

## Links

- Product: https://paycheck-runway.onrender.com/
- Source: https://github.com/wwezzy/paycheck-runway

No signup is needed. Use fictional information throughout the demonstration. The free hosting tier may need a short cold start.

## Core demonstration

1. Start with **Try an example**, not the introductory illustration. It loads fictional inputs into the actual calculation engine. Explain the opening balance, expenses and expected payday.
2. Read **Lowest balance** and **First day below $0**. Open **See dates and balances** and compare those dates with **Your scheduled items**. This is the clearest way to explain the result without relying on the chart. The introductory illustration is separate from the user’s calculated forecast.
3. Choose one expected paycheck in the delay selector and move it a few days. Compare the baseline and delayed lowest balances. Only that occurrence moves; later recurring paydays stay put. The default “all income” choice is a different scenario. Explain that neither changes the saved plan or makes an actual payment instruction.
4. Add a fictional expense, remove it, and reload to show browser-local persistence. Do not clear an existing plan without the owner's intention.

## Optional AI demonstration

Use the checkbox only with fictional input. Type a short example with explicit dates and amounts; voice capture depends on browser permissions and support.

Example: `Rent is 800 dollars on November 20, 2026. Insurance is 150 dollars, sorry, I mean 650 dollars, on November 22, 2026.`

Expected product behavior: editable proposed transactions, corrected insurance amount, nothing committed until user confirmation. Model outputs may vary; check them rather than claiming deterministic language understanding. If an amount or date is missing, resolve it explicitly. Removing or discarding a draft must not change the confirmed plan.

If quota or speech support is unavailable, switch to typed/manual input and state the limitation. Do not imitate a successful AI response.

## Claims we can and cannot make

- We have a public working web prototype and actual date-based calculation, not a slide-only mockup.
- AI assists data entry; it does not decide whether a person can afford something or make financial decisions.
- Free AI is a fictional-data demonstration, not a production service for sensitive personal finance records.
- Intended customer: US adults aged 25–45 with changing pay dates/income. Product-market fit and willingness to pay remain hypotheses.
- Forecasting and what-if scenarios have competitors. Do not claim those capabilities were invented here.
- Do not invent interviews, users, sales, revenue, savings, awards or customer quotes.

## Submission handoff

The competition brief requires all three items: PDF pitch deck of at most 10 slides, a working product URL usable without signup, and a public GitHub repository. The captain submits. The brief's deadline is November 15, 2026 at 12:00 Astana time. Pitch format: 5 minutes plus 2 minutes of questions.

Before submission, verify the organizer's latest answers/rules, the final deployed revision, incognito access, the PDF's page count and the public source link. Ask the organizer about any unresolved requirement rather than treating a hypothesis as permission. Do not confuse publishing the demo with submitting the competition entry.

Original brief: [Business Cup 2.0 — The Case](https://www.canva.com/design/DAHa0haVbpw/6GF64XaZTkomHXIUkrxSjw/watch). The brief is not evidence that all of our criteria are met; check the implemented revision and accompanying presentation.
