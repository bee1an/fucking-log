import { execSync } from 'child_process'

export function copyToClipboard(text: string): boolean {
  try {
    const platform = process.platform
    if (platform === 'darwin') {
      execSync('pbcopy', { input: text, encoding: 'utf-8' })
    } else if (platform === 'win32') {
      execSync('clip', { input: text, encoding: 'utf-8' })
    } else {
      try {
        execSync('xclip -selection clipboard', {
          input: text,
          encoding: 'utf-8'
        })
      } catch {
        execSync('xsel --clipboard --input', { input: text, encoding: 'utf-8' })
      }
    }
    return true
  } catch {
    return false
  }
}
