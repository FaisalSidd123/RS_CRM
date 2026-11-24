import React from 'react';
import { Phone, MessageSquare, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/format';
import { cn } from '@/lib/utils';

export interface TimelineItemProps {
  type: 'Call' | 'WhatsApp' | 'Meeting' | 'Note' | 'StatusChange' | 'Visit' | string;
  description: string;
  outcome?: string;
  createdAt: string;
  authorName: string;
  isLast?: boolean;
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  type,
  description,
  outcome,
  createdAt,
  authorName,
  isLast = false,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'Call':
        return <Phone className="h-3.5 w-3.5 text-blue-600" />;
      case 'WhatsApp':
        return <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />;
      case 'Meeting':
      case 'Visit':
        return <Calendar className="h-3.5 w-3.5 text-purple-600" />;
      case 'StatusChange':
        return <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-slate-600" />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'Call':
        return 'bg-blue-50 border-blue-200';
      case 'WhatsApp':
        return 'bg-emerald-50 border-emerald-200';
      case 'Meeting':
      case 'Visit':
        return 'bg-purple-50 border-purple-200';
      case 'StatusChange':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="relative flex gap-3 pb-5 group">
      {!isLast && (
        <span
          className="absolute left-3.5 top-7 -bottom-1 w-[1.5px] bg-slate-200"
          aria-hidden="true"
        />
      )}
      <div
        className={cn(
          'relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border shadow-2xs',
          getIconBg()
        )}
      >
        {getIcon()}
      </div>

      <div className="flex-1 space-y-1 pt-0.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <span>{type}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 font-normal">{authorName}</span>
          </div>
          <span className="text-[11px] text-slate-400">
            {formatDate(createdAt)} at {formatTime(createdAt)}
          </span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">{description}</p>
        {outcome && (
          <div className="mt-1 rounded-[6px] bg-slate-50 border border-slate-100 p-2 text-[11px] text-slate-600">
            <span className="font-semibold text-slate-700">Outcome:</span> {outcome}
          </div>
        )}
      </div>
    </div>
  );
};

