import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/components/providers/QueryProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Vibe - Campus Connection Platform',
  description: 'Connect with your campus community - now rooms, events, and meaningful connections',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const themeScript = `
    (function(){
      try {
        var theme = localStorage.getItem('theme');
        if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          document.documentElement.classList.add('dark');
        }
      } catch (e) {}
    })();
  `
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ThemeProvider>
          <QueryProvider>
            <ErrorBoundary>{children}</ErrorBoundary>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
