const { loadEnvFiles, getRepoContext, githubRequest, printHeading } = require('./shared.js')

const main = async () => {
  loadEnvFiles()

  const { owner, repo } = getRepoContext()

  printHeading('Authenticated user')
  const user = await githubRequest('/user')
  console.log(`login: ${user.login}`)
  console.log(`html_url: ${user.html_url}`)

  printHeading('Repository')
  const repository = await githubRequest(`/repos/${owner}/${repo}`)
  console.log(`full_name: ${repository.full_name}`)
  console.log(`private: ${repository.private}`)
  console.log(`has_issues: ${repository.has_issues}`)
  console.log(`issues_url: https://github.com/${owner}/${repo}/issues`)

  if (!repository.has_issues) throw new Error('Issues are disabled on the configured temporary repository')
}

main().catch(error => {
  console.error(`\nDiscovery failed: ${error.message}`)
  process.exitCode = 1
})