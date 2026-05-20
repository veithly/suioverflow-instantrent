import Image from "next/image";

export type LogoSize = "sm" | "md" | "lg" | "xl";

const SIZES: Record<LogoSize, { wordmark: { w: number; h: number }; mark: { w: number; h: number } }> = {
  sm: { wordmark: { w: 130, h: 32 }, mark: { w: 24, h: 24 } },
  md: { wordmark: { w: 170, h: 42 }, mark: { w: 32, h: 32 } },
  lg: { wordmark: { w: 240, h: 64 }, mark: { w: 48, h: 48 } },
  xl: { wordmark: { w: 360, h: 96 }, mark: { w: 80, h: 80 } },
};

export function Wordmark({ size = "md", className }: { size?: LogoSize; className?: string }) {
  const dim = SIZES[size].wordmark;
  return (
    <Image
      src="/brand/wordmark.svg"
      alt="InstantRent"
      width={dim.w}
      height={dim.h}
      priority
      className={className}
    />
  );
}

export function Logomark({ size = "md", className }: { size?: LogoSize; className?: string }) {
  const dim = SIZES[size].mark;
  return (
    <Image
      src="/brand/logomark.svg"
      alt="InstantRent"
      width={dim.w}
      height={dim.h}
      priority
      className={className}
    />
  );
}

export function LogoMono({ size = "md", className }: { size?: LogoSize; className?: string }) {
  const dim = SIZES[size].mark;
  return (
    <Image
      src="/brand/logo-mono.svg"
      alt="InstantRent"
      width={dim.w}
      height={dim.h}
      className={className}
    />
  );
}
