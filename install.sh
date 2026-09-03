#!/usr/bin/env bash
#
# DevOS installer — one script, two sources, zero surprises.
#
#   From a local checkout:   ./install.sh [--config-root DIR] [--apply] [--yes] [--wire-claude-md] [--wire-hooks]
#   One-liner (release):     curl -fsSL https://raw.githubusercontent.com/ruban-s/DevOS/v0.2.0/install.sh | bash -s -- [flags]
#
# Source resolution (in order): --source <dir|tarball> > DEVOS_SOURCE env >
# local checkout (script sits beside SKILL.md) > release tarball download.
# Release default: DEVOS_REPO below — SET THIS to owner/repo on first public
# release. Until then, download mode requires DEVOS_REPO to be exported.
#
# Behavior: bun check first (>= 1.2; exits with the install command when
# missing, installs nothing on its own unless --with-bun). Then GlobalInstall
# dry-run (the plan), a TTY prompt unless --yes/--apply, then apply.
# Wiring flags (--wire-claude-md, --wire-hooks) NEVER default on: each is a
# separate permission gate. No sudo, no writes outside <config-root>, no
# network beyond the tarball fetch. Safe to re-run (idempotent).
#
set -u
set -o pipefail

DEVOS_VERSION="${DEVOS_VERSION:-0.2.0}"
DEVOS_REPO="${DEVOS_REPO:-ruban-s/DevOS}"   # override with DEVOS_REPO=owner/repo for forks
DEVOS_TARBALL_URL="${DEVOS_TARBALL_URL:-}"
DEVOS_EXPECTED_SHA256="${DEVOS_EXPECTED_SHA256:-}"

CONFIG_ROOT="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
APPLY=0
YES=0
WITH_BUN=0
WIRE_CLAUDE_MD=0
WIRE_HOOKS=0
SOURCE=""

usage() {
  sed -n '2,20p' "$0"
  echo "Flags: --config-root DIR --source DIR|URL --apply --yes --with-bun --wire-claude-md --wire-hooks"
  exit "${1:-0}"
}

while [ $# -gt 0 ]; do
  case "$1" in
    --config-root) CONFIG_ROOT="$2"; shift 2 ;;
    --source) SOURCE="$2"; shift 2 ;;
    --apply) APPLY=1; shift ;;
    --yes) YES=1; APPLY=1; shift ;;
    --with-bun) WITH_BUN=1; shift ;;
    --wire-claude-md) WIRE_CLAUDE_MD=1; shift ;;
    --wire-hooks) WIRE_HOOKS=1; shift ;;
    -h|--help) usage 0 ;;
    *) echo "unknown flag: $1" >&2; usage 1 ;;
  esac
done
[ -n "${DEVOS_SOURCE:-}" ] && [ -z "$SOURCE" ] && SOURCE="$DEVOS_SOURCE"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
WORK=""; CLEANUP=0

log() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

# --- bun ---------------------------------------------------------------
install_bun() {
  log "installing bun (https://bun.sh/install)…"
  curl -fsSL https://bun.sh/install | bash || die "bun install failed"
  export PATH="$HOME/.bun/bin:$PATH"
  command -v bun >/dev/null 2>&1 || die "bun installed but not on PATH — add \$HOME/.bun/bin to PATH and re-run."
}

if ! command -v bun >/dev/null 2>&1; then
  if [ "$WITH_BUN" -eq 1 ]; then
    install_bun
  elif [ -t 0 ]; then
    printf 'bun >= 1.2 is required and not installed. Install it now? [Y/n] '
    read -r ans
    case "$ans" in
      ""|[yY]|[yY][eE][sS]) install_bun ;;
      *) die "ok — install bun first (curl -fsSL https://bun.sh/install | bash), then re-run." ;;
    esac
  else
    die "bun >= 1.2 required and not on PATH. Install it (curl -fsSL https://bun.sh/install | bash), or re-run with --with-bun."
  fi
fi
BUN_VER="$(bun --version)"
log "bun $BUN_VER"

# --- source ------------------------------------------------------------
if [ -z "$SOURCE" ] && [ -f "$SCRIPT_DIR/SKILL.md" ] && [ -f "$SCRIPT_DIR/RUNTIME/VERSION" ]; then
  SOURCE="$SCRIPT_DIR"
  log "source: local checkout ($SOURCE)"
fi

