import { readStore, writeStore } from '../store';

export function getParticipants(): string[] {
  return readStore().participants;
}

export function addParticipant(name: string): void {
  const store = readStore();
  if (!store.participants.includes(name)) {
    store.participants.push(name);
    store.scores[name] = 0;
    writeStore(store);
  }
}

export function getOwnership(): Record<string, string> {
  return readStore().ownership;
}

export function assignTeam(teamName: string, ownerName: string): void {
  const store = readStore();
  store.ownership[teamName] = ownerName;
  writeStore(store);
}

export function unassignTeam(teamName: string): void {
  const store = readStore();
  delete store.ownership[teamName];
  writeStore(store);
}

export function getEliminatedTeams(): string[] {
  return readStore().eliminated;
}

export function markEliminated(teamName: string): void {
  const store = readStore();
  if (!store.eliminated.includes(teamName)) {
    store.eliminated.push(teamName);
    writeStore(store);
  }
}
