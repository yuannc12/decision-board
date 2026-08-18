#!/usr/bin/env node
// Decision Board — validator.
//
// The skill makes promises about every board it builds: every fact carries a
// quote that appears in its source, every card is scored on every dimension,
// no preset opens a locked combination, the stylesheet is the template's.
// Prose asks an agent to check those. This checks them.
//
//   node validate.mjs my-board.html
//   node validate.mjs my-board.html --template assets/board.template.html
//   node validate.mjs my-board.html --offline     # skip the source fetches
//   node validate.mjs page.html --no-style        # board embedded in a larger page
//
// Node 18+. No dependencies. Exits 1 when anything fails.
import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const OFFLINE = args.includes("--offline");
const NOSTYLE = args.includes("--no-style"); // the board is embedded in a larger page
const board = args.find((a) => !a.startsWith("--"));
const tplArg = args.includes("--template") ? args[args.indexOf("--template") + 1] : null;

if (!board) {
  console.error("usage: node validate.mjs <board.html> [--template <path>] [--offline]");
  process.exit(2);
}

const fails = [];
const warns = [];
const fail = (code, msg) => fails.push(`${code}: ${msg}`);
const warn = (code, msg) => warns.push(`${code}: ${msg}`);

const html = readFileSync(resolve(board), "utf8");

// ---------- the stylesheet is the template's, byte for byte ----------
const styleOf = (s) => {
  const m = s.match(/<style>([\s\S]*?)<\/style>/);
  return m ? m[1] : null;
};
const tplPath = NOSTYLE ? null : tplArg || [join(HERE, "assets", "board.template.html"), join(HERE, "board.template.html")].find(existsSync);
if (NOSTYLE) {
  // nothing to compare: the stylesheet also dresses the page around the board
} else if (!tplPath || !existsSync(tplPath)) {
  warn("style", "template not found — skipping the stylesheet check. Pass --template <path> to run it.");
} else {
  const a = styleOf(html), b = styleOf(readFileSync(resolve(tplPath), "utf8"));
  if (!a) fail("style", "no <style> block in the board");
  else if (a !== b) {
    const al = a.split("\n"), bl = b.split("\n");
    const i = al.findIndex((l, n) => l !== bl[n]);
    fail("style", `stylesheet differs from the template at line ${i + 1}.\n      board:    ${JSON.stringify((al[i] || "").slice(0, 90))}\n      template: ${JSON.stringify((bl[i] || "").slice(0, 90))}`);
  }
}

// ---------- the text the agent is allowed to write, and must ----------
const textOf = (re) => { const m = html.match(re); return m ? m[1].replace(/<[^>]+>/g, "").trim() : null; };
const title = textOf(/<title>([\s\S]*?)<\/title>/);
const heading = textOf(/<div id="demohead">[\s\S]*?<h2>([\s\S]*?)<\/h2>/);
const scenario = textOf(/<div id="scenario">([\s\S]*?)<\/div>/);
const srcnote = textOf(/<p id="srcnote">([\s\S]*?)<\/p>/);
const PLACEHOLDERS = {
  title: ["Decision Board", ""],
  heading: ["The decision, in the user's own terms", "The decision, in the user’s own terms", ""],
  scenario: ["Who this board is written for, and from whose position the scores are written.", ""],
  srcnote: ["How the facts on this board were verified, on what date, and what was dropped.", ""],
};
for (const [k, v] of Object.entries({ title, heading, scenario, srcnote })) {
  if (v === null) fail("text", `#${k} is missing from the markup`);
  else if (PLACEHOLDERS[k].includes(v)) fail("text", `${k} still carries the template's placeholder — the board describes itself, or it lies about itself`);
}

// ---------- the data layer, evaluated as the JavaScript it is ----------
const DATA_MARK = "// ================= DATA =================";
const ENGINE_MARK = "// ================= ENGINE =================";
if (!html.includes(DATA_MARK) || !html.includes(ENGINE_MARK)) {
  fail("data", "the DATA and ENGINE markers are not both present — this is not a Decision Board");
  report();
}
const dataSrc = html.slice(html.indexOf(DATA_MARK) + DATA_MARK.length, html.indexOf(ENGINE_MARK));
const ctx = { has: (s, id) => Object.values(s).flat().includes(id) };
try {
  vm.createContext(ctx);
  vm.runInContext(dataSrc + "\n;globalThis.__d={SRC,DIMS,DETAIL,SCORECARD,LOCKS,TENSIONS,FRAGILE,PLAYS,EXCLUSIONS,ASSUMPTIONS};", ctx, { timeout: 5000 });
} catch (e) {
  fail("data", `the data layer does not evaluate: ${e.message}`);
  report();
}
const D = ctx.__d;

