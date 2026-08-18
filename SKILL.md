---
name: decision-board
description: >
  Decision Board — build the user an interactive decision board for any
  strategic decision that is really a chain of coupled choices: a go-to-market,
  a product roadmap, a market entry, a hiring plan, a pricing change. Interview
  the user to extract the chain and their scorecard, research every option with
  source-verified facts, score the trade-offs with the judgment in the open, and
  generate one self-contained HTML board they own.
  Worked example: https://keftek.com/lab/decision-board/
---

# Decision Board

You are going to build the user an interactive decision board. Not a report,
not a slide deck — a board they can play with, where every option carries
verified evidence, incompatible combinations lock and explain themselves, and
a scorecard shows what each path trades away. Competing paths can be saved
and compared side by side.

**What the user gets from you:** one HTML file, theirs to keep, share, and
argue with. It runs from their filesystem — no server, no account, no build
step. (The research you do along the way goes through whatever provider runs
you; only the finished board is purely local.)

## The method (read before doing)

Three established methods, layered:

1. **General Morphological Analysis** (Zwicky; formalised by Tom Ritchey) —
   decompose the decision into parameters (columns), enumerate the values each
   can take (cards), and study combinations instead of debating options one at
   a time.
2. **Cross-Consistency Assessment** — check option pairs for compatibility and
   lock the combinations that cannot coexist in reality, with the reason
   stated. This prunes a combinatorial space down to the paths worth scoring.
   Most bad strategies are not badly scored; they are internally contradictory.
3. **Multi-criteria scoring** — every card is scored on a small scorecard the
   user defines (4-6 dimensions, one of them risk-like and inverted), each
   score with a stated reason. A path's profile is the mean per dimension
   across its picks — deliberately never collapsed into one weighted number,
   because the single number hides exactly the trade-off the decision turns on.

One boundary keeps the tool credible: **no invented financials**. Do not add
revenue projections, close rates, or market-size math unless the user supplies
their own numbers and asks for them. A wrong number costs more credibility
than a missing one; the tool's job is to make the decision space visible and
the trade-offs explicit, not to forecast.

Two disciplines carry the tool's credibility. Hold both without exception:

