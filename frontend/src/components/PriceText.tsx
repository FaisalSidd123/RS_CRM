import React from 'react';
import { formatPKR, formatPKRFull } from '@/lib/format';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface PriceTextProps {
  amount: number;
  className?: string;
  showTooltip?: boolean;
}

export const PriceText: React.FC<PriceTextProps> = ({
  amount,
  className,
  showTooltip = true,
}) => {
  const shortText = formatPKR(amount);
  const fullText = formatPKRFull(amount);

  if (!showTooltip) {
    return <span className={cn('font-semibold text-emerald-700', className)}>{shortText}</span>;
  }

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'font-semibold text-emerald-700 cursor-help border-b border-dotted border-emerald-300 hover:border-emerald-600 transition-colors',
              className
            )}
          >
            {shortText}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{fullText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

