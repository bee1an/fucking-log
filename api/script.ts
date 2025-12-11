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

    const scriptContent = fs.readFileSync(scriptPath, 'utf-8')

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=60')
    res.send(scriptContent)
  } catch (error) {
    res.status(500).send(`Error: ${(error as Error).message}`)
  }
}
