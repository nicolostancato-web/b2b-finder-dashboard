import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SidebarProvider } from '@/context/SidebarContext'
import { ThemeProvider } from '@/context/ThemeContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'B2B Finder — Dashboard Gare Pubbliche',
  description: 'Gare pubbliche personalizzate per la tua azienda',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className="dark">
      <body className={`${inter.className} bg-[#0A0A0F] text-white antialiased`}>
        <ThemeProvider>
          <SidebarProvider>
            {children}
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