// ---------- structure ----------
const optIndex = new Map();
if (!Array.isArray(D.DIMS) || !D.DIMS.length) fail("axes", "DIMS is empty");
if (D.DIMS.length < 3 || D.DIMS.length > 10) fail("axes", `${D.DIMS.length} axes — a board is a field, not a list or a wall`);
else if (D.DIMS.length < 5 || D.DIMS.length > 8) warn("axes", `${D.DIMS.length} axes — the method wants 5 to 8`);

const axisIds = new Set();
for (const d of D.DIMS) {
  const at = `axis ${d.id || "(no id)"}`;
  if (!d.id) fail("axes", "an axis has no id");
  else if (axisIds.has(d.id)) fail("axes", `duplicate axis id ${d.id}`);
  axisIds.add(d.id);
  if (!d.title) fail("axes", `${at} has no title`);
  else {
    if (!/^\d+\s*·\s*\S/.test(d.title)) warn("axes", `${at} title is not numbered ("1 · Heat source"): ${JSON.stringify(d.title)}`);
    if (/\?\s*$/.test(d.title)) fail("axes", `${at} title is a question, not a variable: ${JSON.stringify(d.title)}`);
  }
  if (!d.say || !String(d.say).includes("{}")) fail("axes", `${at} has no path-sentence fragment with a {} slot`);
  if (!(d.max >= 1)) fail("axes", `${at} has no max`);
  if (!Array.isArray(d.options) || d.options.length < 2) fail("axes", `${at} has fewer than two options — a column with one card is a constant, not a decision`);
  for (const o of d.options || []) {
    if (!o.id) { fail("cards", `${at} has an option with no id`); continue; }
    if (optIndex.has(o.id)) fail("cards", `duplicate option id ${o.id}`);
    optIndex.set(o.id, { opt: o, dim: d });
    if (!o.title) fail("cards", `${o.id} has no title`);
    if (!o.read) fail("cards", `${o.id} has no reading — the drawer would open empty`);
  }
}

// ---------- the scorecard ----------
const SC = Array.isArray(D.SCORECARD) ? D.SCORECARD : [];
if (SC.length < 4 || SC.length > 6) warn("scorecard", `${SC.length} dimensions — the method wants 4 to 6`);
const inverted = SC.filter((d) => d.inverted);
if (inverted.length !== 1) fail("scorecard", `${inverted.length} inverted dimensions — exactly one must run the other way, or the scoreboard reads a risk as a virtue`);
const chips = SC.filter((d) => d.chip);
if (chips.length < 2 || chips.length > 3) warn("scorecard", `${chips.length} chip dimensions on the card face — 2 or 3 reads best`);
const keys = new Set();
for (const d of SC) {
  if (!d.k) fail("scorecard", "a dimension has no key");
  else if (keys.has(d.k)) fail("scorecard", `duplicate dimension key ${d.k}`);
  keys.add(d.k);
  for (const f of ["label", "short", "desc"]) if (!d[f]) fail("scorecard", `dimension ${d.k} has no ${f}`);
}

// ---------- every card scored on every dimension, with a reason ----------
for (const [id, { opt }] of optIndex) {
  for (const d of SC) {
    const v = opt.sc && opt.sc[d.k];
    if (!Array.isArray(v)) { fail("scores", `${id} has no score for ${d.k}`); continue; }
    const [n, why] = v;
    if (!Number.isInteger(n) || n < 1 || n > 5) fail("scores", `${id}.${d.k} is ${JSON.stringify(n)} — scores are integers 1 to 5`);
    if (!why || !String(why).trim()) fail("scores", `${id}.${d.k} has no stated reason — an unexplained score is not arguable`);
    // One word names the score again ("steady", "solid"); it does not say why,
    // and a score you cannot argue with is the failure this whole layer exists
    // to avoid. Two words are enough to carry a mechanism ("ML premium").
    else if (!/\s/.test(String(why).trim())) warn("scores", `${id}.${d.k} reason is ${JSON.stringify(why)} — one word labels the score rather than giving a reason for it`);
  }
}
for (const d of SC) {
  const vals = new Set([...optIndex.values()].map(({ opt }) => opt.sc?.[d.k]?.[0]));
  if (vals.size === 1) fail("scorecard", `every card scores the same on ${d.k} — a dimension that cannot change the decision is decoration`);
}

