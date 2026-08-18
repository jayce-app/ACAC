import { useState } from "react";
import { company } from "../data/content";

type BrandLogoProps = {
  className?: string;
  alt: string;
  width?: number;
  height?: number;
};

/**
 * Loads public/logo.jpg when present; falls back to text so a missing file
 * never leaves a broken image in the header/footer.
 */
export function BrandLogo({ className, alt, width = 420, height = 120 }: BrandLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="brand-logo-fallback">
        <span className="brand-logo-fallback__name">TX Ropers</span>
        <span className="brand-logo-fallback__trade">Construction</span>
      </span>
    );
  }

  return (
    <img
      className={className}
      src={company.logo}
      alt={alt}
      width={width}
      height={height}
      onError={() => setFailed(true)}
    />
  );
}
