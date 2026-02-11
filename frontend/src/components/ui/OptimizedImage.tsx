import { useState, memo } from 'react'

interface OptimizedImageProps {
  src?: string
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
  fallbackIcon?: 'person' | 'book' | 'generic'
}

const FALLBACK_ICONS = {
  person: (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  ),
  book: (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
    </svg>
  ),
  generic: (
    <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
    </svg>
  ),
}

const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc,
  fallbackIcon = 'generic',
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)

  if (!src || hasError) {
    if (fallbackSrc) {
      return (
        <img
          src={fallbackSrc}
          alt={alt}
          width={width}
          height={height}
          className={className}
          loading="lazy"
        />
      )
    }
    return (
      <div 
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        {FALLBACK_ICONS[fallbackIcon]}
      </div>
    )
  }

  return (
    <div className="relative" style={{ width, height }}>
      {!isLoaded && (
        <div 
          className={`absolute inset-0 animate-pulse skeleton ${className}`}
          style={{ width, height }}
        />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
      />
    </div>
  )
})

export default OptimizedImage
