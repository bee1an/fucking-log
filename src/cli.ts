import * as path from 'path'
import { Period, Persona, DEFAULT_PERSONA } from './config'

export interface ParsedArgs {
  copyFlag: boolean
  helpFlag: boolean
  repos: string[]
  startDate: string | null
  endDate: string | null
  apiKey: string | null
  prompt: string | null
  period: Period | null
  minWords: number | null
  maxWords: number | null
  persona: Persona
}

const VALID_PERIODS: Period[] = ['day', 'week', 'month', 'quarter', 'year']
const VALID_PERSONAS: Persona[] = [
  'formal',
  'chill',
  'meme',
  'brief',
  'tech',
  'grind',
  'slack',
  'poet',
  'edgy',
  'legacy'
]

export function parseArgs(rawArgs: string[]): ParsedArgs {
  const result: ParsedArgs = {
    copyFlag: false,
    helpFlag: false,
    repos: [],
    startDate: null,
    endDate: null,
    apiKey: null,
    prompt: null,
    period: null,
    minWords: null,
    maxWords: null,
    persona: DEFAULT_PERSONA
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
    } else if (arg.startsWith('--period=')) {
      const value = arg.split('=')[1] as Period
      if (VALID_PERIODS.includes(value)) {
        result.period = value
      } else {
        console.error(
          `Error: Invalid period "${value}". Valid: ${VALID_PERIODS.join(', ')}`
        )
        process.exit(1)
      }
    } else if (arg.startsWith('--min-words=')) {
      result.minWords = parseInt(arg.split('=')[1], 10)
    } else if (arg.startsWith('--max-words=')) {
      result.maxWords = parseInt(arg.split('=')[1], 10)
    } else if (arg.startsWith('--persona=')) {
      const value = arg.split('=')[1] as Persona
      if (VALID_PERSONAS.includes(value)) {
        result.persona = value
      } else {
        console.error(
          `Error: Invalid persona "${value}". Valid: ${VALID_PERSONAS.join(
            ', '
          )}`
        )
        process.exit(1)
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

Usage:
  fucking-log <start-date> [end-date] [options]    # Specific date range
  fucking-log --period=<period> [options]          # Period mode

Periods: day, week, month, quarter, year

Options:
  -c, --copy              Copy prompt to clipboard only (skip AI generation)
  -r, --repo <path>       Specify repository path (can be used multiple times)
  -k, --key <apikey>      Specify GLM API key directly
  -p, --prompt <path|url> Specify custom prompt template (file path or URL)
  -h, --help              Show this help message
  --period=<period>       Use period mode (day/week/month/quarter/year)
  --min-words=<n>         Set minimum word count (overrides period default)
  --max-words=<n>         Set maximum word count (overrides period default)
  --persona=<persona>     Set writing style (default: tech)

Personas:
  formal - Professional, suitable for reports to management
  chill  - Casual, like chatting with colleagues
  meme   - Full of internet memes and emojis
  brief  - Minimal, just the essentials
  tech   - Technical details focused (default)
  grind  - Emphasizes hard work and dedication
  slack  - Understates everything, sounds effortless
  poet   - Artistic and poetic descriptions
  edgy   - Chuunibyou style, dramatic and dark
  legacy - Classical Chinese style

Examples:
  fucking-log 2024-10-01 2024-12-31
  fucking-log 10-01 12-31
  fucking-log --period=week
  fucking-log --period=quarter -r /path/to/repo
  fucking-log 10-01 --prompt ./my-prompt.txt

Remote Usage:
  curl -s https://your-app.vercel.app/index.js | node - --period=week

API Key Priority: --key > GLM_API_KEY env > embedded default
`)
}