if [ -z "$SOURCE" ]; then
  if [ -n "$DEVOS_TARBALL_URL" ]; then
    URL="$DEVOS_TARBALL_URL"
  else
    [ -n "$DEVOS_REPO" ] || die "no local checkout and DEVOS_REPO is unset — export DEVOS_REPO=owner/repo (and optionally DEVOS_VERSION, default $DEVOS_VERSION), or pass --source <dir|tarball-url>."
    URL="https://github.com/$DEVOS_REPO/archive/refs/tags/v$DEVOS_VERSION.tar.gz"
  fi
  WORK="$(mktemp -d "${TMPDIR:-/tmp}/devos-install.XXXXXX")"
  CLEANUP=1
  trap 'rm -rf "$WORK"' EXIT
  log "fetch: $URL"
  curl -fsSL --retry 3 -o "$WORK/devos.tar.gz" "$URL" || die "download failed: $URL"
  if command -v sha256sum >/dev/null 2>&1; then SHA="$(sha256sum "$WORK/devos.tar.gz" | cut -d' ' -f1)";
  elif command -v shasum >/dev/null 2>&1; then SHA="$(shasum -a 256 "$WORK/devos.tar.gz" | cut -d' ' -f1)";
  else SHA="unavailable (no sha256sum/shasum)"; fi
  log "sha256: $SHA"
  if [ -n "$DEVOS_EXPECTED_SHA256" ] && [ "$SHA" != "$DEVOS_EXPECTED_SHA256" ]; then
    die "checksum mismatch — expected $DEVOS_EXPECTED_SHA256, got $SHA. Aborting (nothing was installed)."
  fi
  tar -xzf "$WORK/devos.tar.gz" -C "$WORK" || die "extract failed"
  SOURCE="$(echo "$WORK"/*/ | head -n 1)"
  SOURCE="${SOURCE%/}"
  log "source: extracted ($SOURCE)"
elif [ -d "$SOURCE" ]; then
  log "source: local dir ($SOURCE)"
elif [ -f "$SOURCE" ]; then
  WORK="$(mktemp -d "${TMPDIR:-/tmp}/devos-install.XXXXXX")"
  CLEANUP=1
  trap 'rm -rf "$WORK"' EXIT
  tar -xzf "$SOURCE" -C "$WORK" || die "extract failed: $SOURCE"
  SOURCE="$(echo "$WORK"/*/ | head -n 1)"; SOURCE="${SOURCE%/}"
  [ -d "$SOURCE" ] || SOURCE="$WORK"
  log "source: local tarball ($SOURCE)"
else
  case "$SOURCE" in
    http://*|https://*|file://*)
      WORK="$(mktemp -d "${TMPDIR:-/tmp}/devos-install.XXXXXX")"
      CLEANUP=1
      trap 'rm -rf "$WORK"' EXIT
      log "fetch: $SOURCE"
      curl -fsSL --retry 3 -o "$WORK/devos.tar.gz" "$SOURCE" || die "download failed"
      tar -xzf "$WORK/devos.tar.gz" -C "$WORK" || die "extract failed"
      SOURCE="$(echo "$WORK"/*/ | head -n 1)"; SOURCE="${SOURCE%/}"
      [ -d "$SOURCE" ] || SOURCE="$WORK"
      log "source: downloaded ($SOURCE)"
      ;;
    *) die "--source must be a directory, tarball file, or URL (got: $SOURCE)" ;;
  esac
fi

[ -f "$SOURCE/SKILL.md" ] && [ -f "$SOURCE/RUNTIME/VERSION" ] \
  || die "source at $SOURCE is not a DevOS checkout (SKILL.md + RUNTIME/VERSION missing)."
log "dist version: $(cat "$SOURCE/RUNTIME/VERSION")"

# --- plan --------------------------------------------------------------
EXTRA=""
[ "$WIRE_CLAUDE_MD" -eq 1 ] && EXTRA="$EXTRA --wire-claude-md"
[ "$WIRE_HOOKS" -eq 1 ] && EXTRA="$EXTRA --wire-hooks"
# shellcheck disable=SC2086
bun "$SOURCE/Tools/GlobalInstall.ts" --config-root "$CONFIG_ROOT" $EXTRA || die "dry-run failed — nothing was installed."

if [ "$APPLY" -eq 0 ]; then
  log ""
  log "dry run complete — nothing written. Re-run with --apply (add --yes to skip the prompt)."
  exit 0
fi

if [ "$YES" -eq 0 ] && [ -t 0 ]; then
  printf 'apply this plan to %s? [y/N] ' "$CONFIG_ROOT"
  read -r ans
  case "$ans" in
    [yY]|[yY][eE][sS]) ;;
    *) log "aborted — nothing written."; exit 0 ;;
  esac
elif [ "$YES" -eq 0 ]; then
  die "not a TTY and --yes not given — refusing to apply blind. Re-run with --yes."
fi

# shellcheck disable=SC2086
bun "$SOURCE/Tools/GlobalInstall.ts" --config-root "$CONFIG_ROOT" --apply $EXTRA || die "apply failed."
log ""
log "DevOS installed to $CONFIG_ROOT/DEVOS. Verify: bun $CONFIG_ROOT/DEVOS/Tools/Doctor.ts --target $CONFIG_ROOT"
