import { memo, useState, useEffect } from 'react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
}

const OptimizedImage = ({ 
  src, 
  alt, 
  fallbackSrc = "https://images.unsplash.com/photo-1554118811-1e0d58224f24", 
  className = "", 
  ...rest 
}: OptimizedImageProps) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoaded(false);
    setImgSrc(null);
    
    // Create a new image object to preload the image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImgSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}, using fallback`);
      setImgSrc(fallbackSrc);
      setIsLoaded(true);
    };
    
    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, fallbackSrc]);

  return (
    <>
      {!isLoaded && (
        <div className={`animate-pulse bg-gray-200 ${className}`} style={{ minHeight: '100px' }} />
      )}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          loading="lazy"
          decoding="async"
          {...rest}
        />
      )}
    </>
  );
};

export default memo(OptimizedImage);
