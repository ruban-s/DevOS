# The 8 Lenses of Iterative Depth

Eight viewpoints, each forcing the problem into a different light. Ordered concrete-to-abstract and common-to-specialized: short runs that reach for the early lenses cover the most broadly useful ground first — but the ordering is a suggestion, not a protocol. Take whatever the problem demands, in any order.

---

## Lens 1: LITERAL (Surface Requirements)
**Ask:** "What did they literally say? Which concrete, stated requirements are on the table?"
**Roots:** Requirements elicitation fundamentals
**Attention on:** The exact wording. Every stated requirement, constraint, and preference — extracted, not interpreted.
**Yields:** ISC criteria for each explicitly stated requirement.
**Try asking:** "List every concrete, testable requirement explicitly stated in this request. Do not infer — only extract."

---

## Lens 2: STAKEHOLDER (Who Else Cares?)
**Ask:** "Which people, systems, and entities does this touch? What does each of them need?"
**Roots:** Viewpoint-Oriented RE (Finkelstein & Nuseibeh), Triangulation (Denzin)
**Attention on:** Everyone past the requester — end users, maintainers, administrators, downstream systems, future developers. The requirements each of them would add unasked.
**Yields:** ISC criteria for unstated stakeholder needs.
**Try asking:** "Identify every stakeholder affected by this work. For each, what requirement would THEY add that the requester didn't mention?"

---

## Lens 3: FAILURE (What Goes Wrong?)
**Ask:** "How does this break? What would an adversary reach for? Where are the edges?"
**Roots:** Misuse Cases (Sindre & Opdahl), Pre-Mortem (Klein), STRIDE Threat Modeling
**Attention on:** The shipped solution, assumed into existence, then attacked. Error states, race conditions, security holes, data corruption, user confusion, behavior under load — every failure avenue.
**Yields:** Anti-criteria (what must NOT happen) plus defensive criteria.
**Try asking:** "This solution ships tomorrow. List every way it fails in the first week. Be adversarial."

---

## Lens 4: TEMPORAL (Past, Present, Future)
**Ask:** "How does this move through time? What history produced it? What breaks it in 6 months?"
**Roots:** Causal Layered Analysis (Inayatullah), Progressive Elaboration (PMBOK)
**Attention on:** Why the problem exists now, what was already tried, what future shifts could invalidate the solution. Migration paths, backwards compatibility, scale drift.
**Yields:** ISC criteria for durability, migration, and future-proofing.
**Try asking:** "What context created this request? What will change in 3-12 months that could invalidate this solution?"

---

## Lens 5: EXPERIENTIAL (How Should It Feel?)
**Ask:** "At its best, how does using this FEEL? What marks the experience?"
**Roots:** Appreciative Inquiry (Cooperrider), de Bono Red Hat (emotions)
**Attention on:** Everything past functional correctness — speed, elegance, surprise, delight, confidence, trust. The distance between "works" and "works beautifully."
**Yields:** Quality-of-experience criteria that lift functional to euphoric.
**Try asking:** "Describe the perfect user experience of this solution. What makes someone say 'this is exactly what I wanted' vs. 'this technically works'?"

---

## Lens 6: CONSTRAINT INVERSION (What If?)
**Ask:** "What if the constraints vanished? What if brutal new ones appeared?"
**Roots:** TRIZ (Altshuller), Lateral Thinking (de Bono), Reframing (Dorst)
**Attention on:** Both directions at once — strip the assumed constraints and imagine building with unbounded time and resources, then impose extreme ones (offline-only, 100ms, zero dependencies). Each direction exposes hidden assumptions.
**Yields:** ISC criteria that interrogate assumptions and isolate the truly essential.
**Try asking:** "What constraints are we assuming that weren't stated? Remove them — what changes? Now impose extreme constraints — what's truly essential?"

---

## Lens 7: ANALOGICAL (What Patterns Apply?)
**Ask:** "Where has something like this been solved before? Which patterns from other domains transfer?"
**Roots:** Cognitive Flexibility Theory (Spiro), Cross-Domain Transfer
**Attention on:** The problem's non-uniqueness. Cousin problems in other codebases, industries, and fields — the patterns that worked there, the mistakes already paid for.
**Yields:** ISC criteria inherited from proven patterns and analogous lessons.
**Try asking:** "What are 3-5 analogous problems in other domains? What solutions worked there? What criteria would those solutions imply here?"

---

## Lens 8: META (Is This the Right Question?)
**Ask:** "Is the framing itself sound? Are we solving the right problem at all?"
**Roots:** Hermeneutic Circle (Gadamer), Double-Loop Learning (Argyris), Soft Systems Methodology (Checkland)
**Attention on:** Outside the problem entirely. Whether the request symptoms a deeper issue, whether a reframing dissolves the problem rather than solving it, whether a better question outranks the asked one.
**Yields:** ISC criteria that reframe or widen the problem definition itself.
**Try asking:** "Forget the specific request. What is the UNDERLYING need? Is there a reframing that produces a better outcome than what was asked for?"

---

Draw freely from this catalog. Concrete-to-abstract, common-to-specialized ordering means short runs grabbing the early lenses bank the most universally useful criteria — but the problem, not the list order, picks the lenses.
