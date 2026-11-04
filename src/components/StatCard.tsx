import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: {
    value: string | number;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon,
  className,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "rounded-[10px] border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center justify-between pb-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500">{title}</span>
        {icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="font-heading text-2xl sm:text-[28px] font-semibold tracking-tight text-slate-900 leading-none">
          {value}
        </div>

        {(trend || subtitle) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center font-medium",
                  trend.isNeutral
                    ? "text-slate-500"
                    : trend.isPositive
                    ? "text-emerald-600"
                    : "text-red-600"
                )}
              >
                {trend.isNeutral ? (
                  <Minus className="mr-0.5 h-3.5 w-3.5" />
                ) : trend.isPositive ? (
                  <ArrowUpRight className="mr-0.5 h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="mr-0.5 h-3.5 w-3.5" />
                )}
                {trend.value}
              </span>
            )}
            <span className="text-slate-400">
              {trend?.label || subtitle}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

