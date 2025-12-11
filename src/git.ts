import { execSync } from 'child_process'

export function isGitRepo(repoPath: string): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', {
      stdio: 'pipe',
      cwd: repoPath
    })
    return true
  } catch {
    return false
  }
}

export function getGitUserName(repoPath: string): string {
  try {
    return execSync('git config user.name', {
      encoding: 'utf-8',
      cwd: repoPath
    }).trim()
  } catch {
    console.error(`Error: Unable to get git user name from ${repoPath}`)
    process.exit(1)
  }
}

export function getCommits(
  repoPath: string,
  author: string,
  since: string,
  until: string
): string {
  try {
    const cmd = `git log --author="${author}" --since="${since}" --until="${until}" --pretty=format:"%h - %s (%ai)" --date=short`
    return execSync(cmd, { encoding: 'utf-8', cwd: repoPath })
  } catch {
    return ''
  }
}
