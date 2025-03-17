import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'MultiAgent as a Service Workflow Creator - Generador de JSON para n8n',
  description: 'Herramienta para generar JSON para n8n con visualización de diagramas mermaid',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className={`${jetbrainsMono.className} font-mono`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
