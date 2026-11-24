import React from 'react';
import { formatArea } from '@/lib/format';
import { AreaUnit } from '@/types';
import { cn } from '@/lib/utils';

export interface AreaTextProps {
  value: number;
  unit: AreaUnit | string;
  className?: string;
}

export const AreaText: React.FC<AreaTextProps> = ({ value, unit, className }) => {
  return (
    <span className={cn('text-slate-700 font-medium whitespace-nowrap', className)}>
      {formatArea(value, unit)}
    </span>
  );
};

