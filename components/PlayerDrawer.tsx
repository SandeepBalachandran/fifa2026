'use client';

import { useEffect, useRef, useState } from 'react';
import { PlayerPanel } from '@/components/match-details/PlayerPanel';

interface PlayerDrawerProps {
  personId: number | null;
  onClose: () => void;
}

export function PlayerDrawer({ personId, onClose }: PlayerDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (personId !== null) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      setMounted(true);
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [personId]);

  useEffect(() => {
    if (visible) closeButtonRef.current?.focus();
    else if (!visible && personId === null) previousFocusRef.current?.focus();
  }, [visible, personId]);

  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mounted, onClose]);

  if (!mounted) return null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Player Details"
        className={`
          fixed bottom-0 left-0 right-0 z-50 flex flex-col
          h-[88vh] rounded-t-2xl bg-gray-50 shadow-2xl dark:bg-gray-950
          transition-transform duration-300 ease-out
          sm:bottom-auto sm:top-0 sm:left-auto sm:right-0 sm:h-full sm:w-120 sm:rounded-none sm:rounded-l-2xl
          ${visible ? 'translate-y-0 sm:translate-x-0 sm:translate-y-0' : 'translate-y-full sm:translate-x-full sm:translate-y-0'}
        `}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Player Profile
          </p>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close player details"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <PlayerPanel personId={personId} onBack={onClose} hideBackButton />
        </div>
      </div>
    </>
  );
}
