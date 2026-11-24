import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { formatPhone, maskPhone } from '@/lib/format';
import { can } from '@/lib/permissions';
import { Eye, Lock, Phone } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export interface MaskedPhoneProps {
  phone: string;
  isOwnerPhone?: boolean;
  propertyCode?: string;
  className?: string;
}

export const MaskedPhone: React.FC<MaskedPhoneProps> = ({
  phone,
  isOwnerPhone = false,
  propertyCode,
  className,
}) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const logActivity = useAppStore((s) => s.logActivity);

  // If viewing property owner phone and user is Agent, it is masked by default
  const hasDirectPermission = can(currentUser?.role, 'view_property_owner_phone');
  const [requestedRevealed, setRequestedRevealed] = useState(false);

  const shouldMask = isOwnerPhone && !hasDirectPermission && !requestedRevealed;

  const handleRequestAccess = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRequestedRevealed(true);
    
    // Create activity log
    logActivity({
      userId: currentUser?.id || 'usr-anon',
      userName: currentUser?.name || 'Agent',
      userRole: currentUser?.role || 'Agent',
      action: 'Requested & Viewed Owner Contact',
      record: `Accessed owner phone for ${propertyCode || 'Property Listing'}`,
      ipAddress: '182.180.20.10',
    });

    toast.warning(
      `Owner phone revealed for ${propertyCode || 'Listing'}. Access logged to Agency Audit Trail.`,
      'Contact Revealed'
    );
  };

  if (shouldMask) {
    return (
      <div className={cn('inline-flex items-center gap-1.5', className)}>
        <span className="font-mono text-slate-500">{maskPhone(phone)}</span>
        <button
          onClick={handleRequestAccess}
          type="button"
          title="Request owner contact (Audited by Agency Owner)"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-medium bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-[4px] transition-colors"
        >
          <Lock className="h-2.5 w-2.5" />
          Request
        </button>
      </div>
    );
  }

  const formatted = formatPhone(phone);

  return (
    <a
      href={`tel:${formatted}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'inline-flex items-center gap-1.5 text-slate-800 font-mono hover:text-emerald-700 hover:underline transition-colors',
        className
      )}
      title="Click to call"
    >
      <Phone className="h-3 w-3 text-slate-400" />
      {formatted}
    </a>
  );
};

