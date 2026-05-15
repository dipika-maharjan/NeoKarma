import type { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  color?: string;
}

export function ActionCard({ icon, title, description, color = 'text-primary' }: ActionCardProps) {
  return (
    <button className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-primary transition-all text-left w-full group">
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0 ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
      </div>
    </button>
  );
}
