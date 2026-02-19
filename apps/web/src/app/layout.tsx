import type { Metadata } from 'next';
import { LanguageProvider } from '@/context/language-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'Тритон',
  description: 'Официальный журнал Гимназии Сколково',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap&subset=latin,cyrillic,cyrillic-ext"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
