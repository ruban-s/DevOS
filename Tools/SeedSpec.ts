#!/usr/bin/env bun
/**
 * SeedSpec — Spec step 5a. Deterministic ISA seeder: copies
 * `DEVOS/templates/ISA.seed.md` → `<target>/ISA.md` with known tokens resolved
 * (project name/slug, date, harness version) and reports the tokens the
 * interview must still fill. Additive: refuses when ISA.md exists (exit 1).
 * Dry-run by default. Refuses the DevOS source checkout (exit 2).
 *
 * Usage: bun Tools/SeedSpec.ts [--target <dir>] [--apply] [--allow-dev]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, basename } from "node:path";
import { parseArgs, emit, isDevTreeCheckout, resolveTarget, SOURCE_ROOT } from "./lib";

function kebab(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "project";
}

function main(): void {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const apply = flags.has("--apply");
  const allowDev = flags.has("--allow-dev");
  const isaMd = join(target, "ISA.md");

  if ((target === SOURCE_ROOT || isDevTreeCheckout(target)) && !allowDev) {
    emit({ ok: false, refused: "dev-tree", detail: `${target} is the DevOS source checkout — refusing to seed it.` }, 2);
  }

  const deployedSeed = join(target, "DEVOS", "templates", "ISA.seed.md");
  const sourceSeed = join(SOURCE_ROOT, "templates", "ISA.seed.md");
  const seedPath = existsSync(deployedSeed) ? deployedSeed : sourceSeed;
  if (!existsSync(seedPath)) {
    emit({ ok: false, error: `ISA seed not found (looked in DEVOS/templates and source templates) — run DeployCore --apply first` }, 1);
  }
  if (existsSync(isaMd)) {
    emit({ ok: false, error: `ISA.md already exists at ${isaMd} — refusing to overwrite (delete it to re-seed)` }, 1);
  }

  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const projectName = basename(target);
  const vars: Record<string, string> = {
    "{{PROJECT_NAME}}": projectName,
    "{{PROJECT_SLUG}}": `${datePart}-${kebab(projectName)}`,
    "{{DATE_ISO}}": now.toISOString(),
  };
  const versionFile = join(target, "DEVOS", "RUNTIME", "VERSION");
  if (existsSync(versionFile)) vars["{{HARNESS_VERSION}}"] = readFileSync(versionFile, "utf-8").trim();

  let s = readFileSync(seedPath, "utf-8");
  for (const [k, v] of Object.entries(vars)) s = s.split(k).join(v);

  // Every surviving token, not just SCREAMING_CASE — the seed also carries
  // lowercase alternation placeholders like {{bash|curl|test|...}}.
  const remaining = [...s.matchAll(/\{\{[^{}\n]+\}\}/g)].map((m) => m[0]);
  const remainingUnique = [...new Set(remaining)].sort();

  if (!apply) {
    emit({
      ok: true, dryRun: true, target, seed: seedPath,
      wouldCreate: "ISA.md", resolved: vars, remainingTokens: remainingUnique,
      note: "dry run — nothing written; re-run with --apply",
    }, 0);
  }

  writeFileSync(isaMd, s);
  emit({ ok: true, target, written: "ISA.md", resolved: vars, remainingTokens: remainingUnique }, 0);
}

main();
