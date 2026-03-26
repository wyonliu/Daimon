import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a16',
}

export const metadata: Metadata = {
  title: 'Daimon — East-West Destiny Engine',
  description: 'The world\'s first cross-tradition AI destiny analysis. BaZi (Four Pillars) meets Western Astrology. Professional-grade metaphysical intelligence.',
  keywords: 'bazi, four pillars, astrology, destiny, fate analysis, 八字, 命理, horoscope, zodiac',
  openGraph: {
    title: 'Daimon — Know Your Destiny',
    description: 'Professional-grade BaZi + Astrology analysis powered by AI. Discover your fate through both Eastern and Western traditions.',
    type: 'website',
    siteName: 'Daimon',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daimon — Know Your Destiny',
    description: 'Professional-grade BaZi + Astrology analysis powered by AI',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Daimon',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-pattern min-h-screen safe-bottom noise-overlay relative">
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
