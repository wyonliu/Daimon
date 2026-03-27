import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '支付 — Daimon',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
