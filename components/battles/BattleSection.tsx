import type { DirectBattle } from '@/lib/battles/types';
import { BattleCard } from './BattleCard';

interface BattleSectionProps {
  title: string;
  battles: DirectBattle[];
  emptyMessage?: string;
}

export function BattleSection({ title, battles, emptyMessage = 'No battles yet.' }: BattleSectionProps) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
      {battles.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {battles.map((b) => (
            <BattleCard key={b.matchId} battle={b} />
          ))}
        </div>
      )}
    </section>
  );
}
