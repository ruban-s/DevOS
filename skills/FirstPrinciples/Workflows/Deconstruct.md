# Deconstruct Workflow

**Purpose**: Reduce any problem, system, or concept to its constituent parts and the truths underneath them that can't be reduced further.

---

**When to Use**:
- Opening any first-principles analysis
- When a problem reads as intractable
- When a cost or complexity presents itself as fixed
- When the inherited solution feels wrong in a way you can't yet name

---

## What Counts as Done

Keep splitting the subject until the pieces stop splitting, then draw a clean line between what's bedrock and what's inheritance. A finished deconstruction must:

- Begin with the **received account** (what the market or the industry claims the thing is made of) and drive each claimed component down into its **true constituents** — physical inputs, the minimum viable form, the raw-material cost.
- Quarantine the **fundamental truths**: physical law, mathematical certainty, empirically verified fact, genuinely irreducible requirement. Best practice, tradition, quoted prices, and received wisdom are disqualified from this list.
- **Measure the gap** between the received cost or complexity and the bedrock cost — the gap is the opportunity.

The move people miss: **a market price is not a fundamental cost**. "Battery pack = $600/kWh" decomposes to roughly $80/kWh of commodity materials — about 87% of the price is assembly and margin, not physics.

---

## Output Template

```markdown
## Deconstruction: [Subject]

### What We're Told
[Common description of the subject]

### Stated Components
1. [Component 1]
2. [Component 2]
3. [Component 3]

### Actual Constituents
For each stated component, the fundamental parts:

**[Component 1]**:
- Actual parts: [list]
- Real cost/value: [amount]
- Insight: [what's different from stated]

**[Component 2]**:
- Actual parts: [list]
- Real cost/value: [amount]
- Insight: [what's different from stated]

### Fundamental Truths (Irreducible)
1. [Truth 1 - cannot be decomposed further]
2. [Truth 2 - physics/math/verified fact]
3. [Truth 3 - actual hard requirement]

### Key Gaps Identified
| Stated | Actual | Gap |
|--------|--------|-----|
| [X costs $Y] | [Materials cost $Z] | [$Y-Z is not fundamental] |

### Implications
- [What this means for our approach]
- [What becomes possible now]
```

---

## Example: Deconstructing "Rocket Launch Costs"

### What We're Told
"Launching a rocket to orbit costs $65 million because aerospace is expensive"

### Stated Components
1. Rocket vehicle
2. Fuel
3. Launch operations
4. Aerospace-grade engineering

### Actual Constituents

**Rocket Vehicle**:
- Actual parts: Aluminum alloys, titanium, copper, carbon fiber
- Real cost: ~2% of typical rocket price on commodity markets
- Insight: 98% of vehicle cost is not materials

**Fuel**:
- Actual parts: Liquid oxygen, RP-1 kerosene
- Real cost: ~$200,000 per launch
- Insight: Fuel is negligible in total cost

**Launch Operations**:
- Actual parts: Pad rental, personnel, range safety
- Real cost: Variable but not fundamentally $60M+
- Insight: Most "operations cost" is amortized development

**Aerospace-grade Engineering**:
- Actual need: Reliability, not gold-plating
- Real requirement: Physics of reaching orbit
- Insight: "Aerospace-grade" is often convention, not physics

### Fundamental Truths (Irreducible)
1. Must achieve ~9.4 km/s delta-v to reach orbit (physics)
2. Must survive aerodynamic and thermal loads (physics)
3. Must carry payload mass (requirement)
4. Propellant mass ratio governed by rocket equation (physics)

### Key Gaps Identified
| Stated | Actual | Gap |
|--------|--------|-----|
| Vehicle: $50M | Materials: $1M | $49M is not fundamental |
| "Rockets are expensive" | Physics doesn't require $65M | Convention, not constraint |

### Implications
- We can build rockets for dramatically less if we start from materials
- "Aerospace-grade" practices should be challenged individually
- Vertical integration recaptures the 98% margin
- **This insight created SpaceX**

---

## Integration Notes

After Deconstruct, typically flow to:
- **Challenge** → Question each constraint classification
- **Reconstruct** → Build optimal solution from fundamental truths

Other skills can invoke:
```
→ FirstPrinciples/Deconstruct on [security model / architecture / cost structure]
```
