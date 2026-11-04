import React from 'react';
import { cn } from '@/lib/utils';

export interface AgentAvatarProps {
  name: string;
  avatarText?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorPairs = [
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
];

export const AgentAvatar: React.FC<AgentAvatarProps> = ({
  name,
  avatarText,
  size = 'md',
  className,
}) => {
  const initials =
    avatarText ||
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  // Pick deterministic color based on name
  const charCode = (name.charCodeAt(0) || 0) + (name.charCodeAt(name.length - 1) || 0);
  const color = colorPairs[charCode % colorPairs.length];

  const sizeClasses = {
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-11 w-11 text-sm font-semibold',
  };

  return (
    <div
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-medium select-none shadow-xs',
        color.bg,
        color.text,
        sizeClasses[size],
        className
      )}
      title={name}
    >
      {initials}
    </div>
  );
};

