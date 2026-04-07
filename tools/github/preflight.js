const { loadEnvFiles, getRepoContext, githubRequest, printHeading } = require('./shared.js')

const assert = (condition, message) => {
  if (!condition) throw new Error(message)
}

const main = async () => {
  loadEnvFiles()

  const { owner, repo } = getRepoContext()
  const stamp = Date.now()
  const issueTitle = `preflight issue ${stamp}`
  const updatedTitle = `preflight issue updated ${stamp}`
  const updatedBody = `preflight body updated ${stamp}`
  const commentBody = `preflight comment ${stamp}`

  printHeading('Repository checks')
  const repository = await githubRequest(`/repos/${owner}/${repo}`)
  assert(repository.has_issues, 'Configured temporary repository does not have Issues enabled')
  console.log(`Repository: ${repository.full_name}`)

  printHeading('Create issue')
  const issue = await githubRequest(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: {
      title: issueTitle,
      body: 'preflight body',
    },
  })
  console.log(`Created issue #${issue.number}`)

  try {
    printHeading('Update issue')
    const updatedIssue = await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}`, {
      method: 'PATCH',
      body: {
        title: updatedTitle,
        body: updatedBody,
      },
    })
    assert(updatedIssue.title === updatedTitle, 'Updated issue title does not match expected value')

    printHeading('Add comment')
    const comment = await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}/comments`, {
      method: 'POST',
      body: { body: commentBody },
    })
    assert(comment.body === commentBody, 'Created comment body does not match expected value')

    printHeading('Read issue and comments')
    const fetchedIssue = await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}`)
    const comments = await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}/comments`)
    assert(fetchedIssue.body === updatedBody, 'Fetched issue body does not match expected value')
    assert(comments.some(item => item.body === commentBody), 'Expected comment not found on the issue')

    printHeading('Close issue')
    const closedIssue = await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}`, {
      method: 'PATCH',
      body: { state: 'closed' },
    })
    assert(closedIssue.state === 'closed', 'Issue did not close successfully')

    console.log('\nPreflight passed successfully.')
  } finally {
    await githubRequest(`/repos/${owner}/${repo}/issues/${issue.number}`, {
      method: 'PATCH',
      body: { state: 'closed' },
    }).catch(() => {})
  }
}

main().catch(error => {
  console.error(`\nPreflight failed: ${error.message}`)
  process.exitCode = 1
})