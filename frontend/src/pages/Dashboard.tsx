import 'react';
import StatCards from '../components/dashboard/StatCards';
import TrendCharts from '../components/dashboard/TrendCharts';
import SocialAccountsGrid from '../components/dashboard/SocialAccountsGrid';
import { 
  PlusCircle, 
  Link as LinkIcon, 
  MessageSquare,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../services/dashboardService';

export default function Dashboard() {
  const { data: recentCampaigns, isLoading, isError } = useQuery({
    queryKey: ['recent-campaigns'],
    queryFn: dashboardService.getRecentCampaigns,
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, here's what's happening with your marketing across all platforms.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/chat" 
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Link>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors">
            <PlusCircle className="w-4 h-4 mr-2" />
            Create Campaign
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <StatCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart - Large Area */}
        <div className="lg:col-span-2">
          <TrendCharts />
        </div>

        {/* Platform Breakdown - Small Area */}
        <div className="lg:col-span-1">
          <SocialAccountsGrid />
        </div>
      </div>

      {/* Recent Campaigns Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Recent Campaigns</h3>
          <Link to="/campaigns" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center">
            View All
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reach</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Engagement</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      <div className="h-8 bg-gray-50 animate-pulse rounded" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-red-500 text-sm">
                    Failed to load recent campaigns.
                  </td>
                </tr>
              ) : recentCampaigns?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No campaigns found. Create your first one to get started!
                  </td>
                </tr>
              ) : (
                recentCampaigns?.map((campaign) => (
                  <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{campaign.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 capitalize">{campaign.platform || campaign.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{campaign.reach || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{campaign.engagement || '-'}</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-600 p-6 rounded-xl text-white shadow-lg shadow-blue-200">
          <PlusCircle className="w-8 h-8 mb-4 opacity-80" />
          <h4 className="text-lg font-bold mb-2">New Campaign</h4>
          <p className="text-blue-100 text-sm mb-4">Launch a new targeted follower boost or engagement drop.</p>
          <button className="text-sm font-bold bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors">
            Get Started
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <LinkIcon className="w-8 h-8 mb-4 text-gray-400" />
          <h4 className="text-lg font-bold mb-2 text-gray-900">Connect Account</h4>
          <p className="text-gray-500 text-sm mb-4">Link more social platforms to centralize your marketing efforts.</p>
          <button className="text-sm font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Link Account
          </button>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <MessageSquare className="w-8 h-8 mb-4 text-gray-400" />
          <h4 className="text-lg font-bold mb-2 text-gray-900">AI Strategist</h4>
          <p className="text-gray-500 text-sm mb-4">Ask the AI for advice on your next campaign or platform growth.</p>
          <button className="text-sm font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Open Chat
          </button>
        </div>
      </div>
    </div>
  );
}
