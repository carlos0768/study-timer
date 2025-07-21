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
    // If path already starts with /, use as-is
    if (cleanImg.startsWith('/')) {
      return cleanImg
    }
    return `/images/emperors/${cleanImg}`
  }

  const imageUrl = getImageUrl(emperor.img)
  console.log('Emperor image URL:', imageUrl, 'for', emperor.name)

  // Calculate font size based on text length
  const getLatinFontSize = (text: string) => {
    const length = text.length
    if (length > 150) return '1.2rem'
    if (length > 100) return '1.4rem'
    if (length > 70) return '1.6rem'
    return '1.75rem'
  }

  const getJpFontSize = (text: string) => {
    const length = text.length
    if (length > 100) return '0.9rem'
    if (length > 70) return '1rem'
    return '1.1rem'
  }

  const getNameFontSize = (name: string) => {
    const length = name.length
    if (length > 20) return '2rem'
    if (length > 15) return '2.5rem'
    return '3rem'
  }

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
        <h3 className="emperor-name" style={{ fontSize: getNameFontSize(emperor.name) }}>{emperor.name}</h3>
        <div className="emperor-quote">
          <p className="quote-latin" style={{ fontSize: getLatinFontSize(emperor.quoteLatin) }}>"{emperor.quoteLatin}"</p>
          <p className="quote-jp" style={{ fontSize: getJpFontSize(emperor.quoteJp) }}>{emperor.quoteJp}</p>
        </div>
      </div>
    </div>
  )
}

export default EmperorDisplay