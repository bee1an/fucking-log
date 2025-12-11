import { GLM_API_URL, GLM_MODEL } from './config'

// Global variable to store API key from CLI
let CLI_API_KEY: string | null = null

export function setCliApiKey(key: string | null): void {
  CLI_API_KEY = key
}

export function getApiKey(): string | null {
  if (CLI_API_KEY) return CLI_API_KEY
  if (process.env.GLM_API_KEY) return process.env.GLM_API_KEY
  return null
}

export async function callGLM(prompt: string): Promise<string> {
  const apiKey = getApiKey()

  if (!apiKey) {
    console.error('\n❌ API Key not found!')
    console.error(
      'Please set GLM_API_KEY environment variable or use --key option'
    )
    console.error('Get your free API key at: https://open.bigmodel.cn/')
    process.exit(1)
  }

  console.log('\n🤖 Calling GLM-4.5-Flash API...')

  const response = await fetch(GLM_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages: [{ role: 'user', content: prompt }],
      thinking: { type: 'disabled' },
      max_tokens: 4096,
      temperature: 0.7
    })
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`\n❌ API Error: ${response.status}`)
    console.error(errorText)
    process.exit(1)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content
  }

  console.error('\n❌ Unexpected API response format')
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}
