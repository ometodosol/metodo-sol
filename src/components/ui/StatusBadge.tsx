import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, AlertTriangle, XCircle, Info, HelpCircle } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'unknown';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    bgClass: 'bg-status-success/10',
    textClass: 'text-status-success',
    borderClass: 'border-status-success/20',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-status-warning/10',
    textClass: 'text-yellow-700', // better contrast than default yellow
    borderClass: 'border-status-warning/20',
  },
  error: {
    icon: XCircle,
    bgClass: 'bg-status-error/10',
    textClass: 'text-status-error',
    borderClass: 'border-status-error/20',
  },
  info: {
    icon: Info,
    bgClass: 'bg-status-info/10',
    textClass: 'text-status-info',
    borderClass: 'border-status-info/20',
  },
  unknown: {
    icon: HelpCircle,
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-500',
    borderClass: 'border-gray-200',
  },
};

export function StatusBadge({ status, label, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.unknown;
  const Icon = config.icon;

  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
      config.bgClass,
      config.textClass,
      config.borderClass,
      className
    )}>
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}
