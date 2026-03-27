import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '命理解讀 — Daimon',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
