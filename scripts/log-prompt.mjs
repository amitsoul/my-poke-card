#!/usr/bin/env node
// Appends every prompt you send to your coding agent to PROMPTS.md.
// Wired to the agent's "user prompt submitted" hook — see README.md.
// It must never break your session: on any error it exits quietly with code 0.

import { appendFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const LOG = join(dirname(dirname(fileURLToPath(import.meta.url))), 'PROMPTS.md')

const readStdin = async () => {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  return Buffer.concat(chunks).toString('utf8')
}

const pad = (n) => String(n).padStart(2, '0')

try {
  const agent = process.argv[2] || 'agent'
  const raw = await readStdin()
  const prompt = (JSON.parse(raw).prompt || '').trim()

  // Skip empties and agent commands (/clear, /model, ...): they are not part of the work.
  if (!prompt || (prompt.startsWith('/') && !prompt.includes('\n'))) process.exit(0)

  const now = new Date()
  const day = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`

  const previous = existsSync(LOG) ? readFileSync(LOG, 'utf8') : ''
  const dayHeading = previous.includes(`\n## ${day}\n`) ? '' : `\n## ${day}\n`
  const quoted = prompt.split('\n').map((line) => `> ${line}`).join('\n')

  appendFileSync(LOG, `${dayHeading}\n**${time} · ${agent}**\n\n${quoted}\n`)
} catch {
  // A broken log must never block your work.
}

process.exit(0)
