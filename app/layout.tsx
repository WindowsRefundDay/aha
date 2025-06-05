import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from 'next/script'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "aha!",
  description: "capture your moments of realization",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init-script" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var darkMode = localStorage.getItem('aha_darkMode') === 'true';
                if (darkMode) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
                
                // Updated to read HSL values for accent colors
                const accentHSL = localStorage.getItem('aha_accentColor_hsl') || '217 91% 60%'; // Default Blue HSL
                const accentForegroundHSL = localStorage.getItem('aha_accentColor_fg_hsl') || '0 0% 100%'; // Default White HSL
                
                document.documentElement.style.setProperty('--accent-hsl', accentHSL);
                document.documentElement.style.setProperty('--accent-foreground-hsl', accentForegroundHSL);

              } catch (e) {
                console.error('Error initializing theme:', e);
              }
            })()
          `}
        </Script>
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  )
}
