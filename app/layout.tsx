import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'B2B Finder — Dashboard Gare Pubbliche',
  description: 'Gare pubbliche personalizzate per la tua azienda',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it">
      <body className={`${inter.className} antialiased bg-[#0A0A0F]`}>
        {children}
      </body>
    </html>
  )
}
