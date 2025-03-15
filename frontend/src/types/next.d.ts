// Type declarations for Next.js components to resolve TypeScript errors

// Declaration for next/image
declare module 'next/image' {
  import { DetailedHTMLProps, ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement> {
    src: string;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    loader?: (resolverProps: ImageLoaderProps) => string;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    style?: React.CSSProperties;
    sizes?: string;
    className?: string;
  }
  
  export interface ImageLoaderProps {
    src: string;
    width: number;
    quality?: number | string;
  }
  
  export default function Image(props: ImageProps): JSX.Element;
}

// Declaration for next/link
declare module 'next/link' {
  import { LinkHTMLAttributes } from 'react';
  
  export interface LinkProps extends LinkHTMLAttributes<HTMLAnchorElement> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    legacyBehavior?: boolean;
    className?: string;
    children?: React.ReactNode;
  }
  
  export default function Link(props: LinkProps): JSX.Element;
}

// Declaration for next/navigation
declare module 'next/navigation' {
  export function useRouter(): {
    push: (url: string, options?: { shallow?: boolean }) => void;
    replace: (url: string, options?: { shallow?: boolean }) => void;
    back: () => void;
    prefetch: (url: string) => void;
    pathname: string;
    query: Record<string, string | string[]>;
    asPath: string;
    events: {
      on: (event: string, callback: (...args: any[]) => void) => void;
      off: (event: string, callback: (...args: any[]) => void) => void;
    };
  };

  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

// Declaration for next-themes
declare module 'next-themes' {
  export interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: string;
    forcedTheme?: string;
    themes?: string[];
    attribute?: string;
    value?: Record<string, string>;
    enableSystem?: boolean;
    disableTransitionOnChange?: boolean;
    storageKey?: string;
  }
  
  export interface UseThemeProps {
    themes: string[];
    forcedTheme?: string;
    setTheme: (theme: string) => void;
    theme?: string;
    systemTheme?: 'light' | 'dark';
    resolvedTheme?: string;
  }
  
  export function ThemeProvider(props: ThemeProviderProps): JSX.Element;
  export function useTheme(): UseThemeProps;
}
