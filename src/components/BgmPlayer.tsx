import { useState, useEffect, useRef, useCallback } from 'react'

interface Track {
  id: string
  videoId: string
  title: string
}

const TRACKS: Track[] = [
  { id: '1', videoId: 'mQQKZ5cgybU', title: 'BGM I' },
  { id: '2', videoId: 'unb3FdsT5fQ', title: 'BGM II' },
  { id: '3', videoId: 'QF4aAtOW4oE', title: 'BGM III' },
]

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

const BgmPlayer: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('bgm-volume')
    return saved ? parseInt(saved) : 50
  })
  const [apiReady, setApiReady] = useState(false)
  const [trackTitles, setTrackTitles] = useState<Record<string, string>>({})
  const playerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.YT && window.YT.Player) {
      setApiReady(true)
      return
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]')
    if (existingScript) {
      const check = setInterval(() => {
        if (window.YT && window.YT.Player) {
          setApiReady(true)
          clearInterval(check)
        }
      }, 100)
      return () => clearInterval(check)
    }

    window.onYouTubeIframeAPIReady = () => setApiReady(true)
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)
  }, [])

  const initPlayer = useCallback((track: Track) => {
    if (!apiReady) return

    if (playerRef.current) {
      playerRef.current.destroy()
      playerRef.current = null
    }

    playerRef.current = new window.YT.Player('bgm-yt-player', {
      height: '0',
      width: '0',
      videoId: track.videoId,
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: track.videoId,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume)
          event.target.playVideo()
          setIsPlaying(true)

          const data = event.target.getVideoData()
          if (data?.title) {
            setTrackTitles(prev => ({ ...prev, [track.videoId]: data.title }))
          }
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true)
            const data = event.target.getVideoData()
            if (data?.title) {
              setTrackTitles(prev => ({ ...prev, [track.videoId]: data.title }))
            }
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false)
          } else if (event.data === window.YT.PlayerState.ENDED) {
            event.target.seekTo(0)
            event.target.playVideo()
          }
        },
      },
    })
  }, [apiReady, volume])

  const handleTrackSelect = (track: Track) => {
    if (currentTrack?.id === track.id && playerRef.current) {
      if (isPlaying) {
        playerRef.current.pauseVideo()
      } else {
        playerRef.current.playVideo()
      }
      return
    }
    setCurrentTrack(track)
    initPlayer(track)
  }

  const handlePlayPause = () => {
    if (!playerRef.current) return
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value)
    setVolume(newVolume)
    localStorage.setItem('bgm-volume', String(newVolume))
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume)
    }
  }

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stopVideo()
      playerRef.current.destroy()
      playerRef.current = null
    }
    setCurrentTrack(null)
    setIsPlaying(false)
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const getDisplayTitle = (track: Track) => {
    return trackTitles[track.videoId] || track.title
  }

  return (
    <div className="bgm-player" ref={containerRef}>
      <div id="bgm-yt-player" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} />

      <button
        className={`bgm-toggle-btn ${isPlaying ? 'playing' : ''}`}
        onClick={() => setIsOpen(prev => !prev)}
        title="BGM"
      >
        <span className="bgm-icon">{isPlaying ? '♫' : '♪'}</span>
        {currentTrack && (
          <span className="bgm-now-playing-dot" />
        )}
      </button>

      {isOpen && (
        <div className="bgm-panel">
          <div className="bgm-panel-header">
            <span>MUSICA</span>
            {currentTrack && (
              <button className="bgm-stop-btn" onClick={handleStop} title="停止">
                ■
              </button>
            )}
          </div>

          <div className="bgm-track-list">
            {TRACKS.map(track => (
              <button
                key={track.id}
                className={`bgm-track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                onClick={() => handleTrackSelect(track)}
              >
                <span className="bgm-track-icon">
                  {currentTrack?.id === track.id && isPlaying ? '▶' : currentTrack?.id === track.id ? '❚❚' : '○'}
                </span>
                <span className="bgm-track-title">{getDisplayTitle(track)}</span>
              </button>
            ))}
          </div>

          {currentTrack && (
            <div className="bgm-controls">
              <button className="bgm-play-btn" onClick={handlePlayPause}>
                {isPlaying ? '❚❚' : '▶'}
              </button>
              <div className="bgm-volume">
                <span className="bgm-volume-icon">{volume === 0 ? '🔇' : volume < 40 ? '🔈' : '🔊'}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="bgm-volume-slider"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BgmPlayer
