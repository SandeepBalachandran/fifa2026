import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "World Cup Draft Manager",
  description: "Fantasy-style World Cup team ownership and scoring",
};

const NAV_LINKS = [
  { href: "/",              label: "War Room",      icon: "🏟" },
  { href: "/leaderboard",   label: "Leaderboard",   icon: "🏆" },
  { href: "/fixtures",      label: "Fixtures",      icon: "📅" },
  { href: "/scorers",       label: "Scorers",       icon: "⚽" },
  // { href: "/battles",       label: "Battles",       icon: "⚔️" },
  // { href: "/draft",         label: "Draft",         icon: "📋" },
  // { href: "/notifications", label: "Notifications", icon: "🔔" },
  // { href: "/admin",         label: "Admin",         icon: "⚙️" },
  { href: "/bet-tracker",   label: "Bet Tracker",   icon: "🎯" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-green-50 dark:bg-gray-950">
        {/*
          Anti-flash script — runs synchronously before paint.
          Light is the default; only activates dark if the user previously chose it.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}`,
          }}
        />

        {/* Header */}
        <header className="sticky top-0 z-50 bg-linear-to-r from-green-950 via-emerald-900 to-green-800 shadow-xl">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="text-2xl">⚽</span>
              <span className="text-lg font-black tracking-tight text-white">
                WC Draft{" "}
                <span className="text-amber-400">2026</span>
              </span>
            </Link>

            {/* Desktop nav links + theme toggle */}
            <div className="hidden items-center gap-0.5 sm:flex">
              {NAV_LINKS.map(({ href, label, icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-green-100 transition-all hover:bg-white/15 hover:text-white"
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
              <div className="mx-2 h-5 w-px bg-white/20" />
              <ThemeToggle />
            </div>

            {/* Mobile: theme toggle only */}
            <div className="sm:hidden">
              <ThemeToggle />
            </div>
          </nav>
        </header>

        {/* Mobile bottom tab bar */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-green-900/80 bg-green-950 sm:hidden">
          {NAV_LINKS.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center justify-center gap-0.5 py-3 text-green-400 transition-colors hover:text-white active:text-amber-400"
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          ))}
        </nav>

        {/* pb-16 on mobile to clear the fixed bottom tab bar */}
        <div className="flex flex-1 flex-col pb-16 sm:pb-0">{children}</div>

        {/* Footer */}
        <footer className="border-t border-green-200 bg-green-900/10 py-4 text-center text-xs text-green-700 dark:border-green-900/30 dark:text-green-500">
          ⚽ World Cup Draft Manager 2026 — Live data from Football Data API
        </footer>
      </body>
    </html>
  );
}
