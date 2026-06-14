import 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignService } from '../services/campaignService';
import type { CampaignStatus } from '../services/campaignService';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  CheckCircle, 
  Trash2, 
  Plus, 
  BarChart3, 
  AlertCircle
} from 'lucide-react';

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 border-gray-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: campaign, isLoading, isError } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaignById(id!),
    enabled: !!id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: CampaignStatus) => campaignService.updateCampaign(id!, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignService.deleteCampaign(id!),
    onSuccess: () => {
      navigate('/campaigns');
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-red-800">Campaign Not Found</h3>
        <p className="text-red-600 mt-2">The campaign you're looking for doesn't exist or you don't have access.</p>
        <button onClick={() => navigate('/campaigns')} className="mt-4 text-blue-600 font-medium">Back to Campaigns</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </button>
        <div className="flex gap-3">
          {campaign.status === 'paused' || campaign.status === 'draft' ? (
            <button 
              onClick={() => updateStatusMutation.mutate('active')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-2" /> Activate
            </button>
          ) : campaign.status === 'active' ? (
            <button 
              onClick={() => updateStatusMutation.mutate('paused')}
              className="flex items-center px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
            >
              <Pause className="w-4 h-4 mr-2" /> Pause
            </button>
          ) : null}
          
          {campaign.status !== 'completed' && (
            <button 
              onClick={() => updateStatusMutation.mutate('completed')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-2" /> Complete
            </button>
          )}

          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this campaign?')) {
                deleteMutation.mutate();
              }
            }}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${STATUS_COLORS[campaign.status]}`}>
                {campaign.status}
              </span>
            </div>
            <p className="text-gray-500 mt-2 capitalize">{campaign.type.replace('_', ' ')} • Created on {new Date(campaign.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 uppercase font-semibold tracking-wider">Budget</p>
            <p className="text-3xl font-bold text-gray-900">${campaign.budget.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-blue-50 p-6 rounded-xl">
            <p className="text-sm font-medium text-blue-600 uppercase">Total Reach</p>
            <p className="text-3xl font-bold text-blue-900 mt-2">450.2k</p>
          </div>
          <div className="bg-indigo-50 p-6 rounded-xl">
            <p className="text-sm font-medium text-indigo-600 uppercase">Engagement</p>
            <p className="text-3xl font-bold text-indigo-900 mt-2">5.8%</p>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl">
            <p className="text-sm font-medium text-purple-600 uppercase">Retained</p>
            <p className="text-3xl font-bold text-purple-900 mt-2">92%</p>
          </div>
        </div>
      </div>

      {/* A/B Test Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            A/B Test Variants
          </h2>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50">
            <Plus className="w-4 h-4 mr-2" /> Add Variant
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaign.variants?.map((variant) => (
            <div key={variant.id} className={`p-6 rounded-xl border-2 ${variant.is_baseline ? 'border-blue-500 bg-blue-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{variant.name}</h3>
                  {variant.is_baseline && <span className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Baseline</span>}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{(variant.performance_score * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400 uppercase font-bold">Perf. Score</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${variant.performance_score * 100}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
          {!campaign.variants?.length && (
            <div className="col-span-2 p-12 border-2 border-dashed border-gray-200 rounded-xl text-center">
              <p className="text-gray-500">No A/B test variants created yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
