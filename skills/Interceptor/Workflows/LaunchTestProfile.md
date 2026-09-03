# LaunchTestProfile

Raise Chrome's dedicated non-default profile in its own window for Interceptor live runs. Same Chrome install, same root certs, **separate cookie jar / separate tabs / separate window**. The profile carries the operator's logins so signed-in tooling tests run — while living in a wholly different window from Default-profile work.

## Suits

- Any live run touching a page (VerifyDeploy, Reproduce, TestForm, ReadAndExtract, RecordFlow, MultiPageCompare, OverrideXhr).
- Default posture for everything agents do in browsers.
- Especially signed-in targets (blog admin, Cloudflare dashboard, Gmail, GitHub, admin dashboards, etc.) — the reason this is NOT a `--user-data-dir` sandbox.

## Why profiles beat sandboxes

A `--user-data-dir=<fresh>` sandbox is a login-less Chrome — a useless tester against the operator's signed-in services. Correct fencing is **a sibling Chrome profile inside the same user-data-dir**: own cookies, own tabs, own window, with the operator signing it into their accounts once so sessions endure.

## One-time build (operator moves)

### 1. Mint the test profile in Chrome

In the main Chrome window:

1. Hit the **avatar/profile picture top-right**.
2. Choose **"Add"** (or **"+ Add Profile"** by version).
3. Pick **"Sign in"** (advised — bookmarks/extensions follow) or **"Continue without an account"**.
4. Title it plainly: `DevOS`, `Interceptor-Test`, or similar.
5. Set an avatar so the window reads distinct from Default.

Chrome mints a profile folder inside the live user-data-dir, usually `Profile 1` (`Profile 2` when taken). Confirm the on-disk name in `~/Library/Application Support/Google/Chrome/Local State` under `profile.info_cache` — each entry's key is its folder name.

### 2. Sign the profile into operator accounts

Inside the fresh window:

- Google via the operator's account (or a delegated account reaching the test targets).
- Sibling services agents will check: GitHub, Cloudflare, Substack, Beehiiv, blog admin, admin dashboards, etc.
- 2FA each once — sessions then persist in this profile.

This is the **single auth tax**. Afterwards agent testing matches Default-profile reach with zero tabs there.

### 3. Seat the Interceptor extension in this profile

Inside the fresh window:

1. Open `chrome://extensions`.
2. Flip **Developer mode** on (top-right).
3. Hit **Load unpacked**.
4. Pick `DEVOS/skills/Interceptor/Extension` — a **pinned copy** (not a symlink) of upstream `extension/dist`, minted by `Tools/Pin.sh`; lineage in `Extension/PINNED_FROM.txt`. Chrome sheds unpacked extensions per manifest bump, so re-pin and reload past every binary upgrade — the copy never trails upstream alone.
5. Confirm the Interceptor card shows in this profile.

The deterministic extension `key` keeps the extension ID equal to Default's — expected; the daemon allowlist already carries it.

### 4. Name the context

Hit the Interceptor toolbar icon in the fresh window. Assign **Context ID**:

```
interceptor-test
```

Save. The daemon now answers that link as `interceptor-test`, and `--context interceptor-test` verbs land in this window.

### 5. Atypical profile folders

When Chrome minted a different folder, record it in `preferences.env` — the lone canonical seat. Never `~/.zshrc` (a second unsynced truth the opener and gate can dispute):

```bash
# Edit DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env:
#   export INTERCEPTOR_TEST_CHROME_PROFILE="Profile 4"   # whichever folder Chrome minted
```

One-off override inline (keeping `preferences.env` authoritative for daily runs):

```bash
INTERCEPTOR_TEST_CHROME_PROFILE="Profile 4" bash DEVOS/skills/Interceptor/Tools/LaunchTestProfile.sh
```

### 6. Prove it (through the canonical gate)

One proving move exists — the **Preflight Isolation Gate**. It settles binary vintage, daemon linkage, and context registration together — everything that could spill a browser verb into Default.

