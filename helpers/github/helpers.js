const hlpPW = require("../pw/helpers.js");
const { loadEnvFiles } = require("../../tools/github/shared.js");

loadEnvFiles();

// These helpers intentionally target the candidate's own temporary GitHub repository.
const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) throw new Error(`Missing required env var: ${name}`);

  return value;
};

const getRepoContext = () => ({
  owner: getRequiredEnv("GITHUB_OWNER"),
  repo: getRequiredEnv("GITHUB_REPO"),
});

const getAuthHeaders = () => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${getRequiredEnv("GITHUB_TOKEN")}`,
  "X-GitHub-Api-Version": "2026-03-10",
});

const _getIssuePayload = async (data = {}) => {
  const suffix = await hlpPW.getRandomLetters(8);

  return {
    title: data.title || `Playwright issue ${suffix}`,
    body: data.body || `Playwright body ${suffix}`,
  };
};

const _getIssueCreated = async (request, data = {}) => {
  const { owner, repo } = getRepoContext();
  const payload = await _getIssuePayload(data);
  const response = await request.post(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      headers: getAuthHeaders(),
      data: payload,
    },
  );
  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to create issue: ${response.status()} ${response.statusText()} at ${response.url()}\n${errorBody}`,
    );
  }
  return await response.json();
};

const _getIssueData = async (request, issueNumber) => {
  const { owner, repo } = getRepoContext();
  const response = await request.get(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to get issue: ${response.status()} ${response.statusText()} at ${response.url()}\n${errorBody}`,
    );
  }
  return await response.json();
};

const _updateIssue = async (request, issueNumber, data) => {
  const { owner, repo } = getRepoContext();

  const response = await request.patch(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`,
    {
      headers: getAuthHeaders(),
      data,
    },
  );

  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to update issue: ${response.status()} ${response.statusText()} at ${response.url()}\n${errorBody}`,
    );
  }
  return await response.json();
};

const _getIssueComments = async (request, issueNumber) => {
  const { owner, repo } = getRepoContext();
  const response = await request.get(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      headers: getAuthHeaders(),
    },
  );
  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to get comments: ${response.status()} ${response.statusText()} at ${response.url()}\n${errorBody}`,
    );
  }
  return await response.json();
};

const _addIssueComment = async (request, issueNumber, body) => {
  const { owner, repo } = getRepoContext();
  const response = await request.post(
    `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments`,
    {
      headers: getAuthHeaders(),
      data: { body },
    },
  );
  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to add comment: ${response.status()} ${response.statusText()} at ${response.url()}\n${errorBody}`,
    );
  }
  return await response.json();
};

const _closeIssue = async (request, issueNumber) => {
  return await _updateIssue(request, issueNumber, {
    state: "closed",
    state_reason: "completed",
  });
};

module.exports = {
  getRequiredEnv,
  getRepoContext,
  getAuthHeaders,
  _getIssuePayload,
  _getIssueCreated,
  _getIssueData,
  _updateIssue,
  _getIssueComments,
  _addIssueComment,
  _closeIssue,
};
