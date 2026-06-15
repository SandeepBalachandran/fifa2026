import Image from 'next/image';

interface PlayerAvatarProps {
  /** Future-ready: pass a real image URL when the API provides one. */
  imageUrl?: string | null;
  name: string;
  size?: number;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? '?';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

export function PlayerAvatar({ imageUrl, name, size = 40 }: PlayerAvatarProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={name}
        width={size}
        height={size}
        className="shrink-0 rounded-full object-cover"
        unoptimized
      />
    );
  }

  const fontSize = Math.max(10, Math.round(size * 0.36));

  return (
    <span
      aria-label={name}
      role="img"
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-600 to-emerald-800 font-bold text-white"
      style={{ width: size, height: size, fontSize }}
    >
      {getInitials(name)}
    </span>
  );
}
