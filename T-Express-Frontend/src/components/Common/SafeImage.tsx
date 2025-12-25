"use client";
import React, { useState } from "react";
import Image from "next/image";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallback?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  objectFit?: "contain" | "cover" | "fill" | "none" | "scale-down";
}

/**
 * SafeImage component that handles image loading errors gracefully
 * Falls back to a default image if the source fails to load
 */
const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  width,
  height,
  className = "",
  fallback = "/images/products/product-1-sm-1.png",
  priority = false,
  fill = false,
  sizes,
  objectFit = "cover",
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError && imgSrc !== fallback) {
      setHasError(true);
      setImgSrc(fallback);
    }
  };

  // If image is from localhost:8000 and we're in development, add a timeout handler
  const isLocalhostImage = src?.includes("localhost:8000");

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      sizes={sizes}
      onError={handleError}
      onLoadingComplete={(result) => {
        // Reset error state if image loads successfully after error
        if (hasError && result.naturalWidth > 0) {
          setHasError(false);
        }
      }}
      style={fill ? { objectFit } : undefined}
      {...props}
    />
  );
};

export default SafeImage;

