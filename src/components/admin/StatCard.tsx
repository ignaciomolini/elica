import type { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}

const colorClasses = {
  blue: 'bg-primary-100 text-primary-600',
  green: 'bg-accent-100 text-accent-600',
  yellow: 'bg-yellow-100 text-yellow-600',
  red: 'bg-red-100 text-red-600',
};

export function StatCard({ title, value, icon, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
