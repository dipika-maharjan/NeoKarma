import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  unit: string;
  iconBg?: string;
}

export function StatCard({ icon, title, value, unit, iconBg = 'bg-accent' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
