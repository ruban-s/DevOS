---
version: 0.2.0
---

# Verification — the single statement

> **This file is the ONE home of the verification rules.** The constitution keeps the core resident (self-check, the Interceptor mandate, the "should work" ban, confidence-requires-source) and points here; the Loop's prove-rules bind these into runs; nothing else restates them. Load when verifying web/UI output, when a claim is about appearance, when deleting or replacing live infra, when verifying anything that must expire or propagate, or when the verifier is unavailable. Enforced by `hooks/VerificationGate.hook.ts` (T1/T2) + `hooks/AlgorithmNudge.hook.ts` (destructive row) + `hooks/ISAGate.hook.ts` (structural close). Upstream lineage: LifeOS verification doctrine — restated and restructured for DevOS 0.2.

Browser-verify all web output through the **Interceptor skill** BEFORE showing the principal. Interceptor is the ONLY sanctioned browser automation in DevOS — real Chrome, no CDP detection, real login sessions, accurate rendering. Playwright is BANNED — if tempted, fix Interceptor instead. "curl returns 200" is not verification. Every time you create, fix, deploy, or claim anything works on the web — verify with Interceptor. No exceptions.

## I. The probe must meet the claim on its own ground

**V1 — Same path or it didn't happen.** A Web/UI claim closes only on a real browser navigation to the actual URL, through Interceptor. A `curl`, a DOM read of a *different* page, or a check of a sibling path is a different request and proves nothing about what the browser renders where the user looks — curl and a real browser can literally receive different pages.

**V2 — Span the quantified set.** When a claim ranges over a container (a site, a corpus, a fleet, a dataset), the container passing is not evidence for its members. The probe set touches every member TYPE the user consumes, one rendered/executed instance each, with a deterministic gate sweeping the rest where one exists. Shell pages and bare HTTP 200s verify nothing on an SPA. **Viewport is a member type** — shipped UI verifies at mobile width (≤480px) as well as desktop, or the claim says "desktop-verified only" out loud.

**V3 — Arrive when the failure can exist.** For cache-mediated surfaces (DNS, certificates, CDN caches, negative caches), a T+0 probe rides warm caches and proves nothing about steady state. DNS/cert/routing claims close on the provider's records API or the authoritative NS (`dig @<zone-ns>`), never solely on a request that succeeded through a resolver cache. Where only runtime probes exist, the claim holds `[DEFERRED-VERIFY]` until a T+TTL re-probe — with the watcher (background check, cron, monitor) named before the run closes.

## II. Partial evidence has exactly one legal move each

**V4 — No verifier means DEFER, never substitute.** Interceptor wedged or down? The web claim is NOT verified. Say "deployed, not browser-verified", mark `[DEFERRED-VERIFY]`, and do NOT claim live / works / shipped / locked-down. Fix Interceptor, wait, or hand the human-only step over — never relabel weaker evidence as verification.

**V5 — Pixels for appearance, existence for existence.** A DOM read proves an element EXISTS at coordinates; it proves NOTHING about how it looks. Any claim about *appearance* — renders, centered, transparent, right color, "looks right" — closes ONLY on a **non-degenerate pixel image you actually looked at** (Read the file; a black frame is not a look). **View every asset before wiring it in.** The capture pipeline refuses blank/near-uniform frames when ImageMagick is available (auto-escalating to a real-pixel capture); without the guard it fails OPEN with a loud warning plus a log line — never trust an unchecked frame. The close gate blocks appearance-success claims unless a pixel image was captured AND Read after the last frontend edit; a DOM read alone never passes.

**V6 — Name all three caches.** A cache can sit between probe and truth in three places, and each has produced a passing probe over a broken system:
- **Response path.** Liveness/health endpoints answer `no-store` (`Cache-Control` AND `CDN-Cache-Control`) — and that header is itself a probed claim. A cached 200 during an outage is exactly the failure the endpoint exists to catch.
- **Deploy path.** One post-deploy probe reads whichever edge copy answered. Verification converges or it doesn't count: repeat to N consecutive identical results (or wait on an explicit convergence signal); never report a fix on one probe.
- **Data path.** The app's own reads may be cached, so behavior depending on a value EXPIRING can't be verified from code alone. Make expiry structural — rotate the key or query so a new period reads a nonexistent key — instead of trusting a TTL on the read path.

Through-line: **a mock cannot reproduce a cache.** Unit tests over faked stores prove logic, never deployment. Expiry, freshness, and propagation claims close on live probes against the real edge, run to convergence.

## III. Changing things is held to a higher standard

**V7 — Reproduce before fixing.** For ANY reported UI/page bug, OPEN THE PAGE FIRST — before reading code, theorizing, or writing fixes. Check console errors, check network 404s, see the failure directly. Code analysis without reproduction is speculation, not debugging. Backend bugs reproduce against the running system before suspects are read.

**V8 — Parity on replace/delete, proven against a captured baseline.** Changing or deleting anything serving live traffic or producing a flowing metric requires: the flow's baseline captured BEFORE (rate over a stated window, function inventory); what the resource OWNS enumerated via the provider's authority API before the op — a dependent record "already existing" is NOT evidence it survives; managed records look identical to independent ones in listings and die with their owner; the authority re-listed AFTER — a runtime probe through a warm cache is not the authority; and post-change evidence the flow continues at baseline within tolerance. One synthetic event landing is an example claim and never closes parity — "flow continues at baseline rate" is the universal claim that catches the outage. A mitigation in Decisions prose is promoted to a falsifiable claim BEFORE the op — prose mitigations have no teeth. Metered pipelines hold `[DEFERRED-VERIFY]` until a delayed delta check vs baseline (T+≥1h, or T+TTL for cache-mediated surfaces, whichever is longer).

## Briefing a verifier — steps and evidence, never the expected result

A verification or audit brief carries the steps to execute and the evidence to return, never the answer it should find. A verifier told the pass rationalizes toward it instead of driving the actual path; withholding the expected result forces real evidence. That is why a fresh-context second look restates the goal and claims but never the build plan or the "should be" outcome.

## Enforcement summary

- `hooks/VerificationGate.hook.ts` (Stop) — T1 blocks done-claims with zero tool calls in evidence; T2 blocks page/UI/deploy claims with no browser, screenshot, curl, or test invocation. Grades transcript tool calls, never message wording, so rewording never passes.
- `hooks/AlgorithmNudge.hook.ts` destructive row (always-on) — any delete of worker/domain/zone/record/bucket/route fires the ownership + authority-re-list + baseline-flow ask.
- The Loop's prove-rules (D8 evidence, D16 parity) bind V1–V8 into every run.

Constitutional core (resident in the constitution, never restated here): never claim done without tool evidence; the pre-done self-check; confidence requires a source verified this session.
