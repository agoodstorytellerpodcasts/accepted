import { useQuery } from '@tanstack/react-query';
import { Users, BarChart3, Activity, Globe, Shield } from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/stats').then(r => r.data),
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then(r => r.data),
  });

  const { data: activity } = useQuery({
    queryKey: ['admin-activity'],
    queryFn: () => api.get('/admin/activity').then(r => r.data),
  });

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900">Super Admin Panel</h1>
          </div>
          <p className="text-gray-500 mt-1">Monitor all users, campaigns, and platform activity.</p>
        </div>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <Users className="w-6 h-6 text-purple-600 mb-3" />
          <p className="text-sm text-gray-500 uppercase font-bold">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.totalUsers || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <BarChart3 className="w-6 h-6 text-blue-600 mb-3" />
          <p className="text-sm text-gray-500 uppercase font-bold">Active Campaigns</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stats?.activeCampaigns || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <Globe className="w-6 h-6 text-green-600 mb-3" />
          <p className="text-sm text-gray-500 uppercase font-bold">Followers Tracked</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{(stats?.totalFollowersTracked || 0).toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <Activity className="w-6 h-6 text-amber-600 mb-3" />
          <p className="text-sm text-gray-500 uppercase font-bold">Monthly Revenue</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">${stats?.revenue?.monthly?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* Platform Breakdown */}
      {stats?.platformBreakdown && (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Usage</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(stats.platformBreakdown).map(([platform, data]: [string, any]) => (
              <div key={platform} className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-bold text-gray-900 capitalize">{platform}</p>
                <p className="text-2xl font-bold text-blue-600">{data.users}</p>
                <p className="text-xs text-gray-500">users • {(data.followers || data.subscribers || 0).toLocaleString()} followers</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            All Users
          </h2>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Campaigns</th>
              <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users?.users?.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">{user.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    user.plan === 'Enterprise' ? 'bg-purple-100 text-purple-800' :
                    user.plan === 'Professional' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>{user.plan}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{user.campaigns}</td>
                <td className="px-6 py-4">
                  <span className={`flex items-center gap-1 text-xs font-bold ${
                    user.status === 'active' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Activity Log */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {activity?.activities?.map((a: any, i: number) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="text-sm font-bold text-gray-900">{a.user}</p>
                <p className="text-sm text-gray-500">{a.action} — <span className="text-gray-400">{a.detail}</span></p>
              </div>
              <span className="text-xs text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
