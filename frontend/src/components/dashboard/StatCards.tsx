import React from 'react';
import { Users, BarChart3, Megaphone, Activity, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, isPositive, icon: Icon, isLoading }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <div className="flex justify-between items-start">
      <div className="w-full">
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2" />
        ) : (
          <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
        )}
        {change && !isLoading && (
          <p className={`text-xs mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '↑' : '↓'} {change} <span className="text-gray-400 font-normal ml-1">vs last month</span>
          </p>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg shrink-0">
        {isLoading ? (
          <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
        ) : (
          <Icon className="w-6 h-6 text-blue-600" />
        )}
      </div>
    </div>
  </div>
);

export default function StatCards() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getOverview,
    refetchInterval: 60000, // Refresh every minute
  });

  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-red-600 text-sm">
        Failed to load statistics. Please try again later.
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Followers', 
      value: data?.stats.total_followers?.toLocaleString() || '0', 
      change: '12%', // Logic for change can be added if backend provides it
      isPositive: true, 
      icon: Users 
    },
    { 
      title: 'Campaign Reach', 
      value: data?.stats.total_reach?.toLocaleString() || '0', 
      change: '8.4%', 
      isPositive: true, 
      icon: BarChart3 
    },
    { 
      title: 'Active Campaigns', 
      value: data?.stats.active_campaigns || '0', 
      icon: Megaphone 
    },
    { 
      title: 'Engagement Rate', 
      value: `${(data?.stats.avg_engagement_rate || 0).toFixed(1)}%`, 
      change: '0.5%', 
      isPositive: false, 
      icon: Activity 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {isLoading 
        ? Array(4).fill(0).map((_, idx) => <StatCard key={idx} title="Loading..." value="" icon={Activity} isLoading={true} />)
        : stats.map((stat, idx) => <StatCard key={idx} {...stat} />)
      }
    </div>
  );
}
