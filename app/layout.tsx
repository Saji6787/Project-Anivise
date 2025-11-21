import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Anivise',
  description: 'AI Anime Recommender',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white`}>
        <div className="max-w-2xl mx-auto px-4 pt-10">
          {children}
        </div>
      </body>
    </html>
  );
}
