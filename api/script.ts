import type { VercelRequest, VercelResponse } from '@vercel/node'
import * as fs from 'fs'
import * as path from 'path'

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Debug mode: check if env var exists
  if (req.query.debug === '1') {
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['host']
    const proxyUrl = `${protocol}://${host}/api/generate`

    res.setHeader('Content-Type', 'text/plain')
    res.send(`Proxy URL target: ${proxyUrl}\n(API Key is handled server-side)`)
    return
  }

  try {
    const scriptPath = path.join(process.cwd(), 'dist', 'cli.js')

    if (!fs.existsSync(scriptPath)) {
      res.status(404).send('Script not found.')
      return
    }

    let scriptContent = fs.readFileSync(scriptPath, 'utf-8')

    // Inject Proxy URL derived from the current request host
    const protocol = req.headers['x-forwarded-proto'] || 'https'
    const host = req.headers['host']
    const proxyUrl = `${protocol}://${host}/api/generate`

    const injectionCode = `process.env.GLM_PROXY_URL = "${proxyUrl}";`
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
