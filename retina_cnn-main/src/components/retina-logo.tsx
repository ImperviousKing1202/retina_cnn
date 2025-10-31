/**
 * RETINA Logo Component — Hydration Safe
 * Always deterministic SSR output; swaps fallback icon client-side if needed
 */

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetinaLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  variant?: 'light' | 'dark';
  useFallbackIcon?: boolean; // optional flag
}

export function RetinaLogo({
  size = 'md',
  className,
  showText = false,
  textPosition = 'right',
  variant = 'light',
  useFallbackIcon = false,
}: RetinaLogoProps) {
  const [hydrated, setHydrated] = useState(false);

  // Ensures that client-only checks occur AFTER hydration
  useEffect(() => setHydrated(true), []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const textColors = {
    light: 'text-white',
    dark: 'text-gray-900',
  };

  const logoSize = sizeClasses[size];
  const textSize = textSizes[size];
  const textColor = textColors[variant];
  const imageSrc = textPosition === 'bottom' ? '/retina.png' : '/retina-logo.png';

  // ✅ Render Image by default for SSR
  // Swap to <Eye /> only client-side after hydration if desired
  const showFallback = hydrated && useFallbackIcon;

  const logo = showFallback ? (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-teal-600',
        logoSize
      )}
    >
      <Eye className="w-6 h-6 text-white" />
    </div>
  ) : (
    <div className={cn('relative', logoSize)}>
      <Image
        src={imageSrc}
        alt="RETINA Logo"
        fill
        priority
        sizes="(max-width: 768px) 50vw, 200px"
        className="object-contain select-none pointer-events-none"
      />
    </div>
  );

  const textElement = showText && (
    <span className={cn('font-bold tracking-tight', textSize, textColor)}>
      RETINA
    </span>
  );

  if (textPosition === 'bottom') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {logo}
        {textElement}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {logo}
      {textElement}
    </div>
  );
}

export default RetinaLogo;
