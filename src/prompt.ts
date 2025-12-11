import * as fs from 'fs'
import * as path from 'path'
import { Persona, PERSONA_PROMPTS, DEFAULT_PERSONA } from './config'

const CWD = process.cwd()
const PROMPT_FILE = path.join(CWD, 'prompt.txt')

// Global variable to store prompt from CLI
let CLI_PROMPT: string | null = null

export function setCliPrompt(prompt: string | null): void {
  CLI_PROMPT = prompt
}

export async function loadPromptTemplate(
  persona: Persona = DEFAULT_PERSONA
): Promise<string> {
  // Priority: CLI prompt (file/URL) > local prompt.txt > persona prompt

  if (CLI_PROMPT) {
    // Check if it's a URL
    if (CLI_PROMPT.startsWith('http://') || CLI_PROMPT.startsWith('https://')) {
      try {
        const response = await fetch(CLI_PROMPT)
        if (response.ok) {
          return await response.text()
        }
        console.error(`Warning: Failed to fetch prompt from URL: ${CLI_PROMPT}`)
      } catch (e) {
        console.error(
          `Warning: Error fetching prompt URL: ${(e as Error).message}`
        )
      }
    } else {
      // It's a file path
      const promptPath = path.resolve(CLI_PROMPT)
      if (fs.existsSync(promptPath)) {
        return fs.readFileSync(promptPath, 'utf-8')
      }
      console.error(`Warning: Prompt file not found: ${promptPath}`)
    }
  }

  // Local prompt.txt
  if (fs.existsSync(PROMPT_FILE)) {
    return fs.readFileSync(PROMPT_FILE, 'utf-8')
  }

  // Persona-based prompt
  return PERSONA_PROMPTS[persona]
}

export async function generatePrompt(
  commits: string,
  startDate: string,
  endDate: string,
  options: { persona?: Persona } = {}
): Promise<string> {
  const template = await loadPromptTemplate(options.persona)
  return template
    .replace(/\{\{startDate\}\}/g, startDate)
    .replace(/\{\{endDate\}\}/g, endDate)
    .replace(/\{\{commits\}\}/g, commits)
}
