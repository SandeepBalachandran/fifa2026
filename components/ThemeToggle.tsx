'use client';

import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch {
      // localStorage unavailable — toggle still works for the session
    }
  };

  // Render a fixed-size placeholder before mount to avoid layout shift
  if (!mounted) {
    return <div className="h-9 w-9 shrink-0" />;
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg transition-all hover:bg-white/15 active:scale-95"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
