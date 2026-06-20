import { useState, useEffect } from 'react'

interface SettingsProps {
  isOpen: boolean
  onClose: () => void
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('')
  const [isApiKeyValid, setIsApiKeyValid] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    const envKey = import.meta.env.VITE_CLAUDE_API_KEY
    if (envKey && envKey !== 'your-api-key-here') {
      setApiKey(envKey)
      setIsApiKeyValid(true)
      localStorage.setItem('claude-api-key', envKey)
    } else {
      const savedKey = localStorage.getItem('claude-api-key')
      if (savedKey) {
        setApiKey(savedKey)
        setIsApiKeyValid(true)
      }
    }
  }, [])

  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem('claude-api-key', apiKey.trim())
      setIsApiKeyValid(true)
    }
  }

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) return

    setIsTesting(true)
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16,
          messages: [{ role: 'user', content: 'Say "OK"' }]
        })
      })

      if (response.ok) {
        setIsApiKeyValid(true)
        localStorage.setItem('claude-api-key', apiKey.trim())
        alert('APIキーが正常に検証されました！')
      } else {
        setIsApiKeyValid(false)
        alert('APIキーが無効です。確認してください。')
      }
    } catch (error) {
      setIsApiKeyValid(false)
      alert('APIキーのテスト中にエラーが発生しました。')
    } finally {
      setIsTesting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>設定</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          <div className="setting-group">
            <label htmlFor="api-key">Claude APIキー</label>
            <div className="api-key-input-group">
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-ant-..."
                className="api-key-input"
              />
              <button
                className="btn btn-secondary"
                onClick={handleTestApiKey}
                disabled={isTesting || !apiKey.trim()}
              >
                {isTesting ? 'テスト中...' : 'テスト'}
              </button>
            </div>
            <p className="setting-description">
              Claude APIキーを入力してください。キーは<a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer">Anthropic Console</a>から取得できます。
            </p>
            {isApiKeyValid && (
              <p className="api-key-status valid">APIキーが設定されています</p>
            )}
          </div>

          <div className="settings-actions">
            <button
              className="btn btn-primary"
              onClick={handleSaveApiKey}
              disabled={!apiKey.trim()}
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
