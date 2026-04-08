const { test, expect } = require("../../fixtures/fixtures.js");
const hlpPW = require("../../helpers/pw/helpers.js");
const hlpGitHub = require("../../helpers/github/helpers.js");

test("after creating an issue via UI, it should be visible in the UI", async ({
  request,
  page,
  ids,
}) => {
  const { owner, repo } = hlpGitHub.getRepoContext();
  const suffix = await hlpPW.getRandomLetters(8);
  const title = `UI issue ${suffix}`;
  const body = `UI body ${suffix}`;

  // 1. Navigate to issues list and open the creation form
  await page.goto(`https://github.com/${owner}/${repo}/issues`);
  await Promise.all([
    hlpPW.waitForGraphQL(page, "CreateIssueDialogEntryQuery"),
    page.getByRole("link", { name: "New issue" }).click(),
  ]);

  // 2. Fill title and body
  await page.getByRole("textbox", { name: "Add a title" }).fill(title);
  await page.getByRole("textbox", { name: "Markdown value" }).fill(body);

  // 3. Submit the issue
  await Promise.all([
    hlpPW.waitForGraphQL(page, "createIssue"),
    page.getByTestId("create-issue-button").click(),
  ]);

  // 4. Extract issue number from the redirect URL
  await page.waitForURL(/\/issues\/\d+/);
  const issueNumber = page.url().match(/\/issues\/(\d+)/)[1];
  ids.set({ issue_number: issueNumber });

  // 5. Assert via API
  const issue = await hlpGitHub._getIssueData(request, issueNumber);
  expect(issue.title).toBe(title);
  expect(issue.body).toBe(body);
  expect(issue.state).toBe("open");

  // 6. Cleanup
  await hlpGitHub._closeIssue(request, issueNumber);
});

test("after creating an issue via API, edit it and assert via API", async ({
  request,
  page,
  ids,
}) => {
  // 1. Create an issue via API
  const issue = await hlpGitHub._getIssueCreated(request);
  ids.set({ issue_number: issue.number });

  // 2. Navigate to the issue
  const { owner, repo } = hlpGitHub.getRepoContext();
  await page.goto(`https://github.com/${owner}/${repo}/issues/${issue.number}`);

  const suffix = await hlpPW.getRandomLetters(8);
  const newTitle = `Updated title ${suffix}`;
  const newBody = `Updated body ${suffix}`;

  // 3. Edit the title
  await page.getByLabel("Edit issue title").filter({ visible: true }).click();
  await page.getByLabel("Title input").fill(newTitle);
  await Promise.all([
    hlpPW.waitForGraphQL(page, "updateIssue"),
    page.getByRole("button", { name: /^Save\b/ }).click(),
  ]);

  // 4. Edit the body
  await page.getByRole("button", { name: "Issue body actions" }).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Markdown value").fill(newBody);
  await Promise.all([
    hlpPW.waitForGraphQL(page, "updateIssue"),
    page.getByRole("button", { name: /^Save\b/ }).click(),
  ]);

  // 5. Assert via API
  const updated = await hlpGitHub._getIssueData(request, issue.number);
  expect(updated.title).toBe(newTitle);
  expect(updated.body).toBe(newBody);

  // 6. Cleanup
  await hlpGitHub._closeIssue(request, issue.number);
});

test("after creating an issue via API, close it and assert via API", async ({
  request,
  page,
  ids,
}) => {
  // 1. Create an issue via API
  const issue = await hlpGitHub._getIssueCreated(request);
  ids.set({ issue_number: issue.number });

  // 2. Navigate to the issue
  const { owner, repo } = hlpGitHub.getRepoContext();
  await page.goto(`https://github.com/${owner}/${repo}/issues/${issue.number}`);

  // 3. Close the issue via UI
  await Promise.all([
    hlpPW.waitForGraphQL(page, "updateIssueStateMutationCloseMutation"),
    page.getByRole("button", { name: "Close issue" }).click(),
  ]);

  // 4. Assert via API
  const closed = await hlpGitHub._getIssueData(request, issue.number);
  expect(closed.state).toBe("closed");
});
