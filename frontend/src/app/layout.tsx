import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NexusAI Support - Intelligent Customer Support & RAG Knowledge Base',
  description: 'Enterprise AI-Powered Customer Support Platform with Spring Boot and Next.js RAG Engine',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white`} suppressHydrationWarning>
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
          {children}
        </main>
        <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 text-center text-xs text-slate-400">
          NexusAI Customer Support System &copy; 2026. Built with Spring Boot 3 & Next.js 14.
        </footer>
      </body>
    </html>
  );
}
