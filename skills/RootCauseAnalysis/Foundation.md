# RootCauseAnalysis — Background Shelf

Load when a motion needs more depth than its own page carries. What follows re-tells the canonical methods in this skill's voice.

## Asking Why Repeatedly

**Roots.** Sakichi Toyoda practiced it on the shop floor in the 1930s; Taiichi Ohno wove it into the Toyota Production System as "the basis of Toyota's scientific approach — by repeating why five times, the nature of the problem as well as its solution becomes clear" (*Toyota Production System: Beyond Large-Scale Production*, 1988).

**Footnote worth keeping:** the drill first served to test *why a proposed feature was needed* — not as a formal failure method — which critics cite when grading its limits.

**Where it frays:**

- **Halting on a person.** "Operator slip" never terminates inquiry — it flags a setup that permitted the slip. When the chain ends at a human, ask once more.
- **Pretending branches don't exist.** Reality forks; each "why" may own several true answers. A strictly straight chain discards parallel contributors.
- **Leaping tiers.** Restless inquiries vault from symptom to distant verdict, skipping the mechanism between. Each why must answer its parent directly.
- **Hitting the knowledge wall.** The drill cannot outrun the investigator's grasp — different rooms produce different chains for one break, which is why repeatability stays weak.
- **Stopping shallow.** Teruyuki Minoura, once Toyota's global-purchasing chief, dismissed the drill as "too basic" for structurally deep trouble.

**Mirror drill — Five Hows.** Once the cause lands, ask "how do we block this?" five times, so the remedy runs as deep as the diagnosis.

## Mapping Causes by Family

**Roots.** Kaoru Ishikawa drew the first cause-and-effect skeleton at Kawasaki Steel in 1943, showed it formally in 1945, and canonized it in *Guide to Quality Control* (1968) among the seven basic quality instruments.

**Family sets (bend to context — Ishikawa insisted):**

- **6 M's (build contexts):** Manpower, Machine, Method, Material, Measurement, Mother Nature
- **4 P's (service contexts):** People, Process, Policies, Procedures
- **8 M's (wide build):** 6 M's plus Management, Maintenance
- **8 P's (commercial):** Product, Price, Place, Promotion, People, Process, Physical Evidence, Partners

**Stock trio:** Fishbone for span, Pareto for ordering, 5 Whys for depth on the vital few.

## Ordering by Frequency

**Roots.** Vilfredo Pareto's 1896 land-ownership observation; Joseph Juran carried it into quality work in the 1940s as "vital few and trivial many."

**Limit to respect.** Pareto tells you *which* causes deserve attention — never *why* they exist. It orders; it does not investigate. Always trail it with a depth motion.

## Deducing From the Top Event

**Roots.** Bell Laboratories, 1961, H.A. Watson, for the Minuteman program. Later fixed in IEC 61025, NRC NUREG-0492, SAE ARP4761. Home turf: aerospace, nuclear, chemical, pharma.

**Shape.** Deductive, top-down. Name the unwanted crown event; split it through logic gates (AND / OR / Priority-AND / Inhibit) into contributors; halt at base events carrying known or estimable odds.

**Core instrument — smallest break sets.** The minimal event groups whose joint arrival fires the crown. Many single-member sets mean fragility. All sets of size 3+ mean layered defense holds.

**Independence warning.** Gate math presumes base events vary independently. Reality correlates them (shared deploys, shared power, shared root). Where one root feeds two inputs, the AND is far likelier than the product suggests. Name shared-mode suspects explicitly.

## Charting With Evidence at Every Node

**Roots.** Dean Gano, after working Three Mile Island analysis in the late 1970s. *Apollo Root Cause Analysis* (1999; 3rd ed. 2007). RealityCharting software carries the method.

** creed.** Breaks own no single cause — causes run as an unbounded web. The analyst charts enough of the web to support real remedies AND halts where remedies stay actionable.

