# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Privacy-conscious people who want to shorten a link without creating an account, without a backend, and without third-party tracking. They paste a URL and expect a shorter link back immediately, with nothing stored anywhere but the link itself.

## Product Purpose

Shortedd turns a long URL into a short, shareable one instantly, entirely client-side. Success is: paste a URL, get a working shortened link back with no wait, no sign-up, and no data collection.

## Positioning

Unlike a managed link shortener, Shortedd has no server or database: the destination is encoded directly inside the generated link and decoded in the visitor's browser on redirect. That architecture is the product's claim, and it is why the following are permanent, not missing features:

- No custom aliases, no editable links.
- Links never expire and cannot be revoked (there is no backend to revoke them from).
- No click analytics or statistics of any kind.

## Operating Context

Single-page web app, no accounts, no login. A visitor arrives, pastes or types a URL into one field, and receives the shortened link on the same screen with no page navigation.

## Capabilities and Constraints

- Client-side codec (`src/codec/v1`) encodes the destination URL into a compact token embedded in the generated link; no server round trip.
- Tracking parameters (`utm_*`, `fbclid`, `gclid`, etc.) are stripped automatically whenever a link is generated.
- QR code generation is being removed from the product entirely as part of this round of work: no QR preview, options, or SVG/PNG export going forward. Link shortening is the only function.
- The top navigation bar is being removed as part of this round of work. The theme toggle (light/dark) and the "Cómo funciona" (how it works) explainer dialog are being removed along with it — confirmed by the user, not preserved elsewhere.
- The generated result must feel instantaneous and simple on screen, not staged behind a distinctly separate panel/card — confirmed by the user for this redesign.

## Brand Commitments

Product name: "Shortedd". No other binding identity, logo, or voice commitments are on record.

## Evidence on Hand

None. No testimonials, benchmarks, or case studies exist and none should be invented.

## Product Principles

1. Privacy by architecture, not by policy — there is no server or database to trust, because the destination never leaves the link itself.
2. Zero friction — paste a URL, get a link back immediately, no accounts, no setup, no waiting.
3. Minimalism is load-bearing — every control removed is one less thing undermining the "nothing is stored" claim.
4. The result is part of the same instant, not a separate step — it should appear on screen as an immediate consequence of the input, not behind extra UI ceremony.
