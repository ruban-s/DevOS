#!/usr/bin/env bun
/**
 * DetectEnv — Setup step 1. Read-only environment detection. Emits the JSON
 * the Setup workflow branches on (OS, harness, bun, target state). Never writes.
 * Exit 0 always — detection never "fails"; the workflow decides on the data.
 *
 * Usage: bun Tools/DetectEnv.ts [--target <dir>]
 */

import { existsSync } from "node:fs";
import { join } from "node:path";
import { detectHarness, homeDir, isDevTreeCheckout, parseArgs, resolveTarget, SOURCE_ROOT } from "./lib";

function main(): void {
  const { get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const home = homeDir();
  const harness = detectHarness(home);
  const devosDir = join(target, "DEVOS");

  console.log(JSON.stringify({
    os: process.platform,
    arch: process.arch,
    bun: Bun.version,
    sourceRoot: SOURCE_ROOT,
    harness,
    target: {
      root: target,
      isSelf: target === SOURCE_ROOT,
      isDevTree: isDevTreeCheckout(target),
      devosPresent: existsSync(devosDir),
      isaPresent: existsSync(join(target, "ISA.md")),
      agentsMdPresent: existsSync(join(target, "AGENTS.md")),
      claudeMdPresent: existsSync(join(target, "CLAUDE.md")),
    },
  }, null, 2));
  process.exit(0);
}

main();
