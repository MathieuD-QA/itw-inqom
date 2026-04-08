/**
 * pw helpers — low-level Playwright utilities.
 * Import: const hlpPW = require('../../helpers/pw/helpers.js')
 */

const getRandomLetters = async (length) => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'
  let result = ''
  while (result.length < length) result += chars[Math.floor(Math.random() * chars.length)]
  return result
}

const getRandomNumber = async (min, max, decimal = 0) => {
  const raw = Math.random() * (max - min) + min
  const factor = 10 ** decimal
  return Math.round(raw * factor) / factor
}

/**
 * Returns a predicate for page.waitForResponse that matches a GitHub GraphQL
 * response whose request postData contains the given operation name.
 * If operationName is in the URL query-string instead (e.g. GET requests),
 * it checks response.url() as a fallback.
 */
const waitForGraphQL = (page, operationName) =>
  page.waitForResponse((response) => {
    if (!response.url().includes('/_graphql') || response.status() !== 200)
      return false
    if (response.url().includes(operationName)) return true
    const postData = response.request().postData() || ''
    return postData.includes(operationName)
  })

module.exports = {
  getRandomLetters,
  getRandomNumber,
  waitForGraphQL,
}
