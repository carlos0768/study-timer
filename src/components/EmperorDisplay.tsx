import type { Emperor } from '../types'

interface EmperorDisplayProps {
  emperor: Emperor
}

const EmperorDisplay: React.FC<EmperorDisplayProps> = ({ emperor }) => {
  const getImageUrl = (img: string) => {
    if (!img) return 'https://via.placeholder.com/200x200?text=Emperor'
    
    // Remove any extra whitespace or newlines
    const cleanImg = img.trim()
    
    if (cleanImg.startsWith('http')) {
      return cleanImg
    }
    return `/assets/emperors/${cleanImg}`
  }

  const imageUrl = getImageUrl(emperor.img)
  console.log('Emperor image URL:', imageUrl, 'for', emperor.name)

  return (
    <div className="emperor-display">
      <div className="emperor-image-container">
        <img 
          src={imageUrl} 
          alt={emperor.name}
          className="emperor-image"
          onError={(e) => {
            console.error('Failed to load image:', imageUrl)
            ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(emperor.name)
          }}
        />
      </div>
      <div className="emperor-info">
        <h3 className="emperor-name">{emperor.name}</h3>
        <div className="emperor-quote">
          <p className="quote-latin">"{emperor.quoteLatin}"</p>
          <p className="quote-jp">{emperor.quoteJp}</p>
        </div>
      </div>
    </div>
  )
}

export default EmperorDisplay