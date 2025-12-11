import * as path from 'path'
import { parseArgs, printUsage } from './cli'
import { parseDate, formatDate } from './date'
import { isGitRepo, getGitUserName, getCommits } from './git'
import { setCliPrompt, generatePrompt } from './prompt'
import { setCliApiKey, callGLM } from './api'
import { copyToClipboard } from './clipboard'

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2)
  const {
    copyFlag,
    helpFlag,
    repos,
    startDate: startDateStr,
    endDate: endDateStr,
    apiKey,
    prompt
  } = parseArgs(rawArgs)

  // Handle help
  if (helpFlag) {
    printUsage()
    process.exit(0)
  }

  // Set global variables from CLI
  if (apiKey) setCliApiKey(apiKey)
  if (prompt) setCliPrompt(prompt)

  if (!startDateStr) {
    printUsage()
    process.exit(1)
  }

  // Parse dates
  const startDate = parseDate(startDateStr)
  const endDate = endDateStr ? parseDate(endDateStr) : new Date()
  endDate.setDate(endDate.getDate() + 1)

  // If no repos specified, use current directory
  const repoPaths = repos.length > 0 ? repos : [process.cwd()]

  // Validate all repos
  for (const repoPath of repoPaths) {
    if (!isGitRepo(repoPath)) {
      console.error(`Error: ${repoPath} is not a git repository`)
      process.exit(1)
    }
  }

  // Format dates
  const sinceStr = formatDate(startDate)
  const untilStr = formatDate(endDate)
  const displayEndDate = formatDate(new Date(endDate.getTime() - 86400000))

  console.log(`\nDate range: ${sinceStr} to ${displayEndDate}`)
  console.log(`Repositories: ${repoPaths.length}`)
  console.log('─'.repeat(60))

  // Collect all commits from all repos
  const allCommits: string[] = []
  let totalCount = 0

  for (const repoPath of repoPaths) {
    const userName = getGitUserName(repoPath)
    const repoName = path.basename(repoPath)
    const commits = getCommits(repoPath, userName, sinceStr, untilStr)

    if (commits.trim()) {
      const commitLines = commits.split('\n').filter(Boolean)
      totalCount += commitLines.length

      console.log(
        `\n📁 ${repoName} (${commitLines.length} commits, author: ${userName})`
      )
      console.log(commits)

      allCommits.push(`[${repoName}]\n${commits}`)
    } else {
      console.log(`\n📁 ${repoName}: No commits found`)
    }
  }

  console.log('\n' + '─'.repeat(60))
  console.log(`Total commits: ${totalCount}`)

  if (totalCount === 0) {
    console.log('\n⚠️ No commits found')
    return
  }

  const combinedCommits = allCommits.join('\n\n')
  const promptText = await generatePrompt(
    combinedCommits,
    sinceStr,
    displayEndDate
  )

  // Copy prompt to clipboard only (skip AI generation)
  if (copyFlag) {
    if (copyToClipboard(promptText)) {
      console.log('\n✅ Prompt with commits copied to clipboard!')
    } else {
      console.error('\n❌ Failed to copy to clipboard')
    }
    return
  }

  // Default: Generate report using AI
  const report = await callGLM(promptText)
  console.log('\n' + '═'.repeat(60))
  console.log('📝 Generated Report:')
  console.log('═'.repeat(60))
  console.log(report)
  console.log('═'.repeat(60))

  // Also copy the report to clipboard
  if (copyToClipboard(report)) {
    console.log('\n✅ Report copied to clipboard!')
  }
}

main().catch((err) => {
  console.error('Error:', err.message)
  process.exit(1)
})
