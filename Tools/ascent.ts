#!/usr/bin/env bun
/**
 * DevOS Tools/ascent.ts — the ONE derivation table for run states.
 * Nothing hand-lists phase names anywhere; every surface (status notes,
 * ISASync delta blocks, future dashboards) resolves through deriveAscent().
 */

export interface Ascent { icon: string; label: string }

const TABLE: Record<string, Ascent> = {
  marking: { icon: "🔭", label: "Marking" },
  scoping: { icon: "🔭", label: "Scoping" },
  starting: { icon: "🏁", label: "Starting" },
  climbing: { icon: "🧗", label: "Climbing" },
  learn: { icon: "📚", label: "Learning" },
  complete: { icon: "✅", label: "Complete" },
};

// Retired station names still parse — they resolve to the climb.
const LEGACY: Record<string, Ascent> = {
  observe: { icon: "🔭", label: "Marking" },
  think: { icon: "🔭", label: "Marking" },
  plan: { icon: "🔭", label: "Marking" },
  build: { icon: "🧗", label: "Climbing" },
  execute: { icon: "🧗", label: "Climbing" },
  verify: { icon: "🧗", label: "Climbing" },
};

export function deriveAscent(phase: string): Ascent {
  const k = (phase || "").trim().toLowerCase();
  return TABLE[k] || LEGACY[k] || { icon: "🧗", label: phase || "Climbing" };
}

export function strip(phase: string): string {
  const a = deriveAscent(phase);
  return `════ DevOS | Algorithm | ${a.icon} ${a.label} ════`;
}
