import 'react';
import { 
  Camera, 
  Video, 
  Bird,
  Users,
  Plus,
  Share2
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

const PLATFORM_ICONS: Record<string, any> = {
  instagram: Camera,
  youtube: Video,
  twitter: Bird,
  x: Bird,
  facebook: Users,
  tiktok: Share2,
};

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'text-pink-600 bg-pink-50',
  youtube: 'text-red-600 bg-red-50',
  twitter: 'text-blue-400 bg-blue-50',
  x: 'text-blue-400 bg-blue-50',
  facebook: 'text-blue-700 bg-blue-100',
  tiktok: 'text-black bg-gray-100',
};

export default function SocialAccountsGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-overview'],
    queryFn: dashboardService.getOverview,
  });

  const platforms = data?.platformBreakdown || [];

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Platform Breakdown</h3>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
          <Plus className="w-4 h-4 mr-1" />
          Add Platform
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-gray-50 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {platforms.map((p, idx) => {
            const Icon = PLATFORM_ICONS[p.platform.toLowerCase()] || Share2;
            const colorClass = PLATFORM_COLORS[p.platform.toLowerCase()] || 'text-gray-600 bg-gray-50';
            
            return (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${colorClass} mr-4`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 capitalize">{p.platform}</p>
                    <p className="text-xs text-gray-500">{p.connected ? p.handle : 'Not connected'}</p>
                  </div>
                </div>
                <div className="text-right">
                  {p.connected ? (
                    <>
                      <p className="text-sm font-bold text-gray-900">{p.followers >= 1000 ? `${(p.followers / 1000).toFixed(1)}k` : p.followers}</p>
                      <p className="text-xs text-gray-400">followers</p>
                    </>
                  ) : (
                    <button className="text-xs font-medium text-blue-600 px-2 py-1 rounded border border-blue-200 hover:bg-blue-50">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {platforms.length === 0 && !isLoading && (
            <p className="text-sm text-gray-500 text-center py-4">No accounts connected yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
