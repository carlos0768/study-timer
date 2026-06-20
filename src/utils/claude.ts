export const getClaudeApiKey = (): string | null => {
  const envKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (envKey && envKey !== 'your-api-key-here') {
    return envKey
  }

  const savedKey = localStorage.getItem('claude-api-key')
  if (savedKey) {
    return savedKey
  }

  return null
}

export const hasValidApiKey = (): boolean => {
  return getClaudeApiKey() !== null
}
