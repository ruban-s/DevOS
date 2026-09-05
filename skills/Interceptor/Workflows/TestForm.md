# TestForm Workflow

Map, fill, post, and prove a form on any page. Semantic element search finds fields by role and name, test data fills them, posting follows, the aftermath gets checked.

## Suits

- Signup, login, or contact forms post-change
- Validation conduct (requiredness, email shape, etc.)
- Post targets reaching the right API route
- Authed-page forms beyond agent-browser reach

## Run

### 0. Isolation preflight (MANDATORY opener)

```bash
source DEVOS/PROFILE/CUSTOMIZATIONS/SKILLS/Interceptor/preferences.env
bash DEVOS/skills/Interceptor/Tools/PreflightIsolation.sh
```

Prefer `bash DEVOS/skills/Interceptor/Tools/EnsureTestProfile.sh` — same gate plus self-open of a shut test profile (exit 5/6), proceeding solely past the pinned-UUID match. Non-zero → STOP, relay the message exactly; never sink to Default. `INTERCEPTOR_TEST_CONTEXT_ID` is the pinned isolated context; each browser verb below carries it. Isolated testing keeps trial posts clear of genuine auth state in the main session. Captures travel `Tools/Capture.sh`, never bare `interceptor screenshot`.

### 1. Open the form page (isolated profile)

```bash
interceptor open "<PAGE_URL>" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 2. Map the fields

Search inputs by role:

```bash
interceptor find "" --role textbox --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor find "" --role combobox --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor find "" --role checkbox --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Or lift the whole tree and pick form nodes:

```bash
interceptor tree --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Roles to hunt: `textbox`, `combobox`, `checkbox`, `radio`, `spinbutton`, `slider`, `switch`.

### 3. Fill the fields

Drive each by semantic selector or ref:

```bash
# By semantic selector (preferred — outlasts DOM churn)
interceptor type "textbox:Email" "test@example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor type "textbox:Name" "Test User" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor select "combobox:Country" "United States" --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# By element ref (from tree output)
interceptor act e5 "test@example.com" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor act e8 "Test User" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Boxes and radios:

```bash
interceptor click "checkbox:Terms and Conditions" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor click "radio:Monthly Plan" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 4. Eyeball pre-post state

Ahead of posting, prove the form reads right:

```bash
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

Read the printed frame path confirming populated fields and zero stray validation flags. `Capture.sh --current` shoots the already-open page in the pinned context.

### 5. Post the form

```bash
interceptor click "button:Submit" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor wait-stable --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

Or keyboard:

```bash
interceptor keys "Enter" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor wait-stable --context "$INTERCEPTOR_TEST_CONTEXT_ID"
```

### 6. Prove the aftermath

Check what posting wrought:

```bash
# Page prose for success/error marks
interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# Network for the API move
interceptor net log --json --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# Result page frame
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

Hunt:
- Success confirmation or redirect
- The owed endpoint with the owed method (POST/PUT)
- Answer status (200/201 for wins)
- Error prose or validation flags

### 7. Edge inputs (as needed)

For deeper passes, repeat on hostile inputs:

```bash
# Hollow required fields — post unfilled
interceptor click "button:Submit" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"  # Hunt validation marks

# Malformed email
interceptor type "textbox:Email" "not-an-email" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor click "button:Submit" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
interceptor read --text-only --context "$INTERCEPTOR_TEST_CONTEXT_ID"

# Oversized input
interceptor type "textbox:Name" "A very long name that might break layout assumptions in the form" --context "$INTERCEPTOR_TEST_CONTEXT_ID"
bash DEVOS/skills/Interceptor/Tools/Capture.sh --current
```

## Notes

- Semantic selectors (`"textbox:Email"`) key accessible role + name. Nameless fields answer solely to ref IDs — weigh fixing the accessibility.
- `interceptor type` wipes before writing. Append via `interceptor type <ref> "text" --append`.
- Dropdowns/selects want `interceptor select <ref> "value"`, never click-chains.
- The network log holds the genuine post the form fired — proving endpoint and payload shape.
- Scenarios closed and exhibits banked, run `bash DEVOS/skills/Interceptor/Tools/CleanupTabs.sh` shutting the test tabs this run opened.
- Password fields want `interceptor act <ref> "value" --trusted` for OS-grade HID-sourced input (once `--os`, now deprecated alias). Slips past autocomplete sniffing on `isTrusted`-checking sites.
