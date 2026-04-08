const { test, expect } = require("../../fixtures/fixtures.js");
const hlpPW = require("../../helpers/pw/helpers.js");
const hlpGitHub = require("../../helpers/github/helpers.js");
const dayjs = require("../../plugins/index.js");
test("after adding a comment via UI, it should be visible via API", async ({
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

  // 3. Add a comment via UI
  const suffix = await hlpPW.getRandomLetters(8);
  const commentText = `UI comment ${suffix}`;
  await page
    .getByPlaceholder("Use Markdown to format your comment")
    .fill(commentText);
  await Promise.all([
    hlpPW.waitForGraphQL(page, "addCommentMutation"),
    page.getByRole("button", { name: "Comment", exact: true }).click(),
  ]);

  // 4. Assert via API
  const comments = await hlpGitHub._getIssueComments(request, issue.number);
  expect(comments).toHaveLength(1);
  expect(comments[0].body).toBe(commentText);

  // 5. Cleanup
  await hlpGitHub._closeIssue(request, issue.number);
});

test("after adding a comment via API, edit it via UI and assert via API", async ({
  request,
  page,
  ids,
}) => {
  // 1. Create an issue via API
  const issue = await hlpGitHub._getIssueCreated(request);
  ids.set({ issue_number: issue.number });

  // 2. Add a comment via API
  const comment = await hlpGitHub._addIssueComment(
    request,
    issue.number,
    "Original comment",
  );

  // 3. Navigate to the issue
  const { owner, repo } = hlpGitHub.getRepoContext();
  await page.goto(`https://github.com/${owner}/${repo}/issues/${issue.number}`);

  // 4. Edit the comment via UI
  const suffix = await hlpPW.getRandomLetters(8);
  const newBody = `Updated comment ${suffix}`;
  const date = dayjs(comment.created_at).tz(dayjs.tz.guess()).format("h:mm A");

  await page
    .getByRole("button", {
      name: `Actions for ${owner}'s comment, ${date} today`,
    })
    .click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
  await page.getByLabel("Markdown value").fill(newBody);
  await Promise.all([
    hlpPW.waitForGraphQL(page, "updateIssueComment"),
    page.getByRole("button", { name: "Update comment" }).click(),
  ]);

  // 5. Assert via API
  const comments = await hlpGitHub._getIssueComments(request, issue.number);
  expect(comments).toHaveLength(1);
  expect(comments[0].body).toBe(newBody);

  // 6. Cleanup
  await hlpGitHub._closeIssue(request, issue.number);
});

test("after adding a comment via API, delete it via UI and assert via API", async ({
  request,
  page,
  ids,
}) => {
  // 1. Create an issue via API
  const issue = await hlpGitHub._getIssueCreated(request);
  ids.set({ issue_number: issue.number });

  // 2. Add a comment via API
  const comment = await hlpGitHub._addIssueComment(
    request,
    issue.number,
    "Comment to delete",
  );

  // 3. Navigate to the issue
  const { owner, repo } = hlpGitHub.getRepoContext();
  await page.goto(`https://github.com/${owner}/${repo}/issues/${issue.number}`);

  // 4. Delete the comment via UI
  const date = dayjs(comment.created_at).tz(dayjs.tz.guess()).format("h:mm A");
  await page
    .getByRole("button", {
      name: new RegExp(`Actions for ${owner}'s comment, ${date}(\\s+today)?`),
    })
    .click();
  await page.getByRole("menuitem", { name: "Delete" }).click();
  await Promise.all([
    hlpPW.waitForGraphQL(page, "deleteIssueComment"),
    page.getByRole("button", { name: "Delete", exact: true }).click(),
  ]);

  // 5. Assert via API
  await expect
    .poll(() =>
      hlpGitHub._getIssueComments(request, issue.number).then((c) => c.length),
    )
    .toBe(0);

  // 6. Cleanup
  await hlpGitHub._closeIssue(request, issue.number);
});
