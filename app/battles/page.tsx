import { getBattles } from '@/lib/battles/store';
import type { DirectBattle } from '@/lib/battles/types';
import { BattleSection } from '@/components/battles/BattleSection';

function partitionBattles(battles: DirectBattle[]) {
  const live = battles
    .filter((b) => b.status === 'LIVE')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate));

  const upcoming = battles
    .filter((b) => b.status === 'SCHEDULED')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate));

  const completed = battles
    .filter((b) => b.status === 'FINISHED')
    .sort((a, b) => a.matchDate.localeCompare(b.matchDate));

  return { live, upcoming, completed };
}

export default function BattlesPage() {
  const battles = getBattles();
  const { live, upcoming, completed } = partitionBattles(battles);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <h1 className="mb-8 flex items-center gap-3 text-3xl font-black tracking-tight text-green-900 dark:text-green-100">
        ⚔️ Direct Battles
      </h1>

      <div className="flex flex-col gap-10">
        <BattleSection title="🔴 Live"      battles={live}      emptyMessage="No battles currently live." />
        <BattleSection title="📅 Upcoming"  battles={upcoming}  emptyMessage="No upcoming battles scheduled." />
        <BattleSection title="✅ Completed" battles={completed} emptyMessage="No completed battles yet." />
      </div>
    </main>
  );
}
