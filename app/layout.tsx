import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'مساعد الجامعة السعودية الإلكترونية',
  description: 'مساعد ذكي للإجابة على استفساراتك حول الجامعة السعودية الإلكترونية SEU',
  keywords: 'جامعة سعودية إلكترونية، SEU، قبول، تسجيل، تخصصات',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800&family=Cairo:wght@300;400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-arabic antialiased">{children}</body>
    </html>
  )
}
