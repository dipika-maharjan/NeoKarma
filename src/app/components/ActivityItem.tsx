import { ReactNode } from 'react';

interface ActivityItemProps {
  icon: ReactNode;
  title: string;
  date: string;
  status: 'complete' | 'in_progress' | 'pending';
  statusText: string;
}

export function ActivityItem({ icon, title, date, status, statusText }: ActivityItemProps) {
  const statusColors = {
    complete: 'bg-primary/10 text-primary',
    in_progress: 'bg-blue-50 text-blue-600',
    pending: 'bg-yellow-50 text-yellow-600',
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors">
      <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-primary">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
      <span className={`text-xs px-3 py-1 rounded-full ${statusColors[status]}`}>
        {statusText}
      </span>
    </div>
  );
}
