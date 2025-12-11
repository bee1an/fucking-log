import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as fs from 'fs'
import * as path from 'path'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Debug mode: check if env var exists
  if (req.query.debug === '1') {
    const hasKey = !!process.env.GLM_API_KEY
    const keyPreview = process.env.GLM_API_KEY
      ? process.env.GLM_API_KEY.slice(0, 8) + '...'
      : 'NOT SET'
    res.setHeader('Content-Type', 'text/plain')
    res.send(`GLM_API_KEY exists: ${hasKey}\nPreview: ${keyPreview}`)
    return
  }

  try {
    const scriptPath = path.join(process.cwd(), 'dist', 'cli.js')

    if (!fs.existsSync(scriptPath)) {
      res.status(404).send('Script not found.')
      return
    }

    let scriptContent = fs.readFileSync(scriptPath, 'utf-8')

    // Inject API key from Vercel environment variable
    const apiKey = process.env.GLM_API_KEY
    const injectionCode = apiKey
      ? `process.env.GLM_API_KEY = process.env.GLM_API_KEY || "${apiKey}";`
      : `console.error("⚠️  Warning: GLM_API_KEY is not set in the Vercel environment.");`

    const injection = `\n// Injected by Vercel\n${injectionCode}\n`

    if (scriptContent.startsWith('#!/')) {
      const firstNewline = scriptContent.indexOf('\n')
      scriptContent =
        scriptContent.slice(0, firstNewline + 1) +
        injection +
        scriptContent.slice(firstNewline + 1)
    } else {
      scriptContent = injection + scriptContent
    }

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.send(scriptContent)
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`)
  }
}
