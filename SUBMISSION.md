# Submission Notes

## What was delivered

**3 files produced** as required by the brief:

1. **`helpers/github/helpers.js`** — 7 API helper functions (all via `request`, no UI interaction):
   - `_getIssueCreated` / `_getIssueData` / `_updateIssue` / `_closeIssue` for issue CRUD
   - `_getIssueComments` / `_addIssueComment` for comments
   - `_getIssuePayload` for generating unique test data
   - Explicit error handling with status code and response body on every call

2. **`tests/github/issues_.spec.js`** — 3 tests:
   - Create an issue via UI, assert it exists via API (title, body, state)
   - Create via API, edit title + body via UI, assert updated values via API
   - Create via API, close via UI, assert `state === "closed"` via API

3. **`tests/github/issues_comments_.spec.js`** — 3 tests (mirrored pattern for comments):
   - Add a comment via UI, assert it exists via API
   - Add via API, edit via UI, assert updated body via API
   - Add via API, delete via UI, assert `comments.length === 0` via API

## Constraints checklist

| Constraint | Status |
|---|---|
| Flat `test()` blocks only — no `describe` / `beforeEach` / `afterEach` | Done |
| No Page Object Model | Done |
| API logic in `helpers/github/helpers.js`, not inline in specs | Done |
| `Promise.all([waitForResponse, action])` on every network-triggering UI action | Done |
| No `waitForTimeout()` | Done |
| Semantic locators (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByTestId`) | Done |
| Assertions via API, not via UI | Done |
| Cleanup (close issue) at the end of each test | Done |
| All values from environment variables — nothing hardcoded | Done |
| `ids` fixture used for failure debugging | Done |

## Assumptions

1. The GitHub UI session is set to English (button labels: "New issue", "Close issue", "Comment", etc.).
2. The `storageState` session belongs to the same user as the `GITHUB_TOKEN`.
3. The target repository has Issues enabled and is empty or nearly empty (no naming conflicts).

## Tradeoffs

- **Authentication**: used `storageState` (pre-authenticated browser session) rather than programmatic login — pragmatic and aligned with the brief's recommendation.
- **waitForResponse on `/_graphql`**: GitHub mutations go through GraphQL. Responses are filtered by operation name in `postData` (`createIssue`, `updateIssue`, `addCommentMutation`, etc.) for precise, race-free waiting.
- **Unique test data**: each test generates a random suffix via `hlpPW.getRandomLetters(8)` to guarantee isolation, even with parallel execution (`workers: 6`).
- **dayjs for comment editing**: the comment action button contains the creation timestamp, so `dayjs` is used to format the date in the local timezone and build the selector dynamically.

## What I would improve with more time

1. Make the comment action button selector more robust — the date format depends on browser timezone and locale, which could break in different environments.
2. Add a global teardown mechanism to close all open issues even if a test fails midway, preventing leftover state in the target repository.
3. Add edge-case tests (e.g. editing an issue with special characters in title/body, adding multiple comments then deleting a specific one).
