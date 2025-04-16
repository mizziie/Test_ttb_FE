import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ระบบแบบสอบถาม',
  description: 'ระบบแบบสอบถามแบบไดนามิก',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body>
        <main>{children}</main>
      </body>
    </html>
  )
} 
