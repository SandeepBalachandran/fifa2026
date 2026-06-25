import Image from 'next/image';
import type { Goal, MatchTeam } from '@/lib/football-data/match-types';

function TeamCrest({ team, size = 16 }: { team: MatchTeam; size?: number }) {
  if (!team.crest) return <span className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={team.crest} alt={team.name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

function goalMinute(goal: Goal): string {
  if (goal.minute === null) return '';
  return goal.injuryTime ? `${goal.minute}+${goal.injuryTime}'` : `${goal.minute}'`;
}

const GOAL_TYPE_BADGE: Record<string, string> = {
  OWN:     'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  PENALTY: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
};
const GOAL_TYPE_LABEL: Record<string, string> = {
  OWN: 'OG', PENALTY: 'P',
};

interface GoalsListProps {
  goals: Goal[];
  homeTeamId: number;
  onScorerClick?: (id: number, name: string) => void;
}

export function GoalsList({ goals, homeTeamId, onScorerClick }: GoalsListProps) {
  if (!goals || goals.length === 0) {
    return <p className="text-sm text-gray-400">No goals recorded.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {goals.map((goal, i) => {
        const isHome = goal.team.id === homeTeamId;
        const badgeCls = GOAL_TYPE_BADGE[goal.type];
        const typeLabel = GOAL_TYPE_LABEL[goal.type];
        const scorerName = goal.scorer?.name ?? goal.team.name;
        const canClick = !!goal.scorer?.id && !!onScorerClick;

        return (
          <li key={i} className={`flex items-start gap-3 ${isHome ? '' : 'flex-row-reverse'}`}>
            {/* Minute */}
            <span className="w-10 shrink-0 text-xs font-bold text-gray-400 dark:text-gray-500 mt-0.5 text-right">
              {goalMinute(goal)}
            </span>

            {/* Crest */}
            <TeamCrest team={goal.team} size={18} />

            {/* Scorer info */}
            <div className={`min-w-0 flex-1 ${isHome ? '' : 'text-right'}`}>
              <div className={`flex items-center gap-1.5 flex-wrap ${isHome ? '' : 'justify-end'}`}>
                {canClick ? (
                  <button
                    onClick={() => onScorerClick(goal.scorer!.id, goal.scorer!.name)}
                    className="font-semibold text-sm text-green-700 underline underline-offset-2 decoration-dotted hover:text-green-600 dark:text-green-400 dark:hover:text-green-300"
                  >
                    {scorerName}
                  </button>
                ) : (
                  <span className="font-semibold text-sm text-gray-900 dark:text-white">
                    {scorerName}
                  </span>
                )}
                {typeLabel && (
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${badgeCls}`}>
                    {typeLabel}
                  </span>
                )}
              </div>
              {goal.assist && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  Assist:{' '}
                  {goal.assist.id && onScorerClick ? (
                    <button
                      onClick={() => onScorerClick(goal.assist!.id, goal.assist!.name)}
                      className="text-xs text-green-600 underline underline-offset-2 decoration-dotted hover:text-green-500 dark:text-green-400"
                    >
                      {goal.assist.name}
                    </button>
                  ) : (
                    goal.assist.name
                  )}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
