import type { TeamDetails } from '@/lib/football-data/team-types';

interface TeamInfoCardProps {
  team: TeamDetails;
}

interface InfoRowProps {
  label: string;
  value: string;
  href?: string;
}

function InfoRow({ label, value, href }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 break-all text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
        >
          {value}
        </a>
      ) : (
        <span className="min-w-0 text-sm text-gray-700 dark:text-gray-300">{value}</span>
      )}
    </div>
  );
}

export function TeamInfoCard({ team }: TeamInfoCardProps) {
  const rows: InfoRowProps[] = [
    team.venue   ? { label: 'Venue',   value: team.venue }                                   : null,
    team.address ? { label: 'Address', value: team.address }                                  : null,
    team.website ? { label: 'Website', value: team.website, href: team.website }              : null,
  ].filter((r): r is InfoRowProps => r !== null);

  if (rows.length === 0) return null;

  return (
    <div className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white px-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-900">
      {rows.map((row) => (
        <InfoRow key={row.label} {...row} />
      ))}
    </div>
  );
}
