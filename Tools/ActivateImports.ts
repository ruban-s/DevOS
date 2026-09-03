#!/usr/bin/env bun
/**
 * ActivateImports — Setup step 4. Ensures the target repo's AGENTS.md carries
 * the DevOS pointer block (harness contract, constitution, spec format).
 * Idempotent: present markers → block content refreshed in place; absent file →
 * created; absent block → appended. Dry-run by default. Refuses the DevOS
 * source checkout (exit 2) unless --allow-dev; errors when DEVOS/ is absent
 * (run DeployCore first) — exit 1.
 *
 * Usage: bun Tools/ActivateImports.ts [--target <dir>] [--apply] [--allow-dev]
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, emit, isDevTreeCheckout, resolveTarget, SOURCE_ROOT } from "./lib";

const START = "<!-- devos-managed:imports:start -->";
const END = "<!-- devos-managed:imports:end -->";

function block(): string {
  return `${START}
## DevOS harness

This repo uses DevOS (repo-local at \`DEVOS/\`). Harness contract: \`DEVOS/SKILL.md\`;
constitution: \`DEVOS/RUNTIME/SYSTEM_PROMPT.md\`; spec format: \`DEVOS/RUNTIME/ISA_FORMAT.md\`;
project spec: \`ISA.md\`.
${END}`;
}

function main(): void {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const apply = flags.has("--apply");
  const allowDev = flags.has("--allow-dev");
  const agentsMd = join(target, "AGENTS.md");

  if ((target === SOURCE_ROOT || isDevTreeCheckout(target)) && !allowDev) {
    emit({ ok: false, refused: "dev-tree", detail: `${target} is the DevOS source checkout — refusing to edit it.` }, 2);
  }
  if (!existsSync(join(target, "DEVOS", "SKILL.md"))) {
    emit({ ok: false, error: `no DEVOS install at ${target} — run DeployCore --apply first` }, 1);
  }

  const want = block();
  const present = existsSync(agentsMd) ? readFileSync(agentsMd, "utf-8") : null;
  const hasBlock = present !== null && present.includes(START) && present.includes(END);

  if (!apply) {
    emit({
      ok: true, dryRun: true, target,
      mode: present === null ? "would-create" : hasBlock ? "would-refresh" : "would-append",
      note: "dry run — nothing written; re-run with --apply",
    }, 0);
  }

  let mode: string;
  if (present === null) {
    writeFileSync(agentsMd, `# AGENTS.md\n\n${want}\n`);
    mode = "created";
  } else if (hasBlock) {
    const re = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    writeFileSync(agentsMd, present.replace(re, want));
    mode = "refreshed";
  } else {
    writeFileSync(agentsMd, present.endsWith("\n") ? `${present}\n${want}\n` : `${present}\n\n${want}\n`);
    mode = "appended";
  }
  emit({ ok: true, target, written: true, mode }, 0);
}

main();
