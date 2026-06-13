import { readStore, writeStore } from '../store';
import type { AppNotification } from './types';

export function getNotifications(participantName?: string): AppNotification[] {
  const { notifications } = readStore();
  if (!participantName) return notifications;
  return notifications.filter((n) => n.participantName === participantName);
}

export function addNotifications(notes: AppNotification[]): void {
  if (notes.length === 0) return;
  const store = readStore();
  store.notifications = [...store.notifications, ...notes];
  writeStore(store);
}

export function markAllRead(participantName: string): void {
  const store = readStore();
  store.notifications = store.notifications.map((n) =>
    n.participantName === participantName ? { ...n, read: true } : n
  );
  writeStore(store);
}
