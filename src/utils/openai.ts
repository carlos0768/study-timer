export const getOpenAIApiKey = (): string | null => {
  // First check environment variable
  const envKey = import.meta.env.VITE_OPENAI_API_KEY
  if (envKey && envKey !== 'your-api-key-here') {
    return envKey
  }
  
  // Then check localStorage
  const savedKey = localStorage.getItem('openai-api-key')
  if (savedKey) {
    return savedKey
  }
  
  return null
}

export const hasValidApiKey = (): boolean => {
  return getOpenAIApiKey() !== null
}