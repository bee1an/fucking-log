import * as fs from 'fs'
import * as path from 'path'
import { parseArgs, printUsage } from './cli'
import {
  parseDate,
  formatDate,
  getDateRangeFromPeriod,
  inferPeriod
} from './date'
import { isGitRepo, getGitUserName, getCommits } from './git'
import { setCliPrompt, generatePrompt } from './prompt'
import { setCliApiKey, callGLM } from './api'
import { copyToClipboard } from './clipboard'
import { PERIOD_CONFIG, Period } from './config'

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2)
  const {
    copyFlag,
    helpFlag,
    repos,
    startDate: startDateStr,
    endDate: endDateStr,
    apiKey,
    prompt,
    period: periodArg,
    persona
  } = parseArgs(rawArgs)

  // Handle help
  if (helpFlag) {
    printUsage()
    process.exit(0)
  }

  // Set global variables from CLI
  if (apiKey) setCliApiKey(apiKey)
  if (prompt) setCliPrompt(prompt)

  let startDate: Date
  let endDate: Date
  let period: Period

  // Two modes: specific dates (priority) OR period mode
  if (startDateStr) {
    // Mode 1: Specific date range, period arg is ignored
    startDate = parseDate(startDateStr)
    endDate = endDateStr ? parseDate(endDateStr) : new Date()
    endDate.setDate(endDate.getDate() + 1)

    // Infer period from actual days
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    period = inferPeriod(days)
  } else {
    // Mode 2: Period mode, default to 'quarter' if not specified
    period = periodArg || 'quarter'
    const range = getDateRangeFromPeriod(period)
    startDate = range.startDate
    endDate = range.endDate
    endDate.setDate(endDate.getDate() + 1)
  }

  // Determine repository paths
  let repoPaths: string[]

  if (repos.length > 0) {
    // User specified repos, validate them
    repoPaths = repos
    for (const repoPath of repoPaths) {
      if (!isGitRepo(repoPath)) {
        console.error(`Error: ${repoPath} is not a git repository`)
        process.exit(1)
      }
    }
  } else {
    // No repos specified, try current directory
    const cwd = process.cwd()
    if (isGitRepo(cwd)) {
      repoPaths = [cwd]
    } else {
      // Current dir is not a git repo, scan one level of subdirectories
      console.log(
        '📂 Current directory is not a git repository, scanning subdirectories...'
      )
      const entries = fs.readdirSync(cwd, { withFileTypes: true })
      repoPaths = entries
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => path.join(cwd, entry.name))
        .filter((subPath) => isGitRepo(subPath))

      if (repoPaths.length === 0) {
        console.error(
          'Error: No git repositories found in current directory or subdirectories'
        )
        process.exit(1)
      }
      console.log(`Found ${repoPaths.length} git repositories`)
    }
  }

  // Format dates
  const sinceStr = formatDate(startDate)
  const untilStr = formatDate(endDate)
  const displayEndDate = formatDate(new Date(endDate.getTime() - 86400000))

  console.log(`\nDate range: ${sinceStr} to ${displayEndDate}`)
  console.log(`Period: ${period}`)
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
      // Display max 5 commits, show ellipsis for the rest
      const MAX_DISPLAY = 5
      const displayLines = commitLines.slice(0, MAX_DISPLAY)
      console.log(displayLines.join('\n'))
      if (commitLines.length > MAX_DISPLAY) {
        console.log(`... and ${commitLines.length - MAX_DISPLAY} more commits`)
      }

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
    displayEndDate,
    { persona }
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
