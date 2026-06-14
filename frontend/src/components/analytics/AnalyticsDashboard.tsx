import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../../services/analyticsService';
import PlatformFilter from './PlatformFilter';
import MetricsGraph from './MetricsGraph';
import { 
  Users, 
  Activity, 
  BarChart3, 
  Download,
  Calendar,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const COLORS = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a', '#0891b2'];

function getDateFromRange(range: string): string | undefined {
  if (range === '7d') {
    const d = new Date(); d.setDate(d.getDate() - 7);
    return d.toISOString();
  }
  if (range === '30d') {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString();
  }
  if (range === '90d') {
    const d = new Date(); d.setDate(d.getDate() - 90);
    return d.toISOString();
  }
  return undefined;
}

export default function AnalyticsDashboard() {
  const [platform, setPlatform] = useState('all');
  const [range, setRange] = useState('30d');

  const overviewQuery = useQuery({
    queryKey: ['analytics-overview', platform, range],
    queryFn: () => analyticsService.getOverview({ 
      start_date: getDateFromRange(range)
    }),
  });

  const trendsQuery = useQuery({
    queryKey: ['analytics-trends', platform, range],
    queryFn: () => analyticsService.getTrends({ 
      start_date: getDateFromRange(range)
    }),
  });

  const isLoading = overviewQuery.isLoading || trendsQuery.isLoading;
  const isError = overviewQuery.isError || trendsQuery.isError;

  const exportToCSV = async () => {
    try {
      const blob = await analyticsService.exportCSV('trends');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_trends_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-2xl border border-red-100 p-8">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h3 className="text-lg font-bold text-red-900">Failed to load analytics</h3>
        <p className="text-red-600 mt-1">Please try again later or check your connection.</p>
        <button 
          onClick={() => { overviewQuery.refetch(); trendsQuery.refetch(); }}
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = overviewQuery.data?.stats;
  const followerGrowth = overviewQuery.data?.followerGrowth || [];
  const platformBreakdown = overviewQuery.data?.platformBreakdown || [];

  return (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <PlatformFilter selectedPlatform={platform} onPlatformChange={setPlatform} />
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
            <select 
              value={range} 
              onChange={(e) => setRange(e.target.value)}
              className="bg-transparent text-sm font-medium focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <button 
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Followers" 
          value={stats?.total_followers?.toLocaleString() || '0'} 
          icon={Users}
          isLoading={isLoading}
        />
        <StatCard 
          title="Engagement Rate" 
          value={`${(stats?.avg_engagement_rate || 0).toFixed(2)}%`} 
          icon={Activity}
          isLoading={isLoading}
        />
        <StatCard 
          title="Total Reach" 
          value={stats?.total_reach?.toLocaleString() || '0'} 
          icon={BarChart3}
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Campaigns" 
          value={stats?.active_campaigns || '0'} 
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MetricsGraph 
          data={followerGrowth} 
          title="Follower Growth Over Time" 
          dataKey="followers"
          type="area"
        />
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Engagement Trends</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendsQuery.data || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="engagement_rate" radius={[4, 4, 0, 0]}>
                  {(trendsQuery.data || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform Comparison */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Platform Distribution</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {platformBreakdown.map((p, i) => (
              <div key={p.platform} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-gray-700 capitalize">{p.platform}</span>
                  <span className="text-gray-500">{p.followers.toLocaleString()} followers</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ 
                      width: `${(p.followers / (stats?.total_followers || 1)) * 100}%`,
                      backgroundColor: COLORS[i % COLORS.length]
                    }}
                  />
                </div>
              </div>
            ))}
            {!isLoading && platformBreakdown.length === 0 && (
              <p className="text-center text-gray-500 py-8">No platform data available for this range.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, change, icon: Icon, isLoading, isPositive = true }: any) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          {isLoading ? (
            <div className="h-8 w-24 bg-gray-100 animate-pulse rounded mt-2" />
          ) : (
            <h3 className="text-2xl font-bold mt-2 text-gray-900">{value}</h3>
          )}
          {change !== undefined && !isLoading && (
            <p className={`text-xs mt-2 font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? '↑' : '↓'} {change}% <span className="text-gray-400 font-normal ml-1">vs last month</span>
            </p>
          )}
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          {isLoading ? (
            <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
          ) : (
            <Icon className="w-6 h-6 text-blue-600" />
          )}
        </div>
      </div>
    </div>
  );
}
