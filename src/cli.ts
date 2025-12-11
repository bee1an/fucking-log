import * as path from 'path'

export interface ParsedArgs {
  copyFlag: boolean
  helpFlag: boolean
  repos: string[]
  startDate: string | null
  endDate: string | null
  apiKey: string | null
  prompt: string | null
}

export function parseArgs(rawArgs: string[]): ParsedArgs {
  const result: ParsedArgs = {
    copyFlag: false,
    helpFlag: false,
    repos: [],
    startDate: null,
    endDate: null,
    apiKey: null,
    prompt: null
  }

  let i = 0
  while (i < rawArgs.length) {
    const arg = rawArgs[i]

    if (arg === '--help' || arg === '-h') {
      result.helpFlag = true
    } else if (arg === '--copy' || arg === '-c') {
      result.copyFlag = true
    } else if (arg === '--repo' || arg === '-r') {
      i++
      if (i < rawArgs.length) {
        result.repos.push(path.resolve(rawArgs[i]))
      }
    } else if (arg === '--key' || arg === '-k') {
      i++
      if (i < rawArgs.length) {
        result.apiKey = rawArgs[i]
      }
    } else if (arg === '--prompt' || arg === '-p') {
      i++
      if (i < rawArgs.length) {
        result.prompt = rawArgs[i]
      }
    } else if (!result.startDate) {
      result.startDate = arg
    } else if (!result.endDate) {
      result.endDate = arg
    }
    i++
  }

  return result
}

export function printUsage(): void {
  console.log(`
fucking-log - Git commit to quarterly report generator

Usage: fucking-log <start-date> [end-date] [options]

Options:
  -c, --copy              Copy prompt to clipboard only (skip AI generation)
  -r, --repo <path>       Specify repository path (can be used multiple times)
  -k, --key <apikey>      Specify GLM API key directly
  -p, --prompt <path|url> Specify custom prompt template (file path or URL)
  -h, --help              Show this help message

Examples:
  fucking-log 2024-10-01 2024-12-31
  fucking-log 10-01 12-31
  fucking-log 10-01 --prompt ./my-prompt.txt
  fucking-log 10-01 --prompt https://example.com/prompt.txt
  fucking-log 10-01 -r /path/to/repo1 -r /path/to/repo2

Remote Usage:
  curl -s https://your-app.vercel.app/fucking-log.js | node - 10-01

API Key Priority: --key > GLM_API_KEY env > embedded default
`)
}