**How it differs from bare 5 Whys:**
- Evidence per node — sensed proof (seen, measured, logged) required; unevidenced nodes stay hypotheses, never findings.
- "What caused this?" phrasing over "why?" — yields mechanisms instead of culprits.
- Branching drawn openly instead of forced into one line.

## Screening Failure Modes Early

**Roots.** MIL-P-1629 (1949). NASA (1960s), auto industry (AIAG manuals), IEC 60812. Current auto canon: AIAG/VDA Handbook, 1st ed. 2019.

**RCA relationship.** FMEA runs **before** the break — surfacing and taming candidate modes up front. RCA runs **after**. FMEA outputs feed RCA prevention lists; RCA outputs reveal modes FMEA should have caught.

**Score math:** Risk Priority Number = Severity × Occurrence × Detection (each 1–10).

**Score warning:** RPN multiplies three ordinal scales — the product is not a ratio measure. The 2019 AIAG/VDA bookkeeping demoted RPN for AP (Action Priority H/M/L), weighting severity above flat multiplication.

**Two cuts:**
- **Design FMEA:** the drawing board; design engineers; during design
- **Process FMEA:** the line or runbook; process engineers

## Contrasting Where It Hurts Against Where It Doesn't

**Roots.** Charles Kepner and Benjamin Tregoe, *The Rational Manager* (1965; refreshed 1981). Built from watching how effective managers actually crack problems versus how they describe cracking them.

**Creed.** Every trouble is a drift off expected performance, and every drift arrived via some *change*. The IS / IS-NOT grid exposes that change by pinning exactly where and when the drift lives — and where it refuses to appear.

**The kill test.** A surviving cause must account for *every* IS row and stay compatible with *every* IS-NOT row. Whatever cannot explain both sides dies. That double-sided bar is the method's heart.

## Layered Defenses With Holes

**Roots.** James T. Reason, Manchester. *Human Error* (1990); *Managing the Risks of Organizational Accidents* (1997). Carried into aviation, care (IOM *To Err Is Human*, 2000), nuclear.

**Picture.** Every setup stacks defensive sheets — procedure, training, automation, watchers, supervision, physical stops. Each sheet carries holes. Normally holes misalign and someone catches the slip. Breaks arrive when holes line up across sheets at once.

**Two failure kinds:**

- **Sharp-end slips:** front-line acts — slips, violations, misreads. Triggered the break. Visible immediately.
- **Quiet weaknesses:** designer-, manager-, maintainer-built frailty — thin training, hostile interfaces, schedule pressure outranking safety, skeleton crews, foggy procedures. Predate the break by years. Invisible until activation.

**Reframe for RCA.** Old habit asks "who slipped?" The layered picture asks "why did every sheet miss the slip?" Blame migrates from the hands at the controls to the conditions built around them.

Reason: "Unlike active failures whose effects are felt almost immediately, latent conditions may lie dormant within the system for many years before they combine with active failures and local triggers to create an accident opportunity."

**Repair moral.** Patching one sheet fails when the setup leans on that sheet alone. Durable work thickens sheets or adds new ones — and the longest-lived wins address the quiet weaknesses that waited years for their trigger.

## Reviewing Without Blame

**Canon.** *Site Reliability Engineering* (2016), ch. 15; SRE Workbook (2018), ch. 10; Etsy's facilitation guide (John Allspaw, 2016) via Sidney Dekker's *Field Guide to Understanding Human Error* (2006).

**Blameless defined (SRE).** A written break record — impact, response moves, causes, follow-ups — assembled **without charging any person with misbehavior.** Learning is the product; accountability theater is excluded.

**Why blameless pays.** Fear throttles reporting, buries context, and warps analysis. Safety to speak plainly is what lets the full causal picture surface, including the responder's own reasoning under thin information.

**Hindsight trap.** Knowing the ending makes the break look foreseeable. Inquirers silently rebuild the decision run as if the outcome glowed in advance. Antidote: rebuild the timeline *forward* from before the break, never backward from the crater. Dekker's "sharp end" — stand where on-call stood, with what they knew, wanting what they wanted.

