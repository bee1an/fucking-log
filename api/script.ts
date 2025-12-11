import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as fs from 'fs'
import * as path from 'path'

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const scriptPath = path.join(process.cwd(), 'dist', 'index.js')

    if (!fs.existsSync(scriptPath)) {
      res.status(404).send('Script not found. Run npm run build first.')
      return
    }

    let scriptContent = fs.readFileSync(scriptPath, 'utf-8')

    // Inject API key from Vercel environment variable
    const apiKey = process.env.GLM_API_KEY
    if (apiKey) {
      // Insert API key assignment at the beginning of the script (after shebang if present)
      const injection = `\n// Injected by Vercel\nprocess.env.GLM_API_KEY = process.env.GLM_API_KEY || "${apiKey}";\n`
      if (scriptContent.startsWith('#!/')) {
        const firstNewline = scriptContent.indexOf('\n')
        scriptContent =
          scriptContent.slice(0, firstNewline + 1) +
          injection +
          scriptContent.slice(firstNewline + 1)
      } else {
        scriptContent = injection + scriptContent
      }
    }

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.send(scriptContent)
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`)
  }
}
