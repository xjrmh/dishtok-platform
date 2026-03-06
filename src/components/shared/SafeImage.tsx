"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

const DEFAULT_FALLBACK_SRC = "/menu-photo-fallback.svg";

type SafeImageProps = Omit<ImageProps, "src"> & {
  src: string;
  fallbackSrc?: string;
};

export function SafeImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  alt,
  onError,
  ...props
}: SafeImageProps) {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    setResolvedSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      onError={(event) => {
        if (resolvedSrc !== fallbackSrc) {
          setResolvedSrc(fallbackSrc);
        }
        onError?.(event);
      }}
    />
  );
}
