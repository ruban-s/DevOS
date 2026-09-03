#!/usr/bin/env bun
/**
 * Doctor — DevOS capability prober and advisory manifest writer.
 *
 * Four states: live | broken | declined | stale. Declined is first-class and
 * permanently silent — opted-out is not a defect. No scores, no percentages.
 * Never install-fatal: default run exits 0, every probe is timeout-bounded,
 * network probes are opt-in (--network) and only fire for configured caps.
 * The manifest is a TTL'd advisory CACHE, never truth — gates re-verify live.
 *
 * Usage:
 *   bun Tools/Doctor.ts [--target <dir>]            # probe, table output
 *   bun Tools/Doctor.ts [--target <dir>] --json     # machine-readable
 *   bun Tools/Doctor.ts --network                   # include network probes
 *   bun Tools/Doctor.ts --decline <cap>             # silent forever
 *   bun Tools/Doctor.ts --enable <cap>              # undo a decline
 *   bun Tools/Doctor.ts --ack                       # acknowledge broken set
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { parseArgs, emit, resolveTarget } from "./lib";

type CapState = "live" | "broken" | "declined" | "stale";

interface CapResult {
  state: CapState;
  checkedAt: string;
  ttlHours: number;
  detail: string;
  fix: string | null;
  probeClass: "offline" | "network";
}

interface Manifest {
  version: 1;
  updatedAt: string;
  declined: string[];
  ackedBroken: string[];
  capabilities: Record<string, CapResult>;
}

const TTL_HOURS = 24;
const PROBE_TIMEOUT = 10_000;

function which(bin: string): string | null {
  try { return Bun.which(bin); } catch { return null; }
}

async function cmd(argv: string[], network: boolean): Promise<{ ok: boolean; out: string }> {
  try {
    const proc = Bun.spawn(argv, { stdout: "pipe", stderr: "pipe" });
    const timer = setTimeout(() => { try { proc.kill(); } catch { /* already exited */ } }, PROBE_TIMEOUT);
    const out = await new Response(proc.stdout).text();
    await proc.exited;
    clearTimeout(timer);
    return { ok: proc.exitCode === 0, out: out.trim() };
  } catch {
    return { ok: false, out: "" };
  }
}

interface CapSpec {
  id: string;
  title: string;
  required: boolean;
  probeClass: "offline" | "network";
  probe: (network: boolean, target: string) => Promise<Omit<CapResult, "state" | "checkedAt" | "ttlHours"> & { live: boolean }>;
}

