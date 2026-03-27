import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '每日運勢 — Daimon',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
