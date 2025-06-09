import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EV-Stimulation',
  description: 'EV-Stimulation',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/cars.ico" />
      </head>
      <body>{children}</body>
    </html>
  )
}
