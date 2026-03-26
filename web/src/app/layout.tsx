import type { Metadata, Viewport } from 'next'
import './globals.css'
import BottomNav from '@/components/BottomNav'
import InstallPrompt from '@/components/InstallPrompt'
import { LocaleProvider } from '@/components/LocaleProvider'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a0a16',
}

export const metadata: Metadata = {
  title: 'Daimon — 東西方命理引擎',
  description: '全球首創跨傳統命理分析。八字四柱命理結合西方占星術，專業級命運解讀引擎。',
  keywords: '八字, 四柱命理, 占星, 命運, 命理分析, bazi, astrology, 星座, 運勢, 合盤',
  openGraph: {
    title: 'Daimon — 知命・改運',
    description: '專業級八字命理 + 西方占星分析引擎。東西方命理傳統，一次深度解讀。',
    type: 'website',
    siteName: 'Daimon',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daimon — 知命・改運',
    description: '專業級八字命理 + 西方占星分析引擎',
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
    <html lang="zh-Hant" className="antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
        />
      </head>
      <body className="bg-pattern min-h-screen safe-bottom noise-overlay relative">
        <LocaleProvider>
          {children}
          <BottomNav />
          <InstallPrompt />
        </LocaleProvider>
      </body>
    </html>
  )
}