```bash
bash DEVOS/skills/Interceptor/Tools/LaunchTestProfile.sh "https://example.com"
# A fresh Chrome window for the test profile opens onto example.com.

bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
# Expect:
#   [PreflightIsolation] OK — interceptor 0.16.9, context "<pinned-id>" connected.
```

On gate failure, obey the structured fix note it prints (extension unloaded, context unnamed, binary aged, daemon unlinked). No live browser verbs until exit 0.

```bash
# Solely past the gate (source preferences.env so $INTERCEPTOR_TEST_CONTEXT_ID resolves):
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
interceptor open "https://example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
# Lands in the test window only.
```

## Daily rhythm

Post-setup, each session opens with the gate. It fronts the first browser-touching move — casual public reads, signed-in checks, captures, everything.

```bash
# Operator raises the test window once per session (or leaves it standing)
bash DEVOS/skills/Interceptor/Tools/LaunchTestProfile.sh

# Agent's opener ahead of any browser verb:
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh \
  || { echo "Preflight failed — STOP and surface to operator. Do not fall back."; exit 1; }

# Solely past exit 0 (preferences.env sourced for $INTERCEPTOR_TEST_CONTEXT_ID):
interceptor open "https://example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor read --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor act e5 --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor inspect --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

The opener calls `open -a` (no `-n`), deferring to the live Chrome process. Chrome raises a fresh window for the named profile.

## Agent-side standing orders

With the test profile built and pinned:

- **Live runs default to `--context "$INTERCEPTOR_TEST_CONTEXT_ID"`.** Each `open`, `read`, `act`, `inspect`, `monitor start`, `tab new`, `navigate`. Captures travel `Tools/Capture.sh`. The pin lives in `preferences.env`; the bare `interceptor-test` friendly name resolves solely post-popup-assignment.
- **Default stays read-only.** No tabs, clicks, types, navigations, or recordings there without explicit operator invitation ("verify in my Default profile", "use the main window").
- **Unlinked pin halts.** Test window shut, UUID rot — surface the preflight fix and stop; never slide silently to Default. A missing pin is a halt, not a fallback.
- **Multi-context backstop.** At 2+ linked contexts, bare verbs (no `--context`) die loud. That fail-fast is scaffolding, not the primary guard — the primary guard is pinning `--context` per verb. At one surviving context, bare verbs quietly land on whatever remains, Default included — hence `--context` mandatory, never optional.

## Traps

- **No `--user-data-dir` here.** Fully-sandboxed Chrome carries zero auth — worthless against the operator's signed-in tooling. Fence by profile, not user-data-dir.
- **Post-bump extension reload.** The `DEVOS/skills/Interceptor/Extension/` twin is pinned, not symlinked — past each binary upgrade re-pin via `Tools/Pin.sh` (Update workflow), then Load Unpacked again in **both** profiles (Default + test). Chrome sheds unpacked extensions per manifest bump and never self-refreshes.
- **Unique context names.** Twin `interceptor-test` contexts make `--context` routing ambiguous. One test profile per context name.
- **Folder-name vs display-name.** Chrome folders read `Profile 1`, `Profile 2`, … whatever display name like "DevOS" you assigned. The opener wants the on-disk name (stock `Profile 1`); override through `INTERCEPTOR_TEST_CHROME_PROFILE` as needed.
- **Never force `-n`.** A second Chrome process can't share one user-data-dir (lock fight). The opener leans on the live Chrome honoring `--profile-directory` natively.
- **Cookie decay.** Re-sign periodically. A 401/302-to-login mid-run means re-auth in the test profile, then onward.

## Answer shape

Report:
- Whether the test window rose (PID, profile folder)
- Whether `interceptor contexts` lists `interceptor-test`
- Whether the first `open --context interceptor-test` returned tree + prose
- On failure: the exact mode (profile unbuilt, extension unloaded, context unnamed, daemon blind)
