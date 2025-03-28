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
    <ClerkProvider 
      appearance={{
        elements: {
          // Estilización opcional para componentes de Clerk
          formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600',
          card: 'bg-gray-900/60 backdrop-blur-md border border-gray-800/50',
          footerActionLink: 'text-blue-400 hover:text-blue-300',
        },
      }}
    >
      <html lang="es">
        <body className={`${jetbrainsMono.className} font-mono`}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
