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
        "bg-card rounded-xl p-6 shadow-sm border border-border flex flex-col justify-between h-full",
        onClick && "cursor-pointer hover:bg-accent/50 transition-all",
        className
      )}
    >
      <div className="flex justify-between items-center pb-2">
        <p className="text-sm font-medium tracking-tight text-card-foreground">{title}</p>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-card-foreground">{value}</h3>
        {trend && (
          <p className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
            <span className={trend.isPositive ? "text-primary" : "text-destructive"}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span>{trend.label}</span>
          </p>
        )}
      </div>
    </div>
  );
}
