import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai } from 'next/font/google'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout'
import './globals.css'

const ibmPlexSansThai = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MUST ERP - ระบบจัดการการผลิต',
  description: 'ระบบ ERP สำหรับโรงงานผลิตอาหารและเครื่องดื่ม',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={ibmPlexSansThai.className}>
        <AppShell>{children}</AppShell>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