**Etsy line.** "Once you welcome people into the room and set expectations about the mindset they should be in (blameless) and the outcome (learning), there's really only one thing to focus on: discovering the story behind the story."

## Inquiry Rot, Catalogued

**Halting at the trigger.** The classic stall. Triggers are immediate; sources are systemic. When the remedy reads "be more careful," the trigger posed as the source.

**Locking early.** Crews pick a theory inside the first hour, then harvest supporting exhibits. Antidote: bank evidence before ranking theories; seat one dissenter against the lead.

**Demanding a singleton.** Tangled setups break through conjunctions — no lone cause suffices. Speak "contributors." (Will Gallego's 2018 "Root Cause is a Fallacy" makes the software case.)

**Marrying coincidence.** A and B co-occurred, therefore A caused B. Coincidence nominates; mechanism confirms. Insist on the mechanism.

**Charging the human.** "Skipped the runbook" shuts the books early. Correct follow-up: why did the setup make skipping possible, easy, or invisible?

**Feeble remedies.** Training decks and reminder mail sit at the bottom of remedy strength — they lean on memory under load, the exact faculty that just failed.

## The Fixability Bar

A cause earns the title operationally: **the deepest node in the chain where a shippable change blocks return.** Two misses:

**Too shallow.** "The deploy died" — nothing to hold. Descend until a condition under your control appears.

**Too deep.** "People err" — true, unshippable at org scale. Climb one rung.

**Working test.** Per candidate cause, ask: "Can I name one concrete, shippable intervention on this cause inside our authority?" Yes marks the actionable root. No means keep hunting.

## Breaks in Software Shops

**SRE habit.** Google SRE counts contributors — plural — never a lone root. Tangled distributed setups fail through *conjunctions*.

**Cross-service reality.** Cause and effect straddle service walls. Tracing needs correlated logs (trace IDs, structured lines), distributed traces (Jaeger, Zipkin, OpenTelemetry), and clock discipline (NTP skew genuinely confounds timelines).

**Four-bucket framing.** Current postmortem sheets list: (1) trigger, (2) contributors, (3) detection miss (why so late to know?), (4) response drag (why so slow to heal?). Each bucket owns separate remedies.

**5 Whys under microservices.** Single-thread depth-first walking snaps across service walls. Evidence-per-node branching (Apollo/RealityCharting style) fits better than bare 5 Whys.

**Observability preconditions.** Unobservable setups yield uninquisitive RCAs. Structured logs, traces, sufficient-cardinality metrics, correlation IDs are entry tickets — and when a break proves undiagnosable for want of them, the first remedy is instrumentation so the next same-shaped break reads clearly.

## Shelf Marks

- Ohno, Taiichi. *Toyota Production System: Beyond Large-Scale Production*. Productivity Press, 1988.
- Ishikawa, Kaoru. *Guide to Quality Control*. JUSE Press, 1968.
- Kepner, Charles H. and Benjamin B. Tregoe. *The New Rational Manager*. Princeton Research Press, 1981.
- Reason, James T. *Human Error*. Cambridge University Press, 1990.
- Reason, James T. *Managing the Risks of Organizational Accidents*. Ashgate, 1997.
- Gano, Dean L. *Apollo Root Cause Analysis*. 3rd ed. Apollonian Publications, 2007.
- Beyer, Betsy, et al. *Site Reliability Engineering*. O'Reilly, 2016. Chapter 15.
- Allspaw, John. "Debriefing Facilitation Guide." Etsy, 2016.
- Dekker, Sidney. *The Field Guide to Understanding Human Error*. 3rd ed. Ashgate, 2014.
- Juran, Joseph M. *Juran on Quality by Design*. Free Press, 1992.
- Watson, H.A. "Launch Control Safety Study." Bell Labs / U.S. Air Force, 1961.
- IEC 61025: Fault Tree Analysis. IEC, 2006.
- AIAG/VDA FMEA Handbook. 1st ed. 2019.
- Gallego, Will. "No, Seriously. Root Cause is a Fallacy." 2018.
