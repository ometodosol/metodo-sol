import React from 'react';
import { cn } from '../../lib/utils';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
  className?: string;
}

export function MetricCard({ title, value, icon: Icon, trend, onClick, className }: MetricCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col justify-between h-full",
        onClick && "cursor-pointer hover:border-brand-light hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <div className="p-2 bg-brand-gray rounded-lg">
          <Icon className="w-5 h-5 text-brand-dark" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold text-brand-dark">{value}</h3>
        {trend && (
          <p className="text-xs mt-1 font-medium flex items-center gap-1">
            <span className={trend.isPositive ? "text-status-success" : "text-status-error"}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-gray-400 font-normal">{trend.label}</span>
          </p>
        )}
      </div>
    </div>
  );
}