- **Facts and judgment never mix.** Verified facts (with sources) sit in one
  layer; scores and multipliers (the model's judgment) sit in another, labeled
  as model estimates. The user can argue with the judgment; they should never
  have to doubt the facts.
- **Every fact is verified verbatim** (Phase 2 gate below). An unverifiable
  fact is dropped, never softened into "studies show".

## Phase 1 — Interview

Interview the user before building anything. One question at a time; push back
when answers are vague. You need:

1. **The decision.** One sentence: "choosing our go-to-market", "picking the
   first market to enter", "deciding the 2027 hiring plan". If the user gives
   you a goal ("grow revenue") rather than a decision, dig until you find the
   choice they actually control.
2. **The axes** — 5 to 8 columns. Each axis is one **variable** of the
   decision: something that can take several values, where picking one value
   does not settle the decision by itself.

   **Title grammar — a noun phrase naming the variable, 1 to 3 words.**
   `Heat source`, `Funding route`, `Route to market`. Never a question, never a
   sentence. The worked example's eight columns read *Buyer mindset · Buyer
   trigger · Customer segment · Industry · Geography · Decision-maker · Route
   to market · Entry wedge*. Match that register; a board whose columns mix
   nouns and questions reads as improvised, because it was.

   Three tests. An axis has to pass all three:
   - **It is not the decision restated.** The decision is fixed input from
     step 1 and never becomes a column. If one card in a column would settle
     the whole decision on its own, that card is not a value of a variable —
     it is a whole strategy, and whole strategies are `PLAYS` (Phase 3.4), not
     an axis. Columns titled "What we are deciding", "What we should do", or
     "What the meeting votes on" are all this failure, and they collapse the
     board: pick one card and every other column is already implied.
   - **Same unit.** Name the variable out loud, then check that every card is
     an answer to it in the same unit. If you cannot name a variable that all
     its cards are values of, the column is two columns, or none.
   - **Distinct.** If two axes could share a card, merge them. If one axis
     hides two variables, split it.

   **Order the columns so later ones depend on earlier ones** — the real
   dependency in the user's own domain, not a template borrowed from another.
   (In a building decision the envelope constrains the heat source, so the
   envelope comes first.) Where two axes have no dependency between them,
   their relative order does not matter; do not invent one.
3. **The options** — 3 to 8 cards per axis. Real options the user would
   consider, plus one or two they dismiss too quickly (the board should test
   beliefs, not confirm them). For each card capture the user's own read on it.

   **A card title is also a sentence fragment.** The board writes the chosen
   path as a sentence, and it takes each title *up to its first comma* and
   drops it into that axis's `say` slot (Phase 4). The text before the comma
   has to stand alone as a value: `Senior lead, then juniors` renders as
   "staffed as Senior lead", losing the half that mattered. Put the carrying
   words first and leave the comma for the qualifier — `Dimensional drift, at
   the gauge` gives "first model on Dimensional drift". Read every title
   inside its own fragment before you build.
4. **Single or multi-pick per axis** — most axes pick one; axes like
   "industry" or "route" may allow 2-3.
5. **The scorecard** — define it WITH the user, in their words: 4-6 dimensions
   every option will be judged on, each with a one-line definition. One
   dimension must be risk-like and inverted (higher is worse) — exactly one,
   because the scoreboard reads every other dimension as "more is better".
   When the user names two negative criteria, keep the one that is genuinely
   a risk and re-polarise the other into its positive form (disruption
   becomes "production calm", higher is quieter); dropping a criterion the
   user named is the worse answer. Defaults worth
   offering for a market decision: market, access, speed, margin, risk — but
   the user's own vocabulary beats a template. Test each dimension: would two
   options on the board score differently on it? If not, it cannot change the
   decision; cut it.
6. **Hard exclusions** — things ruled out regardless of score (sectors,
   channels, deal shapes). One sentence each, naming the constraint and the
   reason. They go in `EXCLUSIONS` and render above the board as standing
   constraints — never as cards, because a card can be picked.
7. **Locks** — for every pair of axes, ask: "is there a combination here that
   simply cannot work?" Write each as: which option locks, under what
   condition, and the one-sentence reason a stranger would accept. Locks are
   reserved for structural impossibilities ("committees do not exist below
   mid-market"). Anything probabilistic — "most X don't", "rarely", "usually
   not" — is a tension, never a lock; a hard exclusion built on a stereotype
   costs the tool its credibility with the first user who knows a
   counterexample.

   Most boards find two to four. Checking every pair is the discipline;
   finding a lock in every pair means you have started inventing them.
8. **Tensions** — combinations that are legal but uncomfortable. These warn,
   never lock.

## Phase 2 — Research

For every card, find 1-3 verifiable facts that inform its scores. The gate:

- Each fact carries: a one-line statement with the number in it (≤140 chars),
  a **verbatim quote** copied exactly from the source page, the source name,
  year, and URL. All of it ships in the output data — the quote is not a
  working note, it is the audit trail. A reader of the finished board must
  be able to click the source and find the quote.
- **Fetch the source and confirm the quote appears in the fetched content.**
  Match on the words and the numbers, ignoring punctuation and case — a page
  is free to re-typeset a dash or a curly quote, and stripping its markup
  leaves spaces where the tags were. Everything else must be the source's own
  wording: a quote stitched together from a heading and a sentence, or
  reworded to fit, fails this and should. Cannot fetch or cannot find the
  quote → drop the fact. Never reword a quote to make it match.
- Source tier, in order: (1) the original — the institution's own report,
  statistical release, or announcement; (2) established media with an
  editorial masthead reporting the original; (3) never content farms, SEO
  market-size mills, vendor marketing standing in for research, or aggregators.
  When a news article cites a report, chase the original first.
- Prefer data under 3 years old. Always show the year.
- A statement carries the number when the source gives one. Some facts that
  belong on a board are not numeric — a legal duty, a standard's requirement,
  a documented failure mode. Ship those as they are; never pad a number in to
  satisfy the shape of the line.
- **A card with no verifiable fact is allowed, and must be declared.** Ship it
  with an empty `facts` array and name in `#srcnote` which cards carry no
  evidence. What you must not do is re-plan the board around what happens to
  be easy to source: the axes come from the user's decision, not from the
  search results.
- Report the drop count to the user: "N facts verified, M dropped (and why)".
- Facts the user supplies from their own operation are legal and often the
  best data on the board — label them "Internal" and never dress them as
  external research.

## Phase 3 — Score

Build the scoring layer. Everything here is judgment — label it as model
estimate everywhere it appears, and keep it visibly separate from the
verified facts.

1. **Score every card** on the user's scorecard, 1-5, each score with a
   ≤6-word reason. The reason is not decoration: it is the handle the user
   grabs when they disagree, and disagreement card-by-card is the tool
   working as intended.
   A money-shaped dimension is legal and common — "two-year value", "cost
   fit". Score it as a ranking of the options against each other, never as an
   amount, and say so in `ASSUMPTIONS`: no currency figure appears anywhere on
   the board. A budget the user gives you is their number and may be stated;
   a number you derive from it is an invented financial.
2. **The path profile** — average within each axis first, then across the
   axes, so an axis where three cards are picked counts once rather than three
   times. Never collapse the dimensions into one weighted total.
   The profile names the strongest and weakest dimension in words, plus a
   plain reading of the risk level, and a short tag: "balanced", "high risk",
   or "trades X for Y".
3. **Locks, tensions, fragility** — wire in the Phase 1 locks (structural
   impossibilities, with the reason shown on click) and tensions (legal but
   uncomfortable, shown as warnings). Add `FRAGILE` checks for paths standing
   entirely on one leg. The board labels the last two differently, because
   they ask for different moves: a tension is a trade to accept knowingly, a
   fragility is a second leg to add.
4. **Presets** — 3-5 named plays (coherent full paths) so the first click
   shows the tool working. Each carries a one-line "why this play", shown
   as visible text when selected, never hover-only.
5. **Saved scenarios** — let the user snapshot a composed path and set it
   beside the others in a comparison table, one row per scenario, one column
   per dimension, with the best value per dimension marked. This is where a
   decision tool earns its keep: the question is rarely "is this path good"
   but "which of these three do we prefer, and what does each cost us".

## Phase 4 — Generate the HTML

**You do not design this board. You fill it in.**

The board's look is settled: the palette, the type scale, the card anatomy,
the drawer, the scoreboard, the locked-card treatment, the mobile collapse.
All of it lives in `board.template.html`, which ships beside this skill. Your
job is the data layer and nothing else.

**Get the template.** It ships beside this file — at `assets/board.template.html`
if you were given the repository, or as `board.template.html` in the same
folder if the files were downloaded together. Use that copy: it is the one
you were given, and it needs no network at all. Only if you were handed
`SKILL.md` on its own, fetch it once from the repository the skill comes
from:

    https://raw.githubusercontent.com/yuannc12/decision-board/main/assets/board.template.html

If you cannot obtain the template, stop and tell the user the board cannot be
built to spec, and ask them for the file. **Do not invent a visual design.**
A board that looks invented is worth less than no board: the whole promise is
that a Decision Board is recognisable as one.

**Fill exactly one region.** Between the `DATA` marker and the `ENGINE`
marker, replace the ten empty objects with yours. That region is the only
part of the file you write.

| Object | Holds |
|---|---|
| `SCORECARD` | the user's dimensions: `{k, label, short, desc, chip?, inverted?}` — exactly one `inverted`; `chip: true` puts a dimension on the card face (2-3 of them) |
| `DIMS` | the axes: `{id, title, say, name?, max, options:[...]}`. `title` is the noun phrase from Phase 1.2, numbered — `"1 · Heat source"`. `say` is this axis's fragment of the path sentence with a `{}` slot — `"paid through {}"`. `name: true` on the one or two axes that should name a saved scenario |
| ↳ `options` | `{id, title, read, sc:{<k per SCORECARD>}, facts:[{t, q, s}]}` — `sc` values are `[score, "why"]`; `t` is the statement, `q` the verbatim quote (the audit trail), `s` keys into `SRC` |
| `SRC` | `{key: {n: "Source name, year", u: "url"}}` — every source renders as a link, never a bare name |
| `DETAIL` | per card: `{play, gain, give, works}` — the motion, the trade, the condition |
| `LOCKS` | `{opt, test(sel) -> reason string or false}` — structural impossibilities only |
| ↳ `sel` | the live selection, `{axisId: [optionId, ...]}` — an axis with nothing picked is **absent**, not empty. Test it with `has(sel, "some-id")`, a helper the engine defines for you; `sel.route.includes(...)` throws the moment that column is untouched |
| `TENSIONS` | `{when: [ids...], text}` — legal but uncomfortable pairings |
| `FRAGILE` | `{test(sel) -> bool, text}` — single-leg fragility warnings |
| `PLAYS` | `{name, why, picks:{axisId: [ids...]}}` — the whole strategies that are not axes |
| `EXCLUSIONS` | the Phase 1.6 hard exclusions, one sentence each — what is off the board regardless of score, and why. They render above the board as standing constraints, never as cards |
| `ASSUMPTIONS` | `{k, t}` — what the dimensions mean, how the profile aggregates, what the tool deliberately does not do |

Counts for the collections the phases above leave open: 2-4 locks, 4-8
tensions, 2-4 fragility checks, 3-6 exclusions, and an assumption for every
dimension plus the two or three that state what the board does not do. An
axis may also carry `sub`, a short line shown under its title in the drawer;
leave it out unless a column needs a caveat its card readings cannot hold.

Outside that region you may change five things, all of them text:

- the `<title>`;
- the heading inside `#demohead` — the decision in the user's own terms;
- the lede under it. Keep what it says about the mechanic ("cards that cannot
  coexist with your picks lock and say why") and put your decision in front
  of it — replacing the line wholesale deletes the only place the board
  explains how it works;
- `#scenario` — who the board is written for, and from whose position the
  scores are written;
- `#srcnote` — how the facts were verified, on what date, and what was
  dropped. Leaving the template's placeholder here makes the board lie about
  its own sourcing.

Nothing else. Not the markup, not the ids, not a class.

**Do not:**
- edit the `<style>` block, or add a single CSS rule anywhere;
- choose a typeface, a colour, a radius, a spacing value, or a semantic
  colour for locks, tensions or risk — the template has all of them;
- change the markup, the ids, or anything below the `ENGINE` marker;
- set the number of columns. The grid reads `DIMS.length` at load. A board
  with five axes and one with eight both come out right with no edit.

The engine reads `SCORECARD` for every dimension it displays, averages,
marks, and exports, so your dimension keys can be anything; nothing
downstream assumes the worked example's five.

### Validate before you QA

The skill ships a validator. Run it, fix every FAIL, and read the WARN list
out to the user instead of quietly accepting it:

    node validate.mjs your-board.html --template board.template.html

It sits beside this file in the skill package, at `validate.mjs`. If you were
handed `SKILL.md` on its own, fetch it once:

    https://raw.githubusercontent.com/yuannc12/decision-board/main/validate.mjs

Node 18 or newer, no packages. Add `--offline` while you are still fixing
structure, to skip the fetches; run it without the flag before you hand over. It checks the stylesheet against the template
byte for byte; that every placeholder was replaced; that axis and card ids are
unique; that every card is scored on every dimension with a stated reason,
integers 1 to 5; that exactly one dimension is inverted; that no dimension
scores every card the same; that every fact carries a quote and a source key
that resolves; that every source is https; that every play stays inside its
axis limits and clear of the locks. Then it fetches every source and looks for
each quote in the page — Phase 2's gate, run again against what shipped.

Two results are not failures and must not be treated as passes. A source that
answers with a wall, a consent gate, or an empty shell comes back **unread**:
verify that quote by hand, or drop the fact. A **one-word score reason**
("steady", "solid") labels the score instead of giving a reason for it; write
the reason.

If you cannot run Node, say so in your handover rather than reporting the
board as validated.

### QA before handing over

The validator has already covered the stylesheet, the scores, the sources and
their quotes, and the plays. What follows is what a machine cannot check.

- Click every card: no lock without a reason, no empty drawer — and clicking
  a locked card itself must open the explanation, not just a small affordance
  next to it.
- Complete one full path: the profile, the path sentence, and the tensions
  all render; export downloads and reads clean, quotes included.
- Save two different paths as scenarios: both appear in the comparison table
  with the per-dimension best marked, load restores a saved path exactly, and
  the export carries the comparison.
- The assumptions list explains every dimension and how the profile
  aggregates — hidden judgment is the failure mode.
- Read the column titles as a row. Every one is a noun phrase naming a
  variable, none is a question, and none restates the decision. If one card
  anywhere would settle the decision by itself, move it to `PLAYS`.
- Check a phone-width viewport: the scoreboard must collapse to a one-line
  summary with an expand control, not cover the board.
- Rename a dimension's `label` in `SCORECARD` (not its `k`) and reload — in
  a copy, or undo it before handing the file over: the
  scoreboard, the drawer hint, the comparison table and the markdown export
  must all follow. If anything still shows the old label, the engine is not
  reading the scorecard.
- Tab through the board: every card is reachable and operable from the
  keyboard, with a visible focus ring.
- Escaping is already handled: the template runs every researched string
  through `esc()` before it reaches the DOM. Do not remove those calls, and
  do not add markup to your own data strings expecting it to render.

## Credit

Boards you generate keep one line in the footer:

> Built with Decision Board — keftek.com/lab/decision-board

Decision Board and its worked example: © 2026 Keftek — https://keftek.com — a
strategy, design, and engineering studio for custom software, ML, and AI.
