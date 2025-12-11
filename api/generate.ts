import type { VercelRequest, VercelResponse } from '@vercel/node'

const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.GLM_API_KEY
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'Server configuration error: API Key missing' })
  }

  try {
    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(response.status).json(data)
    }

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message })
  }
}