const CAPS: CapSpec[] = [
  {
    id: "bun", title: "bun runtime (harness tools)", required: true, probeClass: "offline",
    probe: async () => {
      const p = which("bun");
      return p
        ? { live: true, detail: `bun ${Bun.version} at ${p}`, fix: null, probeClass: "offline" }
        : { live: false, detail: "bun not on PATH — harness tools cannot run", fix: "curl -fsSL https://bun.sh/install | bash", probeClass: "offline" };
    },
  },
  {
    id: "git", title: "git (changelog-is-git, checkpoints)", required: true, probeClass: "offline",
    probe: async () => {
      const p = which("git");
      if (!p) return { live: false, detail: "git not on PATH", fix: "install git (xcode-select --install / apt install git)", probeClass: "offline" };
      const r = await cmd(["git", "--version"], false);
      return { live: r.ok, detail: r.ok ? r.out : "git present but --version failed", fix: r.ok ? null : "reinstall git", probeClass: "offline" };
    },
  },
  {
    id: "node", title: "node (target-stack spare runtime)", required: false, probeClass: "offline",
    probe: async () => {
      const p = which("node");
      if (!p) return { live: false, detail: "node not on PATH (info only — needed only for node target stacks)", fix: "install node LTS", probeClass: "offline" };
      const r = await cmd(["node", "--version"], false);
      return { live: true, detail: r.out || "node present", fix: null, probeClass: "offline" };
    },
  },
  {
    id: "rg", title: "ripgrep (sweeps, class-sweep probes)", required: false, probeClass: "offline",
    probe: async () => {
      const p = which("rg");
      return p
        ? { live: true, detail: `rg at ${p}`, fix: null, probeClass: "offline" }
        : { live: false, detail: "rg not on PATH — class-sweep and grep probes degrade to slower search", fix: "brew install ripgrep / cargo install ripgrep", probeClass: "offline" };
    },
  },
  {
    id: "jq", title: "jq (JSON probes)", required: false, probeClass: "offline",
    probe: async () => {
      const p = which("jq");
      return p
        ? { live: true, detail: `jq at ${p}`, fix: null, probeClass: "offline" }
        : { live: false, detail: "jq not on PATH (info only)", fix: "brew install jq", probeClass: "offline" };
    },
  },
  {
    id: "gh", title: "gh (issue/work capture)", required: false, probeClass: "offline",
    probe: async (network) => {
      const p = which("gh");
      if (!p) return { live: false, detail: "gh not on PATH — work capture to issues unavailable", fix: "brew install gh && gh auth login", probeClass: "offline" };
      if (!network) return { live: true, detail: `gh at ${p} (auth unchecked — re-run with --network)`, fix: null, probeClass: "offline" };
      const r = await cmd(["gh", "auth", "status"], true);
      return r.ok
        ? { live: true, detail: "gh authenticated", fix: null, probeClass: "network" }
        : { live: false, detail: "gh present but not authenticated", fix: "gh auth login", probeClass: "network" };
    },
  },
  {
    id: "chrome", title: "real Chrome (Interceptor verification path)", required: false, probeClass: "offline",
    probe: async () => {
      const cands = [which("google-chrome"), which("chromium"), which("chromium-browser"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"];
      const hit = cands.find((c): c is string => !!c && existsSync(c));
      return hit
        ? { live: true, detail: `Chrome at ${hit}`, fix: null, probeClass: "offline" }
        : { live: false, detail: "no real Chrome found — web claims hold [DEFERRED-VERIFY], never substitute weaker evidence", fix: "install Google Chrome", probeClass: "offline" };
    },
  },
  {
    id: "devos-install", title: "DEVOS install in target", required: true, probeClass: "offline",
    probe: async (_network, target) => {
      const skill = join(target, "DEVOS", "SKILL.md");
      if (!existsSync(skill)) return { live: false, detail: `no DEVOS install at ${target}`, fix: "bun <devos-checkout>/Tools/DeployCore.ts --target <repo> --apply", probeClass: "offline" };
      const verFile = join(target, "DEVOS", "RUNTIME", "VERSION");
      const agents = join(target, "AGENTS.md");
      const claudeMd = join(target, "CLAUDE.md");
      const problems: string[] = [];
      if (!existsSync(verFile)) problems.push("DEVOS/RUNTIME/VERSION missing");
      const pointed = (existsSync(agents) && readFileSync(agents, "utf-8").includes("DEVOS/")) ||
        (existsSync(claudeMd) && readFileSync(claudeMd, "utf-8").includes("DEVOS/"));
      if (!pointed) problems.push("no DEVOS pointer block in AGENTS.md or CLAUDE.md");
      return problems.length === 0
        ? { live: true, detail: `DEVOS present (${readFileSync(verFile, "utf-8").trim()}) with pointer block`, fix: null, probeClass: "offline" }
        : { live: false, detail: problems.join("; "), fix: "re-run DeployCore --apply, then ActivateImports --apply", probeClass: "offline" };
    },
  },
];

function loadManifest(stateDir: string): Manifest {
  const f = join(stateDir, "doctor.json");
  try {
    if (existsSync(f)) {
      const m = JSON.parse(readFileSync(f, "utf-8")) as Manifest;
      if (m.version === 1) return { declined: [], ackedBroken: [], ...m };
    }
  } catch { /* corrupt — rebuild */ }
  return { version: 1, updatedAt: new Date().toISOString(), declined: [], ackedBroken: [], capabilities: {} };
}

function table(results: Record<string, CapResult>): string {
  const rows = Object.entries(results).map(([id, r]) => {
    const glyph = r.state === "live" ? "✅" : r.state === "broken" ? "❌" : r.state === "declined" ? "➖" : "🕰️";
    return `${glyph} ${id} [${r.state}] — ${r.detail}${r.fix ? `\n    fix: ${r.fix}` : ""}`;
  });
  const broken = Object.entries(results).filter(([, r]) => r.state === "broken");
  return rows.join("\n") + (broken.length > 0 ? `\n\n${broken.length} broken — declined is silent OFF, never a defect to nag about.` : "\n\nAll live.");
}

async function main(): Promise<void> {
  const { flags, get } = parseArgs(process.argv.slice(2));
  const target = resolveTarget(get("--target"));
  const stateDir = join(target, "DEVOS", "MEMORY", "STATE");
  const manifest = loadManifest(stateDir);
  const json = flags.has("--json");
  const network = flags.has("--network");

  const decline = get("--decline");
  const enable = get("--enable");
  if (decline || enable) {
    const id = (decline || enable)!;
    if (!CAPS.some((c) => c.id === id)) emit({ ok: false, error: `unknown capability ${id} — known: ${CAPS.map((c) => c.id).join(", ")}` }, 1);
    if (decline) {
      if (!manifest.declined.includes(id)) manifest.declined.push(id);
      delete manifest.capabilities[id];
    } else {
      manifest.declined = manifest.declined.filter((d) => d !== id);
    }
    mkdirSync(stateDir, { recursive: true });
    manifest.updatedAt = new Date().toISOString();
    writeFileSync(join(stateDir, "doctor.json"), JSON.stringify(manifest, null, 2));
    emit({ ok: true, declined: manifest.declined }, 0);
  }

  if (flags.has("--ack")) {
    const broken = Object.entries(manifest.capabilities).filter(([, r]) => r.state === "broken").map(([id]) => id);
    manifest.ackedBroken = broken;
    mkdirSync(stateDir, { recursive: true });
    manifest.updatedAt = new Date().toISOString();
    writeFileSync(join(stateDir, "doctor.json"), JSON.stringify(manifest, null, 2));
    emit({ ok: true, ackedBroken: broken }, 0);
  }

  const results: Record<string, CapResult> = {};
  for (const cap of CAPS) {
    if (manifest.declined.includes(cap.id)) {
      results[cap.id] = { state: "declined", checkedAt: manifest.updatedAt, ttlHours: TTL_HOURS, detail: "opted out — silent", fix: null, probeClass: cap.probeClass };
      continue;
    }
    try {
      const r = await cap.probe(network, target);
      results[cap.id] = { state: r.live ? "live" : "broken", checkedAt: new Date().toISOString(), ttlHours: TTL_HOURS, detail: r.detail, fix: r.fix, probeClass: r.probeClass };
    } catch (e) {
      results[cap.id] = { state: "broken", checkedAt: new Date().toISOString(), ttlHours: TTL_HOURS, detail: `probe crashed: ${String(e)}`, fix: null, probeClass: cap.probeClass };
    }
  }

  manifest.capabilities = results;
  manifest.updatedAt = new Date().toISOString();
  try {
    mkdirSync(stateDir, { recursive: true });
    writeFileSync(join(stateDir, "doctor.json"), JSON.stringify(manifest, null, 2));
  } catch { /* manifest is advisory cache — a write failure never fails the run */ }

  if (json) emit({ ok: true, target, ...results } as unknown as Record<string, unknown>, 0);
  console.log(table(results));
  process.exit(0);
}

main();
