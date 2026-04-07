# Candidate Brief — Playwright E2E Exercise

## Goal

Build a small, reliable end-to-end test suite against a real public product: [GitHub](https://github.com).

The objective is not to cover the entire product. The objective is to show sound engineering judgment in how you structure tests, create state, interact with the UI, and verify persisted behavior.

## Product Under Test

| Surface | URL |
|---|---|
| UI | https://github.com |
| API | https://api.github.com |
| API docs | https://docs.github.com/en/rest/issues/issues |

## Assignment

Implement a GitHub issue lifecycle flow.

Expected deliverables:

1. `helpers/github/helpers.js`
2. `tests/github/issues_.spec.js`
3. `tests/github/issues_comments_.spec.js`

## Required Flows

### `issues_.spec.js`

**1. after creating an issue via UI, it should be visible in the UI**

1. Create a unique issue through the GitHub UI.
2. Assert it appears in the repository issues list via the API.

**2. after creating an issue via API, edit it and assert via API**

1. Create a unique issue via the API.
2. Open the issue in the UI and edit the title and body.
3. Assert the updated title and body via the API.

**3. after creating an issue via API, close it and assert via API**

1. Create a unique issue via the API.
2. Open the issue in the UI and close it.
3. Assert the issue state is `closed` via the API.

### `issues_comments_.spec.js`

Apply the same test structure pattern to GitHub issue comments.
The spec file contains a hint. Figure out the right flows from there.

## Candidate Setup

**Clone or fork this repository first. Then set up your own GitHub target before writing any tests.**

You must create or provide:

1. A temporary GitHub repository that you own and control.
2. Issues enabled on that repository.
3. A fine-grained personal access token scoped only to that repository with Issues read/write permissions.
4. A copy of `.env.example` renamed to `.env` with your own values filled in.
5. Optionally, a Playwright `storageState` file for your authenticated GitHub browser session.

Run `npm run github:preflight` before writing any test. If it fails, fix your setup first.

> **The solution will be reviewed by cloning your fork and running it with a different `.env` pointing to a separate GitHub repository and a different GitHub account. If the tests only work with your specific token, your specific repo name, or any hardcoded value, the solution fails. Every credential and every repository reference must come exclusively from environment variables.**

## Constraints

These constraints are intentional. Review will focus on whether you respected them.

1. Use flat top-level `test()` blocks only.
2. Do not use `describe()`, `beforeEach()`, or `afterEach()`.
3. Do not introduce a Page Object Model.
4. Put API logic in `helpers/github/helpers.js`, not inline in spec files.
5. Pair every network-triggering UI action with `Promise.all([waitForResponse, action])`.
6. Do not use `waitForTimeout()`.
7. Prefer semantic locators such as `getByRole`, `getByLabel`, and `getByPlaceholder`.
8. Use API assertions as the primary correctness check.
9. Do not spend time overengineering authentication if you can use a valid local storage state.

## What Good Looks Like

We are looking for clear priorities:

1. State is created through the API where appropriate.
2. UI is used for the user-critical behavior being tested.
3. Assertions verify persisted backend state, not only visible text.
4. Test data is unique and isolated.
5. Failures are easy to debug.
6. The implementation avoids brittle interaction patterns when a simpler one exists.

## Time Estimate

A strong candidate typically completes this exercise in 2 to 3 hours. This is provided as an orientating reference only — there is no deadline and no time constraint. Take the time you need to deliver a solution you are proud of.

Keep setup overhead bounded. The exercise is not intended to test GitHub administration depth beyond creating a temporary repo, a scoped token, and optionally a browser storage state.

## Submission Notes

Include a short note in your submission covering:

1. Assumptions you made.
2. Tradeoffs you chose.
3. What you would improve with another hour.

## Evaluation

Review will focus on:

1. Test architecture and discipline.
2. Async correctness and absence of race conditions.
3. Locator quality.
4. Separation of API helper logic from spec logic.
5. Quality of assertions.
6. Overall reliability and readability.

## Notes

This exercise is intentionally scoped so a strong candidate can complete it in 2 to 3 hours using only:

1. Issue creation through the GitHub API.
2. Issue editing, commenting, and closing through the GitHub UI.
3. Issue verification through GitHub issue and comment endpoints.

It does not require pull requests, projects, code review, Actions, or advanced GitHub administration.