import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-jetbrains'
})

export const metadata: Metadata = {
  title: 'Santo Grial - Tu Agente Inteligente',
  description: 'Interfaz para comunicarse con agentes de IA, con soporte para visualización de diagramas mermaid',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${jetbrainsMono.className} font-mono`}>{children}</body>
    </html>
  )
}