// ---------- facts, sources, and the citation gate ----------
const SRC = D.SRC || {};
const cites = [];
for (const [id, { opt }] of optIndex) {
  for (const f of opt.facts || []) {
    if (!f.t) fail("facts", `${id} has a fact with no statement`);
    if (!f.q || String(f.q).trim().length < 12) fail("facts", `${id} has a fact with no verbatim quote — the quote is the audit trail`);
    if (!f.s || !SRC[f.s]) { fail("facts", `${id} cites unknown source key ${JSON.stringify(f.s)}`); continue; }
    cites.push({ id, q: String(f.q), key: f.s, url: SRC[f.s].u });
  }
}
const usedKeys = new Set(cites.map((c) => c.key));
for (const [k, s] of Object.entries(SRC)) {
  if (!s.n) fail("sources", `source ${k} has no name`);
  if (!s.u) fail("sources", `source ${k} has no url — every source renders as a link`);
  else if (!/^https:\/\//.test(s.u)) fail("sources", `source ${k} is not https: ${s.u}`);
  if (!usedKeys.has(k)) warn("sources", `source ${k} is defined but never cited`);
}

// ---------- detail, locks, tensions, plays ----------
for (const [id] of optIndex) {
  const dt = (D.DETAIL || {})[id];
  if (!dt) { warn("detail", `${id} has no detail entry — the drawer shows scores with no motion behind them`); continue; }
  for (const f of ["play", "gain", "give", "works"]) if (!dt[f]) fail("detail", `${id} detail has no ${f}`);
}
for (const l of D.LOCKS || []) {
  if (!optIndex.has(l.opt)) fail("locks", `lock targets unknown option ${JSON.stringify(l.opt)}`);
  if (typeof l.test !== "function") fail("locks", `lock on ${l.opt} has no test`);
}
for (const t of D.TENSIONS || []) {
  for (const w of t.when || []) if (!optIndex.has(w)) fail("tensions", `tension names unknown option ${JSON.stringify(w)}`);
  if (!t.text) fail("tensions", "a tension has no text");
}
for (const f of D.FRAGILE || []) if (typeof f.test !== "function") fail("tensions", "a fragility check has no test");

for (const p of D.PLAYS || []) {
  const at = `play ${JSON.stringify(p.name || "(unnamed)")}`;
  if (!p.name) fail("plays", "a play has no name");
  if (!p.why) fail("plays", `${at} has no why`);
  const sel = {};
  for (const [axisId, ids] of Object.entries(p.picks || {})) {
    const dim = D.DIMS.find((d) => d.id === axisId);
    if (!dim) { fail("plays", `${at} picks unknown axis ${axisId}`); continue; }
    if (ids.length > dim.max) fail("plays", `${at} picks ${ids.length} cards on ${axisId}, which allows ${dim.max}`);
    for (const id of ids) {
      const rec = optIndex.get(id);
      if (!rec) fail("plays", `${at} picks unknown card ${id}`);
      else if (rec.dim.id !== axisId) fail("plays", `${at} picks ${id} on ${axisId}, but it belongs to ${rec.dim.id}`);
    }
    sel[axisId] = [...ids];
  }
  for (const l of D.LOCKS || []) {
    if (typeof l.test !== "function") continue;
    const picked = Object.values(sel).flat().includes(l.opt);
    if (!picked) continue;
    let reason = false;
    try { reason = l.test(sel); } catch { fail("plays", `${at} — the lock on ${l.opt} threw`); continue; }
    if (reason) fail("plays", `${at} opens a locked combination: ${reason}`);
  }
}

// ---------- the standing text ----------
if (!Array.isArray(D.EXCLUSIONS) || !D.EXCLUSIONS.length) warn("exclusions", "no standing exclusions — the interview asks what is off the board regardless of score");
for (const e of D.EXCLUSIONS || []) if (!String(e).trim()) fail("exclusions", "an exclusion is empty");
if (!Array.isArray(D.ASSUMPTIONS) || !D.ASSUMPTIONS.length) fail("assumptions", "no assumptions — hidden judgment is the failure mode");
else if (D.ASSUMPTIONS.length < SC.length) warn("assumptions", `${D.ASSUMPTIONS.length} assumptions for ${SC.length} dimensions — every dimension needs its meaning stated`);
for (const a of D.ASSUMPTIONS || []) if (!a.k || !a.t) fail("assumptions", "an assumption has no key or no text");

// ---------- the citation gate: the quote must be in the page ----------
// Compared on words and numbers alone. Stripping tags puts spaces where the
// markup was ("42% , up from"), and a source is free to re-typeset a dash or
// a curly quote, so punctuation cannot be part of the test. Words and digits
// can: a quote that has been stitched from two sentences still fails here,
// which is the whole point.
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ldquo: '"', rdquo: '"',
  lsquo: "'", rsquo: "'", mdash: "-", ndash: "-", hellip: "...", eacute: "e", egrave: "e",
  agrave: "a", ccedil: "c", uuml: "u", ouml: "o", auml: "a", szlig: "ss" };
