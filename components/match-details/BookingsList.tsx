import Image from 'next/image';
import type { Booking, MatchTeam } from '@/lib/football-data/match-types';

function TeamCrest({ team, size = 16 }: { team: MatchTeam; size?: number }) {
  if (!team.crest) return <span className="inline-block shrink-0 rounded-sm bg-gray-100 dark:bg-gray-700" style={{ width: size, height: size }} />;
  return <Image src={team.crest} alt={team.name} width={size} height={size} className="shrink-0 object-contain" unoptimized />;
}

function bookingMinute(b: Booking): string {
  if (b.minute === null) return '';
  return b.injuryTime ? `${b.minute}+${b.injuryTime}'` : `${b.minute}'`;
}

const CARD_STYLE: Record<string, { icon: string; cls: string }> = {
  YELLOW:      { icon: '🟨', cls: 'bg-yellow-50 dark:bg-yellow-950/30' },
  YELLOW_RED:  { icon: '🟧', cls: 'bg-orange-50 dark:bg-orange-950/30' },
  RED:         { icon: '🟥', cls: 'bg-red-50 dark:bg-red-950/30'       },
};

interface BookingsListProps {
  bookings: Booking[];
}

export function BookingsList({ bookings }: BookingsListProps) {
  if (!bookings || bookings.length === 0) {
    return <p className="text-sm text-gray-400">No bookings.</p>;
  }

  return (
    <ul className="flex flex-col gap-1.5">
      {bookings.map((b, i) => {
        const style = CARD_STYLE[b.card] ?? CARD_STYLE.YELLOW;
        return (
          <li
            key={i}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 ${style.cls}`}
          >
            <span className="text-base leading-none">{style.icon}</span>
            <span className="w-12 shrink-0 text-xs font-bold text-gray-400">
              {bookingMinute(b)}
            </span>
            <TeamCrest team={b.team} size={16} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-gray-900 dark:text-white">
              {b.player.name}
            </span>
            <span className="shrink-0 text-xs text-gray-400">{b.team.shortName || b.team.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
