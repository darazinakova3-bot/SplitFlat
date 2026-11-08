import { AVATAR_COLORS } from '@/types';
import type { Member } from '@/lib';

interface AvatarProps {
  member: Member;
  size?: 'sm' | 'md' | 'lg';
  ring?: boolean;
}

const sizeMap = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function Avatar({ member, size = 'md', ring }: AvatarProps) {
  const color = AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length];
  const initials = member.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('');
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold flex-shrink-0 ${
        sizeMap[size]
      } ${ring ? 'ring-2 ring-white shadow-sm' : ''}`}
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-hidden
    >
      {initials || '?'}
    </span>
  );
}

export function getAvatarColor(member: Member) {
  return AVATAR_COLORS[member.colorIndex % AVATAR_COLORS.length];
}
