import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/supabase/auth-context'
import { ErrorSuppressor } from '@/components/error-suppressor'

export const metadata: Metadata = {
  title: 'Hireable',
  description: 'Job Prep Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className="antialiased">
        <ErrorSuppressor />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