// Entities are decoded before the squeeze, never after: &quot; squeezed raw
// leaves the word "quot" sitting in the middle of the sentence, and the quote
// gets called missing for a reason that has nothing to do with the source.
const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z][a-z0-9]*);/gi, (_, n) => ENT[n.toLowerCase()] ?? " ");

const squeeze = (s) => decode(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const strip = (s) => squeeze(s
  .replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, " ")
  .replace(/<[^>]+>/g, " "));

async function checkCitations() {
  const byUrl = new Map();
  for (const c of cites) {
    if (!c.url) continue;
    if (!byUrl.has(c.url)) byUrl.set(c.url, []);
    byUrl.get(c.url).push(c);
  }
  let verified = 0, unreachable = 0;
  for (const [url, group] of byUrl) {
    let text = null;
    try {
      const r = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(25000),
        headers: { "user-agent": "Mozilla/5.0 (decision-board validator)", accept: "text/html,*/*" },
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      text = strip(await r.text());
      // A bot wall answers 200 with a few words. Calling that a missing quote
      // would tell you to drop a fact that is fine — worse than no check.
      if (text.length < 400) throw new Error(`only ${text.length} characters of text — a wall or a paywall, not the article`);
    } catch (e) {
      unreachable += group.length;
      warn("citation", `${url} could not be read (${e.message}) — ${group.length} quote(s) unchecked. Verify by hand or drop the fact.`);
      continue;
    }
    for (const c of group) {
      if (text.includes(squeeze(c.q))) { verified++; continue; }
      // A quote can be absent for two different reasons, and they call for
      // opposite actions. If none of its distinctive words are on the page,
      // the page never rendered the article (a JS shell, a consent gate) —
      // saying "not verbatim" there would be an accusation the run cannot
      // support. If the words are there and the sentence is not, the quote
      // was stitched or reworded, and that is the defect this gate exists for.
      const words = [...new Set(squeeze(c.q).split(" ").filter((w) => w.length >= 6))].slice(0, 6);
      const hits = words.filter((w) => text.includes(w)).length;
      // The bar for accusing: a majority of the quote's distinctive words on
      // the page. Below it, a title and some navigation can supply a word or
      // two while the article itself never arrived.
      if (words.length && hits <= words.length / 2) {
        unreachable++;
        warn("citation", `${c.id}: ${url} returned ${text.length} characters and only ${hits} of ${words.length} of the quote's distinctive words — the article did not render for this fetch. Verify by hand or drop the fact.`);
      } else {
        fail("citation", `${c.id}: the quote is not in ${url} (the page carries ${hits} of ${words.length} of its distinctive words, so it is the wording that differs)\n      quote: ${JSON.stringify(c.q.slice(0, 120))}`);
      }
    }
  }
  console.log(`\ncitations: ${verified} verified, ${cites.length - verified - unreachable} missing, ${unreachable} unreachable, of ${cites.length}`);
}

function report() {
  console.log(`\n${board}`);
  if (fails.length) { console.log(`\nFAIL (${fails.length})`); for (const f of fails) console.log("  · " + f); }
  if (warns.length) { console.log(`\nWARN (${warns.length})`); for (const w of warns) console.log("  · " + w); }
  if (!fails.length && !warns.length) console.log("\nclean.");
  else if (!fails.length) console.log("\npasses, with warnings.");
  process.exit(fails.length ? 1 : 0);
}

if (OFFLINE) { warn("citation", `--offline: ${cites.length} quotes not checked against their sources`); report(); }
else { await checkCitations(); report(); }
