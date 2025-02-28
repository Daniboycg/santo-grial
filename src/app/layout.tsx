import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'] })

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
      <body className={manrope.className}>{children}</body>
    </html>
  )
}
